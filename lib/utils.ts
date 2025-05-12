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


/**
 * Generates a consistent background color from a string (e.g., userId or name).
 * @param str The input string.
 * @returns A hex color string (e.g., "#RRGGBB").
 */
export function generateColorFromString(str: string): string {
	if (!str) return '#CCCCCC'; // Default color for empty string

	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
		hash = hash & hash; // Convert to 32bit integer
	}

	const h = Math.abs(hash % 360); // Hue (0-359), ensure positive
	const s = 60 + (Math.abs(hash >> 8) % 21); // Saturation (60-80%)
	const l = 45 + (Math.abs(hash >> 16) % 21); // Lightness (45-65%)

	return hslToHex(h, s, l);
}

/**
 * Converts HSL color values to a HEX string.
 * Assumes h, s, and l are contained in the set [0, 360], [0, 100], [0, 100] respectively.
 */
export function hslToHex(h: number, s: number, l: number): string {
	s /= 100;
	l /= 100;

	const k = (n: number) => (n + h / 30) % 12;
	const a = s * Math.min(l, 1 - l);
	const f = (n: number) =>
		l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

	const toHex = (x: number) => {
		const hex = Math.round(x * 255).toString(16);
		return hex.length === 1 ? '0' + hex : hex;
	};

	return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

/**
 * Determines if a color is dark or light to choose contrasting text color.
 * @param hexColor The hex color string (e.g., "#RRGGBB").
 * @returns "dark" (suggests light text) or "light" (suggests dark text)
 */
export function getContrastColor(hexColor: string): 'dark' | 'light' {
	if (!hexColor || hexColor.length < 7) return 'dark'; // Default to dark text for invalid/short hex
	try {
		const r = parseInt(hexColor.slice(1, 3), 16);
		const g = parseInt(hexColor.slice(3, 5), 16);
		const b = parseInt(hexColor.slice(5, 7), 16);
		// HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
		const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
		return hsp > 127.5 ? 'light' : 'dark'; // If color is light, background is light -> dark text. If color is dark, background is dark -> light text.
	} catch (e) {
		return 'dark'; // Default on parsing error
	}
}

/**
 * Gets initials from a name.
 * @param name The full name string.
 * @returns Initials (e.g., "JD", "J", "Jo").
 */
export function getInitials(name?: string): string {
	if (!name || name.trim() === "") return "?";
	const nameParts = name.trim().split(/\s+/).filter(part => part.length > 0); // Filter out empty parts
	if (nameParts.length > 1) {
		return (nameParts[0][0] + (nameParts[nameParts.length - 1][0] || '')).toUpperCase();
	} else if (nameParts.length === 1 && nameParts[0].length > 0) {
		return nameParts[0].substring(0, Math.min(2, nameParts[0].length)).toUpperCase();
	}
	return "?";
}