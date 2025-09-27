import { CofiBlocksContracts, getCallToContract } from "../../utils/contracts";
import { format_number } from "../../utils/formatting";
import type { UserAuthData } from "../cavos";

export async function balanceOf(userAuthData: UserAuthData, tokenId: bigint) {
	const formattedTokenId = format_number(tokenId);
	const calldata = [
		userAuthData.wallet_address,
		formattedTokenId.low,
		formattedTokenId.high,
	];
	const tx = await getCallToContract(
		CofiBlocksContracts.DISTRIBUTION,
		"balance_of",
		calldata,
	);
	return tx;
}
