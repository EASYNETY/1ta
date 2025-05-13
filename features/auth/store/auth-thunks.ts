// features/auth/store/auth-thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { post, get, put, ApiError } from "@/lib/live/auth-api-client";
import type { User, AuthState } from "@/types/user.types";
import type {
	AuthResponse,
	LoginCredentials,
	RegisterData,
	ResetPasswordPayload,
} from "../types/auth-types";
import { setAuthData } from "@/lib/auth-service";
import { AUTH_ACTIONS } from "./auth-action-types";

// --- Login Thunk ---
export const loginThunk = createAsyncThunk(
	"auth/login",
	async (credentials: LoginCredentials, { dispatch }) => {
		try {
			dispatch({ type: AUTH_ACTIONS.LOGIN_START });

			const response = await post<AuthResponse>("/auth/login", credentials, {
				requiresAuth: false,
			});

			// Extract user and tokens from the response
			const { user, tokens } = response.data;
			const { accessToken, refreshToken } = tokens;

			// Store auth data
			setAuthData(user, accessToken, refreshToken);

			dispatch({
				type: AUTH_ACTIONS.LOGIN_SUCCESS,
				payload: {
					user,
					token: accessToken,
				},
			});

			return response;
		} catch (error: any) {
			let errorMessage = "Login failed";

			if (error instanceof ApiError && error.data) {
				errorMessage = error.data.message || errorMessage;
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}

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
	async (userData: RegisterData, { dispatch }) => {
		try {
			dispatch({ type: AUTH_ACTIONS.LOGIN_START });

			// Ensure role is set to "student" if not provided
			const fullPayload = {
				...userData,
				role: userData.role || "student",
			};

			const response = await post<AuthResponse>("/auth/register", fullPayload, {
				requiresAuth: false,
			});

			// Extract user and tokens from the response
			const { user, tokens } = response.data;
			const { accessToken, refreshToken } = tokens;

			// Store auth data
			setAuthData(user, accessToken, refreshToken);

			dispatch({
				type: AUTH_ACTIONS.LOGIN_SUCCESS,
				payload: {
					user,
					token: accessToken,
				},
			});

			return response;
		} catch (error: any) {
			let errorMessage = "Registration failed";

			if (error instanceof ApiError && error.data) {
				errorMessage = error.data.message || errorMessage;

				// Handle validation errors
				if (error.data.errors && Array.isArray(error.data.errors)) {
					const validationErrors = error.data.errors
						.map((err: any) => `${err.path}: ${err.msg}`)
						.join(", ");

					errorMessage = `${errorMessage}: ${validationErrors}`;
				}
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}

			dispatch({
				type: AUTH_ACTIONS.LOGIN_FAILURE,
				payload: errorMessage,
			});

			throw error;
		}
	}
);

// --- Refresh Token Thunk ---
export const refreshTokenThunk = createAsyncThunk(
	"auth/refreshToken",
	async (_, { dispatch, rejectWithValue }) => {
		try {
			// Use the direct function from auth-service
			const { refreshAuthToken } = await import("@/lib/auth-service");
			const { token, refreshToken } = await refreshAuthToken();

			// Update the token in auth state
			dispatch({
				type: AUTH_ACTIONS.TOKEN_REFRESHED,
				payload: {
					token,
					refreshToken,
				},
			});

			return { token, refreshToken };
		} catch (error: any) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to refresh token";
			return rejectWithValue(errorMessage);
		}
	}
);

// --- Fetch User Profile Thunk ---
export const fetchUserProfileThunk = createAsyncThunk<
	User,
	void,
	{
		rejectValue: string;
		state: { auth: AuthState };
	}
>(
	"auth/fetchUserProfile",
	async (_, { rejectWithValue, getState, dispatch }) => {
		try {
			const response = await get<{ success: boolean; data: User }>("/users/me");

			// Ensure we have valid data before returning
			if (!response || !response.data) {
				return rejectWithValue("Invalid response format from API");
			}

			return response.data;
		} catch (error: any) {
			// Note: We don't need to handle 401 errors here anymore since the API client
			// will automatically attempt to refresh the token and retry the request.
			// This is just a fallback in case that mechanism fails.

			if (error.status === 401) {
				// If we still get a 401 after the API client's refresh attempt,
				// it means the refresh token is invalid or expired
				console.error("Failed to authenticate user after token refresh attempt");

				// Dispatch logout action to clear auth state
				dispatch({ type: AUTH_ACTIONS.LOGOUT });

				return rejectWithValue("Your session has expired. Please log in again.");
			}

			// For network errors, provide a more user-friendly message
			if (error.isNetworkError) {
				return rejectWithValue("Network error. Please check your internet connection and try again.");
			}

			// For other errors, use the error message from the API
			const errorMessage = error.message || "Failed to fetch user profile";
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

// --- Update User Profile Thunk ---
export const updateUserProfileThunk = createAsyncThunk<
	User,
	Partial<User>,
	{ rejectValue: string }
>("auth/updateUserProfile", async (profileData, { rejectWithValue }) => {
	try {
		const response = await put<{ success: boolean; data: User }>(
			"/users/me",
			profileData
		);
		return response.data;
	} catch (error: any) {
		let errorMessage = "Failed to update profile";

		if (error instanceof ApiError && error.data) {
			errorMessage = error.data.message || errorMessage;

			// Handle validation errors
			if (error.data.errors && Array.isArray(error.data.errors)) {
				const validationErrors = error.data.errors
					.map((err: any) => `${err.path}: ${err.msg}`)
					.join(", ");

				errorMessage = `${errorMessage}: ${validationErrors}`;
			}
		} else if (error instanceof Error) {
			errorMessage = error.message;
		}

		return rejectWithValue(errorMessage);
	}
});

// --- Forgot Password Thunk ---
export const forgotPasswordThunk = createAsyncThunk<
	{ message: string },
	{ email: string },
	{ rejectValue: string }
>("auth/forgotPassword", async (payload, { rejectWithValue }) => {
	try {
		const response = await post<{ success: boolean; message: string }>(
			"/auth/forgot-password",
			payload,
			{
				requiresAuth: false,
			}
		);
		return { message: response.message };
	} catch (error: any) {
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to send password reset link.";
		return rejectWithValue(errorMessage);
	}
});

// --- Reset Password Thunk ---
export const resetPasswordThunk = createAsyncThunk<
	{ message: string },
	ResetPasswordPayload,
	{ rejectValue: string }
>("auth/resetPassword", async (payload, { rejectWithValue }) => {
	try {
		// Ensure only token and password are sent, not confirmPassword
		const apiPayload = { token: payload.token, password: payload.password };
		const response = await post<{ success: boolean; message: string }>(
			"/auth/reset-password",
			apiPayload,
			{
				requiresAuth: false,
			}
		);
		return { message: response.message };
	} catch (error: any) {
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to reset password. Link may be invalid/expired.";
		return rejectWithValue(errorMessage);
	}
});

// --- Create Corporate Student Slots Thunk ---
interface CreateSlotsParams {
	corporateId: string;
	studentCount: number;
	courses: string[];
}

interface CreateSlotsResult {
	success: boolean;
	message: string;
	data?: {
		createdCount: number;
		failedCount: number;
	};
}

export const createCorporateStudentSlotsThunk = createAsyncThunk<
	CreateSlotsResult,
	CreateSlotsParams,
	{ rejectValue: string }
>("auth/createCorporateStudentSlots", async (payload, { rejectWithValue }) => {
	try {
		const response = await post<CreateSlotsResult>(
			"/corporate/student-slots",
			payload
		);
		return response;
	} catch (error: any) {
		let errorMessage = "Failed to create corporate student slots";

		if (error instanceof ApiError && error.data) {
			errorMessage = error.data.message || errorMessage;
		} else if (error instanceof Error) {
			errorMessage = error.message;
		}

		return rejectWithValue(errorMessage);
	}
});
