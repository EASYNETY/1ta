// components/courses/MyCoursesTabContent.tsx
import { motion } from "framer-motion";
import { CourseCard } from "@/components/dashboard/course-card";
import { EmptyStateCard } from "./EmptyStateCard";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { FetchStatus } from "@/types"; // Assuming type exists
import { AuthCourse } from "@/features/auth-course/types/auth-course-interface";

interface MyCoursesTabContentProps {
    status: FetchStatus;
    courses: AuthCourse[]; // These should be the *filtered* courses relevant to the user
    onClearFilters: () => void; // Pass clear filter action if needed for empty state
}

// Animation variants (can be moved to a constants file)
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export function MyCoursesTabContent({ status, courses, onClearFilters }: MyCoursesTabContentProps) {
    if (status === "loading") {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array(4)
                    .fill(0)
                    .map((_, i) => (
                        <div key={i} className="h-[300px] rounded-xl bg-muted animate-pulse" />
                    ))}
            </div>
        );
    }

    if (courses.length > 0) {
        return (
            <motion.div
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {courses.map((course, index) => (
                    <CourseCard key={course.id} course={course} index={index} />
                ))}
            </motion.div>
        );
    }

    // Adjust message based on context (e.g., if filters are active)
    const message = "You haven't enrolled in any courses yet, or no courses match your current filters. Browse our catalog to find courses that interest you.";

    return (
        <EmptyStateCard
            Icon={BookOpen}
            title="No courses found"
            message={message}
            action={
                <>
                    <DyraneButton onClick={onClearFilters} variant="outline" className="mb-2">
                        Clear Filters
                    </DyraneButton>
                    <DyraneButton asChild>
                        <Link href="/courses">Browse All Courses</Link>
                    </DyraneButton>
                </>
            }
        />
    );
}