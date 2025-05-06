// lib/auth-service.ts
import { setCookie, destroyCookie, parseCookies } from "nookies";
import type { User } from "@/types/user.types";

// Store auth data in cookies/localStorage
export const setAuthData = (
	user: User,
	token: string,
	refreshToken?: string
) => {
	// Set cookies with 30 days expiration
	const cookieOptions = {
		maxAge: 30 * 24 * 60 * 60, // 30 days
		path: "/",
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
	};

	setCookie(null, "authToken", token, cookieOptions);
	setCookie(null, "authUser", JSON.stringify(user), cookieOptions);

	// Store refresh token if provided
	if (refreshToken) {
		setCookie(null, "refreshToken", refreshToken, cookieOptions);
	}

	// Also set in localStorage for the API client
	if (typeof window !== "undefined") {
		localStorage.setItem("authToken", token);
		localStorage.setItem("authUser", JSON.stringify(user));
		if (refreshToken) {
			localStorage.setItem("refreshToken", refreshToken);
		}
	}
};

export const getAuthToken = (): string | null => {
	if (typeof window !== "undefined") {
		const cookies = parseCookies();
		return cookies.authToken || localStorage.getItem("authToken") || null;
	}
	return null;
};

export const getRefreshToken = (): string | null => {
	if (typeof window !== "undefined") {
		const cookies = parseCookies();
		return cookies.refreshToken || localStorage.getItem("refreshToken") || null;
	}
	return null;
};

export const getAuthUser = (): User | null => {
	if (typeof window !== "undefined") {
		const cookies = parseCookies();
		const userStr = cookies.authUser || localStorage.getItem("authUser");
		if (userStr) {
			try {
				return JSON.parse(userStr);
			} catch (e) {
				return null;
			}
		}
	}
	return null;
};

export const clearAuthData = () => {
	destroyCookie(null, "authToken");
	destroyCookie(null, "authUser");
	destroyCookie(null, "refreshToken");

	if (typeof window !== "undefined") {
		localStorage.removeItem("authToken");
		localStorage.removeItem("authUser");
		localStorage.removeItem("refreshToken");
	}
};

// Helper function to handle unauthorized responses
export const handleUnauthorized = () => {
	// Clear auth data
	clearAuthData();

	// Optionally redirect to login page
	if (typeof window !== "undefined") {
		// Use a custom event to notify the app about logout
		window.dispatchEvent(new CustomEvent("auth:unauthorized"));

		// Redirect to login page if not already there
		if (!window.location.pathname.includes("/login")) {
			window.location.href = "/login";
		}
	}
};

// Function to check if the user is authenticated
export const isAuthenticated = (): boolean => {
	return !!getAuthToken();
};

// Direct token refresh function that doesn't rely on Redux
export const refreshAuthToken = async (): Promise<{
	token: string;
	refreshToken?: string;
}> => {
	const refreshToken = getRefreshToken();

	if (!refreshToken) {
		throw new Error("No refresh token available");
	}

	try {
		// Make a direct fetch request without using the API client
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ refreshToken }),
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to refresh token: ${response.status}`);
		}

		const data = await response.json();

		// Update stored tokens
		if (data.token) {
			// Only update the token, not the user data
			setCookie(null, "authToken", data.token, {
				maxAge: 30 * 24 * 60 * 60,
				path: "/",
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
			});

			if (typeof window !== "undefined") {
				localStorage.setItem("authToken", data.token);
			}

			// Also update refresh token if provided
			if (data.refreshToken) {
				setCookie(null, "refreshToken", data.refreshToken, {
					maxAge: 30 * 24 * 60 * 60,
					path: "/",
					secure: process.env.NODE_ENV === "production",
					sameSite: "strict",
				});

				if (typeof window !== "undefined") {
					localStorage.setItem("refreshToken", data.refreshToken);
				}
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
};
