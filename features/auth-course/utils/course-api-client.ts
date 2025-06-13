// features/auth-course/utils/course-api-client.ts
import { get } from "@/lib/api-client";
import { AuthCourse } from "../types/auth-course-interface";
import { PublicCourse } from "@/features/public-course/types/public-course-interface";

/**
 * Fetches enrolled courses from the API and filters them to ensure only truly enrolled courses are returned
 * @param token Authentication token
 * @returns Array of enrolled courses
 */
export const getEnrolledCourses = async (token: string): Promise<AuthCourse[]> => {
  try {
    if (!token) {
      console.error("No authentication token provided");
      return [];
    }

    console.log("API Client: Fetching enrolled courses from API");
    
    // First try to get courses from the enrollment endpoint
    const response = await get<{
      success?: boolean;
      data?: AuthCourse[];
      message?: string;
      _error?: string;
    } | AuthCourse[]>("/enrollment/enrolled", {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("API Client: Enrolled courses API response:", response);

    // Extract courses from the response
    let allCourses: AuthCourse[] = [];

    if (response && typeof response === "object" && "success" in response) {
      if ("data" in response) {
        allCourses = response.data || [];
      }
    } else if (Array.isArray(response)) {
      allCourses = response;
    } else if (response && typeof response === "object") {
      const responseObj = response as Record<string, any>;
      const possibleData = responseObj.data || responseObj.courses || responseObj.items || response;
      
      if (Array.isArray(possibleData)) {
        allCourses = possibleData;
      } else if (possibleData && typeof possibleData === "object") {
        allCourses = Object.values(possibleData);
      }
    }

    console.log(`API Client: Extracted ${allCourses.length} courses from response`);

    // Now get the user's enrollment data to filter the courses
    const enrollmentResponse = await get<{
      success?: boolean;
      data?: any[];
      message?: string;
      _error?: string;
    }>("/user/enrollments", {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("API Client: User enrollments response:", enrollmentResponse);

    // Extract enrollment data
    let enrollments: any[] = [];
    if (enrollmentResponse && typeof enrollmentResponse === "object" && "success" in enrollmentResponse) {
      if ("data" in enrollmentResponse) {
        enrollments = enrollmentResponse.data || [];
      }
    }

    // If we have enrollment data, use it to filter courses
    let enrolledCourses: AuthCourse[] = [];
    
    if (enrollments.length > 0) {
      console.log(`API Client: Found ${enrollments.length} enrollments`);
      
      // Create a set of enrolled course IDs
      const enrolledCourseIds = new Set(
        enrollments.map(enrollment => enrollment.courseId || enrollment.course_id)
      );
      
      console.log("API Client: Enrolled course IDs:", Array.from(enrolledCourseIds));
      
      // Filter courses to only include those in the enrolled set
      enrolledCourses = allCourses.filter(course => 
        enrolledCourseIds.has(course.id) || 
        course.enrolmentStatus === 'enroled' || 
        course.enrollmentStatus === true
      );
      
      console.log(`API Client: Filtered to ${enrolledCourses.length} enrolled courses`);
    } else {
      // Fallback to filtering based on enrollment status in the course object
      enrolledCourses = allCourses.filter(course => 
        course.enrolmentStatus === 'enroled' || 
        course.enrollmentStatus === true
      );
      
      console.log(`API Client: Filtered to ${enrolledCourses.length} enrolled courses based on status`);
    }
    
    // Make sure all courses have the correct enrollment status
    const coursesWithStatus = enrolledCourses.map(course => ({
      ...course,
      enrolmentStatus: 'enroled',
      enrollmentStatus: true
    }));
    
    console.log("API Client: Returning enrolled courses with status:", coursesWithStatus);
    return coursesWithStatus;
  } catch (error) {
    console.error("API Client: Error fetching enrolled courses:", error);
    return [];
  }
};

/**
 * Fetches available courses from the API and filters them to ensure only non-enrolled courses are returned
 * @param token Authentication token
 * @returns Array of available courses
 */
export const getAvailableCourses = async (token: string): Promise<PublicCourse[]> => {
  try {
    if (!token) {
      console.error("No authentication token provided");
      return [];
    }

    console.log("API Client: Fetching available courses from API");
    
    // First get enrolled courses to filter them out
    const enrolledCourses = await getEnrolledCourses(token);
    const enrolledCourseIds = new Set(enrolledCourses.map(course => course.id));
    
    // Then get all courses
    const response = await get<{
      success?: boolean;
      data?: PublicCourse[];
      message?: string;
      _error?: string;
    } | PublicCourse[]>("/courses", {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("API Client: All courses API response:", response);

    // Extract courses from the response
    let allCourses: PublicCourse[] = [];

    if (response && typeof response === "object" && "success" in response) {
      if ("data" in response) {
        allCourses = response.data || [];
      }
    } else if (Array.isArray(response)) {
      allCourses = response;
    } else if (response && typeof response === "object") {
      const responseObj = response as Record<string, any>;
      const possibleData = responseObj.data || responseObj.courses || responseObj.items || response;
      
      if (Array.isArray(possibleData)) {
        allCourses = possibleData;
      } else if (possibleData && typeof possibleData === "object") {
        allCourses = Object.values(possibleData);
      }
    }

    console.log(`API Client: Extracted ${allCourses.length} courses from response`);
    
    // Filter out enrolled courses
    const availableCourses = allCourses.filter(course => 
      !enrolledCourseIds.has(course.id) &&
      course.enrolmentStatus !== 'enroled' && 
      course.enrollmentStatus !== true
    );
    
    console.log(`API Client: Filtered to ${availableCourses.length} available courses`);
    
    // Make sure all courses have the correct enrollment status
    const coursesWithStatus = availableCourses.map(course => ({
      ...course,
      enrolmentStatus: 'not_enroled',
      enrollmentStatus: false
    }));
    
    console.log("API Client: Returning available courses with status:", coursesWithStatus);
    return coursesWithStatus;
  } catch (error) {
    console.error("API Client: Error fetching available courses:", error);
    return [];
  }
};