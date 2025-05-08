// src/data/mock-support-data.ts
import type {
	SupportTicket,
	TicketResponse,
	FeedbackRecord,
	TicketStatus,
	FeedbackType,
	CreateTicketPayload,
	SubmitFeedbackPayload,
	AddTicketResponsePayload,
} from "@/features/support/types/support-types";
import { formatISO, subDays, subHours } from "date-fns";

// In-memory store for mock data
const mockTickets: SupportTicket[] = [
	{
		id: "ticket_1",
		studentId: "student_1", // Updated to match mock auth user ID
		studentName: "Student User",
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
				userId: "admin_1", // Updated to match mock auth user ID
				userName: "Admin User",
				userRole: "admin",
				message:
					"Thanks for reporting. We are looking into the video issue now.",
				createdAt: formatISO(subHours(new Date(), 4)),
			},
		],
	},
	{
		id: "ticket_2",
		studentId: "student_2",
		studentName: "New Student",
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
				userId: "teacher_1",
				userName: "Teacher User",
				userRole: "teacher",
				message:
					"Good question. Let me confirm the official deadline with admin and get back to you.",
				createdAt: formatISO(subDays(new Date(), 1)),
			},
		],
	},
	{
		id: "ticket_3",
		studentId: "student_1",
		studentName: "Student User",
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
				userId: "admin_1",
				userName: "Admin User",
				userRole: "admin",
				message:
					"Apologies, there was a system glitch. We have corrected the invoice and resent it. Please check your email.",
				createdAt: formatISO(subDays(new Date(), 8)),
			},
			{
				id: "resp_3_2",
				ticketId: "ticket_3",
				userId: "student_1",
				userName: "Student User",
				userRole: "student",
				message: "Got it, thank you!",
				createdAt: formatISO(subDays(new Date(), 7)),
			},
		],
	},
	{
		id: "ticket_4",
		studentId: "corp_student_1",
		studentName: "Corporate Student",
		subject: "Access to Premium Course Materials",
		description:
			"Our company purchased the premium package, but I can't access the advanced modules in the Data Science course.",
		priority: "high",
		status: "open",
		createdAt: formatISO(subDays(new Date(), 3)),
		updatedAt: formatISO(subDays(new Date(), 3)),
		responses: [],
	},
	{
		id: "ticket_5",
		studentId: "corp_manager_1",
		studentName: "Corporate Manager",
		subject: "Bulk Student Registration Issue",
		description:
			"I'm trying to register 15 new students but the system keeps timing out after the 10th student.",
		priority: "urgent",
		status: "in_progress",
		createdAt: formatISO(subDays(new Date(), 4)),
		updatedAt: formatISO(subHours(new Date(), 12)),
		responses: [
			{
				id: "resp_5_1",
				ticketId: "ticket_5",
				userId: "admin_1",
				userName: "Admin User",
				userRole: "admin",
				message:
					"We're investigating this issue. As a temporary workaround, could you try registering them in smaller batches of 5?",
				createdAt: formatISO(subHours(new Date(), 12)),
			},
		],
	},
	{
		id: "ticket_6",
		studentId: "student_2",
		studentName: "New Student",
		subject: "Reset Password Not Working",
		description:
			"I requested a password reset but never received the email. I've checked my spam folder.",
		priority: "medium",
		status: "closed",
		createdAt: formatISO(subDays(new Date(), 15)),
		updatedAt: formatISO(subDays(new Date(), 14)),
		responses: [
			{
				id: "resp_6_1",
				ticketId: "ticket_6",
				userId: "admin_1",
				userName: "Admin User",
				userRole: "admin",
				message:
					"I've manually reset your password to 'Temporary123' and sent the details to your registered email. Please log in and change it immediately.",
				createdAt: formatISO(subDays(new Date(), 14)),
			},
			{
				id: "resp_6_2",
				ticketId: "ticket_6",
				userId: "student_2",
				userName: "New Student",
				userRole: "student",
				message: "Got it working now, thanks!",
				createdAt: formatISO(subDays(new Date(), 14)),
			},
		],
	},
	{
		id: "ticket_7",
		studentId: "corp_student_2",
		studentName: "New Corporate Student",
		subject: "Course Certificate Not Generated",
		description:
			"I completed the JavaScript Fundamentals course two weeks ago with a 92% score, but my certificate hasn't been generated yet.",
		priority: "low",
		status: "resolved",
		createdAt: formatISO(subDays(new Date(), 8)),
		updatedAt: formatISO(subDays(new Date(), 6)),
		responses: [
			{
				id: "resp_7_1",
				ticketId: "ticket_7",
				userId: "admin_1",
				userName: "Admin User",
				userRole: "admin",
				message:
					"There was a delay in our certificate generation system. I've manually triggered it and your certificate should be available now.",
				createdAt: formatISO(subDays(new Date(), 7)),
			},
			{
				id: "resp_7_2",
				ticketId: "ticket_7",
				userId: "corp_student_2",
				userName: "New Corporate Student",
				userRole: "student",
				message: "I can see it now. Thank you!",
				createdAt: formatISO(subDays(new Date(), 6)),
			},
		],
	},
];

const mockFeedback: FeedbackRecord[] = [
	{
		id: "fb_1",
		studentId: "student_2",
		studentName: "New Student",
		rating: 4,
		comment:
			"The Web Dev course is great, but maybe more examples on async/await?",
		type: "course_feedback",
		status: "new",
		createdAt: formatISO(subHours(new Date(), 10)),
	},
	{
		id: "fb_2",
		studentId: "student_1",
		studentName: "Student User",
		rating: 5,
		comment: "The platform is really smooth and easy to use!",
		type: "general",
		status: "reviewed",
		createdAt: formatISO(subDays(new Date(), 3)),
	},
	{
		id: "fb_3",
		studentId: "corp_student_1",
		studentName: "Corporate Student",
		rating: 3,
		comment:
			"The mobile experience could be improved. Some features are hard to use on smaller screens.",
		type: "bug_report",
		status: "new",
		createdAt: formatISO(subDays(new Date(), 1)),
	},
	{
		id: "fb_4",
		studentId: "corp_manager_1",
		studentName: "Corporate Manager",
		rating: 4,
		comment:
			"Would love to see more analytics for tracking student progress as a corporate manager.",
		type: "feature_request",
		status: "actioned",
		createdAt: formatISO(subDays(new Date(), 5)),
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
