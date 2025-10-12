import { type UserAuthData, executeTransaction } from "~/server/services/cavos";
import { CairoCustomEnum } from 'starknet';
import {
	CofiBlocksContracts,
	PaymentToken,
	PaymentTokenTag,
	getCallToContract,
	getContractAddress,
} from "../../utils/contracts";
import { format_number } from "../../utils/formatting";

export async function buyProduct(
	tokenId: bigint,
	tokenAmount: bigint,
	paymentToken: PaymentToken,
	userAuthData: UserAuthData,
) {
	const formattedTokenId = format_number(tokenId);
	const formattedTokenAmount = format_number(tokenAmount);
	const calldata = [
		formattedTokenId.high,
		formattedTokenId.low,
		formattedTokenAmount.high,
		formattedTokenAmount.low,
		PaymentTokenTag[paymentToken],
	];

	const transaction = {
		contract_address: getContractAddress(CofiBlocksContracts.MARKETPLACE),
		entrypoint: "buy_product",
		calldata: calldata,
	};
	const tx = await executeTransaction(userAuthData, transaction);
	return tx;
}

export async function buyProducts(
	tokenId: bigint[],
	tokenAmount: bigint[],
	paymentToken: PaymentToken,
	userAuthData: UserAuthData,
) {
	const formattedTokenIds = [];
	const formattedTokenAmounts = [];
	for (let i = 0; i < tokenId.length; i++) {
		const formattedTokenId = format_number(tokenId[i] ?? 0n);
		const formattedTokenAmount = format_number(tokenAmount[i] ?? 0n);
		formattedTokenIds.push(formattedTokenId.high);
		formattedTokenIds.push(formattedTokenId.low);
		formattedTokenAmounts.push(formattedTokenAmount.high);
		formattedTokenAmounts.push(formattedTokenAmount.low);
	}
	const calldata = [
		`0x${tokenId.length.toString(16)}`,
		...formattedTokenIds,
		`0x${tokenAmount.length.toString(16)}`,
		...formattedTokenAmounts,
		PaymentTokenTag[paymentToken],
	];

	const transaction = {
		contract_address: getContractAddress(CofiBlocksContracts.MARKETPLACE),
		entrypoint: "buy_products",
		calldata: calldata,
	};
	const tx = await executeTransaction(userAuthData, transaction);
	return tx;
}

export async function createProduct(
	initialStock: bigint,
	price: bigint,
	userAuthData: UserAuthData,
) {
	const formattedInitialStock = format_number(initialStock);
	const formattedPrice = format_number(price * 10n**6n);
	const calldata = [
		formattedInitialStock.high,
		formattedInitialStock.low,
		formattedPrice.high,
		formattedPrice.low,
		"0x1",
		"0x0",
	];

	const transaction = {
		contract_address: getContractAddress(CofiBlocksContracts.MARKETPLACE),
		entrypoint: "create_product",
		calldata: calldata,
	};
	const tx = await executeTransaction(userAuthData, transaction);
	return tx;
}

export async function createProducts(
	initialStock: bigint[],
	price: bigint[],
	userAuthData: UserAuthData,
) {
	const formattedInitialStocks = [];
	const formattedPrices = [];
	for (let i = 0; i < initialStock.length; i++) {
		const formattedInitialStock = format_number(initialStock[i] ?? 0n);
		const formattedPrice = format_number((price[i] ?? 0n) * 10n**6n);
		formattedInitialStocks.push(formattedInitialStock.high);
		formattedInitialStocks.push(formattedInitialStock.low);
		formattedPrices.push(formattedPrice.high);
		formattedPrices.push(formattedPrice.low);
	}
	const calldata = [
		`0x${initialStock.length.toString(16)}`,
		...formattedInitialStocks,
		`0x${price.length.toString(16)}`,
		...formattedPrices,
	];

	const transaction = {
		contract_address: getContractAddress(CofiBlocksContracts.MARKETPLACE),
		entrypoint: "create_products",
		calldata: calldata,
	};
	const tx = await executeTransaction(userAuthData, transaction);
	return tx;
}

export async function getProductPrice(
	tokenId: bigint,
	tokenAmount: bigint,
	paymentToken: PaymentToken,
) {
	const calldata = [tokenId, tokenAmount, new CairoCustomEnum({ [paymentToken]: {} })];
	const tx = await getCallToContract(
		CofiBlocksContracts.MARKETPLACE,
		"get_product_price",
		calldata,
	);
	return tx;
}

