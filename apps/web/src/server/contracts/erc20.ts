import { PaymentToken } from "~/utils/contracts";
import { CofiBlocksContracts, getCallToContract } from "~/utils/contracts";
import type { UserAuthData } from "~/server/services/cavos";
import { executeTransaction } from "~/server/services/cavos";
import { getContractAddress } from "~/utils/contracts";
import { format_number } from "~/utils/formatting";


// Helper function to extract numeric value from contract result
function extractBalanceValue(result: unknown): number {
    if (typeof result === "number") {
        return result;
    }

    // Handle different possible result structures
    if (result && typeof result === "object") {
        // Check if it's an array
        if (Array.isArray(result)) {
            const hexValue = (result[0] as string) ?? "0x0";
            return Number.parseInt(hexValue, 16);
        }

        // Check if it has a result property
        if ("result" in result && Array.isArray((result as { result: unknown[] }).result)) {
            const resultArray = (result as { result: string[] }).result;
            const hexValue = resultArray[0] ?? "0x0";
            return Number.parseInt(hexValue, 16);
        }
    }

    return 0;
}

export const getBalances = async (walletAddress: string, token: PaymentToken, formatted = true) => {
    const calldata = [walletAddress];
    const balance_result = await getCallToContract(
        CofiBlocksContracts[token],
        "balance_of",
        calldata,
    );
    
    const balanceValue = extractBalanceValue(balance_result);
    
    if (!formatted) {
        return balanceValue;
    }
  
    const decimals = token === PaymentToken.STRK ? 18 : 6;
    const balance = balanceValue / 10 ** decimals;
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