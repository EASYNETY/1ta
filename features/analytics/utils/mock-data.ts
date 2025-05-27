// features/analytics/utils/mock-data.ts
import type { DashboardStats } from '../types/analytics-types';
import type { 
  StudentReport, 
  StudentBiodataReport, 
  CourseReport, 
  PaymentReport, 
  AttendanceReport,
  ReportResponse
} from '../types/report-types';
import type { StudentBiodataStats } from '../types/student-biodata-types';

/**
 * Generate mock dashboard stats
 * @returns Mock dashboard stats
 */
export function getMockDashboardStats(): DashboardStats {
  return {
    studentStats: {
      total: 256,
      active: 230,
      newThisMonth: 24,
      growthRate: 10.5,
      genderDistribution: {
        male: 140,
        female: 110,
        other: 2,
        notSpecified: 4
      },
      ageDistribution: {
        under18: 45,
        age18to24: 120,
        age25to34: 65,
        age35to44: 20,
        age45Plus: 6
      }
    },
    courseStats: {
      total: 32,
      active: 28,
      averageCompletion: 68,
      mostPopular: "Web Development Bootcamp",
      categoryDistribution: {
        "Programming": 12,
        "Design": 8,
        "Business": 6,
        "Data Science": 4,
        "Other": 2
      },
      enrolmentTrends: [
        { month: "Jan", enrolments: 45 },
        { month: "Feb", enrolments: 52 },
        { month: "Mar", enrolments: 48 },
        { month: "Apr", enrolments: 60 },
        { month: "May", enrolments: 75 },
        { month: "Jun", enrolments: 82 }
      ]
    },
    paymentStats: {
      totalRevenue: 12000000, // ₦1.2M (in kobo)
      revenueThisMonth: 2500000, // ₦250K (in kobo)
      growthRate: 15.2,
      averageOrderValue: 4500000, // ₦45K (in kobo)
      paymentMethodDistribution: {
        "Card": 180,
        "Bank Transfer": 45,
        "Cash": 10
      },
      revenueTrends: [
        { month: "Jan", revenue: 1800000 },
        { month: "Feb", revenue: 2100000 },
        { month: "Mar", revenue: 1950000 },
        { month: "Apr", revenue: 2300000 },
        { month: "May", revenue: 2200000 },
        { month: "Jun", revenue: 2500000 }
      ]
    },
    attendanceStats: {
      averageRate: 85,
      trendsData: [
        { date: "2023-01-15", rate: 82 },
        { date: "2023-02-15", rate: 84 },
        { date: "2023-03-15", rate: 80 },
        { date: "2023-04-15", rate: 86 },
        { date: "2023-05-15", rate: 88 },
        { date: "2023-06-15", rate: 85 }
      ],
      courseAttendance: [
        { courseId: "course1", courseTitle: "Web Development", attendanceRate: 88 },
        { courseId: "course2", courseTitle: "UX Design", attendanceRate: 82 },
        { courseId: "course3", courseTitle: "Data Science", attendanceRate: 85 },
        { courseId: "course4", courseTitle: "Mobile Development", attendanceRate: 79 },
        { courseId: "course5", courseTitle: "DevOps", attendanceRate: 90 }
      ]
    }
  };
}

/**
 * Generate mock student biodata stats
 * @returns Mock student biodata stats
 */
export function getMockStudentBiodataStats(): StudentBiodataStats {
  return {
    genderDistribution: {
      male: 140,
      female: 110,
      other: 2,
      notSpecified: 4
    },
    ageDistribution: {
      under18: 45,
      age18to24: 120,
      age25to34: 65,
      age35to44: 20,
      age45Plus: 6
    },
    corporateVsIndividual: {
      corporate: 85,
      individual: 171
    },
    locationDistribution: {
      "Lagos": 120,
      "Abuja": 45,
      "Port Harcourt": 30,
      "Ibadan": 25,
      "Kano": 15,
      "Other": 21
    },
    enrolmentTrends: [
      { month: "Jan", enrolments: 45 },
      { month: "Feb", enrolments: 52 },
      { month: "Mar", enrolments: 48 },
      { month: "Apr", enrolments: 60 },
      { month: "May", enrolments: 75 },
      { month: "Jun", enrolments: 82 }
    ],
    completionRates: [
      { courseId: "course1", courseTitle: "Web Development", completionRate: 78 },
      { courseId: "course2", courseTitle: "UX Design", completionRate: 82 },
      { courseId: "course3", courseTitle: "Data Science", completionRate: 65 },
      { courseId: "course4", courseTitle: "Mobile Development", completionRate: 70 },
      { courseId: "course5", courseTitle: "DevOps", completionRate: 85 }
    ]
  };
}

/**
 * Generate mock student reports
 * @param count Number of reports to generate
 * @returns Mock student reports response
 */
export function getMockStudentReports(count: number = 10): ReportResponse<StudentReport> {
  const reports: StudentReport[] = Array.from({ length: count }, (_, i) => ({
    id: `student_${i + 1}`,
    name: `Student ${i + 1}`,
    email: `student${i + 1}@example.com`,
    enrolmentDate: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    coursesEnroled: Math.floor(Math.random() * 5) + 1,
    coursesCompleted: Math.floor(Math.random() * 3),
    averageGrade: Math.floor(Math.random() * 30) + 70,
    attendanceRate: Math.floor(Math.random() * 20) + 80,
    totalPayments: (Math.floor(Math.random() * 5) + 1) * 4500000
  }));

  return {
    data: reports,
    total: 100,
    page: 1,
    limit: count,
    totalPages: Math.ceil(100 / count)
  };
}

/**
 * Generate mock student biodata reports
 * @param count Number of reports to generate
 * @returns Mock student biodata reports response
 */
export function getMockStudentBiodataReports(count: number = 10): ReportResponse<StudentBiodataReport> {
  const genders = ["Male", "Female", "Other", ""];
  const accountTypes: ("individual" | "corporate")[] = ["individual", "corporate"];
  const locations = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Other"];
  const corporateNames = ["Tech Corp", "Finance Inc", "Education Ltd", "Health Systems", "Energy Co"];

  const reports: StudentBiodataReport[] = Array.from({ length: count }, (_, i) => {
    const accountType = accountTypes[Math.floor(Math.random() * accountTypes.length)];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const birthDate = new Date(Date.now() - (Math.random() * 1000000000 * 60));
    const age = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
    
    return {
      id: `student_${i + 1}`,
      name: `Student ${i + 1}`,
      email: `student${i + 1}@example.com`,
      gender: gender || undefined,
      dateOfBirth: birthDate.toISOString(),
      age,
      location: locations[Math.floor(Math.random() * locations.length)],
      accountType,
      corporateId: accountType === "corporate" ? `corp_${Math.floor(Math.random() * 5) + 1}` : undefined,
      corporateName: accountType === "corporate" ? corporateNames[Math.floor(Math.random() * corporateNames.length)] : undefined,
      enrolmentDate: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      coursesEnroled: Math.floor(Math.random() * 5) + 1,
      coursesCompleted: Math.floor(Math.random() * 3),
      completionRate: Math.floor(Math.random() * 100),
      lastActive: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
      barcodeId: `BARCODE-${1000 + i}`
    };
  });

  return {
    data: reports,
    total: 100,
    page: 1,
    limit: count,
    totalPages: Math.ceil(100 / count)
  };
}
