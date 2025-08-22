// features/chat/types/chat-types.ts - Enhanced with real-time features

export enum ChatRoomType {
    COURSE = 'course',
    CLASS = 'class',
    EVENT = 'event',
    ANNOUNCEMENT = 'announcement',
    GROUP = 'group',
    DIRECT = 'direct'
}

export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    FILE = 'file',
    AUDIO = 'audio',
    VIDEO = 'video',
    SYSTEM = 'system',
    LOCATION = 'location',
    CONTACT = 'contact'
}

export enum MessageStatus {
    SENDING = 'sending',
    SENT = 'sent',
    DELIVERED = 'delivered',
    READ = 'read',
    FAILED = 'failed'
}

export enum UserStatus {
    ONLINE = 'online',
    AWAY = 'away',
    BUSY = 'busy',
    OFFLINE = 'offline'
}

export interface ChatUser {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string;
    role?: string;
    status?: UserStatus;
    lastSeen?: string;
    isTyping?: boolean;
}

export interface ChatRoom {
    id: string;
    name: string;
    description?: string;
    type: ChatRoomType;
    participants: ChatUser[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    lastMessage?: {
        content: string;
        sender: { name: string };
        timestamp: string;
    };
    lastMessageAt?: string;
    lastActivity: string;
    isArchived?: boolean;
    isPinned?: boolean;
    settings?: {
        allowFileSharing: boolean;
        allowVoiceMessages: boolean;
        muteNotifications: boolean;
        autoDeleteMessages?: number; // days
    };
    metadata?: {
        courseId?: string;
        classId?: string;
        eventId?: string;
        [key: string]: any;
    };
}

export interface MessageMetadata {
    // File metadata
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    fileUrl?: string;
    thumbnailUrl?: string;
    
    // Image metadata
    imageUrl?: string;
    imageWidth?: number;
    imageHeight?: number;
    
    // Audio metadata
    audioUrl?: string;
    duration?: string;
    waveform?: number[];
    
    // Video metadata
    videoUrl?: string;
    videoDuration?: string;
    videoThumbnail?: string;
    
    // Location metadata
    latitude?: number;
    longitude?: number;
    address?: string;
    
    // Contact metadata
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    
    // System metadata
    systemMessageType?: 'user_joined' | 'user_left' | 'room_created' | 'settings_changed';
    
    // Edit history
    isEdited?: boolean;
    editedAt?: string;
    originalContent?: string;
    
    // Reply metadata
    replyToMessageId?: string;
    replyToContent?: string;
    
    // Rich content
    mentions?: string[]; // user IDs mentioned in message
    hashtags?: string[];
    links?: Array<{
        url: string;
        title?: string;
        description?: string;
        thumbnail?: string;
    }>;
    
    [key: string]: any;
}

export interface ChatMessage {
    id: string;
    tempId?: string; // For optimistic updates
    roomId: string;
    content: string;
    senderId: string;
    senderName: string;
    type: MessageType;
    status: MessageStatus;
    timestamp: string;
    deliveredAt?: string;
    readAt?: string;
    readBy?: string[];
    parentMessageId?: string | null;
    metadata?: MessageMetadata;
    isOptimistic?: boolean;
    isEdited?: boolean;
    editedAt?: string;
    error?: string;
    sender: {
        id: string;
        name: string;
        avatarUrl?: string;
        role?: string;
    };
    // Real-time features
    reactions?: Array<{
        emoji: string;
        users: string[];
        count: number;
    }>;
    isForwarded?: boolean;
    forwardedFrom?: {
        roomId: string;
        roomName: string;
        originalSender: string;
    };
    isPinned?: boolean;
    pinnedAt?: string;
    pinnedBy?: string;
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
    error?: string;
    retryCount?: number;
}

export interface OnlineUser {
    id: string;
    name: string;
    avatarUrl?: string;
    status: UserStatus;
    lastSeen: string;
    rooms: string[]; // room IDs user is currently in
}

export interface ChatNotification {
    id: string;
    type: 'message' | 'mention' | 'room_invite' | 'system';
    title: string;
    message: string;
    roomId?: string;
    senderId?: string;
    timestamp: string;
    isRead: boolean;
    metadata?: {
        messageId?: string;
        roomName?: string;
        senderName?: string;
        [key: string]: any;
    };
}

export interface MessageReaction {
    id: string;
    messageId: string;
    emoji: string;
    userId: string;
    userName: string;
    timestamp: string;
}

export interface RoomSettings {
    id: string;
    roomId: string;
    userId: string;
    muteNotifications: boolean;
    showPreviews: boolean;
    customNotificationSound?: string;
    autoDownloadMedia: 'never' | 'wifi' | 'always';
    fontSize: 'small' | 'medium' | 'large';
    theme: 'auto' | 'light' | 'dark';
    lastReadMessageId?: string;
    pinnedMessages: string[];
    hiddenMessages: string[];
}

export interface Draft {
    roomId: string;
    content: string;
    timestamp: string;
    mentionedUsers: string[];
    attachments: File[];
}

export interface FileUpload {
    id: string;
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'failed';
    url?: string;
    error?: string;
}

export interface ChatState {
    // Core data
    rooms: ChatRoom[];
    messagesByRoom: Record<string, ChatMessage[]>;
    selectedRoomId: string | null;
    
    // Loading states
    roomStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    messageStatus: Record<string, 'idle' | 'loading' | 'succeeded' | 'failed'>;
    
    // Real-time features
    connectionStatus: ConnectionStatus;
    onlineUsers: Record<string, OnlineUser>;
    typingUsers: Record<string, TypingUser[]>;
    
    // User interactions
    messageDrafts: Record<string, string>;
    unreadCounts: Record<string, number>;
    notifications: ChatNotification[];
    
    // Message status tracking
    deliveryStatus: Record<string, MessageStatus>;
    readReceipts: Record<string, Array<{ userId: string; readAt: string }>>;
    
    // UI state
    isTyping: Record<string, boolean>;
    searchQuery: string;
    selectedMessages: string[];
    replyToMessage: ChatMessage | null;
    
    // Settings
    userSettings: {
        notificationsEnabled: boolean;
        soundEnabled: boolean;
        enterToSend: boolean;
        showTimestamps: boolean;
        compactMode: boolean;
        theme: 'auto' | 'light' | 'dark';
    };
    
    // File uploads
    uploads: Record<string, FileUpload>;
    
    // Error states
    roomError: string | null;
    messageErrors: Record<string, string | null>;
}

// API Response Types
export interface ChatRoomsResponse {
    success: boolean;
    data: ChatRoom[];
    meta: {
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
    };
}

export interface ChatMessagesResponse {
    success: boolean;
    data: {
        messages: ChatMessage[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
            hasMore: boolean;
        };
    };
}

export interface SendMessageRequest {
    roomId: string;
    content: string;
    type: MessageType;
    parentMessageId?: string;
    metadata?: MessageMetadata;
    tempId?: string;
}

export interface CreateRoomRequest {
    name: string;
    description?: string;
    type: ChatRoomType;
    participantIds: string[];
    settings?: {
        allowFileSharing?: boolean;
        allowVoiceMessages?: boolean;
        autoDeleteMessages?: number;
    };
    metadata?: Record<string, any>;
}

// Socket Event Types
export interface SocketEventMap {
    // Connection events
    connect: () => void;
    disconnect: (reason: string) => void;
    authenticate: (data: { userId: string; userName: string; userEmail: string; userRole: string }) => void;
    
    // Room events
    joinRoom: (data: { roomId: string; userId: string; userName: string }) => void;
    leaveRoom: (data: { roomId: string; userId: string; userName: string }) => void;
    roomJoined: (data: { roomId: string; message: string; timestamp: string }) => void;
    roomLeft: (data: { roomId: string; message: string; timestamp: string }) => void;
    roomCreated: (data: { room: ChatRoom; message: string }) => void;
    
    // Message events
    newMessage: (message: ChatMessage) => void;
    messageDelivered: (data: { messageId: string; roomId: string; deliveredAt: string }) => void;
    messageRead: (data: { messageId: string; roomId: string; readAt: string; readBy: string }) => void;
    messageDeleted: (data: { messageId: string; roomId: string; deletedBy: string }) => void;
    messageReaction: (data: { messageId: string; roomId: string; emoji: string; userId: string; action: 'add' | 'remove' }) => void;
    
    // Typing events
    typing: (data: { roomId: string; userId: string; userName: string }) => void;
    stopTyping: (data: { roomId: string; userId: string; userName: string }) => void;
    userTyping: (data: { roomId: string; userId: string; userName: string; isTyping: boolean }) => void;
    
    // Presence events
    userJoined: (data: { userId: string; userName: string; roomId: string; timestamp: string }) => void;
    userLeft: (data: { userId: string; userName: string; roomId: string; timestamp: string }) => void;
    presenceUpdate: (data: { userId: string; status: UserStatus; lastSeen: string }) => void;
    onlineUsers: (users: OnlineUser[]) => void;
    
    // File events
    fileUploadProgress: (data: { uploadId: string; progress: number }) => void;
    fileUploaded: (data: { uploadId: string; url: string; metadata: MessageMetadata }) => void;
    fileUploadError: (data: { uploadId: string; error: string }) => void;
}

// Hook return types
export interface UseSocketReturn {
    isConnected: boolean;
    connectionStatus: string;
    joinRoom: (roomId: string) => void;
    leaveRoom: (roomId: string) => void;
    sendMessage: (roomId: string, content: string, type?: MessageType, metadata?: MessageMetadata) => Promise<any>;
    startTyping: (roomId: string) => void;
    stopTyping: (roomId: string) => void;
    markMessageAsRead: (messageId: string, roomId: string) => void;
    markRoomAsRead: (roomId: string) => void;
    uploadFile: (file: File, roomId: string, onProgress?: (progress: number) => void) => Promise<any>;
    updateUserPresence: (status: UserStatus) => void;
    addReaction: (messageId: string, roomId: string, emoji: string) => void;
    removeReaction: (messageId: string, roomId: string, emoji: string) => void;
}