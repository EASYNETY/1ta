// features/auth/store/auth-thunks.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import { post } from "@/lib/api-client";
import { loginSuccess, loginFailure, loginStart } from "./auth-slice";
import { clearCart } from "@/features/cart/store/cart-slice";
import type {
	AuthResponse,
	ResetPasswordPayload,
} from "@/features/auth/types/auth-types";

// --- Login Thunk ---
export const loginThunk = createAsyncThunk(
	"auth/login",
	async (credentials: { email: string; password: string }, { dispatch }) => {
		try {
			dispatch(loginStart());

			const response = await post<AuthResponse>("/auth/login", credentials, {
				requiresAuth: false,
			});

			// Store auth data in localStorage for persistence
			localStorage.setItem("authToken", response.token);
			localStorage.setItem("authUser", JSON.stringify(response.user));

			dispatch(
				loginSuccess({
					user: response.user,
					token: response.token,
				})
			);

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
			dateOfBirth: string;
			classId: string;
			barcodeId: string;
			guardianId: string | null;
		},
		{ dispatch, getState }
	) => {
		try {
			dispatch(loginStart());

			// Get cart items from state
			const state = getState() as any;
			const cartItems = state.cart.items;

			// Create full payload with cart items
			const fullPayload = {
				...userData,
				cartItems,
			};

			const response = await post<AuthResponse>("/auth/register", fullPayload, {
				requiresAuth: false,
			});

			// Store auth data in localStorage for persistence
			localStorage.setItem("authToken", response.token);
			localStorage.setItem("authUser", JSON.stringify(response.user));

			dispatch(
				loginSuccess({
					user: response.user,
					token: response.token,
				})
			);

			// Clear cart after successful registration
			// dispatch(clearCart());

			return response;
		} catch (error: any) {
			const errorMessage =
				error instanceof Error ? error.message : "Registration failed";
			dispatch(loginFailure(errorMessage));
			throw error;
		}
	}
);

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
