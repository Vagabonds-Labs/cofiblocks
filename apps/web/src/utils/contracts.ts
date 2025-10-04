import {
	Account,
	type ArgsOrCalldata,
	Contract,
	Provider,
	RpcProvider,
} from "starknet";
import configExternalContracts from "../contracts/deployedContracts";

export const getMarketplaceAddress = () => {
	const env = "mainnet";
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
	const provider = new RpcProvider({
		nodeUrl: process.env.RPC_URL_MAINNET ?? "",
	});

	const account = new Account(
		provider,
		process.env.MAINNET_ACCOUNT_ADDR ?? "",
		process.env.MAINNET_ACCOUNT_PRIVATE_KEY ?? "",
	);
	return account;
};

export enum CofiBlocksContracts {
	MARKETPLACE = "Marketplace",
	COFI_COLLECTION = "CofiCollection",
	DISTRIBUTION = "Distribution",
	STRK = "STRK",
	USDC = "USDC",
	USDT = "USDT",
}

export const getCallToContract = async (
	contract: CofiBlocksContracts,
	entrypoint: string,
	calldata: ArgsOrCalldata,
) => {
	const account = localAccount();
	const contractInstance = new Contract(
		configExternalContracts.mainnet[contract].abi,
		configExternalContracts.mainnet[contract].address,
		account,
	);
	return await contractInstance.call(entrypoint, calldata);
};

export async function getEvents(
	contract: CofiBlocksContracts,
): Promise<BlockchainEvent[]> {
	const starknetProvider = new RpcProvider({
		nodeUrl: process.env.RPC_URL_MAINNET ?? "",
	});
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
