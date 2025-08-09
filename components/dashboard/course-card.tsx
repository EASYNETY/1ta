"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Clock, Layers } from "lucide-react"
import Link from "next/link"
import { getCourseIcon } from "@/utils/course-icon-mapping"
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

    console.log(`[CourseCard] ${course.title} image:`, course.image);

    // Enhanced image URL handling - direct use of API image
    const getImageUrl = () => {
        // Since the console shows the image URL is already complete, use it directly
        if (course.image && course.image.startsWith("http") && !course.image.includes('placeholder')) {
            console.log(`[CourseCard] Using direct image URL: ${course.image}`);
            return course.image;
        }

        // Fallback to iconUrl if available
        if (course.iconUrl && course.iconUrl.startsWith("http")) {
            console.log(`[CourseCard] Using iconUrl: ${course.iconUrl}`);
            return course.iconUrl;
        }

        // Final fallback to generated icon
        console.log(`[CourseCard] Using generated icon for: ${course.title}`);
        return getCourseIcon(course.title, course.id);
    };

    const imageUrl = getImageUrl();

    return (
        <motion.div variants={item}>
            <DyraneCard className="overflow-hidden h-full flex flex-col group">
                <div className="aspect-video bg-muted relative overflow-hidden">
                    <Image
                        src={imageUrl}
                        alt={course.title || "Course"}
                        fill
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        unoptimized={imageUrl.includes('api.onetechacademy.com')} // Disable Next.js optimization for external API images
                        onError={(e) => {
                            console.log(`[CourseCard] Image failed to load: ${imageUrl}`);
                            const target = e.currentTarget as HTMLImageElement;
                            // Only fallback if we haven't already tried the generated icon
                            if (!target.src.includes('generated-icon') && !target.dataset.fallbackAttempted) {
                                target.dataset.fallbackAttempted = 'true';
                                target.src = getCourseIcon(course.title, course.id);
                            }
                        }}
                        onLoad={() => {
                            console.log(`[CourseCard] Image loaded successfully: ${imageUrl}`);
                        }}
                        priority={index < 4} // Prioritize loading for first 4 images
                    />
                    
                    {/* Progress overlay */}
                    {progressPercentage > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm p-2">
                            <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5">
                                <div 
                                    className="bg-primary h-full rounded-full transition-all duration-300" 
                                    style={{ width: `${progressPercentage}%` }} 
                                />
                            </div>
                        </div>
                    )}
                </div>
                
                <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2 text-base leading-tight">
                        {course.title || "Untitled Course"}
                    </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-grow pt-0">
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{course.totalVideoDuration || `${(index + 1) * 5 + 10} hours`}</span>
                        <span className="mx-2">•</span>
                        <Layers className="mr-1 h-4 w-4" />
                        <span>{course.lessonCount || 'Multiple'} lessons</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                        <span className="px-2 py-1 bg-muted rounded-full text-xs">
                            {course.level || (index % 2 === 0 ? "Intermediate" : "Beginner")}
                        </span>
                    </div>
                </CardContent>
                
                <CardFooter className="pt-0">
                    <DyraneButton variant="outline" size="sm" className="w-full" asChild>
                        <Link href={`/courses/${course.slug}`}>
                            {progressPercentage > 0 ? "Continue Learning" : "Start Learning"}
                        </Link>
                    </DyraneButton>
                </CardFooter>
            </DyraneCard>
        </motion.div>
    )
}