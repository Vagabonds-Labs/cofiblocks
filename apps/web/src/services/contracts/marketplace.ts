import { format_number } from "../../utils/formatting";
import { executeTransaction, UserAuthData } from "../cavos";
import { 
    PaymentToken,
    PaymentTokenTag,
    getMarketplaceAddress,
    CofiBlocksContracts,
    getCallToContract
} from "../../utils/contracts";


export async function buyProduct(
    tokenId: bigint,
    tokenAmount: bigint,
    paymentToken: PaymentToken,
    userAuthData: UserAuthData
) {
    const formattedTokenId = format_number(tokenId);
    const formattedTokenAmount = format_number(tokenAmount);
    let calldata = [
        formattedTokenId.low,
        formattedTokenId.high,
        formattedTokenAmount.low,
        formattedTokenAmount.high,
        PaymentTokenTag[paymentToken]
    ];

    const transaction = {
        contract_address: getMarketplaceAddress(),
        entrypoint: "buy_product",
        calldata: calldata,
    };
    const tx = await executeTransaction(userAuthData, transaction);
    return tx;
}

export async function buyProducts(
    tokenId: bigint[],
    tokenAmount: bigint[],
    paymentToken: PaymentToken,
    userAuthData: UserAuthData
) {
    let formattedTokenIds = [];
    let formattedTokenAmounts = [];
    for (let i = 0; i < tokenId.length; i++) {
        const formattedTokenId = format_number(tokenId[i]!);
        const formattedTokenAmount = format_number(tokenAmount[i]!);
        formattedTokenIds.push(formattedTokenId.low);
        formattedTokenIds.push(formattedTokenId.high);
        formattedTokenAmounts.push(formattedTokenAmount.low);
        formattedTokenAmounts.push(formattedTokenAmount.high);
    }
    let calldata = [
        "0x" + tokenId.length.toString(16),
        ...formattedTokenIds,
        "0x" + tokenAmount.length.toString(16),
        ...formattedTokenAmounts,
        PaymentTokenTag[paymentToken]
    ];

    const transaction = {
        contract_address: getMarketplaceAddress(),
        entrypoint: "buy_products",
        calldata: calldata,
    };
    const tx = await executeTransaction(userAuthData, transaction);
    return tx;
}

export async function createProduct(
    initialStock: bigint,
    price: bigint,
    userAuthData: UserAuthData
) {
    const formattedInitialStock = format_number(initialStock);
    const formattedPrice = format_number(price);
    let calldata = [
        formattedInitialStock.low,
        formattedInitialStock.high,
        formattedPrice.low,
        formattedPrice.high,
        "0x1",
        "0x0"
    ];

    const transaction = {
        contract_address: getMarketplaceAddress(),
        entrypoint: "create_product",
        calldata: calldata,
    };
    const tx = await executeTransaction(userAuthData, transaction);
    return tx;
}

export async function createProducts(
    initialStock: bigint[],
    price: bigint[],
    userAuthData: UserAuthData
) {
    let formattedInitialStocks = [];
    let formattedPrices = [];
    for (let i = 0; i < initialStock.length; i++) {
        const formattedInitialStock = format_number(initialStock[i]!);
        const formattedPrice = format_number(price[i]!);
        formattedInitialStocks.push(formattedInitialStock.low);
        formattedInitialStocks.push(formattedInitialStock.high);
        formattedPrices.push(formattedPrice.low);
        formattedPrices.push(formattedPrice.high);
    }
    let calldata = [
        "0x" + initialStock.length.toString(16),
        ...formattedInitialStocks,
        "0x" + price.length.toString(16),
        ...formattedPrices,
    ];

    const transaction = {
        contract_address: getMarketplaceAddress(),
        entrypoint: "create_products",
        calldata: calldata,
    };
    const tx = await executeTransaction(userAuthData, transaction);
    return tx;
}

export async function getProductPrice(
    tokenId: bigint,
    tokenAmount: bigint,
    paymentToken: PaymentToken
) {
    const formattedTokenId = format_number(tokenId);
    const formattedTokenAmount = format_number(tokenAmount);
    let calldata = [
        formattedTokenId.low,
        formattedTokenId.high,
        formattedTokenAmount.low,
        formattedTokenAmount.high,
        PaymentTokenTag[paymentToken]
    ];

    const tx = await getCallToContract(CofiBlocksContracts.MARKETPLACE, "get_product_price", calldata);
    return tx;
}

export async function deleteProduct(
    tokenId: bigint,
    userAuthData: UserAuthData
) {
    const formattedTokenId = format_number(tokenId);
    let calldata = [
        formattedTokenId.low,
        formattedTokenId.high,
    ];

    const transaction = {
        contract_address: getMarketplaceAddress(),
        entrypoint: "delete_product",
        calldata: calldata,
    };
    const tx = await executeTransaction(userAuthData, transaction);
    return tx;
}

export async function deleteProducts(
    tokenId: bigint[],
    userAuthData: UserAuthData
) {
    let formattedTokensIds = [];
    for (let i = 0; i < tokenId.length; i++) {
        const formattedTokenId = format_number(tokenId[i]!);
        formattedTokensIds.push(formattedTokenId.low);
        formattedTokensIds.push(formattedTokenId.high);
    }
    let calldata = [
        "0x" + tokenId.length.toString(16),
        ...formattedTokensIds,
    ];

    const transaction = {
        contract_address: getMarketplaceAddress(),
        entrypoint: "delete_products",
        calldata: calldata,
    };
    const tx = await executeTransaction(userAuthData, transaction);
    return tx;
}

export async function claimConsumer(
    userAuthData: UserAuthData
) {
    const transaction = {
        contract_address: getMarketplaceAddress(),
        entrypoint: "claim_consumer",
        calldata: [],
    };
    const tx = await executeTransaction(userAuthData, transaction);
    return tx;
}

export async function claimProducer(
    userAuthData: UserAuthData
) {
    const transaction = {
        contract_address: getMarketplaceAddress(),
        entrypoint: "claim_producer",
        calldata: [],
    };
    const tx = await executeTransaction(userAuthData, transaction);
    return tx;
}

export async function claimRoaster(
    userAuthData: UserAuthData
) {
    const transaction = {
        contract_address: getMarketplaceAddress(),
        entrypoint: "claim_roaster",
        calldata: [],
    };
    const tx = await executeTransaction(userAuthData, transaction);
    return tx;
}

export async function getProductStock(
    tokenId: bigint,
) {
    const formattedTokenId = format_number(tokenId);
    let calldata = [
        formattedTokenId.low,
        formattedTokenId.high,
    ];

    const tx = await getCallToContract(CofiBlocksContracts.MARKETPLACE, "listed_product_stock", calldata);
    return tx;
}
