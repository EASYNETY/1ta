"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Clock, Layers, PlayCircle, FileQuestion, CheckCircle, Users, Lock } from "lucide-react"
import { DyraneCard, DyraneCardContent, DyraneCardFooter } from "@/components/dyrane-ui/dyrane-card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { useAppDispatch } from "@/store/hooks"
import { useToast } from "@/hooks/use-toast"
import { AbstractBackground } from "../layout/abstract-background"
import type { AuthCourse } from "@/features/auth-course/types/auth-course-interface"
import { getCourseIcon } from "@/utils/course-icon-mapping"

interface AuthCourseCardProps {
    course: AuthCourse
    className?: string
    onClick?: () => void
    isModal?: boolean
    onClose?: () => void
    progress?: number
}

// Component to render either Video or Fallback Image
const CourseMediaPreview = ({ course }: { course: AuthCourse }) => {
    // Use video if URL exists, otherwise use placeholder image
    if (course.previewVideoUrl) {
        return (
            <video
                key={course.previewVideoUrl}
                src={course.previewVideoUrl}
                muted
                playsInline
                preload="metadata"
                disablePictureInPicture
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
        )
    }

    // Fallback to course icon or placeholder image
    const imageSource = course.iconUrl || course.image || getCourseIcon(course.title, course.id);

    return (
        <Image
            src={imageSource}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={!course.previewVideoUrl}
        />
    )
}

