// features/auth/store/auth-slice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { destroyCookie } from "nookies"; // Import destroyCookie

export interface User {
	id: string;
	name: string;
	email: string;
	role: "admin" | "teacher" | "student";
}

export interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isInitialized: boolean;
	isLoading: boolean;
	error: string | null;
}

const initialState: AuthState = {
	user: null,
	token: null,
	isAuthenticated: false,
	isInitialized: false,
	isLoading: false,
	error: null,
};

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		// ... (loginStart, loginSuccess, loginFailure, updateUser, initializeAuth remain the same) ...
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
	},
});

export const {
	loginStart,
	loginSuccess,
	loginFailure,
	logout,
	updateUser,
	initializeAuth,
} = authSlice.actions;

export default authSlice.reducer;
