"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { format, parseISO } from "date-fns"

interface DailyRevenueData {
  date: string
  total: number
  currency: string
}

interface DailyRevenueTrendsChartProps {
  data: DailyRevenueData[]
  isLoading: boolean
}

export function DailyRevenueTrendsChart({ data, isLoading }: DailyRevenueTrendsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>Daily revenue overview</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  // Transform data for the chart
  const chartData = data.length > 0 
    ? data.map((item) => ({
        date: item.date,
        revenue: Number(item.total),
        formattedDate: format(parseISO(item.date), "MMM dd"),
      }))
    : Array.from({ length: 7 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: format(date, "yyyy-MM-dd"),
          revenue: 0,
          formattedDate: format(date, "MMM dd"),
        };
      })

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md p-2 shadow-sm">
          <p className="font-medium">{format(parseISO(label), "MMM dd, yyyy")}</p>
          <p className="text-sm text-primary">
            Revenue: ₦{payload[0].value.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  // Format Y-axis ticks
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `₦${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `₦${(value / 1000).toFixed(0)}K`
    }
    return `₦${value}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trends</CardTitle>
        <CardDescription>Daily revenue overview</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(parseISO(value), "MMM dd")}
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis 
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--primary)" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>No revenue data available for the selected period</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DailyRevenueTrendsChart