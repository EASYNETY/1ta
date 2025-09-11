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
    if (!stats || !stats.dailyRevenue || !Array.isArray(stats.dailyRevenue) || stats.dailyRevenue.length === 0) {
      // Return empty array - the chart component will handle this case
      return []
    }

    try {
      // Sort by date
      return [...stats.dailyRevenue]
        .sort((a, b) => a.date.localeCompare(b.date))
        // Ensure we have the currency field
        .map(item => ({
          ...item,
          currency: item.currency || "NGN"
        }))
    } catch (error) {
      console.error("Error processing daily revenue data:", error)
      return []
    }
  }

  const dailyRevenueData = getDailyRevenueData()

  return <DailyRevenueTrendsChart data={dailyRevenueData} isLoading={isLoading} />
}

export default AdminDailyRevenueTrends
