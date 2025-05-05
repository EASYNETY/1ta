// data/mock-chat-data.ts
import {
	ChatRoom,
	ChatMessage,
	ChatParticipant,
	ChatRoomType,
	MessageType,
	SendMessageResponse,
	FetchRoomsResponse,
	FetchMessagesResponse,
} from "@/features/chat/types/chat-types"; // Use refined types
import { subHours, subMinutes, formatISO } from "date-fns";
// Import the *exported* users array from your auth mock data
import { users as mockAuthUsers } from "./mock-auth-data";

// --- Create Participants from Auth Users ---
const mockParticipants: Record<string, ChatParticipant> = {};
mockAuthUsers.forEach((user) => {
	// Add placeholder avatar logic if needed
	let avatar = `/avatars/avatar-${(parseInt(user.id.split("_")[1] || "0", 10) % 5) + 1}.png`; // Example mapping

	mockParticipants[user.id] = {
		id: user.id,
		name: user.name,
		avatarUrl: user.avatarUrl || avatar, // Use provided avatar or fallback
		role: user.role,
	};
});
// --- End Participants ---

// --- Mock Rooms using Participants and Context IDs ---
// Use 'let' for mutability if needed later (e.g., for createRoom mock)
let mockRooms: ChatRoom[] = [
	{
		id: "room_course_1", // Linked to PMP Course (ID '1')
		name: "PMP Discussion",
		description: "General chat for PMP students and teacher.",
		type: ChatRoomType.COURSE,
		contextId: "1", // Matches courseId from mock-auth-course-data
		participants: [
			// Use IDs from mockParticipants
			mockParticipants["student_1"],
			mockParticipants["student_2"], // Add another student if they are in this course
			mockParticipants["teacher_1"], // The PMP teacher
		],
		lastMessage: {
			content: "Don't forget the quiz tomorrow!",
			timestamp: formatISO(subMinutes(new Date(), 15)),
			senderId: "teacher_1",
			senderName: mockParticipants["teacher_1"]?.name,
		},
		unreadCount: 1,
		isGroupChat: true,
		createdAt: formatISO(subHours(new Date(), 48)),
		updatedAt: formatISO(subMinutes(new Date(), 15)),
		createdBy: "admin_1", // Example
		iconUrl: "/images/courses/pmp-certification-training.jpg", // Example icon
	},
	{
		id: "room_class_webdev_101", // Linked to Web Dev Class
		name: "Web Dev Bootcamp Q&A",
		description: "Ask questions about the Web Dev Bootcamp.",
		type: ChatRoomType.CLASS, // Or COURSE if it represents the whole course
		contextId: "class_webdev_101_2", // Example class ID (match mock-classes-data if possible)
		participants: [
			mockParticipants["student_1"], // Assuming student_1 is also in webdev
			mockParticipants["student_4"], // Assuming student_4 is in webdev
			mockParticipants["teacher_2"], // Web Dev Teacher
		],
		lastMessage: {
			content: "What time are office hours?",
			timestamp: formatISO(subHours(new Date(), 1)),
			senderId: "student_4", // Use an existing student ID
			senderName: mockParticipants["student_4"]?.name,
		},
		unreadCount: 0,
		isGroupChat: true,
		createdAt: formatISO(subHours(new Date(), 72)),
		updatedAt: formatISO(subHours(new Date(), 1)),
		createdBy: "teacher_2",
		iconUrl: "/images/courses/web-dev-bootcamp.jpg", // Example icon
	},
	{
		id: "room_event_sched_3", // Linked to ScheduleEvent ID 'sched_3'
		name: "Quiz Prep Session",
		description: "Discussing the upcoming Project Planning Quiz.",
		type: ChatRoomType.EVENT,
		contextId: "sched_3", // Matches eventId from mock-schedule-data
		participants: [
			// Participants relevant to the PMP course/event
			mockParticipants["student_1"],
			mockParticipants["student_2"],
			mockParticipants["student_3"],
			mockParticipants["teacher_1"],
		],
		lastMessage: {
			content: "Are the formulas included?",
			timestamp: formatISO(subMinutes(new Date(), 45)),
			senderId: "student_3", // Use an existing student ID
			senderName: mockParticipants["student_3"]?.name,
		},
		unreadCount: 3,
		isGroupChat: true,
		createdAt: formatISO(subHours(new Date(), 10)),
		updatedAt: formatISO(subMinutes(new Date(), 45)),
		createdBy: "teacher_1",
	},
	{
		id: "room_announcements",
		name: "# Platform Announcements",
		description: "Important updates from the administrators.",
		type: ChatRoomType.ANNOUNCEMENT,
		contextId: "general", // Use a generic ID for non-specific contexts
		participants: Object.values(mockParticipants), // All users are technically participants
		lastMessage: {
			content: "Scheduled maintenance tonight at 2 AM.",
			timestamp: formatISO(subHours(new Date(), 6)),
			senderId: "admin_1",
			senderName: mockParticipants["admin_1"]?.name,
		},
		unreadCount: 0, // Assume admin messages are read by default or handle logic
		isGroupChat: true,
		createdAt: formatISO(subHours(new Date(), 96)),
		updatedAt: formatISO(subHours(new Date(), 6)),
		createdBy: "admin_1",
	},
];

