// lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Format a number into a localized currency string.
 * @param amount - The amount to format.
 * @param currency - The ISO 4217 currency code (e.g., "USD", "NGN").
 * @param locale - Optional locale (defaults to "en-US").
 * @returns Formatted currency string.
 */
export function formatCurrency(
	amount: number,
	currency: string = "USD",
	locale: string = "en-US"
): string {
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(amount);
}
