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
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { format, isAfter, parseISO } from 'date-fns'
import { selectAssignmentsByCourseId } from '@/features/assignments/store/assignment-slice'
import { selectClassById } from '@/features/classes/store/classes-slice'

interface ClassAssignmentLinkProps {
  courseId: string
  classId?: string
}

export function ClassAssignmentLink({ courseId, classId }: ClassAssignmentLinkProps) {
  const dispatch = useAppDispatch()
  
  // Get assignments for this course
  const assignments = useAppSelector(selectAssignmentsByCourseId(courseId))
  
  // Get class data if classId is provided
  const classData = classId ? useAppSelector(selectClassById(classId)) : null
  
  // Filter assignments by classId if provided
  const filteredAssignments = classId 
    ? assignments.filter(assignment => assignment.classId === classId)
    : assignments
  
  // Sort assignments by due date (most recent first)
  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    const dateA = new Date(a.dueDate)
    const dateB = new Date(b.dueDate)
    return dateA.getTime() - dateB.getTime()
  })
  
  // Get upcoming assignments (due date in the future)
  const upcomingAssignments = sortedAssignments.filter(assignment => 
    isAfter(parseISO(assignment.dueDate), new Date())
  )
  
  // Get past assignments (due date in the past)
  const pastAssignments = sortedAssignments.filter(assignment => 
    !isAfter(parseISO(assignment.dueDate), new Date())
  )
  
  // Get assignment status badge
  const getAssignmentStatusBadge = (assignment: any) => {
    const dueDate = parseISO(assignment.dueDate)
    const isOverdue = !isAfter(dueDate, new Date())
    
    if (assignment.submission) {
      if (assignment.submission.status === 'graded') {
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Graded
          </Badge>
        )
      } else if (assignment.submission.status === 'submitted') {
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            Submitted
          </Badge>
        )
      }
    }
    
    if (isOverdue) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-300">
          <AlertCircle className="mr-1 h-3 w-3" />
          Overdue
        </Badge>
      )
    }
    
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-300">
        <Clock className="mr-1 h-3 w-3" />
        Pending
      </Badge>
    )
  }
  
  if (sortedAssignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {classData ? `${classData.name} Assignments` : 'Course Assignments'}
          </CardTitle>
          <CardDescription>
            No assignments found for this {classData ? 'class' : 'course'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">
            There are no assignments available at this time.
          </p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {classData ? `${classData.name} Assignments` : 'Course Assignments'}
        </CardTitle>
        <CardDescription>
          {upcomingAssignments.length} upcoming and {pastAssignments.length} past assignments
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {upcomingAssignments.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Upcoming Assignments</h3>
            {upcomingAssignments.slice(0, 3).map((assignment) => (
              <div 
                key={assignment.id} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-1.5 rounded-md">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{assignment.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {format(parseISO(assignment.dueDate), 'PPP')}
                    </p>
                  </div>
                </div>
                {getAssignmentStatusBadge(assignment)}
              </div>
            ))}
            
            {upcomingAssignments.length > 3 && (
              <DyraneButton variant="ghost" size="sm" className="w-full" asChild>
                <Link href="/assignments">
                  View All Assignments
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </DyraneButton>
            )}
          </div>
        )}
        
        {pastAssignments.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Past Assignments</h3>
            {pastAssignments.slice(0, 2).map((assignment) => (
              <div 
                key={assignment.id} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-1.5 rounded-md">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{assignment.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {format(parseISO(assignment.dueDate), 'PPP')}
                    </p>
                  </div>
                </div>
                {getAssignmentStatusBadge(assignment)}
              </div>
            ))}
            
            {pastAssignments.length > 2 && (
              <DyraneButton variant="ghost" size="sm" className="w-full" asChild>
                <Link href="/assignments">
                  View Past Assignments
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </DyraneButton>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <DyraneButton variant="outline" className="w-full" asChild>
          <Link href="/assignments">
            View All Assignments
          </Link>
        </DyraneButton>
      </CardFooter>
    </Card>
  )
}
