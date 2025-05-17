// features/analytics/store/report-thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { get } from "@/lib/api-client";
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
  async (filter: ReportFilter, { rejectWithValue }) => {
    try {
      const queryString = buildQueryString(filter);
      
      const response = await get<{
        success: boolean;
        data: ReportResponse<StudentReport>;
        message?: string;
      }>(`/admin/reports/students?${queryString}`);

      if (!response || !response.success) {
        throw new Error(response?.message || "Failed to fetch student reports");
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch student reports");
    }
  }
);

// Student Biodata Reports
export const fetchStudentBiodataReports = createAsyncThunk(
  "reports/fetchStudentBiodataReports",
  async (filter: StudentBiodataFilter, { rejectWithValue }) => {
    try {
      const queryString = buildQueryString(filter);
      
      const response = await get<{
        success: boolean;
        data: ReportResponse<StudentBiodataReport>;
        message?: string;
      }>(`/admin/reports/student-biodata?${queryString}`);

      if (!response || !response.success) {
        throw new Error(response?.message || "Failed to fetch student biodata reports");
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch student biodata reports");
    }
  }
);

// Course Reports
export const fetchCourseReports = createAsyncThunk(
  "reports/fetchCourseReports",
  async (filter: ReportFilter, { rejectWithValue }) => {
    try {
      const queryString = buildQueryString(filter);
      
      const response = await get<{
        success: boolean;
        data: ReportResponse<CourseReport>;
        message?: string;
      }>(`/admin/reports/courses?${queryString}`);

      if (!response || !response.success) {
        throw new Error(response?.message || "Failed to fetch course reports");
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch course reports");
    }
  }
);

// Payment Reports
export const fetchPaymentReports = createAsyncThunk(
  "reports/fetchPaymentReports",
  async (filter: ReportFilter, { rejectWithValue }) => {
    try {
      const queryString = buildQueryString(filter);
      
      const response = await get<{
        success: boolean;
        data: ReportResponse<PaymentReport>;
        message?: string;
      }>(`/admin/reports/payments?${queryString}`);

      if (!response || !response.success) {
        throw new Error(response?.message || "Failed to fetch payment reports");
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch payment reports");
    }
  }
);

// Attendance Reports
export const fetchAttendanceReports = createAsyncThunk(
  "reports/fetchAttendanceReports",
  async (filter: ReportFilter, { rejectWithValue }) => {
    try {
      const queryString = buildQueryString(filter);
      
      const response = await get<{
        success: boolean;
        data: ReportResponse<AttendanceReport>;
        message?: string;
      }>(`/admin/reports/attendance?${queryString}`);

      if (!response || !response.success) {
        throw new Error(response?.message || "Failed to fetch attendance reports");
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch attendance reports");
    }
  }
);
