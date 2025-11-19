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
	const hexString = n.toString(16);
	if (hexString.length > 32) {
		const high = `0x${hexString.slice(0, 32)}`;
		const low = `0x${hexString.slice(32)}`;
		return { high, low };
	}
	return {
		high: `0x${hexString}`,
		low: "0x0",
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