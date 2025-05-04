// src/data/mock-auth-data.ts

import type {
	User,
	StudentUser,
	TeacherUser,
	AdminUser,
} from "@/types/user.types";
import { isStudent } from "@/types/user.types";
import type { AuthResponse } from "@/features/auth/types/auth-types";

// Define a type for the mock user with password
export type MockUser = {
	id: string;
	name: string;
	email: string;
	password: string;
	role: "admin" | "teacher" | "student";
	dateOfBirth: string | null;
	classId: string | null;
	barcodeId: string;
	guardianId: null;
	onboardingStatus: "incomplete" | "complete" | "pending_verification";
	accountType: "individual" | "corporate" | "institutional";
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	avatarUrl?: string | null;
	phone?: string | null;
	bio?: string | null;
	lastLogin?: string | null;
	corporateId?: string | null;
	corporateAccountName?: string | null;
	// Student specific
	isCorporateManager?: boolean;
	// Teacher specific
	subjects?: string[];
	officeHours?: string;
	// Admin specific
	permissions?: string[];
};

// Mock user database with enhanced user data
export const users: MockUser[] = [
	{
		id: "admin_1",
		name: "Admin User",
		email: "admin@example.com",
		password: "password123",
		role: "admin",
		dateOfBirth: "1990-01-01T00:00:00.000Z",
		classId: null,
		barcodeId: "ADMIN-123",
		guardianId: null,
		onboardingStatus: "complete",
		accountType: "individual",
		isActive: true,
		createdAt: "2023-01-01T00:00:00.000Z",
		updatedAt: "2023-01-01T00:00:00.000Z",
		lastLogin: "2023-05-01T10:30:00.000Z",
		permissions: ["manage_users", "manage_courses", "manage_billing"],
	},
	{
		id: "teacher_1",
		name: "Teacher User",
		email: "teacher@example.com",
		password: "password123",
		role: "teacher",
		dateOfBirth: "1985-01-01T00:00:00.000Z",
		classId: "class_1",
		barcodeId: "TEACHER-123",
		guardianId: null,
		onboardingStatus: "complete",
		accountType: "individual",
		isActive: true,
		createdAt: "2023-01-15T00:00:00.000Z",
		updatedAt: "2023-01-15T00:00:00.000Z",
		lastLogin: "2023-05-02T09:15:00.000Z",
		subjects: ["Web Development", "JavaScript"],
		officeHours: "Mon, Wed 2-4PM",
	},
	{
		id: "student_1",
		name: "Student User",
		email: "student@example.com",
		password: "password123",
		role: "student",
		dateOfBirth: "2000-01-01T00:00:00.000Z",
		classId: "class_1",
		barcodeId: "STUDENT-123",
		guardianId: null,
		onboardingStatus: "complete",
		accountType: "individual",
		isActive: true,
		createdAt: "2023-02-01T00:00:00.000Z",
		updatedAt: "2023-02-01T00:00:00.000Z",
		lastLogin: "2023-05-03T14:20:00.000Z",
		isCorporateManager: false,
	},
	{
		id: "student_2",
		name: "New Student",
		email: "newstudent@example.com",
		password: "password123",
		role: "student",
		dateOfBirth: null,
		classId: null,
		barcodeId: "TEMP-123",
		guardianId: null,
		onboardingStatus: "incomplete",
		accountType: "individual",
		isActive: true,
		createdAt: "2023-04-15T00:00:00.000Z",
		updatedAt: "2023-04-15T00:00:00.000Z",
		isCorporateManager: false,
	},
	{
		id: "corp_manager_1",
		name: "Corporate Manager",
		email: "corpmanager@example.com",
		password: "password123",
		role: "student",
		dateOfBirth: "1988-05-12T00:00:00.000Z",
		classId: "class_2",
		barcodeId: "CORP-MGR-123",
		guardianId: null,
		onboardingStatus: "complete",
		accountType: "corporate",
		isActive: true,
		createdAt: "2023-03-10T00:00:00.000Z",
		updatedAt: "2023-03-10T00:00:00.000Z",
		lastLogin: "2023-05-01T11:45:00.000Z",
		corporateId: "corp_xyz123",
		corporateAccountName: "XYZ Corporation",
		isCorporateManager: true,
	},
	{
		id: "corp_student_1",
		name: "Corporate Student",
		email: "corpstudent@example.com",
		password: "password123",
		role: "student",
		dateOfBirth: "1995-08-20T00:00:00.000Z",
		classId: "class_2",
		barcodeId: "CORP-STU-123",
		guardianId: null,
		onboardingStatus: "complete",
		accountType: "corporate",
		isActive: true,
		createdAt: "2023-03-15T00:00:00.000Z",
		updatedAt: "2023-03-15T00:00:00.000Z",
		lastLogin: "2023-05-02T13:30:00.000Z",
		corporateId: "corp_xyz123",
		corporateAccountName: "XYZ Corporation",
		isCorporateManager: false,
	},
	{
		id: "corp_student_2",
		name: "New Corporate Student",
		email: "newcorpstudent@example.com",
		password: "password123",
		role: "student",
		dateOfBirth: null,
		classId: "class_2",
		barcodeId: "CORP-STU-456",
		guardianId: null,
		onboardingStatus: "incomplete",
		accountType: "corporate",
		isActive: true,
		createdAt: "2023-04-20T00:00:00.000Z",
		updatedAt: "2023-04-20T00:00:00.000Z",
		corporateId: "corp_xyz123",
		corporateAccountName: "XYZ Corporation",
		isCorporateManager: false,
	},
];

