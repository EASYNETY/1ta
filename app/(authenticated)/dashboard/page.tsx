"use client"

import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { resetSkipOnboarding } from "@/features/auth/store/auth-slice"
import { fetchAuthCourses } from "@/features/auth-course/store/auth-course-slice"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, AlertCircle } from "lucide-react"
import Link from "next/link"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { motion } from "framer-motion"
import { isProfileComplete } from "@/features/auth/utils/profile-completeness"
import { OnboardingStatusCard } from "@/components/onboarding/onboarding-status"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Import our new modular components
import { StatsCards } from "@/components/dashboard/stats-cards"
import { CourseCard } from "@/components/dashboard/course-card"
import { GradesTab } from "@/components/dashboard/grades-tab"
import { AssignmentsTab } from "@/components/dashboard/assignments-tab"
import { ScheduleTab } from "@/components/dashboard/schedule-tab"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import { isStudent } from "@/types/user.types"

export default function DashboardPage() {
    const { user, isInitialized, skipOnboarding } = useAppSelector((state) => state.auth)
    const { courses, status } = useAppSelector((state) => state.auth_courses)
    const [activeTab, setActiveTab] = useState("overview")
    const dispatch = useAppDispatch()
    const router = useRouter();

    // --- Redirect Corporate Manager ---
    useEffect(() => {
        if (isInitialized && user && isStudent(user) && user.isCorporateManager) {
            console.log("Dashboard: Redirecting Corporate Manager to /corporate-management");
            router.replace("/corporate-management"); // Use replace to avoid adding to history
        }
    }, [user, isInitialized, router]);
    // --- End Redirect ---

    // Loading state while checking auth
    if (!isInitialized) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Authentication Required</h2>
                    <p className="text-muted-foreground mt-2">Please log in to access the dashboard.</p>
                    <DyraneButton asChild className="mt-4">
                        <Link href="/login">Go to Login</Link>
                    </DyraneButton>
                </div>
            </div>
        )
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    // Check if profile is complete
    const profileComplete = isProfileComplete(user)

    const handleCompleteProfile = () => {
        dispatch(resetSkipOnboarding())
    }

    // Role-specific tabs
    const getRoleTabs = () => {
        const commonTabs = (
            <>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </>
        )

        switch (user.role) {
            case "admin":
                return (
                    <>
                        {commonTabs}
                        {/* <TabsTrigger value="users">Users</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger> */}
                    </>
                )
            case "teacher":
                return (
                    <>
                        {commonTabs}
                        <TabsTrigger value="students">Students</TabsTrigger>
                        <TabsTrigger value="assignments">Assignments</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </>
                )
            case "student":
            default:
                return (
                    <>
                        {commonTabs}
                        <TabsTrigger value="assignments">Assignments</TabsTrigger>
                        <TabsTrigger value="grades">Grades</TabsTrigger>
                    </>
                )
        }
    }

    // Role-specific actions
    const getRoleActions = () => {
        switch (user.role) {
            case "admin":
                return (
                    <div className="flex gap-2">
                        <DyraneButton asChild>
                            <Link href="/users/create">Add User</Link>
                        </DyraneButton>
                        <DyraneButton asChild variant="outline">
                            <Link href="/settings">Settings</Link>
                        </DyraneButton>
                    </div>
                )
            case "teacher":
                return (
                    <div className="flex gap-2">
                        <DyraneButton asChild>
                            <Link href="/assignments/create">Create Assignment</Link>
                        </DyraneButton>
                        <DyraneButton asChild variant="outline">
                            <Link href="/courses">Browse Courses</Link>
                        </DyraneButton>
                    </div>
                )
            case "student":
            default:
                return (
                    <DyraneButton asChild>
                        <Link href="/courses">Browse Courses</Link>
                    </DyraneButton>
                )
        }
    }

    return (
        <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
                {getRoleActions()}
            </div>

            {/* Show onboarding card if profile is incomplete and not skipped */}
            {!profileComplete && !skipOnboarding && <OnboardingStatusCard />}

            {/* Show reminder if onboarding was skipped */}
            {!profileComplete && skipOnboarding && (
                <Alert className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="text-blue-800 dark:text-blue-300 font-medium">Profile Incomplete</AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-400">
                        <p className="mb-2">
                            You've skipped the onboarding process. Complete your profile to unlock all platform features.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 mt-2">
                            <DyraneButton asChild>
                                <Link href="/profile" onClick={handleCompleteProfile}>
                                    Complete Your Profile
                                </Link>
                            </DyraneButton>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* --- UPDATED Welcome message for new users --- */}
            {/* Show only if profile is incomplete (onboarding needed OR skipped) */}
            {!profileComplete && (
                <DyraneCard className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6"> {/* Added gap */}
                            <div className="bg-primary/10 rounded-full p-3 flex-shrink-0"> {/* Adjusted background */}
                                <Sparkles className="h-8 w-8 text-primary" />
                            </div>
                            <div className="flex-grow"> {/* Allow text content to take space */}
                                <h2 className="text-xl font-semibold mb-1">Getting Started with 1Tech Academy</h2> {/* Reduced mb */}
                                <p className="text-muted-foreground mb-4 text-sm"> {/* Smaller text */}
                                    Welcome! To unlock all features and begin your journey, please complete these steps:
                                </p>
                                <ul className="space-y-2 mb-4 text-sm"> {/* Added text-sm */}
                                    <li className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                        <span>Complete your profile information.</span>
                                    </li>
                                    {/* Step 2 Removed (Pricing Plan) */}
                                    <li className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                        <span>Explore available courses and enroll to start learning.</span>
                                    </li>

                                </ul>
                                <div className="flex flex-row gap-3 mt-4 flex-wrap"> {/* Added mt-4 */}
                                    <DyraneButton asChild>
                                        {/* Ensure handleCompleteProfile resets skip flag */}
                                        <Link href="/profile" onClick={handleCompleteProfile}>
                                            Complete Profile
                                        </Link>
                                    </DyraneButton>
                                    {/* Removed "View Pricing Plans" button */}
                                    <DyraneButton asChild variant="outline">
                                        <Link href="/courses">Browse Courses</Link>
                                    </DyraneButton>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </DyraneCard>
            )}
            {/* --- End Welcome Message --- */}
            {/* Tabs for different sections */}
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                <ScrollArea className="w-full whitespace-nowrap pb-0">
                    <TabsList className="mb-4 overflow-x-auto">{getRoleTabs()}</TabsList>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>

                <TabsContent value="overview">
                    {/* Stats Cards */}
                    <StatsCards />

                    {/* My Courses Section */}
                    <h2 className="text-2xl font-bold mt-8">
                        {user.role === "student" ? "My Courses" : user.role === "teacher" ? "My Courses" : "Recent Activity"}
                    </h2>

                    <motion.div
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        {status === "loading" ? (
                            // Loading skeleton
                            Array(3)
                                .fill(0)
                                .map((_, i) => <div key={i} className="h-[300px] rounded-xl bg-muted animate-pulse" />)
                        ) : courses.length > 0 ? (
                            // Show actual courses
                            courses
                                .slice(0, 4)
                                .map((course, index) => <CourseCard key={course.id} course={course} index={index} />)
                        ) : (
                            // No courses message
                            <div className="col-span-full text-center py-8">
                                <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
                                <DyraneButton asChild>
                                    <Link href="/courses">Browse Courses</Link>
                                </DyraneButton>
                            </div>
                        )}
                    </motion.div>
                </TabsContent>

                <TabsContent value="courses">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {status === "loading" ? (
                            // Loading skeleton
                            Array(8)
                                .fill(0)
                                .map((_, i) => <div key={i} className="h-[300px] rounded-xl bg-muted animate-pulse" />)
                        ) : courses.length > 0 ? (
                            // Show all courses
                            courses.map((course, index) => <CourseCard key={course.id} course={course} index={index} />)
                        ) : (
                            // No courses message
                            <div className="col-span-full text-center py-8">
                                <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
                                <DyraneButton asChild>
                                    <Link href="/courses">Browse Courses</Link>
                                </DyraneButton>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="schedule">
                    <ScheduleTab />
                </TabsContent>

                <TabsContent value="assignments">
                    {/* Assignments content would go here */}
                    <AssignmentsTab />
                </TabsContent>

                <TabsContent value="grades">
                    <GradesTab />
                </TabsContent>

                {/* Other tabs content would go here */}
            </Tabs>
        </motion.div>
    )
}
