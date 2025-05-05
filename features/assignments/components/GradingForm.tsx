// features/assignments/components/GradingForm.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { gradeSubmission, selectAssignmentOperationStatus } from "../store/assignment-slice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import type { AssignmentSubmission, Assignment } from "../types/assignment-types"

// Define the form schema with Zod
const formSchema = z.object({
    grade: z.coerce
        .number()
        .min(0, "Grade cannot be negative")
        .refine((val) => val <= 1000, {
            message: "Grade cannot exceed maximum points",
        }),
    feedback: z.string().min(1, "Feedback is required"),
})

type FormValues = z.infer<typeof formSchema>

interface GradingFormProps {
    submission: AssignmentSubmission
    assignment: Assignment
}

export default function GradingForm({ submission, assignment }: GradingFormProps) {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)
    const operationStatus = useAppSelector(selectAssignmentOperationStatus)
    const [error, setError] = useState<string | null>(null)

    // Initialize form with existing grade if available
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            grade: submission.grade || 0,
            feedback: submission.feedback || "",
        },
    })

    // Handle form submission
    const onSubmit = async (data: FormValues) => {
        if (!user?.id) {
            setError("User authentication required")
            return
        }

        try {
            await dispatch(
                gradeSubmission({
                    submissionId: submission.id,
                    grade: data.grade,
                    feedback: data.feedback,
                    graderId: user.id,
                }),
            ).unwrap()

            // Redirect back to the assignment details page
            router.push(`/assignments/${assignment.id}?graded=true`)
        } catch (err) {
            setError("Failed to submit grade. Please try again.")
            console.error("Grading error:", err)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Grade Submission</CardTitle>
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
                            <h3 className="font-medium mb-1">Submission Details</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Student:</p>
                                    <p>{submission.studentName}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Submitted:</p>
                                    <p>{submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Status:</p>
                                    <p className="capitalize">{submission.status}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Assignment:</p>
                                    <p>{assignment.title}</p>
                                </div>
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="grade"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Grade (out of {assignment.pointsPossible})</FormLabel>
                                    <FormControl>
                                        <Input type="number" min={0} max={assignment.pointsPossible} {...field} />
                                    </FormControl>
                                    <FormDescription>Enter a score between 0 and {assignment.pointsPossible}.</FormDescription>
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
                                            placeholder="Provide feedback on the submission..."
                                            className="min-h-[150px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>Provide constructive feedback to help the student improve.</FormDescription>
                                    <FormMessage />
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
