// features/classes/types/classes-types.ts
import type { AuthCourse } from "@/features/auth-course/types/auth-course-interface"; // Reuse if possible

// You might need a specific view model for the admin table
export interface AdminClassView {
	id: string; // Class ID (not course ID)
	courseTitle: string;
	teacherName?: string;
	teacherId?: string;
	studentCount: number;
	status: "active" | "inactive" | "upcoming" | "archived"; // Example statuses
	startDate?: string; // ISO String
	endDate?: string; // ISO String
	// Add other relevant fields for the admin table
}

export interface ClassesState {
	myClasses: AuthCourse[]; // For student/teacher (reuse AuthCourse?)
	allClasses: AdminClassView[]; // For admin view
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
	// Add pagination state for admin if needed
	adminPagination: {
		currentPage: number;
		totalPages: number;
		totalClasses: number;
		limit: number;
	} | null;
}
