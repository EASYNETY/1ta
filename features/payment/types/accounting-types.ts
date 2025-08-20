export interface AccountingStats {
	totalRevenue: number;
	totalRevenueLastPeriod?: number;
	pendingPaymentsAmount: number;
	reconciledTransactionCount: number;
	totalTransactionCount: number;
	failedTransactionCount: number;
}

export interface CourseRevenue {
	courseId: string;
	courseName: string;
	totalRevenue: number;
	enrolledStudents: number;
	completionRate?: number;
	revenueChangePercentage?: number;
}

export interface MonthlyRevenue {
	month: string;
	revenue: number;
}

export interface PaymentMethodDistribution {
	method: string;
	count: number;
	percentage: number;
}

// State for the accounting slice
export interface AccountingState {
	// We don't need to store derived data in the state
	// Instead, we'll use selectors to compute this data from payment slice
	dateRange: {
		startDate: string | null;
		endDate: string | null;
	};
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;

	// Optional local cache used by the accounting slice to store filtered payments
	// and the last time they were updated. Kept optional to avoid breaking other
	// parts of the code that import this type.
	filteredPayments?: any[];
	lastUpdateTimestamp?: number | null;
}

// Export types for reports
export interface CourseRevenueReport {
	courseId: string;
	courseName: string;
	totalRevenue: number;
	enrolledStudents: number;
	completionRate: number;
	averageRevenuePerStudent: number;
	date: string;
}

export interface PaymentMethodReport {
	method: string;
	totalTransactions: number;
	totalRevenue: number;
	percentage: number;
	averageTransactionValue: number;
	date: string;
}

export interface MonthlyRevenueReport {
	month: string;
	totalRevenue: number;
	totalTransactions: number;
	averageTransactionValue: number;
	growthPercentage: number;
}
