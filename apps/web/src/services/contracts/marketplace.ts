import { type UserAuthData, executeTransaction } from "~/server/services/cavos";
import {
	CofiBlocksContracts,
	type PaymentToken,
	PaymentTokenTag,
	getCallToContract,
	getMarketplaceAddress,
} from "../../utils/contracts";
import { format_number } from "../../utils/formatting";

export async function buyProduct(
	tokenId: bigint,
	tokenAmount: bigint,
	paymentToken: PaymentToken,
	userAuthData: UserAuthData,
) {
	const formattedTokenId = format_number(tokenId);
	const formattedTokenAmount = format_number(tokenAmount);
	const calldata = [
		formattedTokenId.low,
		formattedTokenId.high,
		formattedTokenAmount.low,
		formattedTokenAmount.high,
		PaymentTokenTag[paymentToken],
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
	userAuthData: UserAuthData,
) {
	const formattedTokenIds = [];
	const formattedTokenAmounts = [];
	for (let i = 0; i < tokenId.length; i++) {
		const formattedTokenId = format_number(tokenId[i] ?? 0n);
		const formattedTokenAmount = format_number(tokenAmount[i] ?? 0n);
		formattedTokenIds.push(formattedTokenId.low);
		formattedTokenIds.push(formattedTokenId.high);
		formattedTokenAmounts.push(formattedTokenAmount.low);
		formattedTokenAmounts.push(formattedTokenAmount.high);
	}
	const calldata = [
		`0x${tokenId.length.toString(16)}`,
		...formattedTokenIds,
		`0x${tokenAmount.length.toString(16)}`,
		...formattedTokenAmounts,
		PaymentTokenTag[paymentToken],
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
	userAuthData: UserAuthData,
) {
	const formattedInitialStock = format_number(initialStock);
	const formattedPrice = format_number(price);
	const calldata = [
		formattedInitialStock.low,
		formattedInitialStock.high,
		formattedPrice.low,
		formattedPrice.high,
		"0x1",
		"0x0",
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
	userAuthData: UserAuthData,
) {
	const formattedInitialStocks = [];
	const formattedPrices = [];
	for (let i = 0; i < initialStock.length; i++) {
		const formattedInitialStock = format_number(initialStock[i] ?? 0n);
		const formattedPrice = format_number(price[i] ?? 0n);
		formattedInitialStocks.push(formattedInitialStock.low);
		formattedInitialStocks.push(formattedInitialStock.high);
		formattedPrices.push(formattedPrice.low);
		formattedPrices.push(formattedPrice.high);
	}
	const calldata = [
		`0x${initialStock.length.toString(16)}`,
		...formattedInitialStocks,
		`0x${price.length.toString(16)}`,
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
	paymentToken: PaymentToken,
) {
	const formattedTokenId = format_number(tokenId);
	const formattedTokenAmount = format_number(tokenAmount);
	const calldata = [
		formattedTokenId.low,
		formattedTokenId.high,
		formattedTokenAmount.low,
		formattedTokenAmount.high,
		PaymentTokenTag[paymentToken],
	];

	const tx = await getCallToContract(
		CofiBlocksContracts.MARKETPLACE,
		"get_product_price",
		calldata,
	);
	return tx;
}

export async function deleteProduct(
	tokenId: bigint,
	userAuthData: UserAuthData,
) {
	const formattedTokenId = format_number(tokenId);
	const calldata = [formattedTokenId.low, formattedTokenId.high];

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
	userAuthData: UserAuthData,
) {
	const formattedTokensIds = [];
	for (let i = 0; i < tokenId.length; i++) {
		const formattedTokenId = format_number(tokenId[i] ?? 0n);
		formattedTokensIds.push(formattedTokenId.low);
		formattedTokensIds.push(formattedTokenId.high);
	}
	const calldata = [`0x${tokenId.length.toString(16)}`, ...formattedTokensIds];

	const transaction = {
		contract_address: getMarketplaceAddress(),
		entrypoint: "delete_products",
		calldata: calldata,
	};
	const tx = await executeTransaction(userAuthData, transaction);
	return tx;
}

export async function claimConsumer(userAuthData: UserAuthData) {
	const transaction = {
		contract_address: getMarketplaceAddress(),
		entrypoint: "claim_consumer",
		calldata: [],
	};
	const tx = await executeTransaction(userAuthData, transaction);
	return tx;
}

export async function claimProducer(userAuthData: UserAuthData) {
	const transaction = {
		contract_address: getMarketplaceAddress(),
		entrypoint: "claim_producer",
		calldata: [],
	};
	const tx = await executeTransaction(userAuthData, transaction);
	return tx;
}

export async function claimRoaster(userAuthData: UserAuthData) {
	const transaction = {
		contract_address: getMarketplaceAddress(),
		entrypoint: "claim_roaster",
		calldata: [],
	};
	const tx = await executeTransaction(userAuthData, transaction);
	return tx;
}

export async function getProductStock(tokenId: bigint) {
	const formattedTokenId = format_number(tokenId);
	const calldata = [formattedTokenId.low, formattedTokenId.high];

	const tx = await getCallToContract(
		CofiBlocksContracts.MARKETPLACE,
		"listed_product_stock",
		calldata,
	);
	return tx;
}
