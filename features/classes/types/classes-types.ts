// features/classes/types/classes-types.ts
export interface AdminClassView {
	id: string;
	name?: string; // Backend uses 'name' instead of 'courseTitle'
	courseTitle?: string; // Frontend uses 'courseTitle'
	courseId?: string; // Add if needed to link back
	course_id?: string; // Backend might use snake_case
	teacherName?: string;
	teacherId?: string; // Important for assignment
	teacher_id?: string; // Backend might use snake_case

	// Enrollment and capacity fields
	studentCount?: number; // Frontend calculated field
	max_students?: number; // Maximum number of students allowed
	maxStudents?: number; // camelCase version
	max_slots?: number; // Maximum slots available
	maxSlots?: number; // camelCase version
	available_slots?: number; // Available slots remaining
	availableSlots?: number; // camelCase version
	enrolled_students_count?: number; // Current number of enrolled students
	enrolledStudentsCount?: number; // camelCase version

	// Status fields
	status: "active" | "upcoming" | "inactive" | "archived" | "full" | "cancelled" | string; // Make status flexible
	isActive?: number | boolean; // Can be 1/0 or true/false

	// Date fields
	startDate?: string; // Frontend format
	endDate?: string; // Frontend format
	start_date?: string; // Backend format
	end_date?: string; // Backend format

	// Schedule and location
	description?: string; // Class description
	schedule?: {
		days?: string[];
		time?: string;
		duration?: string;
	}; // Schedule object with days, time, and duration
	location?: string;

	// Course relationship
	course?: {
		id: string;
		name: string;
		description?: string;
		category?: string;
		is_iso_certification?: boolean;
		isIsoCertification?: boolean;
		available_for_enrollment?: boolean;
		availableForEnrollment?: boolean;
		image_url?: string;
		imageUrl?: string;
		icon_url?: string;
		iconUrl?: string;
	};

	// Teacher relationship
	teacher?: {
		id: string;
		name: string;
		email?: string;
		avatar_url?: string;
		avatarUrl?: string;
	};

	// Metadata and timestamps
	metadata?: any;
	createdAt?: string;
	updatedAt?: string;
	created_at?: string;
	updated_at?: string;
}

export interface ClassesState {
	myClasses: any[]; // Use a specific type e.g., StudentClassView[]
	allClasses: AdminClassView[];
	currentClass: AdminClassView | null; // Add state for viewing/editing a single class
	status: "idle" | "loading" | "succeeded" | "failed";
	operationStatus: "idle" | "loading" | "succeeded" | "failed"; // For CUD operations
	error: string | null;
	courseClassOptions: CourseClassOption[]; // << NEW
	courseClassOptionsStatus: "idle" | "loading" | "succeeded" | "failed"; // << NEW
	courseClassOptionsError: string | null; // << NEW
	adminPagination: {
		// Keep pagination
		currentPage: number;
		limit: number;
		totalClasses: number;
		totalPages: number;
	} | null;
}

// Simple option type for dropdown selection
export type CourseClassOption = {
	id: string;
	courseName: string;
	sessionName: string; // e.g., "Morning", "Afternoon", "Batch A"
};

// Full class options response from backend
export interface ClassOptionsResponse {
	success: boolean;
	data: {
		classTypes: Array<{
			id: string;
			name: string;
		}>;
		locations: Array<{
			id: string;
			name: string;
		}>;
		instructors: Array<{
			id: string;
			name: string;
		}>;
		courses: Array<{
			id: string;
			name: string;
		}>;
		timeSlots: Array<{
			id: string;
			name: string;
		}>;
	};
};
