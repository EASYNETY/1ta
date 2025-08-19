"use client"

import type React from "react"
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, CreditCard, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { AccountingStats } from "../types/accounting-types"
import type { PaymentRecord } from "../types/payment-types"

interface AccountingDashboardStatsProps {
    stats?: AccountingStats
    isLoading: boolean
    paymentHistory?: PaymentRecord[]
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

// Enhanced calculation with better error handling and consistency
function calculateStatsFromPaymentHistory(payments: PaymentRecord[]): AccountingStats {
    // Initialize stats object with defaults
    const stats: AccountingStats = {
        totalRevenue: 0,
        pendingPaymentsAmount: 0,
        reconciledTransactionCount: 0,
        totalTransactionCount: 0,
        failedTransactionCount: 0,
        totalRevenueLastPeriod: 0,
    }

    // Validate input
    if (!Array.isArray(payments) || payments.length === 0) {
        return stats
    }

    // Get current date and date ranges for comparison
    const currentDate = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(currentDate.getDate() - 30)
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(currentDate.getDate() - 60)

    // Initialize tracking variables
    let currentPeriodRevenue = 0
    let lastPeriodRevenue = 0
    let currentPeriodTransactions = 0
    let currentPeriodSuccessful = 0
    let currentPeriodPending = 0
    let currentPeriodFailed = 0
    let currentPeriodReconciled = 0
    let currentPeriodPendingAmount = 0

    // Process each payment with consistent logic
    payments.forEach(payment => {
        try {
            // Parse date consistently
            const paymentDate = new Date(payment.createdAt)
            
            // Validate and parse amount consistently
            let paymentAmount = 0
            const rawAmount = payment.amount
            if (typeof rawAmount === 'number') {
                paymentAmount = rawAmount
            } else if (typeof rawAmount === 'string') {
                const parsed = parseFloat(rawAmount)
                paymentAmount = isNaN(parsed) ? 0 : parsed
            }

            // Normalize status for consistency
            const status = (payment.status || '').toLowerCase().trim()
            
            // Classify transactions by date period
            if (paymentDate >= thirtyDaysAgo) {
                // Current period (last 30 days)
                currentPeriodTransactions++
                
                if (status === 'succeeded' || status === 'success') {
                    currentPeriodRevenue += paymentAmount
                    currentPeriodSuccessful++
                    
                    if (payment.reconciliationStatus === 'reconciled') {
                        currentPeriodReconciled++
                    }
                } else if (['pending', 'processing', 'requires_action'].includes(status)) {
                    currentPeriodPending++
                    currentPeriodPendingAmount += paymentAmount
                } else if (status === 'failed') {
                    currentPeriodFailed++
                }
            } else if (paymentDate >= sixtyDaysAgo && paymentDate < thirtyDaysAgo) {
                // Last period (30-60 days ago) - only count successful for revenue comparison
                if (status === 'succeeded' || status === 'success') {
                    lastPeriodRevenue += paymentAmount
                }
            }
        } catch (error) {
            console.warn("Error processing payment in calculations:", error, payment)
            // Continue processing other payments even if one fails
        }
    })

    // Set calculated values
    stats.totalRevenue = currentPeriodRevenue
    stats.totalRevenueLastPeriod = lastPeriodRevenue
    stats.pendingPaymentsAmount = currentPeriodPendingAmount
    stats.reconciledTransactionCount = currentPeriodReconciled
    stats.totalTransactionCount = currentPeriodTransactions
    stats.failedTransactionCount = currentPeriodFailed

    return stats
}

export function AccountingDashboardStats({ stats, isLoading, paymentHistory = [] }: AccountingDashboardStatsProps) {
    // Memoize calculations to ensure consistency across renders
    const calculatedStats = useMemo(() => {
        // Prefer provided stats, but fallback to calculation if needed
        if (stats && typeof stats === 'object') {
            return {
                ...stats,
                // Ensure all required fields exist with defaults
                totalRevenue: Number(stats.totalRevenue) || 0,
                totalRevenueLastPeriod: Number(stats.totalRevenueLastPeriod) || 0,
                pendingPaymentsAmount: Number(stats.pendingPaymentsAmount) || 0,
                reconciledTransactionCount: Number(stats.reconciledTransactionCount) || 0,
                totalTransactionCount: Number(stats.totalTransactionCount) || 0,
                failedTransactionCount: Number(stats.failedTransactionCount) || 0,
            }
        }
        
        if (paymentHistory && paymentHistory.length > 0) {
            return calculateStatsFromPaymentHistory(paymentHistory)
        }
        
        // Return default stats if no data available
        return {
            totalRevenue: 0,
            totalRevenueLastPeriod: 0,
            pendingPaymentsAmount: 0,
            reconciledTransactionCount: 0,
            totalTransactionCount: 0,
            failedTransactionCount: 0,
        }
    }, [stats, paymentHistory])
    
    // Memoize derived calculations
    const derivedStats = useMemo(() => {
        // Calculate percentage change for revenue
        let revenueChange = "0%"
        let revenueTrend: "up" | "down" = "up"

        if (calculatedStats.totalRevenueLastPeriod && calculatedStats.totalRevenueLastPeriod > 0) {
            const changePercent = ((calculatedStats.totalRevenue - calculatedStats.totalRevenueLastPeriod) / calculatedStats.totalRevenueLastPeriod) * 100
            revenueChange = `${Math.abs(changePercent).toFixed(1)}%`
            revenueTrend = changePercent >= 0 ? "up" : "down"
        }

        // Calculate success rate
        const successRate = calculatedStats.totalTransactionCount > 0
            ? Math.round(((calculatedStats.totalTransactionCount - calculatedStats.failedTransactionCount) / calculatedStats.totalTransactionCount) * 100)
            : 0

        // Calculate pending percentage
        const pendingPercentage = (calculatedStats.totalTransactionCount > 0 && calculatedStats.totalRevenue > 0)
            ? Math.round((calculatedStats.pendingPaymentsAmount / (calculatedStats.totalRevenue + calculatedStats.pendingPaymentsAmount)) * 100)
            : 0

        // Calculate successful transactions
        const successfulTransactions = calculatedStats.totalTransactionCount - calculatedStats.failedTransactionCount

        return {
            revenueChange,
            revenueTrend,
            successRate,
            pendingPercentage,
            successfulTransactions
        }
    }, [calculatedStats])

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <PaymentStatsCard
                title="Total Revenue"
                value={calculatedStats.totalRevenue}
                change={derivedStats.revenueChange}
                trend={derivedStats.revenueTrend}
                icon={DollarSign}
                isLoading={isLoading}
            />
            <PaymentStatsCard
                title="Success Rate"
                value={derivedStats.successRate}
                subtitle={`${derivedStats.successfulTransactions} of ${calculatedStats.totalTransactionCount} transactions`}
                icon={CheckCircle}
                isLoading={isLoading}
            />
            <PaymentStatsCard 
                title="Pending Payments" 
                value={calculatedStats.pendingPaymentsAmount}
                subtitle={`${derivedStats.pendingPercentage}% of total transaction value`}
                icon={RefreshCw} 
                isLoading={isLoading} 
            />
            <PaymentStatsCard
                title="Failed Transactions"
                value={calculatedStats.failedTransactionCount}
                subtitle={`${calculatedStats.totalTransactionCount > 0 ? Math.round((calculatedStats.failedTransactionCount / calculatedStats.totalTransactionCount) * 100) : 0}% of all transactions`}
                icon={XCircle}
                isLoading={isLoading}
            />
        </div>
    )
}