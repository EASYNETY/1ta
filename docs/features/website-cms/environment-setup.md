# Website CMS Environment Configuration

## Environment Variables

### Required Variables

```bash
# Feature Control
WEBSITE_CMS_ENABLED=false          # Enable/disable CMS functionality
WEBSITE_CMS_TIER=premium           # Feature tier requirement
WEBSITE_CMS_DEBUG=false            # Enable debug mode for development

# API Configuration
WEBSITE_CMS_API_BASE_URL=/api/website  # Base URL for CMS API endpoints
WEBSITE_CMS_UPLOAD_MAX_SIZE=10485760   # Max upload size in bytes (10MB)
WEBSITE_CMS_ALLOWED_TYPES=image/jpeg,image/png,image/webp,video/mp4,application/pdf

# Cache Configuration
WEBSITE_CMS_CACHE_TTL=3600         # Cache time-to-live in seconds
WEBSITE_CMS_ENABLE_CACHE=true     # Enable/disable caching
```

### Development Environment (.env.local)

```bash
# Development settings
WEBSITE_CMS_ENABLED=true
WEBSITE_CMS_TIER=premium
WEBSITE_CMS_DEBUG=true
WEBSITE_CMS_MOCK_DATA=true         # Use mock data instead of real API
WEBSITE_CMS_CACHE_TTL=60           # Shorter cache for development
```

### Production Environment (.env.production)

```bash
# Production settings
WEBSITE_CMS_ENABLED=false          # Disabled by default
WEBSITE_CMS_TIER=premium
WEBSITE_CMS_DEBUG=false
WEBSITE_CMS_MOCK_DATA=false
WEBSITE_CMS_CACHE_TTL=3600
```

### Staging Environment (.env.staging)

```bash
# Staging settings
WEBSITE_CMS_ENABLED=true
WEBSITE_CMS_TIER=premium
WEBSITE_CMS_DEBUG=true
WEBSITE_CMS_MOCK_DATA=true         # Use mock data for testing
WEBSITE_CMS_CACHE_TTL=300
```

## Feature Flag Implementation

### Environment Utility

```typescript
// lib/env/website-cms.ts
export const websiteCMSConfig = {
  enabled: process.env.WEBSITE_CMS_ENABLED === 'true',
  tier: process.env.WEBSITE_CMS_TIER || 'premium',
  debug: process.env.WEBSITE_CMS_DEBUG === 'true',
  mockData: process.env.WEBSITE_CMS_MOCK_DATA === 'true',
  apiBaseUrl: process.env.WEBSITE_CMS_API_BASE_URL || '/api/website',
  uploadMaxSize: parseInt(process.env.WEBSITE_CMS_UPLOAD_MAX_SIZE || '10485760'),
  allowedTypes: process.env.WEBSITE_CMS_ALLOWED_TYPES?.split(',') || [
    'image/jpeg',
    'image/png', 
    'image/webp',
    'video/mp4',
    'application/pdf'
  ],
  cache: {
    enabled: process.env.WEBSITE_CMS_ENABLE_CACHE === 'true',
    ttl: parseInt(process.env.WEBSITE_CMS_CACHE_TTL || '3600')
  }
}

export const isCMSEnabled = () => websiteCMSConfig.enabled
export const isCMSDebugMode = () => websiteCMSConfig.debug
export const shouldUseMockData = () => websiteCMSConfig.mockData
```

### Feature Gate Component

```typescript
// components/feature-gates/cms-feature-gate.tsx
interface CMSFeatureGateProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requiresTier?: 'basic' | 'premium'
}

export function CMSFeatureGate({ 
  children, 
  fallback, 
  requiresTier = 'premium' 
}: CMSFeatureGateProps) {
  const isEnabled = isCMSEnabled()
  const hasRequiredTier = checkUserTier(requiresTier)
  
  if (!isEnabled || !hasRequiredTier) {
    return fallback || <CMSDisabledNotice />
  }
  
  return <>{children}</>
}
```

## Configuration Validation

### Environment Validation Schema

```typescript
// lib/validation/env-schema.ts
import { z } from 'zod'

export const websiteCMSEnvSchema = z.object({
  WEBSITE_CMS_ENABLED: z.enum(['true', 'false']).default('false'),
  WEBSITE_CMS_TIER: z.enum(['basic', 'premium']).default('premium'),
  WEBSITE_CMS_DEBUG: z.enum(['true', 'false']).default('false'),
  WEBSITE_CMS_MOCK_DATA: z.enum(['true', 'false']).default('false'),
  WEBSITE_CMS_API_BASE_URL: z.string().default('/api/website'),
  WEBSITE_CMS_UPLOAD_MAX_SIZE: z.string().regex(/^\d+$/).default('10485760'),
  WEBSITE_CMS_ALLOWED_TYPES: z.string().default('image/jpeg,image/png,image/webp,video/mp4,application/pdf'),
  WEBSITE_CMS_CACHE_TTL: z.string().regex(/^\d+$/).default('3600'),
  WEBSITE_CMS_ENABLE_CACHE: z.enum(['true', 'false']).default('true')
})

export function validateCMSEnvironment() {
  try {
    return websiteCMSEnvSchema.parse(process.env)
  } catch (error) {
    console.error('Invalid CMS environment configuration:', error)
    throw new Error('CMS environment validation failed')
  }
}
```

