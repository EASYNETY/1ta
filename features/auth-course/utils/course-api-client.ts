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

    // Since the /user/enrollments endpoint returns 404, we'll use alternative methods
    console.log("API Client: Using alternative methods to determine enrolled courses");
    
    // Try to get user profile which might contain enrollment information
    try {
      const userProfileResponse = await get<{
        success?: boolean;
        data?: any;
        message?: string;
        _error?: string;
      }>("/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("API Client: User profile response:", userProfileResponse);
      
      // Check if the profile contains enrollment information
      if (userProfileResponse && 
          typeof userProfileResponse === "object" && 
          "success" in userProfileResponse && 
          userProfileResponse.success && 
          "data" in userProfileResponse && 
          userProfileResponse.data && 
          "enrollments" in userProfileResponse.data) {
        
        const enrollments = userProfileResponse.data.enrollments || [];
        console.log(`API Client: Found ${enrollments.length} enrollments in user profile`);
        
        if (enrollments.length > 0) {
          // Create a set of enrolled course IDs
          const enrolledCourseIds = new Set(
            enrollments.map((enrollment: any) => enrollment?.courseId || enrollment?.course_id || '')
              .filter(id => id) // Filter out empty or undefined IDs
          );
          
          console.log("API Client: Enrolled course IDs from profile:", Array.from(enrolledCourseIds));
          
          // Filter courses to only include those in the enrolled set
          const profileEnrolledCourses = allCourses.filter(course => 
            course?.id && enrolledCourseIds.has(course.id)
          );
          
          if (profileEnrolledCourses.length > 0) {
            console.log(`API Client: Filtered to ${profileEnrolledCourses.length} enrolled courses from profile`);
            return profileEnrolledCourses.map(course => ({
              ...course,
              enrolmentStatus: 'enroled',
              enrollmentStatus: true
            }));
          }
        }
      }
    } catch (error) {
      console.error("API Client: Error fetching user profile:", error);
      // Continue with fallback methods
    }
    
    // Fallback to filtering based on enrollment status in the course object
    const enrolledCourses = allCourses.filter(course => 
      course?.enrolmentStatus === 'enroled' || 
      course?.enrollmentStatus === true
    );
    
    console.log(`API Client: Filtered to ${enrolledCourses.length} enrolled courses based on status`);
    
    // If we still don't have any enrolled courses, try one more approach
    if (enrolledCourses.length === 0) {
      try {
        // Try to get enrollment status from a different endpoint
        const enrollmentStatusResponse = await get<{
          success?: boolean;
          data?: any[];
          message?: string;
          _error?: string;
        }>("/enrollment/status", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("API Client: Enrollment status response:", enrollmentStatusResponse);
        
        if (enrollmentStatusResponse && 
            typeof enrollmentStatusResponse === "object" && 
            "success" in enrollmentStatusResponse && 
            enrollmentStatusResponse.success && 
            "data" in enrollmentStatusResponse) {
          
          const enrollmentData = enrollmentStatusResponse.data || [];
          
          if (Array.isArray(enrollmentData) && enrollmentData.length > 0) {
            // Create a set of enrolled course IDs
            const enrolledCourseIds = new Set(
              enrollmentData.map((item: any) => item?.courseId || item?.course_id || '')
                .filter(id => id) // Filter out empty or undefined IDs
            );
            
            console.log("API Client: Enrolled course IDs from status:", Array.from(enrolledCourseIds));
            
            // Filter courses to only include those in the enrolled set
            const statusEnrolledCourses = allCourses.filter(course => 
              course?.id && enrolledCourseIds.has(course.id)
            );
            
            if (statusEnrolledCourses.length > 0) {
              console.log(`API Client: Filtered to ${statusEnrolledCourses.length} enrolled courses from status`);
              return statusEnrolledCourses.map(course => ({
                ...course,
                enrolmentStatus: 'enroled',
                enrollmentStatus: true
              }));
            }
          }
        }
      } catch (error) {
        console.error("API Client: Error fetching enrollment status:", error);
        // Continue with fallback methods
      }
    }
    
    // If we still don't have any enrolled courses, try other approaches
    if (enrolledCourses.length === 0) {
      // Approach 1: Check for courses with progress
      try {
        const coursesWithProgress = allCourses.filter(course => 
          course?.progress !== undefined && 
          course?.progress !== null && 
          course?.progress > 0
        );
        
        if (coursesWithProgress.length > 0) {
          console.log(`API Client: Found ${coursesWithProgress.length} courses with progress`);
          return coursesWithProgress.map(course => ({
            ...course,
            enrolmentStatus: 'enroled',
            enrollmentStatus: true
          }));
        }
      } catch (error) {
        console.error("API Client: Error filtering courses with progress:", error);
      }
      
      // Approach 2: Check for courses with completed lessons
      try {
        const coursesWithCompletedLessons = allCourses.filter(course => 
          course?.completedLessons && 
          Array.isArray(course?.completedLessons) && 
          course?.completedLessons.length > 0
        );
        
        if (coursesWithCompletedLessons.length > 0) {
          console.log(`API Client: Found ${coursesWithCompletedLessons.length} courses with completed lessons`);
          return coursesWithCompletedLessons.map(course => ({
            ...course,
            enrolmentStatus: 'enroled',
            enrollmentStatus: true
          }));
        }
      } catch (error) {
        console.error("API Client: Error filtering courses with completed lessons:", error);
      }
      
      // Approach 3: Check for courses with last accessed date
      try {
        const coursesWithLastAccessed = allCourses.filter(course => 
          course?.lastAccessedDate || course?.lastAccessedAt
        );
        
        if (coursesWithLastAccessed.length > 0) {
          console.log(`API Client: Found ${coursesWithLastAccessed.length} courses with last accessed date`);
          return coursesWithLastAccessed.map(course => ({
            ...course,
            enrolmentStatus: 'enroled',
            enrollmentStatus: true
          }));
        }
      } catch (error) {
        console.error("API Client: Error filtering courses with last accessed date:", error);
      }
      
      // Approach 4: Check for courses with payment status
      try {
        const paidCourses = allCourses.filter(course => 
          course?.isPaid === true || 
          course?.paid === true || 
          course?.paymentStatus === 'paid' || 
          course?.payment_status === 'paid'
        );
        
        if (paidCourses.length > 0) {
          console.log(`API Client: Found ${paidCourses.length} paid courses`);
          return paidCourses.map(course => ({
            ...course,
            enrolmentStatus: 'enroled',
            enrollmentStatus: true
          }));
        }
      } catch (error) {
        console.error("API Client: Error filtering paid courses:", error);
      }
      
      // Approach 5: Try to get enrollment data from a different endpoint
      try {
        const enrollmentDataResponse = await get<{
          success?: boolean;
          data?: any;
          message?: string;
          _error?: string;
        }>("/courses", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("API Client: User courses response:", enrollmentDataResponse);
        
        if (enrollmentDataResponse && 
            typeof enrollmentDataResponse === "object" && 
            "success" in enrollmentDataResponse && 
            enrollmentDataResponse.success && 
            "data" in enrollmentDataResponse) {
          
          const userCourses = enrollmentDataResponse.data || [];
          
          if (Array.isArray(userCourses) && userCourses.length > 0) {
            // Create a set of enrolled course IDs
            const userCourseIds = new Set(
              userCourses.map((course: any) => course?.id || course?.courseId || course?.course_id || '')
                .filter(id => id) // Filter out empty or undefined IDs
            );
            
            console.log("API Client: User course IDs:", Array.from(userCourseIds));
            
            // Filter courses to only include those in the user courses set
            const userEnrolledCourses = allCourses.filter(course => 
              course?.id && userCourseIds.has(course.id)
            );
            
            if (userEnrolledCourses.length > 0) {
              console.log(`API Client: Filtered to ${userEnrolledCourses.length} enrolled courses from user courses`);
              return userEnrolledCourses.map(course => ({
                ...course,
                enrolmentStatus: 'enroled',
                enrollmentStatus: true
              }));
            }
          }
        }
      } catch (error) {
        console.error("API Client: Error fetching user courses:", error);
      }
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
    
    // Create a set of enrolled course IDs
    const enrolledCourseIds = new Set(enrolledCourses.map(course => course.id));
    console.log(`API Client: Found ${enrolledCourseIds.size} enrolled course IDs to filter out`);
    
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
      course?.id && !enrolledCourseIds.has(course.id) &&
      course?.enrolmentStatus !== 'enroled' && 
      course?.enrollmentStatus !== true
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