"use client";

import { useContract } from "@starknet-react/core";
import type { UseAccountResult } from "@starknet-react/core";
import type { Abi, Contract, ProviderInterface } from "starknet";
import { CallData, LibraryError } from "starknet";
import configExternalContracts from "../contracts/configExternalContracts";
import { parseEvents } from "../utils/parseEvents";

class ContractsError extends Error {
	static USER_MISSING_ROLE = 1;
	static USER_NOT_CONNECTED = 2;
	static UNABLE_TO_BUY = 3;
	code: number;
	constructor(message: string, code: number) {
		super(message);
		this.name = "ContractsError";
		this.code = code;
		Error.captureStackTrace(this, ContractsError);
	}
}

type CoinGeckoResponse = {
	starknet: {
		usd: number;
	};
};

const useCofiCollectionContract = () => {
	const env = (process.env.NEXT_PUBLIC_STARKNET_ENV ??
		"sepolia") as keyof typeof configExternalContracts;
	const { contract } = useContract({
		abi: configExternalContracts[env].CofiCollection.abi as Abi,
		address: configExternalContracts[env].CofiCollection.address,
	});
	return contract;
};

const useMarketplaceContract = () => {
	const env = (process.env.NEXT_PUBLIC_STARKNET_ENV ??
		"sepolia") as keyof typeof configExternalContracts;
	const { contract } = useContract({
		abi: configExternalContracts[env].Marketplace.abi as Abi,
		address: configExternalContracts[env].Marketplace.address,
	});

	return contract;
};
const useStarkContract = () => {
	const env = (process.env.NEXT_PUBLIC_STARKNET_ENV ??
		"sepolia") as keyof typeof configExternalContracts;
	const { contract } = useContract({
		abi: configExternalContracts[env].stark.abi as Abi,
		address: configExternalContracts[env].stark.address,
	});

	return contract;
};

class ContractsInterface {
	cofiCollectionContract: Contract | null;
	marketplaceContract: Contract | null;
	starkContract: Contract | null;
	account: UseAccountResult;
	provider: ProviderInterface;

	constructor(
		account: UseAccountResult,
		cofiCollection: Contract | undefined,
		marketplace: Contract | undefined,
		stark: Contract | undefined,
		provider: ProviderInterface,
	) {
		if (!account) {
			throw new ContractsError(
				"User is not connected",
				ContractsError.USER_NOT_CONNECTED,
			);
		}
		this.cofiCollectionContract = cofiCollection ?? null;
		this.marketplaceContract = marketplace ?? null;
		this.starkContract = stark ?? null;
		this.account = account;
		this.provider = provider;
	}

	get_user_address() {
		if (this.account.address === undefined) {
			throw new ContractsError(
				"User is not connected",
				ContractsError.USER_NOT_CONNECTED,
			);
		}
		return this.account.address;
	}

	connect_account() {
		if (!this.account.account) {
			throw new ContractsError(
				"User is not connected",
				ContractsError.USER_NOT_CONNECTED,
			);
		}
		this.cofiCollectionContract?.connect(this.account.account);
		this.marketplaceContract?.connect(this.account.account);
		this.starkContract?.connect(this.account.account);
	}

