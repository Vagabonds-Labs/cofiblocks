import { CofiBlocksContracts, getCallToContract } from "../../utils/contracts";
import type { UserAuthData } from "../services/cavos";

export async function getclaimBalanceProducer(userAuthData: UserAuthData) {
	const walletAddress = userAuthData.wallet_address ?? '';
	const calldata = [walletAddress];
	const tx = await getCallToContract(
		CofiBlocksContracts.DISTRIBUTION,
		"producer_claim_balance",
		calldata,
	);
	return tx;
}

export async function getclaimBalanceCoffeeLover(userAuthData: UserAuthData) {
	const walletAddress = userAuthData.wallet_address ?? '';
	const calldata = [walletAddress];
	const tx = await getCallToContract(
		CofiBlocksContracts.DISTRIBUTION,
		"coffee_lover_claim_balance",
		calldata,
	);
	return tx;
}

export async function getclaimBalanceRoaster(userAuthData: UserAuthData) {
	const walletAddress = userAuthData.wallet_address ?? '';
	const calldata = [walletAddress];
	const tx = await getCallToContract(
		CofiBlocksContracts.DISTRIBUTION,
		"roaster_claim_balance",
		calldata,
	);
	return tx;
}
