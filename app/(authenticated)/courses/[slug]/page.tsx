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

    // Handle module selection
    const handleModuleSelect = (moduleId: string) => {
        dispatch(setCurrentModule(moduleId))

        // Find the first lesson in the module
        const module = currentCourse.modules.find((m) => m.id === moduleId)
        if (module && module.lessons.length > 0) {
            dispatch(setCurrentLesson(module.lessons[0].id))
        }
    }

    // Handle lesson selection
    const handleLessonSelect = (moduleId: string, lessonId: string) => {
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
    const currentModuleObj = currentCourse.modules.find((m) => m.id === currentModuleId) || currentCourse.modules[0]
    const currentLessonObj =
        currentModuleObj?.lessons.find((l) => l.id === currentLessonId) || currentModuleObj?.lessons[0]

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
        if (duration.includes(":")) return duration; // Already formatted

        const numeric = Number.parseInt(duration);
        if (isNaN(numeric)) return "--"; // Invalid input

        const hours = Math.floor(numeric / 60);
        const minutes = numeric % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    // Helper function to check if course is available for enrollment
    const isAvailableForEnrollment = () => {
        return !(currentCourse.isAvailableForEnrollment === false || currentCourse.available_for_enrollment === false);
    };


    // Role-specific actions
    const getRoleActions = () => {
        // Check if course is available for enrollment
        const isAvailable = isAvailableForEnrollment();

        switch (user.role) {
            case "admin":
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
                                Enable Enrollment
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
                        {!isAvailable && (
                            <DyraneButton variant="outline" size="sm" disabled className="cursor-not-allowed opacity-60">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Request Enrollment Activation
                            </DyraneButton>
                        )}
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
                        {!isAvailable && (
                            <DyraneButton variant="outline" size="sm" className="text-blue-600 border-blue-300 hover:bg-blue-50">
                                <Bell className="mr-2 h-4 w-4" />
                                Notify When Available
                            </DyraneButton>
                        )}
                    </div>
                )
        }
    }

    return (
        <div className="space-y-6">
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
                                            className={cn("text-sm hover:no-underline", currentModuleId === module.id ? "font-medium" : "")}
                                            onClick={() => handleModuleSelect(module.id)}
                                        >
                                            <div className="flex items-start text-left">
                                                <span>{module.title}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-1 pl-2">
                                                {module.lessons.map((lesson) => (
                                                    <button
                                                        key={lesson.id}
                                                        className={cn(
                                                            "flex items-center gap-2 w-full text-left text-sm py-1 px-2 rounded-md",
                                                            currentLessonId === lesson.id
                                                                ? "bg-primary/10 text-primary font-medium"
                                                                : "hover:bg-muted",
                                                            lesson.isCompleted ? "text-muted-foreground" : "",
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
                                {/* Enrollment Status Badge */}
                                {!isAvailableForEnrollment() ? (
                                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                        Not Available for Enrollment
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                        Available for Enrollment
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
                                {/* Student count removed as requested */}
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Star className="h-4 w-4 text-yellow-500" />
                                    <Star className="h-4 w-4 text-yellow-500" />
                                    <Star className="h-4 w-4 text-yellow-500" />
                                    <Star className="h-4 w-4 text-yellow-500" />
                                    <Star className="h-4 w-4 text-yellow-500" />
                                    <span className="ml-1">5.0</span>
                                </div>
                            </div>
                        </div>

                        {/* Current Lesson Content */}
                        <DyraneCard>
                            <CardContent className="p-0">
                                {currentLessonObj?.type === "video" && currentLessonObj?.videoUrl ? (
                                    <div className="aspect-video w-full">
                                        <video
                                            src={currentLessonObj.videoUrl}
                                            controls
                                            className="w-full h-full"
                                            poster={currentCourse.image}
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-video w-full bg-muted flex items-center justify-center">
                                        <div className="text-center">
                                            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                            <p className="text-muted-foreground">
                                                {currentLessonObj?.type === "quiz"
                                                    ? "Quiz content will be displayed here"
                                                    : currentLessonObj?.type === "assignment"
                                                        ? "Assignment content will be displayed here"
                                                        : "Lesson content will be displayed here"}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </DyraneCard>

                        {/* Lesson Navigation and Actions */}
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-semibold">{currentLessonObj?.title}</h2>
                                <Badge variant="outline" className="capitalize">
                                    {currentLessonObj?.type}
                                </Badge>
                            </div>
                            <div className="flex gap-2">
                                <DyraneButton
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (currentLessonObj) {
                                            handleMarkLessonComplete(currentLessonObj.id, !currentLessonObj.isCompleted)
                                        }
                                    }}
                                >
                                    {currentLessonObj?.isCompleted ? (
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

                        {/* Lesson Details Tabs */}
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
                                            <p>{currentLessonObj?.description || "No description available for this lesson."}</p>

                                            {/* Enrollment Status Alert */}
                                            {!isAvailableForEnrollment() && (
                                                <div className="mt-6 p-4 border border-red-200 bg-red-50 text-red-800 rounded-md">
                                                    <h4 className="font-semibold flex items-center">
                                                        <Bell className="mr-2 h-5 w-5" />
                                                        Enrollment Notice
                                                    </h4>
                                                    <p className="mt-1">
                                                        This course is currently not available for new enrollments.
                                                        {user.role === "student" && " You can request to be notified when enrollment opens."}
                                                        {user.role === "teacher" && " Please contact an administrator to enable enrollment."}
                                                        {user.role === "admin" && " You can enable enrollment from the course settings."}
                                                    </p>
                                                </div>
                                            )}

                                            <h3 className="mt-6">Course Description</h3>
                                            <div dangerouslySetInnerHTML={{ __html: currentCourse.description }} />

                                            {currentCourse.learningOutcomes && currentCourse.learningOutcomes.length > 0 && (
                                                <>
                                                    <h3 className="mt-6">What you'll learn</h3>
                                                    <ul>
                                                        {currentCourse.learningOutcomes.map((outcome, index) => (
                                                            <li key={index}>{outcome}</li>
                                                        ))}
                                                    </ul>
                                                </>
                                            )}

                                            {currentCourse.prerequisites && currentCourse.prerequisites.length > 0 && (
                                                <>
                                                    <h3 className="mt-6">Prerequisites</h3>
                                                    <ul>
                                                        {currentCourse.prerequisites.map((prerequisite, index) => (
                                                            <li key={index}>{prerequisite}</li>
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
                                        <div className="flex flex-col gap-4">
                                            <h3 className="text-lg font-medium">Your Notes</h3>

                                            {currentCourse.notes && currentCourse.notes.length > 0 ? (
                                                <div className="space-y-4">
                                                    {currentCourse.notes
                                                        .filter((note) => note.lessonId === currentLessonId)
                                                        .map((note) => (
                                                            <div key={note.id} className="p-4 border rounded-lg">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div className="font-medium">
                                                                        {note.timestamp
                                                                            ? `${Math.floor(note.timestamp / 60)}:${(note.timestamp % 60).toString().padStart(2, "0")}`
                                                                            : ""}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {new Date(note.createdAt).toLocaleDateString()}
                                                                    </div>
                                                                </div>
                                                                <p>{note.content}</p>
                                                            </div>
                                                        ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                                    <p className="text-muted-foreground mb-4">You haven't added any notes for this lesson yet.</p>
                                                    <DyraneButton>Add Note</DyraneButton>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </DyraneCard>
                            </TabsContent>

                            <TabsContent value="resources">
                                <DyraneCard>
                                    <CardContent className="p-6">
                                        <h3 className="text-lg font-medium mb-4">Lesson Resources</h3>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-5 w-5 text-primary" />
                                                    <span>Lesson Slides</span>
                                                </div>
                                                <DyraneButton variant="outline" size="sm">
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download
                                                </DyraneButton>
                                            </div>

                                            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-5 w-5 text-primary" />
                                                    <span>Exercise Files</span>
                                                </div>
                                                <DyraneButton variant="outline" size="sm">
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download
                                                </DyraneButton>
                                            </div>

                                            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-5 w-5 text-primary" />
                                                    <span>Additional Reading</span>
                                                </div>
                                                <DyraneButton variant="outline" size="sm">
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download
                                                </DyraneButton>
                                            </div>
                                        </div>
                                    </CardContent>
                                </DyraneCard>
                            </TabsContent>

                            <TabsContent value="discussion">
                                <DyraneCard>
                                    <CardContent className="p-6">
                                        <h3 className="text-lg font-medium mb-4">Lesson Discussion</h3>

                                        <div className="space-y-4">
                                            <div className="p-4 border rounded-lg">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Users className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">John Smith</span>
                                                            <span className="text-xs text-muted-foreground">2 days ago</span>
                                                        </div>
                                                        <p className="mt-1">
                                                            Great explanation! I was confused about the concept until watching this video.
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <button className="text-xs text-muted-foreground hover:text-foreground">Reply</button>
                                                            <button className="text-xs text-muted-foreground hover:text-foreground">Like</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 border rounded-lg">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Users className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">Sarah Johnson</span>
                                                            <span className="text-xs text-muted-foreground">1 week ago</span>
                                                        </div>
                                                        <p className="mt-1">
                                                            I'm having trouble with the exercise at 12:45. Can someone help me understand what I'm
                                                            doing wrong?
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <button className="text-xs text-muted-foreground hover:text-foreground">Reply</button>
                                                            <button className="text-xs text-muted-foreground hover:text-foreground">Like</button>
                                                        </div>

                                                        {/* Reply */}
                                                        <div className="mt-4 ml-6 p-3 border rounded-lg bg-muted/30">
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                                    <Users className="h-4 w-4 text-primary" />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium">Michael Chen</span>
                                                                        <Badge variant="outline" className="text-xs">
                                                                            Instructor
                                                                        </Badge>
                                                                        <span className="text-xs text-muted-foreground">5 days ago</span>
                                                                    </div>
                                                                    <p className="mt-1">
                                                                        Hi Sarah, make sure you're initializing the variable correctly. Check the example at
                                                                        10:30 for reference.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <DyraneButton className="w-full">Add Comment</DyraneButton>
                                        </div>
                                    </CardContent>
                                </DyraneCard>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    )
}
