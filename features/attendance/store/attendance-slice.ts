// features/attendance/store/attendance-slice.ts
import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit"
import type { RootState } from "@/store"
import { get, post } from "@/lib/api-client"
import type {
  StudentAttendanceRecord,
  TeacherAttendanceResponse,
  DailyAttendance,
  StudentAttendanceResponse,
  AttendanceStatus,
  AttendanceRecord,
} from "@/data/mock-attendance-data"

// --- Adjusted State Shape ---
interface CourseAttendanceDetails {
  courseClassId: string
  courseTitle: string
  totalStudents: number
  dailyRecords: Record<string, DailyAttendance>
}

interface AttendanceMarkingState {
  isLoading: boolean
  error: string | null
  lastMarkedStatus: "success" | "error" | "idle"
  markedStudentId: string | null
  studentAttendance: Record<string, StudentAttendanceRecord[]>
  courseAttendance: Record<string, CourseAttendanceDetails>
  fetchingStudentAttendance: boolean
  fetchingCourseAttendance: boolean
}

// Mark Attendance Payload
export interface MarkAttendancePayload {
  studentId: string
  classInstanceId: string
  markedByUserId: string
  timestamp: string
}

// Fetch Student Attendance Thunk
export const fetchStudentAttendance = createAsyncThunk<
  StudentAttendanceResponse,
  string,
  { state: RootState; rejectValue: string }
>("attendance/fetchStudent", async (studentId, { rejectWithValue }) => {
  try {
    const response = await get<any>(`/students/${studentId}/attendance`)
    console.log("Student attendance API response:", response)

    // Handle both direct and nested response structures
    if (response.success && response.data) {
      // Backend returns nested structure with success and data
      return response.data
    } else {
      // Direct response structure
      return response
    }
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to fetch student attendance."
    return rejectWithValue(message)
  }
})

// Fetch Course Attendance Thunk
export const fetchCourseAttendance = createAsyncThunk<
  TeacherAttendanceResponse,
  string,
  { state: RootState; rejectValue: string }
>("attendance/fetchCourse", async (courseClassId, { rejectWithValue }) => {
  try {
    const response = await get<any>(`/courses/${courseClassId}/attendance`)
    console.log("Course attendance API response:", response)

    // Handle both direct and nested response structures
    if (response.success && response.data) {
      // Backend returns nested structure with success and data
      return response.data
    } else {
      // Direct response structure
      return response
    }
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to fetch course attendance."
    return rejectWithValue(message)
  }
})

// Mark Attendance Thunk
export const markStudentAttendance = createAsyncThunk<
  { success: boolean; studentId: string; message?: string },
  MarkAttendancePayload,
  { state: RootState; rejectValue: string }
