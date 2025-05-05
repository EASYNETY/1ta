// features/grades/types/grade-types.ts

export type GradeStatus = "pending" | "published" | "archived";
export type GradeItemType =
	| "assignment"
	| "quiz"
	| "exam"
	| "project"
	| "participation"
	| "other";
export type GradeScale = "percentage" | "letter" | "points" | "pass_fail";

/**
 * Represents a grade item (assignment, quiz, exam, etc.) created by a teacher
 */
export interface GradeItem {
	id: string;
	title: string;
	description?: string | null;
	courseId: string;
	courseTitle?: string;
	classId?: string | null;
	dueDate?: string | null; // ISO 8601 string
	pointsPossible: number;
	weight: number; // Weight in the overall course grade (e.g., 0.15 for 15%)
	type: GradeItemType;
	status: GradeStatus;
	gradeScale: GradeScale;
	createdAt: string;
	updatedAt: string;
	createdBy: string; // User ID of creator (teacher/admin)
}

/**
 * Represents a student's grade for a specific grade item
 */
export interface StudentGrade {
	id: string;
	gradeItemId: string; // Link to the GradeItem
	studentId: string; // Link to the StudentUser
	studentName?: string; // Denormalized for display
	points: number; // Actual points earned
	percentage?: number; // Calculated percentage
	letterGrade?: string | null; // A, B, C, etc. (if applicable)
	feedback?: string | null; // Teacher's comments
	status: "draft" | "published"; // Whether the grade is visible to students
	gradedAt: string; // ISO 8601 string
	gradedBy: string; // Teacher who assigned the grade
	updatedAt: string;
}

/**
 * Represents a course grade calculation
 */
export interface CourseGrade {
	id: string;
	courseId: string;
	courseTitle?: string;
	studentId: string;
	studentName?: string;
	overallPercentage: number;
	letterGrade?: string | null;
	gradeItems: {
		categoryName: GradeItemType;
		weight: number;
		average: number;
		items: Array<{
			id: string;
			title: string;
			points: number;
			pointsPossible: number;
			percentage: number;
			weight: number;
		}>;
	}[];
	status: "draft" | "published" | "finalized";
	updatedAt: string;
}

// --- Additional types for Teacher/Admin views ---

/** Represents a grade item from a teacher's perspective */
export interface TeacherGradeItemView extends GradeItem {
	totalGraded: number; // Count of students who have been graded
	averageScore: number; // Average score across all students
	highestScore: number; // Highest score achieved
	lowestScore: number; // Lowest score achieved
	totalStudentsInClass?: number; // Total students expected to be graded
}

/** Represents a grade item from a student's perspective */
export interface StudentGradeItemView extends GradeItem {
	grade?: StudentGrade | null; // The student's specific grade (if graded)
}

// --- State shape for the Redux slice ---
export interface GradeState {
	gradeItems: GradeItem[]; // Holds list for teacher/admin management view
	studentGradeItems: StudentGradeItemView[]; // Holds list for student dashboard view
	currentGradeItem:
		| GradeItem
		| TeacherGradeItemView
		| StudentGradeItemView
		| null; // For view/edit
	studentGrades: StudentGrade[]; // Grades for a specific grade item (teacher view)
	currentGrade: StudentGrade | null; // Specific student grade being viewed/edited
	courseGrades: CourseGrade[]; // Course grades for students
	currentCourseGrade: CourseGrade | null; // Specific course grade being viewed
	status: "idle" | "loading" | "succeeded" | "failed"; // For fetching lists
	operationStatus: "idle" | "loading" | "succeeded" | "failed"; // For CUD operations
	error: string | null;
}

// --- Payload Types ---

/** Payload for creating a new grade item */
export interface CreateGradeItemPayload {
	/** The core grade item data */
	gradeItem: Omit<
		GradeItem,
		"id" | "createdAt" | "updatedAt" | "createdBy" | "courseTitle"
	> & { createdBy: string };
}

/** Payload for updating an existing grade item */
export interface UpdateGradeItemPayload {
	/** ID of the grade item to update */
	gradeItemId: string;
	/** Partial grade item data containing only the fields to be changed */
	gradeItem: Partial<
		Omit<
			GradeItem,
			"id" | "createdAt" | "updatedAt" | "createdBy" | "courseTitle"
		>
	>;
}

/** Payload for assigning a grade to a student */
export interface AssignGradePayload {
	/** ID of the grade item */
	gradeItemId: string;
	/** ID of the student being graded */
	studentId: string;
	/** Points awarded */
	points: number;
	/** Optional feedback comments */
	feedback?: string | null;
	/** Whether to publish the grade immediately */
	status: "draft" | "published";
	/** ID of the teacher assigning the grade */
	gradedBy: string;
}

/** Payload for updating an existing grade */
export interface UpdateGradePayload {
	/** ID of the grade to update */
	gradeId: string;
	/** Updated grade data */
	grade: Partial<
		Omit<
			StudentGrade,
			"id" | "gradeItemId" | "studentId" | "gradedAt" | "updatedAt"
		>
	>;
}

/** Payload for calculating course grades */
export interface CalculateCourseGradesPayload {
	/** ID of the course */
	courseId: string;
	/** Optional class ID if calculating for a specific class */
	classId?: string;
	/** Whether to publish the grades immediately */
	publishImmediately?: boolean;
}

// --- End Payload Types ---
