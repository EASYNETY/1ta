# Class Enrolment Management System

## Overview

This document provides a comprehensive guide for frontend engineers on how to integrate with the slot-based enrolment management system. The system tracks available slots per class, manages student enrolment, and updates course availability based on slot capacity.

## Key Features

1. **Slot-Based Enrolment**: Classes now have a maximum number of slots and track available slots in real-time
2. **Course Availability**: Courses automatically update their enrolment availability based on class slot capacity
3. **Enrolment Status Tracking**: The system tracks enrolment status for each student
4. **Bulk Enrolment**: Support for enroling multiple students at once (for corporate accounts)
5. **Waitlist Management**: Support for waitlisting students when classes are full
6. **Class Visibility Control**: Control who can see and enrol in classes (public, private, etc.)
7. **Enrolment Start Date**: Set when enrolment becomes available for a class

## Enrolment Settings Migration

Enrolment settings have been moved from the course management system to the class management system. This change reflects the fact that enrolment is managed at the class level rather than the course level. The following settings have been moved:

1. **Visibility**: Control who can see and enrol in the class (public, private, etc.)
2. **Enrolment Limit**: Set the maximum number of students who can enrol in the class
3. **Start Date**: Set when enrolment becomes available for the class

This change allows for more granular control over enrolment for each class instance of a course.

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
  enroled_students_count: number; // Number of students currently enroled
  is_active: boolean;
  status: string;              // Can be 'active', 'full', 'cancelled', etc.
  visibility: 'public' | 'private' | 'draft'; // Who can see and enrol in the class
  enrolment_start_date: string; // When enrolment becomes available
  teacher_id: string;
  created_at: string;
  updated_at: string;
}
```

### Enrolment Interfaces

```typescript
export interface ClassEnrolment {
  id: string;
  class_id: string;
  student_id: string;
  enrolment_date: string;
  status: string; // 'active', 'completed', 'dropped', etc.
  created_at: string;
  updated_at: string;
}

export interface EnrolmentRequest {
  class_id: string;
  student_id: string;
}

export interface EnrolmentResponse {
  success: boolean;
  message: string;
  data?: {
    enrolment: ClassEnrolment;
    class: Class;
  };
  error?: string;
}

export interface BulkEnrolmentRequest {
  class_id: string;
  student_ids: string[];
  corporate_id?: string;
}

export interface BulkEnrolmentResponse {
  success: boolean;
  message: string;
  data?: {
    enrolments: ClassEnrolment[];
    class: Class;
  };
  error?: string;
}
```

## API Endpoints

### Enrolment Endpoints

```
POST /api/enrolment/enrol
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
  "message": "Successfully enroled in class",
  "data": {
    "enrolment": {
      "id": "enrolment_789",
      "class_id": "class_123",
      "student_id": "student_456",
      "enrolment_date": "2023-06-15T10:30:00Z",
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
      "enroled_students_count": 1,
      "is_active": true,
      "status": "active",
      "visibility": "public",
      "enrolment_start_date": "2023-06-01T00:00:00Z",
      "teacher_id": "teacher_123",
      "created_at": "2023-05-15T14:20:00Z",
      "updated_at": "2023-06-15T10:30:00Z"
    }
  }
}
```

```
POST /api/enrolment/bulk-enrol
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
  "message": "Successfully enroled 3 students in class",
  "data": {
    "enrolments": [
      {
        "id": "enrolment_789",
        "class_id": "class_123",
        "student_id": "student_456",
        "enrolment_date": "2023-06-15T10:30:00Z",
        "status": "active",
        "created_at": "2023-06-15T10:30:00Z",
        "updated_at": "2023-06-15T10:30:00Z"
      },
      // Additional enrolment objects...
    ],
    "class": {
      "id": "class_123",
      "name": "Introduction to Project Management",
      "available_slots": 27,
      "enroled_students_count": 3,
      // Other class properties...
    }
  }
}
```

```
GET /api/enrolment/class/:classId/students
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
        "enrolment_date": "2023-06-15T10:30:00Z",
        "status": "active"
      },
      // Additional student objects...
    ],
    "total": 3,
    "class": {
      "id": "class_123",
      "name": "Introduction to Project Management",
      "available_slots": 27,
      "enroled_students_count": 3
    }
  }
}
```

```
GET /api/enrolment/student/:studentId/classes
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
        "enrolment_date": "2023-06-15T10:30:00Z",
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
  "enrolment_start_date": "2023-06-01T00:00:00Z"
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
    "enrolment_start_date": "2023-06-01T00:00:00Z",
    // Other class properties...
  }
}
```

## Frontend Implementation

### Class Form Component

The Class Form component should be updated to include the enrolment settings that were previously in the Course Settings:

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
  enrolment_start_date: z.date().optional(),
});

export function ClassForm({ initialData, onSubmit }) {
  // ... existing code

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* ... existing form fields */}

      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-medium">Enrolment Settings</h3>

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
                Control who can see and enrol in this class
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
              <FormLabel>Enrolment Limit</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Maximum number of students who can enrol in this class
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="enrolment_start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enrolment Start Date</FormLabel>
              <FormControl>
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                />
              </FormControl>
              <FormDescription>
                When enrolment becomes available for this class
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

### Enrolment Component

Here's an example of an enrolment component that can be used to enrol students in a class:

```tsx
// features/classes/components/EnrolmentButton.tsx
import { useState } from "react";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { enrolInClass } from "@/features/classes/store/classes-slice";
import { toast } from "sonner";

