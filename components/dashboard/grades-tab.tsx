// components/dashboard/grades-tab.tsx

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, BookOpen, TrendingUp, Award, AlertCircle, Settings } from "lucide-react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Import from grades slice
import {
  fetchGradeItems,
  fetchCourseGrades,
  selectStudentGradeItems,
  selectCourseGrades,
  selectGradeStatus,
  selectGradeError,
  clearGradeError,
} from "@/features/grades/store/grade-slice"

export function GradesTab() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<string>("")

  // Get data from store
  const studentGradeItems = useAppSelector(selectStudentGradeItems)
  const courseGrades = useAppSelector(selectCourseGrades)
  const status = useAppSelector(selectGradeStatus)
  const error = useAppSelector(selectGradeError)

  // Fetch data on component mount
  useEffect(() => {
    if (user?.id && user.role) {
      console.log(`GradesTab: Fetching for role ${user.role}`)
      dispatch(clearGradeError())

      // Fetch grade items for student
      if (user.role === "student") {
        dispatch(
          fetchGradeItems({
            role: user.role,
            userId: user.id,
          }),
        )

        // Fetch course grades
        dispatch(
          fetchCourseGrades({
            courseId: selectedCourse || "all",
            studentId: user.id,
          }),
        )
      }

      // For teachers/admins, we'd fetch different data
      // This would be implemented in a real app
    }
  }, [dispatch, user?.id, user?.role, selectedCourse])

  // Get available courses from grade items
  const availableCourses = Array.from(new Set(studentGradeItems.map((item) => item.courseId))).map((courseId) => {
    const item = studentGradeItems.find((item) => item.courseId === courseId)
    return {
      id: courseId,
      title: item?.courseTitle || `Course ${courseId}`,
    }
  })

  // Set initial selected course if none selected
  useEffect(() => {
    if (availableCourses.length > 0 && !selectedCourse) {
      setSelectedCourse(availableCourses[0].id)
    }
  }, [availableCourses, selectedCourse])

  // Filter grade items by course and search query
  const filteredGradeItems = studentGradeItems.filter(
    (item) =>
      (selectedCourse ? item.courseId === selectedCourse : true) &&
      item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Get current course grade
  const currentCourseGrade = courseGrades.find(
    (grade) => grade.courseId === selectedCourse && grade.studentId === user?.id,
  )

  // Get letter grade color class
  const getGradeColorClass = (percentage: number) => {
    if (percentage >= 90) return "text-green-600 dark:text-green-400"
    if (percentage >= 80) return "text-blue-600 dark:text-blue-400"
    if (percentage >= 70) return "text-yellow-600 dark:text-yellow-400"
    if (percentage >= 60) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  // Get letter grade
  const getLetterGrade = (percentage: number) => {
    if (percentage >= 90) return "A"
    if (percentage >= 80) return "B"
    if (percentage >= 70) return "C"
    if (percentage >= 60) return "D"
    return "F"
  }

  if (!user) return null

  // Loading state
  if (status === "loading") {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-[100px] w-full rounded-lg" />
        <Skeleton className="h-[100px] w-full rounded-lg" />
        <Skeleton className="h-[100px] w-full rounded-lg" />
      </div>
    )
  }

  // Error state
  if (status === "failed") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Grades</AlertTitle>
        <AlertDescription>{error || "Could not load grades. Please try again later."}</AlertDescription>
      </Alert>
    )
  }

  // Only show for students
  if (user.role !== "student") {
    return (
      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Grades Management</CardTitle>
            <CardDescription>Access the grades management system to view and manage student grades.</CardDescription>
          </CardHeader>
          <CardContent>
            <DyraneButton asChild>
              <Link href="/grades">
                <Settings className="mr-2 h-4 w-4" />
                Manage Grades
              </Link>
            </DyraneButton>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Course Selection and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {availableCourses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search grades..."
            className="pl-8 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DyraneButton asChild size="sm">
          <Link href="/grades">View All Grades</Link>
        </DyraneButton>
      </div>

      {/* Overall Grade Card */}
      {currentCourseGrade && (
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-primary/10 rounded-full p-4">
                <Award className="h-10 w-10 text-primary" />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-xl font-semibold mb-1">Course Grade: {currentCourseGrade.courseTitle}</h2>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span className="text-3xl font-bold">{currentCourseGrade.overallPercentage.toFixed(1)}%</span>
                  <span className={`text-2xl font-bold ${getGradeColorClass(currentCourseGrade.overallPercentage)}`}>
                    {currentCourseGrade.letterGrade || getLetterGrade(currentCourseGrade.overallPercentage)}
                  </span>
                </div>
              </div>
              <div className="flex-1 w-full md:w-auto">
                <div className="h-3 w-full rounded-full bg-primary/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${currentCourseGrade.overallPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grade Items List */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>My Grades</CardTitle>
          <CardDescription>View your grades for assignments, quizzes, and exams.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredGradeItems.length > 0 ? (
              filteredGradeItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg hover:shadow-sm transition-shadow bg-card/5 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Left Side: Details */}
                  <div className="flex items-start gap-3 flex-grow min-w-0">
                    <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0 mt-1">
                      {item.type === "quiz" ? (
                        <TrendingUp className="h-5 w-5 text-primary" />
                      ) : item.type === "exam" ? (
                        <Award className="h-5 w-5 text-primary" />
                      ) : (
                        <BookOpen className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{item.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{item.courseTitle}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs">
                        <Badge
                          variant="outline"
                          className={cn(
                            "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-200",
                            item.type === "quiz" &&
                            "border-purple-300 bg-purple-50 text-purple-800 dark:border-purple-700 dark:bg-purple-900/50 dark:text-purple-200",
                            item.type === "exam" &&
                            "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-200",
                          )}
                        >
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </Badge>

                        {item.grade ? (
                          <span className={cn("font-medium", getGradeColorClass(item.grade.percentage || 0))}>
                            {item.grade.points}/{item.pointsPossible} ({item.grade.percentage?.toFixed(1)}%)
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Not graded yet</span>
                        )}

                        {item.dueDate && (
                          <span className="text-muted-foreground">
                            Due: {format(parseISO(item.dueDate), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Grade and Action */}
                  <div className="flex-shrink-0 self-end sm:self-center">
                    {item.grade ? (
                      <div className="text-right">
                        <span className={cn("text-lg font-bold", getGradeColorClass(item.grade.percentage || 0))}>
                          {item.grade.letterGrade || getLetterGrade(item.grade.percentage || 0)}
                        </span>
                        <DyraneButton variant="outline" size="sm" asChild className="ml-4">
                          <Link href={`/grades/${item.id}`}>View Details</Link>
                        </DyraneButton>
                      </div>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-200"
                      >
                        Pending
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Award className="mx-auto h-10 w-10 mb-3 text-muted-foreground/50" />
                {searchQuery ? "No grades match your search." : "No grades found for this course."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