	async getStarkPrice() {
		const MAX_RETRIES = 3;
		const RETRY_DELAY = 1000;
		const FALLBACK_PRICE = 2.5;

		for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
			try {
				const response = await fetch(
					"https://api.coingecko.com/api/v3/simple/price?ids=starknet&vs_currencies=usd",
					{
						headers: {
							Accept: "application/json",
							"Cache-Control": "no-cache",
						},
					},
				);

				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}

				const data = (await response.json()) as CoinGeckoResponse;
				if (!data?.starknet?.usd) {
					throw new Error("Invalid response format");
				}

				return data.starknet.usd;
			} catch (error) {
				console.warn(`Attempt ${attempt}/${MAX_RETRIES} failed:`, error);

				if (attempt === MAX_RETRIES) {
					console.warn(
						"All retries failed, using fallback price:",
						FALLBACK_PRICE,
					);
					return FALLBACK_PRICE;
				}

				await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
			}
		}

		return FALLBACK_PRICE;
	}

	async get_balance_of(token_id: string) {
		const address = this.get_user_address();
		if (!this.cofiCollectionContract) {
			throw new Error("Cofi collection contract is not loaded");
		}
		const balance = await this.cofiCollectionContract.call(
			"balanceOf",
			CallData.compile([address, token_id, "0x0"]),
		);

		return balance;
	}

	async get_claim_balance() {
		const address = this.get_user_address();
		if (!this.marketplaceContract) {
			throw new Error("Marketplace contract is not loaded");
		}
		try {
			const balance_result = await this.marketplaceContract.call(
				"claim_balance",
				CallData.compile([address]),
			);

			let balanceStr = "0";
			if (balance_result !== undefined && balance_result !== null) {
				balanceStr =
					typeof balance_result === "bigint"
						? balance_result.toString()
						: (
								balance_result as { low: bigint; high: bigint }
							)?.low?.toString() || "0";
			}

			const stark_price_usd = await this.getStarkPrice();
			const total =
				(Number(balanceStr) / 1000000000000000000) * stark_price_usd;
			return total;
		} catch (error) {
			console.error("Error getting claim balance:", error);
			return 0;
		}
	}

	async register_product(price_usd: number, initial_stock: number) {
		// connect user account to contracts
		this.connect_account();

		// get the current stark price in usd to convert the price to starks
		const stark_price_usd = await this.getStarkPrice();
		const price = Math.floor(price_usd / stark_price_usd) * 1000000000000000000;

		// Call the contract to register the product
		if (!this.marketplaceContract) {
			throw new Error("Marketplace contract is not loaded");
		}
		try {
			// each u256 requires two words, so we append 0x0 at the end of each u256
			const tx = await this.marketplaceContract.invoke(
				"create_product",
				CallData.compile([initial_stock, "0x0", price, "0x0", "0x1", "0x0"]),
				{ maxFee: "10000000000000000000000" },
			);
			const txReceipt = await this.provider.waitForTransaction(
				tx.transaction_hash,
				{
					retryInterval: 100,
				},
			);
			let token_id = 0;
			if (txReceipt?.isSuccess()) {
				const events = parseEvents(txReceipt.events);
				const createProductEvents = events.createProductEvents;
				if (createProductEvents.length > 0) {
					token_id = createProductEvents[0]?.token_id ?? 0;
				}
			}
			console.log("token_id is", token_id);
			return token_id;
		} catch (error) {
			if (
				error instanceof LibraryError &&
				error.message.includes("Caller is missing rol")
			) {
				throw new ContractsError(
					"User is not registered as a seller",
					ContractsError.USER_MISSING_ROLE,
				);
			}
			throw error;
		}
	}

	_get_formatted_u256_list(input: number[]) {
		const calldata = [`0x${input.length.toString(16)}`];
		for (const value of input) {
			calldata.push(`0x${value.toString(16)}`);
			calldata.push("0x0"); // add padding since its a u256
		}
		return calldata;
	}

	async get_user_allowance_on_marketplace(token_amount: number) {
		if (!this.starkContract) {
			throw new Error("Stark contract is not loaded");
		}
		if (!this.marketplaceContract) {
			throw new Error("Marketplace contract is not loaded");
		}
		const tx = await this.starkContract.invoke(
			"approve",
			CallData.compile([
				this.marketplaceContract.address,
				`0x${token_amount.toString(16)}`,
				"0x0",
			]),
		);
		// wait for allowance to complete to avoid errors
		await this.provider.waitForTransaction(tx.transaction_hash, {
			retryInterval: 100,
		});
		return tx.transaction_hash;
	}

	async buy_product(
		token_ids: number[],
		token_amounts: number[],
		price_usd: number,
	) {
		// connect user account to contracts
		this.connect_account();

		// Call the contract to register the product
		if (!this.marketplaceContract) {
			throw new Error("Marketplace contract is not loaded");
		}

		// Get allowance to spend this amount of tokens
		const stark_price_usd = await this.getStarkPrice();
		console.log("stark price is", stark_price_usd);
		// adding some more starks to pay for the market fee and gas fee
		const price =
			Math.floor(price_usd / stark_price_usd) * 1000000000000000000 +
			10000000000000000000;
		const approve_tx_hash = await this.get_user_allowance_on_marketplace(price);
		console.log("approve_tx_hash is", approve_tx_hash);
		try {
			// each u256 requires two words, so we append 0x0 at the end of each u256
			const calldata = [
				...this._get_formatted_u256_list(token_ids),
				...this._get_formatted_u256_list(token_amounts),
			];
			const tx = await this.marketplaceContract.invoke(
				"buy_products",
				CallData.compile(calldata),
				{ maxFee: "10000000000000000000000" },
			);
			console.log("tx hash is", tx.transaction_hash);
			const txReceipt = await this.provider.waitForTransaction(
				tx.transaction_hash,
				{
					retryInterval: 100,
				},
			);
			if (txReceipt?.isSuccess()) {
				const events = parseEvents(txReceipt.events);
				if (events.buyProductsEvents.length === 0) {
					throw new ContractsError(
						"Buy did not finish successfully",
						ContractsError.UNABLE_TO_BUY,
					);
				}
			}
			return tx.transaction_hash;
		} catch (error) {
			if (
				error instanceof LibraryError &&
				error.message.includes("Caller is missing rol")
			) {
				throw new ContractsError(
					"User is not registered as a buyer",
					ContractsError.USER_MISSING_ROLE,
				);
			}
			throw error;
		}
	}

	async claim() {
		// connect user account to contracts
		this.connect_account();

		// Call the contract to register the product
		if (!this.marketplaceContract) {
			throw new Error("Marketplace contract is not loaded");
		}

		try {
			const tx = await this.marketplaceContract.invoke(
				"claim",
				CallData.compile([]),
				{ maxFee: "10000000000000000000000" },
			);
			console.log("tx hash is", tx.transaction_hash);
			const txReceipt = await this.provider.waitForTransaction(
				tx.transaction_hash,
				{
					retryInterval: 100,
				},
			);
			if (txReceipt?.isSuccess()) {
				console.log("claim success", txReceipt.events);
			}
			return tx.transaction_hash;
		} catch (error) {
			if (
				error instanceof LibraryError &&
				error.message.includes("Caller is missing rol")
			) {
				throw new ContractsError(
					"User is not registered as a producer",
					ContractsError.USER_MISSING_ROLE,
				);
			}
			throw error;
		}
	}

	async get_product_stock(tokenId: number) {
		// connect user account to contracts
		this.connect_account();

		// Call the contract to get the stock
		if (!this.marketplaceContract) {
			throw new Error("Marketplace contract is not loaded");
		}

		try {
			const stock = await this.marketplaceContract.call(
				"listed_product_stock",
				[tokenId, "0x0"],
			);
			return Number(stock);
		} catch (error) {
			console.error("Error getting product stock:", error);
			return 0;
		}
	}
}

export {
	ContractsInterface,
	ContractsError,
	useCofiCollectionContract,
	useMarketplaceContract,
	useStarkContract,
};
