"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, CreditCard, CheckCircle, AlertCircle, XCircle, RefreshCw } from "lucide-react"
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

    const formatValue = (val: number | string, title: string): string => {
        if (typeof val === "number") {
            if (title.includes("Revenue") || title.includes("Payments") || title.includes("Pending")) {
                // Convert to number to remove any leading zeros
                const cleanAmount = Number(val);
                
                // For NGN, use the ₦ symbol directly to ensure consistent display
                return `₦${cleanAmount.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
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

// Calculate stats from payment history
function calculateStatsFromPaymentHistory(payments: PaymentRecord[]): AccountingStats {
    // Initialize stats object
    const stats: AccountingStats = {
        totalRevenue: 0,
        pendingPaymentsAmount: 0,
        reconciledTransactionCount: 0,
        totalTransactionCount: payments.length,
        failedTransactionCount: 0,
    }

    // Get current date and date 30 days ago for last period comparison
    const currentDate = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(currentDate.getDate() - 30)
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(currentDate.getDate() - 60)

    // Initialize last period revenue
    let lastPeriodRevenue = 0

    // Process each payment
    payments.forEach(payment => {
        try {
            const paymentDate = new Date(payment.createdAt)
            
            // Ensure amount is a number
            let paymentAmount = 0
            if (typeof payment.amount === 'number') {
                paymentAmount = payment.amount
            } else if (typeof payment.amount === 'string') {
                paymentAmount = parseFloat(payment.amount)
                if (isNaN(paymentAmount)) paymentAmount = 0
            }

            // Count total transactions
            if (paymentDate >= thirtyDaysAgo) {
                // Current period (last 30 days)
                if (payment.status === 'succeeded') {
                    stats.totalRevenue += paymentAmount
                    if (payment.reconciliationStatus === 'reconciled') {
                        stats.reconciledTransactionCount++
                    }
                } else if (payment.status === 'pending' || payment.status === 'processing' || payment.status === 'requires_action') {
                    stats.pendingPaymentsAmount += paymentAmount
                } else if (payment.status === 'failed') {
                    stats.failedTransactionCount++
                }
            } else if (paymentDate >= sixtyDaysAgo && paymentDate < thirtyDaysAgo) {
                // Last period (30-60 days ago)
                if (payment.status === 'succeeded') {
                    lastPeriodRevenue += paymentAmount
                }
            }
        } catch (error) {
            console.error("Error processing payment:", error, payment)
        }
    })

    // Set last period revenue for comparison
    stats.totalRevenueLastPeriod = lastPeriodRevenue

    return stats
}

export function AccountingDashboardStats({ stats, isLoading, paymentHistory = [] }: AccountingDashboardStatsProps) {
    // Use provided stats or calculate from payment history
    const calculatedStats = stats || (paymentHistory.length > 0 ? calculateStatsFromPaymentHistory(paymentHistory) : {
        totalRevenue: 0,
        totalRevenueLastPeriod: 0,
        pendingPaymentsAmount: 0,
        reconciledTransactionCount: 0,
        totalTransactionCount: 0,
        failedTransactionCount: 0,
    })
    
    // Calculate percentage change for revenue
    let revenueChange = "0%"
    let revenueTrend: "up" | "down" = "up"

    if (calculatedStats.totalRevenueLastPeriod && calculatedStats.totalRevenueLastPeriod > 0) {
        const changePercent = ((calculatedStats.totalRevenue - calculatedStats.totalRevenueLastPeriod) / calculatedStats.totalRevenueLastPeriod) * 100
        revenueChange = `${Math.abs(changePercent).toFixed(1)}%`
        revenueTrend = changePercent >= 0 ? "up" : "down"
    }

    // Calculate success rate
    const successRate =
        calculatedStats.totalTransactionCount > 0
            ? Math.round(((calculatedStats.totalTransactionCount - calculatedStats.failedTransactionCount) / calculatedStats.totalTransactionCount) * 100)
            : 0

    // Calculate pending percentage
    const pendingPercentage =
        calculatedStats.totalTransactionCount > 0 && calculatedStats.totalRevenue > 0
            ? Math.round((calculatedStats.pendingPaymentsAmount / (calculatedStats.totalRevenue + calculatedStats.pendingPaymentsAmount)) * 100)
            : 0

    // Calculate successful transactions
    const successfulTransactions = calculatedStats.totalTransactionCount - calculatedStats.failedTransactionCount

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <PaymentStatsCard
                title="Total Revenue"
                value={calculatedStats.totalRevenue}
                change={revenueChange}
                trend={revenueTrend}
                icon={DollarSign}
                isLoading={isLoading}
            />
            <PaymentStatsCard
                title="Success Rate"
                value={successRate}
                subtitle={`${successfulTransactions} of ${calculatedStats.totalTransactionCount} transactions`}
                icon={CheckCircle}
                isLoading={isLoading}
            />
            <PaymentStatsCard 
                title="Pending Payments" 
                value={calculatedStats.pendingPaymentsAmount}
                subtitle={`${pendingPercentage}% of total transaction value`}
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
