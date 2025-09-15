// features/chat/store/chatSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchChatMessages, deleteChatMessage, fetchChatRooms } from "./chat-thunks";
import { ChatRoom, ChatMessage, TypingUser } from "../types/chat-types";

/**
 * NOTE:
 * - fetchChatMessages thunk **must** include `roomId` and `page` in meta.arg
 *   (e.g. dispatch(fetchChatMessages({ roomId, page, limit })) ).
 */

interface ChatState {
  rooms: ChatRoom[];
  selectedRoomId: string | null;
  messages: Record<string, ChatMessage[]>; // messages[roomId] = array (oldest -> newest)
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

const dedupeById = (arr: ChatMessage[]) => {
  const seen = new Set<string>();
  const out: ChatMessage[] = [];
  for (const m of arr) {
    if (!m?.id) continue;
    if (!seen.has(m.id)) {
      seen.add(m.id);
      out.push(m);
    }
  }
  return out;
};

const getMessageTimestamp = (m: any) => {
  const maybe = m?.createdAt ?? m?.timestamp ?? m?.created_at ?? m?.ts ?? m?.time;
  if (typeof maybe === "number") return maybe;
  if (!maybe) return 0;
  const t = Date.parse(maybe + "");
  return Number.isNaN(t) ? 0 : t;
};

// Ensure messages are in chronological order (oldest -> newest)
const sortChronological = (arr: ChatMessage[]) =>
  arr.slice().sort((a, b) => getMessageTimestamp(a) - getMessageTimestamp(b));

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

    // Add a single message (socket)
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      const msg = action.payload;
      if (!msg?.roomId) return;
      const roomId = msg.roomId;

      if (!state.messages[roomId]) state.messages[roomId] = [];

      // If message exists, ignore
      const exists = state.messages[roomId].some((m) => m.id === msg.id);
      if (!exists) {
        state.messages[roomId].push(msg);
        // keep chronological order
        state.messages[roomId] = sortChronological(state.messages[roomId]);
      }
    },

    // Update a message (edits / delivered / read status)
    updateMessage: (state, action: PayloadAction<ChatMessage>) => {
      const msg = action.payload;
      if (!msg?.roomId) return;
      const roomId = msg.roomId;
      if (!state.messages[roomId]) return;
      const idx = state.messages[roomId].findIndex((m) => m.id === msg.id);
      if (idx >= 0) {
        state.messages[roomId][idx] = { ...state.messages[roomId][idx], ...msg };
      }
    },

    // Replace messages for a room (rarely used directly)
    setMessages: (state, action: PayloadAction<{ roomId: string; messages: ChatMessage[] }>) => {
      const { roomId, messages } = action.payload;
      state.messages[roomId] = sortChronological(dedupeById(messages));
    },

    setTypingUsers: (state, action: PayloadAction<{ roomId: string; users: TypingUser[] }>) => {
      state.typingUsers[action.payload.roomId] = action.payload.users;
    },

    clearMessagesForRoom: (state, action: PayloadAction<{ roomId: string }>) => {
      state.messages[action.payload.roomId] = [];
      state.messageStatus[action.payload.roomId] = "idle";
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchChatRooms.fulfilled, (state, action) => {
      state.rooms = action.payload;
    });

    // fetchChatMessages lifecycle
    builder.addCase(fetchChatMessages.pending, (state, action) => {
      const { roomId } = action.meta.arg as any;
      if (!roomId) return;
      state.messageStatus[roomId] = "loading";
    });

    builder.addCase(fetchChatMessages.fulfilled, (state, action) => {
      const { roomId, page = 1 } = (action.meta.arg as any) || {};
      if (!roomId) return;
      const fetched: ChatMessage[] = (action.payload && action.payload.data) || [];

      // Ensure dedupe on server response
      const fetchedDeduped = dedupeById(sortChronological(fetched));

      const existing = state.messages[roomId] || [];

      if (!existing || existing.length === 0 || Number(page) === 1) {
        // Page 1 -> server likely returned the most recent chunk.
        // Merge carefully to **preserve any locally-added messages** (e.g. from socket)
        // Keep server results as base then append local messages that server doesn't know (dedupe by id)
        const localOnly = existing.filter((m) => !fetchedDeduped.some((f) => f.id === m.id));
        state.messages[roomId] = sortChronological([...fetchedDeduped, ...localOnly]);
      } else {
        // page > 1 -> older page: prepend older messages (older -> newest)
        const olderNotExist = fetchedDeduped.filter((f) => !existing.some((e) => e.id === f.id));
        state.messages[roomId] = sortChronological([...olderNotExist, ...existing]);
      }

      state.messageStatus[roomId] = "succeeded";
    });

    builder.addCase(fetchChatMessages.rejected, (state, action) => {
      const { roomId } = (action.meta.arg as any) || {};
      if (!roomId) return;
      state.messageStatus[roomId] = "failed";
    });

    // delete message
    builder.addCase(deleteChatMessage.fulfilled, (state, action) => {
      const { roomId, messageId } = (action.meta.arg as any) || {};
      if (!roomId || !messageId) return;
      if (!state.messages[roomId]) return;
      state.messages[roomId] = state.messages[roomId].filter((m) => m.id !== messageId);
    });
  },
});

export const {
  selectChatRoom,
  setRooms,
  addMessage,
  updateMessage,
  setMessages,
  setTypingUsers,
  clearMessagesForRoom,
} = chatSlice.actions;

export default chatSlice.reducer;

/* ---------- Selectors ---------- */

export const selectSelectedRoomId = (state: any) => state.chat.selectedRoomId;

export const selectChatRooms = (state: any) => state.chat.rooms;

// Returns messages for current selected room in chronological order (oldest -> newest)
export const selectCurrentRoomMessages = (state: any) => {
  const roomId = state.chat.selectedRoomId;
  const arr: ChatMessage[] = roomId ? state.chat.messages[roomId] || [] : [];
  // return copy
  return arr.slice().sort((a, b) => getMessageTimestamp(a) - getMessageTimestamp(b));
};

export const selectMessageStatusForRoom = (state: any, roomId: string) =>
  state.chat.messageStatus[roomId] || "idle";

export const selectTypingUsersForRoom = (state: any, roomId: string) =>
  state.chat.typingUsers[roomId] || [];
