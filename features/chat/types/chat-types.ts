// features/chat/types/chat-types.ts

// Chat participant types - users who can participate in chats
export interface ChatParticipant {
	id: string;
	name: string;
	avatarUrl?: string;
	role: "student" | "teacher" | "admin";
}

// Chat room types - different contexts for discussions
export enum ChatRoomType {
	COURSE = "course",
	CLASS = "class",
	EVENT = "event",
	ANNOUNCEMENT = "announcement",
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
	messageStatus: Record<string, "idle" | "loading" | "succeeded" | "failed">; // Loading status per room
	sendMessageStatus: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
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
