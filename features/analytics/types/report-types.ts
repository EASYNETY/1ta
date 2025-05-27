// features/analytics/types/report-types.ts

import { ReportFilter, StudentBiodataFilter } from './analytics-types';

// Student Report Types
export interface StudentReport {
  id: string;
  name: string;
  email: string;
  enrolmentDate: string;
  coursesEnroled: number;
  coursesCompleted: number;
  averageGrade: number;
  attendanceRate: number;
  totalPayments: number;
}

// Student Biodata Report Types
export interface StudentBiodataReport {
  id: string;
  name: string;
  email: string;
  gender?: string;
  dateOfBirth?: string;
  age?: number;
  location?: string;
  accountType: "individual" | "corporate";
  corporateId?: string;
  corporateName?: string;
  enrolmentDate: string;
  coursesEnroled: number;
  coursesCompleted: number;
  completionRate: number;
  lastActive?: string;
  barcodeId?: string;
}

// Course Report Types
export interface CourseReport {
  id: string;
  title: string;
  category: string;
  enrolmentCount: number;
  completionRate: number;
  averageGrade: number;
  revenue: number;
}

// Payment Report Types
export interface PaymentReport {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  status: string;
  date: string;
  paymentMethod: string;
  courseId?: string;
  courseTitle?: string;
}

// Attendance Report Types
export interface AttendanceReport {
  date: string;
  courseId: string;
  courseTitle: string;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
}

// Report Response Types
export interface ReportResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Reports State Types
export interface ReportsState {
  studentReports: {
    data: StudentReport[];
    total: number;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };
  studentBiodataReports: {
    data: StudentBiodataReport[];
    total: number;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };
  courseReports: {
    data: CourseReport[];
    total: number;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };
  paymentReports: {
    data: PaymentReport[];
    total: number;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };
  attendanceReports: {
    data: AttendanceReport[];
    total: number;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };
}
