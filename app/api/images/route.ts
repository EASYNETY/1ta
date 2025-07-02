// app/api/images/route.ts

"use server";

import { NextRequest, NextResponse } from "next/server";
// Import the Agent class directly from 'undici', the engine that powers Node.js fetch
import { Agent } from "undici";

// Simple in-memory cache to prevent repeated failed requests
const failedUrlsCache = new Map<string, number>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Memory safety constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit
const MAX_CONCURRENT_REQUESTS = 5;
let activeRequests = 0;

// Agent 1: The insecure agent for servers with bad certificates (like api.onetechacademy.com)
// This dispatcher will be used for our first attempt to handle the UNABLE_TO_VERIFY_LEAF_SIGNATURE error.
const insecureDispatcher = new Agent({
	connect: {
		rejectUnauthorized: false,
	},
});

/**
 * GET /api/images
 * A robust proxy that handles two types of server errors:
 * 1. Servers with incomplete SSL certificate chains (UNABLE_TO_VERIFY_LEAF_SIGNATURE).
 * 2. Servers running plain HTTP on an HTTPS port (ERR_SSL_WRONG_VERSION_NUMBER).
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
	const { searchParams } = new URL(req.url);
	const imageUrl = searchParams.get("imageUrl");

	if (!imageUrl) {
		return NextResponse.json(
			{ error: "The 'imageUrl' query parameter is required." },
			{ status: 400 }
		);
	}

	// Rate limiting check
	if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
		console.warn(`[Image Proxy] Too many concurrent requests (${activeRequests}), returning placeholder`);
		return NextResponse.redirect(new URL('/placeholder.svg', req.url));
	}

	// Check if this URL has failed recently
	const now = Date.now();
	const lastFailTime = failedUrlsCache.get(imageUrl);
	if (lastFailTime && (now - lastFailTime) < CACHE_DURATION) {
		console.log(`[Image Proxy] Returning cached placeholder for recently failed URL: ${imageUrl}`);
		return NextResponse.redirect(new URL('/placeholder.svg', req.url));
	}

	// Increment active requests counter
	activeRequests++;

	try {
		console.log(
			`[Image Proxy] First attempt (secure with insecure agent): ${imageUrl}`
		);

		// --- ATTEMPT 1: Secure fetch with certificate bypass ---
		// This will work for api.onetechacademy.com
		// It will fail for 34.249.241.206 with ERR_SSL_WRONG_VERSION_NUMBER
		const response = await fetch(imageUrl, {
			dispatcher: insecureDispatcher,
			cache: "no-store",
			signal: AbortSignal.timeout(10000), // 10 second timeout
		});

		if (!response.ok) {
			// Log the specific error for debugging
			console.warn(`[Image Proxy] Initial fetch failed: ${response.status} ${response.statusText} for ${imageUrl}`);

			// For 502/503/504 errors, try fallback immediately
			if (response.status >= 502 && response.status <= 504) {
				throw new Error(`Server error: ${response.status} ${response.statusText}`);
			}

			// This creates an error that our catch block can inspect
			throw new Error(
				`Initial fetch failed with status: ${response.status} ${response.statusText}`
			);
		}

		// Check content length to prevent memory issues
		const contentLength = response.headers.get('content-length');
		if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
			console.warn(`[Image Proxy] File too large: ${contentLength} bytes for ${imageUrl}`);
			throw new Error(`File too large: ${contentLength} bytes`);
		}

		// If successful, stream the response immediately
		// Remove from failed cache if it was there
		failedUrlsCache.delete(imageUrl);
		const headers = new Headers(response.headers);
		return new NextResponse(response.body, { status: 200, headers });
	} catch (error: any) {
		// --- SMART ERROR HANDLING ---
		// Now we inspect the failure from the first attempt.
		const isWrongVersionError =
			error.cause?.code === "ERR_SSL_WRONG_VERSION_NUMBER";
		const isServerError = error.message.includes("Server error:");
		const isTimeoutError = error.name === "TimeoutError" || error.message.includes("timeout");

		// Try HTTP fallback for SSL errors or server errors
		if ((isWrongVersionError || isServerError) && imageUrl.startsWith("https://")) {
			console.warn(
				`[Image Proxy] ${isServerError ? 'Server error' : 'SSL error'} detected. Retrying with HTTP for: ${imageUrl}`
			);

			// --- ATTEMPT 2: Retry with plain HTTP ---
			// This is our tool for the HTTP-only server (34.249.241.206)
			const httpUrl = imageUrl.replace("https://", "http://");

			try {
				// We don't need any special dispatcher for a plain http request
				const httpResponse = await fetch(httpUrl, {
					cache: "no-store",
					signal: AbortSignal.timeout(10000) // 10 second timeout
				});

				if (!httpResponse.ok) {
					console.warn(`[Image Proxy] HTTP retry failed: ${httpResponse.status} ${httpResponse.statusText} for ${httpUrl}`);
					throw new Error(
						`HTTP retry also failed with status: ${httpResponse.status} ${httpResponse.statusText}`
					);
				}

				// Check content length for HTTP retry too
				const contentLength = httpResponse.headers.get('content-length');
				if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
					console.warn(`[Image Proxy] HTTP retry file too large: ${contentLength} bytes for ${httpUrl}`);
					throw new Error(`File too large: ${contentLength} bytes`);
				}

				console.log(`[Image Proxy] HTTP retry successful for: ${httpUrl}`);
				// Remove from failed cache if it was there
				failedUrlsCache.delete(imageUrl);
				const headers = new Headers(httpResponse.headers);
				return new NextResponse(httpResponse.body, { status: 200, headers });
			} catch (retryError: any) {
				console.error(
					`[Image Proxy] The HTTP retry attempt also failed:`,
					retryError.message
				);

				// Cache this failed URL
				failedUrlsCache.set(imageUrl, now);

				// Return a placeholder image instead of error
				return NextResponse.redirect(new URL('/placeholder.svg', req.url));
			}
		}

		// For timeout errors, return placeholder immediately
		if (isTimeoutError) {
			console.warn(`[Image Proxy] Timeout error for: ${imageUrl}, returning placeholder`);
			failedUrlsCache.set(imageUrl, now);
			return NextResponse.redirect(new URL('/placeholder.svg', req.url));
		}

		// For all other errors that we don't have a special tool for.
		console.error(`[Image Proxy] An unhandled critical error occurred:`, error.message);

		// Cache this failed URL
		failedUrlsCache.set(imageUrl, now);

		// Instead of returning an error, redirect to placeholder image
		console.log(`[Image Proxy] Returning placeholder for failed image: ${imageUrl}`);
		return NextResponse.redirect(new URL('/placeholder.svg', req.url));
	}
} finally {
	// Always decrement the active requests counter
	activeRequests = Math.max(0, activeRequests - 1);
}
}
