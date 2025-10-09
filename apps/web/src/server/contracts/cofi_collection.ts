import { CofiBlocksContracts, getCallToContract } from "../../utils/contracts";
import type { UserAuthData } from "../services/cavos";

export async function balanceOf(userAuthData: UserAuthData, tokenId: bigint) {
	const calldata = [
		userAuthData.wallet_address,
		tokenId,
	];
	const tx = await getCallToContract(
		CofiBlocksContracts.COFI_COLLECTION,
		"balance_of",
		calldata,
	);
	return tx;
}
