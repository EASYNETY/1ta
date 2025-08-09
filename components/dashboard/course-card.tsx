"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useState } from "react"
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
    const [imageError, setImageError] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)
    
    // Animation variants
    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    }

    // Calculate progress percentage
    const progressPercentage = course.progress ?? 0

    console.log(`[CourseCard] ${course.title} image:`, course.image);

    // Enhanced image URL handling
    const getImageUrl = () => {
        // If we had an error, use fallback
        if (imageError) {
            console.log(`[CourseCard] Using generated icon due to error for: ${course.title}`);
            return getCourseIcon(course.title, course.id);
        }

        // Use direct API image if available
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
    const isExternalImage = imageUrl.includes('api.onetechacademy.com');

    const handleImageError = () => {
        console.log(`[CourseCard] Image failed to load: ${imageUrl}`);
        if (!imageError) {
            setImageError(true);
        }
    };

    const handleImageLoad = () => {
        console.log(`[CourseCard] Image loaded successfully: ${imageUrl}`);
        setImageLoaded(true);
    };

    return (
        <motion.div variants={item}>
            <DyraneCard className="overflow-hidden h-full flex flex-col group">
                <div className="aspect-video bg-muted relative overflow-hidden">
                    {isExternalImage && !imageError ? (
                        // Use regular img for external images to avoid Next.js issues
                        <img
                            src={imageUrl}
                            alt={course.title || "Course"}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105 absolute inset-0"
                            onError={handleImageError}
                            onLoad={handleImageLoad}
                            loading={index < 4 ? "eager" : "lazy"}
                        />
                    ) : (
                        // Use Next.js Image for internal/fallback images
                        <Image
                            src={imageUrl}
                            alt={course.title || "Course"}
                            fill
                            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                            onError={handleImageError}
                            onLoad={handleImageLoad}
                            priority={index < 4}
                        />
                    )}
                    
                    {/* Loading state */}
                    {!imageLoaded && !imageError && (
                        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                    
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