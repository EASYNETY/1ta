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
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button'
import { Badge } from '@/components/ui/badge'
import {
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { selectAuthCourseBySlug } from '@/features/auth-course/store/auth-course-slice'
import { selectClassById } from '@/features/classes/store/classes-slice'
import { safeArray, safeFilter } from '@/lib/utils/safe-data'

interface ClassQuizLinkProps {
  courseSlug: string
  classId?: string
}

export function ClassQuizLink({ courseSlug, classId }: ClassQuizLinkProps) {
  const dispatch = useAppDispatch()

  // Get course data
  const course = useAppSelector(selectAuthCourseBySlug(courseSlug))

  // Get class data if classId is provided
  const classData = classId ? useAppSelector(selectClassById(classId)) : null

  // Extract all quizzes from course modules
  const quizzes = course?.modules?.reduce((acc, module) => {
    const moduleQuizzes = safeFilter(module.lessons, lesson => lesson.type === 'quiz')
      .map(quiz => ({
        ...quiz,
        moduleId: module.id,
        moduleTitle: module.title
      }))
    return [...acc, ...moduleQuizzes]
  }, [] as any[]) || []

  // Get completed quizzes
  const completedQuizzes = quizzes.filter(quiz =>
    course?.quizScores && quiz.id in course.quizScores
  )

  // Get incomplete quizzes
  const incompleteQuizzes = quizzes.filter(quiz =>
    !course?.quizScores || !(quiz.id in course.quizScores)
  )

  // Get quiz status badge
  const getQuizStatusBadge = (quiz: any) => {
    if (course?.quizScores && quiz.id in course.quizScores) {
      const score = course.quizScores[quiz.id]
      const scorePercentage = typeof score === 'number' ? score : 0

      if (scorePercentage >= 70) {
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            {scorePercentage}%
          </Badge>
        )
      } else {
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300">
            {scorePercentage}%
          </Badge>
        )
      }
    }

    return (
      <Badge variant="outline">
        <Clock className="mr-1 h-3 w-3" />
        Not Taken
      </Badge>
    )
  }

  if (quizzes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {classData ? `${classData.name} Quizzes` : 'Course Quizzes'}
          </CardTitle>
          <CardDescription>
            No quizzes found for this {classData ? 'class' : 'course'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <GraduationCap className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">
            There are no quizzes available at this time.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {classData ? `${classData.name} Quizzes` : 'Course Quizzes'}
        </CardTitle>
        <CardDescription>
          {completedQuizzes.length} completed and {incompleteQuizzes.length} pending quizzes
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {incompleteQuizzes.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Pending Quizzes</h3>
            {incompleteQuizzes.slice(0, 3).map((quiz) => (
              <div
                key={quiz.id}
                className="flex flex-wrap items-center gap-2 p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="bg-primary/10 p-1.5 rounded-md flex-shrink-0">
                    <GraduationCap className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <p className="font-medium text-sm truncate">{quiz.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      Module: {quiz.moduleTitle}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-auto">
                  {getQuizStatusBadge(quiz)}
                </div>
              </div>
            ))}

            {incompleteQuizzes.length > 3 && (
              <DyraneButton variant="ghost" size="sm" className="w-full" asChild>
                <Link href={`/courses/${courseSlug}`}>
                  View All Quizzes
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </DyraneButton>
            )}
          </div>
        )}

        {completedQuizzes.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Completed Quizzes</h3>
            {completedQuizzes.slice(0, 2).map((quiz) => (
              <div
                key={quiz.id}
                className="flex flex-wrap items-center gap-2 p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="bg-primary/10 p-1.5 rounded-md flex-shrink-0">
                    <GraduationCap className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <p className="font-medium text-sm truncate">{quiz.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      Module: {quiz.moduleTitle}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-auto">
                  {getQuizStatusBadge(quiz)}
                </div>
              </div>
            ))}

            {completedQuizzes.length > 2 && (
              <DyraneButton variant="ghost" size="sm" className="w-full" asChild>
                <Link href={`/courses/${courseSlug}`}>
                  View Completed Quizzes
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </DyraneButton>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <DyraneButton variant="outline" className="w-full" asChild>
          <Link href={`/courses/${courseSlug}`}>
            View All Quizzes
          </Link>
        </DyraneButton>
      </CardFooter>
    </Card>
  )
}
