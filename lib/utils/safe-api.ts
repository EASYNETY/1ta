// lib/utils/safe-api.ts
import { safeObject, safeArray, safeGet } from './safe-data';

/**
 * Type for API response validation
 */
export type ApiResponseValidator<T> = {
  [K in keyof T]?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | ((value: any) => boolean);
};

/**
 * Safely validates and transforms an API response
 * @param response The API response to validate
 * @param validator An object describing the expected shape of the response
 * @param defaultValue The default value to return if validation fails
 * @returns The validated response or the default value
 */
export function validateApiResponse<T>(
  response: any,
  validator: ApiResponseValidator<T>,
  defaultValue: T
): T {
  try {
    if (!response || typeof response !== 'object') {
      console.warn('API Response validation failed: Response is not an object', response);
      return defaultValue;
    }

    const result = { ...defaultValue } as any;

    // Check each field in the validator
    for (const [key, validationType] of Object.entries(validator)) {
      const value = response[key];

      // Skip undefined values
      if (value === undefined) continue;

      // Validate based on the expected type
      if (typeof validationType === 'function') {
        // Custom validator function
        if (validationType(value)) {
          result[key] = value;
        } else {
          console.warn(`API Response validation failed: Custom validation failed for field '${key}'`, value);
        }
      } else if (validationType === 'string') {
        result[key] = typeof value === 'string' ? value : String(value);
      } else if (validationType === 'number') {
        result[key] = typeof value === 'number' ? value : Number(value);
      } else if (validationType === 'boolean') {
        result[key] = Boolean(value);
      } else if (validationType === 'array') {
        result[key] = safeArray(value);
      } else if (validationType === 'object') {
        result[key] = safeObject(value);
      } else if (validationType === 'date') {
        result[key] = value instanceof Date ? value : new Date(value);
      }
    }

    return result as T;
  } catch (error) {
    console.error('API Response validation error:', error);
    return defaultValue;
  }
}

/**
 * Safely extracts data from an API response with a consistent structure
 * @param response The API response
 * @param dataPath The path to the data in the response (e.g., 'data.items')
 * @param defaultValue The default value to return if extraction fails
 * @returns The extracted data or the default value
 */
export function extractApiData<T>(
  response: any,
  dataPath: string,
  defaultValue: T
): T {
  return safeGet(response, dataPath, defaultValue);
}

/**
 * Example usage:
 * 
 * // Define the expected shape of a user
 * const userValidator: ApiResponseValidator<User> = {
 *   id: 'string',
 *   name: 'string',
 *   age: 'number',
 *   isActive: 'boolean',
 *   roles: 'array',
 *   profile: 'object',
 *   createdAt: 'date',
 *   email: (value) => typeof value === 'string' && value.includes('@')
 * };
 * 
 * // Validate an API response
 * const defaultUser: User = { id: '', name: '', age: 0, isActive: false, roles: [], profile: {}, createdAt: new Date(), email: '' };
 * const validatedUser = validateApiResponse(apiResponse, userValidator, defaultUser);
 */
