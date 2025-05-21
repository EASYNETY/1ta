# Slot-Based Enrollment System with Waitlist

## Overview

This document provides a comprehensive guide to the enhanced slot-based enrollment system with waitlist functionality. The system allows students to join a waitlist when classes are full and receive notifications when slots become available.

## Key Features

1. **Slot-Based Enrollment**: Classes have a maximum number of slots and track available slots in real-time
2. **Waitlist Management**: Students can join a waitlist when classes are full
3. **Availability Notifications**: Students receive notifications when slots become available
4. **Enrollment Status Tracking**: The system tracks enrollment status for each student
5. **Class-Specific Enrollment**: Enrollment is managed at the class level rather than the course level

## Table of Contents

1. [Components](#components)
2. [State Management](#state-management)
3. [Waitlist Functionality](#waitlist-functionality)
4. [Integration with Cart](#integration-with-cart)
5. [Usage Examples](#usage-examples)

## Components

The slot-based enrollment system includes several React components that work together to provide a seamless enrollment experience:

### ClassEnrollmentButton

This component handles the enrollment process for a class. It checks for available slots and enrollment start dates before allowing enrollment.

```tsx
<ClassEnrollmentButton
  classId="class-123"
  courseId="course-456"
  courseTitle="Introduction to React"
  maxSlots={30}
  availableSlots={5}
  enrollmentStartDate="2023-06-01T00:00:00Z"
  buttonText="Enroll Now"
/>
```

Key features:
- Checks if enrollment has started
- Verifies available slots
- Handles enrollment through the cart system
- Displays enrollment status and details

### ClassWaitlistButton

This component allows students to join a waitlist when a class is full.

```tsx
<ClassWaitlistButton
  classId="class-123"
  courseId="course-456"
  courseTitle="Introduction to React"
  maxSlots={30}
  startDate="2023-07-01T00:00:00Z"
  endDate="2023-08-30T00:00:00Z"
  schedule="Mon, Wed, Fri 10:00 AM - 12:00 PM"
  location="Room 101"
/>
```

Key features:
- Collects contact information for notifications
- Allows students to choose notification preferences (email/SMS)
- Provides clear information about the waitlist process

### ClassAvailabilityNotification

This component displays a notification when slots become available for students on the waitlist.

```tsx
<ClassAvailabilityNotification
  classId="class-123"
  courseId="course-456"
  courseTitle="Introduction to React"
  availableSlots={2}
/>
```

Key features:
- Automatically detects when slots become available
- Notifies waitlisted students in order
- Provides a direct enrollment option from the notification

### ClassEnrollmentStatus

This component displays the enrollment status of a class, including available slots, waitlist status, and enrollment options.

```tsx
<ClassEnrollmentStatus
  classId="class-123"
  courseId="course-456"
  courseTitle="Introduction to React"
  maxSlots={30}
  studentCount={28}
  enrollmentStartDate="2023-06-01T00:00:00Z"
  startDate="2023-07-01T00:00:00Z"
  endDate="2023-08-30T00:00:00Z"
  schedule="Mon, Wed, Fri 10:00 AM - 12:00 PM"
  location="Room 101"
  status="active"
/>
```

Key features:
- Displays available slots with a progress bar
- Shows enrollment status (open, full, coming soon, etc.)
- Integrates enrollment and waitlist buttons
- Displays class schedule and location information

## State Management

The slot-based enrollment system uses Redux for state management. The following slices are involved:

### Classes Slice

The classes slice has been updated to include waitlist functionality:

```typescript
// Waitlist entry type
export interface WaitlistEntry {
  id: string;
  classId: string;
  courseId: string;
  userId?: string;
  email: string;
  phone?: string;
  notifyEmail: boolean;
  notifySMS: boolean;
  createdAt: string;
  status: 'pending' | 'notified' | 'enrolled' | 'expired';
}

// Classes state with waitlist
export interface ClassesState {
  // ... existing state properties
  waitlist: WaitlistEntry[];
  waitlistStatus: "idle" | "loading" | "succeeded" | "failed";
  waitlistError: string | null;
}
```

Key actions:
- `addToWaitlist`: Add a student to the waitlist for a class
- `removeFromWaitlist`: Remove a student from the waitlist
- `updateWaitlistStatus`: Update the status of a waitlist entry
- `clearWaitlist`: Clear all waitlist entries

### Cart Slice

The cart slice has been updated to handle class-based enrollment:

```typescript
export interface CartItem {
  courseId: string;
  classId?: string; // Added for class-based enrollment
  title: string;
  price: number;
  discountPrice?: number;
  image?: string;
  instructor?: string;
}
```

Key changes:
- Updated `addItem` to check for existing items by classId
- Updated `removeItem` to handle removal by classId
- Added `selectCartItemByClassId` selector

## Waitlist Functionality

The waitlist functionality allows students to join a waitlist when classes are full and receive notifications when slots become available.

### Joining the Waitlist

When a class is full, students can join the waitlist by providing their contact information and notification preferences:

1. Student clicks "Join Waitlist" button
2. Student enters email and optional phone number
3. Student selects notification preferences (email/SMS)
4. Student agrees to waitlist terms
5. System adds student to the waitlist with "pending" status

### Notification Process

When slots become available, the system notifies students on the waitlist:

1. System detects available slots
2. System identifies students on the waitlist with "pending" status
3. System updates waitlist entry status to "notified"
4. System displays notification to student
5. Student can enroll directly from the notification
6. If student enrolls, system updates waitlist entry status to "enrolled"
7. If student doesn't enroll within 24 hours, system may offer the slot to the next student

## Integration with Cart

The slot-based enrollment system integrates with the cart system to handle enrollment:

1. When a student clicks "Enroll Now", the class is added to the cart
2. The cart item includes both courseId and classId
3. When the student completes checkout, they are enrolled in the specific class
4. The system updates available slots and waitlist status accordingly

## Usage Examples

### Basic Enrollment Button

```tsx
import { ClassEnrollmentButton } from '@/components/classes/ClassEnrollmentButton';

export default function ClassDetailsPage({ classData }) {
  return (
    <div>
      <h1>{classData.courseTitle}</h1>
      <ClassEnrollmentButton
        classId={classData.id}
        courseId={classData.courseId}
        courseTitle={classData.courseTitle}
        maxSlots={classData.maxSlots}
        availableSlots={classData.availableSlots}
        enrollmentStartDate={classData.enrollmentStartDate}
      />
    </div>
  );
}
```

### Complete Enrollment Status Display

```tsx
import { ClassEnrollmentStatus } from '@/components/classes/ClassEnrollmentStatus';

export default function ClassDetailsPage({ classData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h1>{classData.courseTitle}</h1>
        <p>{classData.description}</p>
        {/* Other class details */}
      </div>
      <div className="md:col-span-1">
        <ClassEnrollmentStatus
          classId={classData.id}
          courseId={classData.courseId}
          courseTitle={classData.courseTitle}
          courseImage={classData.courseImage}
          coursePrice={classData.coursePrice}
          courseDiscountPrice={classData.courseDiscountPrice}
          instructorName={classData.teacherName}
          maxSlots={classData.maxSlots}
          studentCount={classData.studentCount}
          enrollmentStartDate={classData.enrollmentStartDate}
          startDate={classData.startDate}
          endDate={classData.endDate}
          schedule={classData.schedule}
          location={classData.location}
          status={classData.status}
        />
      </div>
    </div>
  );
}
```

## Conclusion

The slot-based enrollment system with waitlist functionality provides a comprehensive solution for managing class enrollments. By implementing this system, educational institutions can efficiently manage class capacity, provide a fair enrollment process, and improve the student experience.

The system is designed to be flexible and can be integrated into various parts of the application, from class details pages to search results and course listings.
