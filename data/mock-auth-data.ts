// src/data/mock-auth-data.ts

import type { AuthResponse } from "@/features/auth/types/auth-types";
import type { User } from "@/features/auth/store/auth-slice";

// Mock user database
const users = [
	{
		id: "1",
		name: "Admin User",
		email: "admin@example.com",
		password: "password123",
		role: "admin" as const,
		dateOfBirth: "1990-01-01T00:00:00.000Z",
		classId: "1",
		barcodeId: "ADMIN-123",
		guardianId: null,
	},
	{
		id: "2",
		name: "Teacher User",
		email: "teacher@example.com",
		password: "password123",
		role: "teacher" as const,
		dateOfBirth: "1985-01-01T00:00:00.000Z",
		classId: "1",
		barcodeId: "TEACHER-123",
		guardianId: null,
	},
	{
		id: "3",
		name: "Student User",
		email: "student@example.com",
		password: "password123",
		role: "student" as const,
		dateOfBirth: "2000-01-01T00:00:00.000Z",
		classId: "1",
		barcodeId: "STUDENT-123",
		guardianId: null,
	},
];

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

	const { password, ...userWithoutPassword } = user;

	return {
		user: userWithoutPassword as User,
		token: `mock-token-${user.id}-${Date.now()}`,
	};
}

export function register(userData: {
	name: string;
	email: string;
	password: string;
	dateOfBirth: string;
	classId: string;
	barcodeId: string;
	guardianId: null;
	cartItems?: any[];
}): AuthResponse {
	if (users.some((u) => u.email === userData.email)) {
		throw new Error("User with this email already exists");
	}

	const newUser = {
		id: `${users.length + 1}`,
		name: userData.name,
		email: userData.email,
		password: userData.password,
		role: "student" as const,
		dateOfBirth: userData.dateOfBirth,
		classId: userData.classId,
		barcodeId: userData.barcodeId,
		guardianId: userData.guardianId,
	};

	users.push(newUser);

	const { password, ...userWithoutPassword } = newUser;

	return {
		user: userWithoutPassword as User,
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
	// (Don't confirm if email exists or not)
	// In a real backend, this is where token generation & email sending would happen.
	return {
		message:
			"If an account with that email exists, a password reset link has been sent.",
	};

	// --- Example of simulating an error (uncomment to test error handling) ---
	// if (payload.email === 'error@example.com') {
	//     throw new Error("Mock simulation: Failed to send reset email.");
	// }
	// return { message: "..." };
}


export function resetPassword(payload: { token: string; password: string }): { message: string } {
    console.log(`%c MOCK API: Received reset password request for token: ${payload.token} `, "background: #555; color: #eee");

    // Simulate token validation
    if (!payload.token || payload.token === 'invalid-mock-token') {
        throw new Error("Invalid or expired password reset token.");
    }

    // Simulate password complexity check (optional)
    if (payload.password.length < 8) {
         throw new Error("Mock Error: Password too short.");
    }

    // Simulate finding user by token and updating password (don't actually modify mock users array here unless needed)
    console.log(`%c MOCK API: Password for token ${payload.token} would be reset. `, "background: #555; color: #eee");

    // Return success message
    return { message: "Password has been reset successfully." };
}