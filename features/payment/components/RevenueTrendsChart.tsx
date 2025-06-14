"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3 } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { MonthlyRevenue } from "../types/accounting-types"

interface RevenueTrendsChartProps {
    data: MonthlyRevenue[]
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
}

export function RevenueTrendsChart({ data, isLoading }: RevenueTrendsChartProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Trends</CardTitle>
                    <CardDescription>Monthly revenue overview</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        )
    }

    // Transform data for the chart
    const chartData = data.map((item) => ({
        month: item.month,
        revenue: item.revenue / 1000, // Convert to thousands for better display
    }))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue overview</CardDescription>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <ChartContainer config={chartConfig}>
                        <BarChart data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <YAxis 
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={8} 
                                tickFormatter={(value) => {
                                    // Convert to number to remove any leading zeros
                                    const cleanValue = Number(value);
                                    return `₦${cleanValue}k`;
                                }} 
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                                formatter={(value) => {
                                    // Convert to number to remove any leading zeros
                                    const cleanAmount = Number(value) * 1000;
                                    return [`₦${cleanAmount.toLocaleString('en-NG')}`, "Revenue"];
                                }}
                            />
                            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={8} />
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                            <p>No revenue data available</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
