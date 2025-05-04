// features/auth/store/auth-extra-reducers.ts

import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "@/types/user.types";
import { fetchUserProfileThunk, updateUserProfileThunk } from "./auth-thunks";

export const addAuthExtraReducers = (builder: any) => {
	// FETCH USER PROFILE
	builder.addCase(fetchUserProfileThunk.pending, (state: AuthState) => {
		state.isLoading = true;
		state.error = null;
	});

	builder.addCase(
		fetchUserProfileThunk.fulfilled,
		(state: AuthState, action: PayloadAction<User>) => {
			state.isLoading = false;
			if (state.user) {
				// Preserve the role to ensure type safety
				const updatedUser = {
					...state.user,
					...action.payload,
					role: state.user.role, // Keep the original role
				};
				state.user = updatedUser as User;
			}
		}
	);

	builder.addCase(
		fetchUserProfileThunk.rejected,
		(
			state: AuthState,
			action: ReturnType<typeof fetchUserProfileThunk.rejected>
		) => {
			state.isLoading = false;
			state.error = action.error.message || "Failed to fetch user profile";
		}
	);

	// UPDATE USER PROFILE
	builder.addCase(updateUserProfileThunk.pending, (state: AuthState) => {
		state.isLoading = true;
		state.error = null;
	});

	builder.addCase(
		updateUserProfileThunk.fulfilled,
		(state: AuthState, action: PayloadAction<User>) => {
			state.isLoading = false;
			if (state.user) {
				// Preserve the role to ensure type safety
				const updatedUser = {
					...state.user,
					...action.payload,
					role: state.user.role, // Keep the original role
				};
				state.user = updatedUser as User;
			}
		}
	);

	builder.addCase(
		updateUserProfileThunk.rejected,
		(
			state: AuthState,
			action: ReturnType<typeof updateUserProfileThunk.rejected>
		) => {
			state.isLoading = false;
			state.error = action.error.message || "Failed to update user profile";
		}
	);
};
