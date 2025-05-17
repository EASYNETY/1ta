// features/auth/store/user-thunks.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import { get, del, put } from "@/lib/api-client";
import type { User } from "@/types/user.types";
import type { RootState } from "@/store";

// Interface for users response
export interface UsersResponse {
	users: User[];
}

// Fetch all users
export const fetchAllUsers = createAsyncThunk<
	UsersResponse,
	{ search?: string } | undefined,
	{ state: RootState; rejectValue: string }
>("users/fetchAll", async (params = {}, { rejectWithValue }) => {
	try {
		const { search = "" } = params;
		const queryParams = search ? `?search=${encodeURIComponent(search)}` : "";

		const response = await get<UsersResponse>(`/admin/users${queryParams}`);
		return response;
	} catch (error: any) {
		const message = error?.message || "Failed to fetch users";
		return rejectWithValue(message);
	}
});

// Fetch users by role
export const fetchUsersByRole = createAsyncThunk<
	UsersResponse,
	{ role: string; search?: string },
	{ state: RootState; rejectValue: string }
>("users/fetchByRole", async (params, { rejectWithValue }) => {
	try {
		const { role, search = "" } = params;
		const queryParams = new URLSearchParams({
			role,
			...(search ? { search } : {}),
		}).toString();

		const response = await get<UsersResponse>(`/admin/users?${queryParams}`);
		return response;
	} catch (error: any) {
		const message = error?.message || `Failed to fetch ${params.role}s`;
		return rejectWithValue(message);
	}
});

// Delete user
export const deleteUser = createAsyncThunk<
	{ success: boolean; id: string },
	string,
	{ state: RootState; rejectValue: string }
>("users/delete", async (userId, { rejectWithValue }) => {
	try {
		const response = await del<{ success: boolean; id: string }>(
			`/admin/users/${userId}`
		);
		return response;
	} catch (error: any) {
		const message = error?.message || "Failed to delete user";
		return rejectWithValue(message);
	}
});

// Fetch a single user by ID
export const fetchUserById = createAsyncThunk<
	User,
	string,
	{ state: RootState; rejectValue: string }
>("users/fetchById", async (userId, { rejectWithValue }) => {
	try {
		console.log(`THUNK: Fetching user with ID ${userId}`);
		// Use the admin endpoint to get a user by ID
		const response = await get<User>(`/admin/users/${userId}`);
		return response;
	} catch (error: any) {
		const message = error?.message || `Failed to fetch user with ID ${userId}`;
		console.error(`THUNK ERROR fetching user ${userId}:`, message, error);
		return rejectWithValue(message);
	}
});

// NEW THUNK: Update User (Admin action)
export const updateUserAdmin = createAsyncThunk<
	User, // Expect the updated User object in response
	{ userId: string; userData: Partial<User> }, // Arguments: userId and the data to update
	{ state: RootState; rejectValue: string }
>("users/updateAdmin", async ({ userId, userData }, { rejectWithValue }) => {
	try {
		console.log(`THUNK: Updating user ${userId} with data:`, userData);
		// The API should return the full updated user object
		const response = await put<User>(`/admin/users/${userId}`, userData);
		return response; // Assumes API returns the updated User directly, not nested in { user: ... }
		// If it's nested, adjust to: return response.user;
	} catch (error: any) {
		const message =
			error?.data?.message || error?.message || "Failed to update user";
		console.error(`THUNK ERROR updating user ${userId}:`, message, error);
		return rejectWithValue(message);
	}
});
