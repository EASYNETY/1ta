"use client"

import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchAssignments } from '@/features/assignments/store/assignment-slice'
import { fetchGrades } from '@/features/grades/store/grade-slice'
import { fetchSchedule } from '@/features/schedule/store/schedule-slice'
import { fetchMyPaymentHistory } from '@/features/payment/store/payment-slice'
import { fetchEnrolledClasses } from '@/features/classes/store/classes-slice'
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

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  loading?: boolean
  className?: string
}

const StatCard = ({ title, value, description, icon, loading = false, className }: StatCardProps) => (
  <Card className={cn("overflow-hidden", className)}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-4 w-4 text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="h-9 w-24 animate-pulse rounded-md bg-muted"></div>
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </>
      )}
    </CardContent>
  </Card>
)

export function DashboardStats() {
  const dispatch = useAppDispatch()
  
  // Selectors for different features
  const { assignments, status: assignmentsStatus } = useAppSelector(state => state.assignments)
  const { grades, status: gradesStatus } = useAppSelector(state => state.grades)
  const { events, status: scheduleStatus } = useAppSelector(state => state.schedule)
  const { myPayments, status: paymentsStatus } = useAppSelector(state => state.paymentHistory)
  const { enrolledClasses, status: classesStatus } = useAppSelector(state => state.classes)
  const { courses, status: coursesStatus } = useAppSelector(state => state.auth_courses)
  const { unreadCount, status: notificationsStatus } = useAppSelector(state => state.notifications)
  
  // Fetch data on component mount
  useEffect(() => {
    if (assignmentsStatus === 'idle') dispatch(fetchAssignments())
    if (gradesStatus === 'idle') dispatch(fetchGrades())
    if (scheduleStatus === 'idle') dispatch(fetchSchedule({ role: 'student' }))
    if (paymentsStatus === 'idle') dispatch(fetchMyPaymentHistory({ userId: 'student_123' }))
    if (classesStatus === 'idle') dispatch(fetchEnrolledClasses({ userId: 'student_123' }))
    if (coursesStatus === 'idle') dispatch(fetchAuthCourses())
    if (notificationsStatus === 'idle') dispatch(fetchNotifications({}))
  }, [
    dispatch, 
    assignmentsStatus, 
    gradesStatus, 
    scheduleStatus, 
    paymentsStatus, 
    classesStatus, 
    coursesStatus,
    notificationsStatus
  ])
  
  // Calculate stats
  const pendingAssignments = assignments.filter(a => a.status === 'pending').length
  const upcomingEvents = events.filter(e => new Date(e.startTime) > new Date()).length
  const completedCourses = courses.filter(c => c.enrollmentStatus === 'completed').length
  const inProgressCourses = courses.filter(c => c.enrollmentStatus === 'in-progress').length
  const totalClasses = enrolledClasses.length
  const totalPayments = myPayments.length
  
  // Loading states
  const assignmentsLoading = assignmentsStatus === 'loading'
  const gradesLoading = gradesStatus === 'loading'
  const scheduleLoading = scheduleStatus === 'loading'
  const paymentsLoading = paymentsStatus === 'loading'
  const classesLoading = classesStatus === 'loading'
  const coursesLoading = coursesStatus === 'loading'
  const notificationsLoading = notificationsStatus === 'loading'
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Pending Assignments"
        value={pendingAssignments}
        icon={<FileText className="h-4 w-4" />}
        loading={assignmentsLoading}
        className="bg-amber-50 dark:bg-amber-950/20"
      />
      <StatCard
        title="Upcoming Events"
        value={upcomingEvents}
        icon={<Calendar className="h-4 w-4" />}
        loading={scheduleLoading}
        className="bg-blue-50 dark:bg-blue-950/20"
      />
      <StatCard
        title="Courses"
        value={`${inProgressCourses}/${courses.length}`}
        description={`${completedCourses} completed`}
        icon={<BookOpen className="h-4 w-4" />}
        loading={coursesLoading}
        className="bg-green-50 dark:bg-green-950/20"
      />
      <StatCard
        title="Classes"
        value={totalClasses}
        icon={<Users className="h-4 w-4" />}
        loading={classesLoading}
        className="bg-purple-50 dark:bg-purple-950/20"
      />
      <StatCard
        title="Grades"
        value={grades.length > 0 ? `${Math.round(grades.reduce((acc, grade) => acc + grade.score, 0) / grades.length)}%` : 'N/A'}
        description={`${grades.length} graded items`}
        icon={<GraduationCap className="h-4 w-4" />}
        loading={gradesLoading}
        className="bg-pink-50 dark:bg-pink-950/20"
      />
      <StatCard
        title="Payments"
        value={totalPayments}
        icon={<CreditCard className="h-4 w-4" />}
        loading={paymentsLoading}
        className="bg-yellow-50 dark:bg-yellow-950/20"
      />
      <StatCard
        title="Notifications"
        value={unreadCount}
        description="Unread notifications"
        icon={<Bell className="h-4 w-4" />}
        loading={notificationsLoading}
        className="bg-red-50 dark:bg-red-950/20"
      />
    </div>
  )
}
