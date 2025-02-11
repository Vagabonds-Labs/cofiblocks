import type { Account, RawArgs, RpcProvider, UniversalDetails } from "starknet";

export type Networks = Record<"devnet" | "sepolia" | "mainnet", Network>;

export type Network = {
	provider: RpcProvider;
	deployer: Account;
	feeToken: { name: string; address: string }[];
};

export type DeployContractParams = {
	contract: string;
	contractName?: string;
	constructorArgs?: RawArgs;
	options?: UniversalDetails;
};

export enum DeploymentErrorType {
	VALIDATION_ERROR = "VALIDATION_ERROR",
	NETWORK_ERROR = "NETWORK_ERROR",
	GAS_ERROR = "GAS_ERROR",
	NONCE_ERROR = "NONCE_ERROR",
	CONTRACT_ERROR = "CONTRACT_ERROR",
	UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export class DeploymentError extends Error {
	constructor(
		public type: DeploymentErrorType,
		message: string,
		public txHash?: string,
		public contractAddress?: string,
	) {
		super(message);
		this.name = "DeploymentError";
	}
}

export interface RetryConfig {
	maxAttempts: number;
	initialDelay: number;
	maxDelay: number;
	factor: number;
}

export interface TransactionQueueItem {
	id: string;
	execute: () => Promise<unknown>;
	priority: number;
	network: keyof Networks;
	dependencies?: string[];
}
