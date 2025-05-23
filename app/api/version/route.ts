// app/api/version/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/version
 * Returns current app version information for update detection
 */
export async function GET(request: NextRequest) {
  try {
    // Get version from package.json
    const version = process.env.npm_package_version || '0.1.0';
    
    // Get build information
    const buildId = process.env.VERCEL_GIT_COMMIT_SHA || 
                   process.env.NEXT_PUBLIC_BUILD_ID || 
                   process.env.BUILD_ID ||
                   `local-${Date.now()}`;
    
    // Get build time (set during deployment)
    const buildTime = process.env.BUILD_TIME || 
                     process.env.VERCEL_GIT_COMMIT_DATE ||
                     new Date().toISOString();
    
    // Create a simple hash for change detection
    const versionHash = Buffer.from(`${version}-${buildId}`).toString('base64').slice(0, 12);
    
    const versionInfo = {
      version,
      buildId,
      buildTime,
      hash: versionHash,
      timestamp: Date.now(),
      environment: process.env.NODE_ENV || 'development'
    };
    
    return NextResponse.json({
      success: true,
      data: versionInfo
    });
  } catch (error) {
    console.error('Error getting version info:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get version information',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