// Helper function to convert MockUser to proper User type
function convertToUserType(mockUser: MockUser): User {
	const { password, ...baseUser } = mockUser;

	if (mockUser.role === "admin") {
		return {
			...baseUser,
			role: "admin",
			permissions: mockUser.permissions || [],
		} as AdminUser;
	} else if (mockUser.role === "teacher") {
		return {
			...baseUser,
			role: "teacher",
			subjects: mockUser.subjects || [],
			officeHours: mockUser.officeHours || "",
		} as TeacherUser;
	} else {
		// Student
		return {
			...baseUser,
			role: "student",
			dateOfBirth: mockUser.dateOfBirth,
			barcodeId: mockUser.barcodeId,
			isCorporateManager: mockUser.isCorporateManager || false,
		} as StudentUser;
	}
}

// --- Mock auth functions only ---
export function login(credentials: {
	email: string;
	password: string;
}): AuthResponse {
	const user = users.find(
		(u) => u.email === credentials.email && u.password === credentials.password
	);

	if (!user) {
		throw new Error("Invalid email or password");
	}

	// Update last login time
	user.lastLogin = new Date().toISOString();

	return {
		user: convertToUserType(user),
		token: `mock-token-${user.id}-${Date.now()}`,
	};
}

export function register(userData: {
	name: string;
	email: string;
	password: string;
	dateOfBirth?: string;
	classId?: string;
	barcodeId?: string;
	guardianId?: null;
	cartItems?: any[];
	corporateId?: string;
	isCorporateManager?: boolean;
}): AuthResponse {
	if (users.some((u) => u.email === userData.email)) {
		throw new Error("User with this email already exists");
	}

	const now = new Date().toISOString();

	// Determine account type based on corporate status
	const accountType = userData.corporateId ? "corporate" : "individual";

	const newUser: MockUser = {
		id: `student_${users.length + 1}`,
		name: userData.name,
		email: userData.email,
		password: userData.password,
		role: "student",
		dateOfBirth: userData.dateOfBirth || null,
		classId: userData.classId || null,
		barcodeId: userData.barcodeId || `TEMP-${Date.now()}`,
		guardianId: null,
		onboardingStatus: "incomplete",
		accountType: accountType, // Set based on corporateId
		isActive: true,
		createdAt: now,
		updatedAt: now,
		corporateId: userData.corporateId || null,
		isCorporateManager: userData.isCorporateManager || false,
	};

	users.push(newUser);

	return {
		user: convertToUserType(newUser),
		token: `mock-token-${newUser.id}-${Date.now()}`,
	};
}

export function forgotPassword(payload: { email: string }): {
	message: string;
} {
	console.log(
		`%c MOCK API: Received forgot password request for: ${payload.email} `,
		"background: #555; color: #eee"
	);

	// Simulate checking if email exists (optional, real API might not confirm)
	const userExists = users.some((u) => u.email === payload.email);
	console.log(
		`%c MOCK API: User exists check: ${userExists} `,
		"background: #555; color: #eee"
	);

	// Always return a generic success message in mock mode for security parity
	return {
		message:
			"If an account with that email exists, a password reset link has been sent.",
	};
}

