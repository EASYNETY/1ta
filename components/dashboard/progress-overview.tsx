"use client"

import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button'
import {
  BookOpen,
  GraduationCap,
  FileText,
  BarChart3,
  ChevronRight,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { selectAuthCourses } from '@/features/auth-course/store/auth-course-slice'
import { selectMyClasses } from '@/features/classes/store/classes-slice'
import { safeArray, safeFilter, safeLength } from '@/lib/utils/safe-data'

export function ProgressOverview() {
  const dispatch = useAppDispatch()

  // Get courses and classes from Redux store
  const courses = useAppSelector(selectAuthCourses)
  const classes = useAppSelector(selectMyClasses)

  // Calculate overall progress metrics
  const calculateOverallProgress = () => {
    if (courses.length === 0) return 0

    const totalProgress = courses.reduce((sum, course) => {
      // Calculate course progress
      const totalLessons = course.modules?.reduce((acc, module) =>
        acc + safeLength(module.lessons), 0) || 0

      const completedLessons = safeLength(course.completedLessons)
      const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

      return sum + progress
    }, 0)

    return Math.round(totalProgress / courses.length)
  }

  // Calculate assignment completion rate
  const calculateAssignmentCompletion = () => {
    if (courses.length === 0) return 0

    let totalAssignments = 0
    let completedAssignments = 0

    courses.forEach(course => {
      // This is a simplified calculation since we don't have direct access to assignments
      // In a real implementation, you would use the assignments from the Redux store
      const courseAssignments = course.assignments || []
      totalAssignments += courseAssignments.length

      completedAssignments += courseAssignments.filter(
        assignment => assignment.status === 'completed' || assignment.status === 'graded'
      ).length
    })

    return totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0
  }

  // Calculate quiz performance
  const calculateQuizPerformance = () => {
    if (courses.length === 0) return 0

    let totalQuizzes = 0
    let totalScore = 0

    courses.forEach(course => {
      const quizScores = course.quizScores || {}
      const quizIds = Object.keys(quizScores)

      totalQuizzes += quizIds.length

      if (quizIds.length > 0) {
        const courseQuizScore = quizIds.reduce((sum, quizId) => sum + quizScores[quizId], 0)
        totalScore += courseQuizScore
      }
    })

    return totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0
  }

  // Calculate overall grade
  const calculateOverallGrade = () => {
    // This is a simplified calculation
    // In a real implementation, you would use the grades from the Redux store
    return Math.round((calculateOverallProgress() + calculateQuizPerformance()) / 2)
  }

  const overallProgress = calculateOverallProgress()
  const assignmentCompletion = calculateAssignmentCompletion()
  const quizPerformance = calculateQuizPerformance()
  const overallGrade = calculateOverallGrade()

  // Get upcoming classes
  const getUpcomingClasses = () => {
    const now = new Date()

    return safeFilter(classes, classItem => {
      if (!classItem.start_date) return false

      const startDate = new Date(classItem.start_date)
      return startDate > now
    }).slice(0, 3)
  }

  const upcomingClasses = getUpcomingClasses()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Progress Overview</h2>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProgressCard
          title="Overall Progress"
          value={overallProgress}
          icon={<BookOpen className="h-5 w-5" />}
          href="/courses"
          color="primary"
        />

        <ProgressCard
          title="Assignments"
          value={assignmentCompletion}
          icon={<FileText className="h-5 w-5" />}
          href="/assignments"
          color="blue"
        />

        <ProgressCard
          title="Quiz Performance"
          value={quizPerformance}
          icon={<GraduationCap className="h-5 w-5" />}
          href="/courses"
          color="amber"
        />

        <ProgressCard
          title="Overall Grade"
          value={overallGrade}
          icon={<BarChart3 className="h-5 w-5" />}
          href="/grades"
          color="green"
        />
      </div>

      {/* Upcoming Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Classes</CardTitle>
          <CardDescription>
            Your next scheduled classes
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {upcomingClasses.length > 0 ? (
            upcomingClasses.map((classItem, index) => (
              <div
                key={classItem.id || index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-1.5 rounded-md">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{classItem.name || classItem.courseTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {classItem.start_date ? new Date(classItem.start_date).toLocaleDateString() : 'Date not specified'}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/classes/${classItem.id}`}
                  className="text-xs text-primary hover:underline"
                >
                  View Details
                </Link>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No upcoming classes scheduled
            </p>
          )}
        </CardContent>

        <CardFooter>
          <DyraneButton variant="outline" className="w-full" asChild>
            <Link href="/timetable">
              View Full Schedule
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </DyraneButton>
        </CardFooter>
      </Card>
    </div>
  )
}

// Progress Card Component
function ProgressCard({
  title,
  value,
  icon,
  href,
  color = 'primary'
}: {
  title: string
  value: number
  icon: React.ReactNode
  href: string
  color?: 'primary' | 'blue' | 'green' | 'amber' | 'red'
}) {
  // Get color classes based on color prop
  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return {
          bg: 'bg-primary/10',
          text: 'text-primary',
          progress: 'bg-primary'
        }
      case 'blue':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-600',
          progress: 'bg-blue-500'
        }
      case 'green':
        return {
          bg: 'bg-green-100',
          text: 'text-green-600',
          progress: 'bg-green-500'
        }
      case 'amber':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-600',
          progress: 'bg-amber-500'
        }
      case 'red':
        return {
          bg: 'bg-red-100',
          text: 'text-red-600',
          progress: 'bg-red-500'
        }
      default:
        return {
          bg: 'bg-primary/10',
          text: 'text-primary',
          progress: 'bg-primary'
        }
    }
  }

  const colorClasses = getColorClasses()

  return (
    <Card style={{ height: 'auto' }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardHeader className="pb-2 min-h-[56px]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2 w-full">
                <div className={cn("p-1.5 rounded-md", colorClasses.bg)}>
                  <div className={colorClasses.text}>{icon}</div>
                </div>
                <span className="truncate whitespace-nowrap">{title}</span>
              </CardTitle>
              <span className={cn("text-lg font-bold", colorClasses.text)}>
                {value}%
              </span>
            </div>
          </CardHeader>
          <span className={cn("text-lg font-bold", colorClasses.text)}>
            {value}%
          </span>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <Progress
          value={value}
          className="h-2"
          // @ts-ignore
          indicatorclassname={colorClasses.progress}
        />
      </CardContent>

      <CardFooter>
        <DyraneButton variant="ghost" size="sm" className="w-full" asChild>
          <Link href={href}>
            <span className="truncate">View Details</span>
            <ChevronRight className="ml-2 h-4 w-4 flex-shrink-0" />
          </Link>
        </DyraneButton>
      </CardFooter>
    </Card>
  )
}
