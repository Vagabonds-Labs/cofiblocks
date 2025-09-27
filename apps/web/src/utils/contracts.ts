import { useAccount, useProvider } from "@starknet-react/core";
import { Abi, Account, Contract, RpcProvider } from "starknet";
import type { Provider } from "starknet";
import configExternalContracts from "../contracts/deployedContracts";

export const getMarketplaceAddress = () => {
	const env = (process.env.NEXT_PUBLIC_STARKNET_ENV ??
		"sepolia") as keyof typeof configExternalContracts;
	return configExternalContracts[env].Marketplace.address;
};

interface BlockchainEvent {
	name: string;
	data: string[];
	timestamp: number;
}

interface StarknetEvent {
	keys: string[];
	data: string[];
	block_number: number;
	transaction_hash: string;
}

export enum PaymentToken {
	STRK = "STRK",
	USDC = "USDC",
	USDT = "USDT",
}

export const PaymentTokenTag: Record<PaymentToken, string> = {
	[PaymentToken.STRK]: "0x0",
	[PaymentToken.USDC]: "0x1",
	[PaymentToken.USDT]: "0x2",
};

export const localAccount = () => {
	const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" });

	const DEVNET_PRIVATE_KEY = "0x…";
	const DEVNET_ACCOUNT_ADDR = "0x…";

	const account = new Account(
		provider,
		DEVNET_ACCOUNT_ADDR,
		DEVNET_PRIVATE_KEY,
	);
	return account;
};

export enum CofiBlocksContracts {
	MARKETPLACE = "Marketplace",
	COFI_COLLECTION = "CofiCollection",
	DISTRIBUTION = "Distribution",
}

export const getCallToContract = async (
	contract: CofiBlocksContracts,
	entrypoint: string,
	calldata: unknown[],
) => {
	const account = localAccount();
	const contractInstance = new Contract(
		configExternalContracts.mainnet[contract].abi,
		configExternalContracts.mainnet[contract].address,
		account,
	);
	await contractInstance.invoke(entrypoint, calldata);
};

export async function getEvents(
	contract: CofiBlocksContracts,
): Promise<BlockchainEvent[]> {
	const { provider } = useProvider();
	const starknetProvider = provider as Provider;
	const eventsResponse = await starknetProvider.getEvents({
		address: configExternalContracts.mainnet[contract].address,
		from_block: { block_number: 0 },
		to_block: "latest",
		chunk_size: 100,
		keys: [[configExternalContracts.mainnet[contract].address]],
	});

	// Convert events to our format
	const events: BlockchainEvent[] = (eventsResponse.events ?? []).map(
		(event: StarknetEvent) => ({
			name: event.keys[0] ?? "",
			data: event.data,
			timestamp: Date.now() / 1000, // Using current timestamp as fallback
		}),
	);

	return events;
}
