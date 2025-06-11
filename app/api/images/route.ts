// app/api/images/route.ts

"use server";

import { NextRequest, NextResponse } from "next/server";
// Import the Agent class directly from 'undici', the engine that powers Node.js fetch
import { Agent } from "undici";

// ==============================================================================
// DANGEROUS: This dispatcher disables all SSL/TLS certificate verification
// by telling the underlying 'undici' agent to ignore authorization errors.
// This is the correct way to disable this for modern Node.js fetch.
// DO NOT USE THIS IN A PRODUCTION ENVIRONMENT.
// ==============================================================================
const insecureDispatcher = new Agent({
	connect: {
		rejectUnauthorized: false,
	},
});

/**
 * GET /api/images
 * A proxy that fetches images while disabling SSL certificate verification.
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

	try {
		console.log(`[Image Proxy - INSECURE MODE] Fetching: ${imageUrl}`);

		const targetUrl = new URL(imageUrl);

		// We pass the custom undici Agent to the `dispatcher` property.
		// This is the correct and intended way to customize fetch behavior.
		const response = await fetch(targetUrl.toString(), {
			dispatcher: insecureDispatcher,
		});

		if (!response.ok) {
			console.error(
				`[Image Proxy] Failed to fetch. Status: ${response.status} ${response.statusText}`
			);
			return NextResponse.json(
				{ error: `Failed to fetch image from source: ${response.statusText}` },
				{ status: response.status }
			);
		}

		const headers = new Headers();
		const contentType = response.headers.get("content-type");
		const contentLength = response.headers.get("content-length");
		const cacheControl = response.headers.get("cache-control");

		if (contentType) headers.set("Content-Type", contentType);
		if (contentLength) headers.set("Content-Length", contentLength);
		headers.set("Cache-Control", cacheControl ?? "public, max-age=3600");

		return new NextResponse(response.body, {
			status: response.status,
			headers,
		});
	} catch (error: any) {
		console.error(
			`[Image Proxy] A critical error occurred. Full error:`,
			error
		);
		return NextResponse.json(
			{
				error: "Internal server error while proxying image.",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
