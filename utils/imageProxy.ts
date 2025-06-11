// utils/imageproxy.ts

// Define the base URL for your API.
// Always prefer HTTPS here. The server-side proxy will handle any issues.
const BASE_URL = "https://api.onetechacademy.com";

/**
 * Generates a proxied image URL via the local `/api/images` route.
 * This function ensures all image requests are funneled through your Next.js server.
 *
 * It correctly handles both relative and absolute image URLs:
 * - Relative paths (e.g., "/courseTB/image.jpg") are prefixed with the BASE_URL.
 * - Absolute URLs are upgraded to HTTPS to prefer secure connections.
 *
 * The final URL is properly encoded to be safely used in a query parameter.
 *
 * @param {string | undefined | null} imageUrl - The relative or absolute path to the original image.
 * @returns {string} - A URL safe to use in an <Image> component,
 *                   e.g., "/api/images?imageUrl=https%3A%2F%2Fapi.onetechacademy.com%2F...".
 *                   Returns a placeholder if the input is invalid.
 */
export function getProxiedImageUrl(
	imageUrl: string | undefined | null
): string {
	// If the imageUrl is null, undefined, or an empty string, return a placeholder.
	if (!imageUrl) {
		return "/images/placeholder.svg"; // Adjust path to your placeholder image
	}

	// Check if the URL is already absolute (starts with http:// or https://)
	const isAbsolute = /^https?:\/\//i.test(imageUrl);

	let fullUrl: string;

	if (isAbsolute) {
		// If the URL is absolute, force it to use HTTPS.
		// The API route will handle cases where the server doesn't support it.
		fullUrl = imageUrl.replace(/^http:\/\//i, "https://");
	} else {
		// If the URL is relative, prepend our BASE_URL.
		fullUrl = `${BASE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
	}

	// Construct the final proxy URL, ensuring the target URL is safely encoded.
	return `/api/images?imageUrl=${encodeURIComponent(fullUrl)}`;
}
