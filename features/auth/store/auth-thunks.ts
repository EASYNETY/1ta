// features/auth/store/auth-thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { post, get, put, ApiError } from "@/lib/live/api-client";
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
	async (_, { rejectWithValue, getState }) => {
		try {
			const response = await get<{ success: boolean; data: User }>("/users/me");
			return response.data;
		} catch (error: any) {
			if (error.status === 401) {
				// Try to refresh the token if we get a 401
				try {
					const { refreshAuthToken } = await import("@/lib/auth-service");
					await refreshAuthToken();
					// If refresh succeeds, retry the original request
					const response = await get<{ success: boolean; data: User }>(
						"/users/me"
					);
					return response.data;
				} catch (refreshError) {
					// If refresh fails, reject with the original error
					return rejectWithValue("Authentication required");
				}
			}

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
		const errorMessage =
			error instanceof Error ? error.message : "Failed to update profile";
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
