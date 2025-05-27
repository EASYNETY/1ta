# 🏫 Classes Documentation

This folder contains documentation related to the classes and courses features of the SmartEdu platform.

## Contents

- [Classes & Courses Integration](./classes-courses-integration.md) - Documentation for classes and courses integration
- [Enrolment Management System](./Enrolment.md) - Documentation for the slot-based enrolment system
- [Slot-Based Enrolment with Waitlist](./SlotBasedEnrolment.md) - Documentation for the enhanced slot-based enrolment system with waitlist functionality

## Overview

The classes feature allows administrators and teachers to manage classes, courses, and student enrolment. It includes functionality for creating and managing classes, assigning teachers, enroling students, and tracking class progress.

## Key Concepts

- **Classes**: Specific instances of courses with assigned teachers, students, and schedules.
- **Courses**: Educational content that can be taught in multiple classes.
- **Enrolment**: Process of adding students to classes.
- **Scheduling**: Assigning times and locations for classes.

## Features

- **Class Management**: Create, update, and delete classes.
- **Course Management**: Create, update, and delete courses.
- **Teacher Assignment**: Assign teachers to classes.
- **Student Enrolment**: Enrol students in classes with slot-based capacity management.
- **Waitlist Management**: Allow students to join waitlists for full classes and notify them when slots become available.
- **Class Scheduling**: Schedule classes with times and locations.
- **Class Materials**: Manage materials for classes.
- **Class Progress Tracking**: Track progress of classes.

## Implementation Details

The classes feature is implemented using:
- Redux for state management
- React components for UI
- API integration for data persistence
- TypeScript for type safety

## Related Documentation

- [Attendance Documentation](../attendance/README.md)
- [Analytics Documentation](../analytics/README.md)
- [API Integration Documentation](../../api-integration/README.md)
