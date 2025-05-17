// features/analytics/store/report-thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type {
  ReportFilter,
  StudentBiodataFilter
} from "../types/analytics-types";
import type {
  StudentReport,
  StudentBiodataReport,
  CourseReport,
  PaymentReport,
  AttendanceReport,
  ReportResponse
} from "../types/report-types";
import { deriveStudentReports } from "../utils/data-derivation";
import { deriveStudentBiodataReports, deriveCourseReports } from "../utils/data-derivation-reports";

// Helper function to build query string from filter
const buildQueryString = (filter: ReportFilter | StudentBiodataFilter): string => {
  const queryParams = new URLSearchParams();

  // Common parameters
  if (filter.startDate) queryParams.append("startDate", filter.startDate);
  if (filter.endDate) queryParams.append("endDate", filter.endDate);

  // ReportFilter specific parameters
  if ('courseId' in filter && filter.courseId) queryParams.append("courseId", filter.courseId);
  if ('userId' in filter && filter.userId) queryParams.append("userId", filter.userId);
  if ('status' in filter && filter.status) queryParams.append("status", filter.status);
  if ('searchTerm' in filter && filter.searchTerm) queryParams.append("search", filter.searchTerm);
  if ('page' in filter && filter.page !== undefined) queryParams.append("page", filter.page.toString());
  if ('limit' in filter && filter.limit !== undefined) queryParams.append("limit", filter.limit.toString());

  // StudentBiodataFilter specific parameters
  if ('gender' in filter && filter.gender) queryParams.append("gender", filter.gender);
  if ('ageRange' in filter && filter.ageRange) queryParams.append("ageRange", filter.ageRange);
  if ('accountType' in filter && filter.accountType) queryParams.append("accountType", filter.accountType);
  if ('corporateId' in filter && filter.corporateId) queryParams.append("corporateId", filter.corporateId);
  if ('location' in filter && filter.location) queryParams.append("location", filter.location);
  if ('completionRateMin' in filter && filter.completionRateMin !== undefined)
    queryParams.append("completionRateMin", filter.completionRateMin.toString());
  if ('completionRateMax' in filter && filter.completionRateMax !== undefined)
    queryParams.append("completionRateMax", filter.completionRateMax.toString());

  return queryParams.toString();
};

// Student Reports
export const fetchStudentReports = createAsyncThunk(
  "reports/fetchStudentReports",
  async (filter: ReportFilter, { getState, rejectWithValue }) => {
    try {
      // Get the current state
      const state = getState() as RootState;

      // Derive student reports from the state
      const studentReports = deriveStudentReports(state, filter);

      return studentReports;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to derive student reports");
    }
  }
);

// Student Biodata Reports
export const fetchStudentBiodataReports = createAsyncThunk(
  "reports/fetchStudentBiodataReports",
  async (filter: StudentBiodataFilter, { getState, rejectWithValue }) => {
    try {
      // Get the current state
      const state = getState() as RootState;

      // Derive student biodata reports from the state
      const studentBiodataReports = deriveStudentBiodataReports(state, filter);

      return studentBiodataReports;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to derive student biodata reports");
    }
  }
);

// Course Reports
export const fetchCourseReports = createAsyncThunk(
  "reports/fetchCourseReports",
  async (filter: ReportFilter, { getState, rejectWithValue }) => {
    try {
      // Get the current state
      const state = getState() as RootState;

      // Derive course reports from the state
      const courseReports = deriveCourseReports(state, filter);

      return courseReports;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to derive course reports");
    }
  }
);

// Payment Reports
export const fetchPaymentReports = createAsyncThunk(
  "reports/fetchPaymentReports",
  async (filter: ReportFilter, { getState, rejectWithValue }) => {
    try {
      // Get the current state
      const state = getState() as RootState;

      // Import dynamically to avoid circular dependencies
      const { derivePaymentReports } = await import("../utils/data-derivation-additional");

      // Derive payment reports from the state
      const paymentReports = derivePaymentReports(state, filter);

      return paymentReports;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to derive payment reports");
    }
  }
);

// Attendance Reports
export const fetchAttendanceReports = createAsyncThunk(
  "reports/fetchAttendanceReports",
  async (filter: ReportFilter, { getState, rejectWithValue }) => {
    try {
      // Get the current state
      const state = getState() as RootState;

      // Import dynamically to avoid circular dependencies
      const { deriveAttendanceReports } = await import("../utils/data-derivation-additional");

      // Derive attendance reports from the state
      const attendanceReports = deriveAttendanceReports(state, filter);

      return attendanceReports;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to derive attendance reports");
    }
  }
);
