// features/analytics/store/reports-slice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { ReportsState } from "../types/report-types";
import {
  fetchStudentReports,
  fetchStudentBiodataReports,
  fetchCourseReports,
  fetchPaymentReports,
  fetchAttendanceReports
} from "./report-thunks";

// Initial state
const initialState: ReportsState = {
  studentReports: {
    data: [],
    total: 0,
    status: "idle",
    error: null,
  },
  studentBiodataReports: {
    data: [],
    total: 0,
    status: "idle",
    error: null,
  },
  courseReports: {
    data: [],
    total: 0,
    status: "idle",
    error: null,
  },
  paymentReports: {
    data: [],
    total: 0,
    status: "idle",
    error: null,
  },
  attendanceReports: {
    data: [],
    total: 0,
    status: "idle",
    error: null,
  },
};

// Reports slice
const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Student Reports
    builder
      .addCase(fetchStudentReports.pending, (state) => {
        state.studentReports.status = "loading";
        state.studentReports.error = null;
      })
      .addCase(fetchStudentReports.fulfilled, (state, action) => {
        state.studentReports.status = "succeeded";
        state.studentReports.data = action.payload.data;
        state.studentReports.total = action.payload.total;
      })
      .addCase(fetchStudentReports.rejected, (state, action) => {
        state.studentReports.status = "failed";
        state.studentReports.error = action.payload as string;
      });

    // Student Biodata Reports
    builder
      .addCase(fetchStudentBiodataReports.pending, (state) => {
        state.studentBiodataReports.status = "loading";
        state.studentBiodataReports.error = null;
      })
      .addCase(fetchStudentBiodataReports.fulfilled, (state, action) => {
        state.studentBiodataReports.status = "succeeded";
        state.studentBiodataReports.data = action.payload.data;
        state.studentBiodataReports.total = action.payload.total;
      })
      .addCase(fetchStudentBiodataReports.rejected, (state, action) => {
        state.studentBiodataReports.status = "failed";
        state.studentBiodataReports.error = action.payload as string;
      });

    // Course Reports
    builder
      .addCase(fetchCourseReports.pending, (state) => {
        state.courseReports.status = "loading";
        state.courseReports.error = null;
      })
      .addCase(fetchCourseReports.fulfilled, (state, action) => {
        state.courseReports.status = "succeeded";
        state.courseReports.data = action.payload.data;
        state.courseReports.total = action.payload.total;
      })
      .addCase(fetchCourseReports.rejected, (state, action) => {
        state.courseReports.status = "failed";
        state.courseReports.error = action.payload as string;
      });

    // Payment Reports
    builder
      .addCase(fetchPaymentReports.pending, (state) => {
        state.paymentReports.status = "loading";
        state.paymentReports.error = null;
      })
      .addCase(fetchPaymentReports.fulfilled, (state, action) => {
        state.paymentReports.status = "succeeded";
        state.paymentReports.data = action.payload.data;
        state.paymentReports.total = action.payload.total;
      })
      .addCase(fetchPaymentReports.rejected, (state, action) => {
        state.paymentReports.status = "failed";
        state.paymentReports.error = action.payload as string;
      });

    // Attendance Reports
    builder
      .addCase(fetchAttendanceReports.pending, (state) => {
        state.attendanceReports.status = "loading";
        state.attendanceReports.error = null;
      })
      .addCase(fetchAttendanceReports.fulfilled, (state, action) => {
        state.attendanceReports.status = "succeeded";
        state.attendanceReports.data = action.payload.data;
        state.attendanceReports.total = action.payload.total;
      })
      .addCase(fetchAttendanceReports.rejected, (state, action) => {
        state.attendanceReports.status = "failed";
        state.attendanceReports.error = action.payload as string;
      });
  },
});

// Selectors
export const selectStudentReports = (state: RootState) => state.reports.studentReports;
export const selectStudentBiodataReports = (state: RootState) => state.reports.studentBiodataReports;
export const selectCourseReports = (state: RootState) => state.reports.courseReports;
export const selectPaymentReports = (state: RootState) => state.reports.paymentReports;
export const selectAttendanceReports = (state: RootState) => state.reports.attendanceReports;

export default reportsSlice.reducer;
