// features/analytics/store/analytics-slice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { AnalyticsState, DashboardStats } from "../types/analytics-types";
import { deriveDashboardStats } from "../utils/data-derivation";

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
  async (_, { getState, rejectWithValue }) => {
    try {
      // Get the current state
      const state = getState() as RootState;

      // Derive dashboard stats from the state
      const dashboardStats = deriveDashboardStats(state);

      return dashboardStats;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to derive analytics dashboard data");
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
