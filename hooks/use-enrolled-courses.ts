"use client";

import { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { fetchEnrolledCourses } from "@/features/auth-course/utils/course-utils";
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
          const fetchedCourses = await fetchEnrolledCourses(token);
          
          // Check if the API returned courses with enrollment status
          const apiEnrolledCourses = fetchedCourses.filter(course => 
            course.enrolmentStatus === 'enroled' || 
            course.enrollmentStatus === true
          );
          
          if (apiEnrolledCourses.length > 0) {
            console.log("Sidebar: Setting enrolled courses from API", apiEnrolledCourses.length);
            setEnrolledCourses(apiEnrolledCourses);
          } else if (fetchedCourses.length > 0) {
            console.log("Sidebar: Using all courses returned by enrolled API endpoint");
            setEnrolledCourses(fetchedCourses);
          } else {
            // If no enrolled courses returned, check if we have courses in Redux store
            console.log("Sidebar: No enrolled courses returned from API, checking Redux store");
            if (courses && courses.length > 0) {
              const reduxCourses = courses.filter(course => 
                course.enrolmentStatus === 'enroled' || 
                course.enrollmentStatus === true
              );
              
              if (reduxCourses.length > 0) {
                console.log("Sidebar: Found enrolled courses in Redux store", reduxCourses.length);
                setEnrolledCourses(reduxCourses);
              } else {
                setEnrolledCourses([]);
              }
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