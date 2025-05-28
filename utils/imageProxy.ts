export function getProxiedImageUrl(imageUrl: string): string {
    return `/api/images?imageUrl=${encodeURIComponent(imageUrl)}`;
}
