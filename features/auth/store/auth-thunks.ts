import { createAsyncThunk } from "@reduxjs/toolkit";
import { post } from "@/lib/api-client";
import { loginSuccess, loginFailure, loginStart } from "./auth-slice";
import { clearCart } from "@/features/cart/store/cart-slice";
import type { AuthResponse } from "@/features/auth/types/auth-types";

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