// --- Mock Messages ---
// Use 'let' for mutability
let mockMessages: Record<string, ChatMessage[]> = {
	room_course_1: [
		// PMP Discussion
		{
			id: "msg_pmp_1",
			roomId: "room_course_1",
			senderId: "teacher_1",
			content: "Any questions about the Earned Value formulas?",
			timestamp: formatISO(subMinutes(new Date(), 60)),
			type: MessageType.TEXT,
		},
		{
			id: "msg_pmp_2",
			roomId: "room_course_1",
			senderId: "student_1",
			content: "Yes, can we go over SPI again?",
			timestamp: formatISO(subMinutes(new Date(), 55)),
			type: MessageType.TEXT,
		},
		{
			id: "msg_pmp_3",
			roomId: "room_course_1",
			senderId: "student_3",
			content: "I'm a bit confused on CPI too.",
			timestamp: formatISO(subMinutes(new Date(), 50)),
			type: MessageType.TEXT,
		},
		{
			id: "msg_pmp_4",
			roomId: "room_course_1",
			senderId: "teacher_1",
			content: "Sure. Let's break it down. SPI = EV / PV...",
			timestamp: formatISO(subMinutes(new Date(), 45)),
			type: MessageType.TEXT,
		},
		{
			id: "msg_pmp_5",
			roomId: "room_course_1",
			senderId: "teacher_1",
			content: "Don't forget the quiz tomorrow!",
			timestamp: formatISO(subMinutes(new Date(), 15)),
			type: MessageType.TEXT,
		},
	],
	room_class_webdev_101: [
		// Web Dev Q&A
		{
			id: "msg_wd_1",
			roomId: "room_class_webdev_101",
			senderId: "teacher_2",
			content: "Reminder: Assignment 3 is due Friday.",
			timestamp: formatISO(subHours(new Date(), 5)),
			type: MessageType.TEXT,
		},
		{
			id: "msg_wd_2",
			roomId: "room_class_webdev_101",
			senderId: "student_4",
			content: "What time are office hours?",
			timestamp: formatISO(subHours(new Date(), 1)),
			type: MessageType.TEXT,
		},
		// Add teacher reply later
	],
	room_event_sched_3: [
		// Quiz Prep
		{
			id: "msg_ev_1",
			roomId: "room_event_sched_3",
			senderId: "teacher_1",
			content: "Quick prep session for the quiz. Any last minute questions?",
			timestamp: formatISO(subMinutes(new Date(), 65)),
			type: MessageType.TEXT,
		},
		{
			id: "msg_ev_2",
			roomId: "room_event_sched_3",
			senderId: "student_1",
			content: "What's the format? Multiple choice?",
			timestamp: formatISO(subMinutes(new Date(), 60)),
			type: MessageType.TEXT,
		},
		{
			id: "msg_ev_3",
			roomId: "room_event_sched_3",
			senderId: "student_3",
			content: "Are the formulas included?",
			timestamp: formatISO(subMinutes(new Date(), 45)),
			type: MessageType.TEXT,
		},
		// Add teacher reply later
	],
	room_announcements: [
		// Announcements
		{
			id: "msg_an_1",
			roomId: "room_announcements",
			senderId: "admin_1",
			content: "Welcome to the 1TechAcademy Platform!",
			timestamp: formatISO(subHours(new Date(), 95)),
			type: MessageType.SYSTEM,
		},
		{
			id: "msg_an_2",
			roomId: "room_announcements",
			senderId: "admin_1",
			content: "Scheduled maintenance tonight at 2 AM.",
			timestamp: formatISO(subHours(new Date(), 6)),
			type: MessageType.SYSTEM,
		},
	],
};

