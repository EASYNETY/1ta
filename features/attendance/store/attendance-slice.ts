// features/attendance/store/attendance-slice.ts (Example Structure)
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store"; // Adjust path if needed
import { apiClient, post } from "@/lib/api-client"; // Adjust path

// Define state shape
interface AttendanceMarkingState {
	isLoading: boolean;
	error: string | null;
	lastMarkedStatus: "success" | "error" | "idle";
	markedStudentId: string | null;
}

// Define argument structure for the thunk
export interface MarkAttendancePayload {
	studentId: string;
	classInstanceId: string; // Or courseId, scheduleId - how you identify the session
	markedByUserId: string; // ID of the admin/teacher scanning
	timestamp: string; // ISO timestamp
}

// Define thunk
export const markStudentAttendance = createAsyncThunk<
	{ success: boolean; studentId: string; message?: string }, // Return type on success
	MarkAttendancePayload, // Input type
	{ state: RootState; rejectValue: string } // ThunkAPI config
>("attendance/markStudent", async (payload, { getState, rejectWithValue }) => {
	const { auth } = getState();
	const token = auth.token;
	if (!token) {
		return rejectWithValue("Authentication required.");
	}

	try {
		// Replace '/attendance/mark' with your actual API endpoint
		const response = await post<{ success: boolean; message?: string }>(
			"/attendance/mark",
			payload,
			{ headers: { Authorization: `Bearer ${token}` } }
		);
		if (response.success) {
			return { ...response, studentId: payload.studentId };
		} else {
			// Use message from response if available, otherwise provide default
			return rejectWithValue(
				response.message || "Failed to mark attendance on server."
			);
		}
	} catch (error: any) {
		console.error("Mark attendance error:", error);
		const message =
			error?.response?.data?.message ||
			error?.message ||
			"An unknown error occurred.";
		return rejectWithValue(message);
	}
});

const initialState: AttendanceMarkingState = {
	isLoading: false,
	error: null,
	lastMarkedStatus: "idle",
	markedStudentId: null,
};

const attendanceMarkingSlice = createSlice({
	name: "attendanceMarking",
	initialState,
	reducers: {
		resetMarkingStatus: (state) => {
			state.lastMarkedStatus = "idle";
			state.error = null;
			state.markedStudentId = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(markStudentAttendance.pending, (state) => {
				state.isLoading = true;
				state.error = null;
				state.lastMarkedStatus = "idle";
				state.markedStudentId = null;
			})
			.addCase(markStudentAttendance.fulfilled, (state, action) => {
				state.isLoading = false;
				state.lastMarkedStatus = "success";
				state.markedStudentId = action.payload.studentId;
				state.error = null;
				// Optional: log success message action.payload.message
			})
			.addCase(markStudentAttendance.rejected, (state, action) => {
				state.isLoading = false;
				state.lastMarkedStatus = "error";
				state.error = action.payload ?? "Failed to mark attendance."; // Use rejected value as error
				state.markedStudentId = null; // Or keep the ID trying to be marked? Depends on desired behavior.
			});
	},
});

export const { resetMarkingStatus } = attendanceMarkingSlice.actions;

// Selectors
export const selectAttendanceMarkingLoading = (state: RootState) =>
	state.attendanceMarking.isLoading;
export const selectAttendanceMarkingError = (state: RootState) =>
	state.attendanceMarking.error;
export const selectAttendanceMarkingStatus = (state: RootState) =>
	state.attendanceMarking.lastMarkedStatus;
export const selectLastMarkedStudentId = (state: RootState) =>
	state.attendanceMarking.markedStudentId;

// Add this reducer to your main store configuration
export default attendanceMarkingSlice.reducer;
