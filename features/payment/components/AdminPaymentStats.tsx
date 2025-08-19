"use client"

import { useEffect, useMemo } from "react"
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
  selectAdminPayments, // Add this to get raw payment data
} from "../store/adminPayments"
import { DateRangePicker } from "@/components/ui/date-range-picker"

export function AdminPaymentStats() {
  const dispatch = useAppDispatch()
  const stats = useAppSelector(selectPaymentStats)
  const status = useAppSelector(selectPaymentStatsStatus)
  const error = useAppSelector(selectPaymentStatsError)
  const dateRange = useAppSelector(selectDateRange)
  const rawPayments = useAppSelector(selectAdminPayments) // Get raw payment data
  
  const userRole = useAppSelector((state) => state.auth.user?.role)

  const isLoading = status === "loading"

  // Add cache-busting and consistent data fetching
  useEffect(() => {
    const fetchData = async () => {
      // Add timestamp to ensure fresh data
      const params = {
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        _timestamp: Date.now(), // Cache buster
      }
      
      await dispatch(fetchPaymentStats(params))
    }
    
    fetchData()
  }, [dispatch, dateRange.startDate, dateRange.endDate])

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    dispatch(setDateRange({
      startDate: range.from ? format(range.from, "yyyy-MM-dd") : null,
      endDate: range.to ? format(range.to, "yyyy-MM-dd") : null,
    }));
  }

  // Consistent currency formatting function
  const formatCurrency = (amount: number, currency: string = "NGN") => {
    try {
      const cleanAmount = Number(amount) || 0
      
      // Use consistent formatting across all browsers
      if (currency === "NGN") {
        return `₦${cleanAmount.toLocaleString('en-NG', { 
          minimumFractionDigits: 0,
          maximumFractionDigits: 0 
        })}`
      }
      
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(cleanAmount)
    } catch (error) {
      console.warn('Currency formatting error:', error)
      return `₦${Number(amount || 0).toLocaleString()}`
    }
  }

  // Memoized calculations to ensure consistency
  const calculations = useMemo(() => {
    // Calculate total revenue with consistent logic
    const calculateTotalRevenue = () => {
      if (!stats?.totalRevenue || !Array.isArray(stats.totalRevenue) || stats.totalRevenue.length === 0) {
        return { amount: 0, currency: "NGN" }
      }

      const revenueByCurrency = stats.totalRevenue.reduce((acc, item) => {
        const currency = item.currency || "NGN"
        const amount = Number(item.total) || 0
        acc[currency] = (acc[currency] || 0) + amount
        return acc
      }, {} as Record<string, number>)

      const currencies = Object.keys(revenueByCurrency)
      return currencies.length > 0
        ? { amount: revenueByCurrency[currencies[0]], currency: currencies[0] }
        : { amount: 0, currency: "NGN" }
    }

    const getStatusCount = (status: string) => {
      if (!stats?.statusCounts || !Array.isArray(stats.statusCounts)) return 0
      const statusItem = stats.statusCounts.find((i) => i.status === status)
      return statusItem ? Number(statusItem.count) || 0 : 0
    }

    const totalRevenue = calculateTotalRevenue()
    const successfulCount = getStatusCount("succeeded")
    const pendingCount = getStatusCount("pending") + getStatusCount("processing") + getStatusCount("requires_action")
    const failedCount = getStatusCount("failed")
    const totalCount = stats?.statusCounts?.reduce((total, item) => total + (Number(item.count) || 0), 0) || 0
    const successRate = totalCount > 0 ? Math.round((successfulCount / totalCount) * 100) : 0

    return {
      totalRevenue,
      successfulCount,
      pendingCount,
      failedCount,
      totalCount,
      successRate
    }
  }, [stats])

  // Determine if user should see revenue data
  const shouldShowRevenue = userRole === "super_admin" || userRole === "accounting"

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Payment Statistics</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const LoadingSkeleton = () => (
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
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Payment Status</h2>
        <DateRangePicker
          from={dateRange.startDate ? parseISO(dateRange.startDate) : subDays(new Date(), 30)}
          to={dateRange.endDate ? parseISO(dateRange.endDate) : new Date()}
          onSelect={handleDateRangeChange}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue - Only show for super_admin and accounting */}
        {shouldShowRevenue && (
          <Card className="bg-green-50 dark:bg-green-950/5">
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(calculations.totalRevenue.amount, calculations.totalRevenue.currency)}
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
            <LoadingSkeleton />
          ) : (
            <>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calculations.successRate}%</div>
                <div className="text-xs text-muted-foreground">
                  {calculations.successfulCount} of {calculations.totalCount} transactions
                </div>
              </CardContent>
            </>
          )}
        </Card>
        
        {/* Pending Transactions */}
        <Card className="bg-yellow-50 dark:bg-yellow-950/5">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calculations.pendingCount}</div>
                <div className="text-xs text-muted-foreground">
                  {calculations.totalCount > 0 ? Math.round((calculations.pendingCount / calculations.totalCount) * 100) : 0}% of all transactions
                </div>
              </CardContent>
            </>
          )}
        </Card>

        {/* Failed Transactions */}
        <Card className="bg-red-50 dark:bg-red-950/5">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Transactions</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calculations.failedCount}</div>
                <div className="text-xs text-muted-foreground">
                  {calculations.totalCount > 0 ? Math.round((calculations.failedCount / calculations.totalCount) * 100) : 0}% of all transactions
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