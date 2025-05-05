// features/grades/components/GradeStudentsForm.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
    fetchStudentGrades,
    assignGrade,
    updateGrade,
    selectStudentGrades,
    selectGradeStatus,
    selectGradeOperationStatus,
    selectGradeError,
} from "../store/grade-slice"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Search, CheckCircle, Loader2 } from "lucide-react"
import type { GradeItem, StudentGrade } from "../types/grade-types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface GradeStudentsFormProps {
    gradeItem: GradeItem
}

interface EditableGrade {
    studentId: string
    studentName: string
    points: number
    feedback: string
    status: "draft" | "published"
    gradeId?: string // Existing grade ID if already graded
    isEditing: boolean
    isSaving: boolean
}

export default function GradeStudentsForm({ gradeItem }: GradeStudentsFormProps) {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const studentGrades = useAppSelector(selectStudentGrades)
    const status = useAppSelector(selectGradeStatus)
    const operationStatus = useAppSelector(selectGradeOperationStatus)
    const error = useAppSelector(selectGradeError)
    const { user } = useAppSelector((state) => state.auth)

    const [searchQuery, setSearchQuery] = useState("")
    const [editableGrades, setEditableGrades] = useState<EditableGrade[]>([])
    const [bulkPublish, setBulkPublish] = useState(true)

    // Mock student list - in a real app, this would come from an API
    const mockStudents = [
        { id: "student_1", name: "Alice Student" },
        { id: "student_2", name: "Bob Learner" },
        { id: "student_3", name: "Charlie Scholar" },
        { id: "student_4", name: "Diana Hacker" },
        { id: "student_5", name: "Ethan Coder" },
    ]

    // Fetch student grades when component mounts
    useEffect(() => {
        dispatch(fetchStudentGrades(gradeItem.id))
    }, [dispatch, gradeItem.id])

    // Initialize editable grades when student grades are loaded
    useEffect(() => {
        if (status === "succeeded") {
            // Create a map of existing grades
            const gradesMap = new Map<string, StudentGrade>()
            studentGrades.forEach(grade => {
                gradesMap.set(grade.studentId, grade)
            })

            // Create editable grades for all students
            const newEditableGrades = mockStudents.map(student => {
                const existingGrade = gradesMap.get(student.id)
                return {
                    studentId: student.id,
                    studentName: student.name,
                    points: existingGrade?.points || 0,
                    feedback: existingGrade?.feedback || "",
                    status: existingGrade?.status || "draft",
                    gradeId: existingGrade?.id,
                    isEditing: false,
                    isSaving: false
                }
            })

            setEditableGrades(newEditableGrades)
        }
    }, [studentGrades, status])

    // Filter students based on search query
    const filteredGrades = editableGrades.filter(grade =>
        grade.studentName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Handle editing a grade
    const handleEdit = (studentId: string) => {
        setEditableGrades(prev =>
            prev.map(grade =>
                grade.studentId === studentId
                    ? { ...grade, isEditing: true }
                    : grade
            )
        )
    }

    // Handle canceling edit
    // const handleCancelEdit = (studentId: string) => {
    //     setEditableGrades(prev =>
    //         prev.map(grade => {
    //             if (grade.studentId === studentId) {
    //                 const existingGrade = studentGrades.find(g => g.studentId === studentId)
    //                 return {
    //                     ...grade,
    //                     points: existingGrade?.points || 0,
    //                     feedback: existingGrade?.feedback || "",
    //                     status: existingGrade?.status || "draft",
    //                     isEditing: false,
    //                     isSaving: false
    //                 } : grade
    //   )
    //     )
    // }

    const handleCancelEdit = (studentId: string) => {
        setEditableGrades(prev =>
            prev.map(grade =>
                grade.studentId === studentId
                    ? { ...grade, isEditing: false, isSaving: false }
                    : grade
            )
        )
    }

    // Handle input change
    const handleInputChange = (studentId: string, field: keyof EditableGrade, value: any) => {
        setEditableGrades(prev =>
            prev.map(grade =>
                grade.studentId === studentId
                    ? { ...grade, [field]: value }
                    : grade
            )
        )
    }

    // Handle saving a grade
    const handleSaveGrade = async (studentId: string) => {
        if (!user?.id) return

        const gradeToSave = editableGrades.find(g => g.studentId === studentId)
        if (!gradeToSave) return

        // Mark as saving
        setEditableGrades(prev =>
            prev.map(grade =>
                grade.studentId === studentId
                    ? { ...grade, isSaving: true }
                    : grade
            )
        )

        try {
            if (gradeToSave.gradeId) {
                // Update existing grade
                await dispatch(updateGrade({
                    gradeId: gradeToSave.gradeId,
                    grade: {
                        points: gradeToSave.points,
                        feedback: gradeToSave.feedback,
                        status: gradeToSave.status
                    }
                })).unwrap()
            } else {
                // Create new grade
                await dispatch(assignGrade({
                    gradeItemId: gradeItem.id,
                    studentId: gradeToSave.studentId,
                    points: gradeToSave.points,
                    feedback: gradeToSave.feedback,
                    status: gradeToSave.status,
                    gradedBy: user.id
                })).unwrap()
            }

            // Update UI after successful save
            setEditableGrades(prev =>
                prev.map(grade =>
                    grade.studentId === studentId
                        ? { ...grade, isEditing: false, isSaving: false }
                        : grade
                )
            )
        } catch (error) {
            console.error("Failed to save grade:", error)
            // Reset saving state
            setEditableGrades(prev =>
                prev.map(grade =>
                    grade.studentId === studentId
                        ? { ...grade, isSaving: false }
                        : grade
                )
            )
        }
    }

    // Handle bulk save
    const handleBulkSave = async () => {
        if (!user?.id) return

        // Only save grades that are being edited
        const gradesToSave = editableGrades.filter(grade => grade.isEditing)
        if (gradesToSave.length === 0) return

        // Mark all as saving
        setEditableGrades(prev =>
            prev.map(grade =>
                grade.isEditing
                    ? { ...grade, isSaving: true }
                    : grade
            )
        )

        // Save each grade
        for (const grade of gradesToSave) {
            try {
                if (grade.gradeId) {
                    // Update existing grade
                    await dispatch(updateGrade({
                        gradeId: grade.gradeId,
                        grade: {
                            points: grade.points,
                            feedback: grade.feedback,
                            status: bulkPublish ? "published" : "draft"
                        }
                    })).unwrap()
                } else {
                    // Create new grade
                    await dispatch(assignGrade({
                        gradeItemId: gradeItem.id,
                        studentId: grade.studentId,
                        points: grade.points,
                        feedback: grade.feedback,
                        status: bulkPublish ? "published" : "draft",
                        gradedBy: user.id
                    })).unwrap()
                }
            } catch (error) {
                console.error(`Failed to save grade for student ${grade.studentId}:`, error)
            }
        }

        // Update UI after all saves
        setEditableGrades(prev =>
            prev.map(grade =>
                grade.isEditing
                    ? { ...grade, isEditing: false, isSaving: false, status: bulkPublish ? "published" : "draft" }
                    : grade
            )
        )
    }

    // Render loading state
    if (status === "loading") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Grade Students</CardTitle>
                    <CardDescription>Loading student grades...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full max-w-sm" />
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Render error state
    if (status === "failed") {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error || "Failed to load student grades"}</AlertDescription>
            </Alert>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Grade Students: {gradeItem.title}</CardTitle>
                <CardDescription>
                    {gradeItem.courseTitle} • {gradeItem.pointsPossible} points possible
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Search and Bulk Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="relative w-full sm:w-auto sm:min-w-[250px]">
                            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search students..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                id="bulk-publish"
                                checked={bulkPublish}
                                onCheckedChange={setBulkPublish}
                            />
                            <Label htmlFor="bulk-publish">Publish grades immediately</Label>
                        </div>
                    </div>

                    {/* Grading Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Points</TableHead>
                                    <TableHead>Feedback</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredGrades.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No students found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredGrades.map((grade) => (
                                        <TableRow key={grade.studentId}>
                                            <TableCell className="font-medium">{grade.studentName}</TableCell>
                                            <TableCell>
                                                {grade.isEditing ? (
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        max={gradeItem.pointsPossible}
                                                        value={grade.points}
                                                        onChange={(e) => handleInputChange(grade.studentId, "points", Number(e.target.value))}
                                                        className="w-20"
                                                    />
                                                ) : (
                                                    <span>{grade.points}/{gradeItem.pointsPossible}</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {grade.isEditing ? (
                                                    <Textarea
                                                        value={grade.feedback}
                                                        onChange={(e) => handleInputChange(grade.studentId, "feedback", e.target.value)}
                                                        placeholder="Provide feedback..."
                                                        className="min-h-[80px] w-full"
                                                    />
                                                ) : (
                                                    <span className="line-clamp-2">{grade.feedback || "No feedback"}</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {grade.isEditing ? (
                                                    <Select
                                                        value={grade.status}
                                                        onValueChange={(value) => handleInputChange(grade.studentId, "status", value)}
                                                    >
                                                        <SelectTrigger className="w-[120px]">
                                                            <SelectValue placeholder="Status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="draft">Draft</SelectItem>
                                                            <SelectItem value="published">Published</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
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
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {grade.isEditing ? (
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleCancelEdit(grade.studentId)}
                                                            disabled={grade.isSaving}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleSaveGrade(grade.studentId)}
                                                            disabled={grade.isSaving}
                                                        >
                                                            {grade.isSaving ? (
                                                                <>
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                    Saving...
                                                                </>
                                                            ) : (
                                                                "Save"
                                                            )}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(grade.studentId)}
                                                    >
                                                        {grade.gradeId ? "Edit" : "Grade"}
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push(`/grades/${gradeItem.id}`)}>
                    Back to Details
                </Button>
                <Button
                    onClick={handleBulkSave}
                    disabled={!editableGrades.some(grade => grade.isEditing) || operationStatus === "loading"}
                >
                    {operationStatus === "loading" ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving All...
                        </>
                    ) : (
                        "Save All Changes"
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
