"use client"

import { EmptyStateCard } from "./EmptyStateCard";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { BookOpen } from "lucide-react";
import { FetchStatus } from "@/types";
import { AuthCourse } from "@/features/auth-course/types/auth-course-interface";
import { PublicCourseCard } from "@/components/cards/PublicCourseCard";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface AllCoursesTabContentProps {
    status: FetchStatus;
    courses: AuthCourse[];
    onClearFilters: () => void;
}

export function AllCoursesTabContent({ status, courses, onClearFilters }: AllCoursesTabContentProps) {
    const [selectedCourse, setSelectedCourse] = useState<AuthCourse | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {courses.map((course) => (
                        <PublicCourseCard 
                            key={course.id}
                            course={course}
                            onClick={() => handleOpenModal(course)}
                        />
                    ))}
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-4xl p-0">
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
