"use client"

import { useAppSelector } from "@/store/hooks"
import { RevenueTrendsChart } from "./RevenueTrendsChart"
import { selectPaymentStats, selectPaymentStatsStatus } from "../store/adminPayments"
import type { MonthlyRevenue } from "../types/accounting-types"

export function AdminPaymentRevenueTrends() {
  const stats = useAppSelector(selectPaymentStats)
  const status = useAppSelector(selectPaymentStatsStatus)
  
  const isLoading = status === "loading"

  // Transform daily revenue data to monthly revenue format
  const transformToMonthlyRevenue = (): MonthlyRevenue[] => {
    if (!stats || !stats.dailyRevenue || stats.dailyRevenue.length === 0) {
      return []
    }

    // Group by month and sum
    const revenueByMonth: Record<string, number> = {}
    
    stats.dailyRevenue.forEach(item => {
      try {
        // Extract month from date (YYYY-MM-DD)
        const dateParts = item.date.split('-')
        if (dateParts.length >= 2) {
          const monthKey = `${dateParts[0]}-${dateParts[1]}`
          const monthName = new Date(`${monthKey}-01`).toLocaleString('default', { month: 'long', year: 'numeric' })
          
          if (!revenueByMonth[monthName]) {
            revenueByMonth[monthName] = 0
          }
          
          revenueByMonth[monthName] += item.total
        }
      } catch (error) {
        console.error("Error processing date:", item.date, error)
      }
    })

    // Convert to array format expected by RevenueTrendsChart
    return Object.entries(revenueByMonth).map(([month, revenue]) => ({
      month,
      revenue
    }))
  }

  const monthlyRevenueData = transformToMonthlyRevenue()

  return <RevenueTrendsChart data={monthlyRevenueData} isLoading={isLoading} />
}

export default AdminPaymentRevenueTrends
