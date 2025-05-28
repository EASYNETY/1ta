// app/api/images/route.ts

"use server";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const imageUrl = searchParams.get("imageUrl");

	if (!imageUrl) {
		return NextResponse.json(
			{ error: "imageUrl query parameter is required and must be a string." },
			{ status: 400 }
		);
	}

	try {
		const targetUrl = new URL(imageUrl);

		const response = await fetch(targetUrl.toString());

		if (!response.ok) {
			return NextResponse.json(
				{
					error: `Failed to fetch image from target server: ${response.statusText}`,
				},
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
	} catch (error) {
		console.error("Image proxy handler error:", error);
		return NextResponse.json(
			{ error: "Internal server error while proxying image." },
			{ status: 500 }
		);
	}
}
