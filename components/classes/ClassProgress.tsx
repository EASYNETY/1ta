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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, 
  FileText, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  BarChart3
} from 'lucide-react'
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { safeArray, safeFilter, safeLength } from '@/lib/utils/safe-data'
import { selectAuthCourseBySlug } from '@/features/auth-course/store/auth-course-slice'
import { selectAssignmentsByCourseId } from '@/features/assignments/store/assignment-slice'
import { selectGradeItemsByCourseId, selectStudentGradesByCourseId } from '@/features/grades/store/grade-slice'
import { selectClassById } from '@/features/classes/store/classes-slice'

interface ClassProgressProps {
  classId: string
  courseId: string
  courseSlug: string
}

export function ClassProgress({ classId, courseId, courseSlug }: ClassProgressProps) {
  const dispatch = useAppDispatch()
  const [activeTab, setActiveTab] = useState('overview')
  
  // Get data from Redux store
  const course = useAppSelector(selectAuthCourseBySlug(courseSlug))
  const classData = useAppSelector(selectClassById(classId))
  const assignments = useAppSelector(selectAssignmentsByCourseId(courseId))
  const gradeItems = useAppSelector(selectGradeItemsByCourseId(courseId))
  const studentGrades = useAppSelector(selectStudentGradesByCourseId(courseId))
  
  // Calculate progress metrics
  const totalLessons = course?.modules?.reduce((acc, module) => 
    acc + safeLength(module.lessons), 0) || 0
  
  const completedLessons = safeLength(course?.completedLessons)
  const lessonProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  
  const totalAssignments = safeLength(assignments)
  const completedAssignments = safeLength(safeFilter(assignments, 
    assignment => assignment.submission?.status === 'graded'))
  const assignmentProgress = totalAssignments > 0 
    ? Math.round((completedAssignments / totalAssignments) * 100) 
    : 0
  
  const totalQuizzes = course?.modules?.reduce((acc, module) => 
    acc + safeLength(safeFilter(module.lessons, lesson => lesson.type === 'quiz')), 0) || 0
  
  const completedQuizzes = Object.keys(course?.quizScores || {}).length
  const quizProgress = totalQuizzes > 0 ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0
  
  // Calculate overall progress (weighted average)
  const overallProgress = calculateOverallProgress(
    lessonProgress, 
    assignmentProgress, 
    quizProgress,
    totalLessons,
    totalAssignments,
    totalQuizzes
  )
  
  // Calculate grade metrics
  const totalGradeItems = safeLength(gradeItems)
  const gradedItems = safeLength(studentGrades)
  const averageGrade = calculateAverageGrade(studentGrades)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Progress</CardTitle>
        <CardDescription>
          Track your progress in this class across lessons, assignments, quizzes, and grades
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Lessons Progress */}
              <ProgressCard 
                title="Lessons" 
                icon={<BookOpen className="h-5 w-5" />}
                completed={completedLessons}
                total={totalLessons}
                percentage={lessonProgress}
                href={`/courses/${courseSlug}`}
                linkText="View Lessons"
              />
              
              {/* Assignments Progress */}
              <ProgressCard 
                title="Assignments" 
                icon={<FileText className="h-5 w-5" />}
                completed={completedAssignments}
                total={totalAssignments}
                percentage={assignmentProgress}
                href="/assignments"
                linkText="View Assignments"
              />
              
              {/* Quizzes Progress */}
              <ProgressCard 
                title="Quizzes" 
                icon={<GraduationCap className="h-5 w-5" />}
                completed={completedQuizzes}
                total={totalQuizzes}
                percentage={quizProgress}
                href={`/courses/${courseSlug}`}
                linkText="View Quizzes"
              />
              
              {/* Grades Overview */}
              <ProgressCard 
                title="Grades" 
                icon={<BarChart3 className="h-5 w-5" />}
                completed={gradedItems}
                total={totalGradeItems}
                percentage={averageGrade}
                href="/grades"
                linkText="View Grades"
                isGrade={true}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="lessons" className="space-y-4">
            <LessonsProgressView 
              modules={course?.modules || []} 
              completedLessons={course?.completedLessons || []}
              courseSlug={courseSlug}
            />
          </TabsContent>
          
          <TabsContent value="assignments" className="space-y-4">
            <AssignmentsProgressView 
              assignments={assignments} 
              classId={classId}
            />
          </TabsContent>
          
          <TabsContent value="grades" className="space-y-4">
            <GradesProgressView 
              gradeItems={gradeItems}
              studentGrades={studentGrades}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Helper function to calculate overall progress
function calculateOverallProgress(
  lessonProgress: number,
  assignmentProgress: number,
  quizProgress: number,
  totalLessons: number,
  totalAssignments: number,
  totalQuizzes: number
): number {
  const totalWeight = totalLessons + totalAssignments + totalQuizzes
  
  if (totalWeight === 0) return 0
  
  const weightedProgress = 
    (lessonProgress * totalLessons + 
     assignmentProgress * totalAssignments + 
     quizProgress * totalQuizzes) / totalWeight
  
  return Math.round(weightedProgress)
}

// Helper function to calculate average grade
function calculateAverageGrade(grades: any[]): number {
  if (grades.length === 0) return 0
  
  const totalPoints = grades.reduce((sum, grade) => sum + grade.points, 0)
  const totalPossible = grades.reduce((sum, grade) => {
    const gradeItem = grade.gradeItem || { pointsPossible: 100 }
    return sum + gradeItem.pointsPossible
  }, 0)
  
  return totalPossible > 0 ? Math.round((totalPoints / totalPossible) * 100) : 0
}

