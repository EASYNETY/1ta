"use client"

import { useState } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { resetSkipOnboarding } from "@/features/auth/store/auth-slice"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    BookOpen,
    Users,
    Clock,
    Sparkles,
    AlertCircle,
    Calendar,
    BarChart,
    GraduationCap,
    School,
    FileText,
} from "lucide-react"
import Link from "next/link"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { motion } from "framer-motion"
import { isProfileComplete } from "@/features/auth/utils/profile-completeness"
import { OnboardingStatusCard } from "@/components/onboarding/onboarding-status"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DashboardPage() {
    const { user, isInitialized, skipOnboarding } = useAppSelector((state) => state.auth)
    const [activeTab, setActiveTab] = useState("overview")
    const dispatch = useAppDispatch()

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

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    }

    // Check if profile is complete
    const profileComplete = isProfileComplete(user)

    const handleCompleteProfile = () => {
        dispatch(resetSkipOnboarding())
    }

    // Role-specific content
    const getRoleSpecificContent = () => {
        switch (user.role) {
            case "admin":
                return (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        <DyraneCard>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">256</div>
                                <p className="text-xs text-muted-foreground">+24 this month</p>
                            </CardContent>
                        </DyraneCard>

                        <DyraneCard>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">18</div>
                                <p className="text-xs text-muted-foreground">+3 this month</p>
                            </CardContent>
                        </DyraneCard>

                        <DyraneCard>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                                <School className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">32</div>
                                <p className="text-xs text-muted-foreground">+5 this month</p>
                            </CardContent>
                        </DyraneCard>

                        <DyraneCard>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                                <div className="h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                    ₦
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₦1.2M</div>
                                <p className="text-xs text-muted-foreground">+₦250K this month</p>
                            </CardContent>
                        </DyraneCard>
                    </div>
                )
            case "teacher":
                return (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        <DyraneCard>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">My Classes</CardTitle>
                                <School className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">5</div>
                                <p className="text-xs text-muted-foreground">+1 this month</p>
                            </CardContent>
                        </DyraneCard>

                        <DyraneCard>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">My Students</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">128</div>
                                <p className="text-xs text-muted-foreground">+12 this month</p>
                            </CardContent>
                        </DyraneCard>

                        <DyraneCard>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Assignments</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">24</div>
                                <p className="text-xs text-muted-foreground">8 pending review</p>
                            </CardContent>
                        </DyraneCard>

                        <DyraneCard>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                                <div className="h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                    %
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">78%</div>
                                <div className="mt-2 h-2 w-full rounded-full bg-primary/20">
                                    <div className="h-full w-[78%] rounded-full bg-primary" />
                                </div>
                            </CardContent>
                        </DyraneCard>
                    </div>
                )
            case "student":
            default:
                return (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        <motion.div variants={item}>
                            <DyraneCard>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">5 Enrolled</div>
                                    <p className="text-xs text-muted-foreground">+2 courses this month</p>
                                </CardContent>
                            </DyraneCard>
                        </motion.div>

                        <motion.div variants={item}>
                            <DyraneCard>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">24 Hours</div>
                                    <p className="text-xs text-muted-foreground">+5 hours this week</p>
                                </CardContent>
                            </DyraneCard>
                        </motion.div>

                        <motion.div variants={item}>
                            <DyraneCard>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                                    <div className="h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                        %
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">78%</div>
                                    <div className="mt-2 h-2 w-full rounded-full bg-primary/20">
                                        <div className="h-full w-[78%] rounded-full bg-primary" />
                                    </div>
                                </CardContent>
                            </DyraneCard>
                        </motion.div>

                        <motion.div variants={item}>
                            <DyraneCard>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">3 Events</div>
                                    <p className="text-xs text-muted-foreground">Next: Math Quiz (Tomorrow)</p>
                                </CardContent>
                            </DyraneCard>
                        </motion.div>
                    </div>
                )
        }
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
                        <TabsTrigger value="users">Users</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
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
                            <Link href="/admin/users/new">Add User</Link>
                        </DyraneButton>
                        <DyraneButton asChild variant="outline">
                            <Link href="/admin/settings">Settings</Link>
                        </DyraneButton>
                    </div>
                )
            case "teacher":
                return (
                    <div className="flex gap-2">
                        <DyraneButton asChild>
                            <Link href="/teacher/assignments/new">Create Assignment</Link>
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

            {/* Welcome message for new users */}
            {!profileComplete && (
                <DyraneCard className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="bg-primary/20 rounded-full p-3">
                                <Sparkles className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold mb-2">Getting Started with 1Tech Academy</h2>
                                <p className="text-muted-foreground mb-4">
                                    Welcome to your learning journey! Complete these steps to get the most out of your experience:
                                </p>
                                <ul className="space-y-2 mb-4">
                                    <li className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                            1
                                        </div>
                                        <span>Complete your profile information</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                            2
                                        </div>
                                        <span>Choose a pricing plan that fits your needs</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                            3
                                        </div>
                                        <span>Explore available courses and start learning</span>
                                    </li>
                                </ul>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <DyraneButton asChild>
                                        <Link href="/profile" onClick={handleCompleteProfile}>
                                            Complete Profile
                                        </Link>
                                    </DyraneButton>
                                    <DyraneButton asChild variant="outline">
                                        <Link href="/pricing">View Pricing Plans</Link>
                                    </DyraneButton>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </DyraneCard>
            )}

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 overflow-x-auto">{getRoleTabs()}</TabsList>

                <TabsContent value="overview">
                    {getRoleSpecificContent()}

                    <h2 className="text-2xl font-bold mt-8">
                        {user.role === "student" ? "My Courses" : user.role === "teacher" ? "My Classes" : "Recent Activity"}
                    </h2>

                    <motion.div
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        {[1, 2, 3].map((i) => (
                            <motion.div key={i} variants={item}>
                                <DyraneCard className="overflow-hidden">
                                    <div className="aspect-video bg-muted" />
                                    <CardHeader>
                                        <CardTitle>
                                            {user.role === "student"
                                                ? `Introduction to ${i === 1 ? "Mathematics" : i === 2 ? "Science" : "History"}`
                                                : user.role === "teacher"
                                                    ? `${i === 1 ? "Web Development" : i === 2 ? "Advanced JavaScript" : "React & Next.js"}`
                                                    : `${i === 1 ? "New enrollment" : i === 2 ? "Course updated" : "Assignment submitted"}`}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            {user.role === "student"
                                                ? `Progress: ${i * 20}%`
                                                : user.role === "teacher"
                                                    ? `${i * 8} students enrolled`
                                                    : `${i * 10} minutes ago`}
                                        </p>
                                    </CardContent>
                                    <CardFooter>
                                        <DyraneButton variant="outline" size="sm" className="w-full">
                                            {user.role === "student"
                                                ? "Continue Learning"
                                                : user.role === "teacher"
                                                    ? "Manage Class"
                                                    : "View Details"}
                                        </DyraneButton>
                                    </CardFooter>
                                </DyraneCard>
                            </motion.div>
                        ))}
                    </motion.div>
                </TabsContent>

                <TabsContent value="courses">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <DyraneCard key={i} className="overflow-hidden">
                                <div className="aspect-video bg-muted" />
                                <CardHeader>
                                    <CardTitle>
                                        {i === 1
                                            ? "Introduction to Mathematics"
                                            : i === 2
                                                ? "Advanced Physics"
                                                : i === 3
                                                    ? "World History"
                                                    : i === 4
                                                        ? "Computer Science Basics"
                                                        : "English Literature"}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Clock className="mr-1 h-4 w-4" />
                                        <span>{`${i * 5 + 10} hours`}</span>
                                        <span className="mx-2">•</span>
                                        <span>{i % 2 === 0 ? "Intermediate" : "Beginner"}</span>
                                    </div>
                                    <div className="mt-2 h-2 w-full rounded-full bg-primary/20">
                                        <div className="h-full rounded-full bg-primary" style={{ width: `${i * 15}%` }} />
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">{`${i * 15}% complete`}</p>
                                </CardContent>
                                <CardFooter>
                                    <DyraneButton variant="outline" size="sm" className="w-full">
                                        {user.role === "student"
                                            ? "Continue Learning"
                                            : user.role === "teacher"
                                                ? "Manage Course"
                                                : "View Details"}
                                    </DyraneButton>
                                </CardFooter>
                            </DyraneCard>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="schedule">
                    <DyraneCard>
                        <CardHeader>
                            <CardTitle>Upcoming Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-start space-x-4 rounded-lg border p-4">
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Calendar className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium">
                                                {i === 1
                                                    ? "Mathematics Quiz"
                                                    : i === 2
                                                        ? "Physics Lab Session"
                                                        : i === 3
                                                            ? "History Assignment Due"
                                                            : "Group Project Meeting"}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {i === 1
                                                    ? "Today, 2:00 PM - 3:00 PM"
                                                    : i === 2
                                                        ? "Tomorrow, 10:00 AM - 12:00 PM"
                                                        : i === 3
                                                            ? "Friday, 11:59 PM"
                                                            : "Saturday, 3:00 PM - 5:00 PM"}
                                            </p>
                                        </div>
                                        <div className="ml-auto">
                                            <DyraneButton variant="outline" size="sm">
                                                {user.role === "student" ? (i === 3 ? "Submit" : "Join") : i === 3 ? "Review" : "Manage"}
                                            </DyraneButton>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </DyraneCard>
                </TabsContent>

                {(user.role === "admin" || user.role === "teacher") && (
                    <TabsContent value="analytics">
                        <div className="grid gap-6 md:grid-cols-2">
                            <DyraneCard>
                                <CardHeader>
                                    <CardTitle>Student Engagement</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[300px] flex items-center justify-center">
                                    <div className="text-center text-muted-foreground">
                                        <BarChart className="mx-auto h-16 w-16 opacity-50" />
                                        <p className="mt-2">Analytics visualization would appear here</p>
                                    </div>
                                </CardContent>
                            </DyraneCard>

                            <DyraneCard>
                                <CardHeader>
                                    <CardTitle>Course Completion</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {["Mathematics", "Physics", "History", "Computer Science"].map((course, i) => (
                                            <div key={course} className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">{course}</span>
                                                    <span className="text-sm text-muted-foreground">{`${65 + i * 5}%`}</span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-primary/20">
                                                    <div className="h-full rounded-full bg-primary" style={{ width: `${65 + i * 5}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </DyraneCard>
                        </div>
                    </TabsContent>
                )}

                {user.role === "admin" && (
                    <TabsContent value="users">
                        <DyraneCard>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>User Management</CardTitle>
                                    <DyraneButton size="sm">Add New User</DyraneButton>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { name: "John Doe", email: "john@example.com", role: "Student" },
                                        { name: "Jane Smith", email: "jane@example.com", role: "Teacher" },
                                        { name: "Robert Johnson", email: "robert@example.com", role: "Admin" },
                                        { name: "Emily Davis", email: "emily@example.com", role: "Student" },
                                    ].map((user, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span
                                                    className={`px-2 py-1 text-xs rounded-full ${user.role === "Admin"
                                                            ? "bg-red-100 text-red-800"
                                                            : user.role === "Teacher"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : "bg-green-100 text-green-800"
                                                        }`}
                                                >
                                                    {user.role}
                                                </span>
                                                <DyraneButton variant="outline" size="sm">
                                                    Edit
                                                </DyraneButton>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </DyraneCard>
                    </TabsContent>
                )}

                {user.role === "admin" && (
                    <TabsContent value="settings">
                        <DyraneCard>
                            <CardHeader>
                                <CardTitle>System Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-medium">General Settings</h3>
                                        <div className="grid gap-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Enable Notifications</p>
                                                    <p className="text-sm text-muted-foreground">Allow system-wide notifications</p>
                                                </div>
                                                <div className="h-6 w-11 rounded-full bg-primary/20"></div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Maintenance Mode</p>
                                                    <p className="text-sm text-muted-foreground">Put the system in maintenance mode</p>
                                                </div>
                                                <div className="h-6 w-11 rounded-full bg-primary/20"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-medium">Security Settings</h3>
                                        <div className="grid gap-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Two-Factor Authentication</p>
                                                    <p className="text-sm text-muted-foreground">Require 2FA for all admin accounts</p>
                                                </div>
                                                <div className="h-6 w-11 rounded-full bg-primary/20"></div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Password Policy</p>
                                                    <p className="text-sm text-muted-foreground">Enforce strong password requirements</p>
                                                </div>
                                                <div className="h-6 w-11 rounded-full bg-primary/20"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <DyraneButton>Save Settings</DyraneButton>
                            </CardFooter>
                        </DyraneCard>
                    </TabsContent>
                )}

                {(user.role === "student" || user.role === "teacher") && (
                    <TabsContent value="assignments">
                        <DyraneCard>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>{user.role === "student" ? "My Assignments" : "Class Assignments"}</CardTitle>
                                    {user.role === "teacher" && <DyraneButton size="sm">Create Assignment</DyraneButton>}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { title: "Mathematics Problem Set", due: "Tomorrow, 11:59 PM", status: "Pending" },
                                        { title: "Physics Lab Report", due: "Friday, 11:59 PM", status: "Submitted" },
                                        { title: "History Essay", due: "Next Monday, 11:59 PM", status: "Graded" },
                                        { title: "Programming Project", due: "In 2 weeks", status: "Not Started" },
                                    ].map((assignment, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{assignment.title}</p>
                                                <p className="text-sm text-muted-foreground">Due: {assignment.due}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span
                                                    className={`px-2 py-1 text-xs rounded-full ${assignment.status === "Graded"
                                                            ? "bg-green-100 text-green-800"
                                                            : assignment.status === "Submitted"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : assignment.status === "Pending"
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                        }`}
                                                >
                                                    {assignment.status}
                                                </span>
                                                <DyraneButton variant="outline" size="sm">
                                                    {user.role === "student"
                                                        ? assignment.status === "Not Started" || assignment.status === "Pending"
                                                            ? "Submit"
                                                            : "View"
                                                        : "Review"}
                                                </DyraneButton>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </DyraneCard>
                    </TabsContent>
                )}

                {user.role === "student" && (
                    <TabsContent value="grades">
                        <DyraneCard>
                            <CardHeader>
                                <CardTitle>My Grades</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { course: "Mathematics", grade: "A", percentage: 92 },
                                        { course: "Physics", grade: "B+", percentage: 88 },
                                        { course: "History", grade: "A-", percentage: 90 },
                                        { course: "Computer Science", grade: "A", percentage: 95 },
                                    ].map((grade, i) => (
                                        <div key={i} className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{grade.course}</span>
                                                <span className="text-sm font-medium">
                                                    {grade.grade} ({grade.percentage}%)
                                                </span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-primary/20">
                                                <div className="h-full rounded-full bg-primary" style={{ width: `${grade.percentage}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </DyraneCard>
                    </TabsContent>
                )}

                {user.role === "teacher" && (
                    <TabsContent value="students">
                        <DyraneCard>
                            <CardHeader>
                                <CardTitle>My Students</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { name: "John Doe", email: "john@example.com", progress: 85 },
                                        { name: "Jane Smith", email: "jane@example.com", progress: 92 },
                                        { name: "Robert Johnson", email: "robert@example.com", progress: 78 },
                                        { name: "Emily Davis", email: "emily@example.com", progress: 65 },
                                    ].map((student, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{student.name}</p>
                                                <p className="text-sm text-muted-foreground">{student.email}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-32">
                                                    <div className="text-sm text-right mb-1">{student.progress}%</div>
                                                    <div className="h-2 w-full rounded-full bg-primary/20">
                                                        <div className="h-full rounded-full bg-primary" style={{ width: `${student.progress}%` }} />
                                                    </div>
                                                </div>
                                                <DyraneButton variant="outline" size="sm">
                                                    View Details
                                                </DyraneButton>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </DyraneCard>
                    </TabsContent>
                )}
            </Tabs>
        </motion.div>
    )
}
