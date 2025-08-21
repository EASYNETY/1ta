"use client"

import { useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, DollarSign, CreditCard, CheckCircle, XCircle } from "lucide-react"
import { format, parseISO, subDays } from "date-fns"
import {
  fetchPaymentStats,
  selectPaymentStats,
  selectPaymentStatsStatus,
  selectPaymentStatsError,
  selectDateRange as selectAdminDateRange,
  setDateRange,
} from "../store/adminPayments"
import { selectDateRange as selectAccountingDateRange } from "@/features/payment/store/accounting-slice"
import { DateRangePicker } from "@/components/ui/date-range-picker"

export function AdminPaymentStats({ data: propData, isLoading: propLoading }: { data?: any; isLoading?: boolean } = {}) {
  const dispatch = useAppDispatch()
  const statsFromStore = useAppSelector(selectPaymentStats)
  const status = useAppSelector(selectPaymentStatsStatus)
  const error = useAppSelector(selectPaymentStatsError)
  const adminDateRange = useAppSelector(selectAdminDateRange)
  const accountingDateRange = useAppSelector(selectAccountingDateRange)
  
  // 🟡  get current user from your auth slice
  const userRole = useAppSelector((state) => state.auth.user?.role)

  const isLoading = typeof propLoading === "boolean" ? propLoading : status === "loading"

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    dispatch(setDateRange({
      startDate: range.from ? format(range.from, "yyyy-MM-dd") : null,
      endDate: range.to ? format(range.to, "yyyy-MM-dd") : null,
    }));
  }

  const formatCurrency = (amount: number, currency: string) => {
    try {
      const cleanAmount = Number(amount)
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: currency || "NGN",
        maximumFractionDigits: 0,
      }).format(cleanAmount)
    } catch (error) {
      return `₦${Number(amount).toLocaleString()}`
    }
  }

  // Calculate total revenue (support both admin-style stats and accounting-style stats)
  const calculateTotalRevenue = () => {
    // Admin-style stats: stats.totalRevenue is an array of { currency, total }
    if (stats && Array.isArray(stats.totalRevenue)) {
      if (stats.totalRevenue.length === 0) return { amount: 0, currency: "NGN" }
      const revenueByCurrency = stats.totalRevenue.reduce((acc: any, item: any) => {
        const currency = item.currency || "NGN"
        acc[currency] = (acc[currency] || 0) + (item.total || 0)
        return acc
      }, {} as Record<string, number>)

      const currencies = Object.keys(revenueByCurrency)
      return currencies.length
        ? { amount: revenueByCurrency[currencies[0]], currency: currencies[0] }
        : { amount: 0, currency: "NGN" }
    }

    // Accounting-style stats: stats.totalRevenue is a number
    if (stats && typeof stats.totalRevenue === "number") {
      return { amount: stats.totalRevenue || 0, currency: "NGN" }
    }

    return { amount: 0, currency: "NGN" }
  }

  const getStatusCount = (status: string) =>
    stats?.statusCounts?.find((i) => i.status === status)?.count || 0

  // Prefer passed-in data (from accounting slice) but fall back to admin store
  const stats = propData ?? statsFromStore

  const totalCount =
    stats?.statusCounts?.reduce((total: number, item: any) => total + (item.count || 0), 0) || 0

  const totalRevenue = calculateTotalRevenue()

  // If stats come from accounting slice, map fields accordingly
  let successfulCount = getStatusCount("succeeded")
  let pendingCount = getStatusCount("pending")
  let failedCount = getStatusCount("failed")
  let computedSuccessRate = totalCount > 0 ? Math.round((successfulCount / totalCount) * 100) : 0

  if (stats && typeof stats.totalRevenue === "number") {
    // Accounting-style stats
    const totalTransactionCount = stats.totalTransactionCount || 0
    const failed = stats.failedTransactionCount || 0
    const pendingAmount = stats.pendingPaymentsAmount || 0

    failedCount = failed
    // best-effort: if transaction counts are available use them
    successfulCount = totalTransactionCount - failedCount
    pendingCount = 0 // accounting stats don't include pending count currently
    computedSuccessRate = totalTransactionCount > 0 ? Math.round((successfulCount / totalTransactionCount) * 100) : 0
  }

  const successRate = computedSuccessRate

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Payment Statistics</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // Prefer accounting date range for display when available
  const displayDateRange = accountingDateRange && (accountingDateRange.startDate || accountingDateRange.endDate)
    ? accountingDateRange
    : (adminDateRange || null)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Payment Statistics</h2>
        <DateRangePicker
          from={adminDateRange?.startDate ? parseISO(adminDateRange.startDate) : subDays(new Date(), 30)}
          to={adminDateRange?.endDate ? parseISO(adminDateRange.endDate) : new Date()}
          onSelect={handleDateRangeChange}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        {/* 👉 Only show the Total Revenue card when NOT admin */}
        {userRole !== "admin" && (
          <Card className="bg-green-50 dark:bg-green-950/5">
            {isLoading ? (
              <>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(totalRevenue.amount, totalRevenue.currency)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    For period {displayDateRange?.startDate || stats?.dateRange?.start || 'N/A'} to {displayDateRange?.endDate || stats?.dateRange?.end || 'N/A'}
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        )}

        {/* Success Rate */}
        <Card className="bg-blue-50 dark:bg-blue-950/5">
          {isLoading ? (
            <>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </>
          ) : (
              <>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{successRate}%</div>
                  <div className="text-xs text-muted-foreground">
                    {successfulCount} of {totalCount} transactions
                  </div>
                </CardContent>
              </>
          )}
        </Card>
        
        {/* Pending Transactions */}
        <Card className="bg-yellow-50 dark:bg-yellow-950/5">
          {isLoading ? (
            <>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </>
          ) : (
              <>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingCount}</div>
                  <div className="text-xs text-muted-foreground">
                    {totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 0}% of all transactions
                  </div>
                </CardContent>
              </>
          )}
        </Card>

        {/* Failed Transactions */}
        <Card className="bg-red-50 dark:bg-red-950/5">
          {isLoading ? (
            <>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </>
          ) : (
              <>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Failed Transactions</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{failedCount}</div>
                  <div className="text-xs text-muted-foreground">
                    {totalCount > 0 ? Math.round((failedCount / totalCount) * 100) : 0}% of all transactions
                  </div>
                </CardContent>
              </>
          )}
        </Card>

      </div>
    </div>
  )
}

export default AdminPaymentStats
