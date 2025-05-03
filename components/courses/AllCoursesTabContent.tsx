// components/courses/AllCoursesTabContent.tsx
import { CoursesSection } from "@/components/landing/public-course-section";
import { EmptyStateCard } from "./EmptyStateCard";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { BookOpen } from "lucide-react";
import { FetchStatus } from "@/types"; // Assuming type exists
import { AuthCourse } from "@/features/auth-course/types/auth-course-interface";

interface AllCoursesTabContentProps {
    status: FetchStatus;
    courses: AuthCourse[]; // Even if using CoursesSection, pass courses to check length
    onClearFilters: () => void;
}

export function AllCoursesTabContent({ status, courses, onClearFilters }: AllCoursesTabContentProps) {
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

    if (courses.length > 0) {
        // Assuming CoursesSection can handle displaying all available courses
        return (
            <div className="px-4 md:px-6 relative">
                <CoursesSection />
            </div>
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