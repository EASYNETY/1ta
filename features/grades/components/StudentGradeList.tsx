// features/grades/components/StudentGradeList.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
import { selectStudentGradeItems } from "../store/grade-slice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, Award, FileText, BookOpen } from "lucide-react"
import Link from "next/link"
import type { GradeItemType } from "../types/grade-types"

export default function StudentGradeList() {
    const router = useRouter()
    const gradeItems = useAppSelector(selectStudentGradeItems)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState<GradeItemType | "all">("all")

    // Filter grade items based on search query and active tab
    const filteredGradeItems = gradeItems.filter((item) => {
        const matchesSearch =
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesTab = activeTab === "all" || item.type === activeTab

        return matchesSearch && matchesTab
    })

    // Calculate overall GPA
    const gradedItems = gradeItems.filter((item) => item.grade !== null && item.grade !== undefined)
    const totalPoints = gradedItems.reduce((sum, item) => sum + (item.grade?.points || 0), 0)
    const totalPossible = gradedItems.reduce((sum, item) => sum + item.pointsPossible, 0)
    const overallPercentage = totalPossible > 0 ? (totalPoints / totalPossible) * 100 : 0

    // Get letter grade
    const getLetterGrade = (percentage: number) => {
        if (percentage >= 97) return "A+"
        if (percentage >= 93) return "A"
        if (percentage >= 90) return "A-"
        if (percentage >= 87) return "B+"
        if (percentage >= 83) return "B"
        if (percentage >= 80) return "B-"
        if (percentage >= 77) return "C+"
        if (percentage >= 73) return "C"
        if (percentage >= 70) return "C-"
        if (percentage >= 67) return "D+"
        if (percentage >= 63) return "D"
        if (percentage >= 60) return "D-"
        return "F"
    }

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
        <div className="space-y-6">
            {/* Overall GPA Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="bg-primary/10 rounded-full p-4">
                            <Award className="h-10 w-10 text-primary" />
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-xl font-semibold mb-1">Overall Performance</h2>
                            <div className="flex items-center gap-2 justify-center md:justify-start">
                                <span className="text-3xl font-bold">{overallPercentage.toFixed(1)}%</span>
                                <span className={`text-2xl font-bold ${getGradeColorClass(overallPercentage)}`}>
                                    {getLetterGrade(overallPercentage)}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">Across {gradedItems.length} graded items</p>
                        </div>
                        <div className="flex-1 w-full md:w-auto">
                            <div className="h-3 w-full rounded-full bg-primary/20 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-primary transition-all duration-500"
                                    style={{ width: `${overallPercentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <Tabs
                    defaultValue="all"
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value as GradeItemType | "all")}
                >
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="assignment">Assignments</TabsTrigger>
                        <TabsTrigger value="quiz">Quizzes</TabsTrigger>
                        <TabsTrigger value="exam">Exams</TabsTrigger>
                        <TabsTrigger value="project">Projects</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative w-full sm:w-auto sm:min-w-[250px]">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search grades..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Grade Items List */}
            <div className="space-y-4">
                {filteredGradeItems.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold">No grades found</h3>
                            <p className="text-muted-foreground mt-2">
                                {searchQuery || activeTab !== "all"
                                    ? "Try adjusting your filters or search query."
                                    : "You don't have any grades yet."}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredGradeItems.map((item, index) => (
                        <Card key={`${item.id}-${index}`} className="overflow-hidden">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{item.title}</CardTitle>
                                        <CardDescription>{item.courseTitle}</CardDescription>
                                    </div>
                                    {renderTypeBadge(item.type)}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Grade Information */}
                                    {item.grade ? (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">
                                                        Score: {item.grade.points}/{item.pointsPossible}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-medium ${getGradeColorClass(item.grade.percentage || 0)}`}>
                                                        {item.grade.percentage?.toFixed(1)}%
                                                    </span>
                                                    {item.grade.letterGrade && (
                                                        <Badge className={`${getGradeColorClass(item.grade.percentage || 0)} bg-opacity-10`}>
                                                            {item.grade.letterGrade}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <Progress value={(item.grade.points / item.pointsPossible) * 100} className="h-2" />

                                            {item.grade.feedback && (
                                                <div className="mt-2 text-sm">
                                                    <p className="font-medium">Feedback:</p>
                                                    <p className="text-muted-foreground">{item.grade.feedback}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Not graded yet</span>
                                            <span className="text-sm">{item.pointsPossible} points possible</span>
                                        </div>
                                    )}

                                    <div className="flex justify-end">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/grades/${item.id}`}>View Details</Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
