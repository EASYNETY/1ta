// features/grades/components/StudentGradeCard.tsx

"use client"

import { format, parseISO } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { FileText, Calendar } from "lucide-react"
import Link from "next/link"
import type { StudentGradeItemView } from "../types/grade-types"

interface StudentGradeCardProps {
    gradeItem: StudentGradeItemView
}

export default function StudentGradeCard({ gradeItem }: StudentGradeCardProps) {
    // Format the due date if it exists
    const formattedDueDate = gradeItem.dueDate ? format(parseISO(gradeItem.dueDate), "MMM d, yyyy 'at' h:mm a") : null

    // Calculate percentage if graded
    const percentage = gradeItem.grade ? (gradeItem.grade.points / gradeItem.pointsPossible) * 100 : 0

    // Get color class based on grade
    const getGradeColorClass = (percentage: number) => {
        if (percentage >= 90) return "text-green-600 dark:text-green-400"
        if (percentage >= 80) return "text-blue-600 dark:text-blue-400"
        if (percentage >= 70) return "text-yellow-600 dark:text-yellow-400"
        if (percentage >= 60) return "text-orange-600 dark:text-orange-400"
        return "text-red-600 dark:text-red-400"
    }

    // Render type badge with appropriate color
    const renderTypeBadge = (type: string) => {
        switch (type) {
            case "assignment":
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        Assignment
                    </Badge>
                )
            case "quiz":
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Quiz
                    </Badge>
                )
            case "exam":
                return (
                    <Badge variant="outline" className="bg-purple-50 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        Exam
                    </Badge>
                )
            case "project":
                return (
                    <Badge variant="outline" className="bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        Project
                    </Badge>
                )
            case "participation":
                return (
                    <Badge variant="outline" className="bg-pink-50 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300">
                        Participation
                    </Badge>
                )
            default:
                return <Badge variant="outline">Other</Badge>
        }
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{gradeItem.title}</CardTitle>
                        <CardDescription>{gradeItem.courseTitle}</CardDescription>
                    </div>
                    {renderTypeBadge(gradeItem.type)}
                </div>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="space-y-4">
                    {formattedDueDate && (
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-1 h-4 w-4" />
                            <span>Due: {formattedDueDate}</span>
                        </div>
                    )}

                    <div className="flex items-center text-sm">
                        <FileText className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span>Points: {gradeItem.pointsPossible}</span>
                        <span className="mx-2">•</span>
                        <span>Weight: {(gradeItem.weight * 100).toFixed(0)}%</span>
                    </div>

                    {gradeItem.description && (
                        <div className="mt-2">
                            <Separator className="my-2" />
                            <p className="text-sm line-clamp-2">{gradeItem.description}</p>
                        </div>
                    )}

                    {gradeItem.grade && (
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>
                                    Grade: {gradeItem.grade.points}/{gradeItem.pointsPossible}
                                </span>
                                <span className={getGradeColorClass(percentage)}>
                                    {percentage.toFixed(1)}%{gradeItem.grade.letterGrade && ` (${gradeItem.grade.letterGrade})`}
                                </span>
                            </div>
                            <Progress value={percentage} className="h-2" color={percentage >= 70 ? "bg-green-600" : "bg-red-600"} />
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <Button asChild variant="outline" className="w-full">
                    <Link href={`/grades/${gradeItem.id}`}>{gradeItem.grade ? "View Feedback" : "View Details"}</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
