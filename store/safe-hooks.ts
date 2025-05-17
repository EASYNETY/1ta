// store/safe-hooks.ts
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { RootState } from './store';
import { safeArray, safeObject, safeString, safeNumber, safeBoolean } from '@/lib/utils/safe-data';

/**
 * Type-safe version of the useSelector hook
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Hook that selects data from the Redux store and ensures it's an array
 * @param selector A function that extracts an array from the Redux state
 * @returns The selected array, guaranteed to never be null or undefined
 */
export function useSafeArraySelector<T>(
  selector: (state: RootState) => T[] | null | undefined
): T[] {
  return safeArray(useAppSelector(selector));
}

/**
 * Hook that selects data from the Redux store and ensures it's an object
 * @param selector A function that extracts an object from the Redux state
 * @returns The selected object, guaranteed to never be null or undefined
 */
export function useSafeObjectSelector<T extends object>(
  selector: (state: RootState) => T | null | undefined
): T {
  return safeObject(useAppSelector(selector));
}

/**
 * Hook that selects data from the Redux store and ensures it's a string
 * @param selector A function that extracts a string from the Redux state
 * @param defaultValue Optional default value (defaults to empty string)
 * @returns The selected string, guaranteed to never be null or undefined
 */
export function useSafeStringSelector(
  selector: (state: RootState) => string | null | undefined,
  defaultValue: string = ''
): string {
  return safeString(useAppSelector(selector), defaultValue);
}

/**
 * Hook that selects data from the Redux store and ensures it's a number
 * @param selector A function that extracts a number from the Redux state
 * @param defaultValue Optional default value (defaults to 0)
 * @returns The selected number, guaranteed to never be null or undefined
 */
export function useSafeNumberSelector(
  selector: (state: RootState) => number | null | undefined,
  defaultValue: number = 0
): number {
  return safeNumber(useAppSelector(selector), defaultValue);
}

/**
 * Hook that selects data from the Redux store and ensures it's a boolean
 * @param selector A function that extracts a boolean from the Redux state
 * @param defaultValue Optional default value (defaults to false)
 * @returns The selected boolean, guaranteed to never be null or undefined
 */
export function useSafeBooleanSelector(
  selector: (state: RootState) => boolean | null | undefined,
  defaultValue: boolean = false
): boolean {
  return safeBoolean(useAppSelector(selector), defaultValue);
}

/**
 * Example usage:
 * 
 * // Instead of:
 * const users = useAppSelector(selectAllUsers) || [];
 * 
 * // Use:
 * const users = useSafeArraySelector(selectAllUsers);
 */
