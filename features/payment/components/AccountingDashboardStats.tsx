"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, CreditCard, CheckCircle, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { AccountingStats } from "../types/accounting-types"

interface AccountingDashboardStatsProps {
    stats: AccountingStats
    isLoading: boolean
}

function PaymentStatsCard({
    title,
    value,
    change,
    trend,
    icon: Icon,
    isLoading,
}: {
    title: string
    value: number | string
    change?: string
    trend?: "up" | "down"
    icon: React.ElementType
    isLoading: boolean
}) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-3 w-20" />
                </CardContent>
            </Card>
        )
    }

    const formatValue = (val: number | string, title: string): string => {
        if (typeof val === "number") {
            if (title.includes("Revenue") || title.includes("Payments")) {
                return new Intl.NumberFormat("en-NG", {
                    style: "currency",
                    currency: "NGN",
                    maximumFractionDigits: 0,
                }).format(val)
            } else if (title === "Reconciled") {
                return `${val}%`
            }
            return val.toString()
        }
        return val
    }

    // Get background color based on title
    const getCardClassName = (title: string) => {
        if (title.includes("Revenue")) return "bg-green-50 dark:bg-green-950/5"
        if (title.includes("Pending")) return "bg-yellow-50 dark:bg-yellow-950/5"
        if (title.includes("Reconciled")) return "bg-blue-50 dark:bg-blue-950/5"
        if (title.includes("Failed")) return "bg-red-50 dark:bg-red-950/5"
        return ""
    }

    return (
        <Card className={getCardClassName(title)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatValue(value, title)}</div>
                {change && trend && (
                    <div className="flex items-center text-xs text-muted-foreground">
                        {trend === "up" ? (
                            <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        ) : (
                            <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                        )}
                        <span className={trend === "up" ? "text-green-500" : "text-red-500"}>{change}</span>
                        <span className="ml-1">from last period</span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export function AccountingDashboardStats({ stats, isLoading }: AccountingDashboardStatsProps) {
    // Calculate percentage change for revenue
    let revenueChange = "0%"
    let revenueTrend: "up" | "down" = "up"

    if (stats.totalRevenueLastPeriod && stats.totalRevenueLastPeriod > 0) {
        const changePercent = ((stats.totalRevenue - stats.totalRevenueLastPeriod) / stats.totalRevenueLastPeriod) * 100
        revenueChange = `${Math.abs(changePercent).toFixed(1)}%`
        revenueTrend = changePercent >= 0 ? "up" : "down"
    }

    const reconciledPercentage =
        stats.totalTransactionCount > 0
            ? Math.round((stats.reconciledTransactionCount / stats.totalTransactionCount) * 100)
            : 0

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <PaymentStatsCard
                title="Total Revenue"
                value={stats.totalRevenue}
                change={revenueChange}
                trend={revenueTrend}
                icon={DollarSign}
                isLoading={isLoading}
            />
            <PaymentStatsCard
                title="Pending Payments"
                value={stats.pendingPaymentsAmount}
                icon={CreditCard}
                isLoading={isLoading}
            />
            <PaymentStatsCard title="Reconciled" value={reconciledPercentage} icon={CheckCircle} isLoading={isLoading} />
            <PaymentStatsCard
                title="Failed Transactions"
                value={stats.failedTransactionCount}
                icon={AlertCircle}
                isLoading={isLoading}
            />
        </div>
    )
}
