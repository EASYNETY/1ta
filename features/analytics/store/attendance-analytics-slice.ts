// features/analytics/store/attendance-analytics-slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store/store';
import { AttendanceAnalyticsService, type AttendanceRecord } from '@/utils/attendance-analytics';

// Types
interface AttendanceAnalyticsState {
  data: {
    overallStats: {
      totalRecords: number;
      attendanceRate: number;
      presentCount: number;
      absentCount: number;
      lateCount: number;
      excusedCount: number;
    } | null;
    attendanceTrends: Array<{
      date: string;
      value: number;
      total: number;
      present: number;
    }>;
    attendanceByDay: Array<{
      name: string;
      value: number;
      total: number;
      present: number;
    }>;
    statusDistribution: Array<{
      name: string;
      value: number;
    }>;
    attendanceByClass: Array<{
      classId: string;
      className: string;
      attendanceRate: number;
      totalSessions: number;
      presentSessions: number;
    }>;
    studentPatterns: Array<{
      studentId: string;
      studentName: string;
      studentEmail: string;
      attendanceRate: number;
      totalSessions: number;
      presentSessions: number;
      lateSessions: number;
      absentSessions: number;
    }>;
    recentSummary: {
      total: number;
      present: number;
      absent: number;
      late: number;
      excused: number;
    } | null;
  };
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: string | null;
}

// Initial state
const initialState: AttendanceAnalyticsState = {
  data: {
    overallStats: null,
    attendanceTrends: [],
    attendanceByDay: [],
    statusDistribution: [],
    attendanceByClass: [],
    studentPatterns: [],
    recentSummary: null,
  },
  status: 'idle',
  error: null,
  lastFetched: null,
};

// Async thunk to fetch attendance analytics
export const fetchAttendanceAnalytics = createAsyncThunk(
  'attendanceAnalytics/fetchAttendanceAnalytics',
  async (params: {
    baseUrl: string;
    authToken: string;
    startDate?: string;
    endDate?: string;
    courseId?: string;
  }) => {
    const { baseUrl, authToken, ...filterParams } = params;
    const service = new AttendanceAnalyticsService(baseUrl, authToken);
    const analytics = await service.getAttendanceAnalytics(filterParams);
    return analytics;
  }
);

// Create the slice
const attendanceAnalyticsSlice = createSlice({
  name: 'attendanceAnalytics',
  initialState,
  reducers: {
    clearAttendanceAnalytics: (state) => {
      state.data = initialState.data;
      state.status = 'idle';
      state.error = null;
      state.lastFetched = null;
    },
    updateAttendanceFilter: (state, action: PayloadAction<{ courseId?: string; classId?: string }>) => {
      // This can be used to filter existing data without refetching
      // Implementation depends on your specific filtering needs
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendanceAnalytics.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAttendanceAnalytics.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.error = null;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchAttendanceAnalytics.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch attendance analytics';
      });
  },
});

// Export actions
export const { clearAttendanceAnalytics, updateAttendanceFilter } = attendanceAnalyticsSlice.actions;

// Selectors
export const selectAttendanceAnalyticsData = (state: RootState) => state.attendanceAnalytics.data;
export const selectAttendanceAnalyticsStatus = (state: RootState) => state.attendanceAnalytics.status;
export const selectAttendanceAnalyticsError = (state: RootState) => state.attendanceAnalytics.error;
export const selectAttendanceAnalyticsLastFetched = (state: RootState) => state.attendanceAnalytics.lastFetched;

// Derived selectors
export const selectAttendanceOverallStats = (state: RootState) => state.attendanceAnalytics.data.overallStats;
export const selectAttendanceTrends = (state: RootState) => state.attendanceAnalytics.data.attendanceTrends;
export const selectAttendanceByDay = (state: RootState) => state.attendanceAnalytics.data.attendanceByDay;
export const selectAttendanceStatusDistribution = (state: RootState) => state.attendanceAnalytics.data.statusDistribution;
export const selectAttendanceByClass = (state: RootState) => state.attendanceAnalytics.data.attendanceByClass;
export const selectStudentAttendancePatterns = (state: RootState) => state.attendanceAnalytics.data.studentPatterns;
export const selectAttendanceRecentSummary = (state: RootState) => state.attendanceAnalytics.data.recentSummary;

// Export reducer
export default attendanceAnalyticsSlice.reducer;

// Enhanced hook for React components
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useEffect, useCallback } from 'react';

export function useAttendanceAnalytics(
  baseUrl: string, 
  authToken: string, 
  params?: { startDate?: string; endDate?: string; courseId?: string },
  autoRefresh = false
) {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectAttendanceAnalyticsData);
  const status = useAppSelector(selectAttendanceAnalyticsStatus);
  const error = useAppSelector(selectAttendanceAnalyticsError);
  const lastFetched = useAppSelector(selectAttendanceAnalyticsLastFetched);

  const fetchData = useCallback(() => {
    if (baseUrl && authToken) {
      dispatch(fetchAttendanceAnalytics({ baseUrl, authToken, ...params }));
    }
  }, [dispatch, baseUrl, authToken, JSON.stringify(params)]);

  useEffect(() => {
    if (status === 'idle' || !lastFetched) {
      fetchData();
    }
  }, [fetchData, status, lastFetched]);

  // Auto refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchData();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  return {
    data,
    status,
    error,
    loading: status === 'loading',
    lastFetched,
    refetch: fetchData,
    clear: () => dispatch(clearAttendanceAnalytics()),
  };
}