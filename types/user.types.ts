// src/types/user.types.ts
// (Or place in src/features/auth/types/auth-types.ts if preferred)

// Defines the possible primary roles within the platform
export type UserRole = "admin" | "teacher" | "student" | "receptionist";

// Defines the nature of the account, often defaulted by backend or set by Admin
export type AccountType = "individual" | "corporate" | "institutional";

// Defines the user's progress through initial profile setup
export type OnboardingStatus =
	| "incomplete"
	| "complete"
	| "pending_verification";

// --- Base User Information ---
// Properties common to all authenticated users.
export interface BaseUser {
	/** Unique identifier (UUID or DB ID). */
	id: string;
	/** User's primary email address (login identifier). Unique. Typically read-only after creation. */
	email: string;
	/** The user's designated role. Determines permissions and UI views. */
	role: UserRole;
	/** User's full name. Editable via Profile. */
	name: string;
	/** Tracks completion of initial profile setup (`'incomplete'` or `'complete'`). Set by backend. Critical for redirect logic. */
	onboardingStatus: OnboardingStatus;
	/** Nature of the account (personal, company, etc.). Defaulted by backend (e.g., 'individual'). Not set by student onboarding form. Can be changed by Admin. */
	accountType: AccountType;
	/** ISO 8601 timestamp of account creation. Read-only. */
	createdAt: string;
	/** ISO 8601 timestamp of last profile update. Read-only. */
	updatedAt: string;
	/** Indicates if the account is currently active/enabled. Typically managed by Admins. */
	isActive: boolean;
	/** URL of the user's profile picture. Optional. */
	avatarUrl?: string | null;
	/** User's contact phone number. Optional. Editable via Profile. */
	phone?: string | null;
	/** Short user biography or description. Optional. Editable via Profile. */
	bio?: string | null;
	/** ISO 8601 timestamp of the last successful login. Optional. Updated by backend. */
	lastLogin?: string | null;
	/** Identifier linking user to a Corporate Account (for pricing). Managed by Admin. Null for individual users. */
	corporateId?: string | null;
	/** Display name of the linked corporate account. For frontend convenience. */
	corporateAccountName?: string | null;
}

// --- Student Specific Information ---
// Extends BaseUser. `role` is fixed to `"student"`.
export interface StudentUser extends BaseUser {
	role: "student";
	/** Student's date of birth (ISO format). Must be provided to complete onboarding. Null initially. */
	dateOfBirth: string | null; // Changed back to nullable initially, becomes string on completion
	/** Barcode identifier for attendance scanning. Should be generated/assigned reliably. */
	barcodeId: string; // Made non-nullable as it's essential for the scanning flow
	/** ID of the initial class selected during onboarding (Optional by form). Can remain `null` after onboarding. */
	classId?: string | null;
	/** Foreign key to `Guardian` record. Optional. */
	guardianId?: string | null;
	// Note: Enrolled courses and subscription details are typically fetched separately, not stored directly on the main user object.
}

// --- Teacher Specific Information ---
// Extends BaseUser. `role` is fixed to `"teacher"`.
export interface TeacherUser extends BaseUser {
	role: "teacher";
	/** Subjects or areas of expertise the teacher handles. Optional. Editable via Settings. */
	subjects?: string[];
	/** Text description of availability (e.g., "Mon 2-4 PM via Zoom"). Optional. Editable via Settings. */
	officeHours?: string;
	// Note: List of taught classes (`taughtClassIds`) is fetched separately.
}

// --- Admin Specific Information ---
// Extends BaseUser. `role` is fixed to `"admin"`.
export interface AdminUser extends BaseUser {
	role: "admin";
	/** List of specific admin permissions (e.g., 'manage_users'). Optional for future granular control. */
	permissions?: string[];
}

// --- Receptionist Specific Information ---
// Extends BaseUser. `role` is fixed to `"receptionist"`.
export interface ReceptionistUser extends BaseUser {
	role: "receptionist";
	// Add specific receptionist fields if needed (e.g., assigned locationId)
}

// --- Union Type ---
// The primary type used across the frontend to represent any authenticated user.
export type User = StudentUser | TeacherUser | AdminUser | ReceptionistUser;

// --- Type Guards (Utility Functions) ---
// Helper functions to easily check the role of a `User` object.

export function isStudent(user: User | null | undefined): user is StudentUser {
	return user?.role === "student";
}

export function isTeacher(user: User | null | undefined): user is TeacherUser {
	return user?.role === "teacher";
}

export function isAdmin(user: User | null | undefined): user is AdminUser {
	return user?.role === "admin";
}

export function isReceptionist(
	user: User | null | undefined
): user is ReceptionistUser {
	return user?.role === "receptionist";
}

// --- AuthState Interface (Redux) ---
// Defines the structure of the `auth` slice in the Redux store.
export interface AuthState {
	/** The currently authenticated user object, or null if logged out. */
	user: User | null;
	/** The JWT authentication token. */
	token: string | null;
	/** True if `user` and `token` are validly set. Derived state. */
	isAuthenticated: boolean;
	/** True once the initial auth state check (e.g., from storage/cookie) is complete. Prevents UI flashes. */
	isInitialized: boolean;
	/** True during login, registration, or profile update API calls. */
	isLoading: boolean;
	/** Stores error messages from failed auth operations. */
	error: string | null;
	/** UI flag set if the user explicitly skips the onboarding prompt. */
	skipOnboarding: boolean;
}
