import {
	type BigNumberish,
	Contract,
	type InvokeFunctionResponse,
	RpcProvider,
} from "starknet";
import configExternalContracts from "../contracts/configExternalContracts";

const env = (process.env.NEXT_PUBLIC_STARKNET_ENV ??
	"sepolia") as keyof typeof configExternalContracts;
const provider = new RpcProvider({
	nodeUrl:
		process.env.NEXT_PUBLIC_NODE_URL ??
		"https://starknet-sepolia.public.blastapi.io",
});

interface CofiCollectionContract extends Contract {
	balance_of: (address: string, tokenId: string) => Promise<BigNumberish>;
}

interface MarketplaceContract extends Contract {
	create_product: (
		initialStock: BigNumberish,
		price: BigNumberish,
		tokenId: BigNumberish,
	) => Promise<InvokeFunctionResponse>;
	buy_products: (
		tokenIds: BigNumberish[],
		amounts: BigNumberish[],
	) => Promise<InvokeFunctionResponse>;
	claim_balance: (address: string) => Promise<BigNumberish>;
}

interface StarkContract extends Contract {
	approve: (
		spender: string,
		amount: BigNumberish,
	) => Promise<InvokeFunctionResponse>;
	allowance: (owner: string, spender: string) => Promise<BigNumberish>;
}

export class ServerContractsInterface {
	cofiCollectionContract: CofiCollectionContract;
	marketplaceContract: MarketplaceContract;
	starkContract: StarkContract;

	constructor() {
		this.cofiCollectionContract = new Contract(
			configExternalContracts[env].CofiCollection.abi,
			configExternalContracts[env].CofiCollection.address,
			provider,
		) as CofiCollectionContract;

		this.marketplaceContract = new Contract(
			configExternalContracts[env].Marketplace.abi,
			configExternalContracts[env].Marketplace.address,
			provider,
		) as MarketplaceContract;

		this.starkContract = new Contract(
			configExternalContracts[env].stark.abi,
			configExternalContracts[env].stark.address,
			provider,
		) as StarkContract;
	}

	async getBalance(address: string, tokenId: string): Promise<BigNumberish> {
		try {
			const balance = await this.cofiCollectionContract.balance_of(
				address,
				tokenId,
			);
			return balance;
		} catch (error) {
			console.error("Error getting balance:", error);
			throw error;
		}
	}

	// Add other methods as needed for server-side operations
}

export const serverContracts = new ServerContractsInterface();
