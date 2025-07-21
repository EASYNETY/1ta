// features/analytics/store/analytics-slice.ts

import {
	createSlice,
	createAsyncThunk,
	type AsyncThunk,
} from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "@/store";
import type { AnalyticsState, DashboardStats } from "../types/analytics-types";
import {
	deriveDashboardStats,
	deriveAttendanceReportsPerCourse,
} from "../utils/data-derivation";
import { calculateCourseRevenues } from "@/features/payment/utils/accounting-calculations";
import { fetchAllUsersComplete } from "@/features/auth/store/user-thunks";
import { fetchAuthCourses } from "@/features/auth-course/store/auth-course-slice";
import { fetchAllAdminPaymentsSequentially } from "@/features/payment/store/adminPayments";
import { fetchAllAttendanceRecords } from "@/features/attendance/store/attendance-slice";
import { fetchAllCourseGrades } from "@/features/grades/store/grade-slice";
import { CourseGrade } from "@/features/grades/types/grade-types";
import { AttendanceRecord } from "@/data/mock-attendance-data";

type ThunkApiConfig = {
	dispatch: AppDispatch;
	state: RootState;
	rejectValue: string;
};

// Helper function to create a default/empty stats object
// This function now correctly initializes chart data as empty arrays.
const createInitialDashboardStats = (): DashboardStats => ({
	studentStats: {
		total: 0,
		newThisMonth: 0,
		growth: [],
		genderDistribution: [], // CORRECTED: Was an object, now an empty array
		ageDistribution: [], // CORRECTED: Was an object, now an empty array
	},
	courseStats: {
		total: 0,
		averageCompletion: 0,
		enrolmentsByCourse: [],
		completionRateByCourse: [],
		averageGradeByCourse: [],
	},
	paymentStats: {
		totalRevenue: 0,
		revenueThisMonth: 0,
		revenueTrends: [],
		paymentMethodDistribution: [],
		paymentStatusDistribution: [],
		revenueByCourse: [],
	},
	attendanceStats: {
		averageRate: 0,
		rateTrends: [],
		byDayOfWeek: [],
		statusDistribution: [],
		byCourse: [],
	},
});

// Initial state
const initialState: AnalyticsState = {
	dashboardStats: createInitialDashboardStats(),
	status: "idle",
	error: null,
};

export const fetchAnalyticsDashboard = createAsyncThunk<
	DashboardStats,
	void,
	ThunkApiConfig
>("analytics/fetchDashboard", async (_, { dispatch, rejectWithValue }) => {
	try {
		console.log("Starting analytics dashboard data fetch...");

		const [
			usersResult,
			coursesResult,
			paymentsResult,
			attendanceResult,
			gradesResult,
		] = await Promise.all([
			dispatch(fetchAllUsersComplete()),
			dispatch(fetchAuthCourses()),
			dispatch(fetchAllAdminPaymentsSequentially({})),
			dispatch(fetchAllAttendanceRecords()),
			dispatch(fetchAllCourseGrades()),
		]);

		if (fetchAllUsersComplete.rejected.match(usersResult)) {
			console.error("Failed to fetch users:", usersResult.payload);
			throw new Error(`Failed to fetch users: ${usersResult.payload}`);
		}
		if (fetchAuthCourses.rejected.match(coursesResult)) {
			console.error("Failed to fetch courses:", coursesResult.payload);
			throw new Error(`Failed to fetch courses: ${coursesResult.payload}`);
		}
		if (fetchAllAdminPaymentsSequentially.rejected.match(paymentsResult)) {
			console.error("Failed to fetch payments:", paymentsResult.payload);
			throw new Error(`Failed to fetch payments: ${paymentsResult.payload}`);
		}
		if (fetchAllAttendanceRecords.rejected.match(attendanceResult)) {
			console.error("Failed to fetch attendance:", attendanceResult.payload);
			throw new Error(
				`Failed to fetch attendance: ${attendanceResult.payload}`
			);
		}
		if (fetchAllCourseGrades.rejected.match(gradesResult)) {
			console.warn(
				`Could not fetch grades for analytics: ${gradesResult.payload}. Grade-related stats will be empty.`
			);
		}

		const users = usersResult.payload.users;
		const courses = coursesResult.payload;
		const payments = paymentsResult.payload;
		const attendanceRecords = attendanceResult.payload;
		const courseGrades: CourseGrade[] = fetchAllCourseGrades.fulfilled.match(
			gradesResult
		)
			? gradesResult.payload
			: [];

		// Additional debug logs for data validation
		if (!Array.isArray(courses)) {
			console.error("Courses data is not an array:", courses);
		} else if (courses.length === 0) {
			console.warn("Courses array is empty. Possible data issue.");
		}

		if (!Array.isArray(payments)) {
			console.error("Payments data is not an array:", payments);
		} else if (payments.length === 0) {
			console.warn("Payments array is empty. Possible data issue.");
		}

		console.log("All data fetched. Deriving stats...");
		console.log(
			`- Users: ${users.length}, Courses: ${courses.length}, Payments: ${payments.length}, Attendance: ${attendanceRecords.length}, Grades: ${courseGrades.length}`
		);

		const dashboardStats = deriveDashboardStats(
			users,
			courses,
			payments,
			attendanceRecords,
			courseGrades
		);

		console.log("Stats derived successfully.");
		return dashboardStats;
	} catch (error: any) {
		console.error("Error in fetchAnalyticsDashboard thunk:", error);
		return rejectWithValue(
			error.message || "Failed to fetch analytics dashboard data"
		);
	}
});

// Analytics slice
const analyticsSlice = createSlice({
	name: "analytics",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchAnalyticsDashboard.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchAnalyticsDashboard.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.dashboardStats = action.payload;
			})
			.addCase(fetchAnalyticsDashboard.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload as string;
			});
	},
});

// Selectors
export const selectAnalyticsDashboardStats = (state: RootState) =>
	state.analytics.dashboardStats;
export const selectAnalyticsStatus = (state: RootState) =>
	state.analytics.status;
export const selectAnalyticsError = (state: RootState) => state.analytics.error;

// New selectors to expose derived course revenue and attendance reports for admin analytics page
export const selectDerivedCourseRevenue = (state: RootState) => {
	const payments = state.adminPayments.payments;
	return calculateCourseRevenues(payments);
};

export const selectDerivedAttendanceReports = (state: RootState) => {
	const courses = state.auth_courses.courses;
	const attendanceRecords: any[] = state.attendanceMarking.courseAttendance
		? Object.values(state.attendanceMarking.courseAttendance).flatMap(
				(course) =>
					Object.values(course.dailyRecords || {}).flatMap(
						(dailyRecord) => dailyRecord.attendances || []
					)
			)
		: [];
	return deriveAttendanceReportsPerCourse(courses, attendanceRecords);
};

export default analyticsSlice.reducer;
