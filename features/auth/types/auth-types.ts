// features/auth/types/auth-types.ts
import type { User } from "@/types/user.types";

export interface AuthResponse {
	user: User;
	token: string;
	refreshToken?: string;
}

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
	guardianDetails?: {
		name: string;
		email: string;
		password: string;
	};
	classId?: string;
	barcodeId?: string;
	guardianId?: string | null;
	cartItems?: any[];
	// Corporate fields
	corporateId?: string;
	isCorporateManager?: boolean;
}

export interface RefreshTokenRequest {
	refreshToken: string;
}

export interface RefreshTokenResponse {
	token: string;
	refreshToken?: string;
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
