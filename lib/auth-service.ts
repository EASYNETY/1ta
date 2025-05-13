// lib/auth-service.ts
import { setCookie, destroyCookie, parseCookies } from "nookies";
import type { User } from "@/types/user.types";

// --- Constants ---
const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "authUser";
const REFRESH_TOKEN_KEY = "refreshToken";
const AUTH_COOKIE_OPTIONS = {
	maxAge: 30 * 24 * 60 * 60, // 30 days
	path: "/",
	secure: process.env.NODE_ENV === "production",
};

// --- Custom Event for Auth State Changes ---
const UNAUTHORIZED_EVENT = "auth:unauthorized";

// --- Helper Functions ---
export function getAuthToken(): string | null {
	// Try to get from localStorage first (for client-side)
	if (typeof window !== "undefined") {
		const token = localStorage.getItem(AUTH_TOKEN_KEY);
		if (token) return token;
	}

	// Fall back to cookies (works server-side too)
	const cookies = parseCookies();
	return cookies[AUTH_TOKEN_KEY] || null;
}

export function getRefreshToken(): string | null {
	// Try to get from localStorage first (for client-side)
	if (typeof window !== "undefined") {
		const token = localStorage.getItem(REFRESH_TOKEN_KEY);
		if (token) return token;
	}

	// Fall back to cookies (works server-side too)
	const cookies = parseCookies();
	return cookies[REFRESH_TOKEN_KEY] || null;
}

export function getAuthUser(): User | null {
	try {
		// Try to get from localStorage first
		if (typeof window !== "undefined") {
			const userJson = localStorage.getItem(AUTH_USER_KEY);
			if (userJson) return JSON.parse(userJson);
		}

		// Fall back to cookies
		const cookies = parseCookies();
		const userJson = cookies[AUTH_USER_KEY];
		return userJson ? JSON.parse(userJson) : null;
	} catch (error) {
		console.error("Error parsing auth user:", error);
		return null;
	}
}

export function setAuthData(
	user: User,
	token: string,
	refreshToken?: string
): void {
	// Store in localStorage for easy access
	if (typeof window !== "undefined") {
		localStorage.setItem(AUTH_TOKEN_KEY, token);
		localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
		if (refreshToken) {
			localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
		}
	}

	// Also store in cookies for persistence across sessions
	setCookie(null, AUTH_TOKEN_KEY, token, AUTH_COOKIE_OPTIONS);
	setCookie(null, AUTH_USER_KEY, JSON.stringify(user), AUTH_COOKIE_OPTIONS);
	if (refreshToken) {
		setCookie(null, REFRESH_TOKEN_KEY, refreshToken, AUTH_COOKIE_OPTIONS);
	}
}

export function clearAuthData(): void {
	// Clear from localStorage
	if (typeof window !== "undefined") {
		localStorage.removeItem(AUTH_TOKEN_KEY);
		localStorage.removeItem(AUTH_USER_KEY);
		localStorage.removeItem(REFRESH_TOKEN_KEY);
	}

	// Clear cookies
	destroyCookie(null, AUTH_TOKEN_KEY, { path: "/" });
	destroyCookie(null, AUTH_USER_KEY, { path: "/" });
	destroyCookie(null, REFRESH_TOKEN_KEY, { path: "/" });
}

export function handleUnauthorized(): void {
	// Clear auth data
	clearAuthData();

	// Dispatch custom event for components to listen to
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
	}
}

// --- Direct Token Refresh Function ---
// This function is used directly by the API client to avoid circular dependencies
export async function refreshAuthToken(): Promise<{
	token: string;
	refreshToken?: string;
}> {
	const refreshToken = getRefreshToken();

	if (!refreshToken) {
		throw new Error("No refresh token available");
	}

	// Track refresh attempts to prevent infinite loops
	const MAX_REFRESH_ATTEMPTS = 3;
	let attempts = 0;
	let lastError: Error | null = null;

	while (attempts < MAX_REFRESH_ATTEMPTS) {
		attempts++;
		try {
			console.log(`Token refresh attempt ${attempts}/${MAX_REFRESH_ATTEMPTS}`);

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
					},
					body: JSON.stringify({ refreshToken }),
				}
			);

			if (!response.ok) {
				let errorData = {
					message: `Token refresh failed: ${response.status} ${response.statusText}`,
				};
				try {
					errorData = await response.json();
				} catch (e) {
					/* non-json response */
				}

				// If we get a 401 or 403, the refresh token is invalid
				if (response.status === 401 || response.status === 403) {
					throw new Error("Invalid refresh token");
				}

				// For other errors, we might retry
				lastError = new Error(errorData.message || "Failed to refresh token");

				// For server errors (5xx), retry after a delay
				if (response.status >= 500) {
					const delay = Math.pow(2, attempts) * 1000; // Exponential backoff
					console.log(`Server error during token refresh, retrying in ${delay}ms`);
					await new Promise(resolve => setTimeout(resolve, delay));
					continue;
				}

				throw lastError;
			}

			const data = await response.json();

			// Extract tokens from the response structure
			const accessToken =
				data.data?.tokens?.accessToken ||
				data.data?.accessToken ||
				data.accessToken;
			const newRefreshToken =
				data.data?.tokens?.refreshToken ||
				data.data?.refreshToken ||
				data.refreshToken;

			if (!accessToken) {
				throw new Error("Invalid token response format");
			}

			// Update stored tokens
			const user = getAuthUser();
			if (user) {
				setAuthData(user, accessToken, newRefreshToken);
			} else {
				// Just update the tokens if we don't have user data
				if (typeof window !== "undefined") {
					localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
					if (newRefreshToken) {
						localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
					}
				}

				setCookie(null, AUTH_TOKEN_KEY, accessToken, AUTH_COOKIE_OPTIONS);
				if (newRefreshToken) {
					setCookie(
						null,
						REFRESH_TOKEN_KEY,
						newRefreshToken,
						AUTH_COOKIE_OPTIONS
					);
				}
			}

			console.log("Token refresh successful");
			return {
				token: accessToken,
				refreshToken: newRefreshToken,
			};
		} catch (error) {
			console.error(`Token refresh attempt ${attempts} failed:`, error);
			lastError = error instanceof Error ? error : new Error(String(error));

			// If it's a network error, retry after a delay
			if (error instanceof Error && error.message.includes("network")) {
				const delay = Math.pow(2, attempts) * 1000; // Exponential backoff
				console.log(`Network error during token refresh, retrying in ${delay}ms`);
				await new Promise(resolve => setTimeout(resolve, delay));
				continue;
			}

			// For other errors, don't retry
			break;
		}
	}

	// If we've exhausted all attempts or got a non-retryable error
	console.error(`Token refresh failed after ${attempts} attempts`);

	// Only clear auth data for auth-related errors, not network errors
	if (lastError && !lastError.message.includes("network")) {
		clearAuthData();
	}

	throw lastError || new Error("Failed to refresh token after multiple attempts");
}

// --- Auth Listener ---
export function setupAuthListener(callback: () => void): () => void {
	if (typeof window === "undefined") return () => {};

	const handler = () => callback();
	window.addEventListener(UNAUTHORIZED_EVENT, handler);

	return () => {
		window.removeEventListener(UNAUTHORIZED_EVENT, handler);
	};
}

// --- Check if user is authenticated ---
export function isAuthenticated(): boolean {
	return !!getAuthToken() && !!getAuthUser();
}
