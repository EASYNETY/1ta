// lib/api-cache.ts
// A global cache mechanism for API responses to prevent repeated calls

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  status: number;
}

/**
 * Configuration options for the API cache
 */
interface ApiCacheConfig {
  /** Time-to-live in milliseconds (default: 60000 = 1 minute) */
  ttl: number;
  /** Maximum number of entries in the cache (default: 100) */
  maxEntries: number;
  /** Whether to cache error responses (default: true) */
  cacheErrors: boolean;
  /** Whether to log cache operations (default: false) */
  debug: boolean;
}

/**
 * Default configuration for the API cache
 */
const DEFAULT_CONFIG: ApiCacheConfig = {
  ttl: 60000, // 1 minute
  maxEntries: 100,
  cacheErrors: true,
  debug: false,
};

/**
 * A global cache for API responses
 */
class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private config: ApiCacheConfig;

  constructor(config: Partial<ApiCacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generates a cache key from a method and endpoint
   */
  private generateKey(method: string, endpoint: string, params?: Record<string, any>): string {
    let key = `${method.toUpperCase()}:${endpoint}`;
    if (params) {
      // Sort params to ensure consistent keys regardless of object property order
      const sortedParams = Object.keys(params).sort().reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);
      key += `:${JSON.stringify(sortedParams)}`;
    }
    return key;
  }

  /**
   * Gets a value from the cache
   * @returns The cached value, or undefined if not found or expired
   */
  get<T>(method: string, endpoint: string, params?: Record<string, any>): T | undefined {
    const key = this.generateKey(method, endpoint, params);
    const entry = this.cache.get(key);
    
    if (!entry) {
      if (this.config.debug) console.log(`[ApiCache] Cache miss: ${key}`);
      return undefined;
    }
    
    const now = Date.now();
    if (now - entry.timestamp > this.config.ttl) {
      if (this.config.debug) console.log(`[ApiCache] Cache expired: ${key}`);
      this.cache.delete(key);
      return undefined;
    }
    
    if (this.config.debug) console.log(`[ApiCache] Cache hit: ${key}`);
    return entry.data;
  }

  /**
   * Sets a value in the cache
   */
  set<T>(method: string, endpoint: string, data: T, status = 200, params?: Record<string, any>): void {
    // Don't cache error responses unless configured to do so
    if (status >= 400 && !this.config.cacheErrors) {
      return;
    }
    
    const key = this.generateKey(method, endpoint, params);
    
    // Enforce maximum cache size by removing oldest entries
    if (this.cache.size >= this.config.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      if (this.config.debug) console.log(`[ApiCache] Cache full, removed oldest entry: ${oldestKey}`);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      status,
    });
    
    if (this.config.debug) console.log(`[ApiCache] Cached: ${key}`);
  }

  /**
   * Clears the entire cache or entries matching a specific method and/or endpoint
   */
  clear(method?: string, endpoint?: string): void {
    if (!method && !endpoint) {
      if (this.config.debug) console.log('[ApiCache] Cleared entire cache');
      this.cache.clear();
      return;
    }
    
    const prefix = method ? `${method.toUpperCase()}:` : '';
    const endpointStr = endpoint || '';
    
    // Delete all entries that match the prefix and endpoint
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix) && (endpoint ? key.includes(endpointStr) : true)) {
        this.cache.delete(key);
        if (this.config.debug) console.log(`[ApiCache] Cleared: ${key}`);
      }
    }
  }

  /**
   * Updates the cache configuration
   */
  configure(config: Partial<ApiCacheConfig>): void {
    this.config = { ...this.config, ...config };
    if (this.config.debug) console.log('[ApiCache] Configuration updated:', this.config);
  }
}

// Export a singleton instance
export const apiCache = new ApiCache();

// Also export the class for testing or if multiple instances are needed
export { ApiCache };
