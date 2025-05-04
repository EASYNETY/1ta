// components/courses/ManageCoursesTabContent.tsx
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card";
import { CardContent } from "@/components/ui/card";
import { FetchStatus } from "@/types";
import { AuthCourse } from "@/features/auth-course/types/auth-course-interface";
import { useAppDispatch } from "@/store/hooks";
import { deleteAuthCourse } from "@/features/auth-course/store/auth-course-slice";
import { toast } from "sonner";
import { ManageCourseTable } from "./ManageCourseTable"; // Import the new table component
// Remove imports only needed by the row/table (Link, Badge, Icons, Dropdown, Button etc. unless used elsewhere)

interface ManageCoursesTabContentProps {
    status: FetchStatus;
    courses: AuthCourse[]; // Filtered courses passed down
}

export function ManageCoursesTabContent({ status, courses }: ManageCoursesTabContentProps) {
    const dispatch = useAppDispatch();

    // --- Delete Handler ---
    // This function is called *after* the user confirms in the dialog
    const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
        try {
            await dispatch(deleteAuthCourse(courseId)).unwrap();
            toast.success(`Course "${courseTitle}" deleted successfully.`);
        } catch (error: any) {
            console.error("Failed to delete course:", error);
            toast.error(`Failed to delete course: ${error?.message || 'Unknown error'}`);
        }
    };
    // --- End Delete Handler ---

    if (status === "loading") {
        // Consider a Skeleton loader here
        return <div className="p-6">Loading course management...</div>;
    }

    // Render the ManageCourseTable component.
    // The table component itself handles the "no results found" message within its tbody.
    return (
        <ManageCourseTable
            courses={courses}
            onDeleteCourse={handleDeleteCourse}
        />
    );
}