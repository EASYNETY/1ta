# Frontend Integration Guide for Attendance Marking API

This guide outlines how to update the frontend code to properly integrate with the enhanced `/api/attendance/mark` endpoint.

## Current Implementation

Currently, the frontend uses a Redux thunk to mark attendance:

```typescript
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
    const response = await post<{ success: boolean; message?: string }>("/attendance/mark", payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (response.success) {
      return { ...response, studentId: payload.studentId }
    } else {
      return rejectWithValue(response.message || "Failed to mark attendance on server.")
    }
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "An unknown error occurred."
    return rejectWithValue(message)
  }
})
```

## Recommended Updates

### 1. Update the MarkAttendancePayload Interface

Update the payload interface to include the additional fields:

```typescript
// features/attendance/store/attendance-slice.ts
export interface MarkAttendancePayload {
  studentId: string;
  classInstanceId: string;
  markedByUserId: string;
  timestamp: string;
  status?: "present" | "absent" | "late" | "excused";  // Add status field
  notes?: string;  // Add notes field
}
```

### 2. Update the Success Response Type

Update the success response type to match the backend response:

```typescript
// features/attendance/store/attendance-slice.ts
interface MarkAttendanceSuccessResponse {
  success: boolean;
  studentId: string;
  attendanceId: string;
  message?: string;
  timestamp: string;
  status: "present" | "absent" | "late" | "excused";
}
```

### 3. Update the Thunk

Update the thunk to handle the enhanced response:

```typescript
// features/attendance/store/attendance-slice.ts
export const markStudentAttendance = createAsyncThunk<
  MarkAttendanceSuccessResponse,
  MarkAttendancePayload,
  { state: RootState; rejectValue: string }
>("attendance/markStudent", async (payload, { getState, rejectWithValue }) => {
  const { auth } = getState()
  const token = auth.token
  if (!token) {
    return rejectWithValue("Authentication required.")
  }
  try {
    const response = await post<MarkAttendanceSuccessResponse | MarkAttendanceErrorResponse>(
      "/attendance/mark", 
      payload, 
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    
    if (response.success) {
      return response as MarkAttendanceSuccessResponse
    } else {
      const errorResponse = response as MarkAttendanceErrorResponse
      return rejectWithValue(errorResponse.message || "Failed to mark attendance on server.")
    }
  } catch (error: any) {
    // Enhanced error handling
    if (error?.response?.data) {
      const errorData = error.response.data
      return rejectWithValue(errorData.message || "Server error occurred.")
    }
    return rejectWithValue(error?.message || "An unknown error occurred.")
  }
})
```

### 4. Update the Reducer

Update the reducer to handle the enhanced response:

```typescript
// features/attendance/store/attendance-slice.ts
.addCase(markStudentAttendance.fulfilled, (state, action) => {
  state.isLoading = false
  state.lastMarkedStatus = "success"
  state.markedStudentId = action.payload.studentId
  state.error = null

  // Store the attendance ID for potential future reference
  state.lastMarkedAttendanceId = action.payload.attendanceId
  
  // Store the status that was recorded
  state.lastMarkedAttendanceStatus = action.payload.status
  
  // Update the attendance data in state if needed
  // If we have the student's attendance data in state, we could update it here
  if (state.studentAttendance[action.payload.studentId]) {
    // Add the new attendance record to the student's attendance data
    // This would require additional data from the response
    // or a refetch of the student's attendance data
  }
})
```

### 5. Add New State Properties

Add new properties to the state interface:

```typescript
// features/attendance/store/attendance-slice.ts
interface AttendanceMarkingState {
  isLoading: boolean
  error: string | null
  lastMarkedStatus: "success" | "error" | "idle"
  markedStudentId: string | null
  lastMarkedAttendanceId: string | null  // New property
  lastMarkedAttendanceStatus: "present" | "absent" | "late" | "excused" | null  // New property
  studentAttendance: Record<string, StudentAttendanceRecord[]>
  courseAttendance: Record<string, CourseAttendanceDetails>
  fetchingStudentAttendance: boolean
  fetchingCourseAttendance: boolean
}
```

### 6. Update the Initial State

Update the initial state with the new properties:

```typescript
// features/attendance/store/attendance-slice.ts
const initialState: AttendanceMarkingState = {
  isLoading: false,
  error: null,
  lastMarkedStatus: "idle",
  markedStudentId: null,
  lastMarkedAttendanceId: null,  // Initialize new property
  lastMarkedAttendanceStatus: null,  // Initialize new property
  studentAttendance: {},
  courseAttendance: {},
  fetchingStudentAttendance: false,
  fetchingCourseAttendance: false,
}
```

### 7. Add Selectors for New Properties

Add selectors to access the new properties:

```typescript
// features/attendance/store/attendance-slice.ts
export const selectLastMarkedAttendanceId = (state: RootState) => 
  state.attendance.lastMarkedAttendanceId

export const selectLastMarkedAttendanceStatus = (state: RootState) => 
  state.attendance.lastMarkedAttendanceStatus
```

## Component Integration

### Update ScanResultHandler Component

The `ScanResultHandler` component should be updated to include status and notes when marking attendance:

```typescript
// components/attendance/scanner/ScanResultHandler.tsx
if (!casualScanMode && selectedClass?.id) {
  dispatch(markStudentAttendance({
    studentId: foundStudent.id,
    classInstanceId: selectedClass.id,
    markedByUserId: '', // This will be filled by the backend
    timestamp: new Date().toISOString(),
    status: 'present', // Default to present
    notes: `Marked via barcode scan` // Optional notes
  }));
}
```

### Add Status Selection to Manual Attendance Marking

For manual attendance marking, add the ability to select a status:

```tsx
// Example component for manual attendance marking
function ManualAttendanceMarking({ student, classInstance }) {
  const [status, setStatus] = useState<AttendanceStatus>('present');
  const [notes, setNotes] = useState('');
  const dispatch = useAppDispatch();

  const handleMarkAttendance = () => {
    dispatch(markStudentAttendance({
      studentId: student.id,
      classInstanceId: classInstance.id,
      markedByUserId: '',
      timestamp: new Date().toISOString(),
      status,
      notes
    }));
  };

  return (
    <div>
      <Select
        value={status}
        onValueChange={(value) => setStatus(value as AttendanceStatus)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="present">Present</SelectItem>
          <SelectItem value="absent">Absent</SelectItem>
          <SelectItem value="late">Late</SelectItem>
          <SelectItem value="excused">Excused</SelectItem>
        </SelectContent>
      </Select>
      
      <Textarea
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      
      <Button onClick={handleMarkAttendance}>
        Mark Attendance
      </Button>
    </div>
  );
}
```

## Error Handling Improvements

Add better error handling in components that use the attendance marking functionality:

```tsx
// Example error handling in a component
function AttendanceMarker() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAttendanceMarkingLoading);
  const error = useAppSelector(selectAttendanceMarkingError);
  const lastMarkedStatus = useAppSelector(selectAttendanceMarkingStatus);
  
  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error marking attendance",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);
  
  // Show success toast if attendance was marked successfully
  useEffect(() => {
    if (lastMarkedStatus === "success") {
      toast({
        title: "Attendance marked",
        description: "Student attendance has been recorded successfully.",
        variant: "success",
      });
    }
  }, [lastMarkedStatus]);
  
  // Rest of component...
}
```

## Testing

Test the updated attendance marking functionality with the following scenarios:

1. Mark a student as present (default)
2. Mark a student as absent
3. Mark a student as late
4. Mark a student as excused
5. Test error handling for various error scenarios
6. Test with and without notes

## Conclusion

These updates will ensure that the frontend properly integrates with the enhanced attendance marking API. The changes maintain backward compatibility while adding support for the new features provided by the backend.
