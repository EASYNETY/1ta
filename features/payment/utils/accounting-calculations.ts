import type { PaymentRecord } from "@/features/payment/types/payment-types";
import type {
	AccountingStats,
	CourseRevenue,
	MonthlyRevenue,
	PaymentMethodDistribution,
} from "../types/accounting-types";
import { format, parseISO, isWithinInterval } from "date-fns";

// --- Helper: Get Course Name (needs a source for course names) ---
const getCourseNameFromPayment = (payment: PaymentRecord): string => {
	// Try to extract from relatedItemIds first
	const courseItem = payment.relatedItemIds?.find(
		(item) => item.type === "course"
	);
	if (courseItem?.id) {
		// In a real app, you might want to fetch course names from a course store
		// For now, we'll use the ID with a prefix
		return `Course: ${courseItem.id}`;
	}

	// Fallback to description
	return payment.description || "Unknown Course";
};

const getCourseIdFromPayment = (payment: PaymentRecord): string => {
	// Try to extract courseId from relatedItemIds first
	const courseItem = payment.relatedItemIds?.find(
		(item) => item.type === "course"
	);
	if (courseItem?.id) {
		return courseItem.id;
	}

	// Fallback to using invoiceId or description as identifier
	return payment.invoiceId || payment.description || "unknown-course";
};

export const calculateAccountingStats = (
	payments: PaymentRecord[],
	dateRange?: { startDate: Date | null; endDate: Date | null }
): AccountingStats => {
	// Filter payments by date range if provided
	let filteredPayments = payments;
	if (dateRange?.startDate && dateRange?.endDate) {
		filteredPayments = payments.filter((payment) => {
			const paymentDate = new Date(payment.createdAt);
			return isWithinInterval(paymentDate, {
				start: dateRange.startDate as number | Date,
				end: dateRange.endDate as number | Date,
			});
		});
	}

	// Calculate stats for current period
	const succeededPayments = filteredPayments.filter(
		(p) => p.status === "succeeded"
	);
	const totalRevenue = succeededPayments.reduce((sum, p) => sum + p.amount, 0);
	const pendingPaymentsAmount = filteredPayments
		.filter((p) => p.status === "pending" || p.status === "processing")
		.reduce((sum, p) => sum + p.amount, 0);
	const reconciledTransactionCount = filteredPayments.filter(
		(p) => p.reconciliationStatus === "reconciled"
	).length;
	const totalTransactionCount = filteredPayments.length;
	const failedTransactionCount = filteredPayments.filter(
		(p) => p.status === "failed"
	).length;

	// Calculate stats for previous period if date range is provided
	let totalRevenueLastPeriod: number | undefined;
	if (dateRange?.startDate && dateRange?.endDate) {
		const periodLength =
			dateRange.endDate.getTime() - dateRange.startDate.getTime();
		const previousPeriodStart = new Date(
			dateRange.startDate.getTime() - periodLength
		);
		const previousPeriodEnd = new Date(dateRange.startDate.getTime() - 1); // 1ms before current period

		const previousPeriodPayments = payments.filter((payment) => {
			const paymentDate = new Date(payment.createdAt);
			return isWithinInterval(paymentDate, {
				start: previousPeriodStart,
				end: previousPeriodEnd,
			});
		});

		const previousSucceededPayments = previousPeriodPayments.filter(
			(p) => p.status === "succeeded"
		);
		totalRevenueLastPeriod = previousSucceededPayments.reduce(
			(sum, p) => sum + p.amount,
			0
		);
	}

	return {
		totalRevenue,
		totalRevenueLastPeriod,
		pendingPaymentsAmount,
		reconciledTransactionCount,
		totalTransactionCount,
		failedTransactionCount,
	};
};

