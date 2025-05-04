// components/courses/CourseTabsList.tsx
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

import type { User } from "@/types/user.types"
import { isStudent } from "@/types/user.types"

interface CourseTabsListProps {
    user: User | null // Pass the user object
}

export function CourseTabsList({ user }: CourseTabsListProps) {
    if (!user) return null // Or render default tabs if needed when no user?

    // Check if user is a corporate student
    const isCorporateStudent = isStudent(user) && user.corporateId !== undefined && user.corporateId !== null && !user.isCorporateManager;

    const getRoleTabs = () => {
        // Only include the All Courses tab if NOT a corporate student
        const allCoursesTab = !isCorporateStudent ? <TabsTrigger value="all-courses">All Courses</TabsTrigger> : null

        switch (user.role) {
            case "admin":
                return (
                    <>
                        {allCoursesTab}
                        <TabsTrigger value="manage-courses">Manage Courses</TabsTrigger>
                        <TabsTrigger value="course-analytics">Analytics</TabsTrigger>
                    </>
                )
            case "teacher":
                return (
                    <>
                        {allCoursesTab}
                        <TabsTrigger value="my-courses">My Courses</TabsTrigger>
                        <TabsTrigger value="course-requests">Course Requests</TabsTrigger>
                    </>
                )
            case "student":
            default:
                return (
                    <>
                        {allCoursesTab}
                        <TabsTrigger value="my-courses">My Courses</TabsTrigger>
                        <TabsTrigger value="recommended">Recommended</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                    </>
                )
        }
    }

    return (
        <ScrollArea className="w-full whitespace-nowrap pb-0">
            <TabsList className="mb-4 overflow-x-auto">{getRoleTabs()}</TabsList>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )
}