export function resetPassword(payload: { token: string; password: string }): {
	message: string;
} {
	console.log(
		`%c MOCK API: Received reset password request for token: ${payload.token} `,
		"background: #555; color: #eee"
	);

	// Simulate token validation
	if (!payload.token || payload.token === "invalid-mock-token") {
		throw new Error("Invalid or expired password reset token.");
	}

	// Simulate password complexity check (optional)
	if (payload.password.length < 8) {
		throw new Error("Mock Error: Password too short.");
	}

	console.log(
		`%c MOCK API: Password for token ${payload.token} would be reset. `,
		"background: #555; color: #eee"
	);

	return { message: "Password has been reset successfully." };
}

// --- Profile management mock functions ---

export function mockGetMyProfile(): User {
	// For testing purposes, return a specific user
	// In a real implementation, this would use the token to identify the user
	const mockUserId = "corp_student_1"; // Using the incomplete profile user for testing
	const user = users.find((u) => u.id === mockUserId);

	if (!user) {
		throw new Error("User not found");
	}

	return convertToUserType(user);
}

export function mockUpdateMyProfile(profileData: Partial<User>): User {
	// For testing purposes, update a specific user
	const mockUserId = "student_2"; // Using the incomplete profile user for testing
	const userIndex = users.findIndex((u) => u.id === mockUserId);

	if (userIndex === -1) {
		throw new Error("User not found");
	}

	// Update the user with the new profile data
	const updatedUser = {
		...users[userIndex],
		...profileData,
		updatedAt: new Date().toISOString(),
	} as MockUser;

	// Preserve the role to avoid type issues
	updatedUser.role = users[userIndex].role;

	// Check if we should update onboarding status
	if (
		updatedUser.role === "student" &&
		updatedUser.onboardingStatus !== "complete" &&
		isStudent(profileData as User)
	) {
		// For individual students
		if (
			updatedUser.dateOfBirth &&
			updatedUser.classId &&
			!updatedUser.corporateId
		) {
			updatedUser.onboardingStatus = "complete";
		}
		// For corporate managers
		else if (updatedUser.corporateId && updatedUser.isCorporateManager) {
			updatedUser.onboardingStatus = "complete";
		}
		// For corporate students
		else if (
			updatedUser.corporateId &&
			updatedUser.classId &&
			!updatedUser.isCorporateManager
		) {
			updatedUser.onboardingStatus = "complete";
		}
	}

	// Save the updated user
	users[userIndex] = updatedUser;

	return convertToUserType(updatedUser);
}

// --- Corporate management mock functions ---

export function createCorporateStudentSlots(params: {
	corporateId: string;
	studentCount: number;
	courses: string[];
}): { success: boolean; createdStudents: number } {
	console.log(
		`%c MOCK API: Creating ${params.studentCount} corporate student slots for ${params.corporateId}`,
		"background: #555; color: #eee"
	);

	const now = new Date().toISOString();
	const createdStudents = [];

	// Create placeholder student accounts
	for (let i = 0; i < params.studentCount; i++) {
		const studentId = `corp_student_placeholder_${Date.now()}_${i}`;
		const email = `student_${i}@${params.corporateId.toLowerCase()}.example.com`;

		const newStudent: MockUser = {
			id: studentId,
			name: "", // Empty name to be filled by the student
			email: email,
			password: "temporary_password", // Would be a random password in real implementation
			role: "student",
			dateOfBirth: null,
			classId: params.courses[0] || null, // Assign first course by default
			barcodeId: `CORP-${Date.now()}-${i}`,
			guardianId: null,
			onboardingStatus: "incomplete",
			accountType: "corporate",
			isActive: true,
			createdAt: now,
			updatedAt: now,
			corporateId: params.corporateId,
			corporateAccountName: params.corporateId, // Would be a proper name in real implementation
			isCorporateManager: false,
		};

		users.push(newStudent);
		createdStudents.push(studentId);
	}

	return {
		success: true,
		createdStudents: createdStudents.length,
	};
}
