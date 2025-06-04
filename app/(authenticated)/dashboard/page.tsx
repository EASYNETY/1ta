"use client";

import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { resetSkipOnboarding } from "@/features/auth/store/auth-slice";
// import { fetchAuthCourses } from "@/features/auth-course/store/auth-course-slice"; // Assuming this is called elsewhere or on specific tab
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card";
import { CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, AlertCircle, GraduationCap, CheckCircle } from "lucide-react"; // Added CheckCircle
import Link from "next/link";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { motion } from "framer-motion";
import { isProfileComplete } from "@/features/auth/utils/profile-completeness";
import { OnboardingStatusCard } from "@/components/onboarding/onboarding-status";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast"; // Import useToast

// Import our new modular components
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { CourseCard } from "@/components/dashboard/course-card";
import { GradesTab } from "@/components/dashboard/grades-tab";
import { AssignmentsTab } from "@/components/dashboard/assignments-tab";
import { ScheduleTab } from "@/components/dashboard/schedule-tab";
import { ProgressOverview } from "@/components/dashboard/progress-overview";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useRouter, useSearchParams } from "next/navigation"; // Import useSearchParams
import { isAccounting, isCustomerCare, isStudent } from "@/types/user.types";
import { BarcodeDialog } from "@/components/tools/BarcodeDialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
    const { user, isInitialized, skipOnboarding } = useAppSelector((state) => state.auth);
    const { courses, status } = useAppSelector((state) => state.auth_courses);
    const [activeTab, setActiveTab] = useState("overview");
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams(); // Hook to read query parameters
    const { toast } = useToast(); // Hook for toasts

    // --- Handle Payment Success Query Parameter ---
    useEffect(() => {
        const paymentSuccess = searchParams.get('payment_success');
        const paymentRef = searchParams.get('ref');
        const enrolmentIssue = searchParams.get('status') === 'enrolment_data_missing';

        if (paymentSuccess === 'true') {
            toast({
                title: "Payment Successful!",
                description: `Your transaction (Ref: ${paymentRef || 'N/A'}) was completed and you should now be enroled.`,
                variant: "success",
            });
            // Clean the URL to remove query params after showing the toast
            // router.replace('/dashboard', { shallow: true }); // Keep history clean, or just router.replace('/dashboard')
            // Using window.history.replaceState to avoid full page reload and keep scroll position
            if (window.history.replaceState) {
                const cleanUrl = window.location.pathname; // Just the path, no query
                window.history.replaceState({ ...window.history.state, as: cleanUrl, url: cleanUrl }, '', cleanUrl);
            }
        } else if (enrolmentIssue) {
            toast({
                title: "Payment Successful, Action Required",
                description: `Your payment (Ref: ${paymentRef || 'N/A'}) was successful, but there was an issue with automatic enrolment. Please contact support.`,
            });
            if (window.history.replaceState) {
                const cleanUrl = window.location.pathname;
                window.history.replaceState({ ...window.history.state, as: cleanUrl, url: cleanUrl }, '', cleanUrl);
            }
        }
    }, [searchParams, toast, router]); // Add router to dependencies if using router.replace

    // --- Role-based Redirects ---
    useEffect(() => {
        // Enhanced Debugging Log:
        // This log will show the state of `isInitialized`, `user`, and relevant role checks
        // each time this effect runs (e.g., on component mount or when `user`/`isInitialized` changes).
        console.log(
            "DashboardPage Role Redirect Effect Check:",
            {
                isInitialized,
                userExists: !!user,
                userId: user?.id,
                userRole: user?.role,
                isUserStudent: user ? isStudent(user) : 'N/A (user null)',
                isUserCorporateManager: isStudent(user) ? user.isCorporateManager : false,
                isUserAccounting: user ? isAccounting(user) : 'N/A (user null)',
                isUserCustomerCare: user ? isCustomerCare(user) : 'N/A (user null)',
            }
        );

        if (isInitialized && user) {
            // Corporate Manager (who is also a student)
            // This check should be specific. If `isCorporateManager` implies a non-student role, adjust accordingly.
            if (isStudent(user) && user.isCorporateManager) {
                console.log("Dashboard: User is Student Corporate Manager. Redirecting to /corporate-management.");
                router.replace("/corporate-management");
                return; // Exit after redirect
            }

            // Accounting
            if (isAccounting(user)) {
                console.log("Dashboard: User is Accountant. Redirecting to /accounting/dashboard.");
                router.replace("/accounting/dashboard");
                return; // Exit after redirect
            }

            // Customer Care
            if (isCustomerCare(user)) {
                console.log("Dashboard: User is Customer Care. Redirecting to /customer-care/dashboard.");
                router.replace("/customer-care/dashboard");
                return; // Exit after redirect
            }

            // If no role-specific redirect matches, the user stays on the generic dashboard.
            // This is intended for roles like 'student' (default), 'teacher', 'admin', 'super_admin'.
        }
    }, [user, isInitialized, router]); // Dependencies: effect re-runs if these change

    // Loading state while checking auth
    if (!isInitialized) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
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
        );
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const profileComplete = isProfileComplete(user);

    const handleCompleteProfile = () => {
        dispatch(resetSkipOnboarding());
    };

    const getRoleTabs = () => {
        const commonTabs = (
            <>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </>
        );

        switch (user.role) {
            // ... (role tabs logic remains the same)
            case "super_admin":
                return (
                    <>
                        {commonTabs}
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </>
                )
            case "admin":
                return (
                    <>
                        {commonTabs}
                    </>
                )
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
    };

    const getRoleActions = () => {
        switch (user.role) {
            // ... (role actions logic remains the same)
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
    };

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
                                        <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                        <span>Complete your profile information.</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
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
                    {user.role === "student" && (
                        <div className="mt-8">
                            <ProgressOverview />
                        </div>
                    )}
                    <h2 className="text-2xl font-bold mt-8">
                        {user.role === "student" || user.role === "teacher" ? "My Courses" : "Recent Activity"}
                    </h2>
                    <motion.div
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        {status === "loading" ? (
                            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-[300px] rounded-xl bg-muted" />)
                        ) : courses.length > 0 ? (
                            courses.slice(0, 4).map((course, index) => (
                                <CourseCard key={`${course.id}-${index}`} course={course} index={index} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-8">
                                <p className="text-muted-foreground mb-4">You haven't enroled in any courses yet.</p>
                                <DyraneButton asChild>
                                    <Link href="/courses" className="flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4" />
                                        Browse Courses
                                    </Link>
                                </DyraneButton>
                            </div>
                        )}
                    </motion.div>
                </TabsContent>

                <TabsContent value="courses">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {status === "loading" ? (
                            Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-[300px] rounded-xl bg-muted" />)
                        ) : courses.length > 0 ? (
                            courses.map((course, index) => (
                                <CourseCard key={`${course.id}-${index}`} course={course} index={index} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-8">
                                {/* ... no courses message ... */}
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="schedule"><ScheduleTab /></TabsContent>
                <TabsContent value="assignments"><AssignmentsTab /></TabsContent>
                <TabsContent value="grades"><GradesTab /></TabsContent>
                {/* Other tabs content would go here */}
            </Tabs>
        </motion.div>
    );
}