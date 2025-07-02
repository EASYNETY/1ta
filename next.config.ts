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
		minimumCacheTTL: 60,
		dangerouslyAllowSVG: true,
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},
	experimental: {
		// Only use valid experimental options here
		webpackMemoryOptimizations: true,
	},
	webpack: (config, { dev, isServer }) => {
		config.optimization = {
			...config.optimization,
			splitChunks: {
				...config.optimization.splitChunks,
				maxSize: 244000,
				cacheGroups: {
					...config.optimization.splitChunks?.cacheGroups,
					default: {
						minChunks: 2,
						priority: -20,
						reuseExistingChunk: true,
						maxSize: 244000,
					},
				},
			},
		};

		if (dev) {
			config.watchOptions = {
				...config.watchOptions,
				ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
			};
		}

		return config;
	},
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
