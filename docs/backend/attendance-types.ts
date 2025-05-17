/**
 * Type definitions for the Attendance API
 * These types can be shared between frontend and backend
 */

// Attendance status options
export type AttendanceStatus = "present" | "absent" | "late" | "excused";

/**
 * Payload for marking student attendance
 */
export interface MarkAttendancePayload {
  /**
   * ID of the student being marked
   */
  studentId: string;
  
  /**
   * ID of the class instance/session
   */
  classInstanceId: string;
  
  /**
   * ID of the user marking attendance (can be empty, backend should use authenticated user)
   */
  markedByUserId: string;
  
  /**
   * ISO timestamp when attendance was marked
   */
  timestamp: string;
  
  /**
   * Attendance status. Defaults to "present" if not provided
   */
  status?: AttendanceStatus;
  
  /**
   * Optional notes about the attendance
   */
  notes?: string;
}

/**
 * Success response from the attendance marking API
 */
export interface MarkAttendanceSuccessResponse {
  /**
   * Always true for success responses
   */
  success: boolean;
  
  /**
   * ID of the student whose attendance was marked
   */
  studentId: string;
  
  /**
   * Unique ID of the created attendance record
   */
  attendanceId: string;
  
  /**
   * Optional success message
   */
  message?: string;
  
  /**
   * Server timestamp when attendance was recorded
   */
  timestamp: string;
  
  /**
   * The status that was recorded
   */
  status: AttendanceStatus;
}

/**
 * Error response from the attendance marking API
 */
export interface MarkAttendanceErrorResponse {
  /**
   * Always false for error responses
   */
  success: boolean;
  
  /**
   * Error message describing what went wrong
   */
  message: string;
  
  /**
   * Optional error code for client-side handling
   */
  errorCode?: string;
  
  /**
   * Optional field-specific validation errors
   */
  validationErrors?: {
    [field: string]: string;
  };
}

/**
 * Union type for all possible responses from the attendance marking API
 */
export type MarkAttendanceResponse = MarkAttendanceSuccessResponse | MarkAttendanceErrorResponse;

/**
 * Type guard to check if a response is a success response
 */
export function isMarkAttendanceSuccessResponse(
  response: MarkAttendanceResponse
): response is MarkAttendanceSuccessResponse {
  return response.success === true;
}

/**
 * Type guard to check if a response is an error response
 */
export function isMarkAttendanceErrorResponse(
  response: MarkAttendanceResponse
): response is MarkAttendanceErrorResponse {
  return response.success === false;
}

/**
 * Student attendance record returned by the API
 */
export interface AttendanceRecord {
  /**
   * Unique identifier for the attendance record
   */
  id: string;
  
  /**
   * ID of the student
   */
  studentId: string;
  
  /**
   * Name of the student (for display purposes)
   */
  studentName: string;
  
  /**
   * ID of the class
   */
  classId: string;
  
  /**
   * ID of the specific class session
   */
  sessionId: string;
  
  /**
   * Date of the attendance record (YYYY-MM-DD)
   */
  date: string;
  
  /**
   * Attendance status
   */
  status: AttendanceStatus;
  
  /**
   * Optional notes about the attendance
   */
  notes?: string;
  
  /**
   * ID of the user who recorded the attendance
   */
  recordedBy: string;
  
  /**
   * Timestamp when the attendance was recorded
   */
  recordedAt: string;
}

/**
 * Response for fetching a student's attendance records
 */
export interface StudentAttendanceResponse {
  /**
   * ID of the student
   */
  studentId: string;
  
  /**
   * Array of attendance records for the student
   */
  attendances: AttendanceRecord[];
}

/**
 * Session information with attendance records for a class
 */
export interface ClassSessionWithAttendance {
  /**
   * Unique identifier for the session
   */
  id: string;
  
  /**
   * Date of the session (YYYY-MM-DD)
   */
  date: string;
  
  /**
   * Topic or title of the session
   */
  topic: string;
  
  /**
   * Attendance records for this session
   */
  attendanceRecords: AttendanceRecord[];
}

/**
 * Response for fetching attendance records for a class
 */
export interface TeacherAttendanceResponse {
  /**
   * ID of the class
   */
  courseClassId: string;
  
  /**
   * Name of the class
   */
  className: string;
  
  /**
   * Array of sessions with attendance records
   */
  sessions: ClassSessionWithAttendance[];
}
