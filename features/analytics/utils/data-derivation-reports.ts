// features/analytics/utils/data-derivation-reports.ts
import { RootState } from "@/store";
import {
  ReportFilter,
  StudentBiodataFilter
} from "../types/analytics-types";
import {
  StudentBiodataReport,
  CourseReport,
  ReportResponse
} from "../types/report-types";
import { StudentUser } from "@/types/user.types";
import { Course } from "@/data/mock-course-data";

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
  const managedStudents = state.corporate?.managedStudents || [];

  // Define enrolment type
  interface Enrolment {
    studentId: string;
    courseId: string;
    progress?: number;
    grade?: number;
  }

  // Create a mock enrolments array if it doesn't exist in the state
  const enrolments: Enrolment[] = [];

  // Apply filters
  let filteredStudents = students as StudentUser[];

  if (filter.gender) {
    filteredStudents = filteredStudents.filter(student => {
      // Use type assertion since gender might be added by the backend
      const gender = (student as any).gender;
      return gender?.toLowerCase() === filter.gender?.toLowerCase();
    });
  }

  if (filter.ageRange) {
    filteredStudents = filteredStudents.filter(student => {
      // Use type assertion since birthDate might be added by the backend
      const birthDate = (student as any).birthDate ? new Date((student as any).birthDate) : null;
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
    filteredStudents = filteredStudents.filter(student => {
      // Use type assertion since location might be added by the backend
      const location = (student as any).location;
      return location?.toLowerCase() === filter.location?.toLowerCase();
    });
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
      const studentEnrolments = enrolments.filter(
        enrolment => enrolment.studentId === student.id
      );

      if (studentEnrolments.length === 0) return false;

      let totalProgress = 0;
      studentEnrolments.forEach(enrolment => {
        totalProgress += enrolment.progress || 0;
      });

      const avgProgress = totalProgress / studentEnrolments.length;
      return avgProgress >= filter.completionRateMin!;
    });
  }

  if (filter.completionRateMax !== undefined) {
    filteredStudents = filteredStudents.filter(student => {
      const studentEnrolments = enrolments.filter(
        enrolment => enrolment.studentId === student.id
      );

      if (studentEnrolments.length === 0) return false;

      let totalProgress = 0;
      studentEnrolments.forEach(enrolment => {
        totalProgress += enrolment.progress || 0;
      });

      const avgProgress = totalProgress / studentEnrolments.length;
      return avgProgress <= filter.completionRateMax!;
    });
  }

  // Map students to reports
  const reports: StudentBiodataReport[] = filteredStudents.map(student => {
    // Calculate completion rate
    const studentEnrolments = enrolments.filter(
      (enrolment: Enrolment) => enrolment.studentId === student.id
    );

    let totalProgress = 0;
    studentEnrolments.forEach((enrolment: Enrolment) => {
      totalProgress += enrolment.progress || 0;
    });

    const completionRate = studentEnrolments.length > 0
      ? Math.round(totalProgress / studentEnrolments.length)
      : 0;

    // Get corporate name
    let corporateName = "";
    if (student.corporateId) {
      const corporate = managedStudents.find((corp: StudentUser) => corp.id === student.corporateId);
      corporateName = corporate?.name || "";
    }

    // Calculate age
    let age: number | undefined = undefined;
    if ((student as any).birthDate) {
      const birthDate = new Date((student as any).birthDate);
      const now = new Date();
      age = now.getFullYear() - birthDate.getFullYear();
    }

    return {
      id: student.id || "",
      name: student.name || "",
      email: student.email || "",
      gender: (student as any).gender,
      dateOfBirth: (student as any).birthDate,
      age,
      location: (student as any).location,
      accountType: student.corporateId ? "corporate" : "individual",
      corporateId: student.corporateId || undefined,
      corporateName,
      enrolmentDate: student.createdAt || new Date().toISOString(),
      coursesEnroled: studentEnrolments.length,
      coursesCompleted: studentEnrolments.filter((e: Enrolment) => (e.progress || 0) >= 100).length,
      completionRate,
      lastActive: student.lastLogin || new Date().toISOString(),
      barcodeId: (student as any).barcodeId
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
  const courses = state.courses?.allCourses || [];

  // Define enrolment type
  interface Enrolment {
    studentId: string;
    courseId: string;
    progress?: number;
    grade?: number;
  }

  // Create mock enrolments array
  const enrolments: Enrolment[] = [];

  // Create mock payments array
  interface Payment {
    id: string;
    courseId?: string;
    amount: number;
  }

  const payments: Payment[] = state.paymentHistory?.allPayments || state.paymentHistory?.myPayments || [];

  // Apply filters
  let filteredCourses = courses as Course[];

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
      // Use type assertion since createdAt might be added by the backend
      const createdAt = (course as any).createdAt ? new Date((course as any).createdAt) : null;
      return createdAt ? createdAt >= startDate : true;
    });
  }

  if (filter.endDate) {
    const endDate = new Date(filter.endDate);
    filteredCourses = filteredCourses.filter(course => {
      // Use type assertion since createdAt might be added by the backend
      const createdAt = (course as any).createdAt ? new Date((course as any).createdAt) : null;
      return createdAt ? createdAt <= endDate : true;
    });
  }

  if (filter.status) {
    filteredCourses = filteredCourses.filter(course =>
      // Use type assertion since status might be added by the backend
      (course as any).status === filter.status
    );
  }

  // Map courses to reports
  const reports: CourseReport[] = filteredCourses.map(course => {
    // Get course enrolments
    const courseEnrolments = enrolments.filter(
      (enrolment: Enrolment) => enrolment.courseId === course.id
    );

    // Calculate enrolment count
    const enrolmentCount = courseEnrolments.length;

    // Calculate completion rate
    let totalProgress = 0;
    courseEnrolments.forEach((enrolment: Enrolment) => {
      totalProgress += enrolment.progress || 0;
    });

    const completionRate = enrolmentCount > 0
      ? Math.round(totalProgress / enrolmentCount)
      : 0;

    // Calculate average grade
    let totalGrade = 0;
    let gradeCount = 0;

    courseEnrolments.forEach((enrolment: Enrolment) => {
      if (enrolment.grade && enrolment.grade > 0) {
        totalGrade += enrolment.grade;
        gradeCount++;
      }
    });

    const averageGrade = gradeCount > 0 ? Math.round(totalGrade / gradeCount) : 0;

    // Calculate revenue
    const coursePayments = payments.filter((payment: Payment) =>
      payment.courseId === course.id
    );

    const revenue = coursePayments.reduce(
      (sum: number, payment: Payment) => sum + (payment.amount || 0), 0
    );

    return {
      id: course.id || "",
      title: course.title || "",
      category: course.category || "Uncategorized",
      enrolmentCount,
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
