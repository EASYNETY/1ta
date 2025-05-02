// features/attendance/store/attendance-slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { apiClient, post } from "@/lib/api-client";
// Import the mock data structures and the actual mock data
import {
	StudentAttendance, // Interface for student details within a day
	StudentAttendanceRecord, // Interface for student's own records {date, status}
	TeacherAttendanceResponse, // Structure of mockClassAttendance
	DailyAttendance, // Structure for one day's attendance in Teacher view
	mockStudentAttendance as initialMockStudentData, // Rename for clarity
	mockClassAttendance as initialMockClassData, // Rename for clarity
} from "@/data/mock-attendance-data";

// --- Adjusted State Shape ---

// Represents the attendance details for a specific course, organized by date
interface CourseAttendanceDetails {
	courseClassId: string;
	courseTitle: string;
	totalStudents: number;
	// Store daily records keyed by date string ('yyyy-MM-dd') for efficient lookup
	dailyRecords: Record<string, DailyAttendance>; // Use DailyAttendance from mock data
}

// State shape
interface AttendanceMarkingState {
	isLoading: boolean;
	error: string | null;
	lastMarkedStatus: "success" | "error" | "idle";
	markedStudentId: string | null;
	// Keep studentAttendance keyed by studentId, value is array of their records
	studentAttendance: Record<string, StudentAttendanceRecord[]>;
	// Store course attendance details keyed by courseClassId
	courseAttendance: Record<string, CourseAttendanceDetails>;
}

// Mark Attendance Payload (Keep as is)
export interface MarkAttendancePayload {
	studentId: string;
	classInstanceId: string;
	markedByUserId: string;
	timestamp: string;
}

// Mark Attendance Thunk (Keep as is)
export const markStudentAttendance = createAsyncThunk<
	{ success: boolean; studentId: string; message?: string },
	MarkAttendancePayload,
	{ state: RootState; rejectValue: string }
>("attendance/markStudent", async (payload, { getState, rejectWithValue }) => {
	// ... (implementation remains the same)
	const { auth } = getState();
	const token = auth.token;
	if (!token) {
		return rejectWithValue("Authentication required.");
	}

	try {
		// Replace with your actual API endpoint
		const response = await post<{ success: boolean; message?: string }>(
			"/attendance/mark", // Make sure API client mocks this if needed
			payload,
			{ headers: { Authorization: `Bearer ${token}` } }
		);
		if (response.success) {
			// TODO: Ideally, the API response should include the updated attendance record
			// so we can update the state here instead of just setting status flags.
			// For now, we just indicate success/failure.
			return { ...response, studentId: payload.studentId };
		} else {
			return rejectWithValue(
				response.message || "Failed to mark attendance on server."
			);
		}
	} catch (error: any) {
		const message =
			error?.response?.data?.message ||
			error?.message ||
			"An unknown error occurred.";
		return rejectWithValue(message);
	}
});

// --- Pre-process Mock Data for Initial State ---
// Transform mockClassAttendance into the desired CourseAttendanceDetails structure
const processedCourseAttendance: Record<string, CourseAttendanceDetails> =
	initialMockClassData.reduce(
		(acc, course) => {
			if (!acc[course.courseClassId]) {
				acc[course.courseClassId] = {
					courseClassId: course.courseClassId,
					courseTitle: course.courseTitle,
					totalStudents: course.totalStudents,
					dailyRecords: {},
				};
			}
			// Add daily records, keyed by date
			course.dailyAttendances.forEach((daily) => {
				acc[course.courseClassId].dailyRecords[daily.date] = daily;
			});
			return acc;
		},
		{} as Record<string, CourseAttendanceDetails>
	);

// --- Initial State ---
const initialState: AttendanceMarkingState = {
	isLoading: false,
	error: null,
	lastMarkedStatus: "idle",
	markedStudentId: null,
	// Initialize with mock data (in real app, this would be empty/fetched)
	studentAttendance: initialMockStudentData,
	courseAttendance: processedCourseAttendance,
};

