// lib/memory-utils.ts
/**
 * Memory management utilities to prevent memory leaks and crashes
 */

// Memory monitoring
export function getMemoryUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
    };
  }
  return null;
}

// Memory threshold checking
export function isMemoryUsageHigh(thresholdMB: number = 500): boolean {
  const usage = getMemoryUsage();
  if (!usage) return false;
  
  return usage.heapUsed > thresholdMB;
}

// Force garbage collection if available
export function forceGarbageCollection(): void {
  if (typeof global !== 'undefined' && global.gc) {
    try {
      global.gc();
      console.log('[Memory] Forced garbage collection');
    } catch (error) {
      console.warn('[Memory] Could not force garbage collection:', error);
    }
  }
}

// Memory-safe array buffer creation
export function createSafeArrayBuffer(size: number, maxSize: number = 50 * 1024 * 1024): ArrayBuffer | null {
  if (size > maxSize) {
    console.error(`[Memory] Attempted to create ArrayBuffer of ${size} bytes, exceeding limit of ${maxSize} bytes`);
    return null;
  }
  
  try {
    return new ArrayBuffer(size);
  } catch (error) {
    console.error(`[Memory] Failed to create ArrayBuffer of ${size} bytes:`, error);
    return null;
  }
}

// Memory-safe Uint8Array creation
export function createSafeUint8Array(size: number, maxSize: number = 50 * 1024 * 1024): Uint8Array | null {
  if (size > maxSize) {
    console.error(`[Memory] Attempted to create Uint8Array of ${size} bytes, exceeding limit of ${maxSize} bytes`);
    return null;
  }
  
  try {
    return new Uint8Array(size);
  } catch (error) {
    console.error(`[Memory] Failed to create Uint8Array of ${size} bytes:`, error);
    return null;
  }
}

// Memory monitoring middleware
export function logMemoryUsage(label: string = 'Memory Usage'): void {
  const usage = getMemoryUsage();
  if (usage) {
    console.log(`[${label}] RSS: ${usage.rss}MB, Heap: ${usage.heapUsed}/${usage.heapTotal}MB, External: ${usage.external}MB`);
    
    // Warn if memory usage is high
    if (usage.heapUsed > 400) {
      console.warn(`[${label}] High memory usage detected: ${usage.heapUsed}MB`);
    }
  }
}

// Cleanup function for large objects
export function safeCleanup(obj: any): void {
  try {
    if (obj && typeof obj === 'object') {
      // Clear arrays
      if (Array.isArray(obj)) {
        obj.length = 0;
      }
      
      // Clear object properties
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          delete obj[key];
        }
      }
    }
  } catch (error) {
    console.warn('[Memory] Error during cleanup:', error);
  }
}

// Stream processing helper to avoid loading large files into memory
export async function processStreamInChunks<T>(
  stream: ReadableStream<Uint8Array>,
  processor: (chunk: Uint8Array) => T | Promise<T>,
  maxChunkSize: number = 1024 * 1024 // 1MB chunks
): Promise<T[]> {
  const results: T[] = [];
  const reader = stream.getReader();
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      if (value && value.length > 0) {
        // Process in smaller chunks if needed
        if (value.length > maxChunkSize) {
          for (let i = 0; i < value.length; i += maxChunkSize) {
            const chunk = value.slice(i, i + maxChunkSize);
            const result = await processor(chunk);
            results.push(result);
          }
        } else {
          const result = await processor(value);
          results.push(result);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
  
  return results;
}

// Memory-safe image processing
export function isImageSizeSafe(width: number, height: number, bytesPerPixel: number = 4): boolean {
  const estimatedSize = width * height * bytesPerPixel;
  const maxSize = 100 * 1024 * 1024; // 100MB limit for images
  
  if (estimatedSize > maxSize) {
    console.warn(`[Memory] Image size too large: ${width}x${height} = ${Math.round(estimatedSize / 1024 / 1024)}MB`);
    return false;
  }
  
  return true;
}

// Global memory monitoring (call periodically)
export function startMemoryMonitoring(intervalMs: number = 30000): NodeJS.Timeout | null {
  if (typeof setInterval === 'undefined') return null;
  
  return setInterval(() => {
    const usage = getMemoryUsage();
    if (usage && usage.heapUsed > 500) {
      console.warn(`[Memory Monitor] High memory usage: ${usage.heapUsed}MB heap used`);
      
      if (usage.heapUsed > 800) {
        console.error(`[Memory Monitor] Critical memory usage: ${usage.heapUsed}MB - forcing GC`);
        forceGarbageCollection();
      }
    }
  }, intervalMs);
}