export async function deleteProduct(
	tokenId: bigint,
	userAuthData: UserAuthData,
) {
	const formattedTokenId = format_number(tokenId);
	const calldata = [formattedTokenId.high, formattedTokenId.low];

	const transaction = {
		contract_address: getContractAddress(CofiBlocksContracts.MARKETPLACE),
		entrypoint: "delete_product",
		calldata: calldata,
	};
	const tx = await executeTransaction(userAuthData, transaction);
	return tx;
}

export async function deleteProducts(
	tokenId: bigint[],
	userAuthData: UserAuthData,
) {
	const formattedTokensIds = [];
	for (const token of tokenId) {
		const formattedTokenId = format_number(token ?? 0n);
		formattedTokensIds.push(formattedTokenId.low);
		formattedTokensIds.push(formattedTokenId.high);
	}
	const calldata = [`0x${tokenId.length.toString(16)}`, ...formattedTokensIds];

	const transaction = {
		contract_address: getContractAddress(CofiBlocksContracts.MARKETPLACE),
		entrypoint: "delete_products",
		calldata: calldata,
	};
	const tx = await executeTransaction(userAuthData, transaction);
	return tx;
}

export async function claimConsumer(userAuthData: UserAuthData) {
	const transaction = {
		contract_address: getContractAddress(CofiBlocksContracts.MARKETPLACE),
		entrypoint: "claim_consumer",
		calldata: [],
	};
	const tx = await executeTransaction(userAuthData, transaction);
	return tx;
}

export async function claimProducer(userAuthData: UserAuthData) {
	const transaction = {
		contract_address: getContractAddress(CofiBlocksContracts.MARKETPLACE),
		entrypoint: "claim_producer",
		calldata: [],
	};
	const tx = await executeTransaction(userAuthData, transaction);
	return tx;
}

export async function claimRoaster(userAuthData: UserAuthData) {
	const transaction = {
		contract_address: getContractAddress(CofiBlocksContracts.MARKETPLACE),
		entrypoint: "claim_roaster",
		calldata: [],
	};
	const tx = await executeTransaction(userAuthData, transaction);
	return tx;
}

export async function claim(userAuthData: UserAuthData, role: string) {
	if (role === "COFFEE_BUYER") {
		return await claimConsumer(userAuthData);
	} else if (role === "COFFEE_PRODUCER") {
		return await claimProducer(userAuthData);
	} else if (role === "COFFEE_ROASTER") {
		return await claimRoaster(userAuthData);
	}
	throw new Error("Invalid role");
}

export async function claimPayment(userAuthData: UserAuthData) {
	const transaction = {
		contract_address: getContractAddress(CofiBlocksContracts.MARKETPLACE),
		entrypoint: "claim_payment",
		calldata: [],
	};
	const tx = await executeTransaction(userAuthData, transaction);
	return tx;
}

export async function getProductStock(tokenId: bigint) {
	const formattedTokenId = format_number(tokenId);
	const calldata = [formattedTokenId.high, formattedTokenId.low];

	const tx = await getCallToContract(
		CofiBlocksContracts.MARKETPLACE,
		"listed_product_stock",
		calldata,
	);
	return tx;
}

export async function getProductPrices(
	tokenIds: bigint[], 
	tokenAmounts: bigint[], 
	paymentToken: PaymentToken,
	formatted = true
) {;
	const unitPrices: Record<string, number> = {};
	for (let i = 0; i < tokenIds.length; i++) {
		const tokenId = tokenIds[i];
		const tokenAmount = tokenAmounts[i];
		if (tokenId && tokenAmount) {
			const result = await getProductPrice(tokenId, tokenAmount, paymentToken) as unknown;
			const resultValue = Array.isArray(result) ? (result as unknown[])[0] : result;
			const price = BigInt(String(resultValue as string | number | bigint ?? '0'));
			const decimals = paymentToken === PaymentToken.STRK ? 18n : 6n;
			if (!formatted) {
				unitPrices[tokenId.toString()] = Number(price.toString());
				continue;
			}
			const human = price / (10n ** decimals); // integer division
			const fractional = (price % (10n ** decimals)) / (10n ** (decimals - 2n)); // 2 decimals
			const priceStr = `${human}.${fractional.toString().padStart(2, '0')}`;
			unitPrices[tokenId.toString()] = Number(priceStr);
		}
	}
	return unitPrices;
}

export async function getClaimPayment(walletAddress: string) {
	const calldata = [walletAddress];
	const tx = await getCallToContract(
		CofiBlocksContracts.MARKETPLACE,
		"get_claim_payment",
		calldata,
	);
	return tx;
}
