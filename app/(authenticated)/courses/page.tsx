// app/(authenticated)/courses/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { fetchAuthCourses } from "@/features/auth-course/store/auth-course-slice"
import { getEnrolledCourses as fetchEnrolledCoursesApi } from "@/features/auth-course/utils/course-api-client"
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
  const { user, token } = useAppSelector((state) => state.auth) as { user: User | null, token: string | null }
  const { courses, categories, status } = useAppSelector((state) => state.auth_courses)
  const dispatch = useAppDispatch()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all")
  const [levelFilter, setLevelFilter] = useState<string | "all">("all")
  
  // State for enrolled courses
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [isLoadingEnrolled, setIsLoadingEnrolled] = useState(false)
  const [enrolledError, setEnrolledError] = useState<string | null>(null)

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
  
  // Fetch enrolled courses using our API client
  useEffect(() => {
    if (user && token) {
      const getEnrolledCourses = async () => {
        setIsLoadingEnrolled(true)
        setEnrolledError(null)
        try {
          console.log("Courses Page: Fetching enrolled courses with token:", token.substring(0, 10) + "...")
          
          // Use our API client that properly filters enrolled courses
          const fetchedCourses = await fetchEnrolledCoursesApi(token)
          console.log(`Courses Page: Received ${fetchedCourses.length} enrolled courses:`, fetchedCourses)
          
          if (fetchedCourses.length > 0) {
            console.log("Courses Page: Setting enrolled courses from API", fetchedCourses);
            setEnrolledCourses(fetchedCourses);
          } else {
            // If no enrolled courses returned, check if we have courses in Redux store
            console.log("Courses Page: No enrolled courses returned from API, checking Redux store");
            if (courses && courses.length > 0) {
              const reduxCourses = courses.filter(course => 
                course.enrolmentStatus === 'enroled' || 
                course.enrolmentStatus === true
              );
              
              if (reduxCourses.length > 0) {
                console.log("Courses Page: Found enrolled courses in Redux store:", reduxCourses);
                setEnrolledCourses(reduxCourses);
              } else {
                setEnrolledCourses([]);
              }
            } else {
              setEnrolledCourses([]);
            }
          }
        } catch (error) {
          console.error("Courses Page: Error fetching enrolled courses:", error)
          setEnrolledError("Failed to load your enrolled courses")
          
          // Fallback to using the courses from the Redux store
          if (courses && courses.length > 0) {
            const reduxCourses = courses.filter(course => 
              course.enrolmentStatus === 'enroled' || 
              course.enrolmentStatus === true
            )
            
            if (reduxCourses.length > 0) {
              console.log("Courses Page: Using fallback enrolled courses from Redux store:", reduxCourses)
              setEnrolledCourses(reduxCourses)
            } else {
              setEnrolledCourses([])
            }
          } else {
            setEnrolledCourses([])
          }
        } finally {
          setIsLoadingEnrolled(false)
        }
      }
      
      getEnrolledCourses()
    }
  }, [user, token, courses])

  // If user is a corporate student and somehow tries to access all-courses tab, redirect to my-courses
  useEffect(() => {
    if (isCorporateStudent && activeTab === "all-courses") {
      setActiveTab("my-courses")
    }
  }, [activeTab, isCorporateStudent])

  // Filter courses based on search query and filters
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      try {
        const matchesSearch =
          (course?.title && course.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (course?.description && course.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (course?.tags && Array.isArray(course.tags) && course.tags.some((tag) => 
            tag && typeof tag === 'string' && tag.toLowerCase().includes(searchQuery.toLowerCase())
          ))

        const matchesCategory = categoryFilter === "all" || course?.category === categoryFilter
        const matchesLevel = levelFilter === "all" || course?.level === levelFilter

        return matchesSearch && matchesCategory && matchesLevel
      } catch (error) {
        console.error("Error filtering course:", error, course);
        return false;
      }
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
              status={isLoadingEnrolled ? "loading" : status}
              courses={enrolledCourses.filter((course) => {
                try {
                  const matchesSearch =
                    (course?.title && course.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (course?.description && course.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (course?.tags && Array.isArray(course.tags) && course.tags.some((tag) => 
                      tag && typeof tag === 'string' && tag.toLowerCase().includes(searchQuery.toLowerCase())
                    ))
                  
                  const matchesCategory = categoryFilter === "all" || course?.category === categoryFilter
                  const matchesLevel = levelFilter === "all" || course?.level === levelFilter
                  
                  return matchesSearch && matchesCategory && matchesLevel
                } catch (error) {
                  console.error("Error filtering enrolled course:", error, course);
                  return false;
                }
              })}
              onClearFilters={clearFilters}
            />
            {enrolledError && (
              <div className="mt-4 p-4 border rounded-md bg-destructive/10 text-destructive">
                <p>{enrolledError}</p>
              </div>
            )}
          </TabsContent>

          {/* Role-specific Tab Content */}
          {(user?.role === "admin" || user?.role === "super_admin") && (
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
