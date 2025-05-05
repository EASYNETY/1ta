// features/auth/utils/profile-completeness.ts
import type { User } from "@/types/user.types";
import { isStudent } from "@/types/user.types";

/**
 * Checks if a user's profile is considered "complete" for basic platform access.
 * This determines if the onboarding overlay/redirect should be shown.
 * Note: Specific features might require additional fields later.
 *
 * @param user The user object to check
 * @returns boolean indicating if the profile is fundamentally complete
 */
export function isProfileComplete(user: User | null | undefined): boolean {
	if (!user) return false;

	// If onboardingStatus is explicitly 'complete', trust it.
	// If explicitly 'incomplete', respect that too.
	if (user.onboardingStatus === "complete") return true;
	if (user.onboardingStatus === "incomplete") return false;
	// If status is 'pending_verification' or other, treat as incomplete for now.
	if (user.onboardingStatus && user.onboardingStatus === "pending_verification")
		return false;

	// Fallback check based on essential fields if status is missing/null/undefined
	// Core requirement for ALL roles
	if (!user.name || user.name.trim() === "") return false;

	// Role-specific essential checks for initial onboarding
	if (isStudent(user)) {
		// Corporate managers need their corporate ID set (company name provided)
		if (user.isCorporateManager === true) {
			// Name check already done. Corporate ID is the key identifier.
			// We don't check for maxManagedStudents here, as that's part of their setup/payment.
			return !!user.corporateId;
		}
		// Corporate students (managed) need their corporate ID AND a class assigned by manager/system
		else if (user.corporateId) {
			// Name check already done. classId confirms they've been placed.
			return !!user.classId;
		}
		// Individual students need Date of Birth AND a Class selection for basic completion
		else {
			return !!user.dateOfBirth && !!user.classId;
		}
	}

	// For Teachers and Admins, just having a name might be enough for basic "completeness"
	// Specific features might gate on other fields later (e.g., bio for teacher profile).
	if (user.role === "teacher" || user.role === "admin") {
		return !!user.name; // Already checked above
	}

	// Default to incomplete if role isn't matched or other checks fail
	return false;
}
