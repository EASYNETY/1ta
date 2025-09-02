// components/courses/MyCoursesTabContent.tsx
import { motion } from "framer-motion";
import { CourseCard } from "@/components/dashboard/course-card";
import { EmptyStateCard } from "./EmptyStateCard";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { FetchStatus } from "@/types";
import { AuthCourse } from "@/features/auth-course/types/auth-course-interface";

interface MyCoursesTabContentProps {
    status: FetchStatus;
    courses: AuthCourse[];
    onClearFilters: () => void;
}

// Animation variants
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
    console.log("[MyCoursesTabContent] Received courses:", courses);
    console.log("[MyCoursesTabContent] Status:", status);

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

    if (status === "failed") {
        return (
            <EmptyStateCard
                Icon={BookOpen}
                title="Error Loading Your Courses"
                message="There was an error loading your enrolled courses. Please try again later."
                action={
                    <DyraneButton onClick={() => window.location.reload()}>
                        Retry
                    </DyraneButton>
                }
            />
        );
    }

    if (courses && courses.length > 0) {
        console.log("[MyCoursesTabContent] Rendering courses grid with", courses.length, "courses");
        
        return (
            <motion.div
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {courses.map((course, index) => {
                    console.log(`[MyCoursesTabContent] Rendering course ${index}:`, {
                        id: course?.id,
                        title: course?.title,
                        image: course?.image,
                        iconUrl: course?.iconUrl,
                        enrolmentStatus: course?.enrolmentStatus
                    });
                    
                    return (
                        <CourseCard 
                            key={`my-courses-${course?.id || index}-${index}`} 
                            course={course} 
                            index={index} 
                        />
                    );
                })}
            </motion.div>
        );
    }

    // Empty state
    const message = "You haven't enrolled in any courses yet, or no courses match your current filters. Browse our catalog to find courses that interest you.";

    return (
        <EmptyStateCard
            Icon={BookOpen}
            title="No enrolled courses found"
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