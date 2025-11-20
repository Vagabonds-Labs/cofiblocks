import {
	Account,
	type ArgsOrCalldata,
	Contract,
	RpcProvider,
} from "starknet";
import configExternalContracts from "../contracts/allContracts";

export const getContractAddress = (contract: CofiBlocksContracts) => {
	const env = "mainnet";
	return configExternalContracts[env][contract].address;
};

export const getContract = (contract: CofiBlocksContracts, account: Account) => {
	const env = "mainnet";
	return new Contract({
		abi: configExternalContracts[env][contract].abi,
		address: configExternalContracts[env][contract].address,
		providerOrAccount: account,
	});
};

export const CURRENT_TOKEN_ID_SELECTOR = "0x02d1f2240a2ec0158271955aa86d008519cb3eb290544ba488a608bb086c40a7";

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


// This should be defined as js object, not enum
export const PaymentTokenTag: Record<PaymentToken, string> = {
	[PaymentToken.STRK]: "0x0",
	[PaymentToken.USDC]: "0x1",
	[PaymentToken.USDT]: "0x2",
};

export const localAccount = () => {
	const provider = new RpcProvider({
		nodeUrl: process.env.NEXT_PUBLIC_NODE_URL ?? "https://api.cartridge.gg/x/starknet/mainnet",
	});

	const account = new Account({
		provider,
		address: process.env.MAINNET_ACCOUNT_ADDR ?? "",
		signer: process.env.MAINNET_ACCOUNT_PRIVATE_KEY ?? "",
	});

	return account;
};

export enum CofiBlocksContracts {
	MARKETPLACE = "Marketplace",
	COFI_COLLECTION = "CofiCollection",
	DISTRIBUTION = "Distribution",
	STRK = "STRK",
	USDC = "USDC",
	USDT = "USDT",
	MIST = "MIST",
}

export const getCallToContract = async (
	contract: CofiBlocksContracts,
	entrypoint: string,
	calldata: ArgsOrCalldata,
) => {
	const account = localAccount();
	const contractInstance = getContract(contract, account);
	// Use "latest" instead of "pending" as Cartridge RPC doesn't support "pending"
	return await contractInstance.call(entrypoint, calldata, { blockIdentifier: "latest" });
};

export const readStorageAt = async (
	contract: CofiBlocksContracts,
	selector: string,
) => {
	const account = localAccount();
	// Use "latest" instead of "pending" as Cartridge RPC doesn't support "pending"
	return await account.getStorageAt(
		configExternalContracts.mainnet[contract].address,
		selector,
		"latest",
	)
};

export async function getEvents(
	contract: CofiBlocksContracts,
): Promise<BlockchainEvent[]> {
	const starknetProvider = new RpcProvider({
		nodeUrl: process.env.NEXT_PUBLIC_NODE_URL ?? "https://api.cartridge.gg/x/starknet/mainnet",
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

/**
 * Normalizes province names by:
 * - Converting to lowercase
 * - Removing accents/diacritics
 * - Replacing spaces with underscores
 * - Trimming whitespace
 */
const normalizeProvinceName = (province: string): string => {
	return province
		.toLowerCase()
		.trim()
		.normalize("NFD") // Decompose accented characters
		.replace(/[\u0300-\u036f]/g, "") // Remove diacritical marks
		.replace(/\s+/g, "_") // Replace spaces with underscores
		.replace(/[^a-z_]/g, ""); // Remove any non-alphabetic characters except underscores
};

export const getDeliveryFee = (province: string) => {
	const gam = ["san_jose", "alajuela", "cartago", "heredia"];
	const normalizedProvince = normalizeProvinceName(province);
	console.log("normalizedProvince", normalizedProvince);
	if (gam.includes(normalizedProvince)) {
		const gam_price = process.env.GAM_DELIVERY_PRICE ? parseInt(process.env.GAM_DELIVERY_PRICE) : 1;
		return BigInt(gam_price * (10 ** 6));
	}
	const outside_price = process.env.OUTSIDE_DELIVERY_PRICE ? parseInt(process.env.OUTSIDE_DELIVERY_PRICE) : 1;
	return BigInt(outside_price * (10 ** 6));
}