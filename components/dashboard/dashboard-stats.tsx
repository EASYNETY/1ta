"use client"

import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchAssignments } from '@/features/assignments/store/assignment-slice'
import { fetchGrades } from '@/features/grades/store/grade-slice'
import { fetchSchedule } from '@/features/schedule/store/schedule-slice'
import { fetchMyPaymentHistory } from '@/features/payment/store/payment-slice'
import { fetchMyEnroledClasses } from '@/features/classes/store/classes-thunks'
import { fetchAuthCourses } from '@/features/auth-course/store/auth-course-slice'
import { fetchNotifications } from '@/features/notifications/store/notifications-slice'
import {
  BookOpen,
  Calendar,
  GraduationCap,
  FileText,
  Users,
  CreditCard,
  Bell
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { safeArray, safeFilter, safeLength, safeReduce } from '@/lib/utils/safe-data'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  loading?: boolean
  className?: string
}

const StatCard = ({ title, value, description, icon, loading = false, className }: StatCardProps) => (
  <Card className={cn("overflow-hidden", className)} style={{ height: 'auto' }}>
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
        </>
      )}
    </CardContent>
  </Card>
)

export function DashboardStats() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)
  const userId = user?.id || ''

  // Selectors for different features with proper fallbacks
  const { assignments = [], status: assignmentsStatus } = useAppSelector(state => state.assignments) || { assignments: [], status: 'idle' }
  const { studentGradeItems = [], status: gradesStatus } = useAppSelector(state => state.grades) || { studentGradeItems: [], status: 'idle' }
  const { events = [], status: scheduleStatus } = useAppSelector(state => state.schedule) || { events: [], status: 'idle' }
  const { myPayments = [], status: paymentsStatus } = useAppSelector(state => state.paymentHistory) || { myPayments: [], status: 'idle' }
  const { myClasses: enroledClasses = [], status: classesStatus } = useAppSelector(state => state.classes) || { myClasses: [], status: 'idle' }
  const { courses = [], status: coursesStatus } = useAppSelector(state => state.auth_courses) || { courses: [], status: 'idle' }
  const { unreadCount = 0, status: notificationsStatus } = useAppSelector(state => state.notifications) || { unreadCount: 0, status: 'idle' }

  // Fetch data on component mount - only if user is logged in
  useEffect(() => {
    if (!userId) return // Don't fetch data if user is not logged in

    const today = new Date()
    const weekLater = new Date(today)
    weekLater.setDate(today.getDate() + 7)

    const startDate = today.toISOString().split('T')[0]
    const endDate = weekLater.toISOString().split('T')[0]

    if (assignmentsStatus === 'idle') dispatch(fetchAssignments({ role: 'student', userId }))
    if (gradesStatus === 'idle') dispatch(fetchGrades())
    if (scheduleStatus === 'idle') dispatch(fetchSchedule({ role: 'student', userId, startDate, endDate }))
    if (paymentsStatus === 'idle') dispatch(fetchMyPaymentHistory({ userId }))
    if (classesStatus === 'idle') dispatch(fetchMyEnroledClasses(userId))
    if (coursesStatus === 'idle') dispatch(fetchAuthCourses())
    if (notificationsStatus === 'idle') dispatch(fetchNotifications({ page: 1, limit: 10 }))
  }, [
    dispatch,
    userId,
    assignmentsStatus,
    gradesStatus,
    scheduleStatus,
    paymentsStatus,
    classesStatus,
    coursesStatus,
    notificationsStatus
  ])

  // Calculate stats with proper type checking
  // For assignments, we need to check the submission status, not the assignment status
  // We need to cast assignments to StudentAssignmentView[] since that's what we're actually getting
  const studentAssignments = assignments as any[];
  const pendingAssignments = safeFilter(studentAssignments, a => {
    // Check if it has a submission property with pending status
    if (a?.submission?.status === 'pending') return true;
    // Or check if it has a displayStatus property with pending value
    if (a?.displayStatus === 'pending') return true;
    return false;
  }).length;

  // For events, check if startTime is in the future
  const upcomingEvents = safeFilter(events, e => {
    if (!e?.startTime) return false;
    return new Date(e.startTime) > new Date();
  }).length;

  // For courses, check the correct enrolment status values
  const completedCourses = safeFilter(courses, c => {
    if (c?.enrolmentStatus !== 'enroled') return false;
    return c.progress === 100;
  }).length;

  const inProgressCourses = safeFilter(courses, c => {
    if (c?.enrolmentStatus !== 'enroled') return false;
    return (c.progress ?? 0) < 100;
  }).length;

  const totalClasses = safeLength(enroledClasses);
  const totalPayments = safeLength(myPayments);

  // Calculate average grade percentage
  const gradeItems = safeArray(studentGradeItems);
  // StudentGradeItemView has a grade property which contains the StudentGrade
  const validGradeItems = safeFilter(gradeItems, item => {
    if (!item?.grade) return false;
    if (typeof item.grade.percentage !== 'number') return false;
    return !isNaN(item.grade.percentage);
  });

  const averageGradePercentage = validGradeItems.length > 0
    ? Math.round(safeReduce(validGradeItems, (acc, item) => acc + (item.grade?.percentage || 0), 0) / validGradeItems.length)
    : 0;

  // Loading states
  const assignmentsLoading = assignmentsStatus === 'loading'
  const gradesLoading = gradesStatus === 'loading'
  const scheduleLoading = scheduleStatus === 'loading'
  const paymentsLoading = paymentsStatus === 'loading'
  const classesLoading = classesStatus === 'loading'
  const coursesLoading = coursesStatus === 'loading'
  const notificationsLoading = notificationsStatus === 'loading'

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
        value={`${inProgressCourses}/${courses?.length || 0}`}
        description={`${completedCourses} completed`}
        icon={<BookOpen className="h-4 w-4" />}
        loading={coursesLoading}
        className="bg-green-50 dark:bg-green-950/5"
      />
      <StatCard
        title="Classes"
        value={totalClasses}
        icon={<Users className="h-4 w-4" />}
        loading={classesLoading}
        className="bg-purple-50 dark:bg-purple-950/5"
      />
      <StatCard
        title="Grades"
        value={validGradeItems.length > 0 ? `${averageGradePercentage}%` : 'N/A'}
        description={`${validGradeItems.length} graded items`}
        icon={<GraduationCap className="h-4 w-4" />}
        loading={gradesLoading}
        className="bg-pink-50 dark:bg-pink-950/5"
      />
      <StatCard
        title="Payments"
        value={totalPayments}
        icon={<CreditCard className="h-4 w-4" />}
        loading={paymentsLoading}
        className="bg-yellow-50 dark:bg-yellow-950/5"
      />
      <StatCard
        title="Notifications"
        value={unreadCount}
        description="Unread notifications"
        icon={<Bell className="h-4 w-4" />}
        loading={notificationsLoading}
        className="bg-red-50 dark:bg-red-950/5"
      />
    </div>
  )
}
