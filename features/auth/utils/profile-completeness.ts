// features/auth/utils/profile-completeness.ts
import type { User } from "@/types/user.types";
import { isStudent, isTeacher, isAdmin } from "@/types/user.types";

/**
 * Checks if a user's profile is considered "complete" for basic platform access.
 * This determines if the onboarding overlay/redirect should be shown.
 *
 * @param user The user object to check
 * @returns boolean indicating if the profile is fundamentally complete
 */
export function isProfileComplete(user: User | null | undefined): boolean {
	if (!user) return false;

	// If onboardingStatus is explicitly set, trust it
	if (user.onboardingStatus === "complete") return true;
	if (user.onboardingStatus === "incomplete") return false;
	if (user.onboardingStatus === "pending_verification") return false;

	// Core requirement for ALL roles
	if (!user.name || user.name.trim() === "") return false;

	// Role-specific checks
	if (isStudent(user)) {
		// Corporate managers need their corporate ID set
		if (user.isCorporateManager === true) {
			return !!user.corporateId;
		}
		// Corporate students need their corporate ID AND a class assigned
		else if (user.corporateId) {
			return !!user.classId;
		}
		// Individual students need Date of Birth AND a Class selection
		else {
			return !!user.dateOfBirth && !!user.classId;
		}
	}

	// For Teachers, check for subjects or office hours
	if (isTeacher(user)) {
		return (
			!!user.name &&
			((Array.isArray(user.subjects) && user.subjects.length > 0) ||
				!!user.officeHours)
		);
	}

	// For Admins, just having a name is enough
	if (isAdmin(user)) {
		return !!user.name;
	}

	// Default to incomplete if role isn't matched
	return false;
}
