// features/analytics/store/analytics-slice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { get } from "@/lib/api-client";
import type { RootState } from "@/store";
import type { AnalyticsState, DashboardStats } from "../types/analytics-types";

// Initial state
const initialState: AnalyticsState = {
  dashboardStats: {
    studentStats: {
      total: 0,
      active: 0,
      newThisMonth: 0,
      growthRate: 0,
    },
    courseStats: {
      total: 0,
      active: 0,
      averageCompletion: 0,
      mostPopular: "",
    },
    paymentStats: {
      totalRevenue: 0,
      revenueThisMonth: 0,
      growthRate: 0,
      averageOrderValue: 0,
    },
    attendanceStats: {
      averageRate: 0,
      trendsData: [],
    },
  },
  status: "idle",
  error: null,
};

// Async thunk to fetch dashboard analytics
export const fetchAnalyticsDashboard = createAsyncThunk(
  "analytics/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await get<{
        success: boolean;
        data: DashboardStats;
        message?: string;
      }>("/admin/analytics/dashboard");

      if (!response || !response.success) {
        throw new Error(response?.message || "Failed to fetch analytics dashboard data");
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch analytics dashboard data");
    }
  }
);

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
export const selectAnalyticsDashboardStats = (state: RootState) => state.analytics.dashboardStats;
export const selectAnalyticsStatus = (state: RootState) => state.analytics.status;
export const selectAnalyticsError = (state: RootState) => state.analytics.error;

export default analyticsSlice.reducer;
