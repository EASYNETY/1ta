// features/support/types/support-types.ts

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type FeedbackType =
	| "general"
	| "bug_report"
	| "feature_request"
	| "course_feedback";
export type FeedbackStatus = "new" | "reviewed" | "actioned";

export interface CreateTicketPayload {
	title: string;
	description: string;
	priority: TicketPriority;
	category: string;
}

export interface AddTicketResponsePayload {
	ticketId: string;
	message: string;
}

export interface TicketResponse {
	id: string;
	ticketId: string;
	userId: string;
	userName?: string;
	userRole?: string;
	message: string;
	content: string;
	createdAt: string;
}

export interface SupportTicket {
	id: string;
	title: string;
	description: string;
	priority: TicketPriority;
	status: TicketStatus;
	userId: string;
	createdAt: string;
	updatedAt: string;
	user: {
		id: string;
		name: string;
		email: string;
	};
	responses?: TicketResponse[];
}

export interface SubmitFeedbackPayload {
	rating: number;
	comment: string;
	type: FeedbackType;
}

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

export interface SupportState {
	myTickets: SupportTicket[];
	allTickets: SupportTicket[];
	currentTicket: SupportTicket | null;
	allFeedback: FeedbackRecord[];
	status: "idle" | "loading" | "succeeded" | "failed";
	ticketStatus: "idle" | "loading" | "succeeded" | "failed";
	createStatus: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
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
