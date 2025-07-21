// utils/dashboard-helpers.ts

import { parseISO } from "date-fns";

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    }).format(amount);
}

export function calculateGrowthRate(current: number, previous: number): number {
    if (previous > 0) {
        return parseFloat((((current - previous) / previous) * 100).toFixed(1));
    } else if (current > 0) {
        return 100;
    }
    return 0;
}

export function sortMonthlyRevenueTrend(trend: Array<{ monthKey: string; revenue: number }>): Array<{ monthKey: string; revenue: number }> {
    return [...trend].sort((a, b) => parseISO(a.monthKey).getTime() - parseISO(b.monthKey).getTime());
}
