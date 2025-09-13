import { UserAuthData } from "../cavos";
import { 
    CofiBlocksContracts,
    getCallToContract
} from "../../utils/contracts";


export async function getclaimBalanceProducer(
    userAuthData: UserAuthData
) {
    const calldata = [
        userAuthData.wallet_address,
    ];
    const tx = await getCallToContract(CofiBlocksContracts.DISTRIBUTION, "producer_claim_balance", calldata);
    return tx;
}

export async function getclaimBalanceCoffeeLover(
    userAuthData: UserAuthData
) {
    const calldata = [
        userAuthData.wallet_address,
    ];
    const tx = await getCallToContract(CofiBlocksContracts.DISTRIBUTION, "coffee_lover_claim_balance", calldata);
    return tx;
}

export async function getclaimBalanceRoaster(
    userAuthData: UserAuthData
) {
    const calldata = [
        userAuthData.wallet_address,
    ];
    const tx = await getCallToContract(CofiBlocksContracts.DISTRIBUTION, "roaster_claim_balance", calldata);
    return tx;
}