export function AuthCourseCard({
    course,
    className,
    onClick,
    isModal = false,
    onClose,
    progress = 0,
}: AuthCourseCardProps) {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { toast } = useToast()

    const levelBadgeColor = (level?: string) => {
        switch (level) {
            case "Beginner":
                return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300/50 dark:border-green-700/50"
            case "Intermediate":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-300/50 dark:border-yellow-700/50"
            case "Advanced":
                return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300/50 dark:border-red-700/50"
            default:
                return "bg-muted text-muted-foreground border-border"
        }
    }

    const handleContinueLearning = () => {
        router.push(`/courses/${course.slug}`)
    }

    // --- MODAL VIEW ---
    if (isModal) {
        return (
            <div className="relative">
                <AbstractBackground className="opacity-90 dark:opacity-80" />
                <div className="relative z-10 max-h-[90vh] overflow-y-auto bg-background/85 backdrop-blur-sm rounded-xl xl:max-h-[80vh]">
                    <div className="relative w-full aspect-video bg-muted">
                        <CourseMediaPreview course={course} />
                        {course.level && (
                            <Badge
                                variant="outline"
                                className={cn(
                                    "absolute top-4 right-4 backdrop-blur-sm bg-background/70",
                                    levelBadgeColor(course.level),
                                )}
                            >
                                {course.level}
                            </Badge>
                        )}
                    </div>

                    <div className="w-full flex flex-col h-full">
                        <div className="p-6 overflow-y-auto flex-grow">
                            <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
                            {course.subtitle && <p className="text-muted-foreground mb-4">{course.subtitle}</p>}

                            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm">
                                <span className="inline-flex items-center">
                                    <Layers className="size-4 mr-2 text-muted-foreground" />
                                    {course.lessonCount} lessons
                                </span>
                                {course.totalVideoDuration && (
                                    <span className="inline-flex items-center">
                                        <Clock className="size-4 mr-2 text-muted-foreground" />
                                        {course.totalVideoDuration}
                                    </span>
                                )}
                            </div>

                            {progress > 0 && (
                                <div className="mb-6">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Progress</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                </div>
                            )}

                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="mb-4 grid w-full grid-cols-3">
                                    <TabsTrigger value="overview" className="hover:bg-background/50 cursor-pointer">
                                        Overview
                                    </TabsTrigger>
                                    <TabsTrigger value="curriculum" className="hover:bg-background/50 cursor-pointer">
                                        Curriculum
                                    </TabsTrigger>
                                    <TabsTrigger value="instructor" className="hover:bg-background/50 cursor-pointer">
                                        Instructor
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="space-y-6 text-sm">
                                    <div>
                                        <h3 className="font-semibold mb-2 text-base">Description</h3>
                                        <div
                                            className="text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                                            dangerouslySetInnerHTML={{ __html: course.description || "" }}
                                        />
                                    </div>

                                    {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-2 text-base">What You'll Learn</h3>
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                                {course.learningOutcomes.map((outcome, index) => (
                                                    <li key={index} className="flex items-start">
                                                        <CheckCircle className="size-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>{outcome}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {course.prerequisites && course.prerequisites.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-2 text-base">Prerequisites</h3>
                                            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                                {course.prerequisites.map((prereq, index) => (
                                                    <li key={index}>{prereq}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="curriculum">
                                    {course.modules && course.modules.length > 0 ? (
                                        <div className="space-y-4">
                                            {course.modules.map((module, index) => (
                                                <div key={index} className="border rounded-md overflow-hidden">
                                                    <div className="p-3 bg-muted/50 flex justify-between items-center border-b">
                                                        <h4 className="font-medium text-sm">{module.title}</h4>
                                                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-4">{module.duration}</span>
                                                    </div>

                                                    {module.lessons && module.lessons.length > 0 && (
                                                        <ul className="p-3 text-sm space-y-1.5">
                                                            {module.lessons.map((lesson, lessonIndex) => (
                                                                <li key={lessonIndex} className="flex items-center text-muted-foreground text-xs">
                                                                    {lesson.duration.includes("quiz") ? (
                                                                        <FileQuestion className="size-3.5 mr-2 flex-shrink-0 text-blue-500" />
                                                                    ) : (
                                                                        <PlayCircle className="size-3.5 mr-2 flex-shrink-0 text-green-500" />
                                                                    )}
                                                                    <span>{lesson.title}</span>
                                                                    {!lesson.isUnlocked && (
                                                                        <Lock className="size-3.5 ml-2 flex-shrink-0 text-muted-foreground" />
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">Curriculum details not available.</p>
                                    )}
                                </TabsContent>

                                <TabsContent value="instructor">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                            {course.instructor.avatar ? (
                                                <Image
                                                    src={course.instructor.avatar || "/placeholder.svg"}
                                                    alt={course.instructor.name}
                                                    width={64}
                                                    height={64}
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <Users className="h-8 w-8 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{course.instructor.name}</h3>
                                            {course.instructor.title && (
                                                <p className="text-sm text-muted-foreground">{course.instructor.title}</p>
                                            )}
                                            {course.instructor.bio && (
                                                <p className="text-sm text-muted-foreground mt-2">{course.instructor.bio}</p>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t flex justify-between items-center mt-auto sticky bottom-0 bg-background/90 backdrop-blur-sm">
                            <DyraneButton variant="ghost" onClick={() => onClose?.()}>
                                Close
                            </DyraneButton>
                            <DyraneButton size="lg" onClick={handleContinueLearning}>
                                {progress > 0 ? "Continue Learning" : "Start Learning"}
                            </DyraneButton>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // --- REGULAR CARD VIEW ---
    return (
        <DyraneCard
            className={cn("flex flex-col h-full overflow-hidden group", className)}
            cardClassName="flex flex-col h-full"
            layout
            onClick={onClick}
            style={{ cursor: onClick ? "pointer" : "default" }}
        >
            <div className="aspect-[16/10] relative overflow-hidden bg-muted">
                <CourseMediaPreview course={course} />
                {course.level && (
                    <Badge
                        variant="outline"
                        className={cn(
                            "absolute top-2 right-2 backdrop-blur-sm bg-background/70 text-xs px-1.5 py-0.5",
                            levelBadgeColor(course.level),
                        )}
                    >
                        {course.level}
                    </Badge>
                )}

                {progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm px-2 py-1">
                        <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                    </div>
                )}
            </div>

            {/* Card Content */}
            <DyraneCardContent className="flex-1 p-4 space-y-2">
                <h3 className="font-semibold text-base leading-snug line-clamp-2 mb-1">
                    <span className={onClick ? "group-hover:text-primary transition-colors" : ""}>{course.title}</span>
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center">
                        <Layers className="size-3.5 mr-1" />
                        {course.lessonCount} lessons
                    </span>
                    {course.totalVideoDuration && (
                        <span className="inline-flex items-center">
                            <Clock className="size-3.5 mr-1" />
                            {course.totalVideoDuration}
                        </span>
                    )}
                </div>
            </DyraneCardContent>

            {/* Card Footer */}
            <DyraneCardFooter className="p-4 pt-3 mt-auto border-t border-border/30 hidden group-hover:inline transition-all duration-500 ease-[cubic-bezier(0.77, 0, 0.175, 1)]">
                <div className="flex justify-end items-center w-full">
                    <DyraneButton
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                            if (onClick) {
                                e.stopPropagation()
                                onClick()
                            } else {
                                handleContinueLearning()
                            }
                        }}
                    >
                        <span>{progress > 0 ? "Continue Learning" : "Start Learning"}</span>
                    </DyraneButton>
                </div>
            </DyraneCardFooter>
        </DyraneCard>
    )
}
