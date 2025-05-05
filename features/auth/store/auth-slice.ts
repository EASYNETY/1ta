// features/auth/store/auth-slice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { destroyCookie } from "nookies"; // Import destroyCookie
import { addAuthExtraReducers } from "./auth-extra-reducers";
import type { User, AuthState } from "@/types/user.types";

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
				const { role: _, ...rest } = action.payload; // Exclude role if present

				state.user = {
					...state.user,
					...rest,
					role: state.user.role, // Ensure role stays the same
				} as User;
			}
		},
		initializeAuth: (state) => {
			state.isInitialized = true;
		},
		setOnboardingStatus: (
			state,
			action: PayloadAction<"incomplete" | "complete" | "pending_verification">
		) => {
			if (state.user) {
				state.user = {
					...state.user,
					onboardingStatus: action.payload,
				} as User;
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
		addAuthExtraReducers(builder);
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
