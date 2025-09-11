"use client";

import { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { getEnrolledCourses as fetchEnrolledCoursesApi } from "@/features/auth-course/utils/course-api-client";
import { AuthCourse } from "@/features/auth-course/types/auth-course-interface";

/**
 * Hook to fetch and manage enrolled courses
 * @returns Object containing enrolled courses and loading state
 */
export function useEnrolledCourses() {
  const { token, isInitialized, user } = useAppSelector((state) => state.auth);
  const { courses } = useAppSelector((state) => state.auth_courses);
  const [enrolledCourses, setEnrolledCourses] = useState<AuthCourse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isInitialized && user && token) {
      const getEnrolledCourses = async () => {
        setIsLoading(true);
        setError(null);
        try {
          console.log("Sidebar: Fetching enrolled courses");
          // Use our new API client that properly filters enrolled courses
          const fetchedCourses = await fetchEnrolledCoursesApi(token);
          
          if (fetchedCourses.length > 0) {
            console.log("Sidebar: Setting enrolled courses from API", fetchedCourses.length);
            setEnrolledCourses(fetchedCourses);
          } else {
            // If no enrolled courses returned, check if we have courses in Redux store
            console.log("Sidebar: No enrolled courses returned from API, checking Redux store");
            if (courses && courses.length > 0) {
              // Try multiple approaches to identify enrolled courses
              
              // Approach 1: Check for courses with enrollment status
              const enrolledByStatus = courses.filter(course => 
                course.enrolmentStatus === 'enroled' || 
                course.enrollmentStatus === true
              );
              
              if (enrolledByStatus.length > 0) {
                console.log("Sidebar: Found enrolled courses by status in Redux store", enrolledByStatus.length);
                setEnrolledCourses(enrolledByStatus);
                return;
              }
              
              // Approach 2: Check for courses with progress
              const coursesWithProgress = courses.filter(course => 
                course.progress !== undefined && 
                course.progress !== null && 
                course.progress > 0
              );
              
              if (coursesWithProgress.length > 0) {
                console.log("Sidebar: Found courses with progress in Redux store", coursesWithProgress.length);
                setEnrolledCourses(coursesWithProgress.map(course => ({
                  ...course,
                  enrolmentStatus: 'enroled',
                  enrollmentStatus: true
                })));
                return;
              }
              
              // Approach 3: Check for courses with completed lessons
              const coursesWithCompletedLessons = courses.filter(course => 
                course.completedLessons && 
                Array.isArray(course.completedLessons) && 
                course.completedLessons.length > 0
              );
              
              if (coursesWithCompletedLessons.length > 0) {
                console.log("Sidebar: Found courses with completed lessons in Redux store", coursesWithCompletedLessons.length);
                setEnrolledCourses(coursesWithCompletedLessons.map(course => ({
                  ...course,
                  enrolmentStatus: 'enroled',
                  enrollmentStatus: true
                })));
                return;
              }
              
              // Approach 4: Check for courses with last accessed date
              const coursesWithLastAccessed = courses.filter(course => 
                course.lastAccessedDate || course.lastAccessedAt
              );
              
              if (coursesWithLastAccessed.length > 0) {
                console.log("Sidebar: Found courses with last accessed date in Redux store", coursesWithLastAccessed.length);
                setEnrolledCourses(coursesWithLastAccessed.map(course => ({
                  ...course,
                  enrolmentStatus: 'enroled',
                  enrollmentStatus: true
                })));
                return;
              }
              
              // If no enrolled courses found, set empty array
              setEnrolledCourses([]);
            } else {
              setEnrolledCourses([]);
            }
          }
        } catch (error) {
          console.error("Sidebar: Error fetching enrolled courses:", error);
          setError("Failed to load enrolled courses");
          
          // Fallback to using the courses from the Redux store
          if (courses && courses.length > 0) {
            const reduxCourses = courses.filter(course => 
              course.enrolmentStatus === 'enroled' || 
              course.enrollmentStatus === true
            );
            
            if (reduxCourses.length > 0) {
              console.log("Sidebar: Using fallback enrolled courses from Redux store", reduxCourses.length);
              setEnrolledCourses(reduxCourses);
            }
          }
        } finally {
          setIsLoading(false);
        }
      };
      
      getEnrolledCourses();
    }
  }, [isInitialized, user, token, courses]);

  return {
    enrolledCourses,
    isLoading,
    error,
    hasEnrolledCourses: enrolledCourses.length > 0
  };
}
