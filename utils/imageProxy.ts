const BASE_URL = "http://34.249.241.206:5000";

export function getProxiedImageUrl(imageUrl: string): string {
	// If it starts with "http://" or "https://", assume it's absolute
	const isAbsolute = /^https?:\/\//i.test(imageUrl);

	const fullUrl = isAbsolute ? imageUrl : `${BASE_URL}${imageUrl}`;
	return `/api/images?imageUrl=${encodeURIComponent(fullUrl)}`;
}
