# Educational Features Integration Guide

## Overview

This document provides a comprehensive guide for integrating the frontend educational features (Attendance, Classes, Courses, Timetable, Schedule, and Events) with the backend API. It explains the relationships between these features, the data structures, and the API requirements to ensure a seamless transition from mock data to live API data.

## Table of Contents

1. [Feature Relationships](#feature-relationships)
2. [Data Structures](#data-structures)
3. [API Endpoints](#api-endpoints)
4. [Implementation Logic](#implementation-logic)
5. [Migration Strategy](#migration-strategy)

## Feature Relationships

The educational features in SmartEdu are interconnected in the following ways:

```
                  ┌─────────────┐
                  │   Courses   │
                  └──────┬──────┘
                         │
                         ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Students   │◄───│   Classes   │───►│  Teachers   │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       │                  ▼                  │
       │           ┌─────────────┐          │
       └──────────►│  Schedule/  │◄─────────┘
                   │  Timetable  │
                   └──────┬──────┘
                          │
                          ▼
                   ┌─────────────┐
                   │ Attendance  │
                   └─────────────┘
```

### Key Relationships:

1. **Courses** are the foundation of the educational content
2. **Classes** are specific instances of courses with assigned teachers and enrolled students
3. **Schedule/Timetable** contains events related to classes (lectures, exams, etc.)
4. **Attendance** records are created for scheduled events and track student participation

## Data Structures

### Course

```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  slug: string;
  thumbnail: string;
  duration: string;
  level: string;
  price: number;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
  };
  modules: Module[];
  // Other course-specific fields
}
```

### Class

```typescript
interface AdminClassView {
  id: string;
  courseTitle: string;
  courseId: string;
  teacherName: string;
  teacherId: string;
  studentCount: number;
  status: "active" | "inactive" | "upcoming";
  startDate?: string;
  endDate?: string;
  schedule?: string;
  location?: string;
  // Other class-specific fields
}
```

### Schedule Event

```typescript
interface ScheduleEvent {
  id: string;
  title: string;
  courseId?: string;
  courseSlug?: string;
  courseTitle?: string;
  classId?: string;
  startTime: string; // ISO Date string
  endTime: string; // ISO Date string
  type: "lecture" | "lab" | "exam" | "office-hours" | "meeting" | "other";
  location?: string;
  instructorId?: string;
  instructor?: string;
  meetingLink?: string;
  description?: string;
  attendees?: string[];
}
```

### Attendance

```typescript
interface DailyAttendance {
  date: string; // Format: YYYY-MM-DD
  courseClassId: string;
  attendances: StudentAttendance[];
}

interface StudentAttendance {
  studentId: string;
  name: string;
  status: "present" | "absent" | "late";
  time?: string;
}
```

## API Endpoints

### Courses

- `GET /courses` - Get all public courses
- `GET /courses/:id` - Get course details
- `POST /courses` - Create a new course (admin)
- `PUT /courses/:id` - Update a course (admin)
- `DELETE /courses/:id` - Delete a course (admin)

### Classes

- `GET /classes` - Get all classes (admin)
- `GET /classes/:id` - Get class details
- `POST /classes` - Create a new class
- `PUT /classes/:id` - Update a class
- `DELETE /classes/:id` - Delete a class
- `GET /teachers/:teacherId/taught-classes` - Get classes taught by a teacher
- `GET /students/:studentId/enrolled-classes` - Get classes a student is enrolled in

### Schedule

- `GET /schedule` - Get schedule events (filtered by role, userId, date range)
- `GET /schedule-events` - Get all schedule events (admin, paginated)
- `GET /schedule-events/:id` - Get schedule event details
- `POST /schedule-events` - Create a new schedule event
- `PUT /schedule-events/:id` - Update a schedule event
- `DELETE /schedule-events/:id` - Delete a schedule event

### Attendance

- `GET /attendance/class/:classId` - Get attendance records for a class
- `GET /attendance/student/:studentId` - Get attendance records for a student
- `POST /attendance/mark` - Mark attendance for a student
- `PUT /attendance/:id` - Update an attendance record

## Implementation Logic

### Course to Class Relationship

1. Courses are the content templates
2. Classes are instances of courses with specific schedules, teachers, and students
3. Multiple classes can be created from a single course (e.g., morning and afternoon sessions)

### Class to Schedule Relationship

1. When a class is created, it can have a general schedule (e.g., "Mon/Wed/Fri 9-11 AM")
2. Specific schedule events are created based on this general schedule
3. Additional one-time events (exams, special sessions) can be added to the schedule

### Schedule to Attendance Relationship

1. Each scheduled event for a class can have attendance records
2. Attendance records are created when the event occurs
3. Students can be marked present, absent, or late for each event

## Migration Strategy

To ensure a smooth transition from mock data to live API data:

1. **Maintain Type Consistency**: Ensure backend API returns data in the same structure as the mock data
2. **Handle Nested Data**: Backend should return nested data in the same format (e.g., `response.data`)
3. **Implement Defensive Programming**: Use safe data handling utilities for all API responses
4. **Gradual Feature Migration**: Migrate one feature at a time, starting with core features (Courses → Classes → Schedule → Attendance)
5. **Comprehensive Testing**: Test each feature after migration to ensure compatibility

## API Response Format Requirements

All API responses should follow this format to maintain compatibility with the frontend:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data matching the expected types
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    // Optional detailed errors
  ]
}
```

## Special Considerations

### Date Handling

- All dates should be in ISO format (YYYY-MM-DDTHH:MM:SS.sssZ)
- The frontend uses date-fns for date manipulation
- Current day data is important for attendance and schedule

### Mock Data Behavior

- When `IS_LIVE_API` is false, mock data for schedule and attendance always shows current day data
- This behavior should be maintained in the live API for consistency

### Error Handling

- API errors should be handled gracefully
- The frontend uses the ApiError class for consistent error handling
- Network errors should be distinguished from API errors
