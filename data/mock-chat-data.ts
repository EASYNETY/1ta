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
	CreateRoomResponse,
	CreateRoomPayload,
	MarkReadResponse,
} from "@/features/chat/types/chat-types"; // Use refined types
import { subHours, subMinutes, formatISO } from "date-fns";
// Import the *exported* users array from your auth mock data
import { users as mockAuthUsers, MockUser } from "./mock-auth-data"; // Ensure MockUser is exported if used directly or rely on users having 'role'

// --- Create Participants from Auth Users ---
const mockParticipants: Record<string, ChatParticipant> = {};
mockAuthUsers.forEach((user) => {
	// Add placeholder avatar logic if needed
	let avatar = `/avatars/avatar-${(parseInt(user.id.split("_")[1] || "0", 10) % 5) + 1}.png`; // Example mapping

	mockParticipants[user.id] = {
		id: user.id,
		name: user.name,
		avatarUrl: user.avatarUrl || avatar, // Use provided avatar or fallback
		role: user.role, // This correctly assigns the role
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
			mockParticipants["student_1"],
			mockParticipants["student_2"],
			mockParticipants["teacher_1"],
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
		createdBy: "admin_1",
		iconUrl: "/images/courses/pmp-certification-training.jpg",
	},
	{
		id: "room_class_webdev_101",
		name: "Web Dev Bootcamp Q&A",
		description: "Ask questions about the Web Dev Bootcamp.",
		type: ChatRoomType.CLASS,
		contextId: "class_webdev_101_2",
		participants: [
			mockParticipants["student_1"],
			mockParticipants["student_4"],
			mockParticipants["teacher_2"],
		],
		lastMessage: {
			content: "What time are office hours?",
			timestamp: formatISO(subHours(new Date(), 1)),
			senderId: "student_4",
			senderName: mockParticipants["student_4"]?.name,
		},
		unreadCount: 0,
		isGroupChat: true,
		createdAt: formatISO(subHours(new Date(), 72)),
		updatedAt: formatISO(subHours(new Date(), 1)),
		createdBy: "teacher_2",
		iconUrl: "/images/courses/web-dev-bootcamp.jpg",
	},
	{
		id: "room_event_sched_3",
		name: "Quiz Prep Session",
		description: "Discussing the upcoming Project Planning Quiz.",
		type: ChatRoomType.EVENT,
		contextId: "sched_3",
		participants: [
			mockParticipants["student_1"],
			mockParticipants["student_2"],
			mockParticipants["student_3"],
			mockParticipants["teacher_1"],
		],
		lastMessage: {
			content: "Are the formulas included?",
			timestamp: formatISO(subMinutes(new Date(), 45)),
			senderId: "student_3",
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
		contextId: "general",
		participants: Object.values(mockParticipants), // All users are technically participants
		lastMessage: {
			content: "Scheduled maintenance tonight at 2 AM.",
			timestamp: formatISO(subHours(new Date(), 6)),
			senderId: "admin_1",
			senderName: mockParticipants["admin_1"]?.name,
		},
		unreadCount: 0,
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
			senderId: "student_3", // Assuming student_3 is part of mockParticipants and this course/room
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
	],
	room_event_sched_3: [
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
			senderId: "student_3", // Assuming student_3 is part of mockParticipants and this event/room
			content: "Are the formulas included?",
			timestamp: formatISO(subMinutes(new Date(), 45)),
			type: MessageType.TEXT,
		},
	],
	room_announcements: [
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

	// Find the current user from mockAuthUsers to check their role
	const currentUser = mockAuthUsers.find((user) => user.id === userId);
	const isAdminUser = currentUser?.role === "admin" || currentUser?.role === "super_admin";

	let roomsToReturn: ChatRoom[];

	if (isAdminUser) {
		// Admin sees all rooms
		console.log(
			`MOCK: User ${userId} (${currentUser?.name}) is an admin. Fetching all rooms.`
		);
		roomsToReturn = [...mockRooms]; // Return a copy of all rooms
	} else {
		// Non-admins see rooms they are part of or announcement rooms
		roomsToReturn = mockRooms.filter(
			(room) =>
				room.type === ChatRoomType.ANNOUNCEMENT ||
				room.participants?.some((p) => p.id === userId)
		);
		console.log(
			`MOCK: User ${userId} (${currentUser?.name}) is not an admin. Filtered to ${roomsToReturn.length} rooms.`
		);
	}

	// Populate participant details (to ensure consistency) and sender name for last message
	const populatedRooms = roomsToReturn.map((room) => {
		// Ensure participants are the most up-to-date from mockParticipants
		// This is good practice, especially if participant details could change.
		const fullyPopulatedParticipants = room.participants?.map(
			(pRef) => mockParticipants[pRef.id] || pRef // pRef should already be a full participant from mockRooms setup
		);
		const lastMsgSenderName = room.lastMessage?.senderId
			? mockParticipants[room.lastMessage.senderId]?.name
			: undefined;
		return {
			...room,
			participants: fullyPopulatedParticipants,
			lastMessage: room.lastMessage
				? { ...room.lastMessage, senderName: lastMsgSenderName }
				: undefined,
		};
	});

	return {
		rooms: JSON.parse(JSON.stringify(populatedRooms)), // Deep copy to prevent mutation of mock store
		total: populatedRooms.length,
	};
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
			name: "Unknown User", // Fallback name
			role: "student", // Default fallback role
			avatarUrl: "/avatars/avatar-placeholder.png",
		},
	}));

	// Paginate (simple example: latest messages for page 1)
	const total = messagesWithSender.length;
	const startIndex = Math.max(0, total - page * limit);
	const paginatedMessages = messagesWithSender.slice(startIndex);
	const hasMore = startIndex > 0;

	return {
		messages: JSON.parse(JSON.stringify(paginatedMessages)),
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
		// This case should ideally not happen if senderId is always valid
		console.error(`Mock Error: Invalid sender ID "${senderId}"`);
		throw new Error("Mock Error: Invalid sender ID");
	}

	const newMessage: ChatMessage = {
		id: `msg_${roomId}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
		roomId,
		senderId,
		sender: sender, // Include full sender details (which includes role)
		content,
		timestamp: formatISO(new Date()),
		type: MessageType.TEXT,
	};

	if (!mockMessages[roomId]) {
		mockMessages[roomId] = [];
	}
	mockMessages[roomId].push(newMessage);

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

	return { message: JSON.parse(JSON.stringify(newMessage)), success: true };
};

// TODO: Add mock functions for createRoom, markRead etc. if needed

export const createMockChatRoom = async (
	payload: CreateRoomPayload
): Promise<CreateRoomResponse> => {
	console.log(`MOCK: Creating chat room with payload:`, payload);
	await new Promise((res) => setTimeout(res, 300));

	const creator = mockParticipants[payload.createdBy];
	if (!creator) {
		throw new Error("Mock Error: Invalid creator ID for chat room.");
	}

	const participants: ChatParticipant[] = payload.participantIds
		.map((pid) => mockParticipants[pid])
		.filter((p) => p !== undefined) as ChatParticipant[];

	// For course/class/event, ensure the creator (if teacher) is a participant
	if (
		(payload.type === ChatRoomType.COURSE ||
			payload.type === ChatRoomType.CLASS ||
			payload.type === ChatRoomType.EVENT) &&
		creator.role === "teacher" &&
		!participants.some((p) => p.id === creator.id)
	) {
		participants.push(creator);
	}
	// For announcements, all users might be implicitly participants or handled by a special rule
	// Or, if explicit, ensure the admin creator is listed.
	if (
		payload.type === ChatRoomType.ANNOUNCEMENT &&
		creator.role === "admin" &&
		!participants.some((p) => p.id === creator.id)
	) {
		// For mock, let's add creator if not present. Real system might add all users automatically to announcements.
		participants.push(creator);
	}

	const newRoom: ChatRoom = {
		id: `room_${payload.type}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
		name: payload.name,
		description: payload.description,
		type: payload.type,
		contextId: payload.contextId,
		participants: participants, // Use the resolved ChatParticipant objects
		lastMessage: undefined, // No last message initially
		unreadCount: 0,
		isGroupChat: true, // Assuming most created rooms are group chats
		createdAt: formatISO(new Date()),
		updatedAt: formatISO(new Date()),
		createdBy: payload.createdBy,
		// iconUrl: generateIconForRoomType(payload.type), // You could have a helper for this
	};

	mockRooms.unshift(newRoom); // Add to the beginning of the list for visibility

	// Populate participant details again for the response, similar to getMockChatRooms
	const populatedNewRoom = {
		...newRoom,
		participants: newRoom.participants.map(
			(pRef) => mockParticipants[pRef.id] || pRef
		),
	};

	return { room: JSON.parse(JSON.stringify(populatedNewRoom)), success: true };
};

export interface MarkRoomReadPayload {
    roomId: string;
    userId: string; // The user for whom messages are being marked read
    lastReadMessageTimestamp?: string; // Optional: Mark all messages up to this timestamp as read
}

export const markMockRoomAsRead = async (
    payload: MarkRoomReadPayload
): Promise<MarkReadResponse> => { // Use MarkReadResponse type
    console.log(`MOCK: Marking room ${payload.roomId} as read for user ${payload.userId}`);
    await new Promise((res) => setTimeout(res, 150));

    const roomIndex = mockRooms.findIndex(r => r.id === payload.roomId);
    if (roomIndex === -1) {
        console.error(`MOCK: Room ${payload.roomId} not found for marking as read.`);
        return { success: false, message: `Room ${payload.roomId} not found.` };
    }

    // Simulate updating the unread count for this user.
    // In a real backend, this would be more complex, probably checking against the user's last read timestamp.
    // For the mock, we'll just set it to 0 for the room in the main list.
    // This mock affects the `unreadCount` that is returned when `getMockChatRooms` is called next.
    mockRooms[roomIndex].unreadCount = 0; // Simplistic mock: just clear it.

    // Optionally, if you want to mark individual messages as read in the mockMessages store:
    if (mockMessages[payload.roomId]) {
        mockMessages[payload.roomId].forEach(msg => {
            // If a lastReadMessageTimestamp is provided, only mark messages up to that point.
            // Otherwise, mark all. This example marks all for simplicity.
            // Note: This `isRead` flag on mockMessages would only be seen if messages are re-fetched
            // and if your `ChatMessage` type and display logic use it.
            // The primary effect clientside will be through the thunk updating the room's unreadCount.
            if (!payload.lastReadMessageTimestamp || new Date(msg.timestamp) <= new Date(payload.lastReadMessageTimestamp)) {
                 // msg.isReadBy = msg.isReadBy || {}; // If tracking per user
                 // msg.isReadBy[payload.userId] = true;
                 // For a simpler global isRead for the current user context:
                 // msg.isRead = true; // This is less accurate for multi-user mock viewing
            }
        });
    }
    console.log(`MOCK: Room ${payload.roomId} unread count set to 0.`);

    // Return a copy of the updated room for the thunk to potentially use
    const updatedRoomCopy = JSON.parse(JSON.stringify(mockRooms[roomIndex]));

    return { success: true, message: "Room marked as read.", updatedRoom: updatedRoomCopy };
};
