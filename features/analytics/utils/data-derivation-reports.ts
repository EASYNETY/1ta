// features/analytics/utils/data-derivation-reports.ts
import { RootState } from "@/store";
import { 
  ReportFilter, 
  StudentBiodataFilter 
} from "../types/analytics-types";
import { 
  StudentBiodataReport, 
  CourseReport, 
  PaymentReport, 
  AttendanceReport,
  ReportResponse
} from "../types/report-types";

/**
 * Derive student biodata reports from the Redux store
 * @param state The Redux store state
 * @param filter Student biodata filter options
 * @returns Student biodata reports
 */
export function deriveStudentBiodataReports(
  state: RootState, 
  filter: StudentBiodataFilter
): ReportResponse<StudentBiodataReport> {
  // Default empty values for safety
  const students = state.auth?.users?.filter(user => user.role === "student") || [];
  const enrollments = state.auth_courses?.enrollments || [];
  const corporates = state.corporate?.corporates || [];
  
  // Apply filters
  let filteredStudents = students;
  
  if (filter.gender) {
    filteredStudents = filteredStudents.filter(student => 
      student.gender?.toLowerCase() === filter.gender?.toLowerCase()
    );
  }
  
  if (filter.ageRange) {
    filteredStudents = filteredStudents.filter(student => {
      const birthDate = student.birthDate ? new Date(student.birthDate) : null;
      if (!birthDate) return false;
      
      const now = new Date();
      const age = now.getFullYear() - birthDate.getFullYear();
      
      switch (filter.ageRange) {
        case "under18": return age < 18;
        case "18-24": return age >= 18 && age <= 24;
        case "25-34": return age >= 25 && age <= 34;
        case "35-44": return age >= 35 && age <= 44;
        case "45plus": return age >= 45;
        default: return true;
      }
    });
  }
  
  if (filter.accountType) {
    filteredStudents = filteredStudents.filter(student => {
      if (filter.accountType === "corporate") return !!student.corporateId;
      if (filter.accountType === "individual") return !student.corporateId;
      return true;
    });
  }
  
  if (filter.corporateId) {
    filteredStudents = filteredStudents.filter(student => 
      student.corporateId === filter.corporateId
    );
  }
  
  if (filter.location) {
    filteredStudents = filteredStudents.filter(student => 
      student.location?.toLowerCase() === filter.location?.toLowerCase()
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
  
  if (filter.completionRateMin !== undefined) {
    filteredStudents = filteredStudents.filter(student => {
      const studentEnrollments = enrollments.filter(
        enrollment => enrollment.studentId === student.id
      );
      
      if (studentEnrollments.length === 0) return false;
      
      let totalProgress = 0;
      studentEnrollments.forEach(enrollment => {
        totalProgress += enrollment.progress || 0;
      });
      
      const avgProgress = totalProgress / studentEnrollments.length;
      return avgProgress >= filter.completionRateMin!;
    });
  }
  
  if (filter.completionRateMax !== undefined) {
    filteredStudents = filteredStudents.filter(student => {
      const studentEnrollments = enrollments.filter(
        enrollment => enrollment.studentId === student.id
      );
      
      if (studentEnrollments.length === 0) return false;
      
      let totalProgress = 0;
      studentEnrollments.forEach(enrollment => {
        totalProgress += enrollment.progress || 0;
      });
      
      const avgProgress = totalProgress / studentEnrollments.length;
      return avgProgress <= filter.completionRateMax!;
    });
  }
  
  // Map students to reports
  const reports: StudentBiodataReport[] = filteredStudents.map(student => {
    // Calculate completion rate
    const studentEnrollments = enrollments.filter(
      enrollment => enrollment.studentId === student.id
    );
    
    let totalProgress = 0;
    studentEnrollments.forEach(enrollment => {
      totalProgress += enrollment.progress || 0;
    });
    
    const completionRate = studentEnrollments.length > 0 
      ? Math.round(totalProgress / studentEnrollments.length) 
      : 0;
    
    // Get corporate name
    let corporateName = "";
    if (student.corporateId) {
      const corporate = corporates.find(corp => corp.id === student.corporateId);
      corporateName = corporate?.name || "";
    }
    
    // Calculate age
    let age: number | undefined = undefined;
    if (student.birthDate) {
      const birthDate = new Date(student.birthDate);
      const now = new Date();
      age = now.getFullYear() - birthDate.getFullYear();
    }
    
    return {
      id: student.id || "",
      name: student.name || "",
      email: student.email || "",
      gender: student.gender,
      age,
      location: student.location,
      accountType: student.corporateId ? "corporate" : "individual",
      corporateId: student.corporateId,
      corporateName,
      enrollmentDate: student.createdAt || new Date().toISOString(),
      completionRate
    };
  });
  
  // Apply pagination
  const page = 1;
  const limit = 10;
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
 * Derive course reports from the Redux store
 * @param state The Redux store state
 * @param filter Report filter options
 * @returns Course reports
 */
export function deriveCourseReports(
  state: RootState, 
  filter: ReportFilter
): ReportResponse<CourseReport> {
  // Default empty values for safety
  const courses = state.courses?.courses || [];
  const enrollments = state.auth_courses?.enrollments || [];
  const payments = state.paymentHistory?.payments || [];
  
  // Apply filters
  let filteredCourses = courses;
  
  if (filter.searchTerm) {
    const searchTerm = filter.searchTerm.toLowerCase();
    filteredCourses = filteredCourses.filter(course => 
      course.title?.toLowerCase().includes(searchTerm) || 
      course.description?.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filter.startDate) {
    const startDate = new Date(filter.startDate);
    filteredCourses = filteredCourses.filter(course => {
      const createdAt = course.createdAt ? new Date(course.createdAt) : null;
      return createdAt ? createdAt >= startDate : true;
    });
  }
  
  if (filter.endDate) {
    const endDate = new Date(filter.endDate);
    filteredCourses = filteredCourses.filter(course => {
      const createdAt = course.createdAt ? new Date(course.createdAt) : null;
      return createdAt ? createdAt <= endDate : true;
    });
  }
  
  if (filter.status) {
    filteredCourses = filteredCourses.filter(course => 
      course.status === filter.status
    );
  }
  
  // Map courses to reports
  const reports: CourseReport[] = filteredCourses.map(course => {
    // Get course enrollments
    const courseEnrollments = enrollments.filter(
      enrollment => enrollment.courseId === course.id
    );
    
    // Calculate enrollment count
    const enrollmentCount = courseEnrollments.length;
    
    // Calculate completion rate
    let totalProgress = 0;
    courseEnrollments.forEach(enrollment => {
      totalProgress += enrollment.progress || 0;
    });
    
    const completionRate = enrollmentCount > 0 
      ? Math.round(totalProgress / enrollmentCount) 
      : 0;
    
    // Calculate average grade
    let totalGrade = 0;
    let gradeCount = 0;
    
    courseEnrollments.forEach(enrollment => {
      if (enrollment.grade && enrollment.grade > 0) {
        totalGrade += enrollment.grade;
        gradeCount++;
      }
    });
    
    const averageGrade = gradeCount > 0 ? Math.round(totalGrade / gradeCount) : 0;
    
    // Calculate revenue
    const coursePayments = payments.filter(payment => 
      payment.courseId === course.id
    );
    
    const revenue = coursePayments.reduce(
      (sum, payment) => sum + (payment.amount || 0), 0
    );
    
    return {
      id: course.id || "",
      title: course.title || "",
      category: course.category || "Uncategorized",
      enrollmentCount,
      completionRate,
      averageGrade,
      revenue
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
