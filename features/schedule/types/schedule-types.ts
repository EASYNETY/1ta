// features/schedule/types/schedule-types.ts

export type ScheduleEventType =
	| "lecture"
	| "lab"
	| "exam"
	| "office-hours"
	| "meeting"
	| "other";

export interface ScheduleEvent {
	id: string;
	title: string; // Event specific title (e.g., "Midterm Exam")
	courseId?: string; // Link to the course if applicable
	course_id?: string; // Snake case version
	courseSlug?: string; // Link to the course if applicable
	course_slug?: string; // Snake case version
	courseTitle?: string; // Display name of the course
	course_title?: string; // Snake case version
	classId?: string; // Link to the specific class instance if applicable
	class_id?: string; // Snake case version
	startTime?: string; // ISO Date string
	start_time?: string; // Snake case version
	endTime?: string; // ISO Date string
	end_time?: string; // Snake case version
	type: ScheduleEventType;
	location?: string; // Physical room or 'Virtual Classroom'
	instructorId?: string;
	instructor_id?: string; // Snake case version
	instructor?: string; // Display name
	meetingLink?: string; // Optional link for virtual events
	meeting_link?: string; // Snake case version
	description?: string;
	attendees?: string[]; // Optional list of student/user IDs expected
	// Additional fields from API response
	start_time_formatted?: string;
	end_time_formatted?: string;
}

// State for the schedule slice
export interface ScheduleState {
	// Existing state for the calendar/timetable view
	events: ScheduleEvent[]; // Events for the current view period (e.g., week)
	status: "idle" | "loading" | "succeeded" | "failed"; // Status for fetching view-specific events
	error: string | null;
	viewStartDate: string; // ISO string for the start of the current view (e.g., week start)

	// --- NEW State for CRUD and Management ---
	/** Holds all events fetched for the management table view */
	allEvents: ScheduleEvent[];
	/** Holds the single event being viewed or edited */
	currentScheduleEvent: ScheduleEvent | null;
	/** Tracks the status of CUD operations (Create, Update, Delete) */
	operationStatus: "idle" | "loading" | "succeeded" | "failed";
	/** Error specific to CUD operations */
	operationError: string | null; // Use a separate error field for clarity
	/** Pagination state for the management table (optional) */
	pagination: {
		currentPage: number;
		totalPages: number;
		totalEvents: number;
		limit: number;
	} | null;
	// --- End NEW State ---
}

export interface CreateScheduleEventPayload {
	title: string;
	courseId?: string;
	classId?: string;
	startTime: string; // ISO Date string
	endTime: string; // ISO Date string
	type: ScheduleEventType;
	location?: string; // Physical room or 'Virtual Classroom'
	instructorId?: string;
	meetingLink?: string; // Optional link for virtual events
	description?: string;
	attendees?: string[]; // Optional list of student/user IDs expected
}
export interface UpdateScheduleEventPayload {
	id: string; // Event ID
	title?: string;
	courseId?: string;
	classId?: string;
	startTime?: string; // ISO Date string
	endTime?: string; // ISO Date string
	type?: ScheduleEventType;
	location?: string; // Physical room or 'Virtual Classroom'
	instructorId?: string;
	meetingLink?: string; // Optional link for virtual events
	description?: string;
	attendees?: string[]; // Optional list of student/user IDs expected
}
