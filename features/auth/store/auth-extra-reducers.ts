// features/auth/store/auth-extra-reducers.ts

import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User, StudentUser } from "@/types/user.types"; // Import StudentUser
import { isStudent } from "@/types/user.types"; // Import type guard
import {
	fetchUserProfileThunk,
	updateUserProfileThunk,
	loginThunk, // Add login/signup if handling state there
	signupThunk,
	// createCorporateStudentSlotsThunk, // No state change needed here for this example
} from "./auth-thunks";
import { AuthResponse } from "../types/auth-types";

export const addAuthExtraReducers = (builder: any) => {
	// Use `any` or import `ActionReducerMapBuilder<AuthState>`

	// --- Handle Login/Signup Success ---
	// These ensure the user object (potentially with purchasedStudentSlots) is set correctly
	builder.addCase(
		loginThunk.fulfilled,
		(state: AuthState, action: PayloadAction<AuthResponse>) => {
			state.isLoading = false;
			state.isAuthenticated = true;
			state.isInitialized = true;
			state.user = action.payload.user; // Set the full user object
			state.token = action.payload.token;
			state.error = null;
			state.skipOnboarding = false; // Reset skip flag on login
		}
	);
	builder.addCase(
		signupThunk.fulfilled,
		(state: AuthState, action: PayloadAction<AuthResponse>) => {
			state.isLoading = false;
			state.isAuthenticated = true;
			state.isInitialized = true;
			state.user = action.payload.user;
			state.token = action.payload.token;
			state.error = null;
			state.skipOnboarding = false; // Reset skip flag on signup
		}
	);
	// Handle Login/Signup Pending/Rejected if needed (usually handled by slice reducers)
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

	// --- FETCH USER PROFILE ---
	builder.addCase(fetchUserProfileThunk.pending, (state: AuthState) => {
		/* ... as before ... */
	});
	builder.addCase(
		fetchUserProfileThunk.fulfilled,
		(state: AuthState, action: PayloadAction<User>) => {
			state.isLoading = false;
			// Merge fetched data with existing user, preserving token etc.
			state.user = {
				...(state.user ?? {}), // Keep existing non-profile fields if any
				...action.payload, // Overwrite with fetched profile data
				role: action.payload.role, // Ensure fetched role is used
			} as User; // Assert type
			state.isAuthenticated = true; // Re-affirm auth status
			state.isInitialized = true; // Mark as initialized
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
			// Decide if fetch failure means logged out
			// state.isAuthenticated = false;
			// state.user = null;
			state.isInitialized = true; // Initialization attempted
		}
	);

	// --- UPDATE USER PROFILE ---
	builder.addCase(updateUserProfileThunk.pending, (state: AuthState) => {
		state.isLoading = true; // Or use a dedicated 'isUpdating' flag
		state.error = null;
	});
	builder.addCase(
		updateUserProfileThunk.fulfilled,
		(state: AuthState, action: PayloadAction<User>) => {
			state.isLoading = false;
			// Update user state with the response from the API
			state.user = action.payload; // API returns the full updated user
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

	// --- Optional: Handle Slot Creation Thunk (if you need to track its status) ---
	// builder.addCase(createCorporateStudentSlotsThunk.pending, (state) => { state.isLoading = true; }); // Example
	// builder.addCase(createCorporateStudentSlotsThunk.fulfilled, (state, action) => { state.isLoading = false; /* Maybe update something? */ });
	// builder.addCase(createCorporateStudentSlotsThunk.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; });
};
