import { PaymentToken } from "~/utils/contracts";
import { CofiBlocksContracts, getCallToContract } from "~/utils/contracts";
import type { TransactionDetails, UserAuthData } from "~/server/services/cavos";
import { executeTransaction } from "~/server/services/cavos";
import { getContractAddress } from "~/utils/contracts";
import { format_number } from "~/utils/formatting";
import { txSecret } from "@mistcash/crypto";

export const getBalances = async (walletAddress: string, token: PaymentToken, formatted = true) => {
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

export function increaseAllowanceTx(
	allowance: bigint,
	paymentToken: PaymentToken,
	contract: CofiBlocksContracts,
): TransactionDetails {
	const formattedAllowance = format_number(allowance);
	return {
		contract_address: getContractAddress(CofiBlocksContracts[paymentToken]),
		entrypoint: "approve",
		calldata: [
			getContractAddress(contract),
			formattedAllowance.low,
			formattedAllowance.high
		],
	};
}

export async function mistTransferTx(
	allowance: bigint,
	paymentToken: PaymentToken,
	contract: CofiBlocksContracts,
	orderId: string,
): Promise<TransactionDetails> {
	const secret = await txSecret(
		`0x${orderId.replaceAll("-", "")}`,
		getContractAddress(contract)
	);
	const secret_u256 = format_number(secret);
	const formattedAllowance = format_number(allowance);
	const tokenAddr = getContractAddress(CofiBlocksContracts[paymentToken]);
	return {
		contract_address: getContractAddress(CofiBlocksContracts.MIST),
		entrypoint: "deposit",
		calldata: [
			secret_u256.low,
			secret_u256.high,
			formattedAllowance.low,
			formattedAllowance.high,
			tokenAddr,
		],
	};
}

export async function increaseAllowance(
	allowance: bigint,
	paymentToken: PaymentToken,
	contract: CofiBlocksContracts,
	userAuthData: UserAuthData,
) {
	const txData = increaseAllowanceTx(allowance, paymentToken, contract);
	const tx = await executeTransaction(userAuthData, txData);
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
		calldata: [recipient, formattedAmount.low, formattedAmount.high],
	};
	const tx = await executeTransaction(userAuthData, transaction);
	return tx;
}