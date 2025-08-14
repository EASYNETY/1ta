// store/chatSlice.ts - Enhanced with real-time features
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatRoom, ChatMessage, MessageStatus, TypingUser, ConnectionStatus } from '../types/chat-types';

interface ChatState {
    // Rooms
    rooms: ChatRoom[];
    selectedRoomId: string | null;
    roomStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    roomError: string | null;

    // Messages
    messagesByRoom: Record<string, ChatMessage[]>;
    messageStatus: Record<string, 'idle' | 'loading' | 'succeeded' | 'failed'>;
    messageErrors: Record<string, string | null>;
    
    // Real-time features
    typingUsers: Record<string, TypingUser[]>; // roomId -> typing users
    onlineUsers: Record<string, any>; // userId -> user info
    connectionStatus: ConnectionStatus;
    
    // Message status tracking
    deliveryStatus: Record<string, MessageStatus>; // messageId -> status
    readReceipts: Record<string, { readBy: string[], readAt: string }[]>; // messageId -> read info
    
    // Unread counts
    unreadCounts: Record<string, number>; // roomId -> count
    
    // Drafts
    messageDrafts: Record<string, string>; // roomId -> draft text
    
    // UI state
    isTyping: Record<string, boolean>; // roomId -> is current user typing
    lastSeen: Record<string, string>; // userId -> last seen timestamp
}

const initialState: ChatState = {
    rooms: [],
    selectedRoomId: null,
    roomStatus: 'idle',
    roomError: null,
    
    messagesByRoom: {},
    messageStatus: {},
    messageErrors: {},
    
    typingUsers: {},
    onlineUsers: {},
    connectionStatus: {
        status: 'disconnected',
        timestamp: Date.now(),
        error: null
    },
    
    deliveryStatus: {},
    readReceipts: {},
    unreadCounts: {},
    messageDrafts: {},
    isTyping: {},
    lastSeen: {}
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        // Room management
        selectChatRoom: (state, action: PayloadAction<string | null>) => {
            const previousRoomId = state.selectedRoomId;
            state.selectedRoomId = action.payload;
            
            // Clear unread count when selecting room
            if (action.payload) {
                state.unreadCounts[action.payload] = 0;
            }
            
            // Clear typing status for previous room
            if (previousRoomId) {
                state.isTyping[previousRoomId] = false;
            }
        },

        setRoomStatus: (state, action: PayloadAction<'idle' | 'loading' | 'succeeded' | 'failed'>) => {
            state.roomStatus = action.payload;
        },

        setRooms: (state, action: PayloadAction<ChatRoom[]>) => {
            state.rooms = action.payload;
            state.roomStatus = 'succeeded';
        },

        // Message management
        setMessages: (state, action: PayloadAction<{ roomId: string; messages: ChatMessage[]; append?: boolean }>) => {
            const { roomId, messages, append = false } = action.payload;
            
            if (append) {
                const existing = state.messagesByRoom[roomId] || [];
                // Avoid duplicates
                const newMessages = messages.filter(msg => 
                    !existing.some(existing => existing.id === msg.id)
                );
                state.messagesByRoom[roomId] = [...existing, ...newMessages];
            } else {
                state.messagesByRoom[roomId] = messages;
            }
            
            state.messageStatus[roomId] = 'succeeded';
        },

        messageReceived: (state, action: PayloadAction<ChatMessage>) => {
            const message = action.payload;
            const roomId = message.roomId;
            
            if (!state.messagesByRoom[roomId]) {
                state.messagesByRoom[roomId] = [];
            }
            
            // Avoid duplicates
            const exists = state.messagesByRoom[roomId].some(m => m.id === message.id);
            if (!exists) {
                state.messagesByRoom[roomId].push(message);
                
                // Update room's last message
                const room = state.rooms.find(r => r.id === roomId);
                if (room) {
                    room.lastMessage = {
                        content: message.content,
                        sender: { name: message.senderName || 'Unknown' },
                        timestamp: message.timestamp
                    };
                    room.lastMessageAt = message.timestamp;
                }
                
                // Increment unread count if not current room or user is not sender
                const currentUserId = getCurrentUserId(); // You'll need to implement this
                if (roomId !== state.selectedRoomId && message.senderId !== currentUserId) {
                    state.unreadCounts[roomId] = (state.unreadCounts[roomId] || 0) + 1;
                }
            }
        },

        messageSent: (state, action: PayloadAction<{ tempId: string; message: ChatMessage }>) => {
            const { tempId, message } = action.payload;
            const roomId = message.roomId;
            
            if (state.messagesByRoom[roomId]) {
                // Replace temp message with real message
                const tempIndex = state.messagesByRoom[roomId].findIndex(m => m.id === tempId);
                if (tempIndex !== -1) {
                    state.messagesByRoom[roomId][tempIndex] = message;
                } else {
                    state.messagesByRoom[roomId].push(message);
                }
            }
        },

        addOptimisticMessage: (state, action: PayloadAction<ChatMessage & { tempId: string }>) => {
            const message = action.payload;
            const roomId = message.roomId;
            
            if (!state.messagesByRoom[roomId]) {
                state.messagesByRoom[roomId] = [];
            }
            
            // Add optimistic message with temp ID
            state.messagesByRoom[roomId].push({
                ...message,
                isOptimistic: true,
                status: MessageStatus.SENDING
            });
        },

        updateMessageStatus: (state, action: PayloadAction<{ messageId: string; status: MessageStatus; error?: string }>) => {
            const { messageId, status, error } = action.payload;
            
            // Find and update message in all rooms
            Object.values(state.messagesByRoom).forEach(messages => {
                const message = messages.find(m => m.id === messageId);
                if (message) {
                    message.status = status;
                    if (error) message.error = error;
                    if (status === MessageStatus.SENT) {
                        message.isOptimistic = false;
                    }
                }
            });
            
            state.deliveryStatus[messageId] = status;
        },

        // Real-time features
        connectionStatusChanged: (state, action: PayloadAction<ConnectionStatus>) => {
            state.connectionStatus = action.payload;
        },

        userJoined: (state, action: PayloadAction<{ userId: string; userName: string; roomId: string }>) => {
            const { userId, userName, roomId } = action.payload;
            state.onlineUsers[userId] = {
                id: userId,
                name: userName,
                status: 'online',
                lastSeen: new Date().toISOString()
            };
        },

        userLeft: (state, action: PayloadAction<{ userId: string; roomId: string }>) => {
            const { userId } = action.payload;
            if (state.onlineUsers[userId]) {
                state.onlineUsers[userId].status = 'offline';
                state.onlineUsers[userId].lastSeen = new Date().toISOString();
            }
        },

        userTyping: (state, action: PayloadAction<{ roomId: string; userId: string; userName: string; isTyping: boolean }>) => {
            const { roomId, userId, userName, isTyping } = action.payload;
            
            if (!state.typingUsers[roomId]) {
                state.typingUsers[roomId] = [];
            }
            
            const typingUserIndex = state.typingUsers[roomId].findIndex(u => u.userId === userId);
            
            if (isTyping) {
                if (typingUserIndex === -1) {
                    state.typingUsers[roomId].push({
                        userId,
                        userName,
                        isTyping: true,
                        timestamp: Date.now()
                    });
                } else {
                    state.typingUsers[roomId][typingUserIndex].timestamp = Date.now();
                }
            } else {
                if (typingUserIndex !== -1) {
                    state.typingUsers[roomId].splice(typingUserIndex, 1);
                }
            }
        },

        setCurrentUserTyping: (state, action: PayloadAction<{ roomId: string; isTyping: boolean }>) => {
            const { roomId, isTyping } = action.payload;
            state.isTyping[roomId] = isTyping;
        },

        // Message status tracking
        messageDelivered: (state, action: PayloadAction<{ messageId: string; roomId: string; deliveredAt: string }>) => {
            const { messageId, deliveredAt } = action.payload;
            state.deliveryStatus[messageId] = MessageStatus.DELIVERED;
            
            // Update message in room
            Object.values(state.messagesByRoom).forEach(messages => {
                const message = messages.find(m => m.id === messageId);
                if (message) {
                    message.status = MessageStatus.DELIVERED;
                    message.deliveredAt = deliveredAt;
                }
            });
        },

        messageRead: (state, action: PayloadAction<{ messageId: string; roomId: string; readAt: string; readBy: string }>) => {
            const { messageId, readAt, readBy } = action.payload;
            state.deliveryStatus[messageId] = MessageStatus.READ;
            
            if (!state.readReceipts[messageId]) {
                state.readReceipts[messageId] = [];
            }
            
            const readInfo = { readBy: [readBy], readAt };
            state.readReceipts[messageId].push(readInfo);
            
            // Update message in room
            Object.values(state.messagesByRoom).forEach(messages => {
                const message = messages.find(m => m.id === messageId);
                if (message) {
                    message.status = MessageStatus.READ;
                    message.readAt = readAt;
                }
            });
        },

        // Draft management
        updateMessageDraft: (state, action: PayloadAction<{ roomId: string; draft: string }>) => {
            const { roomId, draft } = action.payload;
            if (draft.trim()) {
                state.messageDrafts[roomId] = draft;
            } else {
                delete state.messageDrafts[roomId];
            }
        },

        clearMessageDraft: (state, action: PayloadAction<string>) => {
            const roomId = action.payload;
            delete state.messageDrafts[roomId];
        },

        // Unread counts
        setUnreadCount: (state, action: PayloadAction<{ roomId: string; count: number }>) => {
            const { roomId, count } = action.payload;
            state.unreadCounts[roomId] = count;
        },

        markRoomAsRead: (state, action: PayloadAction<string>) => {
            const roomId = action.payload;
            state.unreadCounts[roomId] = 0;
        },

        // Error handling
        setRoomError: (state, action: PayloadAction<string | null>) => {
            state.roomError = action.payload;
            state.roomStatus = action.payload ? 'failed' : state.roomStatus;
        },

        setMessageError: (state, action: PayloadAction<{ roomId: string; error: string | null }>) => {
            const { roomId, error } = action.payload;
            state.messageErrors[roomId] = error;
            state.messageStatus[roomId] = error ? 'failed' : state.messageStatus[roomId];
        },

        // Clean up
        clearChatData: (state) => {
            return initialState;
        }
    }
});

// Helper function to get current user ID
// You'll need to implement this based on your auth system
function getCurrentUserId(): string | null {
    // This should return the current user's ID
    // You might get it from the auth slice or localStorage
    return null; // Implement this
}

export const {
    selectChatRoom,
    setRoomStatus,
    setRooms,
    setMessages,
    messageReceived,
    messageSent,
    addOptimisticMessage,
    updateMessageStatus,
    connectionStatusChanged,
    userJoined,
    userLeft,
    userTyping,
    setCurrentUserTyping,
    messageDelivered,
    messageRead,
    updateMessageDraft,
    clearMessageDraft,
    setUnreadCount,
    markRoomAsRead,
    setRoomError,
    setMessageError,
    clearChatData
} = chatSlice.actions;

// Enhanced selectors
export const selectChatRooms = (state: any) => state.chat.rooms;
export const selectSelectedRoomId = (state: any) => state.chat.selectedRoomId;
export const selectSelectedRoom = (state: any) => {
    const selectedRoomId = state.chat.selectedRoomId;
    return selectedRoomId ? state.chat.rooms.find((room: ChatRoom) => room.id === selectedRoomId) : null;
};

export const selectCurrentRoomMessages = (state: any) => {
    const selectedRoomId = state.chat.selectedRoomId;
    return selectedRoomId ? state.chat.messagesByRoom[selectedRoomId] || [] : [];
};

export const selectRoomStatus = (state: any) => state.chat.roomStatus;
export const selectMessageStatusForRoom = (state: any, roomId: string) => 
    state.chat.messageStatus[roomId] || 'idle';

export const selectTypingUsersForRoom = (state: any, roomId: string) => 
    state.chat.typingUsers[roomId] || [];

export const selectConnectionStatus = (state: any) => state.chat.connectionStatus;

export const selectUnreadCountForRoom = (state: any, roomId: string) => 
    state.chat.unreadCounts[roomId] || 0;

export const selectChatUnreadCount = (state: any) => 
    Object.values(state.chat.unreadCounts).reduce((sum: number, count: number) => sum + count, 0);

export const selectMessageDraftForRoom = (state: any, roomId: string) => 
    state.chat.messageDrafts[roomId] || '';

export const selectIsUserTypingInRoom = (state: any, roomId: string) => 
    state.chat.isTyping[roomId] || false;

export const selectOnlineUsers = (state: any) => state.chat.onlineUsers;

export const selectMessageStatus = (state: any, messageId: string) => 
    state.chat.deliveryStatus[messageId] || MessageStatus.SENDING;

export const selectReadReceipts = (state: any, messageId: string) => 
    state.chat.readReceipts[messageId] || [];

export default chatSlice.reducer;