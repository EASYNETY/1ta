// src/lib/live/auth-api-client.ts

"use client";

import { handleMockRequest } from "../api-client";
import { getAuthToken, handleUnauthorized } from "../auth-service";

// --- Config ---
const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";
const IS_LIVE_API = process.env.NEXT_PUBLIC_API_IS_LIVE === "true";

console.log(
	`%cAPI Client Mode: ${IS_LIVE_API ? "LIVE" : "MOCK"}`,
	"color: cyan; font-weight: bold;"
);

// --- Types ---
interface FetchOptions extends RequestInit {
	requiresAuth?: boolean;
	url?: string;
	skipAuthRefresh?: boolean; // Add this to prevent infinite loops during token refresh
}

// Custom error class for API errors
export class ApiError extends Error {
	status: number;
	data: any;
	isNetworkError: boolean;

	constructor(
		message: string,
		status = 0,
		data: any = null,
		isNetworkError = false
	) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.data = data;
		this.isNetworkError = isNetworkError;
	}
}

// --- Main API Client ---
async function apiClient<T>(
	endpoint: string,
	options: FetchOptions = {}
): Promise<T> {
	const {
		requiresAuth = true,
		skipAuthRefresh = false,
		...fetchOptions
	} = options;
	const headers = new Headers(fetchOptions.headers);

	if (!headers.has("Content-Type") && options.body)
		headers.set("Content-Type", "application/json");
	if (!headers.has("Accept")) headers.set("Accept", "application/json");

	// Add auth token if required and available
	if (requiresAuth && !skipAuthRefresh) {
		const token = getAuthToken();

		if (token) {
			headers.set("Authorization", `Bearer ${token}`);
		} else if (requiresAuth) {
			console.warn("Auth required but no token available");
		}
	}

	const config: RequestInit = { ...fetchOptions, headers };

	// --- MOCK Handling ---
	if (!IS_LIVE_API) {
		console.log(
			`%cAPI Client: Using MOCK for ${options.method || "GET"} ${endpoint}`,
			"color: orange;"
		);
		return handleMockRequest<T>(endpoint, options);
	}

	// --- LIVE Handling ---
	try {
		console.log(
			`%cAPI Client: LIVE ${config.method || "GET"} ${API_BASE_URL}${endpoint}`,
			"color: lightblue;"
		);

		const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

		if (!response.ok) {
			let errorData: any = {
				message: `API Error: ${response.status} ${response.statusText}`,
			};

			try {
				errorData = await response.json();
			} catch (e) {
				/* non-json response */
			}

			console.error("API Error Data:", errorData);

			// Handle 401 Unauthorized errors (expired token, etc.)
			if (response.status === 401 && !skipAuthRefresh) {
				console.warn("Received 401 Unauthorized, attempting token refresh");

				// Try to refresh the token using the direct function from auth-service
				try {
					// Import the refreshAuthToken function from auth-service
					const { refreshAuthToken } = await import("@/lib/auth-service");

					// Call the function directly without using Redux
					const { token } = await refreshAuthToken();

					// If refresh successful, retry the original request with the new token
					if (token) {
						console.log("Token refresh successful, retrying original request");
						headers.set("Authorization", `Bearer ${token}`);
						const retryConfig = { ...config, headers };

						// Add a small delay before retrying to ensure token is properly stored
						await new Promise(resolve => setTimeout(resolve, 100));

						const retryResponse = await fetch(
							`${API_BASE_URL}${endpoint}`,
							retryConfig
						);

						if (retryResponse.ok) {
							console.log("Retry successful after token refresh");
							if (retryResponse.status === 204) return undefined as T;

							const contentType = retryResponse.headers.get("content-type");
							if (contentType && contentType.includes("application/json")) {
								return await retryResponse.json();
							}

							return undefined as T;
						} else {
							// If retry fails, check if it's another 401
							if (retryResponse.status === 401) {
								console.error("Still getting 401 after token refresh, session may be invalid");
								// Only logout if we're still getting 401 after refresh
								handleUnauthorized();
							}

							// For other errors, throw normal error
							let retryErrorData: any = {
								message: `API Error after token refresh: ${retryResponse.status} ${retryResponse.statusText}`,
							};

							try {
								retryErrorData = await retryResponse.json();
							} catch (e) {
								/* non-json response */
							}

							throw new ApiError(
								retryErrorData.message || `Error ${retryResponse.status} after token refresh`,
								retryResponse.status,
								retryErrorData
							);
						}
					}
				} catch (refreshError) {
					console.error("Token refresh failed:", refreshError);
					// Only logout if refresh explicitly failed, not for network errors
					if (!(refreshError instanceof Error && refreshError.message.includes("network"))) {
						handleUnauthorized();
					}
				}

				// Throw a specific error for 401
				throw new ApiError(
					errorData.message || "Your session has expired. Please log in again.",
					401,
					errorData
				);
			}

			// Handle other error status codes
			throw new ApiError(
				errorData.message || `Error ${response.status}: ${response.statusText}`,
				response.status,
				errorData
			);
		}

		if (response.status === 204) return undefined as T;

		const contentType = response.headers.get("content-type");
		if (contentType && contentType.includes("application/json")) {
			return await response.json();
		}

		console.warn(`API Client: Non-JSON response received for ${endpoint}`);
		return undefined as T;
	} catch (error: any) {
		console.error(`API request failed for ${endpoint}:`, error);

		// If it's already an ApiError, just rethrow it
		if (error instanceof ApiError) {
			throw error;
		}

		// Handle network errors (offline, DNS failure, etc.)
		if (error.name === "TypeError" && error.message.includes("fetch")) {
			throw new ApiError(
				"Network error. Please check your internet connection.",
				0,
				null,
				true
			);
		}

		// For any other errors
		throw new ApiError(
			error.message || "An unexpected error occurred",
			error.status || 0,
			error.data || null
		);
	}
}

// --- Convenience Methods ---
export const get = <T>(
	endpoint: string,
	options?: Omit<FetchOptions, "method" | "body">
) => apiClient<T>(endpoint, { ...options, method: "GET" });

export const post = <T>(
	endpoint: string,
	data: any,
	options?: Omit<FetchOptions, "method" | "body">
) =>
	apiClient<T>(endpoint, {
		...options,
		method: "POST",
		body: JSON.stringify(data),
	});

export const put = <T>(
	endpoint: string,
	data: any,
	options?: Omit<FetchOptions, "method" | "body">
) =>
	apiClient<T>(endpoint, {
		...options,
		method: "PUT",
		body: JSON.stringify(data),
	});

export const del = <T>(
	endpoint: string,
	options?: Omit<FetchOptions, "method" | "body">
) => apiClient<T>(endpoint, { ...options, method: "DELETE" });

// --- Export ---
export { apiClient, IS_LIVE_API };
