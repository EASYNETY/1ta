"use client"

import { useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, BarChart3, Download } from "lucide-react"
import Link from "next/link"

import AdminPaymentStats from "./AdminPaymentStats"
import AdminPaymentTable from "./AdminPaymentTable"
import PaymentMethodsDistribution from "./PaymentMethodsDistribution"
import AdminDailyRevenueTrends from "./AdminDailyRevenueTrends"

import {
  fetchAdminPayments,
  fetchPaymentStats,
  selectAdminPaymentsStatus,
  selectAdminPaymentsError,
  clearAdminPaymentsError,
  selectDateRange,
} from "../store/adminPayments"

interface AdminPaymentDashboardProps {
  userRole: "admin" | "super_admin" | "accounting";
}

export function AdminPaymentDashboard({ userRole }: AdminPaymentDashboardProps) {
  const dispatch = useAppDispatch()
  const status = useAppSelector(selectAdminPaymentsStatus)
  const error = useAppSelector(selectAdminPaymentsError)
  const dateRange = useAppSelector(selectDateRange)
  
  const isLoading = status === "loading"

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchAdminPayments({ page: 1, limit: 10 }))
    
    if (dateRange.startDate && dateRange.endDate) {
      dispatch(fetchPaymentStats({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }))
    } else {
      dispatch(fetchPaymentStats({}))
    }

    // Clear any existing errors
    return () => {
      dispatch(clearAdminPaymentsError())
    }
  }, [dispatch, dateRange.startDate, dateRange.endDate])

  const handleRefreshData = () => {
    dispatch(clearAdminPaymentsError())
    dispatch(fetchAdminPayments({ page: 1, limit: 10 }))
    dispatch(fetchPaymentStats({
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined,
    }))
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all payment transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefreshData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
          {userRole !== 'admin' && (
            <Link href="/accounting/analytics">
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Financial Analytics
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Section */}
      <AdminPaymentStats />

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminDailyRevenueTrends />
        <PaymentMethodsDistribution />
      </div>

      {/* Payments Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Payment Transactions</h2>
        <AdminPaymentTable />
      </div>
    </div>
  )
}

export default AdminPaymentDashboard
