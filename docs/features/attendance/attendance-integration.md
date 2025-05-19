# Attendance Feature Integration Guide

## Overview

The attendance feature in SmartEdu allows tracking student presence in classes and events. This document provides detailed specifications for integrating the frontend attendance feature with the backend API, ensuring a seamless transition from mock data to live API data.

## Table of Contents

1. [Data Structures](#data-structures)
2. [API Endpoints](#api-endpoints)
3. [Frontend Implementation](#frontend-implementation)
4. [Barcode Scanner Integration](#barcode-scanner-integration)
5. [Migration Checklist](#migration-checklist)

## Data Structures

### Core Attendance Types

```typescript
// Attendance status type
export type AttendanceStatus = "present" | "absent" | "late";

// Interface for individual student attendance
export interface StudentAttendance {
  studentId: string;
  name: string;
  status: AttendanceStatus;
  time?: string; // Optional time field for more detailed attendance
}

// Interface for daily attendance (used for a teacher's class)
export interface DailyAttendance {
  date: string; // Format: YYYY-MM-DD
  courseClassId: string;
  attendances: StudentAttendance[];
}

// Interface for student attendance record (used for a student's history)
export interface StudentAttendanceRecord {
  date: string; // Format: YYYY-MM-DD
  status: AttendanceStatus;
  courseClassId?: string;
  courseTitle?: string;
  time?: string;
}

// Teacher's class attendance response
export interface TeacherAttendanceResponse {
  courseClassId: string;
  courseTitle: string;
  totalStudents: number;
  dailyAttendances: DailyAttendance[];
}

// Student's attendance response
export interface StudentAttendanceResponse {
  studentId: string;
  name: string;
  attendanceRecords: StudentAttendanceRecord[];
}
```

### Redux State Structure

```typescript
// Adjusted State Shape for the Redux slice
interface CourseAttendanceDetails {
  courseClassId: string;
  courseTitle: string;
  totalStudents: number;
  dailyRecords: Record<string, DailyAttendance>;
}

interface AttendanceState {
  // For teachers viewing their class attendance
  teacherClassAttendance: Record<string, CourseAttendanceDetails>;
  // For students viewing their own attendance
  studentAttendance: StudentAttendanceRecord[];
  // For the current scan operation
  currentScan: {
    studentId: string | null;
    status: "idle" | "scanning" | "success" | "error";
    message: string | null;
  };
  // Loading states
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}
```

## API Endpoints

### Get Class Attendance

```
GET /attendance/class/:classId
```

**Query Parameters:**
- `date`: Optional date filter (YYYY-MM-DD)
- `startDate`: Optional start date for range (YYYY-MM-DD)
- `endDate`: Optional end date for range (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "courseClassId": "ccs_1_morn",
    "courseTitle": "Web Development Bootcamp",
    "totalStudents": 45,
    "dailyAttendances": [
      {
        "date": "2023-12-15",
        "courseClassId": "ccs_1_morn",
        "attendances": [
          { "studentId": "1", "name": "John Smith", "status": "present" },
          { "studentId": "2", "name": "Jane Doe", "status": "absent" }
        ]
      }
    ]
  }
}
```

### Get Student Attendance

```
GET /attendance/student/:studentId
```

**Query Parameters:**
- `date`: Optional date filter (YYYY-MM-DD)
- `startDate`: Optional start date for range (YYYY-MM-DD)
- `endDate`: Optional end date for range (YYYY-MM-DD)
- `courseClassId`: Optional filter by class

**Response:**
```json
{
  "success": true,
  "data": {
    "studentId": "student_1",
    "name": "John Smith",
    "attendanceRecords": [
      {
        "date": "2023-12-15",
        "status": "present",
        "courseClassId": "ccs_1_morn",
        "courseTitle": "Web Development Bootcamp",
        "time": "09:15:00"
      }
    ]
  }
}
```

### Mark Attendance

```
POST /attendance/mark
```

**Request Body:**
```json
{
  "studentId": "student_1",
  "courseClassId": "ccs_1_morn",
  "date": "2023-12-15",
  "status": "present",
  "time": "09:15:00",
  "scanMethod": "barcode" // or "manual", "qr", etc.
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "id": "att_12345",
    "studentId": "student_1",
    "courseClassId": "ccs_1_morn",
    "date": "2023-12-15",
    "status": "present",
    "time": "09:15:00",
    "scanMethod": "barcode"
  }
}
```

### Update Attendance

```
PUT /attendance/:id
```

**Request Body:**
```json
{
  "status": "late",
  "time": "09:30:00"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance updated successfully",
  "data": {
    "id": "att_12345",
    "studentId": "student_1",
    "courseClassId": "ccs_1_morn",
    "date": "2023-12-15",
    "status": "late",
    "time": "09:30:00",
    "scanMethod": "manual"
  }
}
```

## Frontend Implementation

### Redux Thunks

The frontend uses Redux thunks to interact with the attendance API:

```typescript
// Fetch teacher's class attendance
export const fetchTeacherClassAttendance = createAsyncThunk<
  TeacherAttendanceResponse,
  { classId: string; date?: string },
  { rejectValue: string }
>("attendance/fetchTeacherClass", async ({ classId, date }, { rejectWithValue }) => {
  try {
    const endpoint = `/attendance/class/${classId}${date ? `?date=${date}` : ''}`;
    const response = await get<TeacherAttendanceResponse>(endpoint);
    return response;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch class attendance");
  }
});

// Fetch student's attendance
export const fetchStudentAttendance = createAsyncThunk<
  StudentAttendanceResponse,
  { studentId: string; startDate?: string; endDate?: string },
  { rejectValue: string }
>("attendance/fetchStudent", async ({ studentId, startDate, endDate }, { rejectWithValue }) => {
  try {
    let endpoint = `/attendance/student/${studentId}`;
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    const response = await get<StudentAttendanceResponse>(endpoint);
    return response;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch student attendance");
  }
});

// Mark attendance
export const markAttendance = createAsyncThunk<
  any, // Response type
  {
    studentId: string;
    courseClassId: string;
    date: string;
    status: AttendanceStatus;
    time?: string;
    scanMethod?: string;
  },
  { rejectValue: string }
>("attendance/mark", async (attendanceData, { rejectWithValue }) => {
  try {
    const response = await post("/attendance/mark", attendanceData);
    return response;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to mark attendance");
  }
});
```

## Barcode Scanner Integration

The attendance feature integrates with external barcode scanners via WebSocket:

1. The frontend connects to a WebSocket server
2. When a barcode is scanned, the scanner sends a message to the WebSocket server
3. The WebSocket server forwards the message to the frontend
4. The frontend processes the message and marks attendance

### WebSocket Message Format

```typescript
interface WebSocketBarcodeMessage {
  type: 'barcode_scan_received';
  data: {
    barcodeId: string;
    timestamp: string;
    status: string;
  }
}
```

### Attendance Marking Flow

1. Frontend receives barcode scan via WebSocket
2. Frontend fetches student details by barcode ID
3. Frontend marks attendance using the `markAttendance` thunk
4. Frontend displays confirmation and plays a sound

## Migration Checklist

To ensure a smooth transition from mock data to live API:

- [ ] Ensure backend API returns data in the same structure as mock data
- [ ] Implement all required endpoints with proper validation
- [ ] Handle date formatting consistently (ISO format)
- [ ] Ensure current day data is always available
- [ ] Implement proper error handling
- [ ] Test barcode scanner integration with live API
- [ ] Verify attendance reports and analytics with live data
- [ ] Implement caching for frequently accessed data
- [ ] Add fallback mechanisms for network issues