// Progress Card Component
function ProgressCard({ 
  title, 
  icon, 
  completed, 
  total, 
  percentage, 
  href, 
  linkText,
  isGrade = false
}: { 
  title: string
  icon: React.ReactNode
  completed: number
  total: number
  percentage: number
  href: string
  linkText: string
  isGrade?: boolean
}) {
  return (
    <Card className="border-muted/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-md">
              {icon}
            </div>
            {title}
          </CardTitle>
          <span className={cn(
            "text-sm font-medium",
            percentage >= 70 ? "text-green-500" : 
            percentage >= 40 ? "text-amber-500" : 
            "text-red-500"
          )}>
            {isGrade ? `${percentage}%` : `${completed}/${total}`}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <Progress value={percentage} className="h-1.5" />
      </CardContent>
      <CardFooter>
        <DyraneButton variant="ghost" size="sm" className="w-full" asChild>
          <Link href={href}>{linkText}</Link>
        </DyraneButton>
      </CardFooter>
    </Card>
  )
}

// Lessons Progress View
function LessonsProgressView({ 
  modules, 
  completedLessons,
  courseSlug
}: { 
  modules: any[]
  completedLessons: string[]
  courseSlug: string
}) {
  return (
    <div className="space-y-4">
      {modules.map((module, index) => (
        <Card key={module.id || index} className="border-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{module.title}</CardTitle>
            <CardDescription>
              {safeLength(safeFilter(module.lessons, 
                lesson => completedLessons.includes(lesson.id)))} of {safeLength(module.lessons)} lessons completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {safeArray(module.lessons).map((lesson, lessonIndex) => (
                <li key={lesson.id || lessonIndex} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {completedLessons.includes(lesson.id) ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{lesson.title}</span>
                    {lesson.type === 'quiz' && (
                      <span className="text-xs bg-primary/10 px-1.5 py-0.5 rounded">Quiz</span>
                    )}
                  </div>
                  <Link 
                    href={`/courses/${courseSlug}?module=${module.id}&lesson=${lesson.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    {completedLessons.includes(lesson.id) ? 'Review' : 'Start'}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Assignments Progress View
function AssignmentsProgressView({ assignments, classId }: { assignments: any[], classId: string }) {
  // Filter assignments by classId if needed
  const classAssignments = classId 
    ? safeFilter(assignments, assignment => assignment.classId === classId)
    : assignments
  
  return (
    <div className="space-y-4">
      {classAssignments.length > 0 ? (
        classAssignments.map((assignment, index) => (
          <Card key={assignment.id || index} className="border-muted/50">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{assignment.title}</CardTitle>
                <AssignmentStatusBadge status={
                  assignment.submission?.status || 
                  (new Date(assignment.dueDate) < new Date() ? 'overdue' : 'pending')
                } />
              </div>
              <CardDescription>
                Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <DyraneButton variant="ghost" size="sm" className="w-full" asChild>
                <Link href={`/assignments/${assignment.id}`}>
                  {assignment.submission ? 'View Submission' : 'Submit Assignment'}
                </Link>
              </DyraneButton>
            </CardFooter>
          </Card>
        ))
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>No assignments found for this class</p>
        </div>
      )}
    </div>
  )
}

// Grades Progress View
function GradesProgressView({ gradeItems, studentGrades }: { gradeItems: any[], studentGrades: any[] }) {
  return (
    <div className="space-y-4">
      {gradeItems.length > 0 ? (
        gradeItems.map((gradeItem, index) => {
          const studentGrade = studentGrades.find(grade => grade.gradeItemId === gradeItem.id)
          const percentage = studentGrade 
            ? Math.round((studentGrade.points / gradeItem.pointsPossible) * 100)
            : null
          
          return (
            <Card key={gradeItem.id || index} className="border-muted/50">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{gradeItem.title}</CardTitle>
                  {percentage !== null ? (
                    <span className={cn(
                      "text-sm font-medium",
                      percentage >= 70 ? "text-green-500" : 
                      percentage >= 40 ? "text-amber-500" : 
                      "text-red-500"
                    )}>
                      {percentage}%
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not graded</span>
                  )}
                </div>
                <CardDescription>
                  {gradeItem.type} • {gradeItem.pointsPossible} points possible
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                {studentGrade ? (
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span>Your score:</span>
                      <span>{studentGrade.points}/{gradeItem.pointsPossible}</span>
                    </div>
                    <Progress value={percentage || 0} className="h-1.5" />
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic">
                    No grade recorded
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>No grade items found for this class</p>
        </div>
      )}
    </div>
  )
}

// Assignment Status Badge
function AssignmentStatusBadge({ status }: { status: string }) {
  const getStatusConfig = () => {
    switch (status) {
      case 'submitted':
        return { label: 'Submitted', className: 'bg-blue-100 text-blue-800 border-blue-300' }
      case 'graded':
        return { label: 'Graded', className: 'bg-green-100 text-green-800 border-green-300' }
      case 'overdue':
        return { label: 'Overdue', className: 'bg-red-100 text-red-800 border-red-300' }
      case 'pending':
        return { label: 'Pending', className: 'bg-amber-100 text-amber-800 border-amber-300' }
      default:
        return { label: status, className: 'bg-gray-100 text-gray-800 border-gray-300' }
    }
  }
  
  const { label, className } = getStatusConfig()
  
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-xs font-medium border",
      className
    )}>
      {label}
    </span>
  )
}
