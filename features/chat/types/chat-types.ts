// features/chat/types/chat-types.ts

import { UserRole } from "@/types/user.types";

// Chat participant types - users who can participate in chats
export interface ChatParticipant {
	id: string;
	name: string;
	avatarUrl?: string;
	role: UserRole;
}

// Chat room types - different contexts for discussions
export enum ChatRoomType {
	COURSE = "course",
	CLASS = "class",
	EVENT = "event",
	ANNOUNCEMENT = "announcement",
	// Consider adding these for more flexibility if needed later:
	// DIRECT = "direct",    // For one-on-one chats
	// GROUP = "group",      // For generic group chats not tied to a specific context
}

// Message types that can be sent
export enum MessageType {
	TEXT = "text",
	IMAGE = "image",
	FILE = "file",
	SYSTEM = "system",
}

// A single chat message
export interface ChatMessage {
	id: string;
	roomId: string;
	senderId: string;
	sender?: ChatParticipant; // Populated sender info for display
	content: string;
	timestamp: string;
	type: MessageType;
	metadata?: {
		fileName?: string;
		fileSize?: number;
		fileUrl?: string;
		imageUrl?: string;
		width?: number;
		height?: number;
	};
	isRead?: boolean;
}

// A chat room
export interface ChatRoom {
	id: string;
	name: string;
	description?: string;
	type: ChatRoomType;
	contextId: string; // ID of the course, class, or event
	participants: ChatParticipant[];
	lastMessage?: {
		content: string;
		timestamp: string;
		senderId: string;
		senderName?: string;
	};
	unreadCount?: number;
	isGroupChat: boolean; // Always true for course/class/event chats
	createdAt: string;
	updatedAt?: string;
	createdBy?: string;
	iconUrl?: string; // URL for the room icon
}

// State shape for the Redux chat slice
export interface ChatState {
	rooms: ChatRoom[];
	messagesByRoom: Record<string, ChatMessage[]>; // Store messages keyed by roomId
	selectedRoomId: string | null;
	roomStatus: "idle" | "loading" | "succeeded" | "failed";
	createRoomStatus: "idle" | "loading" | "succeeded" | "failed";
	messageStatus: Record<string, "idle" | "loading" | "succeeded" | "failed">; // Loading status per room
	sendMessageStatus: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
	createRoomError: string | null;
}

// API response types
export interface FetchRoomsResponse {
	rooms: ChatRoom[];
	total: number;
}

export interface FetchMessagesResponse {
	messages: ChatMessage[];
	total: number;
	hasMore: boolean;
}

export interface SendMessageResponse {
	message: ChatMessage;
	success: boolean;
}

export interface CreateRoomResponse {
	room: ChatRoom;
	success: boolean;
}

export interface CreateRoomPayload {
	name: string;
	description?: string;
	type: ChatRoomType;
	contextId?: string; // e.g., courseId, classId, eventId, or 'general' for announcement
	participantIds: string[]; // Array of user IDs to be added as participants
	createdBy: string; // ID of the user creating the room
	classId?: string;
	courseId?: string;
	eventId?: string;
}

export interface MarkReadResponse {
	success: boolean;
	message?: string;
	updatedRoom?: ChatRoom; // Optionally return the updated room with new unreadCount
}
