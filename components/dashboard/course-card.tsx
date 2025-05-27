"use client"

import { motion } from "framer-motion"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Clock } from "lucide-react"
import Link from "next/link"
import type { AuthCourse } from "@/features/auth-course/types/auth-course-interface"
import { getCourseIcon } from "@/utils/course-icon-mapping"

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
    const progressPercentage = course.progress || (index * 15) % 100

    return (
        <motion.div variants={item}>
            <DyraneCard className="overflow-hidden h-full flex flex-col">
                <div className="aspect-video bg-muted relative overflow-hidden">
                    <img
                        src={course.iconUrl || course.image || getCourseIcon(course.title, course.id)}
                        alt={course.title}
                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                    />
                </div>
                <CardHeader>
                    <CardTitle className="line-clamp-1">{course.title}</CardTitle>
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
