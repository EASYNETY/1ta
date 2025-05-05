// app(authenticated)/assignments/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { fetchAssignments } from "@/features/assignments/store/assignment-slice"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Plus } from "lucide-react"
import Link from "next/link"
import AssignmentTable from "@/features/assignments/components/AssignmentTable"
import StudentAssignmentCard from "@/features/assignments/components/StudentAssignmentCard"

export default function AssignmentsPage() {
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)
    const [activeTab, setActiveTab] = useState("all")
    const [isLoading, setIsLoading] = useState(true)

    // Fetch assignments on component mount
    useEffect(() => {
        if (user?.id && user.role) {
            dispatch(
                fetchAssignments({
                    role: user.role,
                    userId: user.id,
                }),
            ).finally(() => setIsLoading(false))
        }
    }, [dispatch, user?.id, user?.role])

    // Redirect to login if not authenticated
    if (!user) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Authentication Required</h2>
                    <p className="text-muted-foreground mt-2">Please log in to access assignments.</p>
                    <Button asChild className="mt-4">
                        <Link href="/login">Log In</Link>
                    </Button>
                </div>
            </div>
        )
    }

    // Render loading state
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-12 w-full" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-[300px] rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-3xl font-bold">Assignments</h1>
                {(user.role === "teacher" || user.role === "admin") && (
                    <Button asChild>
                        <Link href="/assignments/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Assignment
                        </Link>
                    </Button>
                )}
            </div>

            {user.role === "student" ? <StudentAssignmentsView /> : <TeacherAssignmentsView />}
        </div>
    )
}

function StudentAssignmentsView() {
    const studentAssignments = useAppSelector((state) => state.assignments.studentAssignments)
    const status = useAppSelector((state) => state.assignments.status)
    const error = useAppSelector((state) => state.assignments.error)
    const [activeTab, setActiveTab] = useState("all")

    // Filter assignments based on tab
    const filteredAssignments = studentAssignments.filter((assignment) => {
        if (activeTab === "all") return true
        if (activeTab === "pending")
            return assignment.displayStatus === "pending" || assignment.displayStatus === "due_soon"
        if (activeTab === "submitted")
            return assignment.displayStatus === "submitted" || assignment.displayStatus === "late"
        if (activeTab === "graded") return assignment.displayStatus === "graded"
        if (activeTab === "overdue") return assignment.displayStatus === "overdue"
        return true
    })

    // Render error state
    if (status === "failed") {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error || "Failed to load assignments"}</AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-6">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="submitted">Submitted</TabsTrigger>
                    <TabsTrigger value="graded">Graded</TabsTrigger>
                    <TabsTrigger value="overdue">Overdue</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                    {filteredAssignments.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <h3 className="text-lg font-semibold">No assignments found</h3>
                                <p className="text-muted-foreground mt-2 mb-6">
                                    {activeTab === "all"
                                        ? "You don't have any assignments yet."
                                        : `You don't have any ${activeTab} assignments.`}
                                </p>
                                <Button asChild>
                                    <Link href="/courses">Browse Courses</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredAssignments.map((assignment) => (
                                <StudentAssignmentCard key={assignment.id} assignment={assignment} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

function TeacherAssignmentsView() {
    return <AssignmentTable />
}
