// features/chat/types/chat-types.ts

// Basic user info needed for display
export interface ChatParticipant {
    id: string;
    name: string;
    avatarUrl?: string; // Optional avatar
    role?: 'student' | 'teacher' | 'admin';
}

// Represents a single message
export interface ChatMessage {
    id: string;          // Message ID (e.g., "msg_123")
    roomId: string;      // Room it belongs to
    senderId: string;      // ID of the user who sent it
    sender?: ChatParticipant; // Populated sender info for display
    content: string;     // The message text
    timestamp: string;   // ISO 8601 timestamp string
    type?: 'text' | 'image' | 'file'; // Type of message (default 'text')
    isRead?: boolean;    // UI flag if current user read it (can be derived)
}

// Represents a chat room
export interface ChatRoom {
    id: string;          // Room ID (e.g., "room_abc")
    name: string;        // Room name (e.g., "PMP Study Group", "Web Dev Q&A")
    participants?: ChatParticipant[]; // List of users in the room
    lastMessage?: Pick<ChatMessage, 'content' | 'timestamp' | 'senderId'> & { senderName?: string }; // Preview of last message
    unreadCount?: number;  // How many messages are unread for the current user
    isGroupChat?: boolean; // Flag if it's more than a 1-on-1
    createdAt?: string;    // ISO 8601 timestamp
    // Add other relevant properties like associated classId if needed
    classId?: string;
}

// State shape for the Redux chat slice
export interface ChatState {
    rooms: ChatRoom[];
    messagesByRoom: Record<string, ChatMessage[]>; // Store messages keyed by roomId
    selectedRoomId: string | null;
    roomStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    messageStatus: Record<string, 'idle' | 'loading' | 'succeeded' | 'failed'>; // Loading status per room
    sendMessageStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}