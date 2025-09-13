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
    let hexString = n.toString(16);
    if (hexString.length > 32) {
        const high = "0x" + hexString.slice(0, 32);
        const low = "0x" + hexString.slice(32);
        return { high, low };
    }
    return {
        high: "0x" + hexString,
        low: "0x0",
    };
}