// features/analytics/types/analytics-types.ts

// Dashboard Analytics Types
export interface StudentStats {
  total: number;
  active: number;
  newThisMonth: number;
  growthRate: number;
  genderDistribution?: {
    male: number;
    female: number;
    other: number;
    notSpecified: number;
  };
  ageDistribution?: {
    under18: number;
    age18to24: number;
    age25to34: number;
    age35to44: number;
    age45Plus: number;
  };
}

export interface CourseStats {
  total: number;
  active: number;
  averageCompletion: number;
  mostPopular: string;
  categoryDistribution?: Record<string, number>;
  enrollmentTrends?: {
    month: string;
    enrollments: number;
  }[];
}

export interface PaymentStats {
  totalRevenue: number;
  revenueThisMonth: number;
  growthRate: number;
  averageOrderValue: number;
  paymentMethodDistribution?: Record<string, number>;
  revenueTrends?: {
    month: string;
    revenue: number;
  }[];
}

export interface AttendanceStats {
  averageRate: number;
  trendsData: {
    date: string;
    rate: number;
  }[];
  courseAttendance?: {
    courseId: string;
    courseTitle: string;
    attendanceRate: number;
  }[];
}

export interface DashboardStats {
  studentStats: StudentStats;
  courseStats: CourseStats;
  paymentStats: PaymentStats;
  attendanceStats: AttendanceStats;
}

// Report Filter Types
export interface DateRange {
  startDate?: string;
  endDate?: string;
}

export interface ReportFilter extends DateRange {
  courseId?: string;
  userId?: string;
  status?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

// Student Biodata Types
export interface StudentBiodataFilter extends DateRange {
  gender?: string;
  ageRange?: string;
  accountType?: string;
  corporateId?: string;
  location?: string;
  completionRateMin?: number;
  completionRateMax?: number;
}

// Analytics State Types
export interface AnalyticsState {
  dashboardStats: DashboardStats;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}
