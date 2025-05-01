// features/auth/types/auth-types.ts

import type { User } from "../store/auth-thunks";

export interface AuthResponse {
	user: User;
	token: string;
}

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterData {
	name: string;
	email: string;
	password: string;
	dateOfBirth?: string;
	classId?: string;
	barcodeId?: string;
	guardianId?: null;
	cartItems?: any[];
}

export interface ResetPasswordPayload {
	token: string;
	password: string;
	// confirmPassword is only needed for client-side validation
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

export interface UserSubscription {
	id: string;
	planId: string;
	planName: string;
	startDate: string;
	expiryDate: string;
	autoRenew: boolean;
	status: "active" | "expired" | "canceled";
}
