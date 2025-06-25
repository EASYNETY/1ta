// features/chat/store/chatSlice.ts

import {
	createSlice,
	type PayloadAction,
	createSelector,
} from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { ChatState, ChatRoom, ChatMessage } from "../types/chat-types";
import {
	fetchChatRooms,
	fetchChatMessages,
	sendChatMessage,
	createChatRoom,
	markRoomAsRead,
} from "./chat-thunks";

// Initial state
const initialState: ChatState = {
	rooms: [],
	messagesByRoom: {},
	selectedRoomId: null,
	roomStatus: "idle",
	createRoomStatus: "idle",
	messageStatus: {},
	sendMessageStatus: "idle",
	error: null,
	createRoomError: null,
};

// Slice definition
const chatSlice = createSlice({
	name: "chat",
	initialState,
	reducers: {
		selectChatRoom: (state, action: PayloadAction<string | null>) => {
			const previouslySelectedRoomId = state.selectedRoomId;
			state.selectedRoomId = action.payload;
			state.error = null;

			// Defensive check for messageStatus
			if (!state.messageStatus) {
				state.messageStatus = {};
			}
			if (action.payload && !state.messageStatus[action.payload]) {
				state.messageStatus[action.payload] = "idle";
			}

			if (action.payload && action.payload !== previouslySelectedRoomId) {
				// Defensive check for rooms array
				if (!Array.isArray(state.rooms)) {
					state.rooms = [];
				}
				const room = state.rooms.find((r) => r.id === action.payload);
				if (room && room.unreadCount && room.unreadCount > 0) {
					room.unreadCount = 0;
				}
			}
		},

		clearChatError: (state) => {
			state.error = null;
		},

		clearRoomStatus: (state) => {
			state.roomStatus = "idle";
			state.error = null;
		},

		messageReceived: (state, action: PayloadAction<ChatMessage>) => {
			const message = action.payload;
			const roomId = message.roomId;

			// Defensive check for messagesByRoom object
			if (!state.messagesByRoom) {
				state.messagesByRoom = {};
			}
			if (!state.messagesByRoom[roomId]) {
				state.messagesByRoom[roomId] = [];
			}

			if (!state.messagesByRoom[roomId].some((m) => m.id === message.id)) {
				state.messagesByRoom[roomId].push(message);
			}

			// Defensive check for rooms array
			if (!Array.isArray(state.rooms)) {
				state.rooms = [];
			}
			const roomIndex = state.rooms.findIndex((r) => r.id === roomId);
			if (roomIndex !== -1) {
				state.rooms[roomIndex].lastMessage = {
					content: message.content,
					timestamp: message.timestamp,
					senderId: message.senderId,
					senderName: message.sender?.name,
				};
				if (state.selectedRoomId !== roomId) {
					state.rooms[roomIndex].unreadCount =
						(state.rooms[roomIndex].unreadCount || 0) + 1;
				}
			}
		},
		clearCreateRoomStatus: (state) => {
			state.createRoomStatus = "idle";
			state.createRoomError = null;
		},
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
				state.rooms = action.payload; // This is a safe assignment
			})
			.addCase(fetchChatRooms.rejected, (state, action) => {
				state.roomStatus = "failed";
				state.error = action.payload ?? "Failed to fetch rooms";
			});

		// Fetch Messages
		builder
			.addCase(fetchChatMessages.pending, (state, action) => {
				const roomId = action.meta.arg.roomId;
				// Defensive check for messageStatus
				if (!state.messageStatus) {
					state.messageStatus = {};
				}
				state.messageStatus[roomId] = "loading";
				state.error = null;
			})
			.addCase(fetchChatMessages.fulfilled, (state, action) => {
				const roomId = action.meta.arg.roomId;
				if (!state.messageStatus) state.messageStatus = {};
				state.messageStatus[roomId] = "succeeded";

				// Defensive check for messagesByRoom
				if (!state.messagesByRoom) state.messagesByRoom = {};
				if (!state.messagesByRoom[roomId]) {
					state.messagesByRoom[roomId] = [];
				}

				const existingIds = new Set(
					state.messagesByRoom[roomId].map((m) => m.id)
				);
				const newMessages = action.payload.filter(
					(m) => !existingIds.has(m.id)
				);
				state.messagesByRoom[roomId] = [
					...state.messagesByRoom[roomId],
					...newMessages,
				];
				state.messagesByRoom[roomId].sort((a, b) => {
					return (
						new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
					);
				});
			})
			.addCase(fetchChatMessages.rejected, (state, action) => {
				const roomId = action.meta.arg.roomId;
				if (!state.messageStatus) state.messageStatus = {};
				state.messageStatus[roomId] = "failed";
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

				if (!state.messagesByRoom) state.messagesByRoom = {};
				if (!state.messagesByRoom[roomId]) {
					state.messagesByRoom[roomId] = [];
				}
				if (
					!state.messagesByRoom[roomId].some((m) => m.id === action.payload.id)
				) {
					state.messagesByRoom[roomId].push(action.payload);
				}

				// Defensive check for rooms array
				if (!Array.isArray(state.rooms)) {
					state.rooms = [];
				}
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

		// Create Chat Room
		builder
			.addCase(createChatRoom.pending, (state) => {
				state.createRoomStatus = "loading";
				state.createRoomError = null;
			})
			.addCase(
				createChatRoom.fulfilled,
				(state, action: PayloadAction<ChatRoom>) => {
					state.createRoomStatus = "succeeded";
					// Defensive check for rooms array
					if (!Array.isArray(state.rooms)) {
						state.rooms = [];
					}
					// Add the new room to the list, avoid duplicates
					if (!state.rooms.some((room) => room.id === action.payload.id)) {
						state.rooms.unshift(action.payload); // Add to the beginning
					}
				}
			)
			.addCase(createChatRoom.rejected, (state, action) => {
				state.createRoomStatus = "failed";
				state.createRoomError = action.payload ?? "Unknown error creating room";
			});

		// Mark Room as Read
		builder
			.addCase(markRoomAsRead.fulfilled, (state, action) => {
				const { roomId, updatedRoom } = action.payload;
				// Defensive check for rooms array
				if (!Array.isArray(state.rooms)) {
					state.rooms = [];
				}
				const roomIndex = state.rooms.findIndex((r) => r.id === roomId);
				if (roomIndex !== -1) {
					if (updatedRoom) {
						state.rooms[roomIndex] = {
							...state.rooms[roomIndex],
							...updatedRoom,
							unreadCount: updatedRoom.unreadCount ?? 0,
						};
					} else {
						state.rooms[roomIndex].unreadCount = 0;
					}
				}
			})
			.addCase(markRoomAsRead.rejected, (state, action) => {
				console.error("Failed to mark room as read on server:", action.payload);
			});
	},
});

// Actions & Selectors
export const {
	selectChatRoom,
	clearChatError,
	messageReceived,
	clearCreateRoomStatus,
} = chatSlice.actions;

// Basic selectors
// This selector is now safe and performant because the reducers guarantee state.chat.rooms is an array.
export const selectChatRooms = (state: RootState) => state.chat.rooms;
export const selectMessagesByRoom = (state: RootState) =>
	state.chat.messagesByRoom;
export const selectSelectedRoomId = (state: RootState) =>
	state.chat.selectedRoomId;
export const selectRoomStatus = (state: RootState) => state.chat.roomStatus;
export const selectSendMessageStatus = (state: RootState) =>
	state.chat.sendMessageStatus;
export const selectChatError = (state: RootState) => state.chat.error;
export const selectCreateRoomStatus = (state: RootState) =>
	state.chat.createRoomStatus;
export const selectCreateRoomError = (state: RootState) =>
	state.chat.createRoomError;

// Derived selectors
export const selectCurrentRoomMessages = createSelector(
	[selectMessagesByRoom, selectSelectedRoomId],
	(messagesByRoom, selectedRoomId): ChatMessage[] => {
		// Defensive check: if messagesByRoom is not an object, return empty array.
		if (!messagesByRoom || typeof messagesByRoom !== "object") return [];
		return selectedRoomId ? messagesByRoom[selectedRoomId] || [] : [];
	}
);

export const selectMessageStatusForRoom = (
	state: RootState,
	roomId: string | null
) => {
	// Defensive check
	if (!state.chat.messageStatus) return "idle";
	return roomId ? state.chat.messageStatus[roomId] || "idle" : "idle";
};

export const selectSelectedRoom = createSelector(
	[selectChatRooms, selectSelectedRoomId],
	(rooms, selectedRoomId): ChatRoom | undefined => {
		// Selector is already safe because selectChatRooms will return an array.
		if (!rooms) return undefined;
		return rooms.find((room) => room.id === selectedRoomId);
	}
);

export const selectChatUnreadCount = createSelector(
	[selectChatRooms],
	(rooms): number => {
		// Defensive check
		if (!Array.isArray(rooms)) return 0;
		return rooms.reduce((total, room) => total + (room.unreadCount || 0), 0);
	}
);

export default chatSlice.reducer;
