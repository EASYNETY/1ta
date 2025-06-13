// app/(authenticated)/dashboard/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { resetSkipOnboarding } from "@/features/auth/store/auth-slice"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, AlertCircle, GraduationCap } from "lucide-react"
import Link from "next/link"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { motion } from "framer-motion"
import { isProfileComplete } from "@/features/auth/utils/profile-completeness"
import { OnboardingStatusCard } from "@/components/onboarding/onboarding-status"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

// Import our modular components
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { CourseCard } from "@/components/dashboard/course-card"
import { GradesTab } from "@/components/dashboard/grades-tab"
import { AssignmentsTab } from "@/components/dashboard/assignments-tab"
import { ScheduleTab } from "@/components/dashboard/schedule-tab"
import { ProgressOverview } from "@/components/dashboard/progress-overview"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useRouter, useSearchParams } from "next/navigation"
import { isAccounting, isCustomerCare, isStudent } from "@/types/user.types"
import { BarcodeDialog } from "@/components/tools/BarcodeDialog"
import { Skeleton } from "@/components/ui/skeleton"
import { RoleSpecificContent } from "@/components/dashboard/role-specific-content"
import { fetchEnrolledCourses, fetchAvailableCourses, filterOutEnrolledCourses } from "@/features/auth-course/utils/course-utils"
import { AuthCourse } from "@/features/auth-course/types/auth-course-interface"
import { PublicCourse } from "@/features/public-course/types/public-course-interface"

