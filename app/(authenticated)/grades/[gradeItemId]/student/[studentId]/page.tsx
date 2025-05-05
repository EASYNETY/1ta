// app/(authenticated)/grades/[gradeItemId]/student/[studentId]/page.tsx

"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
    fetchGradeItemById,
    fetchStudentGradeById,
    updateGrade,
    selectCurrentGradeItem,
    selectCurrentGrade,
    selectGradeStatus,
    selectGradeOperationStatus,
    selectGradeError,
    clearCurrentGradeItem,
    clearCurrentGrade,
} from "@/features/grades/store/grade-slice"
import { PageHeader } from "@/components/layout/auth/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AlertCircle, ArrowLeft, Loader2, Save } from "lucide-react"
import { format, parseISO } from "date-fns"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"

export default function StudentGradeDetailPage() {
    const params = useParams()
    const router = useRouter()
    const dispatch = useAppDispatch()
    const gradeItemId = params.gradeItemId as string
    const studentId = params.studentId as string
    const gradeItem = useAppSelector(selectCurrentGradeItem)
    const grade = useAppSelector(selectCurrentGrade)
    const status = useAppSelector(selectGradeStatus)
    const operationStatus = useAppSelector(selectGradeOperationStatus)
    const error = useAppSelector(selectGradeError)
    const { user } = useAppSelector((state) => state.auth)

    const [points, setPoints] = useState(0)
    const [feedback, setFeedback] = useState("")
    const [isPublished, setIsPublished] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        if (gradeItemId && studentId && user?.role) {
            dispatch(
                fetchGradeItemById({
                    gradeItemId,
                    role: user.role,
                    userId: user.id,
                }),
            )

            // Fetch the specific grade if it exists
            // In a real app, you'd have an API endpoint to get a specific grade
            // Here we're simulating by finding the grade in the mock data
            if (grade?.id) {
                dispatch(fetchStudentGradeById(grade.id))
            }
        }

        return () => {
            dispatch(clearCurrentGradeItem())
            dispatch(clearCurrentGrade())
        }
    }, [dispatch, gradeItemId, studentId, user?.id, user?.role, grade?.id])

    // Initialize form when grade is loaded
    useEffect(() => {
        if (grade) {
            setPoints(grade.points)
            setFeedback(grade.feedback || "")
            setIsPublished(grade.status === "published")
        }
    }, [grade])

    // Check if user has permission to view/edit
    if (user?.role !== "teacher" && user?.role !== "admin") {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>You do not have permission to view or edit student grades.</AlertDescription>
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
                <AlertDescription>{error || "Failed to load grade information. Please try again."}</AlertDescription>
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

    // Format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return "Not graded yet"
        try {
            return format(parseISO(dateString), "MMM d, yyyy 'at' h:mm a")
        } catch {
            return "Invalid date"
        }
    }

    // Handle save
    const handleSave = async () => {
        if (!grade?.id || !user?.id) return

        try {
            await dispatch(
                updateGrade({
                    gradeId: grade.id,
                    grade: {
                        points,
                        feedback,
                        status: isPublished ? "published" : "draft",
                    },
                }),
            ).unwrap()

            setIsEditing(false)
        } catch (error) {
            console.error("Failed to update grade:", error)
        }
    }

    // Handle cancel edit
    const handleCancelEdit = () => {
        if (grade) {
            setPoints(grade.points)
            setFeedback(grade.feedback || "")
            setIsPublished(grade.status === "published")
        }
        setIsEditing(false)
    }

    // Calculate percentage and letter grade
    const percentage = (points / gradeItem.pointsPossible) * 100
    const getLetterGrade = (percentage: number): string => {
        if (percentage >= 97) return "A+"
        if (percentage >= 93) return "A"
        if (percentage >= 90) return "A-"
        if (percentage >= 87) return "B+"
        if (percentage >= 83) return "B"
        if (percentage >= 80) return "B-"
        if (percentage >= 77) return "C+"
        if (percentage >= 73) return "C"
        if (percentage >= 70) return "C-"
        if (percentage >= 67) return "D+"
        if (percentage >= 63) return "D"
        if (percentage >= 60) return "D-"
        return "F"
    }
    const letterGrade = getLetterGrade(percentage)

    return (
        <div className="space-y-6">
            <PageHeader
                heading="Student Grade Details"
                subheading={`${gradeItem.title} - Student: ${grade?.studentName || studentId}`}
                actions={
                    <DyraneButton variant="outline" onClick={() => router.push(`/grades/${gradeItemId}/student-grades`)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to All Grades
                    </DyraneButton>
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>Grade Information</CardTitle>
                    <CardDescription>
                        {gradeItem.courseTitle} • {gradeItem.pointsPossible} points possible
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Grade Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Points</h3>
                            {isEditing ? (
                                <Input
                                    type="number"
                                    min={0}
                                    max={gradeItem.pointsPossible}
                                    value={points}
                                    onChange={(e) => setPoints(Number(e.target.value))}
                                />
                            ) : (
                                <p className="text-2xl font-bold">
                                    {grade?.points || 0}/{gradeItem.pointsPossible}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Percentage</h3>
                            <p className="text-2xl font-bold">{percentage.toFixed(1)}%</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Letter Grade</h3>
                            <p className="text-2xl font-bold">{letterGrade}</p>
                        </div>
                    </div>

                    {/* Feedback */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Feedback</h3>
                        {isEditing ? (
                            <Textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Provide feedback to the student..."
                                className="min-h-[150px]"
                            />
                        ) : (
                            <div className="p-4 rounded-md border bg-muted/40 min-h-[100px]">
                                {grade?.feedback || "No feedback provided."}
                            </div>
                        )}
                    </div>

                    {/* Publication Status */}
                    {isEditing && (
                        <div className="flex items-center space-x-2">
                            <Switch id="publish-grade" checked={isPublished} onCheckedChange={setIsPublished} />
                            <Label htmlFor="publish-grade">
                                {isPublished ? "Published - Student can see this grade" : "Draft - Only visible to instructors"}
                            </Label>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Graded By</h3>
                            <p>{grade?.gradedBy || "Not graded yet"}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Graded On</h3>
                            <p>{formatDate(grade?.gradedAt)}</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    {isEditing ? (
                        <>
                            <DyraneButton variant="outline" onClick={handleCancelEdit}>
                                Cancel
                            </DyraneButton>
                            <DyraneButton onClick={handleSave} disabled={operationStatus === "loading"}>
                                {operationStatus === "loading" ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </DyraneButton>
                        </>
                    ) : (
                        <>
                            <DyraneButton variant="outline" onClick={() => router.push(`/grades/${gradeItemId}/student-grades`)}>
                                Back to All Grades
                            </DyraneButton>
                            <DyraneButton onClick={() => setIsEditing(true)}>Edit Grade</DyraneButton>
                        </>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
