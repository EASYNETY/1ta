# Attendance Marking API Documentation

This document provides detailed specifications for the `/api/attendance/mark` endpoint used for marking student attendance in the SmartEdu platform.

## Endpoint Overview

- **URL**: `https://api.onetechacademy.com/api/attendance/mark`
- **Method**: `POST`
- **Authentication**: Required (Bearer Token)
- **Content-Type**: `application/json`

## Request Payload

The frontend sends the following payload structure when marking attendance:

\`\`\`typescript
export interface MarkAttendancePayload {
  studentId: string;           // ID of the student being marked
  classInstanceId: string;     // ID of the class instance/session
  markedByUserId: string;      // ID of the user marking attendance (can be empty, backend should use authenticated user)
  timestamp: string;           // ISO timestamp when attendance was marked
  status?: "present" | "absent" | "late" | "excused";  // Optional status, defaults to "present" if not provided
  notes?: string;              // Optional notes about the attendance
}
\`\`\`

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `studentId` | string | Yes | Unique identifier for the student whose attendance is being marked |
| `classInstanceId` | string | Yes | Unique identifier for the class session/instance |
| `markedByUserId` | string | No | ID of the user marking attendance. If empty, backend should use the authenticated user's ID |
| `timestamp` | string | Yes | ISO 8601 formatted timestamp (e.g., `2023-10-15T14:30:00.000Z`) |
| `status` | enum | No | Attendance status. One of: "present", "absent", "late", "excused". Defaults to "present" if not provided |
| `notes` | string | No | Optional notes or comments about the attendance record |

## Response Structure

### Success Response

- **Status Code**: `200 OK`
- **Content**:

\`\`\`typescript
export interface MarkAttendanceSuccessResponse {
  success: boolean;            // Always true for success responses
  studentId: string;           // ID of the student whose attendance was marked
  attendanceId: string;        // Unique ID of the created attendance record
  message?: string;            // Optional success message
  timestamp: string;           // Server timestamp when attendance was recorded
  status: "present" | "absent" | "late" | "excused";  // The status that was recorded
}
\`\`\`

Example:
\`\`\`json
{
  "success": true,
  "studentId": "12345",
  "attendanceId": "att_789012",
  "message": "Attendance marked successfully",
  "timestamp": "2023-10-15T14:32:15.123Z",
  "status": "present"
}
\`\`\`

### Error Response

- **Status Codes**: `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`
- **Content**:

\`\`\`typescript
export interface MarkAttendanceErrorResponse {
  success: boolean;            // Always false for error responses
  message: string;             // Error message describing what went wrong
  errorCode?: string;          // Optional error code for client-side handling
  validationErrors?: {         // Optional field-specific validation errors
    [field: string]: string;
  };
}
\`\`\`

Example:
\`\`\`json
{
  "success": false,
  "message": "Failed to mark attendance: Student not found",
  "errorCode": "STUDENT_NOT_FOUND"
}
\`\`\`

## Error Handling

The backend should handle the following error scenarios gracefully:

1. **Invalid Student ID**: Return 404 with appropriate error message
2. **Invalid Class ID**: Return 404 with appropriate error message
3. **Duplicate Attendance**: If attendance for this student/class/date already exists, either:
   - Update the existing record and return success, or
   - Return an error with code "DUPLICATE_ATTENDANCE"
4. **Authentication Errors**: Return 401 for missing/invalid tokens
5. **Authorization Errors**: Return 403 if the user doesn't have permission to mark attendance
6. **Validation Errors**: Return 400 with specific validation errors for invalid fields

## Implementation Notes for Backend

1. **Authentication**: Verify the Bearer token and extract the user ID
2. **Authorization**: Check if the authenticated user has permission to mark attendance
3. **Validation**: Validate all required fields and their formats
4. **Idempotency**: Implement idempotent behavior to handle duplicate submissions
5. **Audit Trail**: Record who marked the attendance and when
6. **Notifications**: Consider triggering notifications for relevant stakeholders

## Integration with Frontend

The frontend currently uses the Redux toolkit with a thunk action to mark attendance:

\`\`\`typescript
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
\`\`\`

## Example Usage

### Marking a Student Present

\`\`\`typescript
// Example code for marking a student as present
dispatch(markStudentAttendance({
  studentId: "12345",
  classInstanceId: "class_789",
  markedByUserId: "", // Will be filled by backend from auth token
  timestamp: new Date().toISOString()
}));
\`\`\`

### Marking a Student Absent with Notes

\`\`\`typescript
// Example code for marking a student as absent with notes
dispatch(markStudentAttendance({
  studentId: "12345",
  classInstanceId: "class_789",
  markedByUserId: "", // Will be filled by backend from auth token
  timestamp: new Date().toISOString(),
  status: "absent",
  notes: "Student notified teacher in advance about absence"
}));
\`\`\`
