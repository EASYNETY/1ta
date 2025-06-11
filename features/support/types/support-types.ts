// src/features/support/types/support-types.ts

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type FeedbackType =
	| "general"
	| "bug_report"
	| "feature_request"
	| "course_feedback";
export type FeedbackStatus = "new" | "reviewed" | "actioned";

// Information needed for creating a ticket
export interface CreateTicketPayload {
	title: string;
	subject?: string; // Keeping for backward compatibility
	description: string;
	priority: TicketPriority;
	category: string;
	// studentId is usually added by the backend based on auth token
}

// Information needed for adding a response
export interface AddTicketResponsePayload {
	ticketId: string;
	message: string;
	// userId (sender) added by backend
}

// Represents a response within a ticket
export interface TicketResponse {
	id: string;
	ticketId: string;
	userId: string; // ID of the responder (student or staff/admin)
	userName?: string; // Display name of responder
	userRole?: string; // Role of responder
	message: string;
	createdAt: string; // ISO Date string
}

// Represents a support ticket, potentially including responses
export interface SupportTicket {
	id: string;
	studentId: string; // ID of the student who created it
	studentName?: string; // Optional: Name for display
	title: string;
	subject?: string; // Keeping for backward compatibility
	description: string;
	priority: TicketPriority;
	category: string;
	status: TicketStatus;
	createdAt: string; // ISO Date string
	updatedAt: string; // ISO Date string
	responses?: TicketResponse[]; // Optionally include responses in detail view
}

// Structure for feedback submission
export interface SubmitFeedbackPayload {
	rating: number; // e.g., 1-5
	comment: string;
	type: FeedbackType;
	// studentId added by backend
}

// Represents stored feedback
export interface FeedbackRecord {
	id: string;
	studentId: string;
	studentName?: string;
	rating: number;
	comment: string;
	type: FeedbackType;
	status: FeedbackStatus;
	createdAt: string;
}

// State shape for the support slice
export interface SupportState {
	myTickets: SupportTicket[]; // List of tickets for the logged-in user
	allTickets: SupportTicket[]; // List of all tickets (for admin)
	currentTicket: SupportTicket | null; // For viewing ticket details
	allFeedback: FeedbackRecord[]; // List of all feedback (for admin)
	status: "idle" | "loading" | "succeeded" | "failed"; // General status
	ticketStatus: "idle" | "loading" | "succeeded" | "failed"; // Status for fetching single ticket
	createStatus: "idle" | "loading" | "succeeded" | "failed"; // Status for creating ticket/feedback/response
	error: string | null;
	// Pagination for admin views
	adminTicketPagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		limit: number;
	} | null;
	adminFeedbackPagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		limit: number;
	} | null;
}
