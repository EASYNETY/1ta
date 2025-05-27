"use client"

import { EmptyStateCard } from "./EmptyStateCard";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { BookOpen } from "lucide-react";
import { FetchStatus } from "@/types";
import { AuthCourse } from "@/features/auth-course/types/auth-course-interface";
import { PublicCourseCard } from "@/components/cards/PublicCourseCard";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { PaginationControls, PaginationInfo } from "@/components/ui/pagination-controls";
import { PAGINATION_CONFIG, isServerPaginationEnabled } from "@/config/pagination";
import { useEnhancedHybridPagination } from "@/hooks/use-hybrid-pagination";

interface AllCoursesTabContentProps {
    status: FetchStatus;
    courses: AuthCourse[];
    onClearFilters: () => void;
}

export function AllCoursesTabContent({ status, courses, onClearFilters }: AllCoursesTabContentProps) {
    const [selectedCourse, setSelectedCourse] = useState<AuthCourse | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);
    const serverPaginated = isServerPaginationEnabled('ALL_COURSES_SERVER_PAGINATION');

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

    const handleOpenModal = (course: AuthCourse) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    if (status === "loading") {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array(8)
                    .fill(0)
                    .map((_, i) => (
                        <div key={i} className="h-[300px] rounded-xl bg-muted animate-pulse" />
                    ))}
            </div>
        );
    }

    if (status === "failed") {
        return (
            <EmptyStateCard
                Icon={BookOpen}
                title="Error Loading Courses"
                message="There was an error loading the courses. Please try again later."
                action={
                    <DyraneButton onClick={() => window.location.reload()}>
                        Retry
                    </DyraneButton>
                }
            />
        );
    }

    if (courses.length > 0) {
        return (
            <>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedCourses.map((course, index) => (
                            <PublicCourseCard
                                key={`all-courses-${course.id}-page-${currentPage}-${index}`}
                                course={course}
                                onClick={() => handleOpenModal(course)}
                            />
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
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

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-4xl p-0">
                        <VisuallyHidden>
                            <DialogTitle>
                                {selectedCourse ? `Course Details: ${selectedCourse.title}` : 'Course Details'}
                            </DialogTitle>
                        </VisuallyHidden>
                        {selectedCourse && (
                            <PublicCourseCard
                                course={selectedCourse}
                                isModal={true}
                                onClose={handleCloseModal}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    return (
        <EmptyStateCard
            Icon={BookOpen}
            title="No courses found"
            message="We couldn't find any courses matching your search criteria. Try adjusting your filters or search query."
            action={
                <DyraneButton onClick={onClearFilters}>
                    Clear Filters
                </DyraneButton>
            }
        />
    );
}
