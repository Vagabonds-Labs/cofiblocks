import { PaymentToken } from "~/utils/contracts";
import { CofiBlocksContracts, getCallToContract } from "~/utils/contracts";
import { UserAuthData, executeTransaction } from "~/server/services/cavos";
import { getContractAddress } from "~/utils/contracts";
import { format_number } from "~/utils/formatting";


export const getBalances = async (walletAddress: string, token: PaymentToken, formatted: boolean = true) => {
    const calldata = [walletAddress];
    const balance_result = await getCallToContract(
        CofiBlocksContracts[token],
        "balance_of",
        calldata,
    );
    if (!formatted) {
        return Number(balance_result);
    }
    const decimals = token === PaymentToken.STRK ? 18 : 6;
    const balance = Number(balance_result) / 10 ** decimals;
    return balance;
}

export async function increaseAllowance(
	allowance: bigint,
	paymentToken: PaymentToken,
    contract: CofiBlocksContracts,
	userAuthData: UserAuthData,
) {
	const formattedAllowance = format_number(allowance);
	const transaction = {
		contract_address: getContractAddress(CofiBlocksContracts[paymentToken]),
		entrypoint: "approve",
		calldata: [
            getContractAddress(contract),
            formattedAllowance.high,
            formattedAllowance.low
        ],
	};
	const tx = await executeTransaction(userAuthData, transaction);
	return tx;
}

export async function transfer(
	amount: bigint,
	paymentToken: PaymentToken,
	recipient: string,
	userAuthData: UserAuthData,
) {
	const formattedAmount = format_number(amount);
	const transaction = {
		contract_address: getContractAddress(CofiBlocksContracts[paymentToken]),
		entrypoint: "transfer",
		calldata: [recipient, formattedAmount.high, formattedAmount.low],
	};
	const tx = await executeTransaction(userAuthData, transaction);
	return tx;
}