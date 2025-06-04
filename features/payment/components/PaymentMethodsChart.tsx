// features/payment/components/PaymentMethodsChart.tsx

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChartIcon } from "lucide-react"
import { Cell, Pie, PieChart } from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart"
import type { PaymentMethodDistribution } from "../types/accounting-types"

interface PaymentMethodsChartProps {
    data: PaymentMethodDistribution[]
    isLoading: boolean
}

// Define colors for different payment methods
const chartConfig = {
    paystack: {
        label: "Paystack",
        color: "oklch(0.7 0.15 77.5)",
    },
    stripe: {
        label: "Stripe",
        color: "hsl(var(--chart-2))",
    },
    "bank transfer": {
        label: "Bank Transfer",
        color: "hsl(var(--chart-3))",
    },
    corporate: {
        label: "Corporate",
        color: "hsl(var(--chart-4))",
    },
    mock: {
        label: "Mock",
        color: "hsl(var(--chart-5))",
    },
}

export function PaymentMethodsChart({ data, isLoading }: PaymentMethodsChartProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Distribution of payment methods used</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        )
    }

    // Transform data for the chart
    const chartData = data.map((item) => ({
        method: item.method.toLowerCase().replace(/\s+/g, ""),
        methodLabel: item.method,
        percentage: item.percentage,
        count: item.count,
        fill:
            chartConfig[item.method.toLowerCase().replace(/\s+/g, "") as keyof typeof chartConfig]?.color ||
            "hsl(var(--chart-1))",
    }))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Distribution of payment methods used</CardDescription>
            </CardHeader>
            <CardContent className="min-h-80 h-auto">
                {data.length > 0 ? (
                    <ChartContainer config={chartConfig}>
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                                formatter={(value, name, props) => [
                                    `${value}% (${props.payload.count} transactions)`,
                                    props.payload.methodLabel,
                                ]}
                            />
                            <Pie data={chartData} dataKey="percentage" nameKey="methodLabel" innerRadius={60} strokeWidth={5}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <ChartLegend
                                content={<ChartLegendContent nameKey="methodLabel" />}
                                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                            />
                        </PieChart>
                    </ChartContainer>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <PieChartIcon className="h-12 w-12 mx-auto mb-2" />
                            <p>No payment method data available</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
