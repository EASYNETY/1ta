// lib/utils.ts

/**
 * Utility functions for styling, formatting, and string manipulation.
 * Includes helpers for className merging, currency formatting, color generation, and initials extraction.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and merges Tailwind CSS classes with twMerge.
 * Useful for conditionally joining class names and resolving conflicts in Tailwind CSS.
 * @param inputs - Array of class values (strings, objects, arrays).
 * @returns A single merged className string.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Format a number into a localized currency string.
 * Uses Intl.NumberFormat with currency style and no decimal places.
 * @param amount - The numeric amount to format.
 * @param currency - The ISO 4217 currency code (e.g., "USD", "NGN").
 * @param locale - Optional locale string (default is "en-US").
 * @returns The formatted currency string.
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
 * Uses a hash function to create HSL values and converts to HEX.
 * @param str - The input string to generate color from.
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
 * @param h - Hue degree (0-360).
 * @param s - Saturation percentage (0-100).
 * @param l - Lightness percentage (0-100).
 * @returns HEX color string (e.g., "#RRGGBB").
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
 * Uses the HSP (Highly Sensitive Poo) equation to calculate perceived brightness.
 * @param hexColor - The hex color string (e.g., "#RRGGBB").
 * @returns "dark" if the color is dark (suggests light text), or "light" if the color is light (suggests dark text).
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
 * Gets initials from a name string.
 * Extracts the first letter of the first and last words if multiple words exist,
 * or the first two letters if only one word exists.
 * @param name - The full name string.
 * @returns Initials in uppercase (e.g., "JD", "J", "Jo"), or "?" if name is empty or invalid.
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

/**
 * Parses an unknown input into an array of type T.
 * - If the input is already an array, it returns it as is.
 * - If the input is a JSON string representing an array, it parses and returns the array.
 * - Otherwise, returns an empty array.
 * @template T - The type of elements in the returned array (default is string).
 * @param input - The input value to parse.
 * @returns An array of type T parsed from the input or an empty array if parsing fails.
 */
export function parseToArray<T = string>(input: unknown): T[] {
  if (Array.isArray(input)) {
    return input;
  }

  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}
