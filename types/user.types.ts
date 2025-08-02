// types/user.types.ts

// Defines the possible primary roles within the platform
export type UserRole =
	| "super_admin"
	| "admin"
	| "accounting"
	| "customer_care"
	| "teacher"
	| "student";

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
	barcodeId?: string; // ADDED
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
	createdAt?: string;
	/** ISO 8601 timestamp of last profile update. Read-only. */
	updatedAt?: string;
	/** Indicates if the account is currently active/enabled. Typically managed by Admins. */
	isActive?: boolean;
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
	/** Referral code used during registration. Optional. */
	referralCode?: string | null;
}

// --- Student Specific Information ---
export interface StudentUser extends BaseUser {
	role: "student";

	/** Student's date of birth (ISO format). Required for individual students. Null initially. */
	dateOfBirth?: string | null;
	

	/** Student's preferred pronouns. Optional. Editable via Profile. */
	address?: string | null;

	/** Barcode identifier for attendance scanning. Required after onboarding. */
	barcodeId?: string;

	/** Class the student is assigned to (set during onboarding). Nullable until assigned. */
	classId?: string | null;

	/** Guardian info for minors. Optional. */
	guardianId?: string | null;

	/** Marks if this user manages corporate students. Used to trigger special onboarding UI. */
	isCorporateManager?: boolean;

	/** Corporate identifier (shared with managed users). Required for corporate students and managers. */
	corporateId?: string | null;

	/** Total number of student slots this manager has purchased/is allocated. Null/undefined if not applicable. */
	purchasedStudentSlots?: number | null;

	/** Class object if populated by API */
	class?: any | null;
}

// --- Facilitator Specific Information ---
// Extends BaseUser. `role` is fixed to `"teacher"` (backend role remains "teacher").
export interface TeacherUser extends BaseUser {
	role: "teacher";
	/** Subjects or areas of expertise the facilitator handles. Optional. Editable via Settings. */
	subjects?: string[] | null;
	/** Text description of availability (e.g., "Mon 2-4 PM via Zoom"). Optional. Editable via Settings. */
	officeHours?: string | null;
	// Note: List of facilitated classes (`taughtClassIds`) is fetched separately.
	/** Department the facilitator belongs to (e.g., Academics). Optional. */
	department?: string | null; // ADDED
	/** Shift or schedule information. Optional. */
	shift?: string | null; // ADDED
}

// --- Super Admin Specific Information ---
// Extends BaseUser. `role` is fixed to `"super_admin"`.
export interface SuperAdminUser extends BaseUser {
	role: "super_admin";
	/** List of specific super admin permissions (e.g., 'delete_users', 'manage_system'). Optional for future granular control. For Super Admin, this is often implicitly all '*' */
	permissions?: string[] | null;
	/** Department (e.g., Management, IT). Optional. */
	department?: string | null; // ADDED
	/** Shift or schedule information. Optional. */
	shift?: string | null; // ADDED
}

// --- Admin Specific Information ---
// Extends BaseUser. `role` is fixed to `"admin"`.
export interface AdminUser extends BaseUser {
	role: "admin";
	/** List of specific admin permissions (e.g., 'manage_users'). Optional for future granular control. */
	permissions?: string[] | null;
	/** Department the admin belongs to. Optional. */
	department?: string | null; // ADDED
	/** Shift or schedule information. Optional. */
	shift?: string | null; // ADDED
}

// --- Accounting Specific Information ---
// Extends BaseUser. `role` is fixed to `"accounting"`.
export interface AccountingUser extends BaseUser {
	role: "accounting";
	/** List of specific accounting permissions (e.g., 'view_payments', 'generate_reports'). Optional for future granular control. */
	permissions?: string[] | null;
	/** Department or team within accounting */
	department?: string | null; // This was already here
	/** Shift or schedule information. Optional. */
	shift?: string | null; // ADDED
}

// --- Customer Care Specific Information ---
// Extends BaseUser. `role` is fixed to `"customer_care"`.
export interface CustomerCareUser extends BaseUser {
	role: "customer_care";
	/** List of specific customer care permissions (e.g., 'view_tickets', 'scan_barcodes'). Optional for future granular control. */
	permissions?: string[] | null;
	/** Department the customer care agent belongs to (e.g., Support). Optional. */
	department?: string | null; // ADDED
	/** Shift or schedule information */
	shift?: string | null; // This was already here
}

// --- Union Type ---
// The primary type used across the frontend to represent any authenticated user.
export type User =
	| StudentUser
	| TeacherUser
	| SuperAdminUser
	| AdminUser
	| AccountingUser
	| CustomerCareUser;

// --- Type Guards (Utility Functions) ---
// Helper functions to easily check the role of a `User` object.

export function isStudent(user: User | null | undefined): user is StudentUser {
	return user?.role === "student";
}

export function isTeacher(user: User | null | undefined): user is TeacherUser {
	return user?.role === "teacher";
}

export function isSuperAdmin(
	user: User | null | undefined
): user is SuperAdminUser {
	return user?.role === "super_admin";
}

export function isAdmin(user: User | null | undefined): user is AdminUser {
	return user?.role === "admin";
}

export function isAccounting(
	user: User | null | undefined
): user is AccountingUser {
	return user?.role === "accounting";
}

export function isCustomerCare(
	user: User | null | undefined
): user is CustomerCareUser {
	return user?.role === "customer_care";
}

// Helper function to check if user has admin-level access (super_admin or admin)
export function hasAdminAccess(user: User | null | undefined): boolean {
	return user?.role === "super_admin" || user?.role === "admin";
}

// Helper function to check if user has staff-level access (all roles except student)
export function hasStaffAccess(user: User | null | undefined): boolean {
	// Ensure user and user.role are defined before checking
	return !!user && user.role !== "student";
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
	passwordChangeError: string | null;
	/** UI flag set if the user explicitly skips the onboarding prompt. */
	skipOnboarding: boolean;
	/** Users State Management */
	users: User[];
	totalUsers: number;
	usersLoading: boolean;
	usersError: string | null;
}
