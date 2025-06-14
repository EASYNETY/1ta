"use client"

import { useEffect } from "react"
import { useAppSelector } from "@/store/hooks"
import AdminPaymentTable from "./AdminPaymentTable"
import AdminPaymentStats from "./AdminPaymentStats"
import AdminDailyRevenueTrends from "./AdminDailyRevenueTrends"
import PaymentMethodsDistribution from "./PaymentMethodsDistribution"

/**
 * This component is a wrapper around the new AdminPaymentTable component
 * It's kept for backward compatibility with existing code
 */
const AdminPaymentsTable: React.FC = () => {
  // Get user role from auth state
  const { user } = useAppSelector((state) => state.auth)
  const userRole = user?.role || "admin"

  return (
    <div className="space-y-6">
      {/* Stats Section - Only shown for admin, super_admin, and accounting roles */}
      {(userRole === "admin" || userRole === "super_admin" || userRole === "accounting") && (
        <AdminPaymentStats />
      )}

      {/* Revenue Trends - Only shown for super_admin and accounting roles */}
      {(userRole === "super_admin" || userRole === "accounting") && (
        <div className="grid gap-6 lg:grid-cols-2">
          <AdminDailyRevenueTrends />
          <PaymentMethodsDistribution />
        </div>
      )}

      {/* Enhanced Payment Table with all requested columns */}
      <AdminPaymentTable />
    </div>
  )
}

export default AdminPaymentsTable
