// lib/rate-limiter.ts
// Rate limiting utility to prevent API abuse and handle 429 errors gracefully

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  retryAfterMs?: number;
}

interface RequestRecord {
  timestamp: number;
  endpoint: string;
}

class RateLimiter {
  private requests: Map<string, RequestRecord[]> = new Map();
  private config: RateLimitConfig;
  private globalCooldown: number = 0;

  constructor(config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }) {
    this.config = config;
  }

  /**
   * Check if a request is allowed for a specific endpoint
   */
  isAllowed(endpoint: string): boolean {
    // Check global cooldown first
    if (Date.now() < this.globalCooldown) {
      return false;
    }

    const now = Date.now();
    const key = this.getKey(endpoint);
    const requests = this.requests.get(key) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter(
      req => now - req.timestamp < this.config.windowMs
    );

    // Update the requests array
    this.requests.set(key, validRequests);

    // Check if we're under the limit
    return validRequests.length < this.config.maxRequests;
  }

  /**
   * Record a successful request
   */
  recordRequest(endpoint: string): void {
    const now = Date.now();
    const key = this.getKey(endpoint);
    const requests = this.requests.get(key) || [];

    requests.push({
      timestamp: now,
      endpoint
    });

    this.requests.set(key, requests);
  }

  /**
   * Handle a 429 rate limit response
   */
  handleRateLimit(endpoint: string, retryAfterSeconds?: number): void {
    const retryAfterMs = retryAfterSeconds 
      ? retryAfterSeconds * 1000 
      : this.config.retryAfterMs || 30000; // Default 30 seconds

    // Set global cooldown
    this.globalCooldown = Date.now() + retryAfterMs;

    console.warn(`Rate limit hit for ${endpoint}. Cooling down for ${retryAfterMs}ms`);
  }

  /**
   * Get the time until the next request is allowed
   */
  getTimeUntilAllowed(endpoint: string): number {
    // Check global cooldown first
    const globalWait = Math.max(0, this.globalCooldown - Date.now());
    if (globalWait > 0) {
      return globalWait;
    }

    const now = Date.now();
    const key = this.getKey(endpoint);
    const requests = this.requests.get(key) || [];

    if (requests.length < this.config.maxRequests) {
      return 0;
    }

    // Find the oldest request in the current window
    const oldestRequest = requests.reduce((oldest, req) => 
      req.timestamp < oldest.timestamp ? req : oldest
    );

    const timeUntilWindowReset = this.config.windowMs - (now - oldestRequest.timestamp);
    return Math.max(0, timeUntilWindowReset);
  }

  /**
   * Wait until a request is allowed
   */
  async waitUntilAllowed(endpoint: string): Promise<void> {
    const waitTime = this.getTimeUntilAllowed(endpoint);
    if (waitTime > 0) {
      console.log(`Rate limiter: Waiting ${waitTime}ms before allowing request to ${endpoint}`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  /**
   * Get cache key for endpoint
   */
  private getKey(endpoint: string): string {
    // Group similar endpoints together (e.g., /courses/123 -> /courses/:id)
    return endpoint.replace(/\/\d+/g, '/:id').replace(/\?.*$/, '');
  }

  /**
   * Clear all rate limit data (useful for testing or reset)
   */
  clear(): void {
    this.requests.clear();
    this.globalCooldown = 0;
  }

  /**
   * Get current status for debugging
   */
  getStatus(): { 
    globalCooldown: number; 
    endpointCounts: Record<string, number>;
    timeUntilGlobalReset: number;
  } {
    const now = Date.now();
    const endpointCounts: Record<string, number> = {};

    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(
        req => now - req.timestamp < this.config.windowMs
      );
      endpointCounts[key] = validRequests.length;
    }

    return {
      globalCooldown: this.globalCooldown,
      endpointCounts,
      timeUntilGlobalReset: Math.max(0, this.globalCooldown - now)
    };
  }
}

// Create a global rate limiter instance
export const apiRateLimiter = new RateLimiter({
  maxRequests: 15, // Allow 15 requests per minute per endpoint
  windowMs: 60000, // 1 minute window
  retryAfterMs: 30000 // Default 30 second cooldown on 429
});

// Export the class for custom instances
export { RateLimiter };

// Utility function to create a delay with exponential backoff
export function createBackoffDelay(attempt: number, baseDelay: number = 1000, maxDelay: number = 30000): number {
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const jitter = Math.random() * 0.1 * exponentialDelay; // Add 10% jitter
  return Math.floor(exponentialDelay + jitter);
}

// Utility function to check if an error is a rate limit error
export function isRateLimitError(error: any): boolean {
  if (error?.status === 429) return true;
  if (error?.message?.includes('429')) return true;
  if (error?.message?.includes('Too Many Requests')) return true;
  if (error?.message?.includes('Rate limit')) return true;
  return false;
}
