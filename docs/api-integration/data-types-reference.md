# SmartEdu Data Types Reference

This document provides a comprehensive reference of the data types used in the SmartEdu frontend application. The backend should implement these types to ensure compatibility with the frontend.

## Table of Contents
1. [User Types](#user-types)
2. [Course Types](#course-types)
3. [Payment Types](#payment-types) 
4. [Class Types](#class-types)
5. [Attendance Types](#attendance-types)
6. [Support Types](#support-types)
7. [Schedule Types](#schedule-types)
8. [Assignment Types](#assignment-types)
9. [Grade Types](#grade-types)
10. [Chat Types](#chat-types)

## User Types

\`\`\`typescript
// Basic user role types
export type UserRole = "admin" | "teacher" | "student";
export type AccountType = "individual" | "corporate" | "institutional";
export type OnboardingStatus = "incomplete" | "complete" | "pending_verification";

// Base user interface - common properties for all users
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

// Student-specific user interface
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

// Teacher-specific user interface
export interface TeacherUser extends BaseUser {
  role: "teacher";
  subjects?: string[] | null;
  officeHours?: string | null;
}

// Admin-specific user interface
export interface AdminUser extends BaseUser {
  role: "admin";
  permissions?: string[] | null;
}

// Union type for all user types
export type User = StudentUser | TeacherUser | AdminUser;

// Auth state in Redux store
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  skipOnboarding: boolean;
  users: User[];
  totalUsers: number;
  usersLoading: boolean;
  usersError: string | null;
}
\`\`\`

## Course Types

### Public Course

\`\`\`typescript
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
  priceIndividualUSD?: number;
  pricing?: {
    corporate?: {
      [corporateId: string]: number;
    };
    individual?: number;
  };
  discountPriceCorporateUSD?: number;
  discountPriceIndividualUSD?: number;
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

export type CourseCategory =
  | "Web Development"
  | "Data Science"
  | "Mobile Development"
  | "Cybersecurity"
  | "Cloud Computing"
  | "AI & ML"
  | "Business"
  | "Design"
  | "Marketing"
  | "Mathematics"
  | "Science"
  | "Language"
  | "Health & Fitness"
  | "Project Management";
\`\`\`

### Auth Course

\`\`\`typescript
export interface AuthCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  image: string;
  instructor: {
    id: string;
    name: string;
  };
  enrolmentStatus: "enroled" | "completed" | "in-progress";
  progress: number; // 0-100
  lastAccessedAt?: string;
  modules: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      type: "video" | "quiz" | "assignment";
      duration?: string;
      completed: boolean;
      completedAt?: string;
    }[];
  }[];
}
\`\`\`

## Payment Types

\`\`\`typescript
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

export interface InitiatePaymentPayload {
  invoiceId: string;
  amount: number;
  paymentMethod: string;
}

export interface PaymentResponse {
  payment: PaymentRecord;
  authorizationUrl: string;
}

export interface VerifyPaymentResponse {
  payment: PaymentRecord;
  verification: any; // Provider-specific verification data
}

export interface PaymentHistoryState {
  myPayments: PaymentRecord[];
  allPayments: PaymentRecord[];
  totalMyPayments: number;
  totalAllPayments: number;
  currentPayment: PaymentRecord | null;
  paymentInitialization: {
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };
  verificationStatus: "idle" | "loading" | "succeeded" | "failed";
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}
\`\`\`

## Class Types

\`\`\`typescript
export interface Class {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  teacherId: string;
  teacherName: string;
  startDate: string;
  endDate: string;
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  enroledStudents: number;
  maxStudents: number;
  status: "active" | "upcoming" | "completed" | "cancelled";
}

export interface ClassSession {
  id: string;
  classId: string;
  date: string;
  startTime: string;
  endTime: string;
  topic: string;
  description?: string;
  attendanceRecorded: boolean;
  attendanceCount?: number;
}
\`\`\`

## Attendance Types

\`\`\`typescript
export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  sessionId: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  notes?: string;
  recordedBy: string;
  recordedAt: string;
}

export interface StudentAttendanceResponse {
  studentId: string;
  attendances: AttendanceRecord[];
}

export interface TeacherAttendanceResponse {
  courseClassId: string;
  className: string;
  sessions: {
    id: string;
    date: string;
    topic: string;
    attendanceRecords: AttendanceRecord[];
  }[];
}

export interface MarkAttendancePayload {
  studentId: string;
  classId: string;
  sessionId: string;
  status: "present" | "absent" | "late" | "excused";
  notes?: string;
}
\`\`\`

## Support Types

\`\`\`typescript
export type TicketStatus = "open" | "in-progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type FeedbackType = "general" | "course" | "instructor" | "platform";

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  responses: TicketResponse[];
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  message: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  type: FeedbackType;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}
\`\`\`

## Conclusion

This document provides a reference for the data types used in the SmartEdu frontend application. The backend should implement these types to ensure compatibility with the frontend. Additional types may be needed for specific features, but these core types cover the majority of the application's data needs.

Note that some types may have additional properties or methods in the frontend code that are not included here, as they are not relevant to the backend implementation.
