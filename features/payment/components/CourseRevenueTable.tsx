"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, ArrowUpDown, Download } from "lucide-react"
import type { CourseRevenue } from "../types/accounting-types"
import { exportCourseRevenueReports } from "../utils/export-utils"

interface CourseRevenueTableProps {
    data: CourseRevenue[]
    isLoading: boolean
}

type SortField = "courseName" | "totalRevenue" | "enrolledStudents" | "completionRate"
type SortDirection = "asc" | "desc"

export function CourseRevenueTable({ data, isLoading }: CourseRevenueTableProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [sortField, setSortField] = useState<SortField>("totalRevenue")
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("desc")
        }
    }

    const handleExport = () => {
        exportCourseRevenueReports(filteredAndSortedData)
    }

    const formatCurrency = (amount: number) => {
        // Convert to number to remove any leading zeros
        const cleanAmount = Number(amount);
        
        // For NGN, use the ₦ symbol directly to ensure consistent display
        return `₦${cleanAmount.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
    }

    const filteredAndSortedData = [...data]
        .filter((course) => course.courseName.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (sortField === "courseName") {
                return sortDirection === "asc"
                    ? a.courseName.localeCompare(b.courseName)
                    : b.courseName.localeCompare(a.courseName)
            } else {
                const aValue = a[sortField] || 0
                const bValue = b[sortField] || 0
                return sortDirection === "asc" ? aValue - bValue : bValue - aValue
            }
        })

    if (isLoading) {
        return (
            <Card className="bg-slate-50 dark:bg-slate-950/5">
                <CardHeader>
                    <CardTitle>Course Revenue</CardTitle>
                    <CardDescription>Revenue breakdown by course</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-slate-50 dark:bg-slate-950/5">
            <CardHeader>
                <CardTitle>Course Revenue</CardTitle>
                <CardDescription>Revenue breakdown by course</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 w-full"
                        />
                    </div>
                    <Select value={sortField} onValueChange={(value) => handleSort(value as SortField)}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="courseName">Course Name</SelectItem>
                            <SelectItem value="totalRevenue">Revenue</SelectItem>
                            <SelectItem value="enrolledStudents">Students</SelectItem>
                            <SelectItem value="completionRate">Completion Rate</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                    >
                        <ArrowUpDown className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">Course</TableHead>
                                <TableHead className="text-right">Revenue</TableHead>
                                <TableHead className="text-right">Students</TableHead>
                                <TableHead className="text-right">Avg per Student</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        {searchTerm ? "No courses found matching your search." : "No course revenue data available yet."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAndSortedData.map((course) => (
                                    <TableRow key={course.courseId}>
                                        <TableCell className="font-medium">{course.courseName}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(course.totalRevenue)}</TableCell>
                                        <TableCell className="text-right">{course.enrolledStudents}</TableCell>
                                        <TableCell className="text-right font-mono">
                                            {formatCurrency(course.enrolledStudents > 0 ? course.totalRevenue / course.enrolledStudents : 0)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
