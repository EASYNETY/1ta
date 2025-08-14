// features/chat/store/chat-thunks.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from '@/lib/api-client';
import type {
	ChatRoom,
	ChatMessage,
	CreateRoomPayload,
	MarkReadResponse,
} from "../types/chat-types";
import { get, post } from "@/lib/api-client";

export interface FetchMessagesParams {
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
	async ({ roomId, page = 1, limit = 30 }, { rejectWithValue }) => {
		try {
			const apiClientResponse = await get<any[]>(
				`/chat/messages?roomId=${roomId}&page=${page}&limit=${limit}`
			);

			const messagesArray: ChatMessage[] = [];
			if (Array.isArray(apiClientResponse)) {
				apiClientResponse.forEach((msg) => {
					messagesArray.push(mapApiMessageToChatMessage(msg));
				});
			} else if (apiClientResponse && typeof apiClientResponse === "object") {
				Object.keys(apiClientResponse).forEach((key) => {
					if (!isNaN(parseInt(key, 10))) {
						messagesArray.push(
							mapApiMessageToChatMessage(apiClientResponse[key])
						);
					}
				});
			}

			return messagesArray;
		} catch (e: any) {
			return rejectWithValue(e.message || "Failed to fetch messages");
		}
	}
);

export interface SendMessageParams {
	roomId: string;
	senderId: string;
	content: string;
}

export const sendChatMessage = createAsyncThunk<
	ChatMessage,
	SendMessageParams,
	{ rejectValue: string }
>("chat/sendMessage", async (payload, { rejectWithValue }) => {
	try {
		const newApiMessage = await post<any>("/chat/messages", payload);
		return mapApiMessageToChatMessage(newApiMessage);
	} catch (e: any) {
		return rejectWithValue(e.message || "Failed to send message");
	}
});

export const createChatRoom = createAsyncThunk<
	ChatRoom,
	CreateRoomPayload,
	{ rejectValue: string }
>("chat/createRoom", async (payload, { rejectWithValue }) => {
	try {
		const newChatRoom = await post<ChatRoom>("/chat/rooms", payload);
		if (!newChatRoom || !newChatRoom.id) {
			throw new Error("Invalid response from server on room creation.");
		}
		return newChatRoom;
	} catch (e: any) {
		const errorMessage = e.message || "Failed to create chat room";
		return rejectWithValue(errorMessage);
	}
});

const mapApiMessageToChatMessage = (apiMessage: any): ChatMessage => {
	return {
		...apiMessage,
		timestamp: apiMessage.createdAt,
		sender: apiMessage.user
			? {
					id: apiMessage.user.id,
					name: apiMessage.user.name,
					avatarUrl: apiMessage.user.avatarUrl,
					role: apiMessage.user.role,
			  }
			: undefined,
	};
};

// Update existing chat room
export const updateChatRoom = createAsyncThunk(
  'chat/updateChatRoom',
  async ({ roomId, name, type, participantIds }: { roomId: string; name: string; type: string; participantIds: string[] }) => {
    const response = await apiClient(`/chat/rooms/${roomId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, participantIds }),
      requiresAuth: true
    });
    return response;
  }
);

// Delete chat room
export const deleteChatRoom = createAsyncThunk(
  'chat/deleteChatRoom',
  async (roomId: string) => {
    await apiClient(`/chat/rooms/${roomId}`, {
      method: 'DELETE',
      requiresAuth: true
    });
    return roomId;
  }
);

// Mark room as read
export const markRoomAsRead = createAsyncThunk(
  'chat/markRoomAsRead',
  async ({ roomId, userId }: { roomId: string; userId: string }) => {
    await apiClient(`/chat/rooms/${roomId}/mark-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
      requiresAuth: true
    });
    return { roomId, userId };
  }
);

// Get unread counts
export const fetchUnreadCounts = createAsyncThunk(
  'chat/fetchUnreadCounts',
  async (userId: string) => {
    const response = await apiClient(`/chat/rooms/unread-counts?userId=${userId}`, {
      method: 'GET',
      requiresAuth: true
    });
    return response;
  }
);

// Add participants
export const addParticipantsToRoom = createAsyncThunk(
  'chat/addParticipantsToRoom',
  async ({ roomId, participantIds }: { roomId: string; participantIds: string[] }) => {
    const response = await apiClient(`/chat/rooms/${roomId}/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantIds }),
      requiresAuth: true
    });
    return response;
  }
);

// Remove participants
export const removeParticipantsFromRoom = createAsyncThunk(
  'chat/removeParticipantsFromRoom',
  async ({ roomId, participantIds }: { roomId: string; participantIds: string[] }) => {
    const response = await apiClient(`/chat/rooms/${roomId}/participants`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantIds }),
      requiresAuth: true
    });
    return response;
  }
);

// Fetch chat rooms with unread counts
export const fetchChatRooms = createAsyncThunk(
  'chat/fetchChatRooms',
  async (userId: string) => {
    const response = await apiClient(`/chat/rooms?userId=${userId}&includeUnread=true`, {
      method: 'GET',
      requiresAuth: true
    });
    return response.map((room: any) => ({ ...room, unreadCount: room.unreadCount || 0 }));
  }
);

// Handle unread count update
export const handleUnreadCountUpdate = createAsyncThunk(
  'chat/handleUnreadCountUpdate',
  async ({ roomId, count }: { roomId: string; count: number }, { dispatch }) => {
    dispatch(updateRoomUnreadCount({ roomId, count }));
    return { roomId, count };
  }
);

// Batch mark rooms as read
export const markMultipleRoomsAsRead = createAsyncThunk(
  'chat/markMultipleRoomsAsRead',
  async ({ roomIds, userId }: { roomIds: string[]; userId: string }) => {
    await apiClient('/chat/rooms/mark-read-bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomIds, userId }),
      requiresAuth: true
    });
    return roomIds;
  }
);
