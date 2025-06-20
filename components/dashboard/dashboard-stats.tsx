"use client"

import type React from "react"

import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BookOpen,
  Calendar,
  GraduationCap,
  FileText,
  Users,
  CreditCard,
  School,
  Award,
  Clock,
  TrendingUp,
  DollarSign,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { safeArray, safeFilter, safeLength, safeReduce } from "@/lib/utils/safe-data"
import { isSuperAdmin, type UserRole } from "@/types/user.types"

// Import various thunks based on role needs
import { fetchAssignments } from "@/features/assignments/store/assignment-slice"
import { fetchGrades } from "@/features/grades/store/grade-slice"
import { fetchSchedule } from "@/features/schedule/store/schedule-slice"
import { fetchMyPaymentHistory } from "@/features/payment/store/payment-slice"
import { fetchMyEnroledClasses } from "@/features/classes/store/classes-thunks"
import { fetchAuthCourses } from "@/features/auth-course/store/auth-course-slice"
import { fetchNotifications } from "@/features/notifications/store/notifications-slice"
import { fetchAnalyticsDashboard } from "@/features/analytics/store/analytics-slice"
import { fetchAccountingData, selectAccountingStats, selectAccountingStatus, selectCourseRevenues, selectMonthlyRevenueTrend, selectPaymentMethodDistribution } from "@/features/payment/store/accounting-slice"
import { fetchAllUsersComplete } from "@/features/auth"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  loading?: boolean
  className?: string
  trend?: {
    value: string
    isPositive: boolean
  }
}

const StatCard = ({ title, value, description, icon, loading = false, className, trend }: StatCardProps) => (
  <Card className={cn("overflow-hidden", className)} style={{ height: "auto" }}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-4 w-4 text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="h-9 w-24 animate-pulse rounded-md bg-muted"></div>
      ) : (
        <>
          <div className="text-2xl font-bold truncate">{value}</div>
          {description && <p className="text-xs text-muted-foreground truncate">{description}</p>}
          {trend && (
            <div className="flex items-center text-xs mt-1">
              <TrendingUp className={cn("mr-1 h-3 w-3", trend.isPositive ? "text-green-500" : "text-red-500")} />
              <span className={cn(trend.isPositive ? "text-green-500" : "text-red-500")}>{trend.value}</span>
              <span className="ml-1 text-muted-foreground">from last period</span>
            </div>
          )}
        </>
      )}
    </CardContent>
  </Card>
)

