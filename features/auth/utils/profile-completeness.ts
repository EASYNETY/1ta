// features/auth/utils/profile-completeness.ts

import type { User } from "@/types/user.types";
import { isStudent } from "@/types/user.types";

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

	// For students, check different requirements based on corporate status
	if (isStudent(user)) {
		// Corporate managers need additional fields
		if (user.isCorporateManager === true) {
			return Boolean(user.name) && Boolean(user.corporateId);
		}

		// Corporate students need their corporate ID and assigned course
		if (user.corporateId) {
			return Boolean(user.name) && Boolean(user.classId);
		}

		// Individual students need date of birth and class ID
		return Boolean(user.dateOfBirth) && Boolean(user.classId);
	}

	// For teachers and admins, we might have different requirements
	return true; // For now, assume teachers and admins don't need additional onboarding
}
