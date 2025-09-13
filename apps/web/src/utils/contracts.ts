
import { RpcProvider, Account, Abi, Contract } from "starknet";
import configExternalContracts from "../contracts/configExternalContracts";

export const getMarketplaceAddress = () => {
    const env = (process.env.NEXT_PUBLIC_STARKNET_ENV ??
        "sepolia") as keyof typeof configExternalContracts;
    return configExternalContracts[env].Marketplace.address;
};

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

    const account = new Account(provider, DEVNET_ACCOUNT_ADDR, DEVNET_PRIVATE_KEY);
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
    calldata: any[]
) => {
    const env = (process.env.NEXT_PUBLIC_STARKNET_ENV ??
        "sepolia") as keyof typeof configExternalContracts;
    const account = localAccount();
    const contractInstance = new Contract(
        configExternalContracts[env][contract].abi,
        configExternalContracts[env][contract].address,
        account
    );
    await contractInstance.invoke(entrypoint, calldata);
}
