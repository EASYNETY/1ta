# Classes and Courses Integration Guide

## Overview

This document provides detailed specifications for integrating the frontend classes and courses features with the backend API. Courses represent the educational content, while classes are specific instances of courses with assigned teachers, enroled students, and schedules.

## Table of Contents

1. [Data Structures](#data-structures)
2. [API Endpoints](#api-endpoints)
3. [Frontend Implementation](#frontend-implementation)
4. [Relationships with Other Features](#relationships-with-other-features)
5. [Migration Checklist](#migration-checklist)

## Data Structures

### Course Types

\`\`\`typescript
// Public course visible to all users
export interface PublicCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  duration: string;
  level: string;
  price: number;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
  };
  modules: PublicModule[];
  enrolmentCount?: number;
  rating?: number;
  tags?: string[];
}

// Module in a public course
export interface PublicModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  lessons: PublicLesson[];
}

// Lesson in a public module
export interface PublicLesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "quiz" | "assignment" | "reading";
}

// Authenticated course with additional details for enroled users
export interface AuthCourse extends PublicCourse {
  modules: AuthModule[];
  enrolmentStatus: "enroled" | "completed" | "in-progress";
  progress: number;
  completedLessons: string[];
  quizScores: Record<string, number>;
  notes: CourseNote[];
  discussions: CourseDiscussion[];
  assignments: CourseAssignment[];
}

// Module in an authenticated course
export interface AuthModule extends PublicModule {
  lessons: AuthLesson[];
  progress: number;
}

// Lesson in an authenticated module
export interface AuthLesson extends PublicLesson {
  content: string;
  videoUrl?: string;
  completed: boolean;
  lastAccessed?: string;
}
\`\`\`

### Class Types

\`\`\`typescript
// Class view for admin
export interface AdminClassView {
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
  meetingLink?: string;
  notes?: string;
}

// Class option for dropdowns
export interface CourseClassOption {
  id: string;
  label: string;
  courseId: string;
}

// Class session for current selection
export interface CourseClass {
  id: string;
  courseName: string;
  sessionName: string;
}

// Redux state for classes
export interface ClassesState {
  myClasses: AuthCourse[];
  allClasses: AdminClassView[];
  currentClass: AdminClassView | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  operationStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  adminPagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
  } | null;
  courseClassOptions: CourseClassOption[];
  courseClassOptionsStatus: "idle" | "loading" | "succeeded" | "failed";
  courseClassOptionsError: string | null;
}
\`\`\`

## API Endpoints

### Courses

\`\`\`
GET /courses
\`\`\`

**Query Parameters:**
- `page`: Page number for pagination
- `limit`: Number of items per page
- `search`: Search term for filtering
- `category`: Filter by category
- `level`: Filter by level

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "1",
        "title": "PMP® Certification Training",
        "slug": "pmp-certification-training",
        "description": "...",
        "thumbnail": "...",
        "duration": "40 hours",
        "level": "Intermediate",
        "price": 299.99,
        "instructor": {
          "id": "teacher_1",
          "name": "Dr. Sarah Johnson",
          "avatar": "..."
        },
        "modules": [...],
        "enrolmentCount": 245,
        "rating": 4.8,
        "tags": ["project management", "certification"]
      }
    ],
    "total": 24,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
\`\`\`

\`\`\`
GET /courses/:id
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "PMP® Certification Training",
    "slug": "pmp-certification-training",
    "description": "...",
    "thumbnail": "...",
    "duration": "40 hours",
    "level": "Intermediate",
    "price": 299.99,
    "instructor": {
      "id": "teacher_1",
      "name": "Dr. Sarah Johnson",
      "avatar": "..."
    },
    "modules": [...],
    "enrolmentCount": 245,
    "rating": 4.8,
    "tags": ["project management", "certification"]
  }
}
\`\`\`

### Classes

\`\`\`
GET /classes
\`\`\`

**Query Parameters:**
- `page`: Page number for pagination
- `limit`: Number of items per page
- `search`: Search term for filtering
- `status`: Filter by status

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "classes": [
      {
        "id": "class_1_1",
        "courseTitle": "PMP® Certification Training",
        "courseId": "1",
        "teacherName": "Dr. Sarah Johnson",
        "teacherId": "teacher_1",
        "studentCount": 25,
        "status": "active",
        "startDate": "2023-01-15T00:00:00.000Z",
        "endDate": "2023-03-15T00:00:00.000Z",
        "schedule": "Mon/Wed/Fri 9-11 AM",
        "location": "Virtual Classroom A",
        "meetingLink": "https://zoom.us/j/example",
        "notes": "Morning session"
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
\`\`\`

\`\`\`
GET /classes/:id
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "class_1_1",
    "courseTitle": "PMP® Certification Training",
    "courseId": "1",
    "teacherName": "Dr. Sarah Johnson",
    "teacherId": "teacher_1",
    "studentCount": 25,
    "status": "active",
    "startDate": "2023-01-15T00:00:00.000Z",
    "endDate": "2023-03-15T00:00:00.000Z",
    "schedule": "Mon/Wed/Fri 9-11 AM",
    "location": "Virtual Classroom A",
    "meetingLink": "https://zoom.us/j/example",
    "notes": "Morning session"
  }
}
\`\`\`

\`\`\`
POST /classes
\`\`\`

**Request Body:**
\`\`\`json
{
  "courseId": "1",
  "teacherId": "teacher_1",
  "status": "upcoming",
  "startDate": "2023-04-15T00:00:00.000Z",
  "endDate": "2023-06-15T00:00:00.000Z",
  "schedule": "Tue/Thu 2-4 PM",
  "location": "Virtual Classroom B",
  "meetingLink": "https://zoom.us/j/example2",
  "notes": "Afternoon session"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Class created successfully",
  "data": {
    "id": "class_1_2",
    "courseTitle": "PMP® Certification Training",
    "courseId": "1",
    "teacherName": "Dr. Sarah Johnson",
    "teacherId": "teacher_1",
    "studentCount": 0,
    "status": "upcoming",
    "startDate": "2023-04-15T00:00:00.000Z",
    "endDate": "2023-06-15T00:00:00.000Z",
    "schedule": "Tue/Thu 2-4 PM",
    "location": "Virtual Classroom B",
    "meetingLink": "https://zoom.us/j/example2",
    "notes": "Afternoon session"
  }
}
\`\`\`

\`\`\`
PUT /classes/:id
\`\`\`

**Request Body:**
\`\`\`json
{
  "status": "active",
  "location": "Virtual Classroom C"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Class updated successfully",
  "data": {
    "id": "class_1_2",
    "courseTitle": "PMP® Certification Training",
    "courseId": "1",
    "teacherName": "Dr. Sarah Johnson",
    "teacherId": "teacher_1",
    "studentCount": 0,
    "status": "active",
    "startDate": "2023-04-15T00:00:00.000Z",
    "endDate": "2023-06-15T00:00:00.000Z",
    "schedule": "Tue/Thu 2-4 PM",
    "location": "Virtual Classroom C",
    "meetingLink": "https://zoom.us/j/example2",
    "notes": "Afternoon session"
  }
}
\`\`\`

\`\`\`
DELETE /classes/:id
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Class deleted successfully",
  "data": {
    "id": "class_1_2"
  }
}
\`\`\`

\`\`\`
GET /teachers/:teacherId/taught-classes
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "PMP® Certification Training",
      "slug": "pmp-certification-training",
      "description": "...",
      "thumbnail": "...",
      "duration": "40 hours",
      "level": "Intermediate",
      "price": 299.99,
      "instructor": {
        "id": "teacher_1",
        "name": "Dr. Sarah Johnson",
        "avatar": "..."
      },
      "modules": [...],
      "enrolmentStatus": "in-progress",
      "progress": 0.75,
      "completedLessons": [...],
      "quizScores": {...},
      "notes": [...],
      "discussions": [...],
      "assignments": [...]
    }
  ]
}
\`\`\`

## Frontend Implementation

### Redux Thunks

The frontend uses Redux thunks to interact with the classes and courses API:

\`\`\`typescript
// Fetch all classes (admin view)
export const fetchAdminClasses = createAsyncThunk<
  FetchAdminClassesResult,
  FetchAdminParams | void,
  { rejectValue: string }
>("classes/fetchAdmin", async (params, { rejectWithValue }) => {
  try {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const search = params?.search ?? "";

    // Construct query parameters
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    if (search) queryParams.append("search", search);

    // API call using the API client
    return await get<FetchAdminClassesResult>(`/classes?${queryParams.toString()}`);
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch classes");
  }
});

// Create a new class
export const createClass = createAsyncThunk<
  AdminClassView,
  CreateClassPayload,
  { rejectValue: string }
>("classes/create", async (classData, { rejectWithValue }) => {
  try {
    const response = await post<AdminClassView>("/classes", classData);
    return response;
  } catch (e: any) {
    const errorMessage =
      e.response?.data?.message || e.message || "Failed to create class";
    return rejectWithValue(errorMessage);
  }
});

// Update a class
export const updateClass = createAsyncThunk<
  AdminClassView,
  UpdateClassPayload,
  { rejectValue: string }
>("classes/update", async (payload, { rejectWithValue }) => {
  const { id, ...updateData } = payload;
  if (!id) {
    return rejectWithValue("Class ID is required for update.");
  }
  try {
    const response = await put<AdminClassView>(`/classes/${id}`, updateData);
    return response;
  } catch (e: any) {
    const errorMessage =
      e.response?.data?.message || e.message || "Failed to update class";
    return rejectWithValue(errorMessage);
  }
});
\`\`\`

## Relationships with Other Features

### Classes to Schedule Relationship

When a class is created:

1. The class has a general schedule (e.g., "Mon/Wed/Fri 9-11 AM")
2. The backend should generate specific schedule events based on this general schedule
3. These events are then available through the schedule API

### Classes to Attendance Relationship

1. Each class has enroled students
2. Attendance records are created for each scheduled event of the class
3. Teachers can view and manage attendance for their classes
4. Students can view their own attendance across all enroled classes

## Migration Checklist

To ensure a smooth transition from mock data to live API:

- [ ] Ensure backend API returns data in the same structure as mock data
- [ ] Implement all required endpoints with proper validation
- [ ] Handle date formatting consistently (ISO format)
- [ ] Ensure proper relationships between courses, classes, schedule, and attendance
- [ ] Implement proper error handling
- [ ] Test class creation and update with live API
- [ ] Verify class listing and filtering with live data
- [ ] Implement caching for frequently accessed data
- [ ] Add fallback mechanisms for network issues
