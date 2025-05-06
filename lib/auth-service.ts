// lib/auth-service.ts
import { setCookie, destroyCookie, parseCookies } from "nookies";
import type { User } from "@/types/user.types";
import { AuthResponse } from "@/features/auth/types/auth-types";

// Store auth data in cookies/localStorage
export const setAuthData = (user: User, token: string) => {
	setCookie(null, "authToken", token, {
		maxAge: 30 * 24 * 60 * 60, // 30 days
		path: "/",
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
	});

	setCookie(null, "authUser", JSON.stringify(user), {
		maxAge: 30 * 24 * 60 * 60, // 30 days
		path: "/",
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
	});

	// Also set in localStorage for the API client
	if (typeof window !== "undefined") {
		localStorage.setItem("authToken", token);
		localStorage.setItem("authUser", JSON.stringify(user));
	}
};

export const getAuthToken = (): string | null => {
	if (typeof window !== "undefined") {
		const cookies = parseCookies();
		return cookies.authToken || localStorage.getItem("authToken") || null;
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

	if (typeof window !== "undefined") {
		localStorage.removeItem("authToken");
		localStorage.removeItem("authUser");
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
