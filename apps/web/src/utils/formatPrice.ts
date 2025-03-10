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
