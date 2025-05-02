// features/chat/store/chatSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { ChatState, ChatRoom, ChatMessage } from "../types/chat-types";

// Import mock functions (Replace with API client eventually)
import {
	getMockChatRooms,
	getMockChatMessages,
	createMockChatMessage,
} from "@/data/mock-chat-data";
import { parseISO } from "date-fns";

// --- Async Thunks ---
export const fetchChatRooms = createAsyncThunk<
	ChatRoom[],
	string,
	{ rejectValue: string }
>("chat/fetchRooms", async (userId, { rejectWithValue }) => {
	try {
		return await getMockChatRooms(userId);
	} catch (e: any) {
		return rejectWithValue(e.message);
	}
});

interface FetchMessagesParams {
	roomId: string;
	page?: number;
	limit?: number;
}
export const fetchChatMessages = createAsyncThunk<
	ChatMessage[],
	FetchMessagesParams,
	{ rejectValue: string }
>(
	"chat/fetchMessages",
	async ({ roomId, page, limit }, { rejectWithValue }) => {
		try {
			return await getMockChatMessages(roomId, page, limit);
		} catch (e: any) {
			return rejectWithValue(e.message);
		}
	}
);

interface SendMessageParams {
	roomId: string;
	senderId: string;
	content: string;
}
export const sendChatMessage = createAsyncThunk<
	ChatMessage,
	SendMessageParams,
	{ rejectValue: string }
>(
	"chat/sendMessage",
	async ({ roomId, senderId, content }, { rejectWithValue }) => {
		try {
			return await createMockChatMessage(roomId, senderId, content);
		} catch (e: any) {
			return rejectWithValue(e.message);
		}
	}
);

// --- Initial State ---
const initialState: ChatState = {
	rooms: [],
	messagesByRoom: {},
	selectedRoomId: null,
	roomStatus: "idle",
	messageStatus: {}, // Status per room
	sendMessageStatus: "idle",
	error: null,
};

// --- Slice Definition ---
const chatSlice = createSlice({
	name: "chat",
	initialState,
	reducers: {
		selectChatRoom: (state, action: PayloadAction<string | null>) => {
			state.selectedRoomId = action.payload;
			state.error = null; // Clear error when changing rooms
			if (action.payload && !state.messageStatus[action.payload]) {
				state.messageStatus[action.payload] = "idle"; // Ensure status exists
			}
			// Reset unread count locally on selection (real app might need API call/socket event)
			const room = state.rooms.find((r) => r.id === action.payload);
			if (room) room.unreadCount = 0;
		},
		clearChatError: (state) => {
			state.error = null;
		},
		// Reducer to add a message received (e.g., from websocket - Post-MVP)
		// messageReceived: (state, action: PayloadAction<ChatMessage>) => { ... }
	},
	extraReducers: (builder) => {
		// Fetch Rooms
		builder
			.addCase(fetchChatRooms.pending, (state) => {
				state.roomStatus = "loading";
				state.error = null;
			})
			.addCase(fetchChatRooms.fulfilled, (state, action) => {
				state.roomStatus = "succeeded";
				state.rooms = action.payload;
			})
			.addCase(fetchChatRooms.rejected, (state, action) => {
				state.roomStatus = "failed";
				state.error = action.payload ?? "Failed to fetch rooms";
			});

		// Fetch Messages
		builder
			.addCase(fetchChatMessages.pending, (state, action) => {
				const roomId = action.meta.arg.roomId;
				state.messageStatus[roomId] = "loading";
				state.error = null; // Clear general error on fetch attempt
			})
			.addCase(fetchChatMessages.fulfilled, (state, action) => {
				const roomId = action.meta.arg.roomId;
				state.messageStatus[roomId] = "succeeded";
				// Prepend older messages if implementing pagination, otherwise replace
				state.messagesByRoom[roomId] = [
					...action.payload,
					...(state.messagesByRoom[roomId] || []),
				]; // Simple replace/prepend
				// Remove duplicates just in case
				state.messagesByRoom[roomId] = Array.from(
					new Map(
						state.messagesByRoom[roomId].map((item) => [item.id, item])
					).values()
				);
				// Sort by timestamp
				state.messagesByRoom[roomId].sort(
					(a, b) =>
						parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime()
				);
			})
			.addCase(fetchChatMessages.rejected, (state, action) => {
				const roomId = action.meta.arg.roomId;
				state.messageStatus[roomId] = "failed";
				// Store error specific to this room fetch? Or just use general error.
				state.error =
					action.payload ?? `Failed to fetch messages for room ${roomId}`;
			});

		// Send Message
		builder
			.addCase(sendChatMessage.pending, (state) => {
				state.sendMessageStatus = "loading";
				state.error = null;
			})
			.addCase(sendChatMessage.fulfilled, (state, action) => {
				state.sendMessageStatus = "succeeded";
				const roomId = action.payload.roomId;
				// Add the sent message optimistically (or wait for websocket)
				if (!state.messagesByRoom[roomId]) state.messagesByRoom[roomId] = [];
				// Avoid duplicates if websocket confirms quickly
				if (
					!state.messagesByRoom[roomId].some((m) => m.id === action.payload.id)
				) {
					state.messagesByRoom[roomId].push(action.payload);
				}
				// Update last message in the room list preview
				const roomIndex = state.rooms.findIndex((r) => r.id === roomId);
				if (roomIndex !== -1) {
					state.rooms[roomIndex].lastMessage = {
						content: action.payload.content,
						timestamp: action.payload.timestamp,
						senderId: action.payload.senderId,
						senderName: action.payload.sender?.name,
					};
				}
			})
			.addCase(sendChatMessage.rejected, (state, action) => {
				state.sendMessageStatus = "failed";
				state.error = action.payload ?? "Failed to send message";
			});
	},
});

// --- Actions & Selectors ---
export const { selectChatRoom, clearChatError } = chatSlice.actions;

export const selectChatRooms = (state: RootState) => state.chat.rooms;
export const selectMessagesByRoom = (state: RootState) =>
	state.chat.messagesByRoom;
export const selectSelectedRoomId = (state: RootState) =>
	state.chat.selectedRoomId;
export const selectCurrentRoomMessages = (state: RootState): ChatMessage[] => {
	const roomId = state.chat.selectedRoomId;
	return roomId ? state.chat.messagesByRoom[roomId] || [] : [];
};
export const selectRoomStatus = (state: RootState) => state.chat.roomStatus;
export const selectMessageStatusForRoom = (
	state: RootState,
	roomId: string | null
): ChatState["messageStatus"][string] => {
	return roomId ? state.chat.messageStatus[roomId] || "idle" : "idle";
};
export const selectSendMessageStatus = (state: RootState) =>
	state.chat.sendMessageStatus;
export const selectChatError = (state: RootState) => state.chat.error;

export default chatSlice.reducer;
