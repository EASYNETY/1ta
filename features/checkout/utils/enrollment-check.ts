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
      console.warn("Missing required parameters for enrollment check", { userId, courseIdsLength: courseIds.length, hasToken: !!token });
      return {
        alreadyEnrolled: [],
        canProceed: true
      };
    }

    console.log("Checking enrollment status for courses:", courseIds);

    // For a single course ID, use a simpler query format
    let url: string;
    if (courseIds.length === 1) {
      url = `/enrollment/check?userId=${encodeURIComponent(userId)}&courseIds=${encodeURIComponent(courseIds[0])}`;
    } else {
      // For multiple course IDs, build the query string manually
      const queryParams = new URLSearchParams();
      queryParams.append("userId", userId);
      courseIds.forEach(id => queryParams.append("courseIds", id));
      url = `/enrollment/check?${queryParams.toString()}`;
    }

    console.log("Enrollment check URL:", url);

    const response = await get<EnrollmentCheckResponse>(
      url,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log("Enrollment check response:", response);

    if (!response) {
      console.warn("No response from enrollment check API");
      return {
        alreadyEnrolled: [],
        canProceed: true
      };
    }

    // Check for success flag
    if (!response.success) {
      console.warn("Enrollment check failed:", response.message || "Unknown error");
      return {
        alreadyEnrolled: [],
        canProceed: true
      };
    }

    // Check if enrollmentStatus exists
    if (!response.enrollmentStatus) {
      console.warn("No enrollment status in response");
      return {
        alreadyEnrolled: [],
        canProceed: true
      };
    }

    // Get the list of courses that the user is already enrolled in
    const alreadyEnrolled = Object.entries(response.enrollmentStatus)
      .filter(([_, isEnrolled]) => isEnrolled === true)
      .map(([courseId]) => courseId);

    console.log("Already enrolled courses:", alreadyEnrolled);
    console.log("Can proceed with checkout:", alreadyEnrolled.length === 0);

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
