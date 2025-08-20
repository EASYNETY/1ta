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
  selectDateRange,
  setDateRange,
} from "../store/adminPayments"
import { DateRangePicker } from "@/components/ui/date-range-picker"

export function AccountingDashboardStats() {
  const dispatch = useAppDispatch()
  const stats = useAppSelector(selectPaymentStats)
  const status = useAppSelector(selectPaymentStatsStatus)
  const error = useAppSelector(selectPaymentStatsError)
  const dateRange = useAppSelector(selectDateRange)
  
  // 🟡  get current user from your auth slice
  const userRole = useAppSelector((state) => state.auth.user?.role)

  const isLoading = status === "loading"

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

  // Calculate total revenue
  const calculateTotalRevenue = () => {
    if (!stats || !stats.totalRevenue || stats.totalRevenue.length === 0) {
      return { amount: 0, currency: "NGN" }
    }

    const revenueByCurrency = stats.totalRevenue.reduce((acc, item) => {
      const currency = item.currency || "NGN"
      acc[currency] = (acc[currency] || 0) + item.total
      return acc
    }, {} as Record<string, number>)

    const currencies = Object.keys(revenueByCurrency)
    return currencies.length
      ? { amount: revenueByCurrency[currencies[0]], currency: currencies[0] }
      : { amount: 0, currency: "NGN" }
  }

  const getStatusCount = (status: string) =>
    stats?.statusCounts?.find((i) => i.status === status)?.count || 0

  const totalCount =
    stats?.statusCounts?.reduce((total, item) => total + item.count, 0) || 0

  const totalRevenue = calculateTotalRevenue()
  const successfulCount = getStatusCount("succeeded")
  const pendingCount = getStatusCount("pending")
  const failedCount  = getStatusCount("failed")
  const successRate  = totalCount > 0 ? Math.round((successfulCount / totalCount) * 100) : 0

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
    // <div className="space-y-4">
    //   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    //     <h2 className="text-xl font-semibold">Payment Statistics</h2>
    //     <DateRangePicker
    //       from={dateRange.startDate ? parseISO(dateRange.startDate) : subDays(new Date(), 30)}
    //       to={dateRange.endDate ? parseISO(dateRange.endDate) : new Date()}
    //       onSelect={handleDateRangeChange}
    //     />
    //   </div>

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
                    For period {stats?.dateRange?.start || 'N/A'} to {stats?.dateRange?.end || 'N/A'}
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
    // </div>
  )
}

export default  AccountingDashboardStats
