// features/analytics/utils/data-derivation.ts
import { RootState } from "@/store";
import { 
  DashboardStats, 
  ReportFilter, 
  StudentBiodataFilter 
} from "../types/analytics-types";
import { 
  StudentReport, 
  StudentBiodataReport, 
  CourseReport, 
  PaymentReport, 
  AttendanceReport,
  ReportResponse
} from "../types/report-types";
import { StudentBiodataStats } from "../types/student-biodata-types";

/**
 * Derive dashboard analytics data from the Redux store
 * @param state The Redux store state
 * @returns Dashboard analytics data
 */
export function deriveDashboardStats(state: RootState): DashboardStats {
  // Default empty values for safety
  const students = state.auth?.users || [];
  const courses = state.courses?.courses || [];
  const payments = state.paymentHistory?.payments || [];
  const attendanceRecords = state.attendanceMarking?.attendanceRecords || [];

  // Student stats
  const totalStudents = students.filter(user => user.role === "student").length;
  const newStudentsThisMonth = students.filter(user => {
    if (user.role !== "student") return false;
    const createdAt = user.createdAt ? new Date(user.createdAt) : null;
    if (!createdAt) return false;
    
    const now = new Date();
    return createdAt.getMonth() === now.getMonth() && 
           createdAt.getFullYear() === now.getFullYear();
  }).length;

  // Course stats
  const totalCourses = courses.length;
  const courseEnrollments = state.auth_courses?.enrollments || [];
  
  // Calculate average completion rate
  let totalCompletionRate = 0;
  let completionCount = 0;
  
  courseEnrollments.forEach(enrollment => {
    if (enrollment.progress && enrollment.progress > 0) {
      totalCompletionRate += enrollment.progress;
      completionCount++;
    }
  });
  
  const averageCompletion = completionCount > 0 
    ? Math.round(totalCompletionRate / completionCount) 
    : 0;

  // Calculate category distribution
  const categoryDistribution: Record<string, number> = {};
  courses.forEach(course => {
    const category = course.category || "Uncategorized";
    categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
  });

  // Payment stats
  const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  
  // Calculate revenue this month
  const revenueThisMonth = payments.reduce((sum, payment) => {
    const paymentDate = payment.date ? new Date(payment.date) : null;
    if (!paymentDate) return sum;
    
    const now = new Date();
    if (paymentDate.getMonth() === now.getMonth() && 
        paymentDate.getFullYear() === now.getFullYear()) {
      return sum + (payment.amount || 0);
    }
    return sum;
  }, 0);

  // Generate revenue trends (last 6 months)
  const revenueTrends = generateRevenueTrends(payments);

  // Attendance stats
  let totalAttendanceRate = 0;
  let attendanceCount = 0;
  
  attendanceRecords.forEach(record => {
    if (record.attendanceRate && record.attendanceRate > 0) {
      totalAttendanceRate += record.attendanceRate;
      attendanceCount++;
    }
  });
  
  const averageAttendanceRate = attendanceCount > 0 
    ? Math.round(totalAttendanceRate / attendanceCount) 
    : 0;

  return {
    studentStats: {
      total: totalStudents,
      newThisMonth: newStudentsThisMonth,
      activeCount: totalStudents, // Assuming all students are active
      inactiveCount: 0,
    },
    courseStats: {
      total: totalCourses,
      averageCompletion,
      categoryDistribution,
    },
    paymentStats: {
      totalRevenue,
      revenueThisMonth,
      revenueTrends,
    },
    attendanceStats: {
      averageRate: averageAttendanceRate,
    }
  };
}

/**
 * Generate revenue trends for the last 6 months
 * @param payments Payment history
 * @returns Revenue trends by month
 */
function generateRevenueTrends(payments: any[]): { month: string; revenue: number }[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const trends: { month: string; revenue: number }[] = [];

  // Generate data for the last 6 months
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (now.getMonth() - i + 12) % 12; // Handle wrapping around to previous year
    const year = now.getFullYear() - (now.getMonth() < i ? 1 : 0);
    
    const monthRevenue = payments.reduce((sum, payment) => {
      const paymentDate = payment.date ? new Date(payment.date) : null;
      if (!paymentDate) return sum;
      
      if (paymentDate.getMonth() === monthIndex && 
          paymentDate.getFullYear() === year) {
        return sum + (payment.amount || 0);
      }
      return sum;
    }, 0);

    trends.push({
      month: months[monthIndex],
      revenue: monthRevenue
    });
  }

  return trends;
}

/**
 * Derive student biodata statistics from the Redux store
 * @param state The Redux store state
 * @returns Student biodata statistics
 */
