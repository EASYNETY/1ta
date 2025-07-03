import { saveAs } from "file-saver";
import Papa from "papaparse";
import type {
	CourseRevenueReport,
	PaymentMethodReport,
	MonthlyRevenueReport,
	CourseRevenue,
	PaymentMethodDistribution,
	MonthlyRevenue,
} from "../types/accounting-types";

/**
 * Generic function to export data as CSV
 * @param data Array of data to export
 * @param filename Name of the file without extension
 */
export function exportToCSV<T>(data: T[], filename: string): void {
	const csv = Papa.unparse(data);
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
	saveAs(blob, `${filename}.csv`);
}

/**
 * Format date for use in filenames
 * @returns Formatted date string (YYYY-MM-DD)
 */
export function getFormattedDate(): string {
	const date = new Date();
	return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

/**
 * Export course revenue reports as CSV
 * @param data Array of course revenue data
 * @param filename Optional custom filename
 */
export function exportCourseRevenueReports(
	data: CourseRevenue[],
	filename?: string
): void {
	const reportData: CourseRevenueReport[] = data.map((course) => ({
		courseId: course.courseId,
		courseName: course.courseName,
		totalRevenue: course.totalRevenue,
		enrolledStudents: course.enrolledStudents,
		completionRate: course.completionRate || 0,
		averageRevenuePerStudent:
			course.enrolledStudents > 0
				? course.totalRevenue / course.enrolledStudents
				: 0,
		date: getFormattedDate(),
	}));

	const defaultFilename = `course-revenue-reports-${getFormattedDate()}`;
	exportToCSV(reportData, filename || defaultFilename);
}

/**
 * Export payment method reports as CSV
 * @param data Array of payment method distribution data
 * @param filename Optional custom filename
 */
export function exportPaymentMethodReports(
	data: PaymentMethodDistribution[],
	filename?: string
): void {
	const reportData: PaymentMethodReport[] = data.map((method) => ({
		method: method.method,
		totalTransactions: method.count,
		totalRevenue: 0, // Would need additional calculation
		percentage: method.percentage,
		averageTransactionValue: 0, // Would need additional calculation
		date: getFormattedDate(),
	}));

	const defaultFilename = `payment-method-reports-${getFormattedDate()}`;
	exportToCSV(reportData, filename || defaultFilename);
}

/**
 * Export monthly revenue reports as CSV
 * @param data Array of monthly revenue data
 * @param filename Optional custom filename
 */
export function exportMonthlyRevenueReports(
	data: MonthlyRevenue[],
	filename?: string
): void {
	const reportData: MonthlyRevenueReport[] = data.map((month, index) => ({
		month: month.month,
		totalRevenue: month.revenue,
		totalTransactions: 0, // Would need additional data
		averageTransactionValue: 0, // Would need additional calculation
		growthPercentage:
			index > 0
				? ((month.revenue - data[index - 1].revenue) /
						data[index - 1].revenue) *
					100
				: 0,
	}));

	const defaultFilename = `monthly-revenue-reports-${getFormattedDate()}`;
	exportToCSV(reportData, filename || defaultFilename);
}

/**
 * Export comprehensive accounting report as CSV
 * @param courseRevenue Course revenue data
 * @param paymentMethods Payment method data
 * @param monthlyRevenue Monthly revenue data
 * @param filename Optional custom filename
 */
export function exportComprehensiveAccountingReport(
	courseRevenue: CourseRevenue[],
	paymentMethods: PaymentMethodDistribution[],
	monthlyRevenue: MonthlyRevenue[],
	filename?: string
): void {
	const comprehensiveData = {
		courseRevenue,
		paymentMethods,
		monthlyRevenue,
		generatedAt: new Date().toISOString(),
		totalCourses: courseRevenue.length,
		totalRevenue: courseRevenue.reduce(
			(sum, course) => sum + course.totalRevenue,
			0
		),
		totalStudents: courseRevenue.reduce(
			(sum, course) => sum + course.enrolledStudents,
			0
		),
	};

	const defaultFilename = `comprehensive-accounting-report-${getFormattedDate()}`;

	// Convert to CSV-friendly format
	const csvData = [
		{ section: "Summary", ...comprehensiveData },
		...courseRevenue.map((item) => ({ section: "Course Revenue", ...item })),
		...paymentMethods.map((item) => ({ section: "Payment Methods", ...item })),
		...monthlyRevenue.map((item) => ({ section: "Monthly Revenue", ...item })),
	];

	exportToCSV(csvData, filename || defaultFilename);
}