export function DashboardStats() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const userId = user?.id || ""
  const userRole = user?.role as UserRole

  // Selectors for different features with proper fallbacks
  const { assignments = [], status: assignmentsStatus } = useAppSelector((state) => state.assignments) || {
    assignments: [],
    status: "idle",
  }
  const { studentGradeItems = [], status: gradesStatus } = useAppSelector((state) => state.grades) || {
    studentGradeItems: [],
    status: "idle",
  }
  const { events = [], status: scheduleStatus } = useAppSelector((state) => state.schedule) || {
    events: [],
    status: "idle",
  }
  const { myPayments = [], status: paymentsStatus } = useAppSelector((state) => state.paymentHistory) || {
    myPayments: [],
    status: "idle",
  }
  const { myClasses: enroledClasses = [], status: classesStatus } = useAppSelector((state) => state.classes) || {
    myClasses: [],
    status: "idle",
  }
  const { courses = [], status: coursesStatus } = useAppSelector((state) => state.auth_courses) || {
    courses: [],
    status: "idle",
  }
  const { unreadCount = 0, status: notificationsStatus } = useAppSelector((state) => state.notifications) || {
    unreadCount: 0,
    status: "idle",
  }
  const analytics = useAppSelector((state) => state.analytics)
  const stats = useAppSelector(selectAccountingStats)
  const accountingLoading = useAppSelector((state) => state.accounting.status) === "loading"
  const { users, usersLoading } = useAppSelector((state) => state.auth)

  // Fetch data based on role
  useEffect(() => {
    if (!userId) return // Don't fetch data if user is not logged in

    const today = new Date()
    const weekLater = new Date(today)
    weekLater.setDate(today.getDate() + 7)

    const startDate = today.toISOString().split("T")[0]
    const endDate = weekLater.toISOString().split("T")[0]

    // Common data for all roles
    if (notificationsStatus === "idle") {
      dispatch(fetchNotifications({ page: 1, limit: 10 }))
    }

    // Role-specific data fetching
    switch (userRole) {
      case "super_admin":
      case "admin":
        if (analytics.status === "idle") {
          dispatch(fetchAnalyticsDashboard())
          dispatch(fetchAuthCourses())
          dispatch(fetchAllUsersComplete())
          dispatch(fetchAccountingData({}))
        }
        break

      case "accounting":
        if (stats === undefined) {
          dispatch(fetchAccountingData({}))
        }
        break

      case "teacher":
        if (assignmentsStatus === "idle") {
          dispatch(fetchAssignments({ role: "teacher", userId }))
        }
        if (scheduleStatus === "idle") {
          dispatch(fetchSchedule({ role: "teacher", userId, startDate, endDate }))
        }
        if (classesStatus === "idle") {
          dispatch(fetchMyEnroledClasses(userId))
        }
        break

      case "student":
        if (assignmentsStatus === "idle") {
          dispatch(fetchAssignments({ role: "student", userId }))
        }
        if (gradesStatus === "idle") {
          dispatch(fetchGrades())
        }
        if (scheduleStatus === "idle") {
          dispatch(fetchSchedule({ role: "student", userId, startDate, endDate }))
        }
        if (paymentsStatus === "idle") {
          dispatch(fetchMyPaymentHistory({ userId }))
        }
        if (classesStatus === "idle") {
          dispatch(fetchMyEnroledClasses(userId))
        }
        if (coursesStatus === "idle") {
          dispatch(fetchAuthCourses())
        }
        break
    }
  }, [
    dispatch,
    userId,
    userRole,
    // assignmentsStatus,
    // gradesStatus,
    // scheduleStatus,
    // paymentsStatus,
    // classesStatus,
    // coursesStatus,
    // notificationsStatus,
    // analytics.status,
    stats,
  ])

  // Calculate user counts by role
  const totalUsers = users?.length || 0
  const totalStudents = users?.filter((u) => u.role === "student").length || 0
  const totalTeachers = users?.filter((u) => u.role === "teacher").length || 0

  // Calculate stats with proper type checking
  const studentAssignments = assignments as any[]
  const pendingAssignments = safeFilter(studentAssignments, (a) => {
    if (a?.submission?.status === "pending") return true
    if (a?.displayStatus === "pending") return true
    return false
  }).length

  const upcomingEvents = safeFilter(events, (e) => {
    if (!e?.start_time) return false
    return new Date(e.start_time) > new Date()
  }).length

  const completedCourses = safeFilter(courses, (c) => {
    if (c?.enrolmentStatus !== "enroled") return false
    return c.progress === 100
  }).length

  const inProgressCourses = safeFilter(courses, (c) => {
    if (c?.enrolmentStatus !== "enroled") return false
    return (c.progress ?? 0) < 100
  }).length

  const totalClasses = safeLength(enroledClasses)
  const totalPayments = safeLength(myPayments)

  const gradeItems = safeArray(studentGradeItems)
  const validGradeItems = safeFilter(gradeItems, (item) => {
    if (!item?.grade) return false
    if (typeof item.grade.percentage !== "number") return false
    return !isNaN(item.grade.percentage)
  })

  const averageGradePercentage =
    validGradeItems.length > 0
      ? Math.round(
        safeReduce(validGradeItems, (acc, item) => acc + (item.grade?.percentage || 0), 0) / validGradeItems.length,
      )
      : 0

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Loading states
  const assignmentsLoading = assignmentsStatus === "loading"
  const gradesLoading = gradesStatus === "loading"
  const scheduleLoading = scheduleStatus === "loading"
  const paymentsLoading = paymentsStatus === "loading"
  const classesLoading = classesStatus === "loading"
  const coursesLoading = coursesStatus === "loading"
  const notificationsLoading = notificationsStatus === "loading"
  const analyticsLoading = analytics.status === "loading"

  // Role-based cards rendering
  if (!user) return null

  switch (userRole) {
    case "super_admin":
    case "admin":
      // Selectors from your accountingSlice and paymentSlice
      const accountingStatsFromSelector = useAppSelector(selectAccountingStats); // Calls calculateAccountingStats
      const monthlyRevenueTrendData = useAppSelector(selectMonthlyRevenueTrend); // Calls calculateMonthlyRevenueTrend
      // const courseRevenues = useAppSelector(selectCourseRevenues); // If needed for other cards
      // const paymentMethods = useAppSelector(selectPaymentMethodDistribution); // If needed

      const accountingDataIsLoading = useAppSelector(selectAccountingStatus) === 'loading';
      // You might also have a loading state from paymentSlice if allPayments is being fetched
      const paymentsDataIsLoading = useAppSelector(state => state.paymentHistory.status) === 'loading';
      const overallIsLoading = accountingDataIsLoading || paymentsDataIsLoading;

      // --- Inline Calculation for Revenue Card ---
      let currentMonthRevenueForDisplay = 0;
      let revenueGrowthRate = 0;
      let revenueGrowthTrendDescription = "vs last month";
      let hasEnoughDataForGrowthRate = false;

      if (monthlyRevenueTrendData && monthlyRevenueTrendData.length > 0) {
        // Ensure your calculateMonthlyRevenueTrend sorts this with most recent month last.
        // If not, you'd sort here:
        // const sortedMonthlyRevenue = [...monthlyRevenueTrendData].sort((a, b) => parseISO(a.monthKey) - parseISO(b.monthKey)); // Assuming monthKey is YYYY-MM
        // For now, assuming it's sorted by your utility.

        currentMonthRevenueForDisplay = monthlyRevenueTrendData[monthlyRevenueTrendData.length - 1].revenue;

        if (monthlyRevenueTrendData.length > 1) {
          const previousMonthRevenue = monthlyRevenueTrendData[monthlyRevenueTrendData.length - 2].revenue;
          hasEnoughDataForGrowthRate = true;
          if (previousMonthRevenue > 0) {
            revenueGrowthRate = parseFloat(
              (((currentMonthRevenueForDisplay - previousMonthRevenue) / previousMonthRevenue) * 100).toFixed(1)
            );
          } else if (currentMonthRevenueForDisplay > 0) {
            revenueGrowthRate = 100; // Growth from 0 to positive is effectively 100% (or infinite)
          }
          // If both are 0, growth rate remains 0
        } else if (currentMonthRevenueForDisplay > 0) {
          // Only one month of data
          revenueGrowthRate = 0; // Or you could show N/A for growth
          revenueGrowthTrendDescription = "first month data";
          hasEnoughDataForGrowthRate = false; // Not really a 'growth' from previous
        }
      }

      // Total Revenue for the selected period (from selectAccountingStats)
      const totalRevenueForPeriod = accountingStatsFromSelector?.totalRevenue || 0;

      // Description for the revenue card (revenue this month)
      // This uses the calculated currentMonthRevenueForDisplay
      const revenueThisMonthDescription = currentMonthRevenueForDisplay > 0
        ? `+${formatCurrency(currentMonthRevenueForDisplay)} this month` // ASSUMES Kobo/Cents
        : (analytics.dashboardStats?.paymentStats?.revenueThisMonth // Fallback to your 'analytics' object
          ? `+${formatCurrency(analytics.dashboardStats.paymentStats.revenueThisMonth)} this month`
          : "No revenue this month");

      // Trend object for the StatCard
      let revenueCardTrend: { value: string; isPositive: boolean; description?: string } | undefined = undefined;

      if (hasEnoughDataForGrowthRate && revenueGrowthRate !== null) {
        revenueCardTrend = {
          value: `${revenueGrowthRate}%`,
          isPositive: revenueGrowthRate >= 0,
          description: revenueGrowthTrendDescription
        };
      }

      // --- Inline Derivation for Facilitators ---
      let activeFacilitatorsCount = 0;
      let totalFacilitatorsCount = 0;

      if (totalUsers && totalUsers > 0) {
        const facilitators = users.filter(user => user.role === 'teacher');
        totalFacilitatorsCount = facilitators.length;
        activeFacilitatorsCount = facilitators.filter(facilitator => facilitator.isActive === true).length;
      }
      // If you already have a `totalTeachers` variable that's just a count, you can use it for the main value.
      // The `activeFacilitatorsCount` would be the new derived part for the description.

      // --- Inline Derivation for Courses ---
      let publishedCoursesCount = 0;
      let totalCoursesCount = 0;

      if (courses && courses.length > 0) {
        totalCoursesCount = courses.length;
        publishedCoursesCount = courses.filter(course => course.isAvailableForEnrolment === true).length; // Adjust property name: 'status' or 'isPublished'
      }

      return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Students"
            value={totalStudents || analytics.dashboardStats?.studentStats?.total || 0}
            description={`+${analytics.dashboardStats?.studentStats?.newThisMonth || 0} this month`}
            icon={<Users className="h-4 w-4" />}
            loading={usersLoading || analyticsLoading}
            className="bg-blue-50 dark:bg-blue-950/5"
            trend={
              analytics.dashboardStats?.studentStats?.growthRate
                ? {
                  value: `${analytics.dashboardStats?.studentStats?.growthRate}%`,
                  isPositive: (analytics.dashboardStats?.studentStats?.growthRate || 0) > 0,
                }
                : undefined
            }
          />
          <StatCard
            title="Total Facilitators"
            // Use totalFacilitatorsCount if calculated, otherwise your existing totalTeachers
            value={totalFacilitatorsCount > 0 ? totalFacilitatorsCount : (totalTeachers || 0)}
            // Use the derived activeFacilitatorsCount for the description
            description={activeFacilitatorsCount > 0 ? `${activeFacilitatorsCount} active` : "0 active"}
            icon={<GraduationCap className="h-4 w-4" />}
            loading={usersLoading || analyticsLoading} // Assuming usersLoading covers facilitators
            className="bg-green-50 dark:bg-green-950/5"
          />

          <StatCard
            title="Total Courses"
            // Use totalCoursesCount if calculated, otherwise your existing courses.length
            value={totalCoursesCount > 0 ? totalCoursesCount : (courses?.length || 0)}
            // Use the derived publishedCoursesCount for the description
            description={publishedCoursesCount > 0 ? `${publishedCoursesCount} published` : "0 published"}
            icon={<School className="h-4 w-4" />}
            loading={coursesLoading || analyticsLoading} // Assuming coursesLoading covers courses
            className="bg-purple-50 dark:bg-purple-950/5"
          />
          <StatCard
            title="Revenue" // For the selected dateRange
            value={
              totalRevenueForPeriod
                ? formatCurrency(totalRevenueForPeriod) // ASSUMES Kobo/Cents
                : analytics.dashboardStats?.paymentStats?.totalRevenue
                  ? formatCurrency(analytics.dashboardStats.paymentStats.totalRevenue)
                  : "₦0"
            }
            description={revenueThisMonthDescription}
            icon={<DollarSign className="h-4 w-4" />}
            loading={overallIsLoading} // Use combined loading state
            className="bg-amber-50 dark:bg-amber-950/5"
            trend={revenueCardTrend}
          />
        </div>
      )

    case "teacher":
      return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="My Courses"
            value={courses.length}
            description={`${completedCourses} completed`}
            icon={<BookOpen className="h-4 w-4" />}
            loading={coursesLoading}
            className="bg-blue-50 dark:bg-blue-950/5"
          />
          <StatCard
            title="My Students"
            value={totalStudents}
            description={`Across ${enroledClasses.length} classes`}
            icon={<Users className="h-4 w-4" />}
            loading={usersLoading || classesLoading}
            className="bg-green-50 dark:bg-green-950/5"
          />
          <StatCard
            title="Pending Assignments"
            value={pendingAssignments}
            description="Assignments to grade"
            icon={<FileText className="h-4 w-4" />}
            loading={assignmentsLoading}
            className="bg-amber-50 dark:bg-amber-950/5"
          />
          <StatCard
            title="Upcoming Classes"
            value={upcomingEvents}
            description="This week"
            icon={<Calendar className="h-4 w-4" />}
            loading={scheduleLoading}
            className="bg-purple-50 dark:bg-purple-950/5"
          />
        </div>
      )

    case "student":
    default:
      return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Pending Assignments"
            value={pendingAssignments}
            icon={<FileText className="h-4 w-4" />}
            loading={assignmentsLoading}
            className="bg-amber-50 dark:bg-amber-950/5"
          />
          <StatCard
            title="Upcoming Events"
            value={upcomingEvents}
            icon={<Calendar className="h-4 w-4" />}
            loading={scheduleLoading}
            className="bg-blue-50 dark:bg-blue-950/5"
          />
          <StatCard
            title="Courses"
            value={`${inProgressCourses}/${courses.length || 0}`}
            description={`${completedCourses} completed`}
            icon={<BookOpen className="h-4 w-4" />}
            loading={coursesLoading}
            className="bg-green-50 dark:bg-green-950/5"
          />
          <StatCard
            title="Grades"
            value={validGradeItems.length > 0 ? `${averageGradePercentage}%` : "N/A"}
            description={`${validGradeItems.length} graded items`}
            icon={<Award className="h-4 w-4" />}
            loading={gradesLoading}
            className="bg-purple-50 dark:bg-purple-950/5"
          />
        </div>
      )
  }
}
