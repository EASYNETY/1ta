// features/assignments/components/SubmissionsList.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchSubmissions, selectCurrentSubmissions, selectAssignmentStatus } from "../store/assignment-slice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Clock, MoreHorizontal, Pencil, Search, UserRound } from "lucide-react"
import Link from "next/link"
import type { Assignment } from "../types/assignment-types"

interface SubmissionsListProps {
    assignment: Assignment
}

export default function SubmissionsList({ assignment }: SubmissionsListProps) {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const submissions = useAppSelector(selectCurrentSubmissions)
    const status = useAppSelector(selectAssignmentStatus)
    const [searchQuery, setSearchQuery] = useState("")

    // Fetch submissions on component mount
    useEffect(() => {
        dispatch(fetchSubmissions(assignment.id))
    }, [dispatch, assignment.id])

    // Filter submissions based on search query
    const filteredSubmissions = submissions.filter((submission) =>
        submission.studentName?.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    // Render status badge
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case "graded":
                return (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Graded
                    </Badge>
                )
            case "submitted":
                return (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Submitted
                    </Badge>
                )
            case "late":
                return (
                    <Badge variant="destructive">
                        <Clock className="mr-1 h-3 w-3" />
                        Late
                    </Badge>
                )
            default:
                return (
                    <Badge variant="outline">
                        <Clock className="mr-1 h-3 w-3" />
                        {status}
                    </Badge>
                )
        }
    }

    // Format date
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return "N/A"
        return format(parseISO(dateString), "MMM d, yyyy 'at' h:mm a")
    }

    // Render loading state
    if (status === "loading") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full max-w-sm" />
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
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
                <AlertDescription>Failed to load submissions</AlertDescription>
            </Alert>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Submissions ({submissions.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by student name..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {filteredSubmissions.length === 0 ? (
                    <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                            <UserRound className="h-10 w-10 text-muted-foreground/50" />
                            <h3 className="mt-4 text-lg font-semibold">No submissions found</h3>
                            <p className="mb-4 mt-2 text-sm text-muted-foreground">
                                {searchQuery ? "Try adjusting your search" : "No students have submitted this assignment yet"}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSubmissions.map((submission) => (
                                    <TableRow key={submission.id}>
                                        <TableCell className="font-medium">{submission.studentName || "Unknown Student"}</TableCell>
                                        <TableCell>{renderStatusBadge(submission.status)}</TableCell>
                                        <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                                        <TableCell>
                                            {submission.grade !== null && submission.grade !== undefined
                                                ? `${submission.grade}/${assignment.pointsPossible}`
                                                : "Not graded"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/submissions/${submission.id}/view`}>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            View Submission
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/submissions/${submission.id}/grade`}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            {submission.status === "graded" ? "Edit Grade" : "Grade"}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
