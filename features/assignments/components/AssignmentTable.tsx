// features/assignments/components/AssignmentTable.tsx

"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
    fetchAssignments,
    selectAllAssignments,
    selectAssignmentStatus,
    selectAssignmentError,
} from "../store/assignment-slice"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Plus, Search } from "lucide-react"
import Link from "next/link"
import AssignmentTableRow from "./AssignmentTableRow"
import type { TeacherAssignmentView } from "../types/assignment-types"

interface AssignmentTableProps {
    courseId?: string
    classId?: string
}

export default function AssignmentTable({ courseId, classId }: AssignmentTableProps) {
    const dispatch = useAppDispatch()
    const assignments = useAppSelector(selectAllAssignments) as TeacherAssignmentView[]
    const status = useAppSelector(selectAssignmentStatus)
    const error = useAppSelector(selectAssignmentError)
    const { user } = useAppSelector((state) => state.auth)

    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [courseFilter, setCourseFilter] = useState<string>(courseId || "all")

    // Fetch assignments on component mount
    useEffect(() => {
        if (user?.id && user.role) {
            dispatch(
                fetchAssignments({
                    role: user.role,
                    userId: user.id,
                    courseId: courseId,
                    classId: classId,
                }),
            )
        }
    }, [dispatch, user?.id, user?.role, courseId, classId])

    // Filter assignments based on search query and filters
    const filteredAssignments = assignments.filter((assignment) => {
        const matchesSearch =
            assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (assignment.courseTitle && assignment.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesStatus = statusFilter === "all" || assignment.status === statusFilter

        const matchesCourse = courseFilter === "all" || assignment.courseId === courseFilter

        return matchesSearch && matchesStatus && matchesCourse
    })

    // Available courses for filtering
    const courses = [
        { id: "1", title: "PMP® Certification Training" },
        { id: "webdev_101", title: "Web Development Bootcamp" },
        { id: "data_science", title: "Data Science Fundamentals" },
    ]

    // Render loading state
    if (status === "loading") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-10 w-full max-w-sm" />
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-10 w-32" />
                        </div>
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
                <AlertDescription>{error || "Failed to load assignments"}</AlertDescription>
            </Alert>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Assignments</CardTitle>
                <Button asChild>
                    <Link href="/assignments/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Assignment
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search assignments..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>

                        {!courseId && (
                            <Select value={courseFilter} onValueChange={setCourseFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Course" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Courses</SelectItem>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>

                {filteredAssignments.length === 0 ? (
                    <div className="flex h-[300px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                            <h3 className="mt-4 text-lg font-semibold">No assignments found</h3>
                            <p className="mb-4 mt-2 text-sm text-muted-foreground">
                                {searchQuery || statusFilter !== "all" || courseFilter !== "all"
                                    ? "Try adjusting your search or filters"
                                    : "Get started by creating a new assignment"}
                            </p>
                            <Button asChild>
                                <Link href="/assignments/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Assignment
                                </Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Submissions</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAssignments.map((assignment) => (
                                    <AssignmentTableRow key={assignment.id} assignment={assignment} />
                                ))}
                            </TableBody>
                            <TableCaption>
                                Showing {filteredAssignments.length} of {assignments.length} assignments
                            </TableCaption>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
