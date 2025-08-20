"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useAccountingData } from "../components/AccountingDataProvider"

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

interface CourseRevenueChartProps {
    // Props are now optional since we get data from the hook
    data?: any[]
    isLoading?: boolean
}

export function CourseRevenueChart({ data: propData, isLoading: propIsLoading }: CourseRevenueChartProps = {}) {
    const { courseRevenues, isLoading: hookIsLoading, debugInfo, refreshData } = useAccountingData();
    
    // Use hook data if props are not provided
    const data = propData !== undefined ? propData : courseRevenues;
    const isLoading = propIsLoading !== undefined ? propIsLoading : hookIsLoading;

    // Debug effect
    useEffect(() => {
        console.log('[CourseRevenueChart] Render with data:', {
            dataLength: data?.length || 0,
            isLoading,
            debugInfo,
        });

        // If no data and not loading, try to refresh
        if (!isLoading && (!data || data.length === 0)) {
            console.log('[CourseRevenueChart] No data, attempting refresh...');
            refreshData();
        }
    }, [data, isLoading, debugInfo, refreshData]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Revenue by Course (Top 5)</CardTitle>
                    <CardDescription>Revenue and enrollment by course</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        )
    }

    // Process data for the chart
    const processedData = data && data.length > 0 
        ? data
            .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
            .slice(0, 5) // Top 5 courses
            .map((item) => ({
                course: (item.courseName || item.description || 'Unknown Course').length > 20 
                    ? `${(item.courseName || item.description || 'Unknown Course').substring(0, 20)}...` 
                    : (item.courseName || item.description || 'Unknown Course'),
                revenue: (item.totalRevenue || 0) / 1000, // Convert to thousands
                students: item.enrolledStudents || 0,
                fullName: item.courseName || item.description || 'Unknown Course',
                fullRevenue: item.totalRevenue || 0,
            }))
        : [];

    // Show empty state if no data
    if (!processedData.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Revenue by Course (Top 5)</CardTitle>
                    <CardDescription>Top performing courses by revenue</CardDescription>
                </CardHeader>
                <CardContent className="min-h-80 h-auto flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        <p className="text-lg mb-2">No course revenue data available</p>
                        <p className="text-sm">Data will appear here once transactions are processed</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Revenue by Course (Top 5)</CardTitle>
                <CardDescription>Top performing courses by revenue</CardDescription>
            </CardHeader>
            <CardContent className="min-h-80 h-auto">
                <ChartContainer config={chartConfig}>
                    <BarChart data={processedData} layout="horizontal">
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
                            formatter={(value, name, props) => {
                                if (name === "revenue") {
                                    // Convert to number to remove any leading zeros
                                    const cleanAmount = Number(value) * 1000;
                                    return [
                                        `₦${cleanAmount.toLocaleString('en-NG')}`, 
                                        "Revenue"
                                    ];
                                }
                                return [value, name]
                            }}
                            labelFormatter={(label, payload) => {
                                // Show full course name in tooltip
                                const item = payload?.[0]?.payload;
                                return item?.fullName || label;
                            }}
                        />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}