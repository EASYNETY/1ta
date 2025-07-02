// app/api/images/route.ts

'use server';

import { NextRequest, NextResponse } from 'next/server';
import { Agent } from 'undici';

// In-memory cache to avoid retrying recently failed URLs
const failedUrlsCache = new Map<string, number>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Memory and load safety constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_CONCURRENT_REQUESTS = 5;
let activeRequests = 0;

// Insecure Agent (used to bypass certificate issues)
const insecureDispatcher = new Agent({
  connect: {
    rejectUnauthorized: false,
  },
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get('imageUrl');

  if (!imageUrl) {
    return NextResponse.json(
      { error: "The 'imageUrl' query parameter is required." },
      { status: 400 }
    );
  }

  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    console.warn(`[Image Proxy] Too many concurrent requests (${activeRequests}), returning placeholder`);
    return NextResponse.redirect(new URL('/placeholder.svg', req.url));
  }

  const now = Date.now();
  const lastFailTime = failedUrlsCache.get(imageUrl);
  if (lastFailTime && now - lastFailTime < CACHE_DURATION) {
    console.log(`[Image Proxy] Using cached placeholder for: ${imageUrl}`);
    return NextResponse.redirect(new URL('/placeholder.svg', req.url));
  }

  activeRequests++;

  try {
    console.log(`[Image Proxy] Attempting fetch (with insecure agent): ${imageUrl}`);

    const response = await fetch(imageUrl, {
      dispatcher: insecureDispatcher,
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const msg = `[Image Proxy] Initial fetch failed: ${response.status} ${response.statusText} for ${imageUrl}`;
      console.warn(msg);

      if (response.status >= 502 && response.status <= 504) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      throw new Error(`Initial fetch failed with status: ${response.status} ${response.statusText}`);
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
      throw new Error(`File too large: ${contentLength} bytes`);
    }

    failedUrlsCache.delete(imageUrl);
    const headers = new Headers(response.headers);
    return new NextResponse(response.body, { status: 200, headers });

  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;

    const isWrongVersionError = err.cause?.code === 'ERR_SSL_WRONG_VERSION_NUMBER';
    const isServerError = err.message.includes('Server error:');
    const isTimeoutError = err.name === 'TimeoutError' || err.message.includes('timeout');

    if ((isWrongVersionError || isServerError) && imageUrl.startsWith('https://')) {
      const httpUrl = imageUrl.replace('https://', 'http://');
      console.warn(`[Image Proxy] Retrying with HTTP for: ${httpUrl}`);

      try {
        const httpResponse = await fetch(httpUrl, {
          cache: 'no-store',
          signal: AbortSignal.timeout(10000),
        });

        if (!httpResponse.ok) {
          throw new Error(`HTTP retry failed: ${httpResponse.status} ${httpResponse.statusText}`);
        }

        const contentLength = httpResponse.headers.get('content-length');
        if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
          throw new Error(`HTTP retry file too large: ${contentLength} bytes`);
        }

        console.log(`[Image Proxy] HTTP retry succeeded: ${httpUrl}`);
        failedUrlsCache.delete(imageUrl);
        const headers = new Headers(httpResponse.headers);
        return new NextResponse(httpResponse.body, { status: 200, headers });

      } catch (retryError: unknown) {
        console.error(`[Image Proxy] HTTP retry failed:`, (retryError as Error).message);
        failedUrlsCache.set(imageUrl, now);
        return NextResponse.redirect(new URL('/placeholder.svg', req.url));
      }
    }

    if (isTimeoutError) {
      console.warn(`[Image Proxy] Timeout error for: ${imageUrl}`);
      failedUrlsCache.set(imageUrl, now);
      return NextResponse.redirect(new URL('/placeholder.svg', req.url));
    }

    console.error(`[Image Proxy] Unhandled error for ${imageUrl}:`, err.message);
    failedUrlsCache.set(imageUrl, now);
    return NextResponse.redirect(new URL('/placeholder.svg', req.url));

  } finally {
    activeRequests = Math.max(0, activeRequests - 1);
  }
}
