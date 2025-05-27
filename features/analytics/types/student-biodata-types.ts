// features/analytics/types/student-biodata-types.ts

// Student Biodata Stats Types
export interface GenderDistribution {
  male: number;
  female: number;
  other: number;
  notSpecified: number;
}

export interface AgeDistribution {
  under18: number;
  age18to24: number;
  age25to34: number;
  age35to44: number;
  age45Plus: number;
}

export interface CorporateVsIndividual {
  corporate: number;
  individual: number;
}

export interface EnrolmentTrend {
  month: string;
  enrolments: number;
}

export interface CourseCompletionRate {
  courseId: string;
  courseTitle: string;
  completionRate: number;
}

export interface StudentBiodataStats {
  genderDistribution: GenderDistribution;
  ageDistribution: AgeDistribution;
  corporateVsIndividual: CorporateVsIndividual;
  locationDistribution: Record<string, number>; // City/State -> count
  enrolmentTrends: EnrolmentTrend[];
  completionRates: CourseCompletionRate[];
}

// Student Biodata State Types
export interface StudentBiodataState {
  stats: StudentBiodataStats;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}