## Feature Availability Checks

### User Tier Validation

```typescript
// lib/auth/tier-check.ts
export function checkUserTier(requiredTier: 'basic' | 'premium'): boolean {
  // This would integrate with your existing user/subscription system
  const userTier = getCurrentUserTier()
  
  const tierHierarchy = {
    basic: 1,
    premium: 2
  }
  
  return tierHierarchy[userTier] >= tierHierarchy[requiredTier]
}

export function getCurrentUserTier(): 'basic' | 'premium' {
  // Implementation depends on your subscription system
  // For now, return premium for admins
  return 'premium'
}
```

### Runtime Feature Checks

```typescript
// hooks/use-cms-availability.ts
export function useCMSAvailability() {
  const isEnabled = isCMSEnabled()
  const hasAccess = checkUserTier('premium')
  const isAdmin = useIsAdmin() // Your existing admin check
  
  return {
    isAvailable: isEnabled && hasAccess && isAdmin,
    isEnabled,
    hasAccess,
    isAdmin,
    reason: !isEnabled ? 'disabled' : 
            !hasAccess ? 'tier' : 
            !isAdmin ? 'permission' : 'available'
  }
}
```

## Deployment Configuration

### Docker Environment

```dockerfile
# Dockerfile environment args
ARG WEBSITE_CMS_ENABLED=false
ARG WEBSITE_CMS_TIER=premium
ARG WEBSITE_CMS_DEBUG=false

ENV WEBSITE_CMS_ENABLED=$WEBSITE_CMS_ENABLED
ENV WEBSITE_CMS_TIER=$WEBSITE_CMS_TIER
ENV WEBSITE_CMS_DEBUG=$WEBSITE_CMS_DEBUG
```

### Kubernetes ConfigMap

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: website-cms-config
data:
  WEBSITE_CMS_ENABLED: "false"
  WEBSITE_CMS_TIER: "premium"
  WEBSITE_CMS_DEBUG: "false"
  WEBSITE_CMS_CACHE_TTL: "3600"
```

### Vercel Environment

```bash
# Vercel environment variables
vercel env add WEBSITE_CMS_ENABLED false production
vercel env add WEBSITE_CMS_TIER premium production
vercel env add WEBSITE_CMS_DEBUG false production
```

## Monitoring & Logging

### Feature Usage Tracking

```typescript
// lib/analytics/cms-tracking.ts
export function trackCMSFeatureUsage(feature: string, action: string) {
  if (isCMSDebugMode()) {
    console.log(`CMS Feature: ${feature} - Action: ${action}`)
  }
  
  // Send to your analytics service
  analytics.track('cms_feature_used', {
    feature,
    action,
    timestamp: new Date().toISOString(),
    enabled: isCMSEnabled()
  })
}
```

### Error Reporting

```typescript
// lib/error/cms-error-handler.ts
export function handleCMSError(error: Error, context: string) {
  const errorData = {
    message: error.message,
    context,
    cmsEnabled: isCMSEnabled(),
    debugMode: isCMSDebugMode(),
    timestamp: new Date().toISOString()
  }
  
  if (isCMSDebugMode()) {
    console.error('CMS Error:', errorData)
  }
  
  // Send to error reporting service
  errorReporting.captureException(error, { extra: errorData })
}
```

## Security Considerations

### Environment Variable Security

1. **Sensitive Data**: Never store sensitive data in environment variables
2. **Access Control**: Limit who can modify production environment variables
3. **Rotation**: Regularly rotate any secrets used by the CMS
4. **Validation**: Always validate environment variables at startup

### Feature Flag Security

1. **Authorization**: Check user permissions before enabling features
2. **Audit Logging**: Log all feature flag changes
3. **Rate Limiting**: Implement rate limiting for CMS operations
4. **Input Validation**: Validate all inputs even when features are disabled

## Troubleshooting

### Common Issues

1. **CMS Not Available**: Check `WEBSITE_CMS_ENABLED` environment variable
2. **Permission Denied**: Verify user tier and admin status
3. **Upload Failures**: Check file size and type restrictions
4. **Cache Issues**: Verify cache configuration and TTL settings

### Debug Mode

When `WEBSITE_CMS_DEBUG=true`:
- Additional logging is enabled
- Error details are more verbose
- Feature availability is logged
- API responses include debug information

### Health Checks

```typescript
// api/website/health/route.ts
export async function GET() {
  const health = {
    cmsEnabled: isCMSEnabled(),
    debugMode: isCMSDebugMode(),
    mockData: shouldUseMockData(),
    timestamp: new Date().toISOString()
  }
  
  return Response.json(health)
}
```
