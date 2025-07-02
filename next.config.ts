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
	// Disable problematic features that might cause build issues
	swcMinify: false,
	poweredByHeader: false,
	// Simplified webpack config to avoid build issues
	webpack: (config: any) => {
		// Handle module resolution issues
		config.resolve.fallback = {
			...config.resolve.fallback,
			fs: false,
			net: false,
			tls: false,
		};

		return config;
	},

};

export default nextConfig;
