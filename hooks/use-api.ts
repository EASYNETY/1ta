"use client";

// hooks/use-api.ts
import { useState, useCallback } from "react";
import { handleApiError } from "@/lib/error-utils";

interface UseApiOptions {
	showErrorToast?: boolean;
	onSuccess?: (data: any) => void;
	onError?: (error: unknown) => void;
}

export function useApi<T>(options: UseApiOptions = {}) {
	const [data, setData] = useState<T | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { showErrorToast = true, onSuccess, onError } = options;

	const execute = useCallback(
		async <R>(apiCall: () => Promise<R>): Promise<R | null> => {
			setIsLoading(true);
			setError(null);

			try {
				const result = await apiCall();
				setData(result as unknown as T);
				if (onSuccess) onSuccess(result);
				return result;
			} catch (err) {
				const errorMessage = handleApiError(
					err,
					"An error occurred",
					showErrorToast
				);
				setError(errorMessage);
				if (onError) onError(err);
				return null;
			} finally {
				setIsLoading(false);
			}
		},
		[showErrorToast, onSuccess, onError]
	);

	const reset = useCallback(() => {
		setData(null);
		setError(null);
		setIsLoading(false);
	}, []);

	return {
		data,
		isLoading,
		error,
		execute,
		reset,
	};
}
