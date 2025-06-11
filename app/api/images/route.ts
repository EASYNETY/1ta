// app/api/images/route.ts

"use server";

import { NextRequest, NextResponse } from "next/server";
// Import the Agent class directly from 'undici', the engine that powers Node.js fetch
import { Agent } from "undici";

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
		});

		if (!response.ok) {
			// This creates an error that our catch block can inspect
			throw new Error(
				`Initial fetch failed with status: ${response.status} ${response.statusText}`
			);
		}

		// If successful, stream the response immediately
		const headers = new Headers(response.headers);
		return new NextResponse(response.body, { status: 200, headers });
	} catch (error: any) {
		// --- SMART ERROR HANDLING ---
		// Now we inspect the failure from the first attempt.
		const isWrongVersionError =
			error.cause?.code === "ERR_SSL_WRONG_VERSION_NUMBER";

		if (isWrongVersionError && imageUrl.startsWith("https://")) {
			console.warn(
				`[Image Proxy] SSL error detected. Retrying with HTTP for: ${imageUrl}`
			);

			// --- ATTEMPT 2: Retry with plain HTTP ---
			// This is our tool for the HTTP-only server (34.249.241.206)
			const httpUrl = imageUrl.replace("https://", "http://");

			try {
				// We don't need any special dispatcher for a plain http request
				const httpResponse = await fetch(httpUrl, { cache: "no-store" });

				if (!httpResponse.ok) {
					throw new Error(
						`HTTP retry also failed with status: ${httpResponse.status} ${httpResponse.statusText}`
					);
				}

				const headers = new Headers(httpResponse.headers);
				return new NextResponse(httpResponse.body, { status: 200, headers });
			} catch (retryError: any) {
				console.error(
					`[Image Proxy] The HTTP retry attempt also failed:`,
					retryError
				);
				return NextResponse.json(
					{ error: "Proxy failed on both HTTPS and HTTP attempts." },
					{ status: 502 }
				); // 502 Bad Gateway is appropriate
			}
		}

		// For all other errors that we don't have a special tool for.
		console.error(`[Image Proxy] An unhandled critical error occurred:`, error);
		return NextResponse.json(
			{
				error: "Internal server error while proxying image.",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
