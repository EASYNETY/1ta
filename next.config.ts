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
		// Add memory safety for image processing
		minimumCacheTTL: 60,
		dangerouslyAllowSVG: true,
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},
	// Memory and performance optimizations
	experimental: {
		// Reduce memory usage during builds
		memoryBasedWorkerPoolSize: true,
		// Enable webpack memory optimizations
		webpackMemoryOptimizations: true,
	},
	// Webpack configuration for memory management
	webpack: (config, { dev, isServer }) => {
		// Memory optimizations
		config.optimization = {
			...config.optimization,
			// Reduce memory usage
			splitChunks: {
				...config.optimization.splitChunks,
				maxSize: 244000, // 244KB chunks
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

		// Reduce memory pressure in development
		if (dev) {
			config.watchOptions = {
				...config.watchOptions,
				ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
			};
		}

		return config;
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