interface EnrolmentButtonProps {
  classId: string;
  disabled?: boolean;
}

export function EnrolmentButton({ classId, disabled }: EnrolmentButtonProps) {
  const [isEnroling, setIsEnroling] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleEnrol = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to enrol in this class",
        variant: "destructive",
      });
      return;
    }

    setIsEnroling(true);
    try {
      await dispatch(enrolInClass({
        classId,
        studentId: user.id,
      })).unwrap();

      toast({
        title: "Enrolment Successful",
        description: "You have been enroled in this class",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Enrolment Failed",
        description: error.message || "Failed to enrol in class",
        variant: "destructive",
      });
    } finally {
      setIsEnroling(false);
    }
  };

  return (
    <DyraneButton
      onClick={handleEnrol}
      disabled={disabled || isEnroling}
      loading={isEnroling}
    >
      {isEnroling ? "Enroling..." : "Enrol Now"}
    </DyraneButton>
  );
}
```

## Integration Steps

To integrate the enrolment management system into your application, follow these steps:

1. **Update Class Interface**: Update your class interface to include the new fields for enrolment management:
   - `max_slots`: Maximum number of slots available for the class
   - `available_slots`: Current number of available slots
   - `enroled_students_count`: Number of students currently enroled
   - `visibility`: Who can see and enrol in the class
   - `enrolment_start_date`: When enrolment becomes available

2. **Update Class Form**: Update your class form to include the enrolment settings that were previously in the Course Settings:
   - Visibility setting
   - Enrolment limit setting
   - Enrolment start date setting

3. **Update Course Interface**: Update your course interface to include the `available_for_enrolment` field:
   - This field should be automatically updated based on the availability of slots in the associated classes

4. **Update Enrolment Components**: Update your enrolment components to check for availability before allowing enrolment:
   - Check if the course is available for enrolment
   - Check if the class has available slots
   - Check if the enrolment start date has passed

5. **Implement Enrolment API Calls**: Implement the API calls for enroling students in classes:
   - Single enrolment
   - Bulk enrolment
   - Fetching enroled students
   - Fetching enroled classes

6. **Update UI Components**: Update your UI components to display enrolment information:
   - Show available slots
   - Show enrolment status
   - Show enrolment start date

7. **Test the Integration**: Test the integration to ensure that:
   - Enrolment works correctly
   - Available slots are updated correctly
   - Course availability is updated correctly
   - Enrolment start date is respected

## API Endpoints Reference

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|-------------------------|
| POST | `/api/enrolment/enrol` | Enrol a student in a class | Yes |
| POST | `/api/enrolment/bulk-enrol` | Enrol multiple students in a class | Yes |
| GET | `/api/enrolment/class/:classId/students` | Get all students enroled in a class | Yes |
| GET | `/api/enrolment/student/:studentId/classes` | Get all classes a student is enroled in | Yes |
| PUT | `/api/classes/:classId` | Update class enrolment settings | Yes |
| POST | `/api/enrolment/unenrol` | Unenrol a student from a class | Yes |

## Conclusion

The enrolment management system provides a comprehensive solution for managing class enrolments. By moving the enrolment settings from the course level to the class level, we can provide more granular control over enrolment for each class instance of a course.

The system tracks available slots in real-time, updates course availability based on slot capacity, and provides a seamless enrolment experience for students. It also supports bulk enrolment for corporate accounts and waitlisting for classes that are full.

By following the integration steps outlined in this document, you can successfully implement the enrolment management system in your application.
