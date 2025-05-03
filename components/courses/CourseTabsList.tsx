// components/courses/CourseTabsList.tsx
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { User } from "@/types/user.types";

interface CourseTabsListProps {
    user: User | null; // Pass the user object
}

export function CourseTabsList({ user }: CourseTabsListProps) {
    if (!user) return null; // Or render default tabs if needed when no user?

    const getRoleTabs = () => {
        const commonTabs = <TabsTrigger value="all-courses">All Courses</TabsTrigger>;

        switch (user.role) {
            case "admin":
                return (
                    <>
                        {commonTabs}
                        <TabsTrigger value="manage-courses">Manage Courses</TabsTrigger>
                        <TabsTrigger value="course-analytics">Analytics</TabsTrigger>
                    </>
                );
            case "teacher":
                return (
                    <>
                        {commonTabs}
                        <TabsTrigger value="my-courses">My Courses</TabsTrigger>
                        <TabsTrigger value="course-requests">Course Requests</TabsTrigger>
                    </>
                );
            case "student":
            default:
                return (
                    <>
                        {commonTabs}
                        <TabsTrigger value="my-courses">My Courses</TabsTrigger>
                        <TabsTrigger value="recommended">Recommended</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                    </>
                );
        }
    };

    return (
        <ScrollArea className="w-full whitespace-nowrap pb-0">
            <TabsList className="mb-4 overflow-x-auto">{getRoleTabs()}</TabsList>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}