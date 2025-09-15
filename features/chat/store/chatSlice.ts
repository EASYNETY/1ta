// features/chat/store/chatSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchChatMessages, deleteChatMessage, fetchChatRooms } from "./chat-thunks";
import { ChatRoom, ChatMessage, TypingUser } from "../types/chat-types";

interface ChatState {
  rooms: ChatRoom[];
  selectedRoomId: string | null;
  messages: Record<string, ChatMessage[]>;
  messageStatus: Record<string, "idle" | "loading" | "succeeded" | "failed">;
  typingUsers: Record<string, TypingUser[]>;
}

const initialState: ChatState = {
  rooms: [],
  selectedRoomId: null,
  messages: {},
  messageStatus: {},
  typingUsers: {},
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // ✅ Select a room
    selectChatRoom: (state, action: PayloadAction<string>) => {
      state.selectedRoomId = action.payload;
    },

    // ✅ Set rooms list
    setRooms: (state, action: PayloadAction<ChatRoom[]>) => {
      state.rooms = action.payload;
    },

    // ✅ Add a new message (real-time socket)
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      const msg = action.payload;
      if (!msg?.roomId) return;

      if (!state.messages[msg.roomId]) {
        state.messages[msg.roomId] = [];
      }

      // Prevent duplicates
      const exists = state.messages[msg.roomId].some((m) => m.id === msg.id);
      if (!exists) {
        state.messages[msg.roomId].push(msg);
      }
    },

    // ✅ Replace all messages for a room
    setMessages: (
      state,
      action: PayloadAction<{ roomId: string; messages: ChatMessage[] }>
    ) => {
      state.messages[action.payload.roomId] = action.payload.messages;
    },

    // ✅ Typing indicators
    setTypingUsers: (
      state,
      action: PayloadAction<{ roomId: string; users: TypingUser[] }>
    ) => {
      state.typingUsers[action.payload.roomId] = action.payload.users;
    },
  },
  extraReducers: (builder) => {
    // Fetch chat rooms
    builder.addCase(fetchChatRooms.fulfilled, (state, action) => {
      state.rooms = action.payload;
    });

    // Fetch messages
    builder.addCase(fetchChatMessages.pending, (state, action) => {
      const { roomId } = action.meta.arg;
      state.messageStatus[roomId] = "loading";
    });
    builder.addCase(fetchChatMessages.fulfilled, (state, action) => {
      const { roomId } = action.meta.arg;
      state.messages[roomId] = action.payload.data || [];
      state.messageStatus[roomId] = "succeeded";
    });
    builder.addCase(fetchChatMessages.rejected, (state, action) => {
      const { roomId } = action.meta.arg;
      state.messageStatus[roomId] = "failed";
    });

    // Delete message
    builder.addCase(deleteChatMessage.fulfilled, (state, action) => {
      const { roomId, messageId } = action.meta.arg;
      if (state.messages[roomId]) {
        state.messages[roomId] = state.messages[roomId].filter(
          (m) => m.id !== messageId
        );
      }
    });
  },
});

export const {
  selectChatRoom,
  setRooms,
  addMessage,
  setMessages,
  setTypingUsers,
} = chatSlice.actions;

export default chatSlice.reducer;

// --- SELECTORS ---

export const selectSelectedRoomId = (state: any) => state.chat.selectedRoomId;

export const selectChatRooms = (state: any) => state.chat.rooms;

export const selectCurrentRoomMessages = (state: any) => {
  const roomId = state.chat.selectedRoomId;
  return roomId ? state.chat.messages[roomId] || [] : [];
};

export const selectMessageStatusForRoom = (state: any, roomId: string) =>
  state.chat.messageStatus[roomId] || "idle";

export const selectTypingUsersForRoom = (state: any, roomId: string) =>
  state.chat.typingUsers[roomId] || [];
