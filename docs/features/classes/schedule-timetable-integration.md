# Schedule and Timetable Integration Guide

## Overview

This document provides detailed specifications for integrating the frontend schedule and timetable features with the backend API. The schedule feature manages events related to classes, such as lectures, exams, and office hours, while the timetable provides a visual representation of these events.

## Table of Contents

1. [Data Structures](#data-structures)
2. [API Endpoints](#api-endpoints)
3. [Frontend Implementation](#frontend-implementation)
4. [Relationships with Other Features](#relationships-with-other-features)
5. [Migration Checklist](#migration-checklist)

## Data Structures

### Schedule Event Types

```typescript
// Types of schedule events
export type ScheduleEventType = "lecture" | "lab" | "exam" | "office-hours" | "meeting" | "other";

// Schedule event
export interface ScheduleEvent {
  id: string;
  title: string;
  courseId?: string;
  courseSlug?: string;
  courseTitle?: string;
  classId?: string;
  startTime: string; // ISO Date string
  endTime: string; // ISO Date string
  type: ScheduleEventType;
  location?: string; // Physical room or 'Virtual Classroom'
  instructorId?: string;
  instructor?: string; // Display name
  meetingLink?: string; // Optional link for virtual events
  description?: string;
  attendees?: string[]; // Optional list of student/user IDs expected
}

// Redux state for schedule
export interface ScheduleState {
  // Events for the current view period (e.g., week)
  events: ScheduleEvent[];
  // Status for fetching view-specific events
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  // ISO string for the start of the current view (e.g., week start)
  viewStartDate: string;

  // All events fetched for the management table view
  allEvents: ScheduleEvent[];
  // Single event being viewed or edited
  currentScheduleEvent: ScheduleEvent | null;
  // Status of CUD operations (Create, Update, Delete)
  operationStatus: "idle" | "loading" | "succeeded" | "failed";
  // Error specific to CUD operations
  operationError: string | null;
  // Pagination state for the management table
  pagination: {
    currentPage: number;
    totalPages: number;
    totalEvents: number;
    limit: number;
  } | null;
}

// Payload for creating a schedule event
export interface CreateScheduleEventPayload {
  title: string;
  courseId?: string;
  classId?: string;
  startTime: string; // ISO Date string
  endTime: string; // ISO Date string
  type: ScheduleEventType;
  location?: string;
  instructorId?: string;
  meetingLink?: string;
  description?: string;
  attendees?: string[];
}

// Payload for updating a schedule event
export interface UpdateScheduleEventPayload {
  id: string; // Event ID
  title?: string;
  courseId?: string;
  classId?: string;
  startTime?: string;
  endTime?: string;
  type?: ScheduleEventType;
  location?: string;
  instructorId?: string;
  meetingLink?: string;
  description?: string;
  attendees?: string[];
}
```

## API Endpoints

### Schedule

```
GET /schedule
```

**Query Parameters:**
- `role`: User role (student, teacher, admin)
- `userId`: Optional user ID to filter events
- `startDate`: Start date for the range (YYYY-MM-DD)
- `endDate`: End date for the range (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sched_1",
      "title": "PMP Fundamentals",
      "courseId": "1",
      "courseSlug": "pmp-certification-training",
      "courseTitle": "PMP® Certification Training",
      "startTime": "2023-12-15T09:00:00.000Z",
      "endTime": "2023-12-15T11:00:00.000Z",
      "type": "lecture",
      "location": "Virtual Classroom A",
      "instructor": "Dr. Sarah Johnson",
      "instructorId": "teacher_1",
      "meetingLink": "https://zoom.us/j/example",
      "description": "Introduction to PMBOK framework.",
      "attendees": ["student_1", "student_2", "corp_student_1"]
    }
  ]
}
```

```
GET /schedule-events
```

**Query Parameters:**
- `page`: Page number for pagination
- `limit`: Number of items per page
- `search`: Optional search term
- `type`: Optional filter by event type
- `startDate`: Optional filter by start date
- `endDate`: Optional filter by end date

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "sched_1",
        "title": "PMP Fundamentals",
        "courseId": "1",
        "courseSlug": "pmp-certification-training",
        "courseTitle": "PMP® Certification Training",
        "startTime": "2023-12-15T09:00:00.000Z",
        "endTime": "2023-12-15T11:00:00.000Z",
        "type": "lecture",
        "location": "Virtual Classroom A",
        "instructor": "Dr. Sarah Johnson",
        "instructorId": "teacher_1",
        "meetingLink": "https://zoom.us/j/example",
        "description": "Introduction to PMBOK framework.",
        "attendees": ["student_1", "student_2", "corp_student_1"]
      }
    ],
    "total": 24,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

```
GET /schedule-events/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "sched_1",
    "title": "PMP Fundamentals",
    "courseId": "1",
    "courseSlug": "pmp-certification-training",
    "courseTitle": "PMP® Certification Training",
    "startTime": "2023-12-15T09:00:00.000Z",
    "endTime": "2023-12-15T11:00:00.000Z",
    "type": "lecture",
    "location": "Virtual Classroom A",
    "instructor": "Dr. Sarah Johnson",
    "instructorId": "teacher_1",
    "meetingLink": "https://zoom.us/j/example",
    "description": "Introduction to PMBOK framework.",
    "attendees": ["student_1", "student_2", "corp_student_1"]
  }
}
```

```
POST /schedule-events
```

**Request Body:**
```json
{
  "title": "PMP Exam Preparation",
  "courseId": "1",
  "startTime": "2023-12-20T14:00:00.000Z",
  "endTime": "2023-12-20T16:00:00.000Z",
  "type": "exam",
  "location": "Virtual Classroom A",
  "instructorId": "teacher_1",
  "description": "Final exam preparation session",
  "attendees": ["student_1", "student_2", "corp_student_1"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Schedule event created successfully",
  "data": {
    "id": "sched_10",
    "title": "PMP Exam Preparation",
    "courseId": "1",
    "courseSlug": "pmp-certification-training",
    "courseTitle": "PMP® Certification Training",
    "startTime": "2023-12-20T14:00:00.000Z",
    "endTime": "2023-12-20T16:00:00.000Z",
    "type": "exam",
    "location": "Virtual Classroom A",
    "instructor": "Dr. Sarah Johnson",
    "instructorId": "teacher_1",
    "description": "Final exam preparation session",
    "attendees": ["student_1", "student_2", "corp_student_1"]
  }
}
```

```
PUT /schedule-events/:id
```

**Request Body:**
```json
{
  "title": "PMP Exam Preparation - Updated",
  "location": "Virtual Classroom B"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Schedule event updated successfully",
  "data": {
    "id": "sched_10",
    "title": "PMP Exam Preparation - Updated",
    "courseId": "1",
    "courseSlug": "pmp-certification-training",
    "courseTitle": "PMP® Certification Training",
    "startTime": "2023-12-20T14:00:00.000Z",
    "endTime": "2023-12-20T16:00:00.000Z",
    "type": "exam",
    "location": "Virtual Classroom B",
    "instructor": "Dr. Sarah Johnson",
    "instructorId": "teacher_1",
    "description": "Final exam preparation session",
    "attendees": ["student_1", "student_2", "corp_student_1"]
  }
}
```

```
DELETE /schedule-events/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Schedule event deleted successfully",
  "data": {
    "id": "sched_10"
  }
}
```

## Frontend Implementation

### Redux Thunks

The frontend uses Redux thunks to interact with the schedule API:

```typescript
// Fetch schedule for the week/calendar view
export const fetchSchedule = createAsyncThunk<
  ScheduleEvent[],
  FetchScheduleParams,
  { state: RootState; rejectValue: string }
>(
  "schedule/fetchSchedule",
  async ({ role, userId, startDate, endDate }, { rejectWithValue }) => {
    try {
      console.log(`Fetching schedule from ${startDate} to ${endDate}`);

      // Construct query parameters
      const params = new URLSearchParams();
      params.append("role", role);
      if (userId) params.append("userId", userId);
      params.append("startDate", startDate);
      params.append("endDate", endDate);

      // API call using the API client
      return await get<ScheduleEvent[]>(`/schedule?${params.toString()}`);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch schedule");
    }
  }
);

// Create schedule event
export const createScheduleEvent = createAsyncThunk<
  ScheduleEvent,
  CreateScheduleEventPayload,
  { rejectValue: string }
>("schedule/createEvent", async (eventData, { rejectWithValue }) => {
  try {
    // API call using the API client
    return await post<ScheduleEvent>("/schedule-events", eventData);
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to create schedule event");
  }
});

// Update schedule event
export const updateScheduleEvent = createAsyncThunk<
  ScheduleEvent,
  UpdateScheduleEventPayload,
  { rejectValue: string }
>("schedule/updateEvent", async (payload, { rejectWithValue }) => {
  try {
    const { id, ...updateData } = payload;
    // API call using the API client
    return await put<ScheduleEvent>(`/schedule-events/${id}`, updateData);
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to update schedule event");
  }
});
```

## Relationships with Other Features

### Schedule to Classes Relationship

1. Classes have a general schedule (e.g., "Mon/Wed/Fri 9-11 AM")
2. The backend generates specific schedule events based on this general schedule
3. Additional one-time events (exams, special sessions) can be added to the schedule

### Schedule to Attendance Relationship

1. Each scheduled event for a class can have attendance records
2. When a scheduled event occurs, attendance records are created
3. Teachers can mark attendance for students in their scheduled events
4. Students can view their attendance for scheduled events they are expected to attend

### Timetable Visualization

The timetable component visualizes schedule events in a weekly grid:

1. Events are positioned based on their start and end times
2. Different event types have different colors
3. Events show details like title, time, and location
4. Users can click on events to see more details or take actions

## Migration Checklist

To ensure a smooth transition from mock data to live API:

- [ ] Ensure backend API returns data in the same structure as mock data
- [ ] Implement all required endpoints with proper validation
- [ ] Handle date formatting consistently (ISO format)
- [ ] Ensure proper relationships between schedule, classes, and attendance
- [ ] Implement proper error handling
- [ ] Test schedule event creation and update with live API
- [ ] Verify timetable visualization with live data
- [ ] Implement caching for frequently accessed data
- [ ] Add fallback mechanisms for network issues
- [ ] Ensure current day data is always available for the timetable view
