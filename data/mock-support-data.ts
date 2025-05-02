// src/data/mock-support-data.ts
import type {
	SupportTicket,
	TicketResponse,
	FeedbackRecord,
	TicketStatus,
	TicketPriority,
	FeedbackType,
	FeedbackStatus,
	CreateTicketPayload,
	SubmitFeedbackPayload,
	AddTicketResponsePayload,
} from "@/features/support/types/support-types";
import { formatISO, subDays, subHours } from "date-fns";

// In-memory store for mock data
let mockTickets: SupportTicket[] = [
	{
		id: "ticket_1",
		studentId: "student_123",
		studentName: "Alice Student",
		subject: "Cannot Access Course Video Week 3",
		description:
			"The video for PMP Training Day 3 seems broken, it stops playing after 2 minutes. Tried different browsers.",
		priority: "high",
		status: "open",
		createdAt: formatISO(subDays(new Date(), 2)),
		updatedAt: formatISO(subHours(new Date(), 5)),
		responses: [
			{
				id: "resp_1_1",
				ticketId: "ticket_1",
				userId: "admin_001",
				userName: "Support Staff",
				userRole: "admin",
				message:
					"Thanks for reporting, Alice. We are looking into the video issue now.",
				createdAt: formatISO(subHours(new Date(), 4)),
			},
		],
	},
	{
		id: "ticket_2",
		studentId: "student_456",
		studentName: "Bob Learner",
		subject: "Question about Assignment 1",
		description:
			"What is the exact deadline for the first Web Dev assignment? The syllabus says Friday but the portal says Saturday.",
		priority: "medium",
		status: "in_progress",
		createdAt: formatISO(subDays(new Date(), 5)),
		updatedAt: formatISO(subDays(new Date(), 1)),
		responses: [
			{
				id: "resp_2_1",
				ticketId: "ticket_2",
				userId: "teacher_789",
				userName: "Michael Chen",
				userRole: "teacher",
				message:
					"Good question, Bob. Let me confirm the official deadline with admin and get back to you.",
				createdAt: formatISO(subDays(new Date(), 1)),
			},
		],
	},
	{
		id: "ticket_3",
		studentId: "student_123",
		studentName: "Alice Student",
		subject: "Invoice Discrepancy",
		description:
			"My latest invoice seems to be double the expected amount for the Pro plan.",
		priority: "urgent",
		status: "resolved",
		createdAt: formatISO(subDays(new Date(), 10)),
		updatedAt: formatISO(subDays(new Date(), 7)),
		responses: [
			{
				id: "resp_3_1",
				ticketId: "ticket_3",
				userId: "admin_001",
				userName: "Support Staff",
				userRole: "admin",
				message:
					"Apologies Alice, there was a system glitch. We have corrected the invoice and resent it. Please check your email.",
				createdAt: formatISO(subDays(new Date(), 8)),
			},
			{
				id: "resp_3_2",
				ticketId: "ticket_3",
				userId: "student_123",
				userName: "Alice Student",
				userRole: "student",
				message: "Got it, thank you!",
				createdAt: formatISO(subDays(new Date(), 7)),
			},
		],
	},
];

let mockFeedback: FeedbackRecord[] = [
	{
		id: "fb_1",
		studentId: "student_456",
		studentName: "Bob Learner",
		rating: 4,
		comment:
			"The Web Dev course is great, but maybe more examples on async/await?",
		type: "course_feedback",
		status: "new",
		createdAt: formatISO(subHours(new Date(), 10)),
	},
	{
		id: "fb_2",
		studentId: "student_123",
		studentName: "Alice Student",
		rating: 5,
		comment: "The platform is really smooth and easy to use!",
		type: "general",
		status: "reviewed",
		createdAt: formatISO(subDays(new Date(), 3)),
	},
];

// --- Mock API Functions ---

export const mockFetchMyTickets = async (
	userId: string,
	_page = 1,
	_limit = 10
): Promise<{ tickets: SupportTicket[]; total: number }> => {
	console.log(`MOCK: Fetching tickets for user ${userId}`);
	await new Promise((res) => setTimeout(res, 400));
	const userTickets = mockTickets.filter((t) => t.studentId === userId);
	// Simulate pagination (basic)
	const paginated = userTickets.slice((_page - 1) * _limit, _page * _limit);
	return {
		tickets: JSON.parse(JSON.stringify(paginated)),
		total: userTickets.length,
	}; // Deep copy
};

