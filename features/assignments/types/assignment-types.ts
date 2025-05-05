// features/assignments/types/assignment-types.ts

export type AssignmentStatus = "draft" | "published" | "archived"; // For the assignment itself
export type SubmissionStatus = "pending" | "submitted" | "late" | "graded"; // For a student's submission

/**
 * Represents the core assignment created by a teacher/admin.
 */
export interface Assignment {
	id: string;
	title: string;
	description?: string | null; // Instructions, potentially rich text/markdown
	courseId: string; // Link to the course
	courseTitle?: string; // Denormalized for display
	classId?: string | null; // Optional: Link to a specific class instance
	dueDate: string; // ISO 8601 string
	pointsPossible: number;
	status: AssignmentStatus; // Draft, Published, Archived
	attachments?: Array<{ name: string; url: string; type: string }>; // Optional file attachments
	allowLateSubmissions: boolean;
	createdAt: string;
	updatedAt: string;
	createdBy: string; // User ID of creator (teacher/admin)
}

/**
 * Represents a student's submission for a specific assignment.
 */
export interface AssignmentSubmission {
	id: string; // Unique submission ID
	assignmentId: string; // Link to the Assignment
	studentId: string; // Link to the StudentUser
	studentName?: string; // Denormalized for display
	status: SubmissionStatus;
	submittedAt?: string | null; // ISO 8601 string when submitted
	gradedAt?: string | null; // ISO 8601 string when graded
	grade?: number | null; // Points earned
	feedback?: string | null; // Teacher's comments
	submissionFiles?: Array<{ name: string; url: string; type: string }>; // Files submitted by student
	// Optional: Teacher who graded it
	gradedBy?: string | null;
}

// --- Additional types for Teacher/Admin views ---

/** Represents an assignment from a teacher's perspective */
export interface TeacherAssignmentView extends Assignment {
	totalSubmissions: number; // Count of students who submitted (on time or late)
	gradedSubmissions: number; // Count of submissions already graded
	totalStudentsInClass?: number; // Total students expected to submit (if linked to a class)
}

/** Represents an assignment from a student's perspective */
export interface StudentAssignmentView extends Assignment {
	submission?: AssignmentSubmission | null; // The student's specific submission details (if submitted)
	// Derived status based on due date and submission status
	displayStatus: SubmissionStatus | "due_soon" | "overdue"; // Example derived status
}

// --- State shape for the Redux slice ---
export interface AssignmentState {
	assignments: Assignment[]; // Holds list for teacher/admin management view
	studentAssignments: StudentAssignmentView[]; // Holds list for student dashboard view
	currentAssignment:
		| Assignment
		| TeacherAssignmentView
		| StudentAssignmentView
		| null; // For view/edit/submit
	currentSubmissions: AssignmentSubmission[]; // Submissions for a specific assignment (teacher view)
	currentSubmission: AssignmentSubmission | null; // Specific student submission being viewed/graded
	status: "idle" | "loading" | "succeeded" | "failed"; // For fetching lists
	operationStatus: "idle" | "loading" | "succeeded" | "failed"; // For CUD operations
	error: string | null;
	// Pagination etc.
}
export interface AssignmentFilters {
	courseId?: string; // Filter by course
	classId?: string; // Filter by class
	dueDateRange?: [string, string]; // Optional: Start and end date for filtering
	status?: AssignmentStatus; // Filter by assignment status
	submissionStatus?: SubmissionStatus; // Filter by submission status
	// Add more filt
}

// --- Payload Types (REVISED based on your examples) ---

/** Payload for creating a new assignment */
export interface CreateAssignmentPayload {
	/** The core assignment data (excluding system-generated fields like id, createdAt, etc.) */
	assignment: Omit<
		Assignment,
		"id" | "createdAt" | "updatedAt" | "createdBy" | "courseTitle"
	> & { createdBy: string }; // Ensure creator ID is passed
	// Submissions are usually created separately, not with the assignment itself
	// status is part of the main assignment object above
}

/** Payload for updating an existing assignment */
export interface UpdateAssignmentPayload {
	/** ID of the assignment to update */
	assignmentId: string;
	/** Partial assignment data containing only the fields to be changed */
	assignment: Partial<
		Omit<
			Assignment,
			"id" | "createdAt" | "updatedAt" | "createdBy" | "courseTitle"
		>
	>;
}

/** Payload for a student submitting their work for an assignment */
export interface SubmitAssignmentPayload {
	/** ID of the assignment being submitted to */
	assignmentId: string;
	/** ID of the student submitting */
	studentId: string; // Backend usually gets this from the authenticated user
	/** The actual submission content (e.g., file URLs, text content) */
	submissionContent: {
		comments?: string;
		files?: Array<{ name: string; url: string; type: string }>; // Example file structure
	};
}

/** Payload for a teacher/admin grading a specific submission */
export interface GradeSubmissionPayload {
	/** ID of the specific submission record being graded */
	submissionId: string;
	/** Points awarded */
	grade: number;
	/** Optional feedback comments */
	feedback?: string | null;
	/** ID of the user performing the grading (usually from auth context) */
	graderId: string;
	// assignmentId is usually implied by the submissionId endpoint structure
}

// --- End Payload Types ---
