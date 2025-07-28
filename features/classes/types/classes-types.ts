// features/classes/types/classes-types.ts

/**
 * Represents a single class/session object as returned by the admin API.
 * This is the primary data structure for a class in the system.
 */
export interface CourseClass {
	id: string;
	name: string; // The primary name of the class, e.g., "Power BI - Morning Session"
	courseTitle?: string; // Often redundant with `name` but kept for compatibility.

	// --- Relationships ---
	courseId?: string; // The ID of the course this class belongs to
	course_id?: string; // Backend snake_case version
	teacherId?: string; // The ID of the assigned teacher/facilitator
	teacher_id?: string; // Backend snake_case version

	// --- Nested Objects for Detailed Info ---
	course?: {
		id: string;
		name: string;
		description?: string;
	};
	teacher?: {
		id: string;
		name: string;
		email?: string;
	};
	teacherName?: string; // A denormalized field for quick display

	// --- Capacity & Enrolment ---
	studentCount?: number; // Calculated field for current enrolment
	max_students?: number; // Backend max capacity
	maxStudents?: number; // camelCase version
	enroled_students_count?: number; // Backend current enrolment
	enroledStudentsCount?: number; // camelCase version

	// --- Status & Dates ---
	status:
		| "active"
		| "upcoming"
		| "inactive"
		| "archived"
		| "full"
		| "cancelled"
		| string;
	isActive?: number | boolean; // Can be 1/0 from DB
	startDate?: string;
	start_date?: string; // Backend snake_case
	endDate?: string;
	end_date?: string; // Backend snake_case

	// --- Details ---
	description?: string;
	schedule?: {
		days?: string[];
		time?: string;
		duration?: string;
	};
	location?: string;

	// --- Metadata & Timestamps ---
	metadata?: any;
	createdAt?: string;
	created_at?: string; // Backend snake_case
	updatedAt?: string;
	updated_at?: string; // Backend snake_case
}

// Alias `AdminClassView` to `CourseClass` for clarity and future-proofing.
export type AdminClassView = CourseClass;

// --- Other existing types ---

export interface WaitlistEntry {
	id: string;
	classId: string;
	courseId: string;
	userId?: string;
	email: string;
	phone?: string;
	notifyEmail: boolean;
	notifySMS: boolean;
	createdAt: string;
	status: "pending" | "notified" | "enroled" | "expired";
}

// Simple option type for dropdown selection, derived from a CourseClass object.
export type CourseClassOption = {
	id: string;
	courseName: string;
	sessionName: string; // e.g., "Morning", "Afternoon", "Batch A"
	courseId: string;
};

// Full class options response from backend for creating/editing a class
export interface ClassOptionsResponse {
	success: boolean;
	data: {
		classTypes: Array<{ id: string; name: string }>;
		locations: Array<{ id: string; name: string }>;
		instructors: Array<{ id: string; name: string }>;
		courses: Array<{ id: string; name: string }>;
		timeSlots: Array<{ id: string; name: string }>;
	};
}

// --- Redux State Shape ---

export interface ClassesState {
	myClasses: any[]; // Use a specific type e.g., StudentClassView[]
	allClasses: CourseClass[]; // Use the new, correct type
	currentClass: CourseClass | null; // Use the new, correct type

	status: "idle" | "loading" | "succeeded" | "failed";
	operationStatus: "idle" | "loading" | "succeeded" | "failed"; // For CUD operations
	error: string | null;

	// For fetching the options needed to CREATE a new class
	courseClassOptions: ClassOptionsResponse["data"] | null;
	courseClassOptionsStatus: "idle" | "loading" | "succeeded" | "failed";
	courseClassOptionsError: string | null;

	adminPagination: {
		currentPage: number;
		limit: number;
		totalClasses: number;
		totalPages: number;
	} | null;

	waitlist: WaitlistEntry[];
	waitlistStatus: "idle" | "loading" | "succeeded" | "failed";
	waitlistError: string | null;
}
