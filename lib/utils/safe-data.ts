/**
 * Utility functions for safely handling potentially undefined/null data
 *
 * This file consolidates functionality from the previous lib/safe-utils.ts and lib/utils/safe-data.ts
 * to provide a comprehensive set of utilities for safely handling various data types.
 */

import { createSelector } from '@reduxjs/toolkit';

// ===== BASIC TYPE SAFETY FUNCTIONS =====

/**
 * Safely returns an array, ensuring it's never undefined or null
 * @param array The array to check
 * @returns The original array if it exists, or an empty array
 */
export function safeArray<T>(array: T[] | null | undefined): T[] {
  return Array.isArray(array) ? array : [];
}

/**
 * Safely returns an object, ensuring it's never undefined or null
 * @param obj The object to check
 * @returns The original object if it exists, or an empty object
 */
export function safeObject<T extends object>(obj: T | null | undefined): T {
  return (obj && typeof obj === 'object') ? obj : {} as T;
}

/**
 * Safely returns a string, ensuring it's never undefined or null
 * @param str The string to check
 * @param defaultValue Optional default value (defaults to empty string)
 * @returns The original string if it exists, or the default value
 */
export function safeString(str: string | null | undefined, defaultValue: string = ''): string {
  return (str !== null && str !== undefined) ? String(str) : defaultValue;
}

/**
 * Safely returns a number, ensuring it's never undefined or null
 * @param num The number to check
 * @param defaultValue Optional default value (defaults to 0)
 * @returns The original number if it exists and is a number, or the default value
 */
export function safeNumber(num: number | null | undefined, defaultValue: number = 0): number {
  return (num !== null && num !== undefined && !isNaN(Number(num))) ? Number(num) : defaultValue;
}

/**
 * Safely returns a boolean, ensuring it's never undefined or null
 * @param bool The boolean to check
 * @param defaultValue Optional default value (defaults to false)
 * @returns The original boolean if it exists, or the default value
 */
export function safeBoolean(bool: boolean | null | undefined, defaultValue: boolean = false): boolean {
  return bool === true ? true : bool === false ? false : defaultValue;
}

/**
 * Safely accesses a property of an object, handling null/undefined objects
 * @param obj The object to access
 * @param key The property key to access
 * @param defaultValue Optional default value if property doesn't exist
 * @returns The property value if it exists, or the default value
 */
export function safeProperty<T extends object, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  defaultValue: T[K] | null = null
): T[K] | null {
  return (obj && typeof obj === 'object' && key in obj) ? obj[key] : defaultValue;
}

/**
 * Safely calls a function, handling null/undefined functions
 * @param fn The function to call
 * @param args Arguments to pass to the function
 * @returns The result of the function call, or undefined if function is null/undefined
 */
export function safeCall<T, Args extends any[]>(
  fn: ((...args: Args) => T) | null | undefined,
  ...args: Args
): T | undefined {
  return typeof fn === 'function' ? fn(...args) : undefined;
}

// ===== ARRAY OPERATIONS =====

/**
 * Safely filters an array, handling the case where the input might not be an array
 * @param array The array to filter
 * @param predicate The filter function
 * @returns The filtered array, or an empty array if input is not an array
 */
export function safeFilter<T>(array: T[] | null | undefined, predicate: (value: T) => boolean): T[] {
  return safeArray(array).filter(predicate);
}

/**
 * Safely maps an array, handling the case where the input might not be an array
 * @param array The array to map
 * @param mapper The mapping function
 * @returns The mapped array, or an empty array if input is not an array
 */
export function safeMap<T, U>(array: T[] | null | undefined, mapper: (value: T) => U): U[] {
  return safeArray(array).map(mapper);
}

/**
 * Safely gets the length of an array, handling the case where the input might not be an array
 * @param array The array to get the length of
 * @returns The length of the array, or 0 if input is not an array
 */
export function safeLength<T>(array: T[] | null | undefined): number {
  return safeArray(array).length;
}

/**
 * Safely reduces an array, handling the case where the input might not be an array
 * @param array The array to reduce
 * @param reducer The reducer function
 * @param initialValue The initial value for the reducer
 * @returns The reduced value, or initialValue if input is not an array
 */
export function safeReduce<T, U>(
  array: T[] | null | undefined,
  reducer: (accumulator: U, value: T) => U,
  initialValue: U
): U {
  return safeArray(array).reduce(reducer, initialValue);
}

/**
 * Safely sorts an array, handling the case where the input might not be an array
 * @param array The array to sort
 * @param compareFn The comparison function
 * @returns The sorted array, or an empty array if input is not an array
 */
export function safeSort<T>(array: T[] | null | undefined, compareFn?: (a: T, b: T) => number): T[] {
  return safeArray(array).sort(compareFn);
}

