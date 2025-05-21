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
  BarChart3, 
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { 
  selectGradeItemsByCourseId, 
  selectStudentGradesByCourseId 
} from '@/features/grades/store/grade-slice'
import { selectClassById } from '@/features/classes/store/classes-slice'
import { safeArray, safeFilter } from '@/lib/utils/safe-data'

interface ClassGradeLinkProps {
  courseId: string
  classId?: string
}

export function ClassGradeLink({ courseId, classId }: ClassGradeLinkProps) {
  const dispatch = useAppDispatch()
  
  // Get grade items for this course
  const gradeItems = useAppSelector(selectGradeItemsByCourseId(courseId))
  
  // Get student grades for this course
  const studentGrades = useAppSelector(selectStudentGradesByCourseId(courseId))
  
  // Get class data if classId is provided
  const classData = classId ? useAppSelector(selectClassById(classId)) : null
  
  // Filter grade items by classId if provided
  const filteredGradeItems = classId 
    ? gradeItems.filter(item => item.classId === classId)
    : gradeItems
  
  // Calculate overall grade
  const calculateOverallGrade = () => {
    if (studentGrades.length === 0 || filteredGradeItems.length === 0) return 0
    
    let totalPoints = 0
    let totalPossible = 0
    
    studentGrades.forEach(grade => {
      const gradeItem = filteredGradeItems.find(item => item.id === grade.gradeItemId)
      if (gradeItem) {
        totalPoints += grade.points
        totalPossible += gradeItem.pointsPossible
      }
    })
    
    return totalPossible > 0 ? Math.round((totalPoints / totalPossible) * 100) : 0
  }
  
  const overallGrade = calculateOverallGrade()
  
  // Get grade letter based on percentage
  const getGradeLetter = (percentage: number) => {
    if (percentage >= 90) return 'A'
    if (percentage >= 80) return 'B'
    if (percentage >= 70) return 'C'
    if (percentage >= 60) return 'D'
    return 'F'
  }
  
  // Get grade color based on percentage
  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-green-500'
    if (percentage >= 70) return 'text-amber-500'
    if (percentage >= 60) return 'text-amber-600'
    return 'text-red-500'
  }
  
  if (filteredGradeItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {classData ? `${classData.name} Grades` : 'Course Grades'}
          </CardTitle>
          <CardDescription>
            No grade items found for this {classData ? 'class' : 'course'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">
            There are no grade items available at this time.
          </p>
        </CardContent>
      </Card>
    )
  }
  
  // Group grade items by type
  const gradeItemsByType = filteredGradeItems.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = []
    }
    acc[item.type].push(item)
    return acc
  }, {} as Record<string, any[]>)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {classData ? `${classData.name} Grades` : 'Course Grades'}
        </CardTitle>
        <CardDescription>
          Your current grade: {overallGrade}% ({getGradeLetter(overallGrade)})
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Grade */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Grade</span>
            <span className={cn(
              "text-sm font-medium",
              getGradeColor(overallGrade)
            )}>
              {overallGrade}% ({getGradeLetter(overallGrade)})
            </span>
          </div>
          <Progress 
            value={overallGrade} 
            className={cn(
              "h-2",
              overallGrade >= 90 ? "bg-green-100" : 
              overallGrade >= 80 ? "bg-green-100" : 
              overallGrade >= 70 ? "bg-amber-100" : 
              overallGrade >= 60 ? "bg-amber-100" : 
              "bg-red-100"
            )}
          />
        </div>
        
        {/* Grade Items by Type */}
        {Object.entries(gradeItemsByType).map(([type, items]) => {
          // Calculate average for this type
          const typeGrades = items.map(item => {
            const grade = studentGrades.find(g => g.gradeItemId === item.id)
            return {
              item,
              grade,
              percentage: grade 
                ? Math.round((grade.points / item.pointsPossible) * 100) 
                : null
            }
          })
          
          const gradedItems = typeGrades.filter(g => g.percentage !== null)
          const typeAverage = gradedItems.length > 0
            ? Math.round(gradedItems.reduce((sum, g) => sum + (g.percentage || 0), 0) / gradedItems.length)
            : 0
          
          return (
            <div key={type} className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium capitalize">{type}s</h3>
                <span className={cn(
                  "text-xs font-medium",
                  getGradeColor(typeAverage)
                )}>
                  Average: {typeAverage}%
                </span>
              </div>
              
              {typeGrades.slice(0, 2).map(({ item, grade, percentage }) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-1.5 rounded-md">
                      <BarChart3 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.pointsPossible} points possible
                      </p>
                    </div>
                  </div>
                  {percentage !== null ? (
                    <span className={cn(
                      "text-sm font-medium",
                      getGradeColor(percentage)
                    )}>
                      {percentage}%
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not graded</span>
                  )}
                </div>
              ))}
              
              {items.length > 2 && (
                <DyraneButton variant="ghost" size="sm" className="w-full" asChild>
                  <Link href="/grades">
                    View All {type}s
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </DyraneButton>
              )}
            </div>
          )
        })}
      </CardContent>
      
      <CardFooter>
        <DyraneButton variant="outline" className="w-full" asChild>
          <Link href="/grades">
            View All Grades
          </Link>
        </DyraneButton>
      </CardFooter>
    </Card>
  )
}
