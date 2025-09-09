// app/(authenticated)/courses/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { fetchAuthCourses } from "@/features/auth-course/store/auth-course-slice"
// We no longer need the separate API client for enrolled courses here
// import { getEnrolledCourses as fetchEnrolledCoursesApi } from "@/features/auth-course/utils/course-api-client"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { AuthenticationGuard } from "@/components/courses/AuthenticationGuard"
import { CoursesPageHeader } from "@/components/courses/CoursesPageHeader"
import { CourseTabsList } from "@/components/courses/CourseTabsList"
import { CourseFilters } from "@/components/courses/CourseFilters"
import { AllCoursesTabContent } from "@/components/courses/AllCoursesTabContent"
import { ManageCoursesTabContent } from "@/components/courses/ManageCoursesTabContent"
import { CourseRequestsTabContent } from "@/components/courses/CourseRequestsTabContent"
import { type User, isStudent } from "@/types/user.types"
import { MyCoursesTabContent } from "@/components/courses/MyCoursesTabContent"
import { CorporateStudentNotice } from "@/components/courses/CorporateStudentNotice"

export default function CoursesPage() {
  const { user } = useAppSelector((state) => state.auth) as { user: User | null }
  const { courses, categories, status } = useAppSelector((state) => state.auth_courses)
  const dispatch = useAppDispatch()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all")
  const [levelFilter, setLevelFilter] = useState<string | "all">("all")
  
  // --- REMOVED ---
  // We no longer need separate state for enrolled courses as it causes data inconsistency.
  // const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  // const [isLoadingEnrolled, setIsLoadingEnrolled] = useState(false)
  // const [enrolledError, setEnrolledError] = useState<string | null>(null)

  const isCorporateStudent = isStudent(user) && user.corporateId !== undefined && user.corporateId !== null && !user.isCorporateManager;
  const [activeTab, setActiveTab] = useState(isCorporateStudent ? "my-courses" : "all-courses")

  // Fetch all courses (including their enrolment status) on mount
  useEffect(() => {
    if (user) {
      dispatch(fetchAuthCourses())
    }
  }, [dispatch, user])

  // --- REMOVED ---
  // The separate useEffect for fetching enrolled courses is deleted.
  // This was the source of the inconsistent data.

  useEffect(() => {
    if (isCorporateStudent && activeTab === "all-courses") {
      setActiveTab("my-courses")
    }
  }, [activeTab, isCorporateStudent])

  // --- NEW LOGIC: DERIVE ENROLLED COURSES FROM THE SINGLE SOURCE OF TRUTH (REDUX) ---
  const enrolledCourses = useMemo(() => {
    if (!courses) return [];
    // The main 'courses' array already has the correct data and enrolment status.
    return courses.filter(course => 
      course.enrolmentStatus === 'enroled' || 
      course.enrolmentStatus === true
    );
  }, [courses]); // This will only re-calculate when the main courses list changes.

  // Filter all courses based on search query and filters
  const filteredAllCourses = useMemo(() => {
    return courses.filter((course) => {
      // (Your existing filter logic for all courses - no changes needed)
      const matchesSearch =
          (course?.title && course.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (course?.description && course.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (course?.tags && Array.isArray(course.tags) && course.tags.some((tag) => 
            tag && typeof tag === 'string' && tag.toLowerCase().includes(searchQuery.toLowerCase())
          ))
        const matchesCategory = categoryFilter === "all" || course?.category === categoryFilter
        const matchesLevel = levelFilter === "all" || course?.level === levelFilter
        return matchesSearch && matchesCategory && matchesLevel
    })
  }, [courses, searchQuery, categoryFilter, levelFilter])

  // Filter the derived enrolled courses list based on search query and filters
  const filteredEnrolledCourses = useMemo(() => {
      return enrolledCourses.filter((course) => {
          // (Your existing filter logic, now applied to the clean enrolledCourses list)
          const matchesSearch =
            (course?.title && course.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (course?.description && course.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (course?.tags && Array.isArray(course.tags) && course.tags.some((tag) => 
              tag && typeof tag === 'string' && tag.toLowerCase().includes(searchQuery.toLowerCase())
            ))
          const matchesCategory = categoryFilter === "all" || course?.category === categoryFilter
          const matchesLevel = levelFilter === "all" || course?.level === levelFilter
          return matchesSearch && matchesCategory && matchesLevel
      });
  }, [enrolledCourses, searchQuery, categoryFilter, levelFilter]);

  const clearFilters = () => {
    setSearchQuery("")
    setCategoryFilter("all")
    setLevelFilter("all")
  }

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

          {/* Filters are now visible on "my-courses" tab as well */}
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
                  As a corporate student, you can only access courses assigned to you by your organization. Please check
                  the "My Courses" tab to see your assigned courses.
                </p>
              </div>
            ) : (
              <AllCoursesTabContent status={status} courses={filteredAllCourses} onClearFilters={clearFilters} />
            )}
          </TabsContent>

          <TabsContent value="my-courses">
            <MyCoursesTabContent
              // Use the main Redux status, which is the true loading status
              status={status}
              // Pass the correctly filtered list of enrolled courses
              courses={filteredEnrolledCourses}
              onClearFilters={clearFilters}
            />
            {/* The separate enrolledError is no longer needed */}
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
  )
}