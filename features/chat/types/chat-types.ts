// features/chat/types/chat-types.ts

export enum ChatRoomType {
    COURSE = 'course',
    CLASS = 'class', 
    EVENT = 'event',
    ANNOUNCEMENT = 'announcement'
}

export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    FILE = 'file',
    AUDIO = 'audio',
    VIDEO = 'video',
    SYSTEM = 'system'
}

// This was missing from your exports - required by multiple components
export enum MessageStatus {
    SENDING = 'sending',
    SENT = 'sent',
    DELIVERED = 'delivered',
    READ = 'read',
    FAILED = 'failed'
}

export interface ChatRoom {
    id: string;
    name: string;
    type: ChatRoomType;
    description?: string;
    createdAt: string;
    updatedAt: string;
    lastMessageAt?: string;
    participants: Array<{
        id: string;
        name: string;
        email?: string;
        role?: string;
        avatarUrl?: string;
        displayName?: string;
    }>;
    lastMessage?: {
        content: string;
        sender: {
            name: string;
        };
        timestamp: string;
    };
    unreadCount?: number;
}

export interface ChatMessage {
    id: string;
    roomId: string;
    content: string;
    senderId: string;
    senderName?: string;
    type: MessageType;
    timestamp: string;
    status?: MessageStatus;
    isOptimistic?: boolean;
    error?: string;
    tempId?: string;
    parentMessageId?: string | null;
    deliveredAt?: string;
    readAt?: string;
    readBy?: string[];
    metadata?: {
        fileName?: string;
        fileSize?: number;
        fileType?: string;
        fileUrl?: string;
        imageUrl?: string;
        audioUrl?: string;
        duration?: string;
        isEdited?: boolean;
    };
    sender?: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
}

export interface TypingUser {
    userId: string;
    userName: string;
    isTyping: boolean;
    timestamp: number;
}

export interface ConnectionStatus {
    status: 'connecting' | 'connected' | 'disconnected' | 'error';
    timestamp: number;
    error?: string | null;
}

export interface ChatUser {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string;
    role?: string;
    status?: 'online' | 'offline' | 'away';
    lastSeen?: string;
}
