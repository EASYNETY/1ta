// features/analytics/store/student-biodata-slice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { StudentBiodataState, StudentBiodataStats } from "../types/student-biodata-types";
import { deriveStudentBiodataStats } from "../utils/data-derivation";

// Initial state
const initialState: StudentBiodataState = {
  stats: {
    genderDistribution: {
      male: 0,
      female: 0,
      other: 0,
      notSpecified: 0,
    },
    ageDistribution: {
      under18: 0,
      age18to24: 0,
      age25to34: 0,
      age35to44: 0,
      age45Plus: 0,
    },
    corporateVsIndividual: {
      corporate: 0,
      individual: 0,
    },
    locationDistribution: {},
    enrollmentTrends: [],
    completionRates: [],
  },
  status: "idle",
  error: null,
};

// Async thunk to fetch student biodata stats
export const fetchStudentBiodataStats = createAsyncThunk(
  "studentBiodata/fetchStats",
  async (_, { getState, rejectWithValue }) => {
    try {
      // Get the current state
      const state = getState() as RootState;

      // Derive student biodata stats from the state
      const studentBiodataStats = deriveStudentBiodataStats(state);

      return studentBiodataStats;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to derive student biodata stats");
    }
  }
);

// Student biodata slice
const studentBiodataSlice = createSlice({
  name: "studentBiodata",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentBiodataStats.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchStudentBiodataStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stats = action.payload;
      })
      .addCase(fetchStudentBiodataStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectStudentBiodataStats = (state: RootState) => state.studentBiodata.stats;
export const selectStudentBiodataStatus = (state: RootState) => state.studentBiodata.status;
export const selectStudentBiodataError = (state: RootState) => state.studentBiodata.error;

export default studentBiodataSlice.reducer;
