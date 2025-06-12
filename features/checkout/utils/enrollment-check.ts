// features/checkout/utils/enrollment-check.ts
import { get } from "@/lib/api-client";

interface EnrollmentCheckResponse {
  success: boolean;
  message: string;
  enrollmentStatus: Record<string, boolean>;
}

/**
 * Checks if a user is already enrolled in any of the specified courses
 * @param userId The user ID
 * @param courseIds Array of course IDs to check
 * @param token Authentication token
 * @returns Object with enrollment status for each course
 */
export const checkExistingEnrollments = async (
  userId: string,
  courseIds: string[],
  token: string
): Promise<{ alreadyEnrolled: string[]; canProceed: boolean }> => {
  try {
    if (!userId || !courseIds.length || !token) {
      throw new Error("Missing required parameters");
    }

    const queryParams = new URLSearchParams();
    queryParams.append("userId", userId);
    courseIds.forEach(id => queryParams.append("courseIds", id));

    const response = await get<EnrollmentCheckResponse>(
      `/enrollment/check?${queryParams.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!response.success) {
      throw new Error(response.message || "Failed to check enrollment status");
    }

    // Get the list of courses that the user is already enrolled in
    const alreadyEnrolled = Object.entries(response.enrollmentStatus)
      .filter(([_, isEnrolled]) => isEnrolled)
      .map(([courseId]) => courseId);

    return {
      alreadyEnrolled,
      canProceed: alreadyEnrolled.length === 0
    };
  } catch (error: any) {
    console.error("Error checking enrollment status:", error);
    // In case of error, we'll assume the user can proceed
    // but log the error for debugging
    return {
      alreadyEnrolled: [],
      canProceed: true
    };
  }
};