// components/dashboard/assignments-tab.tsx

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { useAppSelector } from "@/store/hooks"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import Link from "next/link"
import { stat } from "fs"
import { sub } from "date-fns"

type StudentAssignment = {
    id: string;
    title: string;
    courseTitle: string;
    dueDate: string;
    status: "pending" | "submitted" | "graded" | "late";
    grade: number | null;
    graded: boolean;
    feedback: string | null;
    submittedDate: string;
    submitted: boolean;
}

type TeacherAssignment = {
    id: string;
    title: string;
    courseTitle: string;
    dueDate: string;
    status: "pending" | "submitted" | "graded" | "late";
    totalStudents: number;
    submitted: number;
    graded: number;
    submittedDate: string;
}

type Assignment = StudentAssignment | TeacherAssignment;


// Mock assignments data
const mockAssignments: StudentAssignment[] = [
    {
        id: "1",
        title: "Project Management Fundamentals",
        courseTitle: "PMP® Certification Training",
        dueDate: "2023-12-25T23:59:59.000Z",
        status: "pending", // pending, submitted, graded, late
        grade: null,
        feedback: null,
        submitted: false,
        graded: false,
        submittedDate: "2023-12-01T10:00:00.000Z",
    },
    {
        id: "2",
        title: "HTML & CSS Portfolio Project",
        courseTitle: "Web Development Bootcamp",
        dueDate: "2023-12-15T23:59:59.000Z",
        status: "submitted",
        submittedDate: "2023-12-14T14:30:00.000Z",
        grade: null,
        submitted: true,
        graded: false,
        feedback: null,
    },
    {
        id: "3",
        title: "JavaScript Algorithms Challenge",
        courseTitle: "Web Development Bootcamp",
        dueDate: "2023-12-05T23:59:59.000Z",
        status: "graded",
        submitted: true,
        submittedDate: "2023-12-04T18:45:00.000Z",
        grade: 92,
        graded: true,
        feedback: "Excellent work! Your solution was efficient and well-documented.",
    },
    {
        id: "4",
        title: "React Component Library",
        courseTitle: "Web Development Bootcamp",
        dueDate: "2023-11-28T23:59:59.000Z",
        status: "late",
        submittedDate: "2023-11-30T10:15:00.000Z",
        submitted: true,
        grade: 85,
        graded: true,
        feedback: "Good work, but submitted late. Please adhere to deadlines in the future.",
    },
]

// Mock teacher assignments data
const mockTeacherAssignments: TeacherAssignment[] = [
    {
        id: "1",
        title: "Project Management Fundamentals",
        courseTitle: "PMP® Certification Training",
        dueDate: "2023-12-25T23:59:59.000Z",
        totalStudents: 32,
        submitted: 18,
        submittedDate: "2023-11-30T10:15:00.000Z",
        status: "pending",
        graded: 12,
    },
    {
        id: "2",
        title: "HTML & CSS Portfolio Project",
        courseTitle: "Web Development Bootcamp",
        dueDate: "2023-12-15T23:59:59.000Z",
        totalStudents: 45,
        submitted: 38,
        status: "submitted",
        submittedDate: "2023-11-30T10:15:00.000Z",
        graded: 25,
    },
    {
        id: "3",
        title: "JavaScript Algorithms Challenge",
        courseTitle: "Web Development Bootcamp",
        dueDate: "2023-12-05T23:59:59.000Z",
        totalStudents: 45,
        submitted: 43,
        status: "graded",
        submittedDate: "2023-11-30T10:15:00.000Z",
        graded: 43,
    },
    {
        id: "4",
        title: "React Component Library",
        courseTitle: "Web Development Bootcamp",
        dueDate: "2023-11-28T23:59:59.000Z",
        totalStudents: 45,
        submitted: 45,
        submittedDate: "2023-11-30T10:15:00.000Z",
        status: "graded",
        graded: 45,
    },
]

