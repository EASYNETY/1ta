// features/attendance/store/attendance-slice.ts
import {
	createSlice,
	createAsyncThunk,
	PayloadAction,
	createSelector,
} from "@reduxjs/toolkit"; // Added createSelector
import type { RootState } from "@/store";
import { apiClient, post } from "@/lib/api-client";
// Import the mock data structures and the actual mock data
import {
	StudentAttendance,
	StudentAttendanceRecord,
	TeacherAttendanceResponse,
	DailyAttendance,
	mockStudentAttendance as initialMockStudentData,
	mockClassAttendance as initialMockClassData,
} from "@/data/mock-attendance-data";

// --- Adjusted State Shape ---
interface CourseAttendanceDetails {
	courseClassId: string;
	courseTitle: string;
	totalStudents: number;
	dailyRecords: Record<string, DailyAttendance>;
}

interface AttendanceMarkingState {
	isLoading: boolean;
	error: string | null;
	lastMarkedStatus: "success" | "error" | "idle";
	markedStudentId: string | null;
	studentAttendance: Record<string, StudentAttendanceRecord[]>;
	courseAttendance: Record<string, CourseAttendanceDetails>;
}

// Mark Attendance Payload
export interface MarkAttendancePayload {
	studentId: string;
	classInstanceId: string;
	markedByUserId: string;
	timestamp: string;
}

// Mark Attendance Thunk
export const markStudentAttendance = createAsyncThunk<
	{ success: boolean; studentId: string; message?: string },
	MarkAttendancePayload,
	{ state: RootState; rejectValue: string }
>("attendance/markStudent", async (payload, { getState, rejectWithValue }) => {
	const { auth } = getState();
	const token = auth.token;
	if (!token) {
		return rejectWithValue("Authentication required.");
	}
	try {
		const response = await post<{ success: boolean; message?: string }>(
			"/attendance/mark",
			payload,
			{ headers: { Authorization: `Bearer ${token}` } }
		);
		if (response.success) {
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
			course.dailyAttendances.forEach((daily) => {
				acc[course.courseClassId].dailyRecords[daily.date] = daily;
			});
			return acc;
		},
		{} as Record<string, CourseAttendanceDetails>
	);

const initialState: AttendanceMarkingState = {
	isLoading: false,
	error: null,
	lastMarkedStatus: "idle",
	markedStudentId: null,
	studentAttendance: initialMockStudentData,
	courseAttendance: processedCourseAttendance,
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
				// IMPORTANT: If marking attendance should update dailyRecords,
				// you MUST do it here to ensure the state is correctly updated.
				// This is crucial for selectors to pick up changes.
				// Example:
				// const { studentId, classInstanceId, timestamp } = action.meta.arg;
				// const date = new Date(timestamp).toISOString().split('T')[0]; // yyyy-MM-dd
				// if (state.courseAttendance[classInstanceId]?.dailyRecords[date]) {
				//    const studentEntry = state.courseAttendance[classInstanceId].dailyRecords[date].attendances.find(s => s.studentId === studentId);
				//    if (studentEntry) {
				//        studentEntry.status = "present"; // Or based on logic
				//    } else {
				//        // Add new student entry if not found (less likely for 'mark')
				//    }
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

export const { resetMarkingStatus } = attendanceMarkingSlice.actions;

// --- Selectors ---
export const selectAttendanceMarkingLoading = (state: RootState) =>
	state.attendanceMarking.isLoading;
export const selectAttendanceMarkingError = (state: RootState) =>
	state.attendanceMarking.error;
export const selectAttendanceMarkingStatus = (state: RootState) =>
	state.attendanceMarking.lastMarkedStatus;
export const selectLastMarkedStudentId = (state: RootState) =>
	state.attendanceMarking.markedStudentId;

// --- MEMOIZED SELECTORS START ---

// Input selector for courseAttendance part of the state
const selectCourseAttendanceMap = (state: RootState) =>
	state.attendanceMarking.courseAttendance;

// Input selector for the courseClassId argument passed to the selector
const selectCourseClassIdArg = (_: RootState, courseClassId?: string) =>
	courseClassId;

// Stable empty array reference
const EMPTY_ARRAY: DailyAttendance[] = [];

// Memoized selector for course daily attendances
export const selectCourseDailyAttendances = createSelector(
	[selectCourseAttendanceMap, selectCourseClassIdArg], // Inputs to this selector
	(courseAttendanceMap, courseClassId): DailyAttendance[] => {
		if (!courseClassId || !courseAttendanceMap) {
			return EMPTY_ARRAY; // Return stable empty array
		}
		const courseDetails = courseAttendanceMap[courseClassId];
		if (!courseDetails || !courseDetails.dailyRecords) {
			return EMPTY_ARRAY; // Return stable empty array
		}
		// Object.values still creates a new array, but this selector will only
		// recompute if courseAttendanceMap or courseClassId changes, OR if
		// the content of courseDetails.dailyRecords for that specific courseClassId changes.
		const result = Object.values(courseDetails.dailyRecords);
		return result.length > 0 ? result : EMPTY_ARRAY; // Ensure stable empty array if result is empty
	}
);

// Input selector for the date argument
const selectDateArg = (_: RootState, __: string | undefined, date?: string) =>
	date;

// Memoized selector for a specific day's attendance
export const selectCourseAttendanceForDate = createSelector(
	[selectCourseAttendanceMap, selectCourseClassIdArg, selectDateArg],
	(courseAttendanceMap, courseClassId, date): DailyAttendance | null => {
		if (!courseClassId || !date || !courseAttendanceMap) {
			return null;
		}
		const courseDetails = courseAttendanceMap[courseClassId];
		return courseDetails?.dailyRecords?.[date] || null;
	}
);

// Memoized selector for student attendance records
const selectStudentAttendanceMap = (state: RootState) =>
	state.attendanceMarking.studentAttendance;
const selectStudentIdArg = (_: RootState, studentId: string) => studentId;

export const selectStudentAttendanceRecords = createSelector(
	[selectStudentAttendanceMap, selectStudentIdArg],
	(studentAttendanceMap, studentId): StudentAttendanceRecord[] => {
		if (!studentId || !studentAttendanceMap) {
			return EMPTY_ARRAY as unknown as StudentAttendanceRecord[]; // Cast for type, still stable empty
		}
		const records = studentAttendanceMap[studentId];
		return records && records.length > 0
			? records
			: (EMPTY_ARRAY as unknown as StudentAttendanceRecord[]);
	}
);

// --- MEMOIZED SELECTORS END ---

// --- Reducer ---
export default attendanceMarkingSlice.reducer;
