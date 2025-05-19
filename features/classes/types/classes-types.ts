// features/classes/types/classes-types.ts (Example - Ensure it has needed fields)
export interface AdminClassView {
	id: string;
	name?: string; // Backend uses 'name' instead of 'courseTitle'
	courseTitle?: string; // Frontend uses 'courseTitle'
	courseId?: string; // Add if needed to link back
	course_id?: string; // Backend might use snake_case
	teacherName?: string;
	teacherId?: string; // Important for assignment
	teacher_id?: string; // Backend might use snake_case
	studentCount?: number; // Frontend calculated field
	max_students?: number; // Backend field
	status: "active" | "upcoming" | "inactive" | "archived" | string; // Make status flexible
	is_active?: boolean; // Backend might use this instead of status
	startDate?: string; // Frontend format
	endDate?: string; // Frontend format
	start_date?: string; // Backend format
	end_date?: string; // Backend format
	description?: string; // Add description if needed
	schedule?: any; // Backend might return schedule object
	location?: string;
	metadata?: any;
	createdAt?: string;
	updatedAt?: string;
	// Add any other fields managed for a class
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
