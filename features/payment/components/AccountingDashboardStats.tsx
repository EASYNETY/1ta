"use client"

import React, { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useAccountingData } from "../components/AccountingDataProvider"
import type { AccountingStats } from "../types/accounting-types"

interface AccountingDashboardStatsProps {
    // Props are now optional since we get data from the hook
    stats?: AccountingStats
    isLoading?: boolean
    paymentHistory?: any[]
}

function PaymentStatsCard({
    title,
    value,
    change,
    trend,
    icon: Icon,
    isLoading,
    subtitle,
}: {
    title: string
    value: number | string
    change?: string
    trend?: "up" | "down"
    icon: React.ElementType
    isLoading: boolean
    subtitle?: string
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

    // Consistent currency formatting across all browsers
    const formatValue = (val: number | string, title: string): string => {
        if (typeof val === "number") {
            if (title.includes("Revenue") || title.includes("Payments") || title.includes("Pending")) {
                const cleanAmount = Number(val) || 0
                
                // Use consistent formatting to avoid browser differences
                return `₦${cleanAmount.toLocaleString('en-NG', { 
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0 
                })}`;
            } else if (title === "Success Rate") {
                return `${val}%`
            }
            return val.toString()
        }
        return val
    }

    // Get background color based on title
    const getCardClassName = (title: string) => {
        if (title.includes("Revenue")) return "bg-green-50 dark:bg-green-950/5"
        if (title.includes("Success")) return "bg-blue-50 dark:bg-blue-950/5"
        if (title.includes("Pending")) return "bg-yellow-50 dark:bg-yellow-950/5"
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
                <div className="text-xs text-muted-foreground">
                    {subtitle || (change && trend && (
                        <div className="flex items-center">
                            {trend === "up" ? (
                                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                            ) : (
                                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                            )}
                            <span className={trend === "up" ? "text-green-500" : "text-red-500"}>{change}</span>
                            <span className="ml-1">from last period</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export function AccountingDashboardStats({ 
    stats: propStats, 
    isLoading: propIsLoading, 
    paymentHistory: propPaymentHistory 
}: AccountingDashboardStatsProps = {}) {
    const { stats: hookStats, isLoading: hookIsLoading, debugInfo, refreshData } = useAccountingData();
    
    // Use hook data if props are not provided
    const stats = propStats !== undefined ? propStats : hookStats;
    const isLoading = propIsLoading !== undefined ? propIsLoading : hookIsLoading;

    // Debug effect
    useEffect(() => {
        console.log('[AccountingDashboardStats] Render with data:', {
            hasStats: !!stats,
            statsData: stats,
            isLoading,
            debugInfo,
        });

        // If no stats and not loading, try to refresh
        if (!isLoading && !stats) {
            console.log('[AccountingDashboardStats] No stats, attempting refresh...');
            refreshData();
        }
    }, [stats, isLoading, debugInfo, refreshData]);
    
    // Calculate derived stats
    const derivedStats = React.useMemo(() => {
        if (!stats) {
            return {
                revenueChange: "0%",
                revenueTrend: "up" as const,
                successRate: 0,
                pendingPercentage: 0,
                successfulTransactions: 0,
            };
        }

        // Calculate percentage change for revenue
        let revenueChange = "0%"
        let revenueTrend: "up" | "down" = "up"

        if (stats.totalRevenueLastPeriod && stats.totalRevenueLastPeriod > 0) {
            const changePercent = ((stats.totalRevenue - stats.totalRevenueLastPeriod) / stats.totalRevenueLastPeriod) * 100
            revenueChange = `${Math.abs(changePercent).toFixed(1)}%`
            revenueTrend = changePercent >= 0 ? "up" : "down"
        }

        // Calculate success rate
        const successRate = stats.totalTransactionCount > 0
            ? Math.round(((stats.totalTransactionCount - stats.failedTransactionCount) / stats.totalTransactionCount) * 100)
            : 0

        // Calculate pending percentage
        const pendingPercentage = (stats.totalTransactionCount > 0 && stats.totalRevenue > 0)
            ? Math.round((stats.pendingPaymentsAmount / (stats.totalRevenue + stats.pendingPaymentsAmount)) * 100)
            : 0

        // Calculate successful transactions
        const successfulTransactions = stats.totalTransactionCount - stats.failedTransactionCount

        return {
            revenueChange,
            revenueTrend,
            successRate,
            pendingPercentage,
            successfulTransactions
        }
    }, [stats])

    // Show empty state if no stats and not loading
    if (!isLoading && !stats) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">No Data</CardTitle>
                            <div className="h-4 w-4 bg-muted rounded" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₦0</div>
                            <div className="text-xs text-muted-foreground">
                                No payment data available yet
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <PaymentStatsCard
                title="Total Revenue"
                value={stats?.totalRevenue || 0}
                change={derivedStats.revenueChange}
                trend={derivedStats.revenueTrend}
                icon={DollarSign}
                isLoading={isLoading}
            />
            <PaymentStatsCard
                title="Success Rate"
                value={derivedStats.successRate}
                subtitle={`${derivedStats.successfulTransactions} of ${stats?.totalTransactionCount || 0} transactions`}
                icon={CheckCircle}
                isLoading={isLoading}
            />
            <PaymentStatsCard 
                title="Pending Payments" 
                value={stats?.pendingPaymentsAmount || 0}
                subtitle={`${derivedStats.pendingPercentage}% of total transaction value`}
                icon={RefreshCw} 
                isLoading={isLoading} 
            />
            <PaymentStatsCard
                title="Failed Transactions"
                value={stats?.failedTransactionCount || 0}
                subtitle={`${(stats?.totalTransactionCount || 0) > 0 ? Math.round(((stats?.failedTransactionCount || 0) / (stats?.totalTransactionCount || 1)) * 100) : 0}% of all transactions`}
                icon={XCircle}
                isLoading={isLoading}
            />
        </div>
    )
}