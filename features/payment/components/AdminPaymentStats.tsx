"use client"

import { useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, DollarSign, CreditCard, CheckCircle, XCircle, TrendingUp, TrendingDown } from "lucide-react"
import { format, parseISO, isValid, subDays } from "date-fns"
import {
  fetchPaymentStats,
  selectPaymentStats,
  selectPaymentStatsStatus,
  selectPaymentStatsError,
  selectDateRange,
  setDateRange,
} from "../store/adminPayments"
import { DateRangePicker } from "@/components/ui/date-range-picker"

export function AdminPaymentStats() {
  const dispatch = useAppDispatch()
  const stats = useAppSelector(selectPaymentStats)
  const status = useAppSelector(selectPaymentStatsStatus)
  const error = useAppSelector(selectPaymentStatsError)
  const dateRange = useAppSelector(selectDateRange)
  
  const isLoading = status === "loading"

   const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    dispatch(setDateRange({
      startDate: range.from ? format(range.from, "yyyy-MM-dd") : null,
      endDate: range.to ? format(range.to, "yyyy-MM-dd") : null,
    }));
  }

  // Format currency amount
  const formatCurrency = (amount: number, currency: string) => {
    try {
      // Remove leading zeros by converting to number first
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

  // Calculate total revenue
  const calculateTotalRevenue = () => {
    if (!stats || !stats.totalRevenue || stats.totalRevenue.length === 0) {
      return { amount: 0, currency: "NGN" }
    }

    try {
      // Group by currency and sum
      const revenueByCurrency = stats.totalRevenue.reduce((acc, item) => {
        const currency = item.currency || "NGN"
        if (!acc[currency]) {
          acc[currency] = 0
        }
        acc[currency] += item.total
        return acc
      }, {} as Record<string, number>)

      // Return the first currency (usually there's just one)
      const currencies = Object.keys(revenueByCurrency)
      if (currencies.length === 0) {
        return { amount: 0, currency: "NGN" }
      }
      
      return {
        amount: revenueByCurrency[currencies[0]],
        currency: currencies[0],
      }
    } catch (error) {
      console.error("Error calculating total revenue:", error)
      return { amount: 0, currency: "NGN" }
    }
  }

  // Calculate status counts
  const getStatusCount = (status: string) => {
    if (!stats || !stats.statusCounts || !Array.isArray(stats.statusCounts)) return 0
    try {
      const statusItem = stats.statusCounts.find(item => item.status === status)
      return statusItem ? statusItem.count : 0
    } catch (error) {
      console.error(`Error getting count for status ${status}:`, error)
      return 0
    }
  }

  // Get total transaction count
  const getTotalTransactionCount = () => {
    if (!stats || !stats.statusCounts || !Array.isArray(stats.statusCounts)) return 0
    try {
      return stats.statusCounts.reduce((total, item) => total + item.count, 0)
    } catch (error) {
      console.error("Error calculating total transaction count:", error)
      return 0
    }
  }

  const totalRevenue = calculateTotalRevenue()
  const successfulCount = getStatusCount("succeeded")
  const pendingCount = getStatusCount("pending")
  const failedCount = getStatusCount("failed")
  const totalCount = getTotalTransactionCount()

  // Calculate success rate
  const successRate = totalCount > 0 ? Math.round((successfulCount / totalCount) * 100) : 0

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Payment Statistics</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Date Range Picker */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Payment Statistics</h2>
        <DateRangePicker
          from={dateRange.startDate ? parseISO(dateRange.startDate) : subDays(new Date(), 30)}
          to={dateRange.endDate ? parseISO(dateRange.endDate) : new Date()}
          onSelect={handleDateRangeChange}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue Card */}
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
                <span className="text-muted-foreground text-sm font-medium">₦</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalRevenue.amount, totalRevenue.currency)}
                </div>
                <div className="text-xs text-muted-foreground">
                  For period {stats?.dateRange?.start || 'N/A'} to {stats?.dateRange?.end || 'N/A'}
                </div>
              </CardContent>
            </>
          )}
        </Card>

        {/* Successful Transactions Card */}
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

        {/* Pending Transactions Card */}
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

        {/* Failed Transactions Card */}
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