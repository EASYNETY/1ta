"use client"

import { motion } from "framer-motion"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Clock } from "lucide-react"
import Link from "next/link"
import type { AuthCourse } from "@/features/auth-course/types/auth-course-interface"

interface CourseCardProps {
    course: AuthCourse
    index: number
}

export function CourseCard({ course, index }: CourseCardProps) {
    // Animation variants
    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    }

    // Calculate progress percentage
    const progressPercentage = course.progress ?? 0

    // Determine the correct image URL, handling placeholders correctly.
    // This prevents trying to fetch placeholder images from the API server.
    const getImageUrl = () => {
        const baseUrl = "https://api.onetechacademy.com";

        if (!course.image || course.image.includes('placeholder')) {
            return "/course-placeholder.png"; // fallback
        }

        if (course.image.startsWith("http")) {
            return course.image;
        }

        // If it starts with '/', assume it's a relative path from the API
        return `${baseUrl}${course.image}`;
    };

    return (
        <motion.div variants={item}>
            <DyraneCard className="overflow-hidden h-full flex flex-col">
                <div className="aspect-video bg-muted relative overflow-hidden">
                    <img
                        src={course.image ? getImageUrl() : "/course-placeholder.png"}
                        alt={course.title || "Course"}
                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                            // Prevent an infinite loop if the placeholder itself fails to load
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/course-placeholder.png";
                        }}
                    />
                </div>
                <CardHeader>
                    <CardTitle className="line-clamp-1">{course.title || "Untitled Course"}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>{course.totalVideoDuration || `${(index + 1) * 5 + 10} hours`}</span>
                        <span className="mx-2">•</span>
                        <span>{course.level || (index % 2 === 0 ? "Intermediate" : "Beginner")}</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-primary/20">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${progressPercentage}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{`${progressPercentage}% complete`}</p>
                </CardContent>
                <CardFooter>
                    <DyraneButton variant="outline" size="sm" className="w-full" asChild>
                        <Link href={`/courses/${course.slug}`}>Continue Learning</Link>
                    </DyraneButton>
                </CardFooter>
            </DyraneCard>
        </motion.div>
    )
}
