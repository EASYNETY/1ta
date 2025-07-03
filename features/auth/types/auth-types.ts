// features/auth/types/auth-types.ts
import type { User } from "@/types/user.types";

// API response structure
export interface ApiResponse<T> {
	success: boolean;
	message: string;
	data: T;
}

// Auth response data structure
export interface AuthResponseData {
	user: User;
	tokens: {
		accessToken: string;
		refreshToken: string;
	};
}

// Define the payload type for changing password
export interface ChangePasswordPayload {
	currentPassword: string;
	newPassword: string;
	// No confirmPassword here, as it's usually validated on the frontend
	// and only newPassword is sent to the backend.
}

// Define the expected success response type from the API for this thunk
export interface ChangePasswordSuccessResponse {
	message: string;
	// Add other properties if your API returns more on success
}

// Combined auth response
export type AuthResponse = ApiResponse<AuthResponseData>;

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterData {
	name: string;
	email: string;
	password: string;
	role?: string;
	phone?: string;
	address?: string;
	dateOfBirth?: string;
	referralCode?: string;
	guardianDetails?: {
		name: string;
		email: string;
		password: string;
	};
}

export interface RefreshTokenRequest {
	refreshToken: string;
}

export interface RefreshTokenResponse {
	success: boolean;
	message: string;
	data: {
		tokens: {
			accessToken: string;
			refreshToken: string;
		};
	};
}

export interface ResetPasswordPayload {
	token: string;
	password: string;
	// confirmPassword is only needed for client-side validation
}

export interface UserSubscription {
	id: string;
	planId: string;
	planName: string;
	startDate: string;
	expiryDate: string;
	autoRenew: boolean;
	status: "active" | "expired" | "canceled";
}