/**
 * Safely checks if an array includes a value, handling the case where the input might not be an array
 * @param array The array to check
 * @param searchElement The value to search for
 * @returns true if the array includes the value, false otherwise
 */
export function safeIncludes<T>(array: T[] | null | undefined, searchElement: T): boolean {
  return safeArray(array).includes(searchElement);
}

/**
 * Safely finds an element in an array, handling the case where the input might not be an array
 * @param array The array to search
 * @param predicate The find function
 * @returns The found element, or undefined if not found or input is not an array
 */
export function safeFind<T>(array: T[] | null | undefined, predicate: (value: T) => boolean): T | undefined {
  return safeArray(array).find(predicate);
}

/**
 * Safely gets an element at a specific index, handling the case where the input might not be an array
 * @param array The array to get an element from
 * @param index The index to get
 * @returns The element at the index, or undefined if index is out of bounds or input is not an array
 */
export function safeAt<T>(array: T[] | null | undefined, index: number): T | undefined {
  const arr = safeArray(array);
  return index >= 0 && index < arr.length ? arr[index] : undefined;
}

/**
 * Safely checks if all elements in an array satisfy a predicate, handling the case where the input might not be an array
 * @param array The array to check
 * @param predicate The predicate function
 * @returns true if all elements satisfy the predicate, false otherwise
 */
export function safeEvery<T>(array: T[] | null | undefined, predicate: (value: T) => boolean): boolean {
  const arr = safeArray(array);
  return arr.length > 0 ? arr.every(predicate) : false;
}

/**
 * Safely checks if any element in an array satisfies a predicate, handling the case where the input might not be an array
 * @param array The array to check
 * @param predicate The predicate function
 * @returns true if any element satisfies the predicate, false otherwise
 */
export function safeSome<T>(array: T[] | null | undefined, predicate: (value: T) => boolean): boolean {
  return safeArray(array).some(predicate);
}

// ===== OBJECT OPERATIONS =====

/**
 * Safely gets nested properties from an object with a path string
 * @param obj The object to access
 * @param path The path to the property (e.g., 'user.profile.name')
 * @param defaultValue The default value to return if the path doesn't exist
 * @returns The value at the path, or the default value if the path doesn't exist
 */
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  try {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result === null || result === undefined || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[key];
    }

    return (result === undefined || result === null) ? defaultValue : result as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely checks if an object has a property
 * @param obj The object to check
 * @param prop The property to check for
 * @returns true if the object has the property, false otherwise
 */
export function safeHasProperty(obj: any, prop: string): boolean {
  return obj !== null && obj !== undefined && typeof obj === 'object' && prop in obj;
}

/**
 * Safely merges objects, handling null/undefined objects
 * @param objects The objects to merge
 * @returns The merged object
 */
export function safeMerge<T extends object>(...objects: (T | null | undefined)[]): T {
  return objects.reduce((result, obj) => {
    if (obj !== null && obj !== undefined && typeof obj === 'object') {
      return { ...result, ...obj };
    }
    return result;
  }, {} as T);
}

// ===== DATE OPERATIONS =====

/**
 * Safely parses a date string, handling invalid dates
 * @param dateString The date string to parse
 * @param defaultValue The default value to return if parsing fails
 * @returns The parsed date, or the default value if parsing fails
 */
export function safeParseDate(dateString: string | null | undefined, defaultValue: Date = new Date()): Date {
  if (!dateString) return defaultValue;

  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? defaultValue : date;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely formats a date, handling invalid dates
 * @param date The date to format
 * @param formatter The formatting function
 * @param defaultValue The default value to return if formatting fails
 * @returns The formatted date, or the default value if formatting fails
 */
export function safeFormatDate(
  date: Date | string | null | undefined,
  formatter: (date: Date) => string,
  defaultValue: string = 'N/A'
): string {
  if (!date) return defaultValue;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return defaultValue;
    }
    return formatter(dateObj);
  } catch {
    return defaultValue;
  }
}

// ===== REDUX INTEGRATION =====

/**
 * Creates a safe selector for arrays that ensures the result is never undefined or null
 * @param selector The original selector that might return undefined/null
 * @returns A new selector that always returns an array
 */
export function createSafeArraySelector<State, Result>(
  selector: (state: State) => Result[] | null | undefined
) {
  return createSelector(
    selector,
    (result) => safeArray(result)
  );
}

/**
 * Creates a safe selector for objects that ensures the result is never undefined or null
 * @param selector The original selector that might return undefined/null
 * @returns A new selector that always returns an object
 */
export function createSafeObjectSelector<State, Result extends object>(
  selector: (state: State) => Result | null | undefined
) {
  return createSelector(
    selector,
    (result) => safeObject(result)
  );
}

// ===== BACKWARD COMPATIBILITY =====

/**
 * @deprecated Use safeArray instead
 */
export const ensureArray = safeArray;
