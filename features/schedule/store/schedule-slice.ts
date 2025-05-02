// features/schedule/store/schedule-slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { ScheduleEvent, ScheduleState } from "../types/schedule-types";
import { startOfWeek, formatISO } from "date-fns";

// Import mock function (replace with API client later)
import { getMockSchedule } from "@/data/mock-schedule-data"; // Adjust path

// --- Async Thunk ---
interface FetchScheduleParams {
	role: string;
	userId?: string;
	// Add date range params if needed later
	// startDate?: string;
	// endDate?: string;
}

export const fetchSchedule = createAsyncThunk<
	ScheduleEvent[], // Return type
	FetchScheduleParams, // Argument type
	{ state: RootState; rejectValue: string }
>("schedule/fetchSchedule", async ({ role, userId }, { rejectWithValue }) => {
	try {
		// TODO: Replace with API call via apiClient based on IS_LIVE_API
		const events = await getMockSchedule(role, userId);
		return events;
	} catch (error: any) {
		return rejectWithValue(error.message || "Failed to fetch schedule");
	}
});

// --- Initial State ---
const initialState: ScheduleState = {
	events: [],
	status: "idle",
	error: null,
	// Initialize viewStartDate to the start of the current week (Monday)
	viewStartDate: formatISO(startOfWeek(new Date(), { weekStartsOn: 1 }), {
		representation: "date",
	}),
};

// --- Slice Definition ---
const scheduleSlice = createSlice({
	name: "schedule",
	initialState,
	reducers: {
		setViewStartDate: (state, action: PayloadAction<string>) => {
			// Ensure payload is just the date part 'YYYY-MM-DD'
			state.viewStartDate = action.payload.split("T")[0];
			// Optionally reset status when view changes to trigger refetch if needed elsewhere
			// state.status = 'idle';
		},
		clearScheduleError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchSchedule.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchSchedule.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.events = action.payload;
			})
			.addCase(fetchSchedule.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Unknown schedule error";
			});
	},
});

// --- Actions and Selectors ---
export const { setViewStartDate, clearScheduleError } = scheduleSlice.actions;

export const selectScheduleEvents = (state: RootState) => state.schedule.events;
export const selectScheduleStatus = (state: RootState) => state.schedule.status;
export const selectScheduleError = (state: RootState) => state.schedule.error;
export const selectScheduleViewStartDate = (state: RootState) =>
	state.schedule.viewStartDate;

export default scheduleSlice.reducer;
