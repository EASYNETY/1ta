# SmartEdu Frontend-Backend Integration Requirements

This document outlines the API requirements needed from the backend to complete the SmartEdu frontend project. We're currently replacing all mock data with real API client calls and need to ensure the backend endpoints match our frontend expectations.

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Courses](#courses)
4. [Payment Processing](#payment-processing)
5. [User Management](#user-management)
6. [Additional Features](#additional-features)
7. [Data Types](#data-types)

## Overview

The SmartEdu frontend is built with Next.js and uses Redux for state management. We're currently using mock data for development but need to integrate with real backend APIs. The frontend uses a centralized API client (`lib/api-client.ts`) that handles all API requests, authentication, and error handling.

Key requirements:
- RESTful API endpoints that match our current mock implementations
- Consistent response formats
- Proper error handling
- Authentication via JWT

## Authentication

### Current Implementation
- JWT-based authentication
- Token stored in localStorage/cookies
- Automatic token refresh on 401 responses

### Required Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/auth/login` | User login | `{ email, password }` | `{ user: User, token: string }` |
| POST | `/auth/register` | User registration | `{ name, email, password, role }` | `{ user: User, token: string }` |
| POST | `/auth/forgot-password` | Password reset request | `{ email }` | `{ success: boolean, message: string }` |
| POST | `/auth/reset-password` | Reset password with token | `{ token, password }` | `{ success: boolean }` |
| GET | `/users/me` | Get current user profile | - | `User` object |
| PUT | `/users/me` | Update user profile | `Partial<User>` | Updated `User` object |

## Courses

### Public Courses
The frontend fetches public courses to display in the course catalog and for dropdown selections in the profile page.

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/public_courses` | Get all public courses | `{ success: boolean, data: PublicCourse[], message?: string }` |

### Authenticated Courses
Courses that a user has access to after authentication.

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/auth_courses` | Get courses for authenticated user | `{ success: boolean, data: AuthCourse[], message?: string }` |
| GET | `/auth_courses/slug/:slug` | Get course details by slug | `AuthCourse` |
| POST | `/auth_courses/:courseId/lessons/:lessonId/complete` | Mark lesson as complete | `{ success: boolean }` |
| DELETE | `/auth_courses/:courseId` | Delete a course | `{ success: boolean, id: string }` |

## Payment Processing

### Current Implementation
- Mock payment processing with Paystack integration
- Environment variables for API keys
- Frontend handling of payment flow

### Required Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/payments/initialize` | Initialize payment | `{ invoiceId, amount, paymentMethod }` | `{ success: boolean, message: string, data: { payment: PaymentRecord, authorizationUrl: string } }` |
| GET | `/payments/verify/:reference` | Verify payment | - | `{ success: boolean, message: string, data: { payment: PaymentRecord, verification: any } }` |
| GET | `/payments/user/history` | Get user payment history | Query params: `page`, `limit` | `{ success: boolean, data: { payments: PaymentRecord[], pagination: { total, page, limit, totalPages } } }` |
| GET | `/payments` | Admin: Get all payments | Query params: `status`, `page`, `limit`, `search` | `{ success: boolean, data: { payments: PaymentRecord[], pagination: { total, page, limit, totalPages } } }` |
| GET | `/payments/:id` | Get payment by ID | - | `{ success: boolean, message: string, data: PaymentRecord }` |

### Payment Integration Requirements
1. **Paystack Integration**:
   - Backend should handle Paystack API calls
   - Store Paystack API keys securely on the server
   - Process webhooks for payment verification
   - Update payment status in the database

2. **Zero-Value Payments**:
   - Support for free items (amount = 0)
   - Skip payment gateway for zero-value transactions

## User Management

### Student Management
For corporate users managing student accounts:

| Method | Endpoint | Description | Request Body/Params | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/corporate/:corporateId/students` | Get managed students | Query: `page`, `limit`, `search` | `{ students: StudentUser[], total: number }` |
| POST | `/corporate/create-slots` | Create student slots | `{ corporateId, studentCount, courses }` | `{ success: boolean, message: string }` |
| DELETE | `/corporate/students/:studentId` | Delete managed student | - | `{ success: boolean, id: string }` |

## Additional Features

### Classes
| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/users/:userId/enrolled-classes` | Get student enrolled classes | `{ classes: Class[] }` |
| GET | `/teachers/:teacherId/taught-classes` | Get teacher taught classes | `{ classes: Class[] }` |
| GET | `/admin/classes` | Admin: Get all classes | `{ classes: Class[], total: number }` |

### Attendance
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/students/:studentId/attendance` | Get student attendance | - | `StudentAttendanceResponse` |
| GET | `/courses/:courseId/attendance` | Get course attendance | - | `TeacherAttendanceResponse` |
| POST | `/attendance/mark` | Mark attendance | `MarkAttendancePayload` | `{ success: boolean, studentId: string }` |

## Data Types

### Key Type Definitions

#### User Types
```typescript
export type UserRole = "admin" | "teacher" | "student";
export type AccountType = "individual" | "corporate" | "institutional";
export type OnboardingStatus = "incomplete" | "complete" | "pending_verification";

export interface BaseUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  onboardingStatus: OnboardingStatus;
  accountType: AccountType;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  avatarUrl?: string | null;
  phone?: string | null;
  bio?: string | null;
  lastLogin?: string | null;
  corporateId?: string | null;
  corporateAccountName?: string | null;
}

export interface StudentUser extends BaseUser {
  role: "student";
  dateOfBirth?: string | null;
  address?: string | null;
  barcodeId?: string;
  classId?: string | null;
  guardianId?: string | null;
  isCorporateManager?: boolean;
  corporateId?: string | null;
  purchasedStudentSlots?: number | null;
  class?: any | null;
}
```

#### Course Types
```typescript
export interface PublicCourse {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  image: string;
  previewVideoUrl?: string;
  instructor: {
    name: string;
    title?: string;
  };
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  tags?: string[];
  priceUSD: number;
  discountPriceUSD?: number;
  // Additional fields omitted for brevity
}
```

#### Payment Types
```typescript
export interface PaymentRecord {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  provider: string;
  providerReference: string;
  description: string;
  createdAt: string;
  paymentMethod: string;
}
```

## Conclusion

This document outlines the key API requirements needed to complete the SmartEdu frontend project. The backend team should implement these endpoints to match the expected request/response formats. All mock data in the frontend will be replaced with real API client calls once these endpoints are available.

Please contact the frontend team if you have any questions or need clarification on any of these requirements.
