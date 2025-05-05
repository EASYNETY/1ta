// app/(authenticated)/grades/[gradeItemId]/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchGradeItemById,
  fetchStudentGrades,
  selectCurrentGradeItem,
  selectStudentGrades,
  selectGradeStatus,
  selectGradeError,
  clearGradeError,
  clearCurrentGradeItem,
} from "@/features/grades/store/grade-slice"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Edit, FileText, Home, ArrowLeft } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { format, parseISO, isValid } from "date-fns"
import type { StudentGradeItemView, TeacherGradeItemView } from "@/features/grades/types/grade-types"

// Helper: Format Date
const formatDateDisplay = (dateString?: string | null, formatString = "MMMM d, yyyy 'at' h:mm a") => {
  if (!dateString) return "N/A"
  try {
    const date = parseISO(dateString)
    return isValid(date) ? format(date, formatString) : "Invalid Date"
  } catch {
    return "Invalid Date"
  }
}

// Helper: Get color class based on grade
const getGradeColorClass = (percentage: number) => {
  if (percentage >= 90) return "text-green-600 dark:text-green-400"
  if (percentage >= 80) return "text-blue-600 dark:text-blue-400"
  if (percentage >= 70) return "text-yellow-600 dark:text-yellow-400"
  if (percentage >= 60) return "text-orange-600 dark:text-orange-400"
  return "text-red-600 dark:text-red-400"
}

// Helper: Render type badge with appropriate color
const renderTypeBadge = (type: string) => {
  switch (type) {
    case "assignment":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          Assignment
        </Badge>
      )
    case "quiz":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          Quiz
        </Badge>
      )
    case "exam":
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
          Exam
        </Badge>
      )
    case "project":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          Project
        </Badge>
      )
    case "participation":
      return (
        <Badge variant="outline" className="bg-pink-50 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300">
          Participation
        </Badge>
      )
    default:
      return <Badge variant="outline">Other</Badge>
  }
}