export const calculateCourseRevenues = (
	payments: PaymentRecord[],
	dateRange?: { startDate: Date | null; endDate: Date | null }
): CourseRevenue[] => {
	// Filter payments by date range if provided
	let filteredPayments = payments;
	if (dateRange?.startDate && dateRange?.endDate) {
		filteredPayments = payments.filter((payment) => {
			const paymentDate = new Date(payment.createdAt);
			return isWithinInterval(paymentDate, {
				start: dateRange.startDate as number | Date,
				end: dateRange.endDate as number | Date,
			});
		});
	}

	const succeededPayments = filteredPayments.filter(
		(p) => p.status === "succeeded"
	);

	const revenueByCourse: Record<
		string,
		{
			totalRevenue: number;
			enrolledStudents: Set<string>;
			courseName: string;
		}
	> = {};

	succeededPayments.forEach((p) => {
		const courseId = getCourseIdFromPayment(p);
		const courseName = getCourseNameFromPayment(p);

		if (!revenueByCourse[courseId]) {
			revenueByCourse[courseId] = {
				totalRevenue: 0,
				enrolledStudents: new Set(),
				courseName,
			};
		}
		revenueByCourse[courseId].totalRevenue += p.amount;
		revenueByCourse[courseId].enrolledStudents.add(p.userId);
	});

	return Object.entries(revenueByCourse).map(([courseId, data]) => ({
		courseId,
		courseName: data.courseName,
		totalRevenue: data.totalRevenue,
		enrolledStudents: data.enrolledStudents.size,
	}));
};

export const calculateMonthlyRevenueTrend = (
	payments: PaymentRecord[],
	dateRange?: { startDate: Date | null; endDate: Date | null }
): MonthlyRevenue[] => {
	// Filter payments by date range if provided
	let filteredPayments = payments;
	if (dateRange?.startDate && dateRange?.endDate) {
		filteredPayments = payments.filter((payment) => {
			const paymentDate = new Date(payment.createdAt);
			return isWithinInterval(paymentDate, {
				start: dateRange.startDate as number | Date,
				end: dateRange.endDate as number | Date,
			});
		});
	}

	const succeededPayments = filteredPayments.filter(
		(p) => p.status === "succeeded"
	);
	const revenueByMonth: Record<string, number> = {}; // "YYYY-MM" -> revenue

	succeededPayments.forEach((p) => {
		try {
			const monthKey = format(parseISO(p.createdAt), "yyyy-MM");
			revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + p.amount;
		} catch (e) {
			console.warn(
				"Could not parse date for monthly revenue trend:",
				p.createdAt
			);
		}
	});

	// Sort by month and format for chart
	return Object.entries(revenueByMonth)
		.sort(([aKey], [bKey]) => aKey.localeCompare(bKey))
		.map(([monthKey, revenue]) => ({
			month: format(parseISO(`${monthKey}-01`), "MMM yyyy"), // Format for display
			revenue,
		}));
};

export const calculatePaymentMethodDistribution = (
	payments: PaymentRecord[],
	dateRange?: { startDate: Date | null; endDate: Date | null }
): PaymentMethodDistribution[] => {
	// Filter payments by date range if provided
	let filteredPayments = payments;
	if (dateRange?.startDate && dateRange?.endDate) {
		filteredPayments = payments.filter((payment) => {
			const paymentDate = new Date(payment.createdAt);
			return isWithinInterval(paymentDate, {
				start: dateRange.startDate as number | Date,
				end: dateRange.endDate as number | Date,
			});
		});
	}

	const succeededPayments = filteredPayments.filter(
		(p) => p.status === "succeeded"
	);
	const countByMethod: Record<string, number> = {};
	let totalPayments = 0;

	succeededPayments.forEach((p) => {
		const method = p.provider?.toString() || "Unknown";
		countByMethod[method] = (countByMethod[method] || 0) + 1;
		totalPayments++;
	});

	if (totalPayments === 0) return [];

	return Object.entries(countByMethod).map(([method, count]) => ({
		method: method.charAt(0).toUpperCase() + method.slice(1), // Capitalize
		count,
		percentage: Number.parseFloat(((count / totalPayments) * 100).toFixed(1)),
	}));
};
