const BASE_URL = "https://api.onetechacademy.com";

/**
 * Generates a proxied image URL via the `/api/images` route.
 * If the input image URL is relative (e.g. starts with `/courseTB/...`),
 * it prepends the BASE_URL to construct the full path.
 * Absolute URLs (starting with http:// or https://) are passed through as-is.
 *
 * @param {string} imageUrl - The relative or absolute image path to proxy.
 * @returns {string} - A URL like `/api/images?imageUrl=<encoded full URL>` for safe Next.js Image usage.
 *
 * @example
 * getProxiedImageUrl("/courseTB/image.jpg")
 * // returns "/api/images?imageUrl=http%3A%2F%2F34.249.241.206%3A5000%2FcourseTB%2Fimage.jpg"
 *
 * getProxiedImageUrl("http://example.com/image.jpg")
 * // returns "/api/images?imageUrl=http%3A%2F%2Fexample.com%2Fimage.jpg"
 */
export function getProxiedImageUrl(imageUrl: string): string {
	if (!imageUrl) return "/placeholder.svg";
	// Check if the URL is absolute (starts with http:// or https://)
	const isAbsolute = /^https?:\/\//i.test(imageUrl);

	let fullUrl: string;
	if (isAbsolute) {
		// Force upgrade http to https for absolute URLs
		fullUrl = imageUrl.replace(/^http:\/\//i, "https://");
	} else {
		// If it's relative, prepend the BASE_URL (which is already https)
		fullUrl = `${BASE_URL}${imageUrl}`;
	}

	// Return the proxy URL with the full image URL safely encoded
	return `/api/images?imageUrl=${encodeURIComponent(fullUrl)}`;
}
