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

    console.log("Fetching enrolled courses from API");
    const response = await get<{
      success?: boolean;
      data?: AuthCourse[];
      message?: string;
      _error?: string;
    } | AuthCourse[]>("/enrollment/enrolled", {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Enrolled courses API response:", response);

    // Handle different response formats
    let courses: AuthCourse[] = [];

    if (response && typeof response === "object" && "success" in response) {
      // Check if there's an error but the API still returned success=true as a fallback
      if ("_error" in response) {
        console.warn("API returned success with error:", response._error);
      }
      
      if ("data" in response) {
        courses = response.data || [];
        console.log(`Extracted ${courses.length} courses from response.data`);
      }
    } else if (Array.isArray(response)) {
      courses = response;
      console.log(`Extracted ${courses.length} courses from array response`);
    } else if (response && typeof response === "object") {
      // Try to extract data from any object structure
      const responseObj = response as Record<string, any>;
      const possibleData = responseObj.data || responseObj.courses || responseObj.items || response;
      
      if (Array.isArray(possibleData)) {
        courses = possibleData;
        console.log(`Extracted ${courses.length} courses from possibleData array`);
      } else if (possibleData && typeof possibleData === "object") {
        courses = Object.values(possibleData);
        console.log(`Extracted ${courses.length} courses from possibleData object`);
      }
    }

    // Filter to only include truly enrolled courses
    const enrolledCourses = courses.filter(course => 
      course.enrolmentStatus === 'enroled' || 
      course.enrollmentStatus === true
    );
    
    // Make sure all courses have the correct enrollment status
    const coursesWithStatus = enrolledCourses.map(course => ({
      ...course,
      enrolmentStatus: 'enroled',
      enrollmentStatus: true
    }));
    
    // Log the courses we're returning
    console.log("Returning enrolled courses with status:", coursesWithStatus);
    return coursesWithStatus;
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

    console.log("Fetching available courses from API");
    const response = await get<{
      success?: boolean;
      data?: PublicCourse[];
      message?: string;
      _error?: string;
    } | PublicCourse[]>("/enrollment/available", {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Available courses API response:", response);

    // Handle different response formats
    let courses: PublicCourse[] = [];

    if (response && typeof response === "object" && "success" in response) {
      // Check if there's an error but the API still returned success=true as a fallback
      if ("_error" in response) {
        console.warn("API returned success with error:", response._error);
      }
      
      if ("data" in response) {
        courses = response.data || [];
        console.log(`Extracted ${courses.length} courses from response.data`);
      }
    } else if (Array.isArray(response)) {
      courses = response;
      console.log(`Extracted ${courses.length} courses from array response`);
    } else if (response && typeof response === "object") {
      // Try to extract data from any object structure
      const responseObj = response as Record<string, any>;
      const possibleData = responseObj.data || responseObj.courses || responseObj.items || response;
      
      if (Array.isArray(possibleData)) {
        courses = possibleData;
        console.log(`Extracted ${courses.length} courses from possibleData array`);
      } else if (possibleData && typeof possibleData === "object") {
        courses = Object.values(possibleData);
        console.log(`Extracted ${courses.length} courses from possibleData object`);
      }
    }

    // Make sure all courses have the correct enrollment status
    const coursesWithStatus = courses.map(course => ({
      ...course,
      enrolmentStatus: 'not_enroled',
      enrollmentStatus: false
    }));
    
    // Log the courses we're returning
    console.log("Returning available courses with status:", coursesWithStatus);
    return coursesWithStatus;
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
  console.log("Filtering courses - All courses:", allCourses.length, "Enrolled courses:", enrolledCourses.length);
  
  // Create a Set of enrolled course IDs for efficient lookup
  const enrolledCourseIds = new Set(enrolledCourses.map(course => course.id));
  console.log("Enrolled course IDs:", Array.from(enrolledCourseIds));
  
  // Filter out courses that are in the enrolled set
  const filteredCourses = allCourses.filter(course => !enrolledCourseIds.has(course.id));
  
  // Make sure all filtered courses have the correct enrollment status
  const coursesWithStatus = filteredCourses.map(course => ({
    ...course,
    enrolmentStatus: 'not_enroled',
    enrollmentStatus: false
  }));
  
  console.log("Filtered courses count:", coursesWithStatus.length);
  return coursesWithStatus;
};