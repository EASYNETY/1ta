// features/grades/components/GradeStudentForm.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { assignGrade, updateGrade, selectGradeOperationStatus } from "../store/grade-slice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import type { GradeItem, StudentGrade } from "../types/grade-types"

// Define the form schema with Zod
const formSchema = z.object({
    points: z.coerce
        .number()
        .min(0, "Points cannot be negative")
        .refine((val) => val <= 1000, {
            message: "Points cannot exceed maximum points",
        }),
    feedback: z.string().optional(),
    publishImmediately: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface GradeStudentFormProps {
    gradeItem: GradeItem
    studentGrade?: StudentGrade
    studentId: string
    studentName: string
}

export default function GradeStudentForm({ gradeItem, studentGrade, studentId, studentName }: GradeStudentFormProps) {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)
    const operationStatus = useAppSelector(selectGradeOperationStatus)
    const [error, setError] = useState<string | null>(null)

    // Initialize form with existing grade if available
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            points: studentGrade?.points || 0,
            feedback: studentGrade?.feedback || "",
            publishImmediately: studentGrade?.status === "published" || true,
        },
    })

    // Handle form submission
    const onSubmit = async (data: FormValues) => {
        if (!user?.id) {
            setError("User authentication required")
            return
        }

        try {
            if (studentGrade) {
                // Update existing grade
                await dispatch(
                    updateGrade({
                        gradeId: studentGrade.id,
                        grade: {
                            points: data.points,
                            feedback: data.feedback || null,
                            status: data.publishImmediately ? "published" : "draft",
                        },
                    }),
                ).unwrap()
            } else {
                // Create new grade
                await dispatch(
                    assignGrade({
                        gradeItemId: gradeItem.id,
                        studentId,
                        points: data.points,
                        feedback: data.feedback || null,
                        status: data.publishImmediately ? "published" : "draft",
                        gradedBy: user.id,
                    }),
                ).unwrap()
            }

            // Redirect back to the grade item details page
            router.push(`/grades/${gradeItem.id}?graded=true`)
        } catch (err) {
            setError("Failed to submit grade. Please try again.")
            console.error("Grading error:", err)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Grade Student</CardTitle>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="rounded-md border p-4 mb-4">
                            <h3 className="font-medium mb-1">Grade Details</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Student:</p>
                                    <p>{studentName}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Grade Item:</p>
                                    <p>{gradeItem.title}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Course:</p>
                                    <p>{gradeItem.courseTitle}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Points Possible:</p>
                                    <p>{gradeItem.pointsPossible}</p>
                                </div>
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="points"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Points (out of {gradeItem.pointsPossible})</FormLabel>
                                    <FormControl>
                                        <Input type="number" min={0} max={gradeItem.pointsPossible} {...field} />
                                    </FormControl>
                                    <FormDescription>Enter a score between 0 and {gradeItem.pointsPossible}.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="feedback"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Feedback</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Provide feedback on the student's work..."
                                            className="min-h-[150px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>Provide constructive feedback to help the student improve.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="publishImmediately"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Publish Immediately</FormLabel>
                                        <FormDescription>
                                            When enabled, the student will be able to see this grade right away.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={operationStatus === "loading"}>
                            {operationStatus === "loading" ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Submit Grade"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}
