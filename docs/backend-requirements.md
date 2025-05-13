# 1Tech Academy Backend API Requirements

This document outlines the API requirements for the 1Tech Academy platform. It details the endpoints, data structures, and authentication requirements needed to support the frontend application.

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Courses](#courses)
4. [Attendance](#attendance)
5. [Assignments](#assignments)
6. [Grades](#grades)
7. [Notifications](#notifications)
8. [Chat](#chat)
9. [Support](#support)
10. [Payments](#payments)

## Authentication

### Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/auth/login` | User login | `{ email, password }` | `{ success, data: { user, token, refreshToken }, message? }` |
| POST | `/auth/register` | User registration | `{ name, email, password, role }` | `{ success, data: { user, token, refreshToken }, message? }` |
| POST | `/auth/refresh-token` | Refresh access token | `{ refreshToken }` | `{ success, data: { token, refreshToken }, message? }` |
| POST | `/auth/logout` | User logout | `{ refreshToken }` | `{ success, message? }` |
| GET | `/auth/me` | Get current user | - | `{ success, data: { user }, message? }` |

### Authentication Response Format

```typescript
interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
  message?: string;
}
```

### User Types

The system supports dynamic user types based on roles:

```typescript
type UserRole = "student" | "teacher" | "admin";

interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

interface Student extends BaseUser {
  role: "student";
  enrolledCourses?: string[];
  studentId?: string;
  program?: string;
  level?: string;
}

interface Teacher extends BaseUser {
  role: "teacher";
  teacherId?: string;
  department?: string;
  courses?: string[];
  specialization?: string;
}

interface Admin extends BaseUser {
  role: "admin";
  adminId?: string;
  permissions?: string[];
}

type User = Student | Teacher | Admin;
```

## Courses

### Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/public_courses` | Get all public courses | - | `{ success, data: PublicCourse[], message? }` |
| GET | `/public_courses/:slug` | Get public course by slug | - | `{ success, data: PublicCourse, message? }` |
| GET | `/auth_courses` | Get authenticated user's courses | - | `{ success, data: AuthCourse[], message? }` |
| GET | `/auth_courses/:slug` | Get authenticated course by slug | - | `{ success, data: AuthCourse, message? }` |
| POST | `/auth_courses` | Create a new course | `CourseFormValues` | `{ success, data: AuthCourse, message? }` |
| PUT | `/auth_courses/:id` | Update a course | `CourseFormValues` | `{ success, data: AuthCourse, message? }` |
| DELETE | `/auth_courses/:id` | Delete a course | - | `{ success, id: string, message? }` |
| POST | `/auth_courses/:courseId/lessons/:lessonId/complete` | Mark lesson as complete | `{ completed: boolean }` | `{ success, data: AuthCourse, message? }` |
| POST | `/auth_courses/:courseId/quizzes/:quizId/submit` | Submit quiz score | `{ score: number }` | `{ success, data: AuthCourse, message? }` |

### Course Types

```typescript
interface PublicCourse {
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
  studentsEnrolled?: number;
  rating?: number;
  reviewsCount?: number;
  learningOutcomes?: string[];
  prerequisites?: string[];
  modules?: {
    title: string;
    duration: string;
    lessons?: {
      title: string;
      duration: string;
      isPreview?: boolean;
    }[];
  }[];
  lessonCount: number;
  moduleCount: number;
  totalVideoDuration?: string | null;
  language?: string;
  certificate?: boolean;
  accessType?: "Lifetime" | "Limited";
  supportType?: "Instructor" | "Community" | "Both" | "None";
}

interface AuthCourse extends PublicCourse {
  enrollmentStatus: "enrolled" | "not_enrolled" | "pending";
  enrollmentDate?: string;
  expiryDate?: string;
  progress?: number;
  lastAccessed?: string;
  completedLessons?: string[];
  quizScores?: Record<string, number>;
  notes?: AuthCourseNote[];
  discussions: any[];
  assignments?: Assignment[];
  modules: AuthCourseModule[];
}

interface AuthCourseModule {
  id: string;
  title: string;
  description?: string;
  duration: string;
  order: number;
  lessons: AuthCourseLesson[];
  isCompleted?: boolean;
  progress?: number;
}

interface AuthCourseLesson {
  id: string;
  title: string;
  description?: string;
  duration: string;
  type: "video" | "quiz" | "assignment" | "text" | "download";
  order: number;
  isPreview?: boolean;
  isCompleted?: boolean;
  content?: {
    videoUrl?: string;
    quizId?: string;
    textContent?: string;
    downloadUrl?: string;
    assignmentId?: string;
  };
  isUnlocked?: boolean;
}

interface CourseFormValues {
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  image: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  tags?: string | string[];
  price?: number;
  discountPrice?: number;
  learningOutcomes?: string | string[];
  prerequisites?: string | string[];
  language?: string;
  certificate?: boolean;
  accessType?: "Lifetime" | "Limited";
  supportType?: "Instructor" | "Community" | "Both" | "None";
  modules?: {
    id?: string;
    title: string;
    description?: string;
    lessons?: {
      id?: string;
      title: string;
      type: "video" | "quiz" | "assignment" | "text" | "download";
      duration: string;
      isPreview?: boolean;
      content?: {
        videoUrl?: string;
        textContent?: string;
        downloadUrl?: string;
        quizId?: string;
        assignmentId?: string;
      };
    }[];
  }[];
  instructorId: string;
}
```

## Attendance

### Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/students/:studentId/attendance` | Get student attendance | - | `StudentAttendanceResponse` |
| GET | `/courses/:courseClassId/attendance` | Get course attendance | - | `TeacherAttendanceResponse` |
| POST | `/attendance/mark` | Mark student attendance | `MarkAttendancePayload` | `{ success: boolean, studentId: string, message?: string }` |

### Attendance Types

```typescript
type AttendanceStatus = "present" | "absent" | "late";

interface StudentAttendance {
  studentId: string;
  name: string;
  status: AttendanceStatus;
  time?: string;
}

interface DailyAttendance {
  date: string; // Format: YYYY-MM-DD
  courseClassId: string;
  attendances: StudentAttendance[];
}

interface StudentAttendanceRecord {
  date: string;
  status: AttendanceStatus;
}

interface StudentAttendanceResponse {
  studentId: string;
  attendances: StudentAttendanceRecord[];
}

interface TeacherAttendanceResponse {
  courseClassId: string;
  courseTitle: string;
  totalStudents: number;
  dailyAttendances: DailyAttendance[];
}

interface MarkAttendancePayload {
  studentId: string;
  classInstanceId: string;
  markedByUserId: string;
  timestamp: string;
}
```

## Assignments

### Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/assignments` | Get assignments (with query params for role/context) | - | `Assignment[]` |
| GET | `/assignments/:id` | Get assignment by ID | - | `Assignment` |
| POST | `/assignments` | Create assignment | `CreateAssignmentPayload` | `Assignment` |
| PUT | `/assignments/:id` | Update assignment | `UpdateAssignmentPayload` | `Assignment` |
| DELETE | `/assignments/:id` | Delete assignment | - | `{ success: boolean, id: string }` |
| GET | `/assignments/:id/submissions` | Get submissions for assignment | - | `AssignmentSubmission[]` |
| POST | `/assignments/:id/submissions` | Submit assignment | `SubmitAssignmentPayload` | `AssignmentSubmission` |
| PUT | `/submissions/:id/grade` | Grade submission | `GradeSubmissionPayload` | `AssignmentSubmission` |

### Assignment Types

```typescript
interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  classId?: string;
  dueDate: string;
  totalPoints: number;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
  status?: "active" | "draft" | "archived";
}

interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string;
  status: "submitted" | "graded" | "late" | "resubmitted";
  content?: string;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
  grade?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
}

interface CreateAssignmentPayload {
  title: string;
  description: string;
  courseId: string;
  classId?: string;
  dueDate: string;
  totalPoints: number;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  status?: "active" | "draft";
}

interface UpdateAssignmentPayload {
  title?: string;
  description?: string;
  dueDate?: string;
  totalPoints?: number;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  status?: "active" | "draft" | "archived";
}

interface SubmitAssignmentPayload {
  studentId: string;
  content?: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}

interface GradeSubmissionPayload {
  grade: number;
  feedback?: string;
  graderId: string;
}
```

## Grades

### Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/grade-items` | Get grade items for course | - | `GradeItem[]` |
| GET | `/grade-items/:id` | Get grade item by ID | - | `GradeItem` |
| POST | `/grade-items` | Create grade item | `CreateGradeItemPayload` | `GradeItem` |
| PUT | `/grade-items/:id` | Update grade item | `UpdateGradeItemPayload` | `GradeItem` |
| DELETE | `/grade-items/:id` | Delete grade item | - | `{ success: boolean, id: string }` |
| GET | `/grade-items/:id/grades` | Get student grades for grade item | - | `StudentGrade[]` |
| GET | `/grade-items/student/:userId` | Get grade items for student | - | `StudentGradeItem[]` |
| GET | `/grades/:id` | Get student grade by ID | - | `StudentGrade` |
| POST | `/grades` | Assign grade | `AssignGradePayload` | `StudentGrade` |
| PUT | `/grades/:id` | Update grade | `UpdateGradePayload` | `StudentGrade` |
| GET | `/courses/:id/grades` | Get course grades | - | `CourseGrades` |
| POST | `/courses/:id/calculate-grades` | Calculate course grades | `CalculateGradesPayload` | `CourseGradeCalculation` |

### Grade Types

```typescript
interface GradeItem {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  classId?: string;
  category: "assignment" | "quiz" | "exam" | "participation" | "project" | "other";
  weight: number;
  totalPoints: number;
  dueDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  status: "active" | "draft" | "archived";
}

interface StudentGrade {
  id: string;
  gradeItemId: string;
  studentId: string;
  points: number;
  percentage: number;
  feedback?: string;
  gradedBy: string;
  gradedAt: string;
  updatedAt?: string;
  status: "graded" | "pending" | "excused";
}

interface StudentGradeItem extends GradeItem {
  grade?: {
    id: string;
    points: number;
    percentage: number;
    feedback?: string;
    status: "graded" | "pending" | "excused";
  };
}

interface CreateGradeItemPayload {
  title: string;
  description?: string;
  courseId: string;
  classId?: string;
  category: "assignment" | "quiz" | "exam" | "participation" | "project" | "other";
  weight: number;
  totalPoints: number;
  dueDate?: string;
  status?: "active" | "draft";
}

interface UpdateGradeItemPayload {
  title?: string;
  description?: string;
  category?: "assignment" | "quiz" | "exam" | "participation" | "project" | "other";
  weight?: number;
  totalPoints?: number;
  dueDate?: string;
  status?: "active" | "draft" | "archived";
}

interface AssignGradePayload {
  gradeItemId: string;
  studentId: string;
  points: number;
  feedback?: string;
  status?: "graded" | "pending" | "excused";
}

interface UpdateGradePayload {
  points?: number;
  feedback?: string;
  status?: "graded" | "pending" | "excused";
}

interface CourseGrades {
  courseId: string;
  courseTitle: string;
  gradeItems: GradeItem[];
  studentGrades: {
    studentId: string;
    studentName: string;
    grades: {
      gradeItemId: string;
      points: number;
      percentage: number;
      status: "graded" | "pending" | "excused";
    }[];
    totalPercentage?: number;
    letterGrade?: string;
  }[];
}

interface CalculateGradesPayload {
  courseId: string;
  classId?: string;
  studentIds?: string[];
  gradeScale?: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
}

interface CourseGradeCalculation {
  courseId: string;
  courseTitle: string;
  studentGrades: {
    studentId: string;
    studentName: string;
    totalPercentage: number;
    letterGrade: string;
  }[];
}
```

## Notifications

### Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/notifications` | Get user notifications | - | `NotificationResponse` |
| POST | `/notifications/:id/read` | Mark notification as read | - | `{ success: boolean, data: Notification, message?: string }` |
| POST | `/notifications/mark-all-read` | Mark all notifications as read | `{ userId: string }` | `{ success: boolean, message?: string }` |

### Notification Types

```typescript
type NotificationType =
  | "assignment"
  | "grade"
  | "course"
  | "announcement"
  | "message"
  | "payment"
  | "system";

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
  href?: string;
  metadata?: Record<string, any>;
}

interface NotificationResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }
  };
  message?: string;
}
```

## Chat

### Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/chat/rooms/user/:userId` | Get chat rooms for user | - | `ChatRoom[]` |
| GET | `/chat/messages` | Get messages for a room | - | `{ messages: ChatMessage[], pagination: { total, page, limit, totalPages } }` |
| POST | `/chat/rooms` | Create a new chat room | `CreateRoomPayload` | `ChatRoom` |
| POST | `/chat/messages` | Send a message | `{ roomId: string, senderId: string, content: string }` | `ChatMessage` |
| POST | `/chat/rooms/mark-read` | Mark room as read | `{ roomId: string, userId: string }` | `{ success: boolean, message?: string }` |

### Chat Types

```typescript
interface ChatRoom {
  id: string;
  name: string;
  type: "direct" | "group" | "course" | "class";
  participants: {
    userId: string;
    name: string;
    avatar?: string;
    role?: string;
    lastRead?: string;
  }[];
  createdAt: string;
  updatedAt?: string;
  lastMessage?: {
    content: string;
    sender: {
      id: string;
      name: string;
    };
    timestamp: string;
  };
  unreadCount?: number;
  courseId?: string;
  classId?: string;
}

interface ChatMessage {
  id: string;
  roomId: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  content: string;
  timestamp: string;
  readBy?: string[];
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
}

interface CreateRoomPayload {
  name: string;
  type: "direct" | "group" | "course" | "class";
  participants: {
    userId: string;
    role?: string;
  }[];
  courseId?: string;
  classId?: string;
}
```

## Support

### Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/support/my-tickets` | Get user's support tickets | - | `{ tickets: SupportTicket[], pagination: { total, page, limit, totalPages } }` |
| GET | `/support/my-tickets/:id` | Get ticket details | - | `SupportTicket` |
| POST | `/support/ticket` | Create a support ticket | `CreateTicketPayload` | `SupportTicket` |
| POST | `/support/my-tickets/:id/responses` | Add response to ticket | `{ message: string }` | `TicketResponse` |
| POST | `/support/feedback` | Submit feedback | `FeedbackPayload` | `{ success: boolean, message?: string }` |
| GET | `/admin/support-tickets` | Admin: Get all tickets | - | `{ tickets: SupportTicket[], pagination: { total, page, limit, totalPages } }` |
| GET | `/admin/support-tickets/:id` | Admin: Get ticket details | - | `SupportTicket` |
| POST | `/admin/support-tickets/:id/responses` | Admin: Add response to ticket | `{ message: string }` | `TicketResponse` |
| GET | `/admin/feedback` | Admin: Get all feedback | - | `{ feedback: Feedback[], pagination: { total, page, limit, totalPages } }` |

### Support Types

```typescript
type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "urgent";
type FeedbackType = "general" | "course" | "instructor" | "platform" | "suggestion";

interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category?: string;
  createdAt: string;
  updatedAt?: string;
  responses: TicketResponse[];
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
}

interface TicketResponse {
  id: string;
  ticketId: string;
  message: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
}

interface CreateTicketPayload {
  subject: string;
  description: string;
  priority: TicketPriority;
  category?: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}

interface Feedback {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  type: FeedbackType;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  courseId?: string;
  courseName?: string;
  instructorId?: string;
  instructorName?: string;
}

interface FeedbackPayload {
  type: FeedbackType;
  rating: number; // 1-5
  comment: string;
  courseId?: string;
  instructorId?: string;
}
```

## Payments

### Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/users/:userId/subscription` | Get user subscription | - | `UserSubscription` |
| POST | `/subscriptions` | Create subscription | `{ userId: string, planId: string }` | `UserSubscription` |
| PUT | `/subscriptions/:id` | Update subscription | `UpdateSubscriptionData` | `UserSubscription` |
| POST | `/subscriptions/:id/cancel` | Cancel subscription | - | `CancelSubscriptionResponse` |
| GET | `/plans` | Get all plans | - | `AllPlansResponse` |
| POST | `/plans` | Create plan | `CreatePlanData` | `PricingPlan` |
| PUT | `/plans/:id` | Update plan | `UpdatePlanData` | `PricingPlan` |
| DELETE | `/plans/:id` | Delete plan | - | `DeletePlanResponse` |
| POST | `/plans/:id/toggle-active` | Toggle plan active status | - | `PricingPlan` |
| POST | `/checkout/process` | Process checkout | `CheckoutData` | `CheckoutResponse` |

### Payment Types

```typescript
interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  status: "active" | "canceled" | "expired" | "pending";
  startDate: string;
  endDate: string;
  renewalDate?: string;
  paymentMethod: {
    type: "credit_card" | "paypal" | "bank_transfer";
    lastFour?: string;
    expiryDate?: string;
  };
  price: number;
  currency: string;
  interval: "monthly" | "quarterly" | "annual";
  features: string[];
  createdAt: string;
  updatedAt?: string;
  canceledAt?: string;
}

interface UpdateSubscriptionData {
  planId?: string;
  paymentMethod?: {
    type: "credit_card" | "paypal" | "bank_transfer";
    token?: string;
  };
  autoRenew?: boolean;
}

interface CancelSubscriptionResponse {
  success: boolean;
  subscriptionId: string;
  effectiveDate: string;
  message?: string;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "monthly" | "quarterly" | "annual";
  features: string[];
  isPopular?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface AllPlansResponse {
  plans: PricingPlan[];
}

interface CreatePlanData {
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "monthly" | "quarterly" | "annual";
  features: string[];
  isPopular?: boolean;
  isActive?: boolean;
}

interface UpdatePlanData {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  interval?: "monthly" | "quarterly" | "annual";
  features?: string[];
  isPopular?: boolean;
  isActive?: boolean;
}

interface DeletePlanResponse {
  success: boolean;
  id: string;
  message?: string;
}

interface CheckoutData {
  userId: string;
  items: {
    type: "course" | "subscription";
    id: string;
    quantity?: number;
    price: number;
  }[];
  couponCode?: string;
  paymentMethod: {
    type: "credit_card" | "paypal" | "bank_transfer";
    token?: string;
  };
}

interface CheckoutResponse {
  success: boolean;
  orderId: string;
  total: number;
  currency: string;
  items: {
    type: "course" | "subscription";
    id: string;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  discount?: number;
  paymentStatus: "completed" | "pending" | "failed";
  message?: string;
}
```

## General API Guidelines

### Response Format

All API responses should follow a consistent format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

### Error Handling

Error responses should follow this format:

```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Authentication

- All endpoints except public endpoints (like `/public_courses`) require authentication
- Authentication is handled via JWT tokens in the Authorization header
- Refresh tokens should be used to maintain user sessions
- 401 errors should trigger token refresh attempts

### Pagination

Endpoints that return lists should support pagination:

```typescript
interface PaginationParams {
  page?: number; // Default: 1
  limit?: number; // Default: 10
}

interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }
  };
  message?: string;
}
```

## Implementation Notes

1. The backend should implement all endpoints described in this document to support the frontend application.
2. Data structures should match the TypeScript interfaces provided.
3. Authentication should be implemented using JWT tokens with refresh token support.
4. All endpoints should validate input data and return appropriate error messages.
5. The API should follow RESTful principles and use appropriate HTTP status codes.
6. Sensitive operations should be protected with appropriate authorization checks.
7. The backend should implement proper error handling and logging.
8. All timestamps should be in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ).
9. File uploads should be handled securely and efficiently.
10. The API should be documented using OpenAPI/Swagger for easy reference.

This document serves as a comprehensive guide for implementing the backend API for the 1Tech Academy platform. It covers all the endpoints and data structures needed to support the frontend application.