import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('imageUrl');

    if (!imageUrl) {
        return NextResponse.json({ error: 'imageUrl query parameter is required and must be a string.' }, { status: 400 });
    }

    try {
        const targetUrl = new URL(imageUrl);

        const allowedHostname = "34.249.241.206";
        const allowedPort: string = "5000";

        if (targetUrl.hostname !== allowedHostname || (targetUrl.port && targetUrl.port !== allowedPort)) {
            if (targetUrl.hostname === allowedHostname && !targetUrl.port && allowedPort === (targetUrl.protocol === 'https:' ? '443' : '80')) {
                // Allowed default port
            } else {
                return NextResponse.json({ error: `Proxying from hostname ${targetUrl.hostname}:${targetUrl.port || 'default'} is not allowed.` }, { status: 403 });
            }
        }

        const response = await fetch(targetUrl.toString());

        if (!response.ok) {
            return NextResponse.json({ error: `Failed to fetch image from target server: ${response.statusText}` }, { status: response.status });
        }

        const headers = new Headers();
        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');
        const cacheControl = response.headers.get('cache-control');

        if (contentType) headers.set('Content-Type', contentType);
        if (contentLength) headers.set('Content-Length', contentLength);
        if (cacheControl) {
            headers.set('Cache-Control', cacheControl);
        } else {
            headers.set('Cache-Control', 'public, max-age=3600');
        }

        return new NextResponse(response.body, {
            status: response.status,
            headers,
        });

    } catch (error) {
        console.error('Image proxy handler error:', error);
        if (error instanceof TypeError && error.message.includes('Invalid URL')) {
            return NextResponse.json({ error: 'Invalid imageUrl format.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error while proxying image.' }, { status: 500 });
    }
}
