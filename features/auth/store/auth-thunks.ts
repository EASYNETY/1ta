// features/auth/store/auth-thunks.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import { post, get, put } from "@/lib/api-client";
import { loginSuccess, loginFailure, loginStart } from "./auth-slice";
import type {
	AuthResponse,
	ResetPasswordPayload,
} from "@/features/auth/types/auth-types";
import { setCookie } from "nookies"; // Import setCookie
import type { User } from "./auth-slice";

// Helper function for cookie options (optional, but good practice)
const getCookieOptions = (maxAgeSeconds?: number) => {
	const options: any = {
		path: "/", // Make cookie available across the entire site
		// secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
		// sameSite: 'lax', // Recommended for most cases ('strict' or 'none' are other options)
	};
	if (maxAgeSeconds) {
		options.maxAge = maxAgeSeconds; // Expires after N seconds
	}
	// You might set 'expires' instead of 'maxAge' if preferred
	// options.expires = new Date(Date.now() + maxAgeSeconds * 1000);
	return options;
};

// --- Fetch User Profile Thunk ---
export const fetchUserProfileThunk = createAsyncThunk<
	Partial<User>,
	void,
	{ rejectValue: string }
>("auth/fetchUserProfile", async (_, { rejectWithValue }) => {
	try {
		const response = await get<User>("/users/me");
		return response;
	} catch (error: any) {
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch user profile";
		return rejectWithValue(errorMessage);
	}
});

// --- Login Thunk ---
export const loginThunk = createAsyncThunk(
	"auth/login",
	async (credentials: { email: string; password: string }, { dispatch }) => {
		try {
			dispatch(loginStart());
			const response = await post<AuthResponse>("/auth/login", credentials, {
				requiresAuth: false,
			});

			// --- Store auth data in cookies ---
			// Example: Set cookies to expire in 30 days
			const cookieOptions = getCookieOptions(30 * 24 * 60 * 60);
			setCookie(null, "authToken", response.token, cookieOptions); // null context for client-side
			setCookie(null, "authUser", JSON.stringify(response.user), cookieOptions); // Store user as JSON string
			// --- End Cookie Setting ---

			dispatch(
				loginSuccess({
					user: response.user,
					token: response.token,
				})
			);

			// Fetch full user profile after login
			dispatch(fetchUserProfileThunk());

			return response;
		} catch (error: any) {
			const errorMessage =
				error instanceof Error ? error.message : "Login failed";
			dispatch(loginFailure(errorMessage));
			throw error;
		}
	}
);

// --- Signup Thunk ---
export const signupThunk = createAsyncThunk(
	"auth/signup",
	async (
		userData: {
			name: string;
			email: string;
			password: string;
			dateOfBirth?: string;
			classId?: string;
			barcodeId?: string;
			guardianId?: string | null;
		},
		{ dispatch, getState }
	) => {
		try {
			dispatch(loginStart());
			const state = getState() as any;
			const cartItems = state.cart.items;
			const fullPayload = { ...userData, cartItems };

			const response = await post<AuthResponse>("/auth/register", fullPayload, {
				requiresAuth: false,
			});

			// --- Store auth data in cookies ---
			// Example: Set cookies to expire in 30 days
			const cookieOptions = getCookieOptions(30 * 24 * 60 * 60);
			setCookie(null, "authToken", response.token, cookieOptions);
			setCookie(null, "authUser", JSON.stringify(response.user), cookieOptions);
			// --- End Cookie Setting ---

			dispatch(
				loginSuccess({
					user: response.user,
					token: response.token,
				})
			);
			// dispatch(clearCart()); // Keep if needed

			return response;
		} catch (error: any) {
			const errorMessage =
				error instanceof Error ? error.message : "Registration failed";
			dispatch(loginFailure(errorMessage));
			throw error;
		}
	}
);

// --- Update User Profile Thunk ---
export const updateUserProfileThunk = createAsyncThunk<
	Partial<User>,
	Partial<User>,
	{ rejectValue: string }
>("auth/updateUserProfile", async (profileData, { rejectWithValue }) => {
	try {
		const response = await put<User>("/users/me", profileData);
		return response;
	} catch (error: any) {
		const errorMessage =
			error instanceof Error ? error.message : "Failed to update user profile";
		return rejectWithValue(errorMessage);
	}
});

// --- Forgot Password Thunk ---
export const forgotPasswordThunk = createAsyncThunk<
	{ message: string }, // Expected success response structure (adjust if different)
	{ email: string }, // Input argument type
	{ rejectValue: string } // Type for rejection payload
>("auth/forgotPassword", async (payload, { rejectWithValue }) => {
	try {
		console.log("Dispatching forgotPasswordThunk for:", payload.email);
		// Use the post helper from apiClient
		const response = await post<{ message: string }>(
			"/auth/forgot-password",
			payload,
			{
				requiresAuth: false, // No auth needed for this endpoint
			}
		);
		console.log("Forgot Password API Response:", response);
		return response; // Return the success message payload
	} catch (error: any) {
		const errorMessage =
			error?.data?.message ||
			error?.message ||
			"Failed to send password reset link.";
		console.error("Forgot Password Thunk Error:", errorMessage);
		// Reject with the error message for the component to catch
		return rejectWithValue(errorMessage);
	}
});

// --- Reset Password Thunk ---
export const resetPasswordThunk = createAsyncThunk<
	{ message: string }, // Expected success response structure
	ResetPasswordPayload, // Input: { token: string; password: string }
	{ rejectValue: string } // Type for rejection payload
>("auth/resetPassword", async (payload, { rejectWithValue }) => {
	try {
		console.log("Dispatching resetPasswordThunk...");
		// Ensure only token and password are sent, not confirmPassword
		const apiPayload = { token: payload.token, password: payload.password };
		// Call the API client
		const response = await post<{ message: string }>(
			"/auth/reset-password",
			apiPayload,
			{
				requiresAuth: false, // No auth needed for this endpoint
			}
		);
		console.log("Reset Password API Response:", response);
		return response; // Return success message payload
	} catch (error: any) {
		const errorMessage =
			error?.data?.message ||
			error?.message ||
			"Failed to reset password. Link may be invalid/expired.";
		console.error("Reset Password Thunk Error:", errorMessage);
		return rejectWithValue(errorMessage);
	}
});
