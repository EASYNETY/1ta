// app/(authenticated)/submissions/[submissionId]/grade/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
    fetchAssignmentById,
    fetchSubmissions,
    selectCurrentAssignment,
    selectCurrentSubmissions,
    selectAssignmentStatus,
    selectAssignmentError,
    fetchAssignments, // Import fetchAssignments
} from "@/features/assignments/store/assignment-slice"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Home } from "lucide-react"
import Link from "next/link"
import GradingForm from "@/features/assignments/components/GradingForm"
import type { AssignmentSubmission } from "@/features/assignments/types/assignment-types"

export default function GradeSubmissionPage() {
    const params = useParams()
    const router = useRouter()
    const dispatch = useAppDispatch()
    const submissionId = params.submissionId as string
    const { user } = useAppSelector((state) => state.auth)
    const currentAssignment = useAppSelector(selectCurrentAssignment)
    const submissions = useAppSelector(selectCurrentSubmissions)
    const status = useAppSelector(selectAssignmentStatus)
    const error = useAppSelector(selectAssignmentError)
    const [submission, setSubmission] = useState<AssignmentSubmission | null>(null)

    // Fetch submission data
    useEffect(() => {
        if (user?.id && user?.role && (user.role === "teacher" || user.role === "admin" || user?.role === 'super_admin')) {
            // First, we need to find which assignment this submission belongs to
            // This is a workaround since we don't have a direct API to fetch a submission by ID
            // In a real app, you'd have an API endpoint like GET /submissions/:id

            // For now, we'll fetch all assignments and then find the relevant submissions
            const fetchData = async () => {
                try {
                    // Fetch assignments (this would be replaced with a more targeted API call in a real app)
                    const result = await dispatch(
                        fetchAssignments({
                            role: user.role,
                            userId: user.id,
                        }),
                    ).unwrap()

                    // Once we have assignments, we need to fetch submissions for each until we find the one we want
                    for (const assignment of result) {
                        await dispatch(fetchSubmissions(assignment.id)).unwrap()

                        // Check if our submissions array now contains the one we're looking for
                        const foundSubmission = submissions.find((s) => s.id === submissionId)
                        if (foundSubmission) {
                            setSubmission(foundSubmission)
                            dispatch(
                                fetchAssignmentById({
                                    assignmentId: foundSubmission.assignmentId,
                                    role: user.role,
                                    userId: user.id,
                                }),
                            )
                            break
                        }
                    }
                } catch (err) {
                    console.error("Error fetching submission data:", err)
                }
            }

            fetchData()
        }
    }, [dispatch, submissionId, user?.id, user?.role, submissions])

    // Redirect to login if not authenticated
    if (!user) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Authentication Required</h2>
                    <p className="text-muted-foreground mt-2">Please log in to grade submissions.</p>
                    <Button asChild className="mt-4">
                        <Link href="/login">Log In</Link>
                    </Button>
                </div>
            </div>
        )
    }

    // Check if user has permission to grade
    if (user?.role !== "teacher" && user?.role !== "admin" && user?.role !== 'super_admin') {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>You do not have permission to grade submissions.</AlertDescription>
            </Alert>
        )
    }

    // Render loading state
    if (status === "loading" || !currentAssignment || !submission) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-full max-w-md" />
                <Skeleton className="h-8 w-full max-w-sm" />
                <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
        )
    }

    // Render error state
    if (status === "failed") {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error || "Failed to load submission details"}</AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-6">
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
                            <Link href="/assignments">Assignments</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={`/assignments/${currentAssignment.id}`}>{currentAssignment.title}</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink>Grade Submission</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Grade Submission</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Student Submission</CardTitle>
                    <CardDescription>Review and grade the student's work for {currentAssignment.title}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <GradingForm submission={submission} assignment={currentAssignment} />
                </CardContent>
            </Card>
        </div>
    )
}
