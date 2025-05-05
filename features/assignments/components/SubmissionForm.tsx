// features/assignments/components/SubmissionForm.tsx

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { submitAssignment, selectAssignmentOperationStatus } from "../store/assignment-slice"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, FileUp, Loader2, Upload } from "lucide-react"
import type { StudentAssignmentView } from "../types/assignment-types"

// Define the form schema with Zod
const formSchema = z.object({
    comments: z.string().optional(),
    // In a real app, you'd handle file uploads differently
    // This is a simplified version
    files: z.array(z.any()).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface SubmissionFormProps {
    assignment: StudentAssignmentView
}

export default function SubmissionForm({ assignment }: SubmissionFormProps) {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)
    const operationStatus = useAppSelector(selectAssignmentOperationStatus)
    const [files, setFiles] = useState<File[]>([])
    const [error, setError] = useState<string | null>(null)

    // Initialize form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            comments: "",
            files: [],
        },
    })

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const fileArray = Array.from(e.target.files)
            setFiles(fileArray)
            form.setValue("files", fileArray)
        }
    }

    // Handle form submission
    const onSubmit = async (data: FormValues) => {
        if (!user?.id) {
            setError("User authentication required")
            return
        }

        try {
            // In a real app, you'd upload files to a storage service
            // and include the URLs in the submission
            await dispatch(
                submitAssignment({
                    assignmentId: assignment.id,
                    studentId: user.id,
                    submissionContent: {
                        comments: data.comments,
                        files: files.map((file) => ({
                            name: file.name,
                            url: URL.createObjectURL(file), // This is just for demo purposes
                            type: file.type,
                        })),
                    },
                }),
            ).unwrap()

            // Redirect to the assignment details page after successful submission
            router.push(`/assignments/${assignment.id}?submitted=true`)
        } catch (err) {
            setError("Failed to submit assignment. Please try again.")
            console.error("Submission error:", err)
        }
    }

    // Check if the assignment is past due and doesn't allow late submissions
    const isPastDueNoLate = assignment.displayStatus === "overdue" && !assignment.allowLateSubmissions

    return (
        <Card>
            <CardHeader>
                <CardTitle>Submit Assignment</CardTitle>
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

                        {isPastDueNoLate ? (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Submission Closed</AlertTitle>
                                <AlertDescription>This assignment is past due and does not accept late submissions.</AlertDescription>
                            </Alert>
                        ) : assignment.displayStatus === "late" ? (
                            <Alert variant="default">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Late Submission</AlertTitle>
                                <AlertDescription>
                                    This assignment is past due. Your submission will be marked as late.
                                </AlertDescription>
                            </Alert>
                        ) : null}

                        <FormField
                            control={form.control}
                            name="comments"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Comments</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add any comments about your submission..."
                                            className="min-h-[120px]"
                                            {...field}
                                            disabled={isPastDueNoLate}
                                        />
                                    </FormControl>
                                    <FormDescription>Optional: Provide context or notes about your submission.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="files"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Upload Files</FormLabel>
                                    <FormControl>
                                        <div className="grid w-full items-center gap-1.5">
                                            <label
                                                htmlFor="file-upload"
                                                className={`flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-6 ${isPastDueNoLate
                                                        ? "border-muted-foreground/20 bg-muted/50"
                                                        : "border-primary/20 hover:bg-primary/5"
                                                    }`}
                                            >
                                                <div className="flex flex-col items-center gap-1 text-center">
                                                    <Upload
                                                        className={`h-10 w-10 ${isPastDueNoLate ? "text-muted-foreground/50" : "text-primary/80"}`}
                                                    />
                                                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                                    <p className="text-xs text-muted-foreground">PDF, Word, Excel, PowerPoint, or image files</p>
                                                </div>
                                                <input
                                                    id="file-upload"
                                                    type="file"
                                                    multiple
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                    disabled={isPastDueNoLate}
                                                />
                                            </label>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {files.length > 0 && (
                            <div className="rounded-md border p-4">
                                <h4 className="mb-2 text-sm font-medium">Selected Files</h4>
                                <ul className="space-y-2">
                                    {files.map((file, index) => (
                                        <li key={index} className="flex items-center justify-between rounded-md bg-muted/50 p-2 text-sm">
                                            <div className="flex items-center">
                                                <FileUp className="mr-2 h-4 w-4 text-primary" />
                                                <span className="truncate max-w-[200px]">{file.name}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPastDueNoLate || operationStatus === "loading"}>
                            {operationStatus === "loading" ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Assignment"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}
