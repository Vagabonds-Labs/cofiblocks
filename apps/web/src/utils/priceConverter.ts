interface CoinGeckoResponse {
	starknet: {
		usd: number;
	};
}

/**
 * Fetches the latest STRK price in USD from CoinGecko
 */
export async function getStarknetPrice(): Promise<number> {
	try {
		const response = await fetch(
			"https://api.coingecko.com/api/v3/simple/price?ids=starknet&vs_currencies=usd",
		);
		const data = (await response.json()) as CoinGeckoResponse;
		return data.starknet.usd;
	} catch (error) {
		console.error("Error fetching STRK price:", error);
		throw new Error("Failed to fetch STRK price");
	}
}

/**
 * Converts USD amount to STRK
 * @param usdAmount - Amount in USD
 * @param strkPrice - Current STRK price in USD
 * @returns Amount in STRK
 */
export function usdToStrk(usdAmount: number, strkPrice: number): number {
	return usdAmount / strkPrice;
}

/**
 * Converts STRK amount to USD
 * @param strkAmount - Amount in STRK
 * @param strkPrice - Current STRK price in USD
 * @returns Amount in USD
 */
export function strkToUsd(strkAmount: number, strkPrice: number): number {
	return strkAmount * strkPrice;
}
