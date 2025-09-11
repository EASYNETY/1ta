# Simple App Update System

## Overview

We've implemented a simple, reliable app update detection system using established web platform patterns. This replaces complex custom solutions with battle-tested approaches that provide immediate code visibility in development and reliable update detection in production.

## How It Works

### 1. Server-Side Version Endpoint
- **`/api/version`** - Returns current app version info
- Uses build ID, version number, and deployment timestamp
- Reliable source of truth for current version

### 2. Automatic Detection Methods

#### **Chunk Error Detection (Primary)**
- Detects when Next.js chunks fail to load
- Most reliable indicator of new deployment
- Shows immediate toast notification with refresh option

#### **Periodic Version Checking (Secondary)**
- Checks server endpoint every 5 minutes
- Compares stored vs server version
- Only prompts when actual update detected

#### **Visibility-Based Checking (Tertiary)**
- Checks for updates when user returns to tab
- Catches updates user might have missed

### 3. User Experience
- **Non-intrusive**: Toast notifications instead of modal popups
- **Actionable**: One-click update with "Refresh Now" button
- **Preserves Auth**: All updates maintain user login
- **Smart Timing**: Checks when user is active, not during workflows

## Files Implemented

### Core System
- `app/api/version/route.ts` - Server version endpoint
- `lib/simple-version-checker.ts` - Client-side version checking
- `components/app/UpdateDetector.tsx` - Automatic detection component

### Enhanced Settings
- `features/settings/components/SettingsAppMaintenance.tsx` - Manual update checking

### Integration
- `app/layout.tsx` - UpdateDetector integration

## Settings Page Features

### 1. Check for Updates
- **Server-based**: Uses reliable version endpoint
- **Instant feedback**: Shows current version and update status
- **One-click update**: Handles cache clearing and reload

### 2. Manual Cache Options (Preserved)
- **Clear API Cache** - For stale API data
- **Update App** - Comprehensive cache clear
- **Clear App State** - Redux persist specific
- **Hard Refresh** - Nuclear option

## Environment Variables

\`\`\`bash
# Required for version detection
NEXT_PUBLIC_APP_VERSION=0.1.0
NEXT_PUBLIC_BUILD_ID=your-build-id
BUILD_TIME=2024-01-01T00:00:00Z

# Automatically set by deployment platforms
VERCEL_GIT_COMMIT_SHA=abc123
VERCEL_GIT_COMMIT_DATE=2024-01-01T00:00:00Z
\`\`\`

## Development vs Production

### Development Mode
- ✅ **No automatic prompts** - Won't interfere with hot reloading
- ✅ **Manual checking available** - Can test update system
- ✅ **Clean console** - Helpful debug messages
- ✅ **Hot reload works normally** - No interference

### Production Mode
- ✅ **Automatic detection** - Chunk errors and periodic checks
- ✅ **Smart prompting** - Only when updates actually available
- ✅ **Reliable detection** - Server-based version comparison
- ✅ **User-friendly** - Toast notifications with clear actions

## Deployment Integration

### Automatic Version Setting
Add to your deployment pipeline:

\`\`\`bash
# Set build time
export BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Set build ID (if not automatically set)
export NEXT_PUBLIC_BUILD_ID=$VERCEL_GIT_COMMIT_SHA

# Build and deploy
npm run build
\`\`\`

### Manual Version Updates
Update `package.json` version for major releases:
\`\`\`json
{
  "version": "0.2.0"
}
\`\`\`

## Benefits

### ✅ Reliability
- **Server-based detection** - No client-side guessing
- **Multiple detection methods** - Chunk errors + periodic checks
- **Battle-tested patterns** - Uses established web platform features

### ✅ User Experience
- **Non-disruptive** - Toast notifications, not modal popups
- **Clear actions** - "Refresh Now" button with immediate effect
- **Preserves state** - Maintains authentication and important data

### ✅ Developer Experience
- **No dev interference** - Disabled in development mode
- **Simple debugging** - Clear console messages and status
- **Easy maintenance** - Minimal custom code, leverages platform features

### ✅ Performance
- **Lightweight** - Minimal overhead and network requests
- **Smart timing** - Only checks when necessary
- **Efficient caching** - Rate-limited requests and smart storage

## Troubleshooting

### Update Not Detected?
1. Check if `NEXT_PUBLIC_BUILD_ID` is set correctly
2. Verify `/api/version` endpoint returns different data
3. Clear localStorage and try again

### Too Many Prompts?
1. Check rate limiting in `SimpleVersionChecker`
2. Verify development mode is properly detected
3. Adjust check intervals if needed

### Authentication Lost?
1. Verify auth preservation logic in `UpdateDetector`
2. Check Redux persist key handling
3. Ensure auth tokens are properly restored

## Summary

This simple system provides reliable update detection without the complexity and potential issues of custom solutions. It ensures:

- **Immediate code visibility** during development
- **Reliable update detection** in production
- **Minimal maintenance overhead** using platform features
- **Excellent user experience** with non-intrusive notifications

The solution is production-ready and follows established web platform patterns used by major applications.