export function AssignmentsTab() {
    const { user } = useAppSelector((state) => state.auth)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string | null>(null)

    if (!user) return null

    // Format date to readable string
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    // Check if assignment is due soon (within 3 days)
    const isDueSoon = (dateString: string) => {
        const dueDate = new Date(dateString)
        const now = new Date()
        const diffTime = dueDate.getTime() - now.getTime()
        const diffDays = diffTime / (1000 * 60 * 60 * 24)
        return diffDays <= 3 && diffDays > 0
    }

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                    </Badge>
                )
            case "submitted":
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Submitted
                    </Badge>
                )
            case "graded":
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Graded
                    </Badge>
                )
            case "late":
                return (
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Late
                    </Badge>
                )
            default:
                return null
        }
    }

    // Filter assignments based on search query and status filter
    const filteredAssignments = user.role === "teacher"
        ? mockTeacherAssignments.filter(assignment =>
            assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : mockAssignments.filter(assignment => {
            const matchesSearch =
                assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                assignment.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesStatus = statusFilter ? assignment.status === statusFilter : true

            return matchesSearch && matchesStatus
        })

    function isStudentAssignment(a: Assignment): a is StudentAssignment {
        return "grade" in a;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search assignments..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {user.role === "student" && (
                    <div className="flex gap-2">
                        <DyraneButton
                            variant={statusFilter === null ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter(null)}
                        >
                            All
                        </DyraneButton>
                        <DyraneButton
                            variant={statusFilter === "pending" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter("pending")}
                        >
                            Pending
                        </DyraneButton>
                        <DyraneButton
                            variant={statusFilter === "submitted" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter("submitted")}
                        >
                            Submitted
                        </DyraneButton>
                        <DyraneButton
                            variant={statusFilter === "graded" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter("graded")}
                        >
                            Graded
                        </DyraneButton>
                    </div>
                )}

                {user.role === "teacher" && (
                    <DyraneButton asChild>
                        <Link href="/assignments/create">
                            Create Assignment
                        </Link>
                    </DyraneButton>
                )}
            </div>

            <DyraneCard>
                <CardHeader>
                    <CardTitle>
                        {user.role === "student" ? "My Assignments" : "Class Assignments"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredAssignments.length > 0 ? (
                            filteredAssignments.map((assignment) => (
                                <motion.div
                                    key={assignment.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex items-start gap-3 mb-3 sm:mb-0">
                                        <div className="bg-primary/10 p-2 rounded-md">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{assignment.title}</h3>
                                            <p className="text-sm text-muted-foreground">{assignment.courseTitle}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                {isStudentAssignment(assignment) ? (
                                                    <>
                                                        {getStatusBadge(assignment.status)}
                                                        <span className="text-xs text-muted-foreground">
                                                            {assignment.status === "pending" ? (
                                                                <>
                                                                    Due: {formatDate(assignment.dueDate)}
                                                                    {isDueSoon(assignment.dueDate) && (
                                                                        <span className="ml-1 text-red-500 font-medium">
                                                                            (Due Soon!)
                                                                        </span>
                                                                    )}
                                                                </>
                                                            ) : assignment.status === "submitted" ? (
                                                                <>Submitted: {formatDate(assignment.submittedDate)}</>
                                                            ) : (
                                                                <>Grade: {assignment.grade}/100</>
                                                            )}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                                                            {assignment.submitted}/{assignment.totalStudents} Submitted
                                                        </Badge>
                                                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                                            {assignment.graded}/{assignment.totalStudents} Graded
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            Due: {formatDate(assignment.dueDate)}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <DyraneButton
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link href={`/assignments/${assignment.id}`}>
                                                {user.role === "student"
                                                    ? (assignment.status === "pending" ? "Submit" : "View")
                                                    : (assignment.graded < assignment.submitted ? "Grade" : "View")}
                                            </Link>
                                        </DyraneButton>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">No assignments found.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </DyraneCard>
        </div>
    )
}
