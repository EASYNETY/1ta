// features/auth/store/auth-slice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { destroyCookie } from "nookies"; // Import destroyCookie
import { fetchUserProfileThunk, updateUserProfileThunk } from "./auth-thunks";

export interface User {
	id: string;
	name: string;
	email: string;
	role: "admin" | "teacher" | "student";
	dateOfBirth?: string | null;
	classId?: string | null;
	barcodeId?: string | null;
	guardianId?: string | null;
	onboardingStatus?: "incomplete" | "complete";
}

export interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isInitialized: boolean;
	isLoading: boolean;
	error: string | null;
	skipOnboarding: boolean;
}

const initialState: AuthState = {
	user: null,
	token: null,
	isAuthenticated: false,
	isInitialized: false,
	isLoading: false,
	error: null,
	skipOnboarding: false,
};

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		loginStart: (state) => {
			state.isLoading = true;
			state.error = null;
		},
		loginSuccess: (
			state,
			action: PayloadAction<{ user: User; token: string }>
		) => {
			state.isLoading = false;
			state.isAuthenticated = true;
			state.isInitialized = true;
			state.user = action.payload.user;
			state.token = action.payload.token;
			state.error = null;
		},
		loginFailure: (state, action: PayloadAction<string>) => {
			state.isLoading = false;
			state.error = action.payload;
			state.isInitialized = true;
		},
		logout: (state) => {
			state.user = null;
			state.token = null;
			state.isAuthenticated = false;
			state.isInitialized = true;
			state.error = null;
			state.skipOnboarding = false;

			// --- Clear cookies on logout ---
			if (typeof window !== "undefined") {
				// Use destroyCookie, ensure path matches the one used in setCookie
				destroyCookie(null, "authToken", { path: "/" }); // null context for client-side
				destroyCookie(null, "authUser", { path: "/" });
			}
		},
		updateUser: (state, action: PayloadAction<Partial<User>>) => {
			if (state.user) {
				state.user = { ...state.user, ...action.payload };
			}
		},
		initializeAuth: (state) => {
			state.isInitialized = true;
		},
		setOnboardingStatus: (
			state,
			action: PayloadAction<"incomplete" | "complete">
		) => {
			if (state.user) {
				state.user.onboardingStatus = action.payload;
			}
		},
		skipOnboardingProcess: (state) => {
			state.skipOnboarding = true;
		},
		resetSkipOnboarding: (state) => {
			state.skipOnboarding = false;
		},
	},
	extraReducers: (builder) => {
		// Handle fetchUserProfileThunk
		builder.addCase(fetchUserProfileThunk.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(fetchUserProfileThunk.fulfilled, (state, action) => {
			state.isLoading = false;
			if (state.user) {
				state.user = { ...state.user, ...action.payload };
			}
		});
		builder.addCase(fetchUserProfileThunk.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.error.message || "Failed to fetch user profile";
		});

		// Handle updateUserProfileThunk
		builder.addCase(updateUserProfileThunk.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(updateUserProfileThunk.fulfilled, (state, action) => {
			state.isLoading = false;
			if (state.user) {
				state.user = { ...state.user, ...action.payload };
			}
		});
		builder.addCase(updateUserProfileThunk.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.error.message || "Failed to update user profile";
		});
	},
});

export const {
	loginStart,
	loginSuccess,
	loginFailure,
	logout,
	updateUser,
	initializeAuth,
	setOnboardingStatus,
	skipOnboardingProcess,
	resetSkipOnboarding,
} = authSlice.actions;

export default authSlice.reducer;