export default function GradeItemDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const gradeItemId = params.gradeItemId as string
  const { user, isInitialized } = useAppSelector((state) => state.auth)
  const currentGradeItem = useAppSelector(selectCurrentGradeItem)
  const studentGrades = useAppSelector(selectStudentGrades)
  const status = useAppSelector(selectGradeStatus)
  const error = useAppSelector(selectGradeError)
  const [activeTab, setActiveTab] = useState("details")

  const justGraded = searchParams.get("graded") === "true"

  // Fetch grade item details
  useEffect(() => {
    if (gradeItemId && user?.id && user?.role && isInitialized) {
      dispatch(clearGradeError())
      dispatch(clearCurrentGradeItem())
      dispatch(
        fetchGradeItemById({
          gradeItemId,
          role: user.role,
          userId: user.id,
        }),
      )

      // Fetch student grades if teacher/admin
      if (user.role === "teacher" || user.role === "admin") {
        dispatch(fetchStudentGrades(gradeItemId))
      }
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentGradeItem())
    }
  }, [dispatch, gradeItemId, user?.id, user?.role, isInitialized])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !user) {
      router.push("/login")
    }
  }, [isInitialized, user, router])

  // --- Derived State & Type Guards ---
  const isLoading = status === "loading"
  const isFetchFailed = status === "failed"

  // Safely determine views
  const isStudentView = currentGradeItem && "grade" in currentGradeItem
  const isTeacherView = currentGradeItem && "totalGraded" in currentGradeItem

  const studentGradeItem = isStudentView ? (currentGradeItem as StudentGradeItemView) : null
  const teacherGradeItem = isTeacherView ? (currentGradeItem as TeacherGradeItemView) : null

  // --- Loading State ---
  if (!isInitialized || (isLoading && !currentGradeItem)) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-3/4 max-w-lg" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-6 w-1/2 max-w-sm" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  // --- Not Found/Error State ---
  if (!isLoading && !currentGradeItem) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Grade item not found or could not be loaded."}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!currentGradeItem) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Grade item not found.</AlertDescription>
        </Alert>
      </div>
    )
  }

  // --- Render Main Content ---
  const formattedDueDate = formatDateDisplay(currentGradeItem.dueDate)

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/grades">Grades</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentGradeItem.title ?? "Details"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{currentGradeItem.title ?? "Grade Item"}</h1>
          <p className="text-muted-foreground">{currentGradeItem.courseTitle || "Course not specified"}</p>
        </div>
        {/* Show Edit button only to teachers/admins */}
        {(user?.role === "teacher" || user?.role === "admin") && (
          <Button asChild size="sm">
            <Link href={`/grades/${gradeItemId}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit Grade Item
            </Link>
          </Button>
        )}
      </div>

      {/* Success messages */}
      {justGraded && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-800 dark:text-green-300">Grading Successful</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-400">
            The grade was successfully saved.
          </AlertDescription>
        </Alert>
      )}

      {/* Main content Tabs */}
      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          {/* Show "My Grade" tab only if student AND there IS a grade */}
          {studentGradeItem?.grade && <TabsTrigger value="mygrade">My Grade</TabsTrigger>}
          {/* Show "Student Grades" tab only for teacher/admin view */}
          {teacherGradeItem && (
            <TabsTrigger value="grades">Student Grades ({teacherGradeItem.totalGraded ?? 0})</TabsTrigger>
          )}
        </TabsList>

        {/* Details Tab Content */}
        <TabsContent value="details" className="mt-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle>Grade Item Details</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  {renderTypeBadge(currentGradeItem.type)}
                  <Badge variant="outline">{currentGradeItem.pointsPossible} Points</Badge>
                  <Badge variant="outline">Weight: {(currentGradeItem.weight * 100).toFixed(0)}%</Badge>
                </div>
              </div>
              {currentGradeItem.dueDate && <CardDescription>Due: {formattedDueDate}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Description */}
              <div className="prose dark:prose-invert max-w-none text-sm">
                {currentGradeItem.description ? (
                  <div className="whitespace-pre-wrap">{currentGradeItem.description}</div>
                ) : (
                  <p className="italic text-muted-foreground">No description provided.</p>
                )}
              </div>

              {/* Grade Display (if student and graded) */}
              {studentGradeItem?.grade && (
                <div className="mt-6 rounded-lg border p-4 bg-muted/30">
                  <h3 className="text-lg font-semibold mb-2">Your Grade</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      Score: {studentGradeItem.grade.points} / {currentGradeItem.pointsPossible}
                    </span>
                    {/* Calculate percentage */}
                    {typeof studentGradeItem.grade.points === "number" &&
                      typeof currentGradeItem.pointsPossible === "number" &&
                      currentGradeItem.pointsPossible > 0 && (
                        <span
                          className={`font-medium ${getGradeColorClass((studentGradeItem.grade.points / currentGradeItem.pointsPossible) * 100)}`}
                        >
                          {((studentGradeItem.grade.points / currentGradeItem.pointsPossible) * 100).toFixed(1)}%
                          {studentGradeItem.grade.letterGrade && ` (${studentGradeItem.grade.letterGrade})`}
                        </span>
                      )}
                  </div>
                  <div className="mt-2">
                    <Progress
                      value={(studentGradeItem.grade.points / currentGradeItem.pointsPossible) * 100}
                      className="h-2"
                    />
                  </div>
                  {studentGradeItem.grade.feedback && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-1 text-sm">Feedback:</h4>
                      <p className="text-sm whitespace-pre-wrap">{studentGradeItem.grade.feedback}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Statistics (if teacher) */}
              {teacherGradeItem && (
                <div className="mt-6 rounded-lg border p-4 bg-muted/30">
                  <h3 className="text-lg font-semibold mb-2">Grade Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 rounded-md bg-background">
                      <p className="text-sm text-muted-foreground">Average Score</p>
                      <p className="text-xl font-semibold">{teacherGradeItem.averageScore.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">
                        {((teacherGradeItem.averageScore / teacherGradeItem.pointsPossible) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 rounded-md bg-background">
                      <p className="text-sm text-muted-foreground">Highest Score</p>
                      <p className="text-xl font-semibold">{teacherGradeItem.highestScore.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">
                        {((teacherGradeItem.highestScore / teacherGradeItem.pointsPossible) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 rounded-md bg-background">
                      <p className="text-sm text-muted-foreground">Lowest Score</p>
                      <p className="text-xl font-semibold">{teacherGradeItem.lowestScore.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">
                        {((teacherGradeItem.lowestScore / teacherGradeItem.pointsPossible) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/grades">Back to Grades</Link>
              </Button>
              {(user?.role === "teacher" || user?.role === "admin") && (
                <Button asChild>
                  <Link href={`/grades/${gradeItemId}/grade-students`}>Grade Students</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        {/* My Grade Tab Content (Student) */}
        {studentGradeItem?.grade && (
          <TabsContent value="mygrade" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Your Grade</CardTitle>
                <CardDescription>Graded: {formatDateDisplay(studentGradeItem.grade.gradedAt)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{currentGradeItem.title}</h3>
                      <p className="text-sm text-muted-foreground">{currentGradeItem.courseTitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderTypeBadge(currentGradeItem.type)}
                      <Badge variant="outline">Weight: {(currentGradeItem.weight * 100).toFixed(0)}%</Badge>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Score</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          {studentGradeItem.grade.points} / {currentGradeItem.pointsPossible}
                        </span>
                        <span
                          className={`text-xl font-bold ${getGradeColorClass((studentGradeItem.grade.points / currentGradeItem.pointsPossible) * 100)}`}
                        >
                          {((studentGradeItem.grade.points / currentGradeItem.pointsPossible) * 100).toFixed(1)}%
                          {studentGradeItem.grade.letterGrade && ` (${studentGradeItem.grade.letterGrade})`}
                        </span>
                      </div>
                      <Progress
                        value={(studentGradeItem.grade.points / currentGradeItem.pointsPossible) * 100}
                        className="h-2 mt-2"
                      />
                    </div>

                    {studentGradeItem.grade.feedback && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Feedback</h4>
                        <div className="p-4 rounded-md bg-muted">
                          <p className="whitespace-pre-wrap">{studentGradeItem.grade.feedback}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => setActiveTab("details")}>
                  Back to Details
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        )}

        {/* Student Grades Tab (Teacher/Admin) */}
        {teacherGradeItem && (
          <TabsContent value="grades" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Student Grades</CardTitle>
                <CardDescription>
                  {teacherGradeItem.totalGraded} of {teacherGradeItem.totalStudentsInClass || 0} students graded
                </CardDescription>
              </CardHeader>
              <CardContent>
                {studentGrades.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold">No grades yet</h3>
                    <p className="text-muted-foreground mt-2 mb-6">No students have been graded for this item yet.</p>
                    <Button asChild>
                      <Link href={`/grades/${gradeItemId}/grade-students`}>Grade Students</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Percentage</TableHead>
                          {currentGradeItem.gradeScale === "letter" && <TableHead>Letter Grade</TableHead>}
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentGrades.map((grade) => (
                          <TableRow key={grade.id}>
                            <TableCell className="font-medium">{grade.studentName}</TableCell>
                            <TableCell>
                              {grade.points}/{currentGradeItem.pointsPossible}
                            </TableCell>
                            <TableCell className={getGradeColorClass(grade.percentage || 0)}>
                              {grade.percentage?.toFixed(1)}%
                            </TableCell>
                            {currentGradeItem.gradeScale === "letter" && <TableCell>{grade.letterGrade}</TableCell>}
                            <TableCell>
                              <Badge variant={grade.status === "published" ? "default" : "outline"}>
                                {grade.status === "published" ? (
                                  <>
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Published
                                  </>
                                ) : (
                                  "Draft"
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/grades/${gradeItemId}/grade/${grade.studentId}`}>Edit Grade</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("details")}>
                  Back to Details
                </Button>
                <Button asChild>
                  <Link href={`/grades/${gradeItemId}/grade-students`}>Grade Students</Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
