"use client"

import { useAppSelector } from "@/store/hooks"
import { DailyRevenueTrendsChart } from "./DailyRevenueTrendsChart"
import { selectPaymentStats, selectPaymentStatsStatus } from "../store/adminPayments"

export function AdminDailyRevenueTrends() {
  const stats = useAppSelector(selectPaymentStats)
  const status = useAppSelector(selectPaymentStatsStatus)
  
  const isLoading = status === "loading"

  // Get daily revenue data directly from the stats
  const getDailyRevenueData = () => {
    if (!stats || !stats.dailyRevenue || stats.dailyRevenue.length === 0) {
      return []
    }

    // Sort by date
    return [...stats.dailyRevenue].sort((a, b) => a.date.localeCompare(b.date))
  }

  const dailyRevenueData = getDailyRevenueData()

  return <DailyRevenueTrendsChart data={dailyRevenueData} isLoading={isLoading} />
}

export default AdminDailyRevenueTrends