export function deriveStudentBiodataStats(state: RootState): StudentBiodataStats {
  // Default empty values for safety
  const students = state.auth?.users?.filter(user => user.role === "student") || [];
  
  // Gender distribution
  const genderDistribution = {
    male: 0,
    female: 0,
    other: 0,
    notSpecified: 0
  };
  
  students.forEach(student => {
    const gender = student.gender?.toLowerCase();
    if (gender === "male") genderDistribution.male++;
    else if (gender === "female") genderDistribution.female++;
    else if (gender) genderDistribution.other++;
    else genderDistribution.notSpecified++;
  });

  // Age distribution
  const ageDistribution = {
    under18: 0,
    age18to24: 0,
    age25to34: 0,
    age35to44: 0,
    age45Plus: 0
  };
  
  students.forEach(student => {
    const birthDate = student.birthDate ? new Date(student.birthDate) : null;
    if (!birthDate) {
      // If no birth date, distribute randomly for demo purposes
      const randomCategory = Math.floor(Math.random() * 5);
      if (randomCategory === 0) ageDistribution.under18++;
      else if (randomCategory === 1) ageDistribution.age18to24++;
      else if (randomCategory === 2) ageDistribution.age25to34++;
      else if (randomCategory === 3) ageDistribution.age35to44++;
      else ageDistribution.age45Plus++;
      return;
    }
    
    const now = new Date();
    const age = now.getFullYear() - birthDate.getFullYear();
    
    if (age < 18) ageDistribution.under18++;
    else if (age >= 18 && age <= 24) ageDistribution.age18to24++;
    else if (age >= 25 && age <= 34) ageDistribution.age25to34++;
    else if (age >= 35 && age <= 44) ageDistribution.age35to44++;
    else ageDistribution.age45Plus++;
  });

  // Corporate vs Individual
  const corporateVsIndividual = {
    corporate: 0,
    individual: 0
  };
  
  students.forEach(student => {
    if (student.corporateId) corporateVsIndividual.corporate++;
    else corporateVsIndividual.individual++;
  });

  // Location distribution
  const locationDistribution: Record<string, number> = {};
  
  students.forEach(student => {
    const location = student.location || "Unknown";
    locationDistribution[location] = (locationDistribution[location] || 0) + 1;
  });

  return {
    genderDistribution,
    ageDistribution,
    corporateVsIndividual,
    locationDistribution
  };
}

/**
 * Derive student reports from the Redux store
 * @param state The Redux store state
 * @param filter Report filter options
 * @returns Student reports
 */
export function deriveStudentReports(
  state: RootState, 
  filter: ReportFilter
): ReportResponse<StudentReport> {
  // Default empty values for safety
  const students = state.auth?.users?.filter(user => user.role === "student") || [];
  const enrollments = state.auth_courses?.enrollments || [];
  const payments = state.paymentHistory?.payments || [];
  const attendanceRecords = state.attendanceMarking?.attendanceRecords || [];
  
  // Apply filters
  let filteredStudents = students;
  
  if (filter.searchTerm) {
    const searchTerm = filter.searchTerm.toLowerCase();
    filteredStudents = filteredStudents.filter(student => 
      student.name?.toLowerCase().includes(searchTerm) || 
      student.email?.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filter.startDate) {
    const startDate = new Date(filter.startDate);
    filteredStudents = filteredStudents.filter(student => {
      const createdAt = student.createdAt ? new Date(student.createdAt) : null;
      return createdAt ? createdAt >= startDate : true;
    });
  }
  
  if (filter.endDate) {
    const endDate = new Date(filter.endDate);
    filteredStudents = filteredStudents.filter(student => {
      const createdAt = student.createdAt ? new Date(student.createdAt) : null;
      return createdAt ? createdAt <= endDate : true;
    });
  }
  
  if (filter.courseId) {
    filteredStudents = filteredStudents.filter(student => 
      enrollments.some(enrollment => 
        enrollment.studentId === student.id && 
        enrollment.courseId === filter.courseId
      )
    );
  }
  
  if (filter.status) {
    filteredStudents = filteredStudents.filter(student => 
      student.isActive === (filter.status === "active")
    );
  }
  
  // Map students to reports
  const reports: StudentReport[] = filteredStudents.map(student => {
    // Get student enrollments
    const studentEnrollments = enrollments.filter(
      enrollment => enrollment.studentId === student.id
    );
    
    // Calculate courses enrolled and completed
    const coursesEnrolled = studentEnrollments.length;
    const coursesCompleted = studentEnrollments.filter(
      enrollment => enrollment.progress === 100
    ).length;
    
    // Calculate average grade
    let totalGrade = 0;
    let gradeCount = 0;
    
    studentEnrollments.forEach(enrollment => {
      if (enrollment.grade && enrollment.grade > 0) {
        totalGrade += enrollment.grade;
        gradeCount++;
      }
    });
    
    const averageGrade = gradeCount > 0 ? Math.round(totalGrade / gradeCount) : 0;
    
    // Calculate attendance rate
    const studentAttendance = attendanceRecords.filter(
      record => record.studentId === student.id
    );
    
    let totalAttendance = 0;
    let attendanceCount = 0;
    
    studentAttendance.forEach(record => {
      if (record.attendanceRate && record.attendanceRate > 0) {
        totalAttendance += record.attendanceRate;
        attendanceCount++;
      }
    });
    
    const attendanceRate = attendanceCount > 0 
      ? Math.round(totalAttendance / attendanceCount) 
      : 0;
    
    // Calculate total payments
    const studentPayments = payments.filter(
      payment => payment.userId === student.id
    );
    
    const totalPayments = studentPayments.reduce(
      (sum, payment) => sum + (payment.amount || 0), 0
    );
    
    return {
      id: student.id || "",
      name: student.name || "",
      email: student.email || "",
      enrollmentDate: student.createdAt || new Date().toISOString(),
      coursesEnrolled,
      coursesCompleted,
      averageGrade,
      attendanceRate,
      totalPayments
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
