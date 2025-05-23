/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		unoptimized: true,
		domains: ["images.unsplash.com"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
		],
	},
	// Add cache control headers for development
	async headers() {
		if (process.env.NODE_ENV === 'development') {
			return [
				{
					source: '/(.*)',
					headers: [
						{
							key: 'Cache-Control',
							value: 'no-cache, no-store, must-revalidate',
						},
						{
							key: 'Pragma',
							value: 'no-cache',
						},
						{
							key: 'Expires',
							value: '0',
						},
					],
				},
			];
		}
		return [];
	},
};

export default nextConfig;
