// features/auth/store/auth-extra-reducers.ts
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "@/types/user.types";
import {
	fetchUserProfileThunk,
	updateUserProfileThunk,
	loginThunk,
	signupThunk,
	refreshTokenThunk,
	createCorporateStudentSlotsThunk,
	changePasswordThunk,
} from "./auth-thunks";
import type {
	AuthResponse,
	ChangePasswordSuccessResponse,
} from "../types/auth-types";
import {
	deleteUser,
	fetchAllUsers,
	fetchAllUsersComplete,
	fetchUserById,
	fetchUsersByRole,
	createUserAdmin,
} from "./user-thunks";
import { ContextMenuSeparator } from "@radix-ui/react-context-menu";

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

	// --- Handle Change Password Thunk ---
	builder
		.addCase(changePasswordThunk.pending, (state: AuthState) => {
			state.isLoading = true;
			state.error = null;
		})
		.addCase(
			changePasswordThunk.fulfilled,
			(
				state: AuthState,
				action: PayloadAction<ChangePasswordSuccessResponse> // Use the defined success response type
			) => {
				state.isLoading = false;
				// action.payload is now correctly typed as ChangePasswordSuccessResponse
				console.log("Password change successful:", action.payload.message);
				// You might want to clear any specific password change error here if you had one
				// e.g., state.passwordChangeError = null;
			}
		)
		.addCase(
			changePasswordThunk.rejected,
			(
				state: AuthState,
				action: ReturnType<typeof changePasswordThunk.rejected> // This correctly infers the payload as string (rejectValue)
			) => {
				state.isLoading = false;
				state.error = action.payload ?? "Failed to change password"; // action.payload is the string from rejectValue
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

			// Make sure we have a valid payload before trying to access properties
			if (action.payload) {
				state.user = {
					...(state.user ?? {}),
					...action.payload,
					// Only set role if it exists in the payload
					role: action.payload.role || state.user?.role || "student",
				} as User;
				state.isAuthenticated = true;
			} else {
				console.error(
					"Received empty user payload in fetchUserProfileThunk.fulfilled"
				);
			}

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

	// --- CREATE CORPORATE STUDENT SLOTS ---
	builder.addCase(
		createCorporateStudentSlotsThunk.pending,
		(state: AuthState) => {
			state.isLoading = true;
			state.error = null;
		}
	);

	builder.addCase(
		createCorporateStudentSlotsThunk.fulfilled,
		(state: AuthState) => {
			state.isLoading = false;
			// We don't need to update any state here as this doesn't directly affect the auth state
		}
	);

	builder.addCase(
		createCorporateStudentSlotsThunk.rejected,
		(
			state: AuthState,
			action: ReturnType<typeof createCorporateStudentSlotsThunk.rejected>
		) => {
			state.isLoading = false;
			state.error =
				action.payload ?? "Failed to create corporate student slots";
		}
	);

	// --- FETCH ALL USERS ---
	builder.addCase(fetchAllUsers.pending, (state: AuthState) => {
		state.usersLoading = true;
		state.usersError = null;
	});

	builder.addCase(
		fetchAllUsers.fulfilled,
		(
			state: AuthState,
			action: PayloadAction<{ users: User[]; totalUsers: number }>
		) => {
			state.usersLoading = false;
			// Ensure users is always an array, even if API returns null/undefined
			state.users = action.payload.users || [];
			state.totalUsers = action.payload.totalUsers || 0;
		}
	);

	builder.addCase(
		fetchAllUsers.rejected,
		(state: AuthState, action: ReturnType<typeof fetchAllUsers.rejected>) => {
			state.usersLoading = false;
			state.usersError = action.payload ?? "Failed to fetch users";
		}
	);

	// --- FETCH ALL USERS COMPLETE (ALL PAGES) ---
	builder.addCase(fetchAllUsersComplete.pending, (state: AuthState) => {
		state.usersLoading = true;
		state.usersError = null;
	});

	builder.addCase(
		fetchAllUsersComplete.fulfilled,
		(
			state: AuthState,
			action: PayloadAction<{ users: User[]; totalUsers: number }>
		) => {
			state.usersLoading = false;
			// Ensure users is always an array, even if API returns null/undefined
			state.users = action.payload.users || [];
			state.totalUsers = action.payload.totalUsers || 0;
		}
	);

	builder.addCase(
		fetchAllUsersComplete.rejected,
		(
			state: AuthState,
			action: ReturnType<typeof fetchAllUsersComplete.rejected>
		) => {
			state.usersLoading = false;
			state.usersError = action.payload ?? "Failed to fetch all users";
		}
	);

	// --- FETCH USERS BY ROLE ---
	builder.addCase(fetchUsersByRole.pending, (state: AuthState) => {
		state.usersLoading = true;
		state.usersError = null;
	});

	builder.addCase(
		fetchUsersByRole.fulfilled,
		(
			state: AuthState,
			action: PayloadAction<{ users: User[]; totalUsers: number }>
		) => {
			state.usersLoading = false;
			// Ensure users is always an array, even if API returns null/undefined
			state.users = action.payload.users || [];
			state.totalUsers = action.payload.totalUsers || 0;
		}
	);

	builder.addCase(
		fetchUsersByRole.rejected,
		(
			state: AuthState,
			action: ReturnType<typeof fetchUsersByRole.rejected>
		) => {
			state.usersLoading = false;
			state.usersError = action.payload ?? "Failed to fetch users by role";
		}
	);

	// --- DELETE USER ---
	builder.addCase(
		deleteUser.fulfilled,
		(
			state: AuthState,
			action: PayloadAction<{ success: boolean; id: string }>
		) => {
			if (action.payload.success) {
				state.users = state.users.filter(
					(user) => user.id !== action.payload.id
				);
				state.totalUsers = Math.max(0, state.totalUsers - 1);
			}
		}
	);

	// --- FETCH USER BY ID ---
	builder.addCase(fetchUserById.pending, (state: AuthState) => {
		state.usersLoading = true;
		state.usersError = null;
	});

	builder.addCase(
		fetchUserById.fulfilled,
		(state: AuthState, action: PayloadAction<User>) => {
			state.usersLoading = false;

			// If the user is not already in the users array, add it
			if (!state.users.some((user) => user.id === action.payload.id)) {
				state.users = [...state.users, action.payload];
			} else {
				// Otherwise, update the existing user in the array
				state.users = state.users.map((user) =>
					user.id === action.payload.id ? action.payload : user
				);
			}
		}
	);

	builder.addCase(
		fetchUserById.rejected,
		(state: AuthState, action: ReturnType<typeof fetchUserById.rejected>) => {
			state.usersLoading = false;
			state.usersError = action.payload ?? "Failed to fetch user";
		}
	);
	// --- CREATE USER (ADMIN) ---
	builder.addCase(createUserAdmin.pending, (state: AuthState) => {
		state.usersLoading = true;
		state.usersError = null;
	});

	builder.addCase(
		createUserAdmin.fulfilled,
		(state: AuthState, action: PayloadAction<User>) => {
			state.usersLoading = false;
			// Add the new user to the users array
			state.users = [...state.users, action.payload];
			state.totalUsers = state.totalUsers + 1;
		}
	);

	builder.addCase(
		createUserAdmin.rejected,
		(state: AuthState, action: ReturnType<typeof createUserAdmin.rejected>) => {
			state.usersLoading = false;
			state.usersError = action.payload ?? "Failed to create user";
		}
	);
};
