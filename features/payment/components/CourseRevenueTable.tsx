"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, ArrowUpDown, Download } from "lucide-react"
import { useAccountingData } from "../components/AccountingDataProvider"
import type { CourseRevenue } from "../types/accounting-types"

interface CourseRevenueTableProps {
    // Props are now optional since we get data from the hook
    data?: CourseRevenue[]
    isLoading?: boolean
}

type SortField = "courseName" | "totalRevenue" | "enrolledStudents" | "completionRate"
type SortDirection = "asc" | "desc"

// Mock export function since we don't have the actual implementation
const exportCourseRevenueReports = (data: CourseRevenue[]) => {
    console.log('[CourseRevenueTable] Export triggered for', data.length, 'courses');
    // Create CSV content
    const headers = ['Course Name', 'Revenue', 'Students', 'Average per Student'];
    const rows = data.map(course => [
        course.courseName || course.description || 'Unknown Course',
        course.totalRevenue || 0,
        course.enrolledStudents || 0,
        course.enrolledStudents > 0 ? (course.totalRevenue || 0) / course.enrolledStudents : 0
    ]);
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `course_revenue_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export function CourseRevenueTable({ data: propData, isLoading: propIsLoading }: CourseRevenueTableProps = {}) {
    const { courseRevenues, isLoading: hookIsLoading, debugInfo, refreshData } = useAccountingData();
    
    // Use hook data if props are not provided
    const data = propData !== undefined ? propData : courseRevenues;
    const isLoading = propIsLoading !== undefined ? propIsLoading : hookIsLoading;
    
    const [searchTerm, setSearchTerm] = useState("")
    const [sortField, setSortField] = useState<SortField>("totalRevenue")
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

    // Debug effect
    useEffect(() => {
        console.log('[CourseRevenueTable] Render with data:', {
            dataLength: data?.length || 0,
            isLoading,
            debugInfo,
        });

        // If no data and not loading, try to refresh
        if (!isLoading && (!data || data.length === 0)) {
            console.log('[CourseRevenueTable] No data, attempting refresh...');
            refreshData();
        }
    }, [data, isLoading, debugInfo, refreshData]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("desc")
        }
    }

    const handleExport = () => {
        if (data && data.length > 0) {
            exportCourseRevenueReports(filteredAndSortedData)
        }
    }

    const formatCurrency = (amount: number) => {
        // Convert to number to remove any leading zeros
        const cleanAmount = Number(amount);

        // For NGN, use the ₦ symbol directly to ensure consistent display
        return `₦${cleanAmount.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
    }

    const filteredAndSortedData = (data || [])
        .filter((course) => {
            const courseName = course.courseName || course.description || 'Unknown Course';
            return courseName.toLowerCase().includes(searchTerm.toLowerCase());
        })
        .sort((a, b) => {
            if (sortField === "courseName") {
                const aName = a.courseName || a.description || 'Unknown Course';
                const bName = b.courseName || b.description || 'Unknown Course';
                return sortDirection === "asc"
                    ? aName.localeCompare(bName)
                    : bName.localeCompare(aName)
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
                    <CardTitle>Course Revenue (List)</CardTitle>
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
                <CardTitle>Course Revenue (List)</CardTitle>
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
                    <Button variant="outline" onClick={handleExport} disabled={!data || data.length === 0}>
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
                                        {searchTerm 
                                            ? "No courses found matching your search." 
                                            : "No course revenue data available yet."
                                        }
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAndSortedData.map((course, index) => (
                                    <TableRow key={course.courseId || `course-${index}`}>
                                        <TableCell className="font-medium">
                                            {(() => {
                                                // Use the available course name data
                                                const courseName = course.courseName || 
                                                                 course.description || 
                                                                 (course as any).invoice?.description || 
                                                                 "Unknown Course";

                                                // Remove the "Course enrolment:" prefix (if present)
                                                const cleanedName = courseName.replace(/^Course enrolment:\s*/, '').trim();

                                                // Truncate if longer than 30 characters
                                                return cleanedName.length > 30 
                                                    ? `${cleanedName.substring(0, 30)}...` 
                                                    : cleanedName;
                                            })()}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {formatCurrency(course.totalRevenue || 0)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {course.enrolledStudents || 0}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {formatCurrency(
                                                (course.enrolledStudents || 0) > 0 
                                                    ? (course.totalRevenue || 0) / (course.enrolledStudents || 1)
                                                    : 0
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                
                {/* Debug info (remove in production) */}
                {debugInfo && debugInfo.paymentsCount === 0 && !isLoading && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/10 border border-yellow-200 dark:border-yellow-800 rounded-md">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            Debug: No payment data found. Status: {debugInfo.status}, 
                            Total Revenue: {debugInfo.totalRevenue}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}