// --- Mock API Functions ---

export const getMockChatRooms = async (
	userId: string
): Promise<FetchRoomsResponse> => {
	console.log(`MOCK: Fetching chat rooms for user ${userId}`);
	await new Promise((res) => setTimeout(res, 300));
	const userRooms = mockRooms.filter(
		(room) =>
			// Include announcement rooms for everyone, and others if user is a participant
			room.type === ChatRoomType.ANNOUNCEMENT ||
			room.participants?.some((p) => p.id === userId)
	);

	// Populate participant details and sender name for last message
	const populatedRooms = userRooms.map((room) => {
		const populatedParticipants = room.participants?.map(
			(pRef) => mockParticipants[pRef.id] || pRef
		);
		const lastMsgSenderName = room.lastMessage?.senderId
			? mockParticipants[room.lastMessage.senderId]?.name
			: undefined;
		return {
			...room,
			participants: populatedParticipants,
			lastMessage: room.lastMessage
				? { ...room.lastMessage, senderName: lastMsgSenderName }
				: undefined,
		};
	});

	return {
		rooms: JSON.parse(JSON.stringify(populatedRooms)),
		total: populatedRooms.length,
	}; // Deep copy
};

export const getMockChatMessages = async (
	roomId: string,
	page: number = 1,
	limit: number = 30
): Promise<FetchMessagesResponse> => {
	console.log(`MOCK: Fetching messages for room ${roomId} (Page: ${page})`);
	await new Promise((res) => setTimeout(res, 150 + Math.random() * 150));
	const allRoomMessages = mockMessages[roomId] || [];

	// Populate sender details
	const messagesWithSender = allRoomMessages.map((msg) => ({
		...msg,
		sender: mockParticipants[msg.senderId] || {
			id: msg.senderId,
			name: "Unknown",
			role: "student",
		}, // Add default role
	}));

	// Paginate (get latest messages for page 1, older for subsequent pages - implement properly if needed)
	const total = messagesWithSender.length;
	const startIndex = Math.max(0, total - page * limit); // Get last N messages for page 1
	const paginatedMessages = messagesWithSender.slice(startIndex);
	const hasMore = startIndex > 0; // Simple check if there were older messages

	return {
		messages: JSON.parse(JSON.stringify(paginatedMessages)), // Deep copy
		total: total,
		hasMore: hasMore,
	};
};

export const createMockChatMessage = async (
	roomId: string,
	senderId: string,
	content: string
): Promise<SendMessageResponse> => {
	console.log(`MOCK: Creating message in room ${roomId} by ${senderId}`);
	await new Promise((res) => setTimeout(res, 100));

	const sender = mockParticipants[senderId];
	if (!sender) {
		throw new Error("Mock Error: Invalid sender ID");
	}

	const newMessage: ChatMessage = {
		id: `msg_${roomId}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
		roomId,
		senderId,
		sender: sender, // Include sender details
		content,
		timestamp: formatISO(new Date()),
		type: MessageType.TEXT, // Default to text
	};

	// Add to our mock store
	if (!mockMessages[roomId]) {
		mockMessages[roomId] = [];
	}
	mockMessages[roomId].push(newMessage);

	// Update last message in the room list
	const roomIndex = mockRooms.findIndex((r) => r.id === roomId);
	if (roomIndex !== -1) {
		mockRooms[roomIndex].lastMessage = {
			content: newMessage.content,
			timestamp: newMessage.timestamp,
			senderId: newMessage.senderId,
			senderName: sender.name,
		};
		mockRooms[roomIndex].updatedAt = newMessage.timestamp;
	}

	return { message: JSON.parse(JSON.stringify(newMessage)), success: true }; // Deep copy
};

// TODO: Add mock functions for createRoom, markRead etc. if needed
