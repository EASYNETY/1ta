// features/payments/components/AdminPaymentsTable.tsx

"use client"

import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import AdminPaymentTable from "./AdminPaymentTable"
import AdminPaymentStats from "./AdminPaymentStats"
import AdminDailyRevenueTrends from "./AdminDailyRevenueTrends"
// 1. Import the new component
import { RevenueByCourseDistribution } from "./RevenueByCourseDistribution"
import { fetchPaymentStats, selectDateRange, selectPaymentStatsStatus } from "../store/adminPayments"

const AdminPaymentsTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const userRole = user?.role || "admin";

  const statsStatus = useAppSelector(selectPaymentStatsStatus);
  const dateRange = useAppSelector(selectDateRange);
  const { startDate, endDate } = dateRange as { startDate: string; endDate: string };

  useEffect(() => {
    dispatch(fetchPaymentStats({ startDate, endDate }));
  }, [dispatch, startDate, endDate]);

  return (
    <div className="space-y-6">
      {(userRole === "admin" || userRole === "super_admin" || userRole === "accounting") && (
        <AdminPaymentStats />
      )}

      {(userRole === "super_admin" || userRole === "accounting") && (
        <div className="grid gap-6 lg:grid-cols-2">
          <AdminDailyRevenueTrends />
          <RevenueByCourseDistribution />
        </div>
      )}

      <AdminPaymentTable />
    </div>
  )
}

export default AdminPaymentsTable
