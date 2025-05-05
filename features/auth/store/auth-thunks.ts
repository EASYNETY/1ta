// features/auth/store/auth-thunks.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import { post, get, put } from "@/lib/api-client";
import { setCookie } from "nookies"; // Import setCookie
import type {
	AuthResponse,
	ResetPasswordPayload,
} from "@/features/auth/types/auth-types";
import { AUTH_ACTIONS } from "./auth-action-types";
import type { User, AuthState } from "@/types/user.types";
import { createCorporateStudentSlots } from "@/data/mock-auth-data";

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
	{
		rejectValue: string;
		state: { auth: AuthState }; // provide state type here
		condition: boolean;
	}
>(
	"auth/fetchUserProfile",
	async (_, { rejectWithValue }) => {
		try {
			const response = await get<User>("/users/me");
			return response;
		} catch (error: any) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to fetch user profile";
			return rejectWithValue(errorMessage);
		}
	},
	{
		condition: (_, { getState }) => {
			const { token } = getState().auth;
			return !!token; // only allow fetch if token exists
		},
	}
);

// --- Login Thunk ---
export const loginThunk = createAsyncThunk(
	"auth/login",
	async (credentials: { email: string; password: string }, { dispatch }) => {
		try {
			dispatch({ type: AUTH_ACTIONS.LOGIN_START });
			const response = await post<AuthResponse>("/auth/login", credentials, {
				requiresAuth: false,
			});

			// --- Store auth data in cookies ---
			// Example: Set cookies to expire in 30 days
			const cookieOptions = getCookieOptions(30 * 24 * 60 * 60);
			setCookie(null, "authToken", response.token, cookieOptions); // null context for client-side
			setCookie(null, "authUser", JSON.stringify(response.user), cookieOptions); // Store user as JSON string
			// --- End Cookie Setting ---

			dispatch({
				type: AUTH_ACTIONS.LOGIN_SUCCESS,
				payload: {
					user: response.user,
					token: response.token,
				},
			});

			return response;
		} catch (error: any) {
			const errorMessage =
				error instanceof Error ? error.message : "Login failed";
			dispatch({
				type: AUTH_ACTIONS.LOGIN_FAILURE,
				payload: errorMessage,
			});
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
			dispatch({ type: AUTH_ACTIONS.LOGIN_START });
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

			dispatch({
				type: AUTH_ACTIONS.LOGIN_SUCCESS,
				payload: {
					user: response.user,
					token: response.token,
				},
			});
			// dispatch(clearCart()); // Keep if needed

			return response;
		} catch (error: any) {
			const errorMessage =
				error instanceof Error ? error.message : "Registration failed";
			dispatch({
				type: AUTH_ACTIONS.LOGIN_FAILURE,
				payload: errorMessage,
			});
			throw error;
		}
	}
);

// --- Update User Profile Thunk ---
// Accepts Partial<User> which includes purchasedStudentSlots if relevant
export const updateUserProfileThunk = createAsyncThunk<
	User,
	Partial<User>,
	{ rejectValue: string }
>("auth/updateUserProfile", async (profileData, { rejectWithValue }) => {
	try {
		// The payload `profileData` might contain `purchasedStudentSlots` if sent from onSubmit
		const response = await put<User>("/users/me", profileData);
		// --- Update User Cookie ---
		const cookieOptions = getCookieOptions(30 * 24 * 60 * 60);
		setCookie(null, "authUser", JSON.stringify(response), cookieOptions);
		// --- End Cookie Update ---
		return response; // Return the updated full user object
	} catch (error: any) {
		return rejectWithValue(error.message || "Failed to update profile");
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

// --- NEW Thunk for Creating Corporate Student Slots ---
interface CreateSlotsParams {
	corporateId: string;
	studentCount: number;
	courses: string[]; // Course IDs to assign
}
interface CreateSlotsResult {
	// Example result
	success: boolean;
	createdStudents: number;
	message?: string;
}

export const createCorporateStudentSlotsThunk = createAsyncThunk<
	CreateSlotsResult, // Return type
	CreateSlotsParams, // Argument type
	{ rejectValue: string }
>("auth/createCorporateSlots", async (params, { rejectWithValue }) => {
	try {
		console.log("Dispatching createCorporateStudentSlotsThunk:", params);
		// TODO: Replace with actual API call
		// const response = await post<CreateSlotsResult>('/corporate/create-slots', params); // Example endpoint
		// Use the mock function for now
		const response = await createCorporateStudentSlots(params); // Assuming this is async and returns the result
		return response;
	} catch (error: any) {
		const errorMessage =
			error instanceof Error ? error.message : "Failed to create student slots";
		return rejectWithValue(errorMessage);
	}
});
