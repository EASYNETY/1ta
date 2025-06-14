"use client"

import { useAppSelector } from "@/store/hooks"
import { PaymentMethodsChart } from "./PaymentMethodsChart"
import { selectPaymentStats, selectPaymentStatsStatus } from "../store/adminPayments"
import type { PaymentMethodDistribution } from "../types/accounting-types"

export function PaymentMethodsDistribution() {
  const stats = useAppSelector(selectPaymentStats)
  const status = useAppSelector(selectPaymentStatsStatus)
  
  const isLoading = status === "loading"

  // Transform provider counts to payment method distribution format
  const transformToPaymentMethodDistribution = (): PaymentMethodDistribution[] => {
    if (!stats || !stats.providerCounts || stats.providerCounts.length === 0) {
      return []
    }

    // Calculate total count
    const totalCount = stats.providerCounts.reduce((sum, item) => sum + item.count, 0)
    
    // Transform to PaymentMethodDistribution format
    return stats.providerCounts.map(item => ({
      method: item.provider,
      count: item.count,
      percentage: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0
    }))
  }

  const paymentMethodData = transformToPaymentMethodDistribution()

  return <PaymentMethodsChart data={paymentMethodData} isLoading={isLoading} />
}

export default PaymentMethodsDistribution