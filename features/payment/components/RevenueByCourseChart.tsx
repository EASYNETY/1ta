// features/payments/components/RevenueByCourseChart.tsx

"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import type { RevenueDataPoint } from "./RevenueByCourseDistribution"

interface RevenueByCourseChartProps {
    data: RevenueDataPoint[];
    isLoading: boolean;
}

export function RevenueByCourseChart({ data, isLoading }: RevenueByCourseChartProps) {
    const chartConfig = {
        revenue: {
            label: "Revenue",
            color: "oklch(0.7 0.15 77.5)",
        },
    };

    const formatCurrency = (value: number) => {
        if (value >= 1000) {
            return `₦${(value / 1000).toFixed(1)}k`;
        }
        return `₦${value}`;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Revenue-Generating Courses</CardTitle>
                <CardDescription>Revenue by course for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-[250px] w-full" />
                ) : (
                    <div className="h-[250px]">
                        <ChartContainer config={chartConfig}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data}
                                    layout="vertical"
                                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                                >
                                    <CartesianGrid horizontal={false} />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 12 }}
                                        width={150} // Adjust width to prevent long names from being cut off
                                        // Custom formatter to truncate long course names
                                        tickFormatter={(value) =>
                                            value.length > 25 ? `${value.substring(0, 25)}...` : value
                                        }
                                    />
                                    <XAxis dataKey="revenue" type="number" hide />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent
                                            formatter={(value) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(Number(value))}
                                            labelFormatter={(label) => <div className="font-bold">{label}</div>}
                                        />}
                                    />
                                    <Bar
                                        dataKey="revenue"
                                        fill={chartConfig.revenue.color}
                                        radius={4}
                                        // Add a label inside the bar for better readability
                                        label={{ position: 'right', fill: 'gray', fontSize: 12, formatter: formatCurrency }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