>("attendance/markStudent", async (payload, { getState, rejectWithValue }) => {
  const { auth } = getState()
  const token = auth.token
  if (!token) {
    return rejectWithValue("Authentication required.")
  }
  try {
    const response = await post<any>("/attendance/mark", payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log("Mark attendance API response:", response)

    // Handle both direct and nested response structures
    if (response.success) {
      if (response.data) {
        // Backend returns nested structure with success and data
        return {
          success: response.success,
          studentId: payload.studentId,
          message: response.message || "Attendance marked successfully"
        }
      } else {
        // Direct response structure
        return { ...response, studentId: payload.studentId }
      }
    } else {
      return rejectWithValue(response.message || "Failed to mark attendance on server.")
    }
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "An unknown error occurred."
    return rejectWithValue(message)
  }
})

const initialState: AttendanceMarkingState = {
  isLoading: false,
  error: null,
  lastMarkedStatus: "idle",
  markedStudentId: null,
  studentAttendance: {},
  courseAttendance: {},
  fetchingStudentAttendance: false,
  fetchingCourseAttendance: false,
}

const attendanceMarkingSlice = createSlice({
  name: "attendanceMarking",
  initialState,
  reducers: {
    resetMarkingStatus: (state) => {
      state.lastMarkedStatus = "idle"
      state.error = null
      state.markedStudentId = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Mark Attendance
      .addCase(markStudentAttendance.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.lastMarkedStatus = "idle"
        state.markedStudentId = null
      })
      .addCase(markStudentAttendance.fulfilled, (state, action) => {
        state.isLoading = false
        state.lastMarkedStatus = "success"
        state.markedStudentId = action.payload.studentId
        state.error = null

        // Update the attendance data in state if needed
        // This would be a good place to refetch the attendance data
        // or update it directly if you have the necessary information
      })
      .addCase(markStudentAttendance.rejected, (state, action) => {
        state.isLoading = false
        state.lastMarkedStatus = "error"
        state.error = action.payload ?? "Failed to mark attendance."
        state.markedStudentId = null
      })

      // Fetch Student Attendance
      .addCase(fetchStudentAttendance.pending, (state) => {
        state.fetchingStudentAttendance = true
        state.error = null
      })
      .addCase(fetchStudentAttendance.fulfilled, (state, action) => {
        state.fetchingStudentAttendance = false
        const { studentId, attendances } = action.payload
        state.studentAttendance[studentId] = attendances
      })
      .addCase(fetchStudentAttendance.rejected, (state, action) => {
        state.fetchingStudentAttendance = false
        state.error = action.payload ?? "Failed to fetch student attendance."
      })

      // Fetch Course Attendance
      .addCase(fetchCourseAttendance.pending, (state) => {
        state.fetchingCourseAttendance = true
        state.error = null
      })
      .addCase(fetchCourseAttendance.fulfilled, (state, action) => {
        state.fetchingCourseAttendance = false

        // Handle both the old format and the new backend format
        if (action.payload.records && action.payload.courseId) {
          // New backend format with records, courseId, and totalCount
          const { records, courseId, totalCount } = action.payload;
          console.log("Processing new backend format:", { records, courseId, totalCount });

          // Process the records into daily attendances
          const dailyRecords: Record<string, DailyAttendance> = {};

          // Group records by date
          const recordsByDate: Record<string, any[]> = {};
          records.forEach((record: any) => {
            if (!recordsByDate[record.date]) {
              recordsByDate[record.date] = [];
            }
            recordsByDate[record.date].push(record);
          });

          // Convert to DailyAttendance format
          Object.entries(recordsByDate).forEach(([date, dateRecords]) => {
            const attendances = dateRecords.map((record: any) => ({
              studentId: record.student.id,
              name: record.student.name,
              status: record.status as AttendanceStatus,
              time: record.notes // Use notes as time if available
            }));

            dailyRecords[date] = {
              date,
              courseClassId: courseId,
              attendances
            };
          });

          state.courseAttendance[courseId] = {
            courseClassId: courseId,
            courseTitle: records[0]?.className || "Unknown Course",
            totalStudents: totalCount || records.length,
            dailyRecords,
          };
        } else {
          // Old format with courseClassId, courseTitle, totalStudents, dailyAttendances
          const { courseClassId, courseTitle, totalStudents, dailyAttendances } = action.payload;
          console.log("Processing old format:", { courseClassId, courseTitle, totalStudents, dailyAttendances });

          // Process the daily attendances into the format expected by the state
          const dailyRecords: Record<string, DailyAttendance> = {};

          // Add null check to prevent TypeError when dailyAttendances is undefined
          if (dailyAttendances && Array.isArray(dailyAttendances)) {
            dailyAttendances.forEach((daily) => {
              dailyRecords[daily.date] = daily;
            });
          } else {
            console.warn('dailyAttendances is undefined or not an array in fetchCourseAttendance.fulfilled');
          }

          state.courseAttendance[courseClassId] = {
            courseClassId,
            courseTitle,
            totalStudents,
            dailyRecords,
          };
        }
      })
      .addCase(fetchCourseAttendance.rejected, (state, action) => {
        state.fetchingCourseAttendance = false
        state.error = action.payload ?? "Failed to fetch course attendance."
      })
  },
})

export const { resetMarkingStatus } = attendanceMarkingSlice.actions

// --- Selectors ---
export const selectAttendanceMarkingLoading = (state: RootState) => state.attendanceMarking.isLoading
export const selectAttendanceMarkingError = (state: RootState) => state.attendanceMarking.error
export const selectAttendanceMarkingStatus = (state: RootState) => state.attendanceMarking.lastMarkedStatus
export const selectLastMarkedStudentId = (state: RootState) => state.attendanceMarking.markedStudentId
export const selectFetchingStudentAttendance = (state: RootState) => state.attendanceMarking.fetchingStudentAttendance
export const selectFetchingCourseAttendance = (state: RootState) => state.attendanceMarking.fetchingCourseAttendance

// --- MEMOIZED SELECTORS START ---

// Input selector for courseAttendance part of the state
const selectCourseAttendanceMap = (state: RootState) => state.attendanceMarking.courseAttendance

// Input selector for the courseClassId argument passed to the selector
const selectCourseClassIdArg = (_: RootState, courseClassId?: string) => courseClassId

// Stable empty array reference
const EMPTY_ARRAY: DailyAttendance[] = []

// Memoized selector for course daily attendances
export const selectCourseDailyAttendances = createSelector(
  [selectCourseAttendanceMap, selectCourseClassIdArg], // Inputs to this selector
  (courseAttendanceMap, courseClassId): DailyAttendance[] => {
    if (!courseClassId || !courseAttendanceMap) {
      return EMPTY_ARRAY // Return stable empty array
    }
    const courseDetails = courseAttendanceMap[courseClassId]
    if (!courseDetails || !courseDetails.dailyRecords) {
      return EMPTY_ARRAY // Return stable empty array
    }
    // Object.values still creates a new array, but this selector will only
    // recompute if courseAttendanceMap or courseClassId changes, OR if
    // the content of courseDetails.dailyRecords for that specific courseClassId changes.
    const result = Object.values(courseDetails.dailyRecords)
    return result.length > 0 ? result : EMPTY_ARRAY // Ensure stable empty array if result is empty
  },
)

// Input selector for the date argument
const selectDateArg = (_: RootState, __: string | undefined, date?: string) => date

// Memoized selector for a specific day's attendance
export const selectCourseAttendanceForDate = createSelector(
  [selectCourseAttendanceMap, selectCourseClassIdArg, selectDateArg],
  (courseAttendanceMap, courseClassId, date): DailyAttendance | null => {
    if (!courseClassId || !date || !courseAttendanceMap) {
      return null
    }
    const courseDetails = courseAttendanceMap[courseClassId]
    return courseDetails?.dailyRecords?.[date] || null
  },
)

// Memoized selector for student attendance records
const selectStudentAttendanceMap = (state: RootState) => state.attendanceMarking.studentAttendance
const selectStudentIdArg = (_: RootState, studentId: string) => studentId

export const selectStudentAttendanceRecords = createSelector(
  [selectStudentAttendanceMap, selectStudentIdArg],
  (studentAttendanceMap, studentId): StudentAttendanceRecord[] => {
    if (!studentId || !studentAttendanceMap) {
      return EMPTY_ARRAY as unknown as StudentAttendanceRecord[] // Cast for type, still stable empty
    }
    const records = studentAttendanceMap[studentId]
    return records && records.length > 0 ? records : (EMPTY_ARRAY as unknown as StudentAttendanceRecord[])
  },
)

// --- MEMOIZED SELECTORS END ---

// --- Reducer ---
export default attendanceMarkingSlice.reducer
