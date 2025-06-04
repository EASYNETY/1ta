// features/payment/components/CourseRevenueChart.tsx

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3 } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import type { CourseRevenue } from "../types/accounting-types"

interface CourseRevenueChartProps {
    data: CourseRevenue[]
    isLoading: boolean
}

const chartConfig = {
    revenue: {
        label: "Revenue",
        color: "oklch(0.7 0.15 77.5)"
    },
    students: {
        label: "Students",
        color: "hsl(var(--chart-2))",
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

    // Transform data for the chart - take top 6 courses by revenue
    const chartData = data
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 6)
        .map((item) => ({
            course: item.courseName.length > 20
                ? `${item.courseName.substring(0, 20)}...`
                : item.courseName,
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
                {data.length > 0 ? (
                    <ChartContainer config={chartConfig}>
                        <BarChart data={chartData} layout="horizontal">
                            <CartesianGrid horizontal={false} />
                            <XAxis
                                type="number"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => `₦${value}k`}
                            />
                            <YAxis
                                dataKey="course"
                                type="category"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                width={120}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent />}
                                formatter={(value, name) => {
                                    if (name === "revenue") {
                                        return [`₦${(Number(value) * 1000).toLocaleString()}`, "Revenue"]
                                    }
                                    return [value, name]
                                }}
                            />
                            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                            <p>No course revenue data available</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}