// lib/safe-api-client.ts
import { get, post, put, del, ApiError } from './api-client';
import { validateApiResponse, extractApiData } from './utils/safe-api';
import { safeObject } from './utils/safe-data';

/**
 * Type for API response validation
 */
export type ApiResponseValidator<T> = {
  [K in keyof T]?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | ((value: any) => boolean);
};

/**
 * Safe wrapper for the get function that validates the response
 * @param endpoint The API endpoint to call
 * @param validator Optional validator for the response
 * @param defaultValue Default value to return if validation fails
 * @returns The validated response
 */
export async function safeGet<T>(
  endpoint: string,
  validator?: ApiResponseValidator<T>,
  defaultValue?: T
): Promise<T> {
  try {
    const response = await get<any>(endpoint);
    
    if (!validator || !defaultValue) {
      return response as T;
    }
    
    return validateApiResponse(response, validator, defaultValue);
  } catch (error) {
    console.error(`Safe API Error (GET ${endpoint}):`, error);
    if (defaultValue) {
      return defaultValue;
    }
    throw error;
  }
}

/**
 * Safe wrapper for the post function that validates the response
 * @param endpoint The API endpoint to call
 * @param data The data to send
 * @param validator Optional validator for the response
 * @param defaultValue Default value to return if validation fails
 * @returns The validated response
 */
export async function safePost<T>(
  endpoint: string,
  data: any,
  validator?: ApiResponseValidator<T>,
  defaultValue?: T
): Promise<T> {
  try {
    const response = await post<any>(endpoint, data);
    
    if (!validator || !defaultValue) {
      return response as T;
    }
    
    return validateApiResponse(response, validator, defaultValue);
  } catch (error) {
    console.error(`Safe API Error (POST ${endpoint}):`, error);
    if (defaultValue) {
      return defaultValue;
    }
    throw error;
  }
}

/**
 * Safe wrapper for the put function that validates the response
 * @param endpoint The API endpoint to call
 * @param data The data to send
 * @param validator Optional validator for the response
 * @param defaultValue Default value to return if validation fails
 * @returns The validated response
 */
export async function safePut<T>(
  endpoint: string,
  data: any,
  validator?: ApiResponseValidator<T>,
  defaultValue?: T
): Promise<T> {
  try {
    const response = await put<any>(endpoint, data);
    
    if (!validator || !defaultValue) {
      return response as T;
    }
    
    return validateApiResponse(response, validator, defaultValue);
  } catch (error) {
    console.error(`Safe API Error (PUT ${endpoint}):`, error);
    if (defaultValue) {
      return defaultValue;
    }
    throw error;
  }
}

/**
 * Safe wrapper for the del function that validates the response
 * @param endpoint The API endpoint to call
 * @param validator Optional validator for the response
 * @param defaultValue Default value to return if validation fails
 * @returns The validated response
 */
export async function safeDel<T>(
  endpoint: string,
  validator?: ApiResponseValidator<T>,
  defaultValue?: T
): Promise<T> {
  try {
    const response = await del<any>(endpoint);
    
    if (!validator || !defaultValue) {
      return response as T;
    }
    
    return validateApiResponse(response, validator, defaultValue);
  } catch (error) {
    console.error(`Safe API Error (DELETE ${endpoint}):`, error);
    if (defaultValue) {
      return defaultValue;
    }
    throw error;
  }
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
 * // Define a default user
 * const defaultUser: User = { id: '', name: '', age: 0, isActive: false, roles: [], profile: {}, createdAt: new Date(), email: '' };
 * 
 * // Make a safe API call
 * const user = await safeGet<User>('/users/123', userValidator, defaultUser);
 */
