// features/auth/store/user-thunks.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import { get, del, put, post } from "@/lib/api-client";
import type { User } from "@/types/user.types";
import type { RootState } from "@/store";

// Interface for backend pagination response
export interface BackendPagination {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

// Interface for backend users response
export interface BackendUsersResponse {
	users: any[]; // Raw backend user objects
	pagination: BackendPagination;
}

// Interface for processed users response (for Redux state)
export interface UsersResponse {
	users: User[];
	totalUsers?: number;
	currentPage?: number;
	totalPages?: number;
}

// Helper function to convert backend user object to our User type
function convertBackendUserToUser(backendUser: any): User {
	return {
		id: backendUser.id,
		name: backendUser.name,
		email: backendUser.email,
		role: backendUser.role,
		isActive: Boolean(backendUser.isActive),
		onboardingStatus: backendUser.onboardingStatus || "incomplete",
		accountType: backendUser.accountType || "individual",
		phone: backendUser.phone || null,
		bio: backendUser.bio || null,
		dateOfBirth: backendUser.dateOfBirth || null,
		barcodeId: backendUser.barcodeId || null,
		classId: backendUser.class || null, // Backend uses 'class', we use 'classId'
		isCorporateManager: Boolean(backendUser.isCorporateManager),
		subjects: backendUser.subjects || null,
		permissions: backendUser.permissions || null,
		createdAt: backendUser.createdAt,
		updatedAt: backendUser.updatedAt,
	};
}

// Fetch all users with server-side pagination
export const fetchAllUsers = createAsyncThunk<
	UsersResponse,
	{ search?: string; page?: number; limit?: number } | undefined,
	{ state: RootState; rejectValue: string }
>("users/fetchAll", async (params = {}, { rejectWithValue }) => {
	try {
		const { search = "", page = 1, limit = 10 } = params;

		// Build query parameters for backend API
		const queryParams = new URLSearchParams();
		if (search) queryParams.append("search", search);
		queryParams.append("page", page.toString());
		queryParams.append("limit", limit.toString());

		const queryString = queryParams.toString();
		const endpoint = `/admin/users${queryString ? `?${queryString}` : ""}`;


		// Call the real backend API
		const backendResponse = await get<BackendUsersResponse>(endpoint);
		// Convert backend response to our format
		const convertedUsers = backendResponse.users.map(convertBackendUserToUser);

		const response: UsersResponse = {
			users: convertedUsers,
			totalUsers: backendResponse.pagination.total,
			currentPage: backendResponse.pagination.page,
			totalPages: backendResponse.pagination.totalPages,
		};
		return response;
	} catch (error: any) {
		const message = error?.message || "Failed to fetch users";
		return rejectWithValue(message);
	}
});

// Fetch users by role with server-side pagination
export const fetchUsersByRole = createAsyncThunk<
	UsersResponse,
	{ role: string; search?: string; page?: number; limit?: number },
	{ state: RootState; rejectValue: string }
>("users/fetchByRole", async (params, { rejectWithValue }) => {
	try {
		const { role, search = "", page = 1, limit = 10 } = params;

		// Build query parameters for backend API
		const queryParams = new URLSearchParams();
		queryParams.append("role", role);
		if (search) queryParams.append("search", search);
		queryParams.append("page", page.toString());
		queryParams.append("limit", limit.toString());

		const queryString = queryParams.toString();
		const endpoint = `/admin/users?${queryString}`;


		// Call the real backend API
		const backendResponse = await get<BackendUsersResponse>(endpoint);

		// Convert backend response to our format
		const convertedUsers = backendResponse.users.map(
			convertBackendUserToUser
		);

		const response: UsersResponse = {
			users: convertedUsers,
			totalUsers: backendResponse.pagination.total,
			currentPage: backendResponse.pagination.page,
			totalPages: backendResponse.pagination.totalPages,
		};

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
		// Use the admin endpoint to get a user by ID
		const response = await get<User>(`/admin/users/${userId}`);
		return response;
	} catch (error: any) {
		const message = error?.message || `Failed to fetch user with ID ${userId}`;
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
		// The API should return the full updated user object
		const response = await put<User>(`/admin/users/${userId}`, userData);
		return response; // Assumes API returns the updated User directly, not nested in { user: ... }
		// If it's nested, adjust to: return response.user;
	} catch (error: any) {
		const message =
			error?.data?.message || error?.message || "Failed to update user";
		return rejectWithValue(message);
	}
});

// NEW THUNK: Create User (Admin action)
export const createUserAdmin = createAsyncThunk<
	User, // Expect the created User object in response
	Partial<User>, // Arguments: the user data to create
	{ state: RootState; rejectValue: string }
>("users/createAdmin", async (userData, { rejectWithValue }) => {
	try {
		// The API should return the full created user object
		const response = await post<User>(`/admin/users`, userData);
		return response; // Assumes API returns the created User directly
	} catch (error: any) {
		const message =
			error?.data?.message || error?.message || "Failed to create user";
		return rejectWithValue(message);
	}
});
