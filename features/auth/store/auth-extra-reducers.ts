// features/auth/store/auth-extra-reducers.ts
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "@/types/user.types";
import {
	fetchUserProfileThunk,
	updateUserProfileThunk,
	loginThunk,
	signupThunk,
	refreshTokenThunk,
} from "./auth-thunks";
import type { AuthResponse } from "../types/auth-types";

export const addAuthExtraReducers = (builder: any) => {
	// --- Handle Login/Signup Success ---
	builder.addCase(
		loginThunk.fulfilled,
		(state: AuthState, action: PayloadAction<AuthResponse>) => {
			state.isLoading = false;
			state.isAuthenticated = true;
			state.isInitialized = true;
			state.user = action.payload.data.user;
			state.token = action.payload.data.tokens.accessToken;
			state.error = null;
			state.skipOnboarding = false;
		}
	);

	builder.addCase(
		signupThunk.fulfilled,
		(state: AuthState, action: PayloadAction<AuthResponse>) => {
			state.isLoading = false;
			state.isAuthenticated = true;
			state.isInitialized = true;
			state.user = action.payload.data.user;
			state.token = action.payload.data.tokens.accessToken;
			state.error = null;
			state.skipOnboarding = false;
		}
	);

	// Handle Login/Signup Pending/Rejected
	builder.addCase(loginThunk.pending, (state: AuthState) => {
		state.isLoading = true;
		state.error = null;
	});

	builder.addCase(signupThunk.pending, (state: AuthState) => {
		state.isLoading = true;
		state.error = null;
	});

	builder.addCase(
		loginThunk.rejected,
		(state: AuthState, action: ReturnType<typeof loginThunk.rejected>) => {
			state.isLoading = false;
			state.error = (action.payload as string) ?? "Login failed";
			state.isInitialized = true;
		}
	);

	builder.addCase(
		signupThunk.rejected,
		(state: AuthState, action: ReturnType<typeof signupThunk.rejected>) => {
			state.isLoading = false;
			state.error = (action.payload as string) ?? "Signup failed";
			state.isInitialized = true;
		}
	);

	// --- Handle Token Refresh ---
	builder.addCase(
		refreshTokenThunk.fulfilled,
		(
			state: AuthState,
			action: PayloadAction<{ token: string; refreshToken?: string }>
		) => {
			state.token = action.payload.token;
			// No need to update refreshToken in state as it's stored in cookies/localStorage
		}
	);

	builder.addCase(refreshTokenThunk.rejected, (state: AuthState) => {
		// If token refresh fails, log the user out
		state.user = null;
		state.token = null;
		state.isAuthenticated = false;
		state.error = "Session expired. Please log in again.";
	});

	// --- FETCH USER PROFILE ---
	builder.addCase(fetchUserProfileThunk.pending, (state: AuthState) => {
		state.isLoading = true;
		state.error = null;
	});

	builder.addCase(
		fetchUserProfileThunk.fulfilled,
		(state: AuthState, action: PayloadAction<User>) => {
			state.isLoading = false;
			state.user = {
				...(state.user ?? {}),
				...action.payload,
				role: action.payload.role,
			} as User;
			state.isAuthenticated = true;
			state.isInitialized = true;
		}
	);

	builder.addCase(
		fetchUserProfileThunk.rejected,
		(
			state: AuthState,
			action: ReturnType<typeof fetchUserProfileThunk.rejected>
		) => {
			state.isLoading = false;
			state.error = action.payload ?? "Failed to fetch profile";
			state.isInitialized = true;
		}
	);

	// --- UPDATE USER PROFILE ---
	builder.addCase(updateUserProfileThunk.pending, (state: AuthState) => {
		state.isLoading = true;
		state.error = null;
	});

	builder.addCase(
		updateUserProfileThunk.fulfilled,
		(state: AuthState, action: PayloadAction<User>) => {
			state.isLoading = false;
			state.user = action.payload;
		}
	);

	builder.addCase(
		updateUserProfileThunk.rejected,
		(
			state: AuthState,
			action: ReturnType<typeof updateUserProfileThunk.rejected>
		) => {
			state.isLoading = false;
			state.error = action.payload ?? "Failed to update profile";
		}
	);
};
