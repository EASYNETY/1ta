// features/assignments/components/StudentAssignmentCard.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format, parseISO, isPast, isToday, addDays } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, Clock, FileText, CheckCircle, AlertCircle, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { StudentAssignmentView } from "../types/assignment-types"

interface StudentAssignmentCardProps {
    assignment: StudentAssignmentView
}

export default function StudentAssignmentCard({ assignment }: StudentAssignmentCardProps) {
    const router = useRouter()
    const [isHovered, setIsHovered] = useState(false)

    // Format the due date
    const dueDate = parseISO(assignment.dueDate)
    const formattedDueDate = format(dueDate, "MMM d, yyyy 'at' h:mm a")

    // Calculate time status
    const isDuePast = isPast(dueDate)
    const isDueToday = isToday(dueDate)
    const isDueSoon = !isDuePast && !isDueToday && isPast(addDays(new Date(), -3))

    // Determine card border color based on status
    const getBorderColor = () => {
        switch (assignment.displayStatus) {
            case "graded":
                return "border-green-200 dark:border-green-800"
            case "graded":
                return "border-green-200 dark:border-green-800"
            case "submitted":
                return "border-blue-200 dark:border-blue-800"
            case "late":
                return "border-amber-200 dark:border-amber-800"
            case "overdue":
                return "border-red-200 dark:border-red-800"
            case "due_soon":
                return "border-yellow-200 dark:border-yellow-800"
            default:
                return "border-gray-200 dark:border-gray-800"
        }
    }

    // Get status badge
    const getStatusBadge = () => {
        switch (assignment.displayStatus) {
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
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Late
                    </Badge>
                )
            case "overdue":
                return (
                    <Badge variant="destructive">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Overdue
                    </Badge>
                )
            case "due_soon":
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                        <Clock className="mr-1 h-3 w-3" />
                        Due Soon
                    </Badge>
                )
            default:
                return (
                    <Badge variant="outline">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                    </Badge>
                )
        }
    }

    // Get grade display
    const getGradeDisplay = () => {
        if (assignment.displayStatus === "graded" && assignment.submission?.grade !== undefined) {
            const asssigmentGrade = assignment.submission.grade ?? 0
            const percentage = Math.round((asssigmentGrade / assignment.pointsPossible) * 100)
            return (
                <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span>
                            Grade: {assignment.submission.grade}/{assignment.pointsPossible}
                        </span>
                        <span
                            className={percentage >= 70 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
                        >
                            {percentage}%
                        </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                </div>
            )
        }
        return null
    }

    return (
        <Card
            className={`transition-all duration-200 ${getBorderColor()} ${isHovered ? "shadow-md" : "shadow-sm"}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                    {getStatusBadge()}
                </div>
                <p className="text-sm text-muted-foreground">{assignment.courseTitle}</p>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="mr-1 h-4 w-4" />
                        <span>Due: {formattedDueDate}</span>
                        {isDueToday && (
                            <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                Today
                            </Badge>
                        )}
                        {isDueSoon && !isDueToday && (
                            <Badge
                                variant="outline"
                                className="ml-2 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                            >
                                Soon
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center text-sm">
                        <FileText className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span>Points: {assignment.pointsPossible}</span>
                    </div>

                    {assignment.description && (
                        <div className="mt-2">
                            <Separator className="my-2" />
                            <p className="text-sm line-clamp-2">{assignment.description}</p>
                        </div>
                    )}

                    {getGradeDisplay()}
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    asChild
                    className="w-full"
                    variant={
                        assignment.displayStatus === "pending" ||
                            assignment.displayStatus === "due_soon" ||
                            assignment.displayStatus === "overdue"
                            ? "default"
                            : "outline"
                    }
                >
                    <Link href={`/assignments/${assignment.id}`}>
                        {assignment.displayStatus === "pending" ||
                            assignment.displayStatus === "due_soon" ||
                            assignment.displayStatus === "overdue"
                            ? "Submit Assignment"
                            : assignment.displayStatus === "graded"
                                ? "View Feedback"
                                : "View Details"}
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
