// lib/error-utils.ts
import { ApiError } from "./api-client";
import { toast } from "sonner";

/**
 * Handles API errors consistently across the application
 * @param error The error to handle
 * @param fallbackMessage A fallback message if the error doesn't have one
 * @param showToast Whether to show a toast notification
 * @returns The error message
 */
export function handleApiError(
	error: unknown,
	fallbackMessage = "An unexpected error occurred",
	showToast = true
): string {
	let errorMessage = fallbackMessage;

	if (error instanceof ApiError) {
		errorMessage = error.message;

		// Special handling for specific error codes
		if (error.status === 401) {
			errorMessage = "Your session has expired. Please log in again.";
		} else if (error.status === 403) {
			errorMessage = "You don't have permission to perform this action.";
		} else if (error.status === 404) {
			errorMessage = "The requested resource was not found.";
		} else if (error.status >= 500) {
			errorMessage = "Server error. Please try again later.";
		}

		// Network errors
		if (error.isNetworkError) {
			errorMessage = "Network error. Please check your internet connection.";
		}
	} else if (error instanceof Error) {
		errorMessage = error.message;
	}

	// Show toast if requested
	if (showToast) {
		toast.error(errorMessage);
	}

	return errorMessage;
}

/**
 * Wraps an async function with error handling
 * @param fn The async function to wrap
 * @param errorHandler Custom error handler (optional)
 * @returns A wrapped function that handles errors
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
	fn: T,
	errorHandler?: (error: unknown) => void
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
	return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
		try {
			return await fn(...args);
		} catch (error) {
			if (errorHandler) {
				errorHandler(error);
			} else {
				handleApiError(error);
			}
			throw error;
		}
	};
}
