// data/mock-analytics-data.ts
import { DashboardStats } from "@/features/analytics/types/analytics-types";
import { 
  StudentReport, 
  StudentBiodataReport, 
  CourseReport, 
  PaymentReport, 
  AttendanceReport,
  ReportResponse
} from "@/features/analytics/types/report-types";
import { StudentBiodataStats } from "@/features/analytics/types/student-biodata-types";
import { 
  getMockDashboardStats, 
  getMockStudentBiodataStats,
  getMockStudentReports,
  getMockStudentBiodataReports
} from "@/features/analytics/utils/mock-data";

/**
 * Get mock dashboard analytics data
 * @returns Mock dashboard analytics data
 */
export async function getMockAnalyticsDashboard(): Promise<{
  success: boolean;
  data: DashboardStats;
  message: string;
}> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
  
  return {
    success: true,
    data: getMockDashboardStats(),
    message: "Analytics dashboard data fetched successfully"
  };
}

/**
 * Get mock student biodata stats
 * @returns Mock student biodata stats
 */
export async function getMockStudentBiodataAnalytics(): Promise<{
  success: boolean;
  data: StudentBiodataStats;
  message: string;
}> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
  
  return {
    success: true,
    data: getMockStudentBiodataStats(),
    message: "Student biodata analytics fetched successfully"
  };
}

/**
 * Get mock student reports
 * @param page Page number
 * @param limit Items per page
 * @returns Mock student reports
 */
export async function getMockStudentReportsData(page: number = 1, limit: number = 10): Promise<{
  success: boolean;
  data: ReportResponse<StudentReport>;
  message: string;
}> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
  
  return {
    success: true,
    data: getMockStudentReports(limit),
    message: "Student reports fetched successfully"
  };
}

/**
 * Get mock student biodata reports
 * @param page Page number
 * @param limit Items per page
 * @returns Mock student biodata reports
 */
export async function getMockStudentBiodataReportsData(page: number = 1, limit: number = 10): Promise<{
  success: boolean;
  data: ReportResponse<StudentBiodataReport>;
  message: string;
}> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
  
  return {
    success: true,
    data: getMockStudentBiodataReports(limit),
    message: "Student biodata reports fetched successfully"
  };
}

/**
 * Get mock course reports
 * @param page Page number
 * @param limit Items per page
 * @returns Mock course reports
 */
export async function getMockCourseReportsData(page: number = 1, limit: number = 10): Promise<{
  success: boolean;
  data: ReportResponse<CourseReport>;
  message: string;
}> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
  
  // Generate mock course reports
  const reports: CourseReport[] = Array.from({ length: limit }, (_, i) => ({
    id: `course_${i + 1}`,
    title: `Course ${i + 1}`,
    category: ["Programming", "Design", "Business", "Data Science", "Other"][Math.floor(Math.random() * 5)],
    enrollmentCount: Math.floor(Math.random() * 50) + 10,
    completionRate: Math.floor(Math.random() * 100),
    averageGrade: Math.floor(Math.random() * 30) + 70,
    revenue: (Math.floor(Math.random() * 10) + 1) * 4500000
  }));
  
  return {
    success: true,
    data: {
      data: reports,
      total: 100,
      page,
      limit,
      totalPages: Math.ceil(100 / limit)
    },
    message: "Course reports fetched successfully"
  };
}
