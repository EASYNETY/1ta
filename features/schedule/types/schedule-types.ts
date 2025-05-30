// features/schedule/types/schedule-types.ts

export type ScheduleEventType =
	| "lecture"
	| "lab"
	| "exam"
	| "office-hours"
	| "meeting"
	| "other";

// Interface for the nested 'course' object in the backend response
export interface NestedCourseInfo {
	id: string | null; // Can be null if no course linked
	name: string | null;
	description: string | null;
	image_url: string | null;
}

// Interface for the nested 'class' object in the backend response
export interface NestedClassInfo {
	id: string; // Should always have an ID if event is linked to a class
	name: string | null;
	description: string | null;
}

// Interface for the nested 'instructorUser' object
export interface NestedInstructorInfo {
	id: string | null; // Can be null if no instructor assigned
	name: string | null;
	email: string | null;
	avatarUrl: string | null; // Backend seems to use avatarUrl
}

// This interface represents the data structure as returned by the backend's GET /schedule-events/:id
export interface ScheduleEvent {
	id: string;
	title: string;
	course_id: string | null; // Direct foreign key
	class_id: string | null; // Direct foreign key
	start_time: string; // ISO Date string
	end_time: string; // ISO Date string
	course_slug: string | null; // Denormalized from related course
	course_title: string | null; // Denormalized from related course (or course_name)
	type: ScheduleEventType;
	location: string | null;
	instructor_id: string | null; // Direct foreign key
	instructor: string | null; // Denormalized instructor name (top level)
	meeting_link: string | null;
	description: string | null;
	attendees: string[] | null; // Assuming it's an array of IDs

	created_at: string;
	updated_at: string;

	// Additional denormalized fields from backend response
	course_name?: string | null; // This seems to be another course name field
	course_description?: string | null;
	course_image_url?: string | null;
	class_name?: string | null; // Denormalized from related class
	class_description?: string | null;
	instructor_name?: string | null; // Denormalized instructor name (seems redundant with 'instructor')
	instructor_email?: string | null;
	instructor_avatar_url?: string | null;

	// Nested objects from backend response
	course?: NestedCourseInfo;
	class?: NestedClassInfo;
	instructorUser?: NestedInstructorInfo; // Matches 'instructorUser' in response

	// Formatted times (usually for display, not for state persistence if derived)
	start_time_formatted?: string;
	end_time_formatted?: string;

	// --- Frontend specific or transitional fields (optional, for internal use if needed) ---
	// These are camelCase versions if you prefer using them internally in components
	// and map to/from snake_case at API boundaries (thunks).
	// If you choose this, ensure your mapping functions (like mapEventToForm) use these.
	// For simplicity with direct backend alignment, these can be omitted if thunks handle all mapping.
	// courseId?: string;
	// classId?: string;
	// startTime?: string;
	// endTime?: string;
	// courseSlug?: string;
	// courseTitle?: string; // or courseName
	// instructorId?: string;
	// meetingLink?: string;
}

export interface ScheduleState {
	events: ScheduleEvent[];
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
	viewStartDate: string;
	allEvents: ScheduleEvent[];
	currentScheduleEvent: ScheduleEvent | null;
	operationStatus: "idle" | "loading" | "succeeded" | "failed";
	operationError: string | null;
	pagination: {
		currentPage: number;
		totalPages: number;
		totalEvents: number;
		limit: number;
	} | null;
}

// Payload for CREATING an event (fields sent TO the backend)
// Should use snake_case as per backend expectation
export interface CreateScheduleEventPayload {
	title: string;
	type: ScheduleEventType;
	start_time: string; // ISO Date string
	end_time: string; // ISO Date string
	class_id?: string; // Must be present if event is tied to a class
	course_id?: string; // The ID of the course this event is associated with (often derived from class_id)
	course_slug?: string; // Slug of the course
	course_title?: string; // Title of the course (or course_name if backend prefers)
	instructor_id?: string;
	location?: string;
	meeting_link?: string;
	description?: string;
	attendees?: string[];
}

// Payload for UPDATING an event (fields sent TO the backend)
// Should use snake_case
export interface UpdateScheduleEventPayload {
	id: string; // Event ID (usually in URL path, but good to have in type)
	title?: string;
	type?: ScheduleEventType;
	start_time?: string;
	end_time?: string;
	class_id?: string | null; // Allow null to unset
	course_id?: string | null;
	course_slug?: string | null;
	course_title?: string | null; // or course_name
	instructor_id?: string | null;
	location?: string | null;
	meeting_link?: string | null;
	description?: string | null;
	attendees?: string[] | null;
}
