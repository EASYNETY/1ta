// features/payments/components/RevenueByCourseDistribution.tsx

"use client"

import { useMemo } from "react"
import { useAppSelector } from "@/store/hooks"
import { selectAdminPayments, selectAdminPaymentsStatus } from "../store/adminPayments"
import type { PaymentRecord } from "../types/payment-types"
import { RevenueByCourseChart } from "./RevenueByCourseChart"

// Define a type for our chart data points
export interface RevenueDataPoint {
    name: string;
    revenue: number;
}

export function RevenueByCourseDistribution() {
    // We select the raw payments list, which is updated by our "master" fetch action
    const allPayments = useAppSelector(selectAdminPayments)
    const status = useAppSelector(selectAdminPaymentsStatus)

    const isLoading = status === "loading" || status === "idle";

    // Use useMemo to calculate the revenue distribution only when the payments data changes
    const revenueByCourseData = useMemo((): RevenueDataPoint[] => {
        if (!allPayments || !Array.isArray(allPayments)) {
            return [];
        }

        // Filter for successful payments only
        const successfulPayments = allPayments.filter(p => p.status === 'succeeded');

        // Aggregate revenue by course description
        const revenueMap = new Map<string, number>();

        successfulPayments.forEach((payment: PaymentRecord) => {
            // Use the invoice description as the course name, with a fallback
            const courseName = payment.invoice?.description || payment.description || "Unknown Course";

            // Clean up the course name by removing "Course enrolment:" prefix
            const cleanedName = courseName.replace(/^Course enrolment:\s*/, '').trim();

            const currentRevenue = revenueMap.get(cleanedName) || 0;
            revenueMap.set(cleanedName, currentRevenue + Number(payment.amount));
        });

        // Convert the map to an array of objects for the chart
        const aggregatedData = Array.from(revenueMap.entries()).map(([name, revenue]) => ({
            name,
            revenue,
        }));

        // Sort by revenue descending and take the top 5-7 for a clean chart
        return aggregatedData.sort((a, b) => b.revenue - a.revenue).slice(0, 7);

    }, [allPayments]);

    return <RevenueByCourseChart data={revenueByCourseData} isLoading={isLoading} />
}

export default RevenueByCourseDistribution;