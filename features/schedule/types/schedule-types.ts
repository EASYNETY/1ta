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
	courseTitle?: string; // Display name of the course
	classId?: string; // Link to the specific class instance if applicable
	startTime: string; // ISO Date string
	endTime: string; // ISO Date string
	type: ScheduleEventType;
	location?: string; // Physical room or 'Virtual Classroom'
	instructorId?: string;
	instructor?: string; // Display name
	meetingLink?: string; // Optional link for virtual events
	description?: string;
	attendees?: string[]; // Optional list of student/user IDs expected
}

// State for the schedule slice
export interface ScheduleState {
	events: ScheduleEvent[];
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
	viewStartDate: string; // ISO string for the start of the current view (e.g., week start)
}
