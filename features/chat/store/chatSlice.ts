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
  },
  extraReducers: (builder) => {
    builder.addCase(fetchChatRooms.fulfilled, (state, action) => {
      state.rooms = action.payload;
    });

    builder.addCase(fetchChatMessages.pending, (state, action) => {
      const { roomId } = action.meta.arg;
      state.messageStatus[roomId] = "loading";
    });

    // 🚀 Hard reload: always replace messages
    builder.addCase(fetchChatMessages.fulfilled, (state, action) => {
      const { roomId } = action.meta.arg;
      state.messages[roomId] = action.payload.data || [];
      state.messageStatus[roomId] = "succeeded";
    });

    builder.addCase(fetchChatMessages.rejected, (state, action) => {
      const { roomId } = action.meta.arg;
      state.messageStatus[roomId] = "failed";
    });

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

export const { selectChatRoom, setRooms, setTypingUsers } = chatSlice.actions;

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
