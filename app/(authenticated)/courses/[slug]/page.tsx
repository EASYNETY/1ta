"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import {
    fetchAuthCourseBySlug,
    setCurrentModule,
    setCurrentLesson,
    markLessonComplete,
} from "@/features/auth-course/store/auth-course-slice"
import { fetchAssignments } from "@/features/assignments/store/assignment-slice"
import { fetchGradeItems, fetchStudentGrades } from "@/features/grades/store/grade-slice"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent } from "@/components/ui/card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, Users, CheckCircle, LockIcon, PlayCircle, FileText, Download, Award, Edit, MessageSquare, Share2, Bookmark, Star, Bell } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { ClassAssignmentLink } from "@/components/courses/ClassAssignmentLink"
import { ClassQuizLink } from "@/components/courses/ClassQuizLink"
import { ClassGradeLink } from "@/components/courses/ClassGradeLink"
import { PageHeader } from "@/components/layout/auth/page-header"
import { AwsS3VideoPlayer } from "@/components/video/AwsS3VideoPlayer"

export default function CourseDetailPage() {
    const params = useParams()
    const slug = params?.slug as string
    const dispatch = useAppDispatch()
    const { toast } = useToast()
    const { user } = useAppSelector((state) => state.auth)
    const { currentCourse, currentModuleId, currentLessonId, status } = useAppSelector((state) => state.auth_courses)
    const [activeTab, setActiveTab] = useState("overview")

    useEffect(() => {
        if (user && slug) {
            dispatch(fetchAuthCourseBySlug(slug))
                .unwrap()
                .then((course) => {
                    // Fetch assignments for this course
                    dispatch(fetchAssignments({
                        role: user.role,
                        courseId: course.id
                    }))

                    // Fetch grade items for this course
                    dispatch(fetchGradeItems({
                        role: user.role,
                        courseId: course.id
                    }))

                    // Fetch student grades if student
                    if (user.role === 'student') {
                        dispatch(fetchStudentGrades(user.id))
                    }
                })
        }
    }, [dispatch, slug, user])

    if (!user) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Authentication Required</h2>
                    <p className="text-muted-foreground mt-2">Please log in to access this course.</p>
                    <DyraneButton asChild className="mt-4">
                        <Link href="/login">Go to Login</Link>
                    </DyraneButton>
                </div>
            </div>
        )
    }

    if (status === "loading" || !currentCourse) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading course...</p>
                </div>
            </div>
        )
    }

    if (status === "failed") {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600">Error Loading Course</h2>
                    <p className="text-muted-foreground mt-2">Unable to load the course. Please try again later.</p>
                    <DyraneButton asChild className="mt-4">
                        <Link href="/courses">Back to Courses</Link>
                    </DyraneButton>
                </div>
            </div>
        )
    }

    // Handle module selection - don't auto-select first lesson
    const handleModuleSelect = (moduleId: string) => {
        console.log('Module selected:', moduleId)
        dispatch(setCurrentModule(moduleId))
        // Don't auto-select lesson - let user choose
        dispatch(setCurrentLesson(null))
    }

    // Handle lesson selection
    const handleLessonSelect = (moduleId: string, lessonId: string) => {
        console.log('Lesson selected:', { moduleId, lessonId })
        dispatch(setCurrentModule(moduleId))
        dispatch(setCurrentLesson(lessonId))
    }

    // Handle lesson completion
    const handleMarkLessonComplete = (lessonId: string, completed: boolean) => {
        if (!currentCourse) return

        dispatch(
            markLessonComplete({
                courseId: currentCourse.id,
                lessonId,
                completed,
            }),
        )
            .unwrap()
            .then(() => {
                toast({
                    title: completed ? "Lesson Completed" : "Lesson Marked as Incomplete",
                    description: completed ? "Your progress has been updated." : "The lesson has been marked as incomplete.",
                    variant: completed ? "success" : "default",
                })
            })
            .catch((error) => {
                toast({
                    title: "Error",
                    description: error.message || "Failed to update lesson status",
                    variant: "destructive",
                })
            })
    }

    // Get current module and lesson
    const currentModuleObj = currentModuleId ? currentCourse.modules.find((m) => m.id === currentModuleId) : null
    const currentLessonObj = currentModuleObj && currentLessonId ? 
        currentModuleObj.lessons.find((l) => l.id === currentLessonId) : null

    // Get lesson icon based on type
    const getLessonIcon = (type: string) => {
        switch (type) {
            case "video":
                return <PlayCircle className="h-4 w-4" />
            case "quiz":
                return <FileText className="h-4 w-4" />
            case "assignment":
                return <FileText className="h-4 w-4" />
            case "text":
                return <BookOpen className="h-4 w-4" />
            case "download":
                return <Download className="h-4 w-4" />
            default:
                return <BookOpen className="h-4 w-4" />
        }
    }

    // Format duration
    const formatDuration = (duration: string) => {
        if (!duration) return "--"
        if (duration.includes(":")) return duration // Already formatted

        const numeric = Number.parseInt(duration)
        if (isNaN(numeric)) return "--"

        const hours = Math.floor(numeric / 60)
        const minutes = numeric % 60

        if (hours > 0) {
            return `${hours}h ${minutes}m`
        }
        return `${minutes}m`
    }

    // Helper function to check if course is available for enrolment
    const isAvailableForEnrolment = () => {
        return !(currentCourse.isAvailableForEnrolment === false || currentCourse.available_for_enrolment === false)
    }

    // Role-specific actions
    const getRoleActions = () => {
        const isAvailable = isAvailableForEnrolment()

        switch (user.role) {
            case "admin":
            case "super_admin":
                return (
                    <div className="flex gap-2">
                        <DyraneButton variant="outline" size="sm" asChild>
                            <Link href={`/courses/${slug}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Course
                            </Link>
                        </DyraneButton>
                        {!isAvailable && (
                            <DyraneButton variant="outline" size="sm" className="text-green-600 border-green-300 hover:bg-green-50">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Enable Enrolment
                            </DyraneButton>
                        )}
                    </div>
                )
            case "teacher":
                return (
                    <div className="flex gap-2">
                        <DyraneButton variant="outline" size="sm" asChild>
                            <Link href={`/courses/${slug}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Content
                            </Link>
                        </DyraneButton>
                    </div>
                )
            default:
                return (
                    <div className="flex gap-2 flex-wrap">
                        <DyraneButton variant="outline" size="sm">
                            <Bookmark className="mr-2 h-4 w-4" />
                            Bookmark
                        </DyraneButton>
                        <DyraneButton variant="outline" size="sm">
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                        </DyraneButton>
                    </div>
                )
        }
    }

    // Render main content area
    const renderMainContent = () => {
        // If no lesson is selected, show course overview/thumbnail
        if (!currentLessonObj) {
            return (
                <div className="aspect-video w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border rounded-lg">
                    <div className="text-center p-8">
                        {currentCourse.image ? (
                            <img 
                                src={currentCourse.image} 
                                alt={currentCourse.title}
                                className="max-h-32 mx-auto mb-4 rounded-lg shadow-md"
                            />
                        ) : (
                            <div className="w-32 h-32 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <PlayCircle className="h-16 w-16 text-primary" />
                            </div>
                        )}
                        <h3 className="text-lg font-semibold mb-2">Welcome to {currentCourse.title}</h3>
                        <p className="text-muted-foreground mb-4">
                            Select a lesson from the course content sidebar to start learning.
                        </p>
                        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{currentCourse.totalVideoDuration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                <span>{currentCourse.lessonCount} lessons</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        // If lesson is selected and it's a video
        if (currentLessonObj.type === "video") {
            const videoUrl = currentLessonObj.content?.videoUrl || currentLessonObj.videoUrl
            
            if (videoUrl) {
                return (
                    <AwsS3VideoPlayer
                        videoUrl={videoUrl}
                        poster={currentCourse.image}
                        lesson={{
                            id: currentLessonObj.id,
                            title: currentLessonObj.title,
                            duration: currentLessonObj.duration
                        }}
                        className="w-full"
                    />
                )
            }
        }

        // For other lesson types or videos without URL
        return (
            <div className="aspect-video w-full bg-muted flex items-center justify-center">
                <div className="text-center">
                    {getLessonIcon(currentLessonObj.type)}
                    <p className="text-muted-foreground mt-2">
                        {currentLessonObj.type === "quiz"
                            ? "Quiz content will be displayed here"
                            : currentLessonObj.type === "assignment"
                                ? "Assignment content will be displayed here"
                                : currentLessonObj.type === "text"
                                    ? "Text lesson content will be displayed here"
                                    : "Lesson content will be displayed here"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        {currentLessonObj.title} • {currentLessonObj.type}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader />
            <div className="flex flex-col md:flex-row gap-6">
                {/* Course Content Sidebar */}
                <div className="w-full md:w-1/3 lg:w-1/4 space-y-4">
                    <DyraneCard>
                        <CardContent className="p-4">
                            <h2 className="text-lg font-semibold mb-4">Course Content</h2>

                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Your Progress</span>
                                    <span>{currentCourse.progress || 0}%</span>
                                </div>
                                <Progress value={currentCourse.progress || 0} className="h-2" />
                            </div>

                            <Accordion type="single" collapsible className="w-full">
                                {currentCourse.modules.map((module) => (
                                    <AccordionItem key={module.id} value={module.id}>
                                        <AccordionTrigger
                                            className={cn(
                                                "text-sm hover:no-underline",
                                                currentModuleId === module.id ? "font-medium text-primary" : ""
                                            )}
                                            onClick={() => handleModuleSelect(module.id)}
                                        >
                                            <div className="flex items-start text-left">
                                                <span>{module.title}</span>
                                                <Badge variant="outline" className="ml-2 text-xs">
                                                    {module.lessons.length}
                                                </Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-1 pl-2">
                                                {module.lessons.map((lesson) => (
                                                    <button
                                                        key={lesson.id}
                                                        className={cn(
                                                            "flex items-center gap-2 w-full text-left text-sm py-2 px-3 rounded-md transition-colors",
                                                            currentLessonId === lesson.id
                                                                ? "bg-primary/10 text-primary font-medium border border-primary/20"
                                                                : "hover:bg-muted",
                                                            lesson.isCompleted ? "opacity-75" : ""
                                                        )}
                                                        onClick={() => handleLessonSelect(module.id, lesson.id)}
                                                    >
                                                        <div className="flex-shrink-0">
                                                            {lesson.isCompleted ? (
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                            ) : lesson.isUnlocked === false ? (
                                                                <LockIcon className="h-4 w-4" />
                                                            ) : (
                                                                getLessonIcon(lesson.type)
                                                            )}
                                                        </div>
                                                        <span className="flex-1 truncate">{lesson.title}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDuration(lesson.duration)}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </DyraneCard>

                    {currentCourse.certificate && (
                        <DyraneCard>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <Award className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Course Certificate</h3>
                                        <p className="text-xs text-muted-foreground">Complete the course to earn your certificate</p>
                                    </div>
                                </div>
                            </CardContent>
                        </DyraneCard>
                    )}

                    <ClassAssignmentLink courseId={currentCourse.id} />
                    <ClassQuizLink courseSlug={currentCourse.slug} />
                    <ClassGradeLink courseId={currentCourse.id} />
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    <div className="space-y-6">
                        {/* Course Header */}
                        <div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold">{currentCourse.title}</h1>
                                    {currentCourse.subtitle && (
                                        <p className="text-lg text-muted-foreground mt-1">{currentCourse.subtitle}</p>
                                    )}
                                </div>
                                {getRoleActions()}
                            </div>

                            <div className="flex flex-wrap gap-3 mt-4">
                                <Badge variant="outline" className="bg-primary/10 text-primary">
                                    {currentCourse.category}
                                </Badge>
                                {isAvailableForEnrolment() ? (
                                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                        Available for Enrolment
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                        Not Available for Enrolment
                                    </Badge>
                                )}
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>{currentCourse.totalVideoDuration}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <BookOpen className="h-4 w-4" />
                                    <span>{currentCourse.lessonCount} lessons</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    <span className="ml-1">5.0</span>
                                </div>
                            </div>
                        </div>

                        {/* Current Lesson Content */}
                        <DyraneCard>
                            <CardContent className="p-0">
                                {renderMainContent()}
                            </CardContent>
                        </DyraneCard>

                        {/* Lesson Navigation and Actions - Only show when lesson is selected */}
                        {currentLessonObj && (
                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-semibold">{currentLessonObj.title}</h2>
                                    <Badge variant="outline" className="capitalize">
                                        {currentLessonObj.type}
                                    </Badge>
                                </div>
                                <div className="flex gap-2">
                                    <DyraneButton
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleMarkLessonComplete(currentLessonObj.id, !currentLessonObj.isCompleted)}
                                    >
                                        {currentLessonObj.isCompleted ? (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                Completed
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Mark as Complete
                                            </>
                                        )}
                                    </DyraneButton>
                                    <DyraneButton variant="outline" size="sm">
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        Discussion
                                    </DyraneButton>
                                </div>
                            </div>
                        )}

                        {/* Lesson Details Tabs - Only show when lesson is selected */}
                        {currentLessonObj && (
                            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="mb-4">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="notes">Notes</TabsTrigger>
                                    <TabsTrigger value="resources">Resources</TabsTrigger>
                                    <TabsTrigger value="discussion">Discussion</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview">
                                    <DyraneCard>
                                        <CardContent className="p-6">
                                            <div className="prose max-w-none">
                                                <h3>About this lesson</h3>
                                                <p>{currentLessonObj.content?.videoDescription || currentLessonObj.description || "No description available for this lesson."}</p>

                                                <h3 className="mt-6">Course Description</h3>
                                                <div dangerouslySetInnerHTML={{ __html: currentCourse.description }} />

                                                {currentCourse.learningOutcomes && (
                                                    Array.isArray(currentCourse.learningOutcomes) ? currentCourse.learningOutcomes : (() => {
                                                        try {
                                                            const parsed = JSON.parse(currentCourse.learningOutcomes)
                                                            return Array.isArray(parsed) ? parsed : []
                                                        } catch {
                                                            return []
                                                        }
                                                    })()
                                                ).length > 0 && (
                                                    <>
                                                        <h3 className="mt-6">What you'll learn</h3>
                                                        <ul>
                                                            {(Array.isArray(currentCourse.learningOutcomes) ? currentCourse.learningOutcomes : (() => {
                                                                try {
                                                                    const parsed = JSON.parse(currentCourse.learningOutcomes)
                                                                    return Array.isArray(parsed) ? parsed : []
                                                                } catch {
                                                                    return []
                                                                }
                                                            })()).map((outcome, index) => (
                                                                <li key={index}>{outcome}</li>
                                                            ))}
                                                        </ul>
                                                    </>
                                                )}
                                            </div>
                                        </CardContent>
                                    </DyraneCard>
                                </TabsContent>

                                <TabsContent value="notes">
                                    <DyraneCard>
                                        <CardContent className="p-6">
                                            <div className="text-center py-8">
                                                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                                <p className="text-muted-foreground mb-4">Notes feature coming soon...</p>
                                            </div>
                                        </CardContent>
                                    </DyraneCard>
                                </TabsContent>

                                <TabsContent value="resources">
                                    <DyraneCard>
                                        <CardContent className="p-6">
                                            <div className="text-center py-8">
                                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                                <p className="text-muted-foreground mb-4">Resources will be displayed here...</p>
                                            </div>
                                        </CardContent>
                                    </DyraneCard>
                                </TabsContent>

                                <TabsContent value="discussion">
                                    <DyraneCard>
                                        <CardContent className="p-6">
                                            <div className="text-center py-8">
                                                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                                <p className="text-muted-foreground mb-4">Discussion feature coming soon...</p>
                                            </div>
                                        </CardContent>
                                    </DyraneCard>
                                </TabsContent>
                            </Tabs>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}