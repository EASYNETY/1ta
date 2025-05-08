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

			if (action.payload && !state.messageStatus[action.payload]) {
				state.messageStatus[action.payload] = "idle";
			}

			// If a new room is selected, locally update its unread count to 0 immediately
			// The thunk will confirm with the backend.
			if (action.payload && action.payload !== previouslySelectedRoomId) {
				const room = state.rooms.find((r) => r.id === action.payload);
				if (room && room.unreadCount && room.unreadCount > 0) {
					// We will dispatch markRoomAsRead thunk from the component
					// but can optimistically update here for faster UI response
					room.unreadCount = 0;
				}
			}
		},

		clearChatError: (state) => {
			state.error = null;
		},

		// For handling real-time messages (e.g., from WebSocket)
		messageReceived: (state, action: PayloadAction<ChatMessage>) => {
			const message = action.payload;
			const roomId = message.roomId;

			// Add message to the appropriate room
			if (!state.messagesByRoom[roomId]) {
				state.messagesByRoom[roomId] = [];
			}

			// Avoid duplicates
			if (!state.messagesByRoom[roomId].some((m) => m.id === message.id)) {
				state.messagesByRoom[roomId].push(message);
			}

			// Update last message in room list
			const roomIndex = state.rooms.findIndex((r) => r.id === roomId);
			if (roomIndex !== -1) {
				state.rooms[roomIndex].lastMessage = {
					content: message.content,
					timestamp: message.timestamp,
					senderId: message.senderId,
					senderName: message.sender?.name,
				};

				// Increment unread count if not the selected room
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
				state.error = null;
			})
			.addCase(fetchChatMessages.fulfilled, (state, action) => {
				const roomId = action.meta.arg.roomId;
				state.messageStatus[roomId] = "succeeded";

				// Initialize if needed
				if (!state.messagesByRoom[roomId]) {
					state.messagesByRoom[roomId] = [];
				}

				// Merge messages, avoiding duplicates
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

				// Sort by timestamp
				state.messagesByRoom[roomId].sort((a, b) => {
					return (
						new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
					);
				});
			})
			.addCase(fetchChatMessages.rejected, (state, action) => {
				const roomId = action.meta.arg.roomId;
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

				// Add the sent message
				if (!state.messagesByRoom[roomId]) {
					state.messagesByRoom[roomId] = [];
				}

				// Avoid duplicates
				if (
					!state.messagesByRoom[roomId].some((m) => m.id === action.payload.id)
				) {
					state.messagesByRoom[roomId].push(action.payload);
				}

				// Update last message in room
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
		// VVVV NEW EXTRA REDUCERS FOR createChatRoom VVVV
		builder
			.addCase(createChatRoom.pending, (state) => {
				state.createRoomStatus = "loading";
				state.createRoomError = null;
			})
			.addCase(
				createChatRoom.fulfilled,
				(state, action: PayloadAction<ChatRoom>) => {
					state.createRoomStatus = "succeeded";
					// Add the new room to the list, avoid duplicates
					if (!state.rooms.find((room) => room.id === action.payload.id)) {
						state.rooms.unshift(action.payload); // Add to the beginning
					}
					// Optionally, auto-select the newly created room
					// state.selectedRoomId = action.payload.id;
				}
			)
			.addCase(createChatRoom.rejected, (state, action) => {
				state.createRoomStatus = "failed";
				state.createRoomError = action.payload ?? "Unknown error creating room";
			});
		builder
			.addCase(markRoomAsRead.fulfilled, (state, action) => {
				const { roomId, updatedRoom } = action.payload;
				const roomIndex = state.rooms.findIndex((r) => r.id === roomId);
				if (roomIndex !== -1) {
					// Update from server response if provided, otherwise just ensure unreadCount is 0
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
				// If you were tracking individual message.isRead, you might update them here too
				// based on what the backend confirms, or optimistically.
			})
			.addCase(markRoomAsRead.rejected, (state, action) => {
				// Handle error, maybe revert optimistic update if you did one
				console.error("Failed to mark room as read on server:", action.payload);
				// You might want to add a specific error state for this if needed
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
export const selectChatRooms = (state: RootState) => state.chat.rooms;
export const selectMessagesByRoom = (state: RootState) =>
	state.chat.messagesByRoom;
export const selectSelectedRoomId = (state: RootState) =>
	state.chat.selectedRoomId;
export const selectRoomStatus = (state: RootState) => state.chat.roomStatus;
export const selectSendMessageStatus = (state: RootState) =>
	state.chat.sendMessageStatus;
export const selectChatError = (state: RootState) => state.chat.error;
// New selectors for create room status
export const selectCreateRoomStatus = (state: RootState) =>
	state.chat.createRoomStatus;
export const selectCreateRoomError = (state: RootState) =>
	state.chat.createRoomError;
// Derived selectors
export const selectCurrentRoomMessages = createSelector(
	[selectMessagesByRoom, selectSelectedRoomId],
	(messagesByRoom, selectedRoomId): ChatMessage[] => {
		return selectedRoomId ? messagesByRoom[selectedRoomId] || [] : [];
	}
);

export const selectMessageStatusForRoom = (
	state: RootState,
	roomId: string | null
) => {
	return roomId ? state.chat.messageStatus[roomId] || "idle" : "idle";
};

export const selectSelectedRoom = createSelector(
	[selectChatRooms, selectSelectedRoomId],
	(rooms, selectedRoomId): ChatRoom | undefined => {
		return rooms.find((room) => room.id === selectedRoomId);
	}
);

export const selectChatUnreadCount = createSelector(
	[selectChatRooms],
	(rooms): number => {
		return rooms.reduce((total, room) => total + (room.unreadCount || 0), 0);
	}
);

export default chatSlice.reducer;
