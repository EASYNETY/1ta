// app/(authenticated)/accounting/analytics/page.tsx

"use client"

import { useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { AccountingGuard } from "@/components/auth/PermissionGuard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, Download } from "lucide-react"

// Import accounting components
import { CourseRevenueTable } from "@/features/payment/components/CourseRevenueTable"
import { RevenueTrendsChart } from "@/features/payment/components/RevenueTrendsChart"
import { PaymentMethodsChart } from "@/features/payment/components/PaymentMethodsChart"
import { AccountingQuickActions } from "@/features/payment/components/AccountingQuickActions"
import { DateRangeFilter } from "@/features/payment/components/DateRangeFilter"

// Import accounting store
import {
    fetchAccountingData,
    selectCourseRevenues,
    selectMonthlyRevenueTrend,
    selectPaymentMethodDistribution,
    selectAccountingStatus,
    selectAccountingError,
    clearAccountingError,
} from "@/features/payment/store/accounting-slice"

import { exportComprehensiveAccountingReport } from "@/features/payment/utils/export-utils"
import { CourseRevenueChart } from "@/features/payment/components/CourseRevenueChart"

export default function AccountingAnalytics() {
    const dispatch = useAppDispatch()

    // Selectors
    const courseRevenues = useAppSelector(selectCourseRevenues)
    const monthlyRevenue = useAppSelector(selectMonthlyRevenueTrend)
    const paymentMethods = useAppSelector(selectPaymentMethodDistribution)
    const status = useAppSelector(selectAccountingStatus)
    const error = useAppSelector(selectAccountingError)

    const isLoading = status === "loading"

    // Fetch data on component mount
    useEffect(() => {
        dispatch(fetchAccountingData({}))

        // Clear any existing errors
        return () => {
            dispatch(clearAccountingError())
        }
    }, [dispatch])

    const handleRefreshData = () => {
        dispatch(clearAccountingError())
        dispatch(fetchAccountingData({}))
    }

    const handleExportAll = () => {
        exportComprehensiveAccountingReport(courseRevenues, paymentMethods, monthlyRevenue)
    }

    return (
        <AccountingGuard>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Financial Analytics</h1>
                        <p className="text-muted-foreground">Detailed financial reports and analytics for 1Tech Academy</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExportAll}>
                            <Download className="mr-2 h-4 w-4" />
                            Export All Data
                        </Button>
                        <Button onClick={handleRefreshData} disabled={isLoading}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Date Range Filter */}
                <DateRangeFilter />

                {/* Detailed Course Revenue Analysis */}
                <CourseRevenueTable data={courseRevenues} isLoading={isLoading} />

                {/* Detailed Charts Section */}
                <div className="
                    grid
                    gap-6
                    grid-cols-1        // Mobile: 1 column (charts stack)
                    md:grid-cols-2      // Medium screens: 2 columns
                    xl:grid-cols-3      // Extra Large screens: 3 columns
                ">
                    {/*
                        Each chart component should be designed to be responsive within its grid cell.
                        The grid provides the column structure.
                    */}
                    <RevenueTrendsChart data={monthlyRevenue} isLoading={isLoading} />
                    <PaymentMethodsChart data={paymentMethods} isLoading={isLoading} />
                    <CourseRevenueChart data={courseRevenues} isLoading={isLoading} />
                    {/* If you had more charts, they would flow into this grid structure */}
                </div>

                {/* Export Actions */}
                <AccountingQuickActions />
            </div>
        </AccountingGuard>
    )
}