export const mockFetchAllTickets = async (
	status?: TicketStatus,
	_page = 1,
	_limit = 10
): Promise<{ tickets: SupportTicket[]; total: number }> => {
	console.log(`MOCK: Fetching all tickets. Status: ${status}`);
	await new Promise((res) => setTimeout(res, 600));
	let filtered = mockTickets;
	if (status) {
		filtered = mockTickets.filter((t) => t.status === status);
	}
	// Simulate pagination (basic)
	const paginated = filtered.slice((_page - 1) * _limit, _page * _limit);
	return {
		tickets: JSON.parse(JSON.stringify(paginated)),
		total: filtered.length,
	}; // Deep copy
};

export const mockFetchTicketById = async (
	ticketId: string,
	userId: string,
	role: string
): Promise<SupportTicket | null> => {
	console.log(`MOCK: Fetching ticket ${ticketId}`);
	await new Promise((res) => setTimeout(res, 250));
	const ticket = mockTickets.find((t) => t.id === ticketId);
	// Basic authorization check for mock
	if (ticket && (role === "admin" || ticket.studentId === userId)) {
		return JSON.parse(JSON.stringify(ticket)); // Deep copy
	}
	return null;
};

export const mockCreateTicket = async (
	userId: string,
	payload: CreateTicketPayload
): Promise<SupportTicket> => {
	console.log(`MOCK: Creating ticket for user ${userId}`, payload);
	await new Promise((res) => setTimeout(res, 700));
	const newTicket: SupportTicket = {
		id: `ticket_${Date.now()}`,
		studentId: userId,
		studentName: "Current User", // Get from auth context in real app
		subject: payload.subject,
		description: payload.description,
		priority: payload.priority,
		status: "open",
		createdAt: formatISO(new Date()),
		updatedAt: formatISO(new Date()),
		responses: [],
	};
	mockTickets.unshift(newTicket); // Add to start of array
	return JSON.parse(JSON.stringify(newTicket));
};

export const mockAddTicketResponse = async (
	payload: AddTicketResponsePayload,
	senderId: string,
	senderRole: string
): Promise<TicketResponse> => {
	console.log(
		`MOCK: Adding response to ticket ${payload.ticketId} by ${senderId}`
	);
	await new Promise((res) => setTimeout(res, 400));
	const ticketIndex = mockTickets.findIndex((t) => t.id === payload.ticketId);
	if (ticketIndex === -1) throw new Error("Ticket not found");

	const newResponse: TicketResponse = {
		id: `resp_${payload.ticketId}_${Date.now()}`,
		ticketId: payload.ticketId,
		userId: senderId,
		userName: senderRole === "admin" ? "Support Staff" : "User", // Simulate name based on role
		userRole: senderRole,
		message: payload.message,
		createdAt: formatISO(new Date()),
	};

	mockTickets[ticketIndex].responses = [
		...(mockTickets[ticketIndex].responses || []),
		newResponse,
	];
	mockTickets[ticketIndex].status =
		senderRole === "admin" || senderRole === "teacher" ? "in_progress" : "open"; // Example status update
	mockTickets[ticketIndex].updatedAt = newResponse.createdAt;

	return JSON.parse(JSON.stringify(newResponse));
};

export const mockSubmitFeedback = async (
	userId: string,
	payload: SubmitFeedbackPayload
): Promise<{ success: boolean }> => {
	console.log(`MOCK: Submitting feedback for user ${userId}`, payload);
	await new Promise((res) => setTimeout(res, 500));
	const newFeedback: FeedbackRecord = {
		id: `fb_${Date.now()}`,
		studentId: userId,
		studentName: "Current User", // Get from auth context
		rating: payload.rating,
		comment: payload.comment,
		type: payload.type,
		status: "new",
		createdAt: formatISO(new Date()),
	};
	mockFeedback.unshift(newFeedback);
	return { success: true };
};

export const mockFetchAllFeedback = async (
	_type?: FeedbackType,
	_page = 1,
	_limit = 10
): Promise<{ feedback: FeedbackRecord[]; total: number }> => {
	console.log(`MOCK: Fetching all feedback. Type: ${_type}`);
	await new Promise((res) => setTimeout(res, 550));
	let filtered = mockFeedback;
	if (_type) {
		filtered = mockFeedback.filter((f) => f.type === _type);
	}
	// Simulate pagination
	const paginated = filtered.slice((_page - 1) * _limit, _page * _limit);
	return {
		feedback: JSON.parse(JSON.stringify(paginated)),
		total: filtered.length,
	};
};
