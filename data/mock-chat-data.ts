//data/mock-chat-data.ts
import type {
	ChatRoom,
	ChatMessage,
	ChatParticipant,
} from "@/features/chat/types/chat-types";
import { subHours, subMinutes, formatISO } from "date-fns";

// Mock Users (align IDs with your auth/student mocks if possible)
const mockUsers: Record<string, ChatParticipant> = {
	student_123: {
		id: "student_123",
		name: "Alice Student",
		role: "student",
		avatarUrl: "/avatars/avatar-1.png",
	},
	student_456: {
		id: "student_456",
		name: "Bob Learner",
		role: "student",
		avatarUrl: "/avatars/avatar-2.png",
	},
	teacher_1: {
		id: "teacher_1",
		name: "Dr. Sarah Johnson",
		role: "teacher",
		avatarUrl: "/avatars/avatar-3.png",
	},
	teacher_789: {
		id: "teacher_789",
		name: "Michael Chen",
		role: "teacher",
		avatarUrl: "/avatars/avatar-4.png",
	},
	admin_001: {
		id: "admin_001",
		name: "Admin User",
		role: "admin",
		avatarUrl: "/avatars/avatar-5.png",
	},
};

// Mock Rooms
const mockRooms: ChatRoom[] = [
	{
		id: "room_pmp_1",
		name: "PMP Study Group",
		classId: "1", // Link to PMP course/class
		participants: [
			mockUsers["student_123"],
			mockUsers["student_456"],
			mockUsers["teacher_1"],
		],
		lastMessage: {
			content: "Okay, let's review chapter 5 then.",
			timestamp: formatISO(subMinutes(new Date(), 5)),
			senderId: "teacher_1",
			senderName: "Dr. Sarah Johnson",
		},
		unreadCount: 2,
		isGroupChat: true,
		createdAt: formatISO(subHours(new Date(), 24)),
	},
	{
		id: "room_webdev_qa",
		name: "Web Dev Q&A",
		classId: "webdev_101", // Link to Web Dev course/class
		participants: [mockUsers["student_123"], mockUsers["teacher_789"]],
		lastMessage: {
			content: "Can you explain closures again?",
			timestamp: formatISO(subHours(new Date(), 2)),
			senderId: "student_123",
			senderName: "Alice Student",
		},
		unreadCount: 0,
		isGroupChat: true, // Could be false if only teacher and one student
		createdAt: formatISO(subHours(new Date(), 48)),
	},
	{
		id: "room_general",
		name: "#general-announcements",
		participants: [
			mockUsers["student_123"],
			mockUsers["student_456"],
			mockUsers["teacher_1"],
			mockUsers["teacher_789"],
			mockUsers["admin_001"],
		],
		lastMessage: {
			content: "Welcome everyone to the new term!",
			timestamp: formatISO(subHours(new Date(), 72)),
			senderId: "admin_001",
			senderName: "Admin User",
		},
		unreadCount: 1,
		isGroupChat: true,
		createdAt: formatISO(subHours(new Date(), 96)),
	},
];

// Mock Messages (keyed by roomId)
const mockMessages: Record<string, ChatMessage[]> = {
	room_pmp_1: [
		{
			id: "msg_pmp_1",
			roomId: "room_pmp_1",
			senderId: "teacher_1",
			content: "Hi team, ready for today's session?",
			timestamp: formatISO(subMinutes(new Date(), 30)),
		},
		{
			id: "msg_pmp_2",
			roomId: "room_pmp_1",
			senderId: "student_123",
			content: "Yes, ready!",
			timestamp: formatISO(subMinutes(new Date(), 28)),
		},
		{
			id: "msg_pmp_3",
			roomId: "room_pmp_1",
			senderId: "student_456",
			content: "Me too!",
			timestamp: formatISO(subMinutes(new Date(), 27)),
		},
		{
			id: "msg_pmp_4",
			roomId: "room_pmp_1",
			senderId: "teacher_1",
			content: "Great. Any questions from yesterday's material?",
			timestamp: formatISO(subMinutes(new Date(), 15)),
		},
		{
			id: "msg_pmp_5",
			roomId: "room_pmp_1",
			senderId: "teacher_1",
			content: "Okay, let's review chapter 5 then.",
			timestamp: formatISO(subMinutes(new Date(), 5)),
		},
	],
	room_webdev_qa: [
		{
			id: "msg_wd_1",
			roomId: "room_webdev_qa",
			senderId: "teacher_789",
			content: "Office hours are open if anyone needs help.",
			timestamp: formatISO(subHours(new Date(), 3)),
		},
		{
			id: "msg_wd_2",
			roomId: "room_webdev_qa",
			senderId: "student_123",
			content: "Hi Mr. Chen, I'm stuck on the last assignment.",
			timestamp: formatISO(subHours(new Date(), 2)),
		},
		{
			id: "msg_wd_3",
			roomId: "room_webdev_qa",
			senderId: "student_123",
			content: "Can you explain closures again?",
			timestamp: formatISO(subHours(new Date(), 2)),
		},
		// Simulate teacher hasn't replied yet
	],
	room_general: [
		{
			id: "msg_gen_1",
			roomId: "room_general",
			senderId: "admin_001",
			content: "Welcome everyone to the new term!",
			timestamp: formatISO(subHours(new Date(), 72)),
		},
		{
			id: "msg_gen_2",
			roomId: "room_general",
			senderId: "teacher_1",
			content: "Looking forward to teaching PMP!",
			timestamp: formatISO(subHours(new Date(), 70)),
		},
	],
};

// --- Mock API Functions ---

export const getMockChatRooms = async (userId: string): Promise<ChatRoom[]> => {
	console.log(`MOCK: Fetching chat rooms for user ${userId}`);
	await new Promise((res) => setTimeout(res, 300));
	// Return rooms where the user is a participant
	const userRooms = mockRooms.filter((room) =>
		room.participants?.some((p) => p.id === userId)
	);
	// Add sender name to lastMessage
	userRooms.forEach((room) => {
		if (room.lastMessage?.senderId) {
			room.lastMessage.senderName =
				mockUsers[room.lastMessage.senderId]?.name || "Unknown";
		}
		// Populate participants if not already done (adjust based on how you store mock data)
		room.participants = room.participants?.map((p) => mockUsers[p.id] || p);
	});
	return JSON.parse(JSON.stringify(userRooms)); // Deep copy
};

export const getMockChatMessages = async (
	roomId: string,
	_page: number = 1,
	_limit: number = 30
): Promise<ChatMessage[]> => {
	console.log(`MOCK: Fetching messages for room ${roomId} (Page: ${_page})`);
	await new Promise((res) => setTimeout(res, 150 + Math.random() * 150));
	const roomMessages = mockMessages[roomId] || [];
	// Add sender details to each message
	const messagesWithSender = roomMessages.map((msg) => ({
		...msg,
		sender: mockUsers[msg.senderId] || {
			id: msg.senderId,
			name: "Unknown User",
		},
	}));
	// Simulate pagination roughly (return latest `_limit` messages for page 1)
	const startIndex = Math.max(0, messagesWithSender.length - _page * _limit);
	const endIndex = startIndex + _limit;
	return JSON.parse(
		JSON.stringify(messagesWithSender.slice(startIndex, endIndex))
	); // Deep copy
};

export const createMockChatMessage = async (
	roomId: string,
	senderId: string,
	content: string
): Promise<ChatMessage> => {
	console.log(`MOCK: Creating message in room ${roomId} by ${senderId}`);
	await new Promise((res) => setTimeout(res, 100));

	const newMessage: ChatMessage = {
		id: `msg_${roomId}_${Date.now()}`,
		roomId,
		senderId,
		sender: mockUsers[senderId] || { id: senderId, name: "Unknown User" },
		content,
		timestamp: formatISO(new Date()),
		type: "text",
	};

	// Add to our mock store
	if (!mockMessages[roomId]) {
		mockMessages[roomId] = [];
	}
	mockMessages[roomId].push(newMessage);

	// Update last message in the room
	const roomIndex = mockRooms.findIndex((r) => r.id === roomId);
	if (roomIndex !== -1) {
		mockRooms[roomIndex].lastMessage = {
			content: newMessage.content,
			timestamp: newMessage.timestamp,
			senderId: newMessage.senderId,
			senderName: newMessage.sender?.name,
		};
	}

	return JSON.parse(JSON.stringify(newMessage)); // Deep copy
};

// Add mock functions for createRoom, markRead etc. if needed for MVP
