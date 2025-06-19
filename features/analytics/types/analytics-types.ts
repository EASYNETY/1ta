// features/analytics/types/analytics-types.ts

// --- Generic Chart Data Structures ---
export interface ChartDataPoint {
	name: string;
	value: number;
}

export interface TimeSeriesDataPoint {
	date: string;
	value: number;
}

// --- Main Dashboard Data Structure ---
export interface DashboardStats {
	studentStats: StudentStats;
	courseStats: CourseStats;
	paymentStats: PaymentStats;
	attendanceStats: AttendanceStats;
}

// --- Specific Stat Sections ---
export interface StudentStats {
	total: number;
	newThisMonth: number;
	growth: TimeSeriesDataPoint[];
	// CORRECTED: Must be an array of ChartDataPoint
	genderDistribution: ChartDataPoint[];
	// CORRECTED: Must be an array of ChartDataPoint
	ageDistribution: ChartDataPoint[];
}

export interface CourseStats {
	total: number;
	averageCompletion: number;
	enrolmentsByCourse: ChartDataPoint[];
	completionRateByCourse: ChartDataPoint[];
	averageGradeByCourse: ChartDataPoint[];
}

export interface PaymentStats {
	totalRevenue: number;
	revenueThisMonth: number;
	revenueTrends: TimeSeriesDataPoint[];
	paymentMethodDistribution: ChartDataPoint[];
	paymentStatusDistribution: ChartDataPoint[];
	revenueByCourse: ChartDataPoint[];
}

export interface AttendanceStats {
	averageRate: number;
	rateTrends: TimeSeriesDataPoint[];
	byDayOfWeek: ChartDataPoint[];
	statusDistribution: ChartDataPoint[];
	byCourse: ChartDataPoint[];
}

// --- Analytics Redux State ---
export interface AnalyticsState {
	dashboardStats: DashboardStats;
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
}

// --- Report Filter Types (Unaffected, but kept for completeness) ---
export interface DateRange {
	startDate?: string;
	endDate?: string;
}

export interface ReportFilter extends DateRange {
	courseId?: string;
	userId?: string;
	status?: string;
	searchTerm?: string;
	page?: number;
	limit?: number;
}

export interface StudentBiodataFilter extends DateRange {
	gender?: string;
	ageRange?: string;
	accountType?: string;
	corporateId?: string;
	location?: string;
	completionRateMin?: number;
	completionRateMax?: number;
}
