// components/courses/ManageCoursesTabContent.tsx
import { useState } from "react";
import { AdminGuard } from "@/components/auth/PermissionGuard";
import { FetchStatus } from "@/types";
import { AuthCourse } from "@/features/auth-course/types/auth-course-interface";
import { useAppDispatch } from "@/store/hooks";
import { deleteAuthCourse } from "@/features/auth-course/store/auth-course-slice";
import { toast } from "sonner";
import { ManageCourseTable } from "./ManageCourseTable"; // Import the new table component
import { PaginationControls, PaginationInfo } from "@/components/ui/pagination-controls";
import { PAGINATION_CONFIG, isServerPaginationEnabled } from "@/config/pagination";
import { useEnhancedHybridPagination } from "@/hooks/use-hybrid-pagination";
// Remove imports only needed by the row/table (Link, Badge, Icons, Dropdown, Button etc. unless used elsewhere)

interface ManageCoursesTabContentProps {
    status: FetchStatus;
    courses: AuthCourse[]; // Filtered courses passed down
}

export function ManageCoursesTabContent({ status, courses }: ManageCoursesTabContentProps) {
    const dispatch = useAppDispatch();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);

    // Configuration for pagination
    const serverPaginated = isServerPaginationEnabled('MANAGE_COURSES_SERVER_PAGINATION');

    // Apply hybrid pagination
    const paginationResult = useEnhancedHybridPagination({
        data: courses,
        currentPage,
        itemsPerPage,
        serverPaginated,
        // No server metadata for now since we're using client-side pagination
    });

    const {
        paginatedData: paginatedCourses,
        totalItems,
        totalPages,
    } = paginationResult;

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // --- Delete Handler ---
    // This function is called *after* the user confirms in the dialog
    const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
        try {
            await dispatch(deleteAuthCourse(courseId)).unwrap();
            toast.success(`Course "${courseTitle}" deleted successfully.`);

            // Reset to page 1 if current page becomes empty after deletion
            const remainingItems = totalItems - 1;
            const maxPage = Math.ceil(remainingItems / itemsPerPage);
            if (currentPage > maxPage && maxPage > 0) {
                setCurrentPage(maxPage);
            }
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

    // Render the ManageCourseTable component with pagination.
    // The table component itself handles the "no results found" message within its tbody.
    return (
        <AdminGuard>
            <div className="space-y-6">
                <ManageCourseTable
                    courses={paginatedCourses}
                    onDeleteCourse={handleDeleteCourse}
                />

                {/* Pagination Controls */}
                {status === "succeeded" && totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 w-full border border-border/25 bg-card/5 backdrop-blur-sm p-2 rounded-md">
                        <PaginationInfo
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                        />
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            className="w-full flex-1 justify-end"
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </AdminGuard>
    );
}