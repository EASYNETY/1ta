// features/classes/types/classes-types.ts (Example - Ensure it has needed fields)
export interface AdminClassView {
	id: string;
	courseTitle: string;
	courseId?: string; // Add if needed to link back
	teacherName?: string;
	teacherId?: string; // Important for assignment
	studentCount: number;
	status: "active" | "upcoming" | "inactive" | "archived" | string; // Make status flexible
	startDate?: string; // ISO String
	endDate?: string; // ISO String
	description?: string; // Add description if needed
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

export type CourseClassOption = {
	id: string; // This ID should likely be a unique identifier for the class *instance* or *session* 	// courseId?: string;
	courseName: string;
	sessionName: string; // e.g., "Morning", "Afternoon", "Batch A"
};
