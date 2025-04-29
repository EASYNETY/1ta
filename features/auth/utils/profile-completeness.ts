// features/auth/utils/profile-completeness.ts

import type { User } from "../store/auth-slice";

/**
 * Checks if a user's profile is complete based on required fields
 * @param user The user object to check
 * @returns boolean indicating if the profile is complete
 */
export function isProfileComplete(user: User | null): boolean {
	if (!user) return false;

	// If onboardingStatus is explicitly set, use that
	if (user.onboardingStatus === "complete") return true;
	if (user.onboardingStatus === "incomplete") return false;

	// Otherwise check required fields
	// For students, we require dateOfBirth and classId
	if (user.role === "student") {
		return Boolean(user.dateOfBirth) && Boolean(user.classId);
	}

	// For teachers and admins, we might have different requirements
	if (user.role === "teacher" || user.role === "admin") {
		return true; // For now, assume teachers and admins don't need additional onboarding
	}

	return false;
}
