// lib/redux-utils.ts
// Utilities for working with Redux in a type-safe way

import { RootState } from "@/store";
import { safeArray, safeString, safeNumber, safeBoolean, safeObject } from "./utils/safe-data";

/**
 * Creates a type-safe selector that ensures the returned value is an array
 * @param selector The original selector function
 * @returns A new selector that always returns an array
 */
export function createArraySelector<T>(
  selector: (state: RootState) => T[] | undefined | null
): (state: RootState) => T[] {
  return (state: RootState) => safeArray<T>(selector(state));
}

/**
 * Creates a type-safe selector that ensures the returned value is a number
 * @param selector The original selector function
 * @param defaultValue The default value to return if the selector returns undefined or null
 * @returns A new selector that always returns a number
 */
export function createNumberSelector(
  selector: (state: RootState) => number | undefined | null,
  defaultValue = 0
): (state: RootState) => number {
  return (state: RootState) => safeNumber(selector(state), defaultValue);
}

/**
 * Creates a type-safe selector that ensures the returned value is a string
 * @param selector The original selector function
 * @param defaultValue The default value to return if the selector returns undefined or null
 * @returns A new selector that always returns a string
 */
export function createStringSelector(
  selector: (state: RootState) => string | undefined | null,
  defaultValue = ""
): (state: RootState) => string {
  return (state: RootState) => safeString(selector(state), defaultValue);
}

/**
 * Creates a type-safe selector that ensures the returned value is a boolean
 * @param selector The original selector function
 * @param defaultValue The default value to return if the selector returns undefined or null
 * @returns A new selector that always returns a boolean
 */
export function createBooleanSelector(
  selector: (state: RootState) => boolean | undefined | null,
  defaultValue = false
): (state: RootState) => boolean {
  return (state: RootState) => safeBoolean(selector(state), defaultValue);
}

/**
 * Creates a type-safe selector that ensures the returned value is an object
 * @param selector The original selector function
 * @param defaultValue The default value to return if the selector returns undefined or null
 * @returns A new selector that always returns an object
 */
export function createObjectSelector<T extends object>(
  selector: (state: RootState) => T | undefined | null,
  defaultValue: T
): (state: RootState) => T {
  return (state: RootState) => {
    const value = selector(state);
    return value === undefined || value === null ? defaultValue : value;
  };
}

/**
 * Creates a type-safe selector that maps over an array returned by another selector
 * @param arraySelector The selector that returns an array
 * @param mapFn The mapping function to apply to each element
 * @returns A new selector that returns the mapped array
 */
export function createMappedArraySelector<T, U>(
  arraySelector: (state: RootState) => T[] | undefined | null,
  mapFn: (item: T) => U
): (state: RootState) => U[] {
  return (state: RootState) => {
    const array = safeArray<T>(arraySelector(state));
    return array.map(mapFn);
  };
}

/**
 * Creates a type-safe selector that filters an array returned by another selector
 * @param arraySelector The selector that returns an array
 * @param filterFn The filter function to apply to each element
 * @returns A new selector that returns the filtered array
 */
export function createFilteredArraySelector<T>(
  arraySelector: (state: RootState) => T[] | undefined | null,
  filterFn: (item: T) => boolean
): (state: RootState) => T[] {
  return (state: RootState) => {
    const array = safeArray<T>(arraySelector(state));
    return array.filter(filterFn);
  };
}
