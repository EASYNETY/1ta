// app/(authenticated)/courses/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { fetchAuthCourses } from "@/features/auth-course/store/auth-course-slice"
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
// Import other potential tab content components: Recommended, Completed, Analytics

export default function CoursesPage() {
  const { user } = useAppSelector((state) => state.auth) as { user: User | null }
  const { courses, categories, status } = useAppSelector((state) => state.auth_courses)
  const dispatch = useAppDispatch()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all")
  const [levelFilter, setLevelFilter] = useState<string | "all">("all")

  // Check if user is a corporate student
  const isCorporateStudent = isStudent(user) && user.corporateId !== undefined && user.corporateId !== null && !user.isCorporateManager;

  // Set default tab to "my-courses" for corporate students
  const [activeTab, setActiveTab] = useState(isCorporateStudent ? "my-courses" : "all-courses")

  // Fetch courses on mount
  useEffect(() => {
    if (user) {
      dispatch(fetchAuthCourses())
    }
  }, [dispatch, user])

  // If user is a corporate student and somehow tries to access all-courses tab, redirect to my-courses
  useEffect(() => {
    if (isCorporateStudent && activeTab === "all-courses") {
      setActiveTab("my-courses")
    }
  }, [activeTab, isCorporateStudent])

  // Filter courses based on search query and filters
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.tags && course.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))

      const matchesCategory = categoryFilter === "all" || course.category === categoryFilter
      const matchesLevel = levelFilter === "all" || course.level === levelFilter

      return matchesSearch && matchesCategory && matchesLevel
    })
  }, [courses, searchQuery, categoryFilter, levelFilter])

  const clearFilters = () => {
    setSearchQuery("")
    setCategoryFilter("all")
    setLevelFilter("all")
  }

  // The AuthenticationGuard handles the case where user is null
  return (
    <AuthenticationGuard>
      <div className="space-y-6">
        <CoursesPageHeader user={user} />

        {/* Show notice for corporate students */}
        {isCorporateStudent && <CorporateStudentNotice />}

        <Tabs
          defaultValue={isCorporateStudent ? "my-courses" : "all-courses"}
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <CourseTabsList user={user} />

          {/* Conditionally render filters based on the active tab */}
          {activeTab !== "all-courses" && (
            <CourseFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              levelFilter={levelFilter}
              onLevelChange={setLevelFilter}
              categories={categories}
            />
          )}

          <TabsContent value="all-courses">
            {isCorporateStudent ? (
              <div className="p-6 text-center bg-muted/20 rounded-lg border">
                <p className="text-muted-foreground">
                  As a corporate student, you can only access courses assigned to you by your organization. Please check
                  the "My Courses" tab to see your assigned courses.
                </p>
              </div>
            ) : (
              <AllCoursesTabContent status={status} courses={filteredCourses} onClearFilters={clearFilters} />
            )}
          </TabsContent>

          <TabsContent value="my-courses">
            <MyCoursesTabContent
              status={status}
              courses={filteredCourses} // Assuming 'my-courses' should be filterable
              onClearFilters={clearFilters}
            />
          </TabsContent>

          {/* Role-specific Tab Content */}
          {user?.role === "admin" && (
            <TabsContent value="manage-courses">
              <ManageCoursesTabContent status={status} courses={filteredCourses} />
            </TabsContent>
          )}

          {/* {user?.role === "admin" && (
            <TabsContent value="course-analytics">
              <div className="p-6 text-center bg-muted/20 rounded-lg border">
                <p className="text-muted-foreground">Course analytics content will be displayed here.</p>
              </div>
            </TabsContent>
          )} */}

          {user?.role === "teacher" && (
            <TabsContent value="course-requests">
              {/* Pass actual request data when available */}
              <CourseRequestsTabContent status={status} />
            </TabsContent>
          )}
{/* 
          {user?.role === "student" && (
            <TabsContent value="recommended">
              <div className="p-6 text-center bg-muted/20 rounded-lg border">
                <p className="text-muted-foreground">Recommended courses will be displayed here.</p>
              </div>
            </TabsContent>
          )}

          {user?.role === "student" && (
            <TabsContent value="completed">
              <div className="p-6 text-center bg-muted/20 rounded-lg border">
                <p className="text-muted-foreground">Completed courses will be displayed here.</p>
              </div>
            </TabsContent>
          )} */}
        </Tabs>
      </div>
    </AuthenticationGuard>
  )
}
