// features/analytics/utils/data-derivation-additional.ts
import { RootState } from "@/store";
import { ReportFilter } from "../types/analytics-types";
import { 
  PaymentReport, 
  AttendanceReport,
  ReportResponse
} from "../types/report-types";

/**
 * Derive payment reports from the Redux store
 * @param state The Redux store state
 * @param filter Report filter options
 * @returns Payment reports
 */
export function derivePaymentReports(
  state: RootState, 
  filter: ReportFilter
): ReportResponse<PaymentReport> {
  // Default empty values for safety
  const payments = state.paymentHistory?.payments || [];
  const users = state.auth?.users || [];
  const courses = state.courses?.courses || [];
  
  // Apply filters
  let filteredPayments = payments;
  
  if (filter.startDate) {
    const startDate = new Date(filter.startDate);
    filteredPayments = filteredPayments.filter(payment => {
      const date = payment.date ? new Date(payment.date) : null;
      return date ? date >= startDate : true;
    });
  }
  
  if (filter.endDate) {
    const endDate = new Date(filter.endDate);
    filteredPayments = filteredPayments.filter(payment => {
      const date = payment.date ? new Date(payment.date) : null;
      return date ? date <= endDate : true;
    });
  }
  
  if (filter.courseId) {
    filteredPayments = filteredPayments.filter(payment => 
      payment.courseId === filter.courseId
    );
  }
  
  if (filter.status) {
    filteredPayments = filteredPayments.filter(payment => 
      payment.status === filter.status
    );
  }
  
  if (filter.searchTerm) {
    const searchTerm = filter.searchTerm.toLowerCase();
    filteredPayments = filteredPayments.filter(payment => {
      const user = users.find(u => u.id === payment.userId);
      const course = courses.find(c => c.id === payment.courseId);
      
      return (
        user?.name?.toLowerCase().includes(searchTerm) ||
        user?.email?.toLowerCase().includes(searchTerm) ||
        course?.title?.toLowerCase().includes(searchTerm) ||
        payment.paymentMethod?.toLowerCase().includes(searchTerm)
      );
    });
  }
  
  // Map payments to reports
  const reports: PaymentReport[] = filteredPayments.map(payment => {
    // Get user name
    const user = users.find(u => u.id === payment.userId);
    const userName = user?.name || "Unknown User";
    
    // Get course title
    const course = courses.find(c => c.id === payment.courseId);
    const courseTitle = course?.title;
    
    return {
      id: payment.id || "",
      userId: payment.userId || "",
      userName,
      amount: payment.amount || 0,
      status: payment.status || "unknown",
      date: payment.date || new Date().toISOString(),
      paymentMethod: payment.paymentMethod || "unknown",
      courseId: payment.courseId,
      courseTitle
    };
  });
  
  // Apply pagination
  const page = filter.page || 1;
  const limit = filter.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedReports = reports.slice(startIndex, endIndex);
  
  return {
    data: paginatedReports,
    total: reports.length,
    page,
    limit,
    totalPages: Math.ceil(reports.length / limit)
  };
}

/**
 * Derive attendance reports from the Redux store
 * @param state The Redux store state
 * @param filter Report filter options
 * @returns Attendance reports
 */
export function deriveAttendanceReports(
  state: RootState, 
  filter: ReportFilter
): ReportResponse<AttendanceReport> {
  // Default empty values for safety
  const attendanceRecords = state.attendanceMarking?.attendanceRecords || [];
  const courses = state.courses?.courses || [];
  
  // Group attendance records by date and course
  const groupedRecords: Record<string, Record<string, any[]>> = {};
  
  attendanceRecords.forEach(record => {
    const date = record.date?.split('T')[0] || 'unknown';
    const courseId = record.courseId || 'unknown';
    
    if (!groupedRecords[date]) {
      groupedRecords[date] = {};
    }
    
    if (!groupedRecords[date][courseId]) {
      groupedRecords[date][courseId] = [];
    }
    
    groupedRecords[date][courseId].push(record);
  });
  
  // Create attendance reports
  let reports: AttendanceReport[] = [];
  
  Object.entries(groupedRecords).forEach(([date, coursesData]) => {
    Object.entries(coursesData).forEach(([courseId, records]) => {
      // Get course title
      const course = courses.find(c => c.id === courseId);
      const courseTitle = course?.title || "Unknown Course";
      
      // Count attendance statuses
      const presentCount = records.filter(r => r.status === 'present').length;
      const absentCount = records.filter(r => r.status === 'absent').length;
      const lateCount = records.filter(r => r.status === 'late').length;
      
      // Calculate attendance rate
      const totalStudents = records.length;
      const attendanceRate = totalStudents > 0 
        ? Math.round((presentCount + lateCount) / totalStudents * 100) 
        : 0;
      
      reports.push({
        date,
        courseId,
        courseTitle,
        presentCount,
        absentCount,
        lateCount,
        attendanceRate
      });
    });
  });
  
  // Apply filters
  if (filter.startDate) {
    const startDate = new Date(filter.startDate);
    reports = reports.filter(report => {
      const date = new Date(report.date);
      return date >= startDate;
    });
  }
  
  if (filter.endDate) {
    const endDate = new Date(filter.endDate);
    reports = reports.filter(report => {
      const date = new Date(report.date);
      return date <= endDate;
    });
  }
  
  if (filter.courseId) {
    reports = reports.filter(report => 
      report.courseId === filter.courseId
    );
  }
  
  if (filter.searchTerm) {
    const searchTerm = filter.searchTerm.toLowerCase();
    reports = reports.filter(report => 
      report.courseTitle.toLowerCase().includes(searchTerm)
    );
  }
  
  // Sort by date (newest first)
  reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Apply pagination
  const page = filter.page || 1;
  const limit = filter.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedReports = reports.slice(startIndex, endIndex);
  
  return {
    data: paginatedReports,
    total: reports.length,
    page,
    limit,
    totalPages: Math.ceil(reports.length / limit)
  };
}