export default function DashboardPage() {
    const { user, isInitialized, skipOnboarding, token } = useAppSelector((state) => state.auth)
    const { courses, status } = useAppSelector((state) => state.auth_courses)
    const [activeTab, setActiveTab] = useState("overview")
    const dispatch = useAppDispatch()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()
    
    // State for enrolled and available courses
    const [enrolledCourses, setEnrolledCourses] = useState<AuthCourse[]>([])
    const [availableCourses, setAvailableCourses] = useState<PublicCourse[]>([])
    const [isLoadingEnrolled, setIsLoadingEnrolled] = useState(false)
    const [isLoadingAvailable, setIsLoadingAvailable] = useState(false)
    const [enrolledError, setEnrolledError] = useState<string | null>(null)
    const [availableError, setAvailableError] = useState<string | null>(null)

    // --- Handle Payment Success Query Parameter ---
    useEffect(() => {
        const paymentSuccess = searchParams.get("payment_success")
        const paymentRef = searchParams.get("ref")
        const enrolmentIssue = searchParams.get("status") === "enrolment_data_missing"

        if (paymentSuccess === "true") {
            toast({
                title: "Payment Successful!",
                description: `Your transaction (Ref: ${paymentRef || "N/A"}) was completed and you should now be enroled.`,
                variant: "success",
            })
            // Clean the URL to remove query params after showing the toast
            if (window.history.replaceState) {
                const cleanUrl = window.location.pathname // Just the path, no query
                window.history.replaceState({ ...window.history.state, as: cleanUrl, url: cleanUrl }, "", cleanUrl)
            }
        } else if (enrolmentIssue) {
            toast({
                title: "Payment Successful, Action Required",
                description: `Your payment (Ref: ${paymentRef || "N/A"
                    }) was successful, but there was an issue with automatic enrolment. Please contact support.`,
            })
            if (window.history.replaceState) {
                const cleanUrl = window.location.pathname
                window.history.replaceState({ ...window.history.state, as: cleanUrl, url: cleanUrl }, "", cleanUrl)
            }
        }
    }, [searchParams, toast])

    // --- Role-based Redirects ---
    useEffect(() => {
        if (isInitialized && user) {
            // Corporate Manager (who is also a student)
            if (isStudent(user) && user.isCorporateManager) {
                router.replace("/corporate-management")
                return
            }

            // Accounting
            if (isAccounting(user)) {
                router.replace("/accounting/dashboard")
                return
            }

            // Customer Care
            if (isCustomerCare(user)) {
                router.replace("/customer-care/dashboard")
                return
            }
        }
    }, [user, isInitialized, router])
    
    // --- Fetch Enrolled and Available Courses ---
    useEffect(() => {
        if (isInitialized && user && token) {
            console.log("Fetching courses for user:", user.id)
            
            // Fetch enrolled courses
            const getEnrolledCourses = async () => {
                setIsLoadingEnrolled(true)
                setEnrolledError(null)
                try {
                    console.log("Fetching enrolled courses with token:", token.substring(0, 10) + "...")
                    const fetchedCourses = await fetchEnrolledCourses(token)
                    console.log(`Received ${fetchedCourses.length} enrolled courses:`, fetchedCourses)
                    
                    // Check if the API returned courses with enrollment status
                    const apiEnrolledCourses = fetchedCourses.filter(course => 
                        course.enrolmentStatus === 'enroled' || 
                        course.enrollmentStatus === true
                    );
                    
                    console.log("Filtered enrolled courses from API:", apiEnrolledCourses);
                    
                    if (apiEnrolledCourses.length > 0) {
                        console.log("Setting enrolled courses from API filtered results");
                        setEnrolledCourses(apiEnrolledCourses);
                    } else {
                        // If no enrolled courses returned, check if we have courses in Redux store
                        // that might be enrolled courses
                        console.log("No enrolled courses returned from API, checking Redux store");
                        if (courses && courses.length > 0) {
                            const reduxCourses = courses.filter(course => 
                                course.enrolmentStatus === 'enroled' || 
                                course.enrollmentStatus === true
                            );
                            
                            if (reduxCourses.length > 0) {
                                console.log("Found enrolled courses in Redux store:", reduxCourses);
                                setEnrolledCourses(reduxCourses);
                            } else {
                                setEnrolledCourses([]);
                            }
                        } else {
                            setEnrolledCourses([]);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching enrolled courses:", error)
                    setEnrolledError("Failed to load your enrolled courses")
                    
                    // Fallback to using the courses from the Redux store
                    if (courses && courses.length > 0) {
                        const reduxCourses = courses.filter(course => 
                            course.enrolmentStatus === 'enroled' || 
                            course.enrollmentStatus === true
                        )
                        
                        if (reduxCourses.length > 0) {
                            console.log("Using fallback enrolled courses from Redux store:", reduxCourses)
                            setEnrolledCourses(reduxCourses)
                        } else {
                            setEnrolledCourses([])
                        }
                    } else {
                        setEnrolledCourses([])
                    }
                } finally {
                    setIsLoadingEnrolled(false)
                }
            }
            
            // Fetch all available courses
            const getAvailableCourses = async () => {
                setIsLoadingAvailable(true)
                setAvailableError(null)
                try {
                    console.log("Fetching available courses with token:", token.substring(0, 10) + "...")
                    // First try to fetch available courses from the API
                    const allCourses = await fetchAvailableCourses(token)
                    console.log(`Received ${allCourses.length} available courses:`, allCourses)
                    
                    if (allCourses.length > 0) {
                        // If the API doesn't return filtered courses, filter them manually
                        if (enrolledCourses.length > 0) {
                            console.log("Filtering out enrolled courses manually")
                            const filteredCourses = filterOutEnrolledCourses(allCourses, enrolledCourses)
                            setAvailableCourses(filteredCourses)
                        } else {
                            setAvailableCourses(allCourses)
                        }
                    } else {
                        // If no available courses returned, use courses from Redux store
                        // that are not enrolled
                        console.log("No available courses returned from API, using Redux store")
                        if (courses && courses.length > 0 && enrolledCourses.length > 0) {
                            const filteredCourses = filterOutEnrolledCourses(courses, enrolledCourses)
                            console.log("Using filtered courses from Redux store:", filteredCourses)
                            setAvailableCourses(filteredCourses)
                        } else if (courses && courses.length > 0) {
                            setAvailableCourses(courses)
                        }
                    }
                } catch (error) {
                    console.error("Error fetching available courses:", error)
                    setAvailableError("Failed to load available courses")
                    
                    // Fallback to using filtered courses from Redux store
                    if (courses && courses.length > 0 && enrolledCourses.length > 0) {
                        const filteredCourses = filterOutEnrolledCourses(courses, enrolledCourses)
                        console.log("Using fallback filtered courses from Redux store:", filteredCourses)
                        setAvailableCourses(filteredCourses)
                    }
                } finally {
                    setIsLoadingAvailable(false)
                }
            }
            
            getEnrolledCourses()
            // Wait a bit before fetching available courses to ensure enrolled courses are loaded first
            setTimeout(() => {
                getAvailableCourses()
            }, 500)
        }
    }, [isInitialized, user, token, courses])

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

    const profileComplete = isProfileComplete(user)

    const handleCompleteProfile = () => {
        dispatch(resetSkipOnboarding())
    }

    const getRoleTabs = () => {
        const commonTabs = (
            <>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="my-courses">My Courses</TabsTrigger>
                <TabsTrigger value="courses">All Courses</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </>
        )

        switch (user.role) {
            case "super_admin":
                return (
                    <>
                        {commonTabs}
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </>
                )
            case "admin":
                return <>{commonTabs}</>
            case "accounting":
                return (
                    <>
                        {commonTabs}
                        <TabsTrigger value="payments">Payments</TabsTrigger>
                    </>
                )
            case "customer_care":
                return (
                    <>
                        {commonTabs}
                        <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
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

    const getRoleActions = () => {
        switch (user.role) {
            case "super_admin":
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
            case "accounting":
                return (
                    <div className="flex gap-2">
                        <DyraneButton asChild>
                            <Link href="/payments">View Payments</Link>
                        </DyraneButton>
                        <DyraneButton asChild variant="outline">
                            <Link href="/settings">Settings</Link>
                        </DyraneButton>
                    </div>
                )
            case "customer_care":
                return (
                    <div className="flex gap-2">
                        <DyraneButton asChild>
                            <Link href="/support/tickets">Support Tickets</Link>
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
                            <Link href="/courses" className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" />
                                Browse Courses
                            </Link>
                        </DyraneButton>
                    </div>
                )
            case "student":
            default:
                return (
                    <div className="flex gap-2">
                        {isStudent(user) && user.barcodeId && (
                            <BarcodeDialog barcodeId={user.barcodeId} userId={user.id} triggerLabel="Barcode" />
                        )}
                        <DyraneButton asChild variant="outline">
                            <Link href="/courses" className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" />
                                Browse Courses
                            </Link>
                        </DyraneButton>
                    </div>
                )
        }
    }

    return (
        <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
                {getRoleActions()}
            </div>

            {/* Onboarding Card */}
            {!profileComplete && !skipOnboarding && <OnboardingStatusCard />}

            {/* Skipped Onboarding Reminder */}
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

            {/* Getting Started Card (shown if profile is incomplete) */}
            {!profileComplete && (
                <DyraneCard className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                            <div className="bg-primary/10 rounded-full p-3 flex-shrink-0">
                                <Sparkles className="h-8 w-8 text-primary" />
                            </div>
                            <div className="flex-grow">
                                <h2 className="text-xl font-semibold mb-1">Getting Started with 1Tech Academy</h2>
                                <p className="text-muted-foreground mb-4 text-sm">
                                    Welcome! To unlock all features and begin your journey, please complete these steps:
                                </p>
                                <ul className="space-y-2 mb-4 text-sm">
                                    <li className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            1
                                        </div>
                                        <span>Complete your profile information.</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            2
                                        </div>
                                        <span>Explore available courses and enrol to start learning.</span>
                                    </li>
                                </ul>
                                <div className="flex flex-row gap-3 mt-4 flex-wrap">
                                    <DyraneButton asChild>
                                        <Link href="/profile" onClick={handleCompleteProfile}>
                                            Complete Profile
                                        </Link>
                                    </DyraneButton>
                                    <DyraneButton asChild variant="outline">
                                        <Link href="/courses" className="flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4" />
                                            Browse Courses
                                        </Link>
                                    </DyraneButton>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </DyraneCard>
            )}

            {/* Tabs */}
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                <ScrollArea className="w-full whitespace-nowrap pb-0">
                    <TabsList className="mb-4 overflow-x-auto">{getRoleTabs()}</TabsList>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>

                <TabsContent value="overview">
                    <DashboardStats />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                        {/* Recent Activities - Takes 2/3 of the space */}
                        <div className="lg:col-span-1">
                            <RecentActivities />
                        </div>

                        {/* Role-specific content - Takes 1/3 of the space */}
                        <div className="lg:col-span-1">
                            {user.role === "student" ? <ProgressOverview /> : <RoleSpecificContent />}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="my-courses">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {isLoadingEnrolled ? (
                            Array(8)
                                .fill(0)
                                .map((_, i) => <Skeleton key={i} className="h-[300px] rounded-xl bg-muted" />)
                        ) : enrolledError && enrolledCourses.length === 0 ? (
                            <div className="col-span-full">
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{enrolledError}</AlertDescription>
                                </Alert>
                            </div>
                        ) : enrolledCourses.length > 0 ? (
                            // Only show enrolled courses - make sure to filter them
                            enrolledCourses
                                .filter(course => course.enrolmentStatus === 'enroled' || course.enrollmentStatus === true)
                                .map((course, index) => (
                                    <CourseCard key={`${course.id}-${index}`} course={course} index={index} />
                                ))
                        ) : courses && courses.length > 0 ? (
                            // Fallback to using only enrolled courses from Redux store
                            courses
                                .filter(course => course.enrolmentStatus === 'enroled' || course.enrollmentStatus === true)
                                .map((course, index) => (
                                    <CourseCard key={`${course.id}-${index}`} course={course} index={index} />
                                ))
                        ) : (
                            <div className="col-span-full text-center py-8">
                                <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
                                <DyraneButton asChild>
                                    <Link href="/courses">Browse Courses</Link>
                                </DyraneButton>
                            </div>
                        )}
                    </div>
                </TabsContent>
                
                <TabsContent value="courses">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {isLoadingAvailable ? (
                            Array(8)
                                .fill(0)
                                .map((_, i) => <Skeleton key={i} className="h-[300px] rounded-xl bg-muted" />)
                        ) : availableError && availableCourses.length === 0 ? (
                            <div className="col-span-full">
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{availableError}</AlertDescription>
                                </Alert>
                                <div className="mt-4 text-center">
                                    <DyraneButton asChild>
                                        <Link href="/courses">Browse All Courses</Link>
                                    </DyraneButton>
                                </div>
                            </div>
                        ) : availableCourses.length > 0 ? (
                            // Only show available courses (not enrolled)
                            availableCourses
                                .filter(course => 
                                    course.enrolmentStatus === 'not_enroled' || 
                                    course.enrollmentStatus === false
                                )
                                .map((course, index) => (
                                    <CourseCard key={`${course.id}-${index}`} course={course} index={index} />
                                ))
                        ) : courses && courses.length > 0 ? (
                            // Fallback to using only non-enrolled courses from Redux store
                            courses
                                .filter(course => 
                                    course.enrolmentStatus !== 'enroled' && 
                                    course.enrollmentStatus !== true
                                )
                                .map((course, index) => (
                                    <CourseCard key={`${course.id}-${index}`} course={course} index={index} />
                                ))
                        ) : (
                            <div className="col-span-full text-center py-8">
                                <p className="text-muted-foreground mb-4">No additional courses available at the moment.</p>
                                <DyraneButton asChild>
                                    <Link href="/my-courses">View My Courses</Link>
                                </DyraneButton>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="schedule">
                    <ScheduleTab />
                </TabsContent>
                <TabsContent value="assignments">
                    <AssignmentsTab />
                </TabsContent>
                <TabsContent value="grades">
                    <GradesTab />
                </TabsContent>
            </Tabs>
        </motion.div>
    )
}
