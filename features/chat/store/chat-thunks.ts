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

// export const fetchChatRooms = createAsyncThunk<
// 	ChatRoom[],
// 	void,
// 	{ rejectValue: string }
// >("chat/fetchRooms", async (_, { rejectWithValue }) => {
// 	try {
// 		const apiClientResponse = await get<any>(`/chat/rooms`);
// 		const roomsArray: ChatRoom[] = [];
// 		if (apiClientResponse && typeof apiClientResponse === "object") {
// 			Object.keys(apiClientResponse).forEach((key) => {
// 				if (!isNaN(parseInt(key, 10))) {
// 					roomsArray.push(apiClientResponse[key]);
// 				}
// 			});
// 		}
// 		return roomsArray;
// 	} catch (e: any) {
// 		return rejectWithValue(e.message || "Failed to fetch chat rooms");
// 	}
// });

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
			const apiClientResponse = await get<any[]>( // Expect an array of any
				`/chat/messages?roomId=${roomId}&page=${page}&limit=${limit}`
			);

			const messagesArray: ChatMessage[] = [];
			if (Array.isArray(apiClientResponse)) {
				// Your api-client might just return the array directly
				apiClientResponse.forEach((msg) => {
					messagesArray.push(mapApiMessageToChatMessage(msg)); // Use the mapper
				});
			} else if (apiClientResponse && typeof apiClientResponse === "object") {
				// Handle the spread object case
				Object.keys(apiClientResponse).forEach((key) => {
					if (!isNaN(parseInt(key, 10))) {
						messagesArray.push(
							mapApiMessageToChatMessage(apiClientResponse[key])
						); // Use the mapper
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

		// Use the mapper to ensure the object has the `timestamp` property
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

// export const markRoomAsRead = createAsyncThunk<
// 	{ roomId: string },
// 	MarkRoomReadPayload,
// 	{ rejectValue: string }
// >("chat/markRoomAsRead", async (payload, { rejectWithValue }) => {
// 	try {
// 		const response = await post<MarkReadResponse>(
// 			"/chat/rooms/mark-read",
// 			payload
// 		);
// 		if (response.success) {
// 			return { roomId: payload.roomId };
// 		} else {
// 			return rejectWithValue(
// 				response.message || "Failed to mark room as read."
// 			);
// 		}
// 	} catch (e: any) {
// 		const errorMessage = e.message || "Failed to mark room as read";
// 		return rejectWithValue(errorMessage);
// 	}
// });

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


// Add these thunks to your chat-thunks.ts file


// Update existing chat room
export const updateChatRoom = createAsyncThunk(
  'chat/updateChatRoom',
  async ({ 
    roomId, 
    name, 
    type, 
    participantIds 
  }: { 
    roomId: string; 
    name: string; 
    type: string; 
    participantIds: string[] 
  }) => {
    const response = await apiClient(`/chat/rooms/${roomId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        type,
        participantIds
      }),
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

// Mark room as read (updates unread count)
export const markRoomAsRead = createAsyncThunk(
  'chat/markRoomAsRead',
  async ({ roomId, userId }: { roomId: string; userId: string }) => {
    const response = await apiClient(`/chat/rooms/${roomId}/mark-read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
      requiresAuth: true
    });
    
    return { roomId, userId };
  }
);

// Get unread counts for all rooms
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

// Add participants to room
export const addParticipantsToRoom = createAsyncThunk(
  'chat/addParticipantsToRoom',
  async ({ roomId, participantIds }: { roomId: string; participantIds: string[] }) => {
    const response = await apiClient(`/chat/rooms/${roomId}/participants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ participantIds }),
      requiresAuth: true
    });
    
    return response;
  }
);

// Remove participants from room
export const removeParticipantsFromRoom = createAsyncThunk(
  'chat/removeParticipantsFromRoom',
  async ({ roomId, participantIds }: { roomId: string; participantIds: string[] }) => {
    const response = await apiClient(`/chat/rooms/${roomId}/participants`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ participantIds }),
      requiresAuth: true
    });
    
    return response;
  }
);

// Update the existing fetchChatRooms to include unread counts
export const fetchChatRooms = createAsyncThunk(
  'chat/fetchChatRooms',
  async (userId: string) => {
    const response = await apiClient(`/chat/rooms?userId=${userId}&includeUnread=true`, {
      method: 'GET',
      requiresAuth: true
    });
    
    // Ensure each room has an unreadCount property
    return response.map((room: any) => ({
      ...room,
      unreadCount: room.unreadCount || 0
    }));
  }
);

// Socket event handlers for real-time unread count updates
export const handleUnreadCountUpdate = createAsyncThunk(
  'chat/handleUnreadCountUpdate',
  async ({ roomId, count }: { roomId: string; count: number }, { dispatch }) => {
    // This would be called from socket event listeners
    dispatch(updateRoomUnreadCount({ roomId, count }));
    return { roomId, count };
  }
);

// Batch mark multiple rooms as read
export const markMultipleRoomsAsRead = createAsyncThunk(
  'chat/markMultipleRoomsAsRead',
  async ({ roomIds, userId }: { roomIds: string[]; userId: string }) => {
    const response = await apiClient('/chat/rooms/mark-read-bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomIds, userId }),
      requiresAuth: true
    });
    
    return roomIds;
  }
);