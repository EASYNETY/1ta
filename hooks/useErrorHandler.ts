import { useState, useCallback } from 'react';

/**
 * A hook that provides error handling capabilities for functional components.
 * It can be used to catch and handle errors in async operations.
 * 
 * @param onError Optional callback to be called when an error occurs
 * @returns An object with error state and error handling functions
 */
export function useErrorHandler(onError?: (error: Error) => void) {
  const [error, setError] = useState<Error | null>(null);

  /**
   * Handles an error by setting the error state and calling the onError callback
   * @param error The error to handle
   */
  const handleError = useCallback((error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    setError(error);
    
    if (onError) {
      onError(error);
    }
  }, [onError]);

  /**
   * Clears the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Wraps an async function with error handling
   * @param fn The async function to wrap
   * @returns A new function that catches errors and handles them
   */
  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R | undefined> => {
      try {
        return await fn(...args);
      } catch (err) {
        handleError(err instanceof Error ? err : new Error(String(err)));
        return undefined;
      }
    };
  }, [handleError]);

  return {
    error,
    handleError,
    clearError,
    withErrorHandling
  };
}

export default useErrorHandler;
