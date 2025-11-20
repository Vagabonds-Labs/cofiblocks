const TWO_POW_128 = 0x100000000000000000000000000000000n;

/**
 * Formats a price value into a currency string
 * @param price - The price value to format
 * @param currency - The currency code (default: 'USD')
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns A formatted price string
 */
export function formatPrice(
	price: number,
	currency = "USD",
	locale = "en-US",
): string {
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(price);
}

export interface FormattedNumber {
	high: string;
	low: string;
}

export function format_number(n: bigint): FormattedNumber {
	return {
		high: (n / TWO_POW_128).toString(),
		low: (n % TWO_POW_128).toString(),
	};
}

/**
 * Formats a wallet address with proper padding for copy-paste compatibility
 * @param address - The wallet address to format
 * @returns A formatted wallet address with proper padding
 */
export function formatWalletAddress(address: string): string {
	if (!address) return "";

	// Remove 0x prefix if present
	const cleanAddress = address.startsWith("0x") ? address.slice(2) : address;

	// Pad with zeros to make it 64 characters (32 bytes)
	const paddedAddress = cleanAddress.padStart(64, "0");

	// Add 0x prefix back
	return `0x${paddedAddress}`;
}

export const calculatePriceWithMarketFee = (price: number): number => {
	const marketFeeBps = 5000; // 50%
	const fee = (price * marketFeeBps) / 10000;
	return price + fee;
};