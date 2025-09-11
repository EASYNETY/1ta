// app/(authenticated)/courses/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchAuthCourses } from "@/features/auth-course/store/auth-course-slice";
import { getEnrolledCourses as fetchEnrolledCoursesApi } from "@/features/auth-course/utils/course-api-client";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AuthenticationGuard } from "@/components/courses/AuthenticationGuard";
import { CoursesPageHeader } from "@/components/courses/CoursesPageHeader";
import { CourseTabsList } from "@/components/courses/CourseTabsList";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { AllCoursesTabContent } from "@/components/courses/AllCoursesTabContent";
import { ManageCoursesTabContent } from "@/components/courses/ManageCoursesTabContent";
import { CourseRequestsTabContent } from "@/components/courses/CourseRequestsTabContent";
import { type User, isStudent } from "@/types/user.types";
import { MyCoursesTabContent } from "@/components/courses/MyCoursesTabContent";
import { CorporateStudentNotice } from "@/components/courses/CorporateStudentNotice";

export default function CoursesPage() {
  const { user, token } = useAppSelector((state) => state.auth) as { user: User | null, token: string | null };
  const { courses, categories, status } = useAppSelector((state) => state.auth_courses);
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [levelFilter, setLevelFilter] = useState<string | "all">("all");
  
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [isLoadingEnrolled, setIsLoadingEnrolled] = useState(true); // Default to true on initial load
  const [enrolledError, setEnrolledError] = useState<string | null>(null);

  const isCorporateStudent = isStudent(user) && user.corporateId !== undefined && user.corporateId !== null && !user.isCorporateManager;
  const [activeTab, setActiveTab] = useState(isCorporateStudent ? "my-courses" : "all-courses");

  // Fetch all courses for the "All Courses" tab
  useEffect(() => {
    if (user && !isCorporateStudent) {
      dispatch(fetchAuthCourses());
    }
  }, [dispatch, user, isCorporateStudent]);
  
  // --- [FIXED LOGIC] ---
  // Fetch ENROLLED courses specifically for the "My Courses" tab.
  // This is now simpler and more reliable.
  useEffect(() => {
    // Only run this fetch if the user is logged in.
    if (user && token) {
      const getEnrolledCourses = async () => {
        setIsLoadingEnrolled(true);
        setEnrolledError(null);
        try {
          console.log("Courses Page: Fetching enrolled courses...");
          
          // We trust this API call as the single source of truth.
          const fetchedCourses = await fetchEnrolledCoursesApi(token);
          
          console.log(`Courses Page: Successfully received ${fetchedCourses.length} enrolled courses from API.`);
          setEnrolledCourses(fetchedCourses);

        } catch (error) {
          console.error("Courses Page: Error fetching enrolled courses:", error);
          setEnrolledError("Failed to load your enrolled courses. Please try again.");
          setEnrolledCourses([]); // Set to empty on error to prevent crashes
        } finally {
          setIsLoadingEnrolled(false);
        }
      };
      
      getEnrolledCourses();
    } else {
      // If there's no user/token, ensure the list is empty and not loading.
      setIsLoadingEnrolled(false);
      setEnrolledCourses([]);
    }
  }, [user, token]); // The dependency array is now correct.

  useEffect(() => {
    if (isCorporateStudent && activeTab === "all-courses") {
      setActiveTab("my-courses");
    }
  }, [activeTab, isCorporateStudent]);

  // This filtering logic now applies to the separate lists of courses
  const filteredAllCourses = useMemo(() => {
    return courses.filter((course) => {
        const matchesSearch =
          (course?.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (course?.description?.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = categoryFilter === "all" || course?.category === categoryFilter;
        const matchesLevel = levelFilter === "all" || course?.level === levelFilter;
        return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [courses, searchQuery, categoryFilter, levelFilter]);

  const filteredEnrolledCourses = useMemo(() => {
    return enrolledCourses.filter((course) => {
        const matchesSearch =
          (course?.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (course?.description?.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = categoryFilter === "all" || course?.category === categoryFilter;
        const matchesLevel = levelFilter === "all" || course?.level === levelFilter;
        return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [enrolledCourses, searchQuery, categoryFilter, levelFilter]);


  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setLevelFilter("all");
  };

  return (
    <AuthenticationGuard>
      <div className="space-y-6">
        <CoursesPageHeader user={user} />
        {isCorporateStudent && <CorporateStudentNotice />}

        <Tabs
          defaultValue={isCorporateStudent ? "my-courses" : "all-courses"}
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <CourseTabsList user={user} />
          <CourseFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            levelFilter={levelFilter}
            onLevelChange={setLevelFilter}
            categories={categories}
          />

          <TabsContent value="all-courses">
            {isCorporateStudent ? (
              <div className="p-6 text-center bg-muted/20 rounded-lg border">
                <p className="text-muted-foreground">
                  As a corporate student, your access is limited to your assigned courses in the "My Courses" tab.
                </p>
              </div>
            ) : (
              <AllCoursesTabContent status={status} courses={filteredAllCourses} onClearFilters={clearFilters} />
            )}
          </TabsContent>

          <TabsContent value="my-courses">
            <MyCoursesTabContent
              status={isLoadingEnrolled ? "loading" : (enrolledError ? "failed" : "success")}
              courses={filteredEnrolledCourses}
              onClearFilters={clearFilters}
            />
            {enrolledError && (
              <div className="mt-4 p-4 border rounded-md bg-destructive/10 text-destructive text-center">
                <p>{enrolledError}</p>
              </div>
            )}
          </TabsContent>
          
          {(user?.role === "admin" || user?.role === "super_admin") && (
            <TabsContent value="manage-courses">
              <ManageCoursesTabContent status={status} courses={filteredAllCourses} />
            </TabsContent>
          )}

          {user?.role === "teacher" && (
            <TabsContent value="course-requests">
              <CourseRequestsTabContent status={status} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AuthenticationGuard>
  );
}
