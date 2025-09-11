# Backend API Integration Guide

## Introduction

This document serves as a guide for the backend team to ensure consistent API response formats that match the expectations of the frontend application. Following these guidelines will help prevent integration issues and reduce the need for defensive coding on the frontend.

## Table of Contents

1. [General API Response Format](#general-api-response-format)
2. [Error Handling](#error-handling)
3. [Authentication](#authentication)
4. [Pagination](#pagination)
5. [Specific Endpoints](#specific-endpoints)
   - [Classes API](#classes-api)
   - [Courses API](#courses-api)
   - [Users API](#users-api)
   - [Attendance API](#attendance-api)
   - [Schedule API](#schedule-api)
6. [Data Types and Field Naming](#data-types-and-field-naming)
7. [Common Issues and Solutions](#common-issues-and-solutions)

## General API Response Format

All API responses should follow a consistent structure to make frontend integration easier and more predictable.

### Success Response Format

\`\`\`json
{
  "success": true,
  "data": [/* Array of items or single object */],
  "message": "Operation completed successfully",
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
\`\`\`

- `success`: Boolean indicating if the request was successful
- `data`: The actual data being returned (array or object)
- `message`: A human-readable message describing the result
- `pagination`: (Optional) Pagination information when returning lists

### Error Response Format

\`\`\`json
{
  "success": false,
  "message": "Descriptive error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
\`\`\`

## Error Handling

- Use appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Always include a descriptive error message
- For validation errors, include details about which fields failed validation

## Authentication

- Authentication failures should return 401 status code
- Token expiration should return a specific message to trigger token refresh
- Include user role information in authentication responses

## Pagination

When returning lists of items, always include pagination information:

\`\`\`json
"pagination": {
  "total": 100,    // Total number of items
  "page": 1,       // Current page number
  "limit": 10,     // Items per page
  "pages": 10      // Total number of pages
}
\`\`\`

## Specific Endpoints

### Classes API

#### GET /admin/classes

**Expected Response Format:**

\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "class-id",
      "name": "Class Name",
      "description": "Class description",
      "start_date": "2023-01-01",
      "end_date": "2023-06-30",
      "schedule": {
        "days": ["Monday", "Wednesday", "Friday"],
        "time": "14:00",
        "duration": "2 hours"
      },
      "max_students": 30,
      "is_active": true,
      "teacher_id": "teacher-id",
      "course_id": "course-id",
      "metadata": null,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  },
  "message": "Classes fetched successfully"
}
\`\`\`

**Important Fields:**
- `id`: Unique identifier for the class
- `name`: The name/title of the class
- `is_active`: Boolean indicating if the class is active
- `teacher_id`: ID of the teacher assigned to the class
- `course_id`: ID of the course this class belongs to

#### GET /classes/:id

**Expected Response Format:**

\`\`\`json
{
  "success": true,
  "data": {
    "id": "class-id",
    "name": "Class Name",
    "description": "Class description",
    "start_date": "2023-01-01",
    "end_date": "2023-06-30",
    "schedule": {
      "days": ["Monday", "Wednesday", "Friday"],
      "time": "14:00",
      "duration": "2 hours"
    },
    "max_students": 30,
    "is_active": true,
    "teacher_id": "teacher-id",
    "course_id": "course-id",
    "metadata": null,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "message": "Class fetched successfully"
}
\`\`\`

### Attendance API

#### POST /attendance/mark

**Expected Request Format:**

\`\`\`json
{
  "studentId": "student-id",
  "classId": "class-id",
  "date": "2023-01-01",
  "status": "present"
}
\`\`\`

**Expected Response Format:**

\`\`\`json
{
  "success": true,
  "data": {
    "id": "attendance-id",
    "studentId": "student-id",
    "classId": "class-id",
    "date": "2023-01-01",
    "status": "present",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "message": "Attendance marked successfully"
}
\`\`\`

## Data Types and Field Naming

### Field Naming Conventions

- Use snake_case for all field names (e.g., `first_name`, `last_login`)
- Boolean fields should be prefixed with `is_` or `has_` (e.g., `is_active`, `has_subscription`)
- Date fields should be suffixed with `_date` or `_at` (e.g., `creation_date`, `updated_at`)
- IDs should be suffixed with `_id` (e.g., `user_id`, `course_id`)

### Common Data Types

- **IDs**: String (UUID preferred) or Integer
- **Dates**: ISO 8601 format (YYYY-MM-DD)
- **Timestamps**: ISO 8601 format with timezone (YYYY-MM-DDTHH:MM:SS.sssZ)
- **Booleans**: true/false (not 0/1 or "yes"/"no")
- **Enums**: String values (not numeric codes)

## Common Issues and Solutions

### Issue: Inconsistent Response Formats

**Problem**: Some endpoints return data directly, while others nest it under a `data` property.

**Solution**: Always use the standard response format with `success`, `data`, and `message` properties.

### Issue: Missing Pagination Information

**Problem**: List endpoints don't include pagination details, making it difficult to implement pagination UI.

**Solution**: Always include pagination information for list endpoints, even if all items fit on one page.

### Issue: Inconsistent Field Naming

**Problem**: Some endpoints use camelCase, others use snake_case, leading to complex mapping logic.

**Solution**: Consistently use snake_case for all field names across all endpoints.

### Issue: Inconsistent Boolean Representation

**Problem**: Boolean values represented differently across endpoints (true/false, 0/1, "yes"/"no").

**Solution**: Always use true/false for boolean values.

## Conclusion

Following these guidelines will ensure a smooth integration between the frontend and backend systems. If you have any questions or need clarification, please reach out to the frontend team.

Remember that consistent API design leads to:
- Faster development
- Fewer bugs
- Easier maintenance
- Better developer experience

Let's work together to create a robust and consistent API!
