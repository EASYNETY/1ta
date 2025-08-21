// app/(authenticated)/accounting/dashboard/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { AccountingGuard } from "@/components/auth/PermissionGuard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

// Import accounting components
import AdminPaymentStats from "@/features/payment/components/AdminPaymentStats"
import { CourseRevenueTable } from "@/features/payment/components/CourseRevenueTable"
import { RecentPaymentsWidget } from "@/features/payment/components/RecentPaymentsWidget"
import { AccountingQuickActions } from "@/features/payment/components/AccountingQuickActions"
import { DateRangeFilter } from "@/features/payment/components/DateRangeFilter"
import AdminDailyRevenueTrends from "@/features/payment/components/AdminDailyRevenueTrends"
import RevenueByCourseDistribution from "@/features/payment/components/RevenueByCourseDistribution"

// Import accounting store
import {
  fetchAccountingData,
  selectAccountingStats,
  selectCourseRevenues,
  selectMonthlyRevenueTrend,
  selectPaymentMethodDistribution,
  selectAccountingStatus,
  selectAccountingError,
  clearAccountingError,
} from "@/features/payment/store/accounting-slice"

export default function AccountingDashboard() {
  const dispatch = useAppDispatch()

  // Selectors
  const stats = useAppSelector(selectAccountingStats)
  const courseRevenues = useAppSelector(selectCourseRevenues)
  const monthlyRevenue = useAppSelector(selectMonthlyRevenueTrend)
  const paymentMethods = useAppSelector(selectPaymentMethodDistribution)
  const status = useAppSelector(selectAccountingStatus)
  const error = useAppSelector(selectAccountingError)

  const isLoading = status === "loading"

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchAccountingData({}))

    return () => {
      dispatch(clearAccountingError())
    }
  }, [dispatch])

  const handleRefreshData = () => {
    dispatch(clearAccountingError())
    dispatch(fetchAccountingData({}))
  }

  return (
    <AccountingGuard>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Accounting Dashboard</h1>
            <p className="text-muted-foreground">Financial overview and payment analytics for 1Tech Academy</p>
          </div>
          <Button onClick={handleRefreshData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>

        {/* Error Alert */}
        {error && !isLoading && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Date Range Filter */}
        <DateRangeFilter />

  {/* Stats Cards - pass data + loading */}
  <AdminPaymentStats data={stats} isLoading={isLoading} />

        {/* Payment History Table */}
        <RecentPaymentsWidget />

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <AdminDailyRevenueTrends />
          <RevenueByCourseDistribution />
        </div>

        {/* Course Revenue Section */}
        <CourseRevenueTable data={courseRevenues} isLoading={isLoading} />

        {/* Quick Actions */}
        <div className="grid gap-6">
          <AccountingQuickActions />
        </div>
      </div>
    </AccountingGuard>
  )
}
