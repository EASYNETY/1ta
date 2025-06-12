// features/auth-course/utils/course-utils.ts
import { get } from "@/lib/api-client";
import { AuthCourse } from "../types/auth-course-interface";
import { PublicCourse } from "@/features/public-course/types/public-course-interface";

/**
 * Fetches all courses that the user is enrolled in
 * @param token Authentication token
 * @returns Array of enrolled courses
 */
export const fetchEnrolledCourses = async (token: string): Promise<AuthCourse[]> => {
  try {
    if (!token) {
      console.error("No authentication token provided");
      return [];
    }

    const response = await get<{
      success?: boolean;
      data?: AuthCourse[];
      message?: string;
    } | AuthCourse[]>("/enrollment/enrolled", {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Handle different response formats
    let courses: AuthCourse[] = [];

    if (response && typeof response === "object" && "success" in response && "data" in response) {
      if (!response.success) {
        console.error("API Error:", response.message || "Unknown error");
        return [];
      }
      courses = response.data || [];
    } else if (Array.isArray(response)) {
      courses = response;
    } else if (response && typeof response === "object") {
      // Try to extract data from any object structure
      const responseObj = response as Record<string, any>;
      const possibleData = responseObj.data || responseObj.courses || responseObj.items || response;
      
      if (Array.isArray(possibleData)) {
        courses = possibleData;
      } else if (possibleData && typeof possibleData === "object") {
        courses = Object.values(possibleData);
      }
    }

    return courses;
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return [];
  }
};

/**
 * Fetches all available courses that the user is not enrolled in
 * @param token Authentication token
 * @returns Array of available courses
 */
export const fetchAvailableCourses = async (token: string): Promise<PublicCourse[]> => {
  try {
    if (!token) {
      console.error("No authentication token provided");
      return [];
    }

    const response = await get<{
      success?: boolean;
      data?: PublicCourse[];
      message?: string;
    } | PublicCourse[]>("/enrollment/available", {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Handle different response formats
    let courses: PublicCourse[] = [];

    if (response && typeof response === "object" && "success" in response && "data" in response) {
      if (!response.success) {
        console.error("API Error:", response.message || "Unknown error");
        return [];
      }
      courses = response.data || [];
    } else if (Array.isArray(response)) {
      courses = response;
    } else if (response && typeof response === "object") {
      // Try to extract data from any object structure
      const responseObj = response as Record<string, any>;
      const possibleData = responseObj.data || responseObj.courses || responseObj.items || response;
      
      if (Array.isArray(possibleData)) {
        courses = possibleData;
      } else if (possibleData && typeof possibleData === "object") {
        courses = Object.values(possibleData);
      }
    }

    return courses;
  } catch (error) {
    console.error("Error fetching available courses:", error);
    return [];
  }
};

/**
 * Filters out enrolled courses from all courses
 * @param allCourses All available courses
 * @param enrolledCourses Courses the user is enrolled in
 * @returns Courses the user is not enrolled in
 */
export const filterOutEnrolledCourses = (
  allCourses: PublicCourse[],
  enrolledCourses: AuthCourse[]
): PublicCourse[] => {
  // Create a Set of enrolled course IDs for efficient lookup
  const enrolledCourseIds = new Set(enrolledCourses.map(course => course.id));
  
  // Filter out courses that are in the enrolled set
  return allCourses.filter(course => !enrolledCourseIds.has(course.id));
};