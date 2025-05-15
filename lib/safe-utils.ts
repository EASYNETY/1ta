// lib/safe-utils.ts
// Re-export from lib/utils/safe-data.ts for backward compatibility

/**
 * @deprecated This file is deprecated. Import from lib/utils/safe-data.ts instead.
 */

export {
  // Basic array function (original from this file)
  safeArray as ensureArray,

  // Array operations (original from this file)
  safeFilter,
  safeMap,
  safeLength,
  safeReduce,
  safeSort,
  safeIncludes,
  safeFind,
  safeAt,
  safeEvery,
  safeSome,

  // New functions from safe-data.ts
  safeArray,
  safeObject,
  safeString,
  safeNumber,
  safeBoolean,
  safeProperty,
  safeCall,
  createSafeArraySelector
} from './utils/safe-data';
