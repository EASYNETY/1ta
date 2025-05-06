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

	try {
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

			throw new Error(errorData.message || "Failed to refresh token");
		}

		const data = await response.json();

		// Update stored tokens
		const user = getAuthUser();
		if (user) {
			setAuthData(user, data.token, data.refreshToken);
		} else {
			// Just update the tokens if we don't have user data
			if (typeof window !== "undefined") {
				localStorage.setItem(AUTH_TOKEN_KEY, data.token);
				if (data.refreshToken) {
					localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
				}
			}

			setCookie(null, AUTH_TOKEN_KEY, data.token, AUTH_COOKIE_OPTIONS);
			if (data.refreshToken) {
				setCookie(
					null,
					REFRESH_TOKEN_KEY,
					data.refreshToken,
					AUTH_COOKIE_OPTIONS
				);
			}
		}

		return {
			token: data.token,
			refreshToken: data.refreshToken,
		};
	} catch (error) {
		console.error("Token refresh failed:", error);
		// Clear auth data on refresh failure
		clearAuthData();
		throw error;
	}
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
