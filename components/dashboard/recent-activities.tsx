// components/dashboard/recent-activities.tsx

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import Link from "next/link"
import { motion } from "framer-motion"
import { addMonths, format, formatDistanceToNow, parseISO, subMonths } from "date-fns"
import {
    FileText,
    GraduationCap,
    BarChart3,
    MessageSquare,
    CreditCard,
    Bell,
    Calendar,
    RefreshCw,
    Megaphone,
    UserPlus,
    Loader2,
} from "lucide-react"

// Import notification types and Redux actions/selectors
import type { NotificationType } from "@/features/notifications/types/notification-types"
import { fetchNotifications, selectNotifications } from "@/features/notifications/store/notifications-slice"
import { fetchAssignments } from "@/features/assignments/store/assignment-slice"
import { fetchGrades } from "@/features/grades/store/grade-slice"
import { fetchSchedule } from "@/features/schedule/store/schedule-slice"
import { fetchMyPaymentHistory, selectMyPayments } from "@/features/payment/store/payment-slice"
import { fetchAccountingData, selectAccountingStats, selectCourseRevenues } from "@/features/payment/store/accounting-slice"
import { fetchAnalyticsDashboard } from "@/features/analytics/store/analytics-slice"
import type { UserRole } from "@/types/user.types"
import { formatCurrency } from "@/lib/utils"

interface Activity {
    id: string
    title: string
    description: string
    timestamp: string
    type: string
    status?: string
    href?: string
    icon?: React.ReactNode
}

