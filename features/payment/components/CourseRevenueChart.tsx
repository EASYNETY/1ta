"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { CourseRevenue } from "../types/accounting-types"

interface CourseRevenueChartProps {
    data: CourseRevenue[]
    isLoading: boolean
}

const chartConfig = {
    revenue: {
        label: "Revenue",
        theme: {
            light: "oklch(0.646 0.14 77.5)", // Primary color from globals.css
            dark: "oklch(0.7 0.15 77.5)",
        },
    },
    students: {
        label: "Students",
        theme: {
            light: "#3B82F6", // Blue
            dark: "#60A5FA",
        },
    },
}

export function CourseRevenueChart({ data, isLoading }: CourseRevenueChartProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Course Revenue Overview</CardTitle>
                    <CardDescription>Revenue and enrollment by course</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        )
    }

    // Handle empty data case by providing placeholder data for UI purposes
    const processedData =
        data.length > 0
            ? data
            : [
                {
                    courseId: "unknown-1",
                    courseName: "Unknown Course 1",
                    totalRevenue: 0,
                    enrolledStudents: 0,
                    completionRate: 0,
                    revenueChangePercentage: 0,
                },
                {
                    courseId: "unknown-2",
                    courseName: "Unknown Course 2",
                    totalRevenue: 0,
                    enrolledStudents: 0,
                    completionRate: 0,
                    revenueChangePercentage: 0,
                },
            ]

    // Transform data for the chart - take top 6 courses by revenue
    const chartData = processedData
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 6)
        .map((item) => ({
            course: item.courseName.length > 20 ? `${item.courseName.substring(0, 20)}...` : item.courseName,
            revenue: item.totalRevenue / 1000, // Convert to thousands
            students: item.enrolledStudents,
        }))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Course Revenue Overview</CardTitle>
                <CardDescription>Top performing courses by revenue</CardDescription>
            </CardHeader>
            <CardContent className="min-h-80 h-auto">
                <ChartContainer config={chartConfig}>
                    <BarChart data={chartData} layout="horizontal">
                        <CartesianGrid horizontal={false} />
                        <XAxis
                            type="number"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => {
                                // Convert to number to remove any leading zeros
                                const cleanValue = Number(value);
                                return `₦${cleanValue}k`;
                            }}
                        />
                        <YAxis dataKey="course" type="category" tickLine={false} tickMargin={10} axisLine={false} width={120} />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                            formatter={(value, name) => {
                                if (name === "revenue") {
                                    // Convert to number to remove any leading zeros
                                    const cleanAmount = Number(value) * 1000;
                                    return [`₦${cleanAmount.toLocaleString('en-NG')}`, "Revenue"];
                                }
                                return [value, name]
                            }}
                        />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
