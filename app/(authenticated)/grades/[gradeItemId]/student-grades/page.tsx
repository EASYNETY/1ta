// app/(authenticated)/grades/[gradeItemId]/student-grades/page.tsx

"use client"
import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
    fetchGradeItemById,
    fetchStudentGrades,
    selectCurrentGradeItem,
    selectStudentGrades,
    selectGradeStatus,
    selectGradeError,
    clearCurrentGradeItem,
} from "@/features/grades/store/grade-slice"
import { PageHeader } from "@/components/layout/auth/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowLeft, Download, CheckCircle, FileEdit } from "lucide-react"
import { format, parseISO } from "date-fns"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"

export default function StudentGradesPage() {
    const params = useParams()
    const router = useRouter()
    const dispatch = useAppDispatch()
    const gradeItemId = params.gradeItemId as string
    const gradeItem = useAppSelector(selectCurrentGradeItem)
    const studentGrades = useAppSelector(selectStudentGrades)
    const status = useAppSelector(selectGradeStatus)
    const error = useAppSelector(selectGradeError)
    const { user } = useAppSelector((state) => state.auth)

    useEffect(() => {
        if (gradeItemId && user?.role) {
            dispatch(
                fetchGradeItemById({
                    gradeItemId,
                    role: user.role,
                    userId: user.id,
                }),
            )

            if (user.role === "teacher" || user.role === "admin") {
                dispatch(fetchStudentGrades(gradeItemId))
            }
        }

        return () => {
            dispatch(clearCurrentGradeItem())
        }
    }, [dispatch, gradeItemId, user?.id, user?.role])

    // Check if user has permission to view
    if (user?.role !== "teacher" && user?.role !== "admin") {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>You do not have permission to view student grades.</AlertDescription>
            </Alert>
        )
    }

    // Loading state
    if (status === "loading") {
        return (
            <div className="space-y-6">
                <PageHeader heading={<Skeleton className="h-8 w-64" />} subheading={<Skeleton className="h-5 w-48" />} />
                <Skeleton className="h-[600px] w-full rounded-lg" />
            </div>
        )
    }

    // Error state
    if (status === "failed") {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error || "Failed to load grade item. Please try again."}</AlertDescription>
            </Alert>
        )
    }

    // No grade item found
    if (!gradeItem) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Not Found</AlertTitle>
                <AlertDescription>The requested grade item could not be found.</AlertDescription>
            </Alert>
        )
    }

    // Calculate statistics
    const totalStudents = studentGrades.length
    const gradedStudents = studentGrades.filter((grade) => grade.status === "published").length
    const averageScore =
        studentGrades.length > 0 ? studentGrades.reduce((sum, grade) => sum + grade.points, 0) / totalStudents : 0
    const highestScore = studentGrades.length > 0 ? Math.max(...studentGrades.map((grade) => grade.points)) : 0
    const lowestScore = studentGrades.length > 0 ? Math.min(...studentGrades.map((grade) => grade.points)) : 0

    // Format date
    const formatDate = (dateString: string) => {
        try {
            return format(parseISO(dateString), "MMM d, yyyy 'at' h:mm a")
        } catch {
            return "Invalid date"
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                heading="Student Grades"
                subheading={`View all grades for ${gradeItem.title}`}
                actions={
                    <div className="flex gap-2 flex-wrap">
                        <DyraneButton variant="outline" onClick={() => router.push(`/grades/${gradeItemId}`)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Details
                        </DyraneButton>
                        <DyraneButton onClick={() => router.push(`/grades/${gradeItemId}/grade-students`)}>
                            <FileEdit className="mr-2 h-4 w-4" />
                            Grade Students
                        </DyraneButton>
                        <DyraneButton variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export Grades
                        </DyraneButton>
                    </div>
                }
            />

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStudents}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Graded</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {gradedStudents} / {totalStudents}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {averageScore.toFixed(1)} / {gradeItem.pointsPossible}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Score Range</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {lowestScore} - {highestScore}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Grades Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Student Grades</CardTitle>
                    <CardDescription>
                        {gradeItem.courseTitle} • {gradeItem.pointsPossible} points possible
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Percentage</TableHead>
                                    <TableHead>Letter Grade</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Graded On</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {studentGrades.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No grades have been assigned yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    studentGrades.map((grade) => (
                                        <TableRow key={grade.id}>
                                            <TableCell className="font-medium">{grade.studentName}</TableCell>
                                            <TableCell>
                                                {grade.points}/{gradeItem.pointsPossible}
                                            </TableCell>
                                            <TableCell>{grade.percentage?.toFixed(1)}%</TableCell>
                                            <TableCell>{grade.letterGrade || "N/A"}</TableCell>
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
                                            <TableCell>{formatDate(grade.gradedAt)}</TableCell>
                                            <TableCell className="text-right">
                                                <DyraneButton
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/grades/${gradeItemId}/student/${grade.studentId}`)}
                                                >
                                                    View Details
                                                </DyraneButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