export function RecentActivities() {
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)
    const [isLoading, setIsLoading] = useState(true)
    const [activities, setActivities] = useState<Activity[]>([])

    // Get data from Redux store
    const notifications = useAppSelector(selectNotifications)
    const assignments = useAppSelector((state) => state.assignments.assignments)
    const grades = useAppSelector((state) => state.grades.studentGradeItems)
    // const payments = useAppSelector((state) => state.adminPayments)
    const payments = useAppSelector(selectMyPayments)
    const events = useAppSelector((state) => state.schedule.events)
    const courses = useAppSelector((state) => state.auth_courses.courses)
    const accountingData = useAppSelector((state) => state.accounting)
    const analyticsData = useAppSelector((state) => state.analytics)

    // Fetch data based on role
    useEffect(() => {
        if (!user) return

        const userRole = user.role as UserRole
        const userId = user.id

        // Common data for all roles
        dispatch(fetchNotifications({ page: 1, limit: 10 }))

        // Role-specific data fetching
        switch (userRole) {
            case "super_admin":
            case "admin":
                dispatch(fetchAnalyticsDashboard())
                break

            case "accounting":
                dispatch(fetchAccountingData())
                break

            case "teacher":
                dispatch(fetchAssignments({ role: "teacher", userId }))
                dispatch(fetchSchedule({
                    role: "teacher", userId,
                    startDate: format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
                    endDate: format(addMonths(new Date(), 3), 'yyyy-MM-dd')
                })); break

            case "student":
                dispatch(fetchAssignments({ role: "student", userId }))
                dispatch(fetchGrades())
                dispatch(fetchSchedule({
                    role: "student", userId, startDate: format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
                    endDate: format(addMonths(new Date(), 3), 'yyyy-MM-dd')
                }))
                dispatch(fetchMyPaymentHistory({ userId }))
                break
        }

        // Set loading to false after a reasonable timeout
        const timer = setTimeout(() => setIsLoading(false), 1500)
        return () => clearTimeout(timer)
    }, [dispatch, user])

    // Generate activities based on role and available data
    useEffect(() => {
        if (!user) return

        const userRole = user.role as UserRole
        const roleSpecificActivities: Activity[] = []

        // Convert notifications to activities
        const notificationActivities = notifications.map((notification) => ({
            id: `notification-${notification.id}`,
            title: notification.title,
            description: notification.message,
            timestamp: notification.createdAt,
            type: notification.type,
            status: notification.read ? "read" : "unread",
            href: notification.href,
            icon: getNotificationIcon(notification.type),
        }))

        // Add role-specific activities
        switch (userRole) {
            case "super_admin":
            case "admin":
                // Add analytics-based activities
                if (analyticsData.dashboardStats) {
                    const { studentStats, paymentStats } = analyticsData.dashboardStats

                    if (studentStats?.newThisMonth) {
                        roleSpecificActivities.push({
                            id: "analytics-new-students",
                            title: "New Student Enrollments",
                            description: `${studentStats.newThisMonth} new students enrolled this month`,
                            timestamp: new Date().toISOString(),
                            type: "system",
                            icon: <UserPlus className="h-4 w-4" />,
                            href: "/users",
                        })
                    }

                    if (paymentStats?.revenueThisMonth && user.role === 'super_admin') {
                        roleSpecificActivities.push({
                            id: "analytics-revenue",
                            title: "Monthly Revenue Update",
                            description: `₦${(paymentStats.revenueThisMonth).toLocaleString()} revenue generated this month`,
                            timestamp: new Date().toISOString(),
                            type: "payment",
                            icon: <CreditCard className="h-4 w-4" />,
                            href: "/accounting/analytics/",
                        })
                    }
                }
                break

            case "teacher":
                // Add assignment-based activities
                const pendingAssignments = assignments?.filter((a: any) => a.status === "submitted")
                if (pendingAssignments?.length) {
                    roleSpecificActivities.push({
                        id: "teacher-pending-assignments",
                        title: "Assignments Pending Review",
                        description: `${pendingAssignments.length} assignments waiting for your review`,
                        timestamp: new Date().toISOString(),
                        type: "assignment",
                        icon: <FileText className="h-4 w-4" />,
                        href: "/assignments",
                    })
                }

                // Add upcoming classes
                const upcomingClasses = events?.filter((e: any) => new Date(e.startTime) > new Date())
                if (upcomingClasses?.length) {
                    roleSpecificActivities.push({
                        id: "teacher-upcoming-classes",
                        title: "Upcoming Classes",
                        description: `You have ${upcomingClasses.length} upcoming classes scheduled`,
                        timestamp: new Date().toISOString(),
                        type: "course",
                        icon: <Calendar className="h-4 w-4" />,
                        href: "/schedule",
                    })
                }
                break

            case "student":
                // Add assignment-based activities
                const studentAssignments = assignments?.filter((a: any) => {
                    return a?.submission?.status === "pending" || a?.displayStatus === "pending"
                })

                if (studentAssignments?.length) {
                    roleSpecificActivities.push({
                        id: "student-pending-assignments",
                        title: "Pending Assignments",
                        description: `You have ${studentAssignments.length} assignments due soon`,
                        timestamp: new Date().toISOString(),
                        type: "assignment",
                        status: "pending",
                        icon: <FileText className="h-4 w-4" />,
                        href: "/assignments",
                    })
                }

                // Add recent grades
                const recentGrades = grades?.filter((g: any) => g?.grade)
                if (recentGrades?.length) {
                    roleSpecificActivities.push({
                        id: "student-recent-grades",
                        title: "Recent Grades",
                        description: `${recentGrades.length} of your assignments have been graded`,
                        timestamp: new Date().toISOString(),
                        type: "grade",
                        icon: <BarChart3 className="h-4 w-4" />,
                        href: "/grades",
                    })
                }

                // Add upcoming events
                const studentEvents = events?.filter((e: any) => new Date(e.startTime) > new Date())
                if (studentEvents?.length) {
                    roleSpecificActivities.push({
                        id: "student-upcoming-events",
                        title: "Upcoming Events",
                        description: `You have ${studentEvents.length} upcoming classes scheduled`,
                        timestamp: new Date().toISOString(),
                        type: "course",
                        icon: <Calendar className="h-4 w-4" />,
                        href: "/schedule",
                    })
                }

                // Add recent payments
                const recentPayments = payments?.slice(0, 3)
                if (recentPayments?.length) {
                    roleSpecificActivities.push({
                        id: "student-recent-payment",
                        title: "Recent Payment",
                        description: `Payment of ₦${(recentPayments[0]?.amount).toLocaleString()} was processed`,
                        timestamp: recentPayments[0]?.createdAt || new Date().toISOString(),
                        type: "payment",
                        icon: <CreditCard className="h-4 w-4" />,
                        href: "/payments",
                    })
                }
                break
        }

        // Combine all activities and sort by timestamp (newest first)
        const allActivities = [...notificationActivities, ...roleSpecificActivities]
        allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        // Limit to 10 activities
        setActivities(allActivities.slice(0, 10))
    }, [user, notifications, assignments, grades, payments, events, courses, accountingData, analyticsData])

    // Helper function to get icon for notification type
    function getNotificationIcon(type: NotificationType) {
        switch (type) {
            case "assignment":
                return <FileText className="h-4 w-4" />
            case "grade":
                return <BarChart3 className="h-4 w-4" />
            case "course":
                return <GraduationCap className="h-4 w-4" />
            case "announcement":
                return <Megaphone className="h-4 w-4" />
            case "message":
                return <MessageSquare className="h-4 w-4" />
            case "payment":
                return <CreditCard className="h-4 w-4" />
            case "system":
                return <Bell className="h-4 w-4" />
            default:
                return <Bell className="h-4 w-4" />
        }
    }

    // Helper function to get badge for activity type
    function getActivityBadge(activity: Activity) {
        switch (activity.type) {
            case "assignment":
                return (
                    <Badge
                        variant="outline"
                        className="text-[10px] px-1 py-0 h-4 bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                    >
                        Assignment
                    </Badge>
                )
            case "grade":
                return (
                    <Badge
                        variant="outline"
                        className="text-[10px] px-1 py-0 h-4 bg-green-50 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"
                    >
                        Grade
                    </Badge>
                )
            case "course":
                return (
                    <Badge
                        variant="outline"
                        className="text-[10px] px-1 py-0 h-4 bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700"
                    >
                        Course
                    </Badge>
                )
            case "payment":
                return (
                    <Badge
                        variant="outline"
                        className="text-[10px] px-1 py-0 h-4 bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700"
                    >
                        Payment
                    </Badge>
                )
            case "announcement":
                return (
                    <Badge
                        variant="outline"
                        className="text-[10px] px-1 py-0 h-4 bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
                    >
                        Announcement
                    </Badge>
                )
            case "message":
                return (
                    <Badge
                        variant="outline"
                        className="text-[10px] px-1 py-0 h-4 bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700"
                    >
                        Message
                    </Badge>
                )
            default:
                return (
                    <Badge
                        variant="outline"
                        className="text-[10px] px-1 py-0 h-4 bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700"
                    >
                        System
                    </Badge>
                )
        }
    }

    // Helper function to get status badge
    function getStatusBadge(status?: string) {
        if (!status) return null

        switch (status) {
            case "unread":
                return <Badge variant="default" className="h-1.5 w-1.5 p-0 rounded-full bg-primary" />
            case "pending":
                return (
                    <Badge
                        variant="outline"
                        className="text-[10px] px-1 py-0 h-4 bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700"
                    >
                        Pending
                    </Badge>
                )
            default:
                return null
        }
    }

    // Handle refresh
    const handleRefresh = () => {
        setIsLoading(true)
        dispatch(fetchNotifications({ page: 1, limit: 10 }))
        setTimeout(() => setIsLoading(false), 1000)
    }

    if (!user) return null

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    title="Refresh activities"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-auto pr-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            {Array(5)
                                .fill(0)
                                .map((_, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Skeleton className="h-8 w-8 rounded-md" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : activities.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {activities.map((activity, index) => (
                                <motion.div
                                    key={activity.id}
                                    className="flex items-start gap-3 border border-primary/15 rounded-2xl p-2 relative"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                >
                                    <div className="bg-primary/10 p-2 rounded-md flex-shrink-0 mt-0.5">
                                        {activity.icon || <Bell className="h-4 w-4 text-primary" />}
                                    </div>
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium text-sm truncate">{activity.title}</h4>
                                            {getStatusBadge(activity.status)}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{activity.description}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true })}
                                            </p>
                                        </div>
                                        {activity.href && (
                                            <div className="mt-2">
                                                <DyraneButton variant="outline" size="sm" className="text-xs h-7" asChild>
                                                    <Link href={activity.href}>View Details</Link>
                                                </DyraneButton>
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        {getActivityBadge(activity)}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-muted-foreground">No recent activity to display</p>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
