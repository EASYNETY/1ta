// lib/safe-utils.ts
// Utility functions for safely handling potentially undefined or non-array values

/**
 * Ensures the input is an array. If not, returns an empty array.
 * @param input Any value that might be an array
 * @returns The input if it's an array, otherwise an empty array
 */
export function ensureArray<T>(input: any): T[] {
  return Array.isArray(input) ? input : [];
}

/**
 * Safely filters an array, handling the case where the input might not be an array.
 * @param input Any value that might be an array
 * @param predicate The filter function
 * @returns The filtered array, or an empty array if input is not an array
 */
export function safeFilter<T>(input: any, predicate: (value: T) => boolean): T[] {
  return ensureArray<T>(input).filter(predicate);
}

/**
 * Safely maps an array, handling the case where the input might not be an array.
 * @param input Any value that might be an array
 * @param mapper The mapping function
 * @returns The mapped array, or an empty array if input is not an array
 */
export function safeMap<T, U>(input: any, mapper: (value: T) => U): U[] {
  return ensureArray<T>(input).map(mapper);
}

/**
 * Safely gets the length of an array, handling the case where the input might not be an array.
 * @param input Any value that might be an array
 * @returns The length of the array, or 0 if input is not an array
 */
export function safeLength(input: any): number {
  return ensureArray(input).length;
}

/**
 * Safely reduces an array, handling the case where the input might not be an array.
 * @param input Any value that might be an array
 * @param reducer The reducer function
 * @param initialValue The initial value for the reducer
 * @returns The reduced value, or initialValue if input is not an array
 */
export function safeReduce<T, U>(
  input: any, 
  reducer: (accumulator: U, value: T) => U, 
  initialValue: U
): U {
  return ensureArray<T>(input).reduce(reducer, initialValue);
}

/**
 * Safely sorts an array, handling the case where the input might not be an array.
 * @param input Any value that might be an array
 * @param compareFn The comparison function
 * @returns The sorted array, or an empty array if input is not an array
 */
export function safeSort<T>(input: any, compareFn?: (a: T, b: T) => number): T[] {
  return ensureArray<T>(input).sort(compareFn);
}

/**
 * Safely checks if an array includes a value, handling the case where the input might not be an array.
 * @param input Any value that might be an array
 * @param searchElement The value to search for
 * @returns true if the array includes the value, false otherwise
 */
export function safeIncludes<T>(input: any, searchElement: T): boolean {
  return ensureArray<T>(input).includes(searchElement);
}

/**
 * Safely finds an element in an array, handling the case where the input might not be an array.
 * @param input Any value that might be an array
 * @param predicate The find function
 * @returns The found element, or undefined if not found or input is not an array
 */
export function safeFind<T>(input: any, predicate: (value: T) => boolean): T | undefined {
  return ensureArray<T>(input).find(predicate);
}

/**
 * Safely gets an element at a specific index, handling the case where the input might not be an array.
 * @param input Any value that might be an array
 * @param index The index to get
 * @returns The element at the index, or undefined if index is out of bounds or input is not an array
 */
export function safeAt<T>(input: any, index: number): T | undefined {
  const arr = ensureArray<T>(input);
  return index >= 0 && index < arr.length ? arr[index] : undefined;
}

/**
 * Safely checks if all elements in an array satisfy a predicate, handling the case where the input might not be an array.
 * @param input Any value that might be an array
 * @param predicate The predicate function
 * @returns true if all elements satisfy the predicate, false otherwise
 */
export function safeEvery<T>(input: any, predicate: (value: T) => boolean): boolean {
  const arr = ensureArray<T>(input);
  return arr.length > 0 ? arr.every(predicate) : false;
}

/**
 * Safely checks if any element in an array satisfies a predicate, handling the case where the input might not be an array.
 * @param input Any value that might be an array
 * @param predicate The predicate function
 * @returns true if any element satisfies the predicate, false otherwise
 */
export function safeSome<T>(input: any, predicate: (value: T) => boolean): boolean {
  return ensureArray<T>(input).some(predicate);
}