// --- Slice Definition ---
const attendanceMarkingSlice = createSlice({
	name: "attendanceMarking",
	initialState,
	reducers: {
		resetMarkingStatus: (state) => {
			state.lastMarkedStatus = "idle";
			state.error = null;
			state.markedStudentId = null;
		},
		// Example: Add a reducer to load data (if fetching)
		// loadStudentAttendance: (state, action: PayloadAction<Record<string, StudentAttendanceRecord[]>>) => {
		//     state.studentAttendance = action.payload;
		// },
		// loadCourseAttendance: (state, action: PayloadAction<Record<string, CourseAttendanceDetails>>) => {
		//     state.courseAttendance = action.payload;
		// },
		// You might need more specific reducers if the markStudentAttendance thunk
		// is supposed to update the state directly upon success.
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
				// TODO: Update the actual attendance state here based on action.payload
				// This requires knowing the date, status etc., which aren't in the current payload.
				// Example: If payload included { studentId, date, status, courseClassId }
				// const { studentId, date, status, courseClassId } = action.meta.arg; // Get input args
				// if (state.studentAttendance[studentId]) {
				//      // update or add record
				// }
				// if (state.courseAttendance[courseClassId]?.dailyRecords[date]) {
				//      // find student and update status
				// }
			})
			.addCase(markStudentAttendance.rejected, (state, action) => {
				state.isLoading = false;
				state.lastMarkedStatus = "error";
				state.error = action.payload ?? "Failed to mark attendance.";
				state.markedStudentId = null;
			});
	},
});

// export const { resetMarkingStatus, loadStudentAttendance, loadCourseAttendance } = attendanceMarkingSlice.actions;
export const { resetMarkingStatus } = attendanceMarkingSlice.actions; // Only export used reducers

// --- Selectors ---
export const selectAttendanceMarkingLoading = (state: RootState) =>
	state.attendanceMarking.isLoading;
export const selectAttendanceMarkingError = (state: RootState) =>
	state.attendanceMarking.error;
export const selectAttendanceMarkingStatus = (state: RootState) =>
	state.attendanceMarking.lastMarkedStatus;
export const selectLastMarkedStudentId = (state: RootState) =>
	state.attendanceMarking.markedStudentId;

// Selects all attendance records for a specific student
export const selectStudentAttendanceRecords = (
	state: RootState,
	studentId: string
): StudentAttendanceRecord[] =>
	state.attendanceMarking.studentAttendance[studentId] || [];

// Selects all daily attendance records for a specific course class
export const selectCourseDailyAttendances = (
	state: RootState,
	courseClassId: string
): DailyAttendance[] => {
	// Return the daily records as an array
	// --- FIX: Add safety check for courseAttendance itself ---
	// Use optional chaining to safely access courseAttendance
	const courseAttendanceMap = state.attendanceMarking?.courseAttendance;

	// If the main courseAttendance map doesn't exist in the state, return empty array
	if (!courseAttendanceMap) {
		// Optional: Log a warning for debugging if this happens unexpectedly
		console.warn(
			`[selectCourseDailyAttendances] state.attendanceMarking.courseAttendance is undefined.`
		);
		return [];
	}

	// If the map exists, try to get details for the specific courseClassId
	const courseDetails = courseAttendanceMap[courseClassId];

	// If details for this specific ID exist, return its daily records, otherwise return empty array
	return courseDetails ? Object.values(courseDetails.dailyRecords) : [];
};

// Selects a specific day's attendance record for a course class
export const selectCourseAttendanceForDate = (
	state: RootState,
	courseClassId: string,
	date: string
): DailyAttendance | null => {
	const courseDetails = state.attendanceMarking.courseAttendance[courseClassId];
	return courseDetails?.dailyRecords[date] || null;
};

// --- Reducer ---
export default attendanceMarkingSlice.reducer;
