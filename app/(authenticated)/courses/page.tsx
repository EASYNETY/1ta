// app/(authenticated)/courses/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchAuthCourses } from "@/features/auth-course/store/auth-course-slice";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AuthenticationGuard } from "@/components/courses/AuthenticationGuard";
import { CoursesPageHeader } from "@/components/courses/CoursesPageHeader";
import { CourseTabsList } from "@/components/courses/CourseTabsList";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { AllCoursesTabContent } from "@/components/courses/AllCoursesTabContent";
import { MyCoursesTabContent } from "@/components/courses/MyCoursesTabContent";
import { ManageCoursesTabContent } from "@/components/courses/ManageCoursesTabContent";
import { CourseRequestsTabContent } from "@/components/courses/CourseRequestsTabContent";
import { User } from "@/types/user.types";
// Import other potential tab content components: Recommended, Completed, Analytics

export default function CoursesPage() {
  const { user } = useAppSelector((state) => state.auth) as { user: User | null };
  const { courses, categories, status } = useAppSelector((state) => state.auth_courses);
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [levelFilter, setLevelFilter] = useState<string | "all">("all");
  const [activeTab, setActiveTab] = useState("all-courses");

  // Fetch courses on mount
  useEffect(() => {
    if (user) {
      dispatch(fetchAuthCourses());
    }
  }, [dispatch, user]);

  // Filter courses based on search query and filters
  // Use useMemo to avoid recalculating on every render unless dependencies change
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.tags && course.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
      const matchesLevel = levelFilter === "all" || course.level === levelFilter;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [courses, searchQuery, categoryFilter, levelFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setLevelFilter("all");
  };

  // The AuthenticationGuard handles the case where user is null
  return (
    <AuthenticationGuard>
      <div className="space-y-6">
        <CoursesPageHeader user={user} />

        <Tabs defaultValue="all-courses" value={activeTab} onValueChange={setActiveTab}>
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
            {/*
                Note: Passing 'filteredCourses' here reflects the original logic.
                If 'all-courses' should *never* be filtered, pass 'courses' instead.
                The <CoursesSection/> component itself likely fetches public data,
                so maybe only the empty/loading states are relevant here based on the *fetch* status.
                Adjust based on the intended behavior of the "All Courses" tab vs. <CoursesSection />.
             */}
            <AllCoursesTabContent
              status={status}
              courses={filteredCourses}
              onClearFilters={clearFilters}
            />
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
          {/* Add Admin Analytics Tab Content here */}
          {/* <TabsContent value="course-analytics"> ... </TabsContent> */}

          {user?.role === "teacher" && (
            <TabsContent value="course-requests">
              {/* Pass actual request data when available */}
              <CourseRequestsTabContent status={status} />
            </TabsContent>
          )}

          {/* Add Student Recommended/Completed Tab Content here */}
          {/* <TabsContent value="recommended"> ... </TabsContent> */}
          {/* <TabsContent value="completed"> ... </TabsContent> */}

        </Tabs>
      </div>
    </AuthenticationGuard>
  );
}