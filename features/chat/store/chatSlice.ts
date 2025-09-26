// features/chat/store/chatSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchChatMessages, deleteChatMessage, fetchChatRooms, createChatRoom, updateChatRoom } from "./chat-thunks";
import { ChatRoom, ChatMessage, TypingUser, MessageStatus } from "../types/chat-types";

interface ChatState {
  rooms: ChatRoom[];
  selectedRoomId: string | null;
  messages: Record<string, ChatMessage[]>;
  messageStatus: Record<string, "idle" | "loading" | "succeeded" | "failed">;
  typingUsers: Record<string, TypingUser[]>;
  messageDrafts: Record<string, string>;
  createRoomStatus: "idle" | "loading" | "succeeded" | "failed";
  createRoomError: string | null;
  sendMessageStatus: Record<string, "idle" | "loading" | "succeeded" | "failed">;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
}

const initialState: ChatState = {
  rooms: [],
  selectedRoomId: null,
  messages: {},
  messageStatus: {},
  typingUsers: {},
  messageDrafts: {},
  createRoomStatus: "idle",
  createRoomError: null,
  sendMessageStatus: {},
  connectionStatus: "disconnected",
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    selectChatRoom: (state, action: PayloadAction<string>) => {
      state.selectedRoomId = action.payload;
    },

    setRooms: (state, action: PayloadAction<ChatRoom[]>) => {
      state.rooms = action.payload;
    },

    setTypingUsers: (
      state,
      action: PayloadAction<{ roomId: string; users: TypingUser[] }>
    ) => {
      state.typingUsers[action.payload.roomId] = action.payload.users;
    },

    // Message draft actions
    setMessageDraft: (
      state,
      action: PayloadAction<{ roomId: string; draft: string }>
    ) => {
      state.messageDrafts[action.payload.roomId] = action.payload.draft;
    },

    clearMessageDraft: (state, action: PayloadAction<string>) => {
      delete state.messageDrafts[action.payload];
    },

    // Create room actions
    createRoomPending: (state) => {
      state.createRoomStatus = "loading";
      state.createRoomError = null;
    },

    createRoomFulfilled: (state) => {
      state.createRoomStatus = "succeeded";
      state.createRoomError = null;
    },

    createRoomRejected: (state, action: PayloadAction<string>) => {
      state.createRoomStatus = "failed";
      state.createRoomError = action.payload;
    },

    clearCreateRoomStatus: (state) => {
      state.createRoomStatus = "idle";
      state.createRoomError = null;
    },

    // Send message actions
    sendMessagePending: (state, action: PayloadAction<string>) => {
      if (!state.sendMessageStatus) {
        state.sendMessageStatus = {};
      }
      state.sendMessageStatus[action.payload] = "loading";
    },

    sendMessageFulfilled: (state, action: PayloadAction<string>) => {
      if (!state.sendMessageStatus) {
        state.sendMessageStatus = {};
      }
      state.sendMessageStatus[action.payload] = "succeeded";
    },

    sendMessageRejected: (state, action: PayloadAction<string>) => {
      if (!state.sendMessageStatus) {
        state.sendMessageStatus = {};
      }
      state.sendMessageStatus[action.payload] = "failed";
    },

    clearSendMessageStatus: (state, action: PayloadAction<string>) => {
      if (state.sendMessageStatus) {
        delete state.sendMessageStatus[action.payload];
      }
    },

    // Optimistic message actions
    addOptimisticMessage: (
      state,
      action: PayloadAction<{ roomId: string; message: ChatMessage }>
    ) => {
      const { roomId, message } = action.payload;
      if (!state.messages) {
        state.messages = {};
      }
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      state.messages[roomId].push(message);
    },

    // Socket event actions
    connectionStatusChanged: (
      state,
      action: PayloadAction<"connecting" | "connected" | "disconnected" | "error">
    ) => {
      state.connectionStatus = action.payload;
    },

    messageReceived: (
      state,
      action: PayloadAction<{ roomId: string; message: ChatMessage } | ChatMessage>
    ) => {
      try {
        // Extract roomId and message
        let roomId: string;
        let message: ChatMessage;

        if ('roomId' in action.payload && 'message' in action.payload) {
          roomId = action.payload.roomId;
          message = action.payload.message;
        } else if ('roomId' in action.payload && 'id' in action.payload) {
          roomId = action.payload.roomId;
          message = action.payload as ChatMessage;
        } else if ('room' in action.payload) {
          roomId = action.payload.room.id;
          message = action.payload as ChatMessage;
        } else {
          return;
        }

        // Initialize state if needed
        if (!state.messages) state.messages = {};
        if (!state.messages[roomId]) state.messages[roomId] = [];

        // Normalize message
        const normalizedMessage = {
          ...message,
          id: message.id || message.tempId || `temp_${Date.now()}`,
          timestamp: message.timestamp || new Date().toISOString(),
          status: message.status || MessageStatus.DELIVERED,
          isOptimistic: false,
          roomId
        };

        // Update or add message efficiently
        const messages = state.messages[roomId];
        const existingIndex = messages.findIndex(
          m => m.id === normalizedMessage.id || m.tempId === normalizedMessage.tempId
        );

        if (existingIndex !== -1) {
          messages[existingIndex] = normalizedMessage;
        } else {
          messages.push(normalizedMessage);
          // Only sort if adding a new message
          messages.sort((a, b) => 
            (new Date(a.timestamp || 0)).getTime() - (new Date(b.timestamp || 0)).getTime()
          );
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    },

    messageDelivered: (
      state,
      action: PayloadAction<{ messageId: string; roomId: string }>
    ) => {
      const { messageId, roomId } = action.payload;
      const messages = state.messages?.[roomId];
      if (messages) {
        const message = messages.find(m => m.id === messageId);
        if (message) {
          message.status = MessageStatus.DELIVERED;
        }
      }
    },

    messageRead: (
      state,
      action: PayloadAction<{ messageId: string; roomId: string; userId: string }>
    ) => {
      const { messageId, roomId } = action.payload;
      const messages = state.messages?.[roomId];
      if (messages) {
        const message = messages.find(m => m.id === messageId);
        if (message) {
          message.status = MessageStatus.READ;
          if (!message.readBy) {
            message.readBy = [];
          }
          message.readBy.push(action.payload.userId);
        }
      }
    },

    userJoined: (
      state,
      action: PayloadAction<{ roomId: string; user: any }>
    ) => {
      // Handle user joined room
    },

    userLeft: (
      state,
      action: PayloadAction<{ roomId: string; userId: string }>
    ) => {
      // Handle user left room
    },

    userTyping: (
      state,
      action: PayloadAction<{ roomId: string; user: TypingUser }>
    ) => {
      const { roomId, user } = action.payload;
      if (!state.typingUsers[roomId]) {
        state.typingUsers[roomId] = [];
      }
      const existingIndex = state.typingUsers[roomId].findIndex(u => u.userId === user.userId);
      if (user.isTyping) {
        if (existingIndex === -1) {
          state.typingUsers[roomId].push(user);
        }
      } else {
        if (existingIndex !== -1) {
          state.typingUsers[roomId].splice(existingIndex, 1);
        }
      }
    },

    setCurrentUserTyping: (
      state,
      action: PayloadAction<{ roomId: string; userId: string; isTyping: boolean }>
    ) => {
      const { roomId, userId, isTyping } = action.payload;
      if (!state.typingUsers[roomId]) {
        state.typingUsers[roomId] = [];
      }

      const user: TypingUser = {
        userId,
        userName: "Current User", // This should be replaced with actual user name
        isTyping,
        timestamp: Date.now()
      };

      const existingIndex = state.typingUsers[roomId].findIndex(u => u.userId === userId);
      if (isTyping) {
        if (existingIndex === -1) {
          state.typingUsers[roomId].push(user);
        } else {
          state.typingUsers[roomId][existingIndex] = user;
        }
      } else {
        if (existingIndex !== -1) {
          state.typingUsers[roomId].splice(existingIndex, 1);
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Create room cases
    builder.addCase(createChatRoom.pending, (state) => {
      state.createRoomStatus = "loading";
      state.createRoomError = null;
    });

    builder.addCase(createChatRoom.fulfilled, (state, action) => {
      state.createRoomStatus = "succeeded";
      state.createRoomError = null;
      // Add the new room to the rooms list
      if (action.payload && !state.rooms.find(room => room.id === action.payload.id)) {
        state.rooms.push(action.payload);
      }
    });

    builder.addCase(createChatRoom.rejected, (state, action) => {
      state.createRoomStatus = "failed";
      state.createRoomError = action.payload || "Failed to create room";
    });

    builder.addCase(fetchChatRooms.fulfilled, (state, action) => {
      state.rooms = action.payload;
    });

    builder.addCase(fetchChatMessages.pending, (state, action) => {
      const { roomId } = action.meta.arg;
      if (!state.messageStatus) {
        state.messageStatus = {};
      }
      state.messageStatus[roomId] = "loading";
    });

    // 🚀 Merge new messages with existing ones
    builder.addCase(fetchChatMessages.fulfilled, (state, action) => {
      const { roomId } = action.meta.arg;
      if (!state.messages) state.messages = {};
      if (!state.messageStatus) state.messageStatus = {};

      const newMessages = action.payload.data || [];
      const existingMessages = state.messages[roomId] || [];
      const messageMap = new Map(existingMessages.map(msg => [msg.id, msg]));

      // More efficient merge using Map
      newMessages.forEach(newMsg => {
        if (!messageMap.has(newMsg.id)) {
          messageMap.set(newMsg.id, newMsg);
        }
      });

      // Convert back to array and sort only once
      const mergedMessages = Array.from(messageMap.values()).sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeA - timeB;
      });

      state.messages[roomId] = mergedMessages;
      state.messageStatus[roomId] = "succeeded";
    });

    builder.addCase(fetchChatMessages.rejected, (state, action) => {
      const { roomId } = action.meta.arg;
      if (!state.messageStatus) {
        state.messageStatus = {};
      }
      state.messageStatus[roomId] = "failed";
    });

    builder.addCase(deleteChatMessage.fulfilled, (state, action) => {
      const { roomId, messageId } = action.meta.arg;
      if (state.messages?.[roomId]) {
        state.messages[roomId] = state.messages[roomId].filter(
          (m) => m.id !== messageId
        );
      }
    });

    // Update room cases
    builder.addCase(updateChatRoom.pending, (state) => {
      // Add loading state for room updates if needed
    });

    builder.addCase(updateChatRoom.fulfilled, (state, action) => {
      // Update the room in the rooms list
      if (action.payload) {
        const updatedRoom = action.payload as ChatRoom;
        const existingIndex = state.rooms.findIndex(room => room.id === updatedRoom.id);
        if (existingIndex !== -1) {
          state.rooms[existingIndex] = updatedRoom;
        }
      }
    });

    builder.addCase(updateChatRoom.rejected, (state, action) => {
      // Handle update failure if needed
      console.error('Room update failed:', action.payload);
    });
  },
});

export const {
  selectChatRoom,
  setRooms,
  setTypingUsers,
  setMessageDraft,
  clearMessageDraft,
  createRoomPending,
  createRoomFulfilled,
  createRoomRejected,
  clearCreateRoomStatus,
  sendMessagePending,
  sendMessageFulfilled,
  sendMessageRejected,
  clearSendMessageStatus,
  addOptimisticMessage,
  connectionStatusChanged,
  messageReceived,
  messageDelivered,
  messageRead,
  userJoined,
  userLeft,
  userTyping,
  setCurrentUserTyping
} = chatSlice.actions;

// Action creators for external use
export const setCurrentUserTypingAction = (roomId: string, userId: string, isTyping: boolean) => ({
  type: setCurrentUserTyping.type,
  payload: { roomId, userId, isTyping }
});

export default chatSlice.reducer;

// --- SELECTORS ---

export const selectSelectedRoomId = (state: any) => state.chat.selectedRoomId;

export const selectChatRooms = (state: any) => {
  const rooms = state.chat?.rooms;
  return Array.isArray(rooms) ? rooms : [];
};

export const selectCurrentRoomMessages = (state: any) => {
  const roomId = state.chat?.selectedRoomId;
  if (!roomId) return [];

  const messages = state.chat?.messages?.[roomId];
  return Array.isArray(messages) ? messages : [];
};

export const selectMessageStatusForRoom = (state: any, roomId: string) =>
  state.chat.messageStatus[roomId] || "idle";

export const selectTypingUsersForRoom = (state: any, roomId: string) =>
  state.chat.typingUsers[roomId] || [];

export const selectChatUnreadCount = (state: any) => {
  const rooms = state.chat.rooms;

  // Ensure rooms is an array before calling reduce
  if (!rooms || !Array.isArray(rooms) || rooms.length === 0) return 0;

  return rooms.reduce((total: number, room: ChatRoom) => {
    return total + (room.unreadCount || 0);
  }, 0);
};

// Additional selectors
export const selectSelectedRoom = (state: any) => state.chat.selectedRoomId;

export const selectMessageDraftForRoom = (state: any, roomId: string) =>
  state.chat.messageDrafts[roomId] || "";

export const selectIsUserTypingInRoom = (state: any, roomId: string, userId: string) => {
  const typingUsers = state.chat.typingUsers[roomId] || [];
  return typingUsers.some((user: TypingUser) => user.userId === userId && user.isTyping);
};

export const selectCreateRoomStatus = (state: any) => state.chat.createRoomStatus;

export const selectCreateRoomError = (state: any) => state.chat.createRoomError;

export const selectSendMessageStatus = (state: any, roomId: string) =>
  state.chat.sendMessageStatus[roomId] || "idle";

export const selectConnectionStatus = (state: any) => state.chat.connectionStatus;
