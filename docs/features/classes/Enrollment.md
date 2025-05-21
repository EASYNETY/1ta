# Class Enrollment Management System

## Overview

This document provides a comprehensive guide for frontend engineers on how to integrate with the slot-based enrollment management system. The system tracks available slots per class, manages student enrollment, and updates course availability based on slot capacity.

## Key Features

1. **Slot-Based Enrollment**: Classes now have a maximum number of slots and track available slots in real-time
2. **Course Availability**: Courses automatically update their enrollment availability based on class slot capacity
3. **Enrollment Status Tracking**: The system tracks enrollment status for each student
4. **Bulk Enrollment**: Support for enrolling multiple students at once (for corporate accounts)
5. **Waitlist Management**: Support for waitlisting students when classes are full
6. **Class Visibility Control**: Control who can see and enroll in classes (public, private, etc.)
7. **Enrollment Start Date**: Set when enrollment becomes available for a class

## Enrollment Settings Migration

Enrollment settings have been moved from the course management system to the class management system. This change reflects the fact that enrollment is managed at the class level rather than the course level. The following settings have been moved:

1. **Visibility**: Control who can see and enroll in the class (public, private, etc.)
2. **Enrollment Limit**: Set the maximum number of students who can enroll in the class
3. **Start Date**: Set when enrollment becomes available for the class

This change allows for more granular control over enrollment for each class instance of a course.

## Table of Contents

1. [Data Structures](#data-structures)
2. [API Endpoints](#api-endpoints)
3. [Frontend Implementation](#frontend-implementation)
4. [Integration Steps](#integration-steps)

## Data Structures

### Class Interface

```typescript
export interface Class {
  id: string;
  name: string;
  description: string;
  course_id: string;
  start_date: string;
  end_date: string;
  schedule: any; // This could be more specific based on your needs
  max_students: number;
  max_slots: number;           // Maximum number of slots available for the class
  available_slots: number;     // Current number of available slots
  enrolled_students_count: number; // Number of students currently enrolled
  is_active: boolean;
  status: string;              // Can be 'active', 'full', 'cancelled', etc.
  visibility: 'public' | 'private' | 'draft'; // Who can see and enroll in the class
  enrollment_start_date: string; // When enrollment becomes available
  teacher_id: string;
  created_at: string;
  updated_at: string;
}
```

### Enrollment Interfaces

```typescript
export interface ClassEnrollment {
  id: string;
  class_id: string;
  student_id: string;
  enrollment_date: string;
  status: string; // 'active', 'completed', 'dropped', etc.
  created_at: string;
  updated_at: string;
}

export interface EnrollmentRequest {
  class_id: string;
  student_id: string;
}

export interface EnrollmentResponse {
  success: boolean;
  message: string;
  data?: {
    enrollment: ClassEnrollment;
    class: Class;
  };
  error?: string;
}

export interface BulkEnrollmentRequest {
  class_id: string;
  student_ids: string[];
  corporate_id?: string;
}

export interface BulkEnrollmentResponse {
  success: boolean;
  message: string;
  data?: {
    enrollments: ClassEnrollment[];
    class: Class;
  };
  error?: string;
}
```

## API Endpoints

### Enrollment Endpoints

```
POST /api/enrollment/enroll
```

**Request Body:**
```json
{
  "class_id": "class_123",
  "student_id": "student_456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully enrolled in class",
  "data": {
    "enrollment": {
      "id": "enrollment_789",
      "class_id": "class_123",
      "student_id": "student_456",
      "enrollment_date": "2023-06-15T10:30:00Z",
      "status": "active",
      "created_at": "2023-06-15T10:30:00Z",
      "updated_at": "2023-06-15T10:30:00Z"
    },
    "class": {
      "id": "class_123",
      "name": "Introduction to Project Management",
      "description": "Learn the basics of project management",
      "course_id": "course_789",
      "start_date": "2023-07-01T09:00:00Z",
      "end_date": "2023-08-30T17:00:00Z",
      "max_students": 30,
      "max_slots": 30,
      "available_slots": 29,
      "enrolled_students_count": 1,
      "is_active": true,
      "status": "active",
      "visibility": "public",
      "enrollment_start_date": "2023-06-01T00:00:00Z",
      "teacher_id": "teacher_123",
      "created_at": "2023-05-15T14:20:00Z",
      "updated_at": "2023-06-15T10:30:00Z"
    }
  }
}
```

```
POST /api/enrollment/bulk-enroll
```

**Request Body:**
```json
{
  "class_id": "class_123",
  "student_ids": ["student_456", "student_789", "student_101"],
  "corporate_id": "corp_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully enrolled 3 students in class",
  "data": {
    "enrollments": [
      {
        "id": "enrollment_789",
        "class_id": "class_123",
        "student_id": "student_456",
        "enrollment_date": "2023-06-15T10:30:00Z",
        "status": "active",
        "created_at": "2023-06-15T10:30:00Z",
        "updated_at": "2023-06-15T10:30:00Z"
      },
      // Additional enrollment objects...
    ],
    "class": {
      "id": "class_123",
      "name": "Introduction to Project Management",
      "available_slots": 27,
      "enrolled_students_count": 3,
      // Other class properties...
    }
  }
}
```

```
GET /api/enrollment/class/:classId/students
```

**Response:**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "student_456",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "enrollment_date": "2023-06-15T10:30:00Z",
        "status": "active"
      },
      // Additional student objects...
    ],
    "total": 3,
    "class": {
      "id": "class_123",
      "name": "Introduction to Project Management",
      "available_slots": 27,
      "enrolled_students_count": 3
    }
  }
}
```

```
GET /api/enrollment/student/:studentId/classes
```

**Response:**
```json
{
  "success": true,
  "data": {
    "classes": [
      {
        "id": "class_123",
        "name": "Introduction to Project Management",
        "course_id": "course_789",
        "start_date": "2023-07-01T09:00:00Z",
        "end_date": "2023-08-30T17:00:00Z",
        "enrollment_date": "2023-06-15T10:30:00Z",
        "status": "active"
      },
      // Additional class objects...
    ],
    "total": 2
  }
}
```

### Class Management Endpoints

```
PUT /api/classes/:classId
```

**Request Body:**
```json
{
  "max_slots": 40,
  "visibility": "public",
  "enrollment_start_date": "2023-06-01T00:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Class updated successfully",
  "data": {
    "id": "class_123",
    "name": "Introduction to Project Management",
    "max_slots": 40,
    "available_slots": 37,
    "visibility": "public",
    "enrollment_start_date": "2023-06-01T00:00:00Z",
    // Other class properties...
  }
}
```

## Frontend Implementation

### Class Form Component

The Class Form component should be updated to include the enrollment settings that were previously in the Course Settings:

```tsx
// features/classes/components/ClassForm.tsx
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

// Define Zod Schema for the form
const classFormSchema = z.object({
  // ... existing fields
  max_slots: z.number().min(1, "Class must have at least 1 slot"),
  visibility: z.enum(["public", "private", "draft"]),
  enrollment_start_date: z.date().optional(),
});

export function ClassForm({ initialData, onSubmit }) {
  // ... existing code

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* ... existing form fields */}

      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-medium">Enrollment Settings</h3>

        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visibility</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Control who can see and enroll in this class
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="max_slots"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enrollment Limit</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Maximum number of students who can enroll in this class
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="enrollment_start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enrollment Start Date</FormLabel>
              <FormControl>
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                />
              </FormControl>
              <FormDescription>
                When enrollment becomes available for this class
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ... submit button */}
    </form>
  );
}
```

### Enrollment Component

Here's an example of an enrollment component that can be used to enroll students in a class:

```tsx
// features/classes/components/EnrollmentButton.tsx
import { useState } from "react";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { enrollInClass } from "@/features/classes/store/classes-slice";
import { toast } from "sonner";

interface EnrollmentButtonProps {
  classId: string;
  disabled?: boolean;
}

export function EnrollmentButton({ classId, disabled }: EnrollmentButtonProps) {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleEnroll = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to enroll in this class",
        variant: "destructive",
      });
      return;
    }

    setIsEnrolling(true);
    try {
      await dispatch(enrollInClass({
        classId,
        studentId: user.id,
      })).unwrap();

      toast({
        title: "Enrollment Successful",
        description: "You have been enrolled in this class",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to enroll in class",
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <DyraneButton
      onClick={handleEnroll}
      disabled={disabled || isEnrolling}
      loading={isEnrolling}
    >
      {isEnrolling ? "Enrolling..." : "Enroll Now"}
    </DyraneButton>
  );
}
```

## Integration Steps

To integrate the enrollment management system into your application, follow these steps:

1. **Update Class Interface**: Update your class interface to include the new fields for enrollment management:
   - `max_slots`: Maximum number of slots available for the class
   - `available_slots`: Current number of available slots
   - `enrolled_students_count`: Number of students currently enrolled
   - `visibility`: Who can see and enroll in the class
   - `enrollment_start_date`: When enrollment becomes available

2. **Update Class Form**: Update your class form to include the enrollment settings that were previously in the Course Settings:
   - Visibility setting
   - Enrollment limit setting
   - Enrollment start date setting

3. **Update Course Interface**: Update your course interface to include the `available_for_enrollment` field:
   - This field should be automatically updated based on the availability of slots in the associated classes

4. **Update Enrollment Components**: Update your enrollment components to check for availability before allowing enrollment:
   - Check if the course is available for enrollment
   - Check if the class has available slots
   - Check if the enrollment start date has passed

5. **Implement Enrollment API Calls**: Implement the API calls for enrolling students in classes:
   - Single enrollment
   - Bulk enrollment
   - Fetching enrolled students
   - Fetching enrolled classes

6. **Update UI Components**: Update your UI components to display enrollment information:
   - Show available slots
   - Show enrollment status
   - Show enrollment start date

7. **Test the Integration**: Test the integration to ensure that:
   - Enrollment works correctly
   - Available slots are updated correctly
   - Course availability is updated correctly
   - Enrollment start date is respected

## API Endpoints Reference

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|-------------------------|
| POST | `/api/enrollment/enroll` | Enroll a student in a class | Yes |
| POST | `/api/enrollment/bulk-enroll` | Enroll multiple students in a class | Yes |
| GET | `/api/enrollment/class/:classId/students` | Get all students enrolled in a class | Yes |
| GET | `/api/enrollment/student/:studentId/classes` | Get all classes a student is enrolled in | Yes |
| PUT | `/api/classes/:classId` | Update class enrollment settings | Yes |
| POST | `/api/enrollment/unenroll` | Unenroll a student from a class | Yes |

## Conclusion

The enrollment management system provides a comprehensive solution for managing class enrollments. By moving the enrollment settings from the course level to the class level, we can provide more granular control over enrollment for each class instance of a course.

The system tracks available slots in real-time, updates course availability based on slot capacity, and provides a seamless enrollment experience for students. It also supports bulk enrollment for corporate accounts and waitlisting for classes that are full.

By following the integration steps outlined in this document, you can successfully implement the enrollment management system in your application.
