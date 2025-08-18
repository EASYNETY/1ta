// features/chat/store/chat-thunks.ts - FIXED VERSION FOR API RESPONSE FORMAT

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

// FIXED fetchChatRooms with proper API response format handling
export const fetchChatRooms = createAsyncThunk(
  'chat/fetchChatRooms',
  async (userId: string, { rejectWithValue }) => {
    try {
      console.log("🔍 fetchChatRooms - Starting fetch for user ID:", userId);
      
      if (!userId) {
        console.error("❌ fetchChatRooms - No user ID provided");
        return rejectWithValue("User ID is required");
      }

      // Log the exact URL being called
      const url = `/chat/rooms?userId=${userId}&includeUnread=true`;
      console.log("📡 fetchChatRooms - Making API call to:", url);

      const response = await apiClient(url, {
        method: 'GET',
        requiresAuth: true
      });

      console.log("📦 fetchChatRooms - Raw API response:", response);
      console.log("📊 fetchChatRooms - Response type:", typeof response, "Is array:", Array.isArray(response));

      if (!response) {
        console.log("❌ fetchChatRooms - No response from API");
        return [];
      }

      // Handle the specific API response format: { success: true, data: [...] }
      let rooms = [];
      
      if (response.success && response.data && Array.isArray(response.data)) {
        // This is the format your API returns: { success: true, data: [...] }
        rooms = response.data;
        console.log("✅ fetchChatRooms - Found rooms in response.data:", rooms.length);
      } else if (Array.isArray(response)) {
        // Direct array response
        rooms = response;
        console.log("✅ fetchChatRooms - Found rooms as direct array:", rooms.length);
      } else if (response.data && Array.isArray(response.data)) {
        // Response with data property (without success)
        rooms = response.data;
        console.log("✅ fetchChatRooms - Found rooms in data property:", rooms.length);
      } else if (response.rooms && Array.isArray(response.rooms)) {
        // Response with rooms property
        rooms = response.rooms;
        console.log("✅ fetchChatRooms - Found rooms in rooms property:", rooms.length);
      } else if (typeof response === 'object') {
        // Handle object with numeric keys as fallback
        rooms = Object.values(response).filter(item => item && typeof item === 'object' && item.id);
        console.log("✅ fetchChatRooms - Extracted rooms from object keys:", rooms.length);
      } else {
        console.warn("⚠️ fetchChatRooms - Unexpected response format:", response);
        rooms = [];
      }

      console.log("🏠 fetchChatRooms - Extracted rooms:", rooms);
      console.log("📈 fetchChatRooms - Number of rooms:", rooms.length);

      // Process and validate rooms
      const processedRooms = rooms.map((room: any) => {
        const processedRoom = { 
          ...room, 
          unreadCount: room.unreadCount || 0,
          // Ensure required fields
          id: room.id || room._id,
          name: room.name || 'Unnamed Room',
          type: room.type || 'general',
          participants: room.participants || [],
          lastMessage: room.lastMessage || null,
          lastMessageAt: room.lastMessageAt || room.updatedAt || room.createdAt,
          createdAt: room.createdAt || new Date().toISOString(),
          updatedAt: room.updatedAt || new Date().toISOString()
        };
        
        console.log("🔧 fetchChatRooms - Processed room:", processedRoom.id, processedRoom.name);
        return processedRoom;
      });

      console.log("✅ fetchChatRooms - Final processed rooms:", processedRooms);
      return processedRooms;

    } catch (error: any) {
      console.error("💥 fetchChatRooms - Error occurred:", error);
      console.error("💥 fetchChatRooms - Error message:", error.message);
      console.error("💥 fetchChatRooms - Error response:", error.response);
      console.error("💥 fetchChatRooms - Error status:", error.status);
      
      let errorMessage = "Failed to fetch chat rooms";
      
      if (error.response) {
        // Server responded with an error status
        if (error.response.status === 401) {
          errorMessage = "Authentication required. Please log in again.";
        } else if (error.response.status === 403) {
          errorMessage = "Access denied. You don't have permission to view chat rooms.";
        } else if (error.response.status === 404) {
          errorMessage = "Chat service not found. Please check your connection.";
        } else if (error.response.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = error.response.data?.message || `Server error (${error.response.status})`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = "Network error. Please check your internet connection.";
      } else {
        // Other error
        errorMessage = error.message || "Unknown error occurred";
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchChatMessages = createAsyncThunk<
	{ data: ChatMessage[], pagination?: any },
	FetchMessagesParams,
	{ rejectValue: string }
>(
	"chat/fetchMessages",
	async ({ roomId, page = 1, limit = 30 }, { rejectWithValue }) => {
		try {
			console.log("📨 fetchChatMessages - Fetching messages for room:", roomId, "page:", page);

			if (!roomId) {
				return rejectWithValue("Room ID is required");
			}

			const url = `/chat/messages?roomId=${roomId}&page=${page}&limit=${limit}`;
			console.log("📡 fetchChatMessages - API URL:", url);

			const apiClientResponse = await get<any>(url);
			console.log("📦 fetchChatMessages - Raw response:", apiClientResponse);

			const messagesArray: ChatMessage[] = [];
			let pagination = null;

			// Handle different response formats, including { success: true, data: [...] }
			if (apiClientResponse && typeof apiClientResponse === "object") {
				if (apiClientResponse.success && apiClientResponse.data && Array.isArray(apiClientResponse.data)) {
					// Handle { success: true, data: [...] } format
					apiClientResponse.data.forEach((msg: any) => {
						messagesArray.push(mapApiMessageToChatMessage(msg));
					});
					pagination = apiClientResponse.pagination;
				} else if (Array.isArray(apiClientResponse)) {
					// Direct array response
					apiClientResponse.forEach((msg) => {
						messagesArray.push(mapApiMessageToChatMessage(msg));
					});
				} else if (apiClientResponse.data && Array.isArray(apiClientResponse.data)) {
					// Response with data property
					apiClientResponse.data.forEach((msg: any) => {
						messagesArray.push(mapApiMessageToChatMessage(msg));
					});
					pagination = apiClientResponse.pagination;
				} else if (apiClientResponse.messages && Array.isArray(apiClientResponse.messages)) {
					// Response with messages property
					apiClientResponse.messages.forEach((msg: any) => {
						messagesArray.push(mapApiMessageToChatMessage(msg));
					});
					pagination = apiClientResponse.pagination;
				} else {
					// Object with numeric keys
					Object.keys(apiClientResponse).forEach((key) => {
						if (!isNaN(parseInt(key, 10))) {
							messagesArray.push(
								mapApiMessageToChatMessage(apiClientResponse[key])
							);
						}
					});
				}
			}

			console.log("✅ fetchChatMessages - Processed messages:", messagesArray.length);
			return { data: messagesArray, pagination };

		} catch (e: any) {
			console.error("💥 fetchChatMessages - Error:", e);
			return rejectWithValue(e.message || "Failed to fetch messages");
		}
	}
);

export interface SendMessageParams {
	roomId: string;
	senderId: string;
	content: string;
	type?: string;
}

export const sendChatMessage = createAsyncThunk<
	ChatMessage,
	SendMessageParams,
	{ rejectValue: string }
>("chat/sendMessage", async (payload, { rejectWithValue }) => {
	try {
		console.log("📤 sendChatMessage - Sending message:", payload);
		
		if (!payload.roomId || !payload.senderId || !payload.content?.trim()) {
			return rejectWithValue("Missing required message data");
		}

		const messagePayload = {
			...payload,
			type: payload.type || 'text',
			content: payload.content.trim()
		};

		const newApiMessage = await post<any>("/chat/messages", messagePayload);
		console.log("✅ sendChatMessage - Message sent:", newApiMessage);
		
		return mapApiMessageToChatMessage(newApiMessage);
	} catch (e: any) {
		console.error("💥 sendChatMessage - Error:", e);
		return rejectWithValue(e.message || "Failed to send message");
	}
});

export const createChatRoom = createAsyncThunk<
	ChatRoom,
	CreateRoomPayload,
	{ rejectValue: string }
>("chat/createRoom", async (payload, { rejectWithValue }) => {
	try {
		console.log("🗂️ createChatRoom - Creating room:", payload);
		
		if (!payload.name?.trim()) {
			return rejectWithValue("Room name is required");
		}

		const newChatRoom = await post<ChatRoom>("/chat/rooms", payload);
		console.log("✅ createChatRoom - Room created:", newChatRoom);
		
		if (!newChatRoom || !newChatRoom.id) {
			throw new Error("Invalid response from server on room creation.");
		}
		return newChatRoom;
	} catch (e: any) {
		console.error("💥 createChatRoom - Error:", e);
		const errorMessage = e.message || "Failed to create chat room";
		return rejectWithValue(errorMessage);
	}
});

// Enhanced message mapping with validation
const mapApiMessageToChatMessage = (apiMessage: any): ChatMessage => {
	if (!apiMessage) {
		throw new Error("Invalid message data");
	}

	const mapped = {
		...apiMessage,
		id: apiMessage.id || apiMessage._id,
		content: apiMessage.content || '',
		timestamp: apiMessage.createdAt || apiMessage.timestamp || new Date().toISOString(),
		senderId: apiMessage.senderId || apiMessage.sender?.id || apiMessage.userId,
		roomId: apiMessage.roomId,
		type: apiMessage.type || 'text',
		sender: apiMessage.user || apiMessage.sender
			? {
					id: apiMessage.user?.id || apiMessage.sender?.id || apiMessage.senderId,
					name: apiMessage.user?.name || apiMessage.sender?.name || 'Unknown User',
					avatarUrl: apiMessage.user?.avatarUrl || apiMessage.sender?.avatarUrl,
					role: apiMessage.user?.role || apiMessage.sender?.role || 'user',
			  }
			: undefined,
		// Add delivery and read status if available
		isDelivered: apiMessage.isDelivered || false,
		isRead: apiMessage.isRead || false,
		deliveredAt: apiMessage.deliveredAt,
		readAt: apiMessage.readAt
	};

	console.log("📄 mapApiMessageToChatMessage - Mapped:", apiMessage.id, "->", mapped.id);
	return mapped;
};

// Update existing chat room
export const updateChatRoom = createAsyncThunk(
  'chat/updateChatRoom',
  async ({ roomId, name, type, participantIds }: { roomId: string; name: string; type: string; participantIds: string[] }, { rejectWithValue }) => {
    try {
		console.log("🔧 updateChatRoom - Updating room:", roomId, { name, type, participantIds });
		
		const response = await apiClient(`/chat/rooms/${roomId}`, {
		  method: 'PUT',
		  headers: { 'Content-Type': 'application/json' },
		  body: JSON.stringify({ name, type, participantIds }),
		  requiresAuth: true
		});
		
		console.log("✅ updateChatRoom - Updated:", response);
		return response;
	} catch (error: any) {
		console.error("💥 updateChatRoom - Error:", error);
		return rejectWithValue(error.message || "Failed to update chat room");
	}
  }
);

// Delete chat room
export const deleteChatRoom = createAsyncThunk(
  'chat/deleteChatRoom',
  async (roomId: string, { rejectWithValue }) => {
    try {
		console.log("🗑️ deleteChatRoom - Deleting room:", roomId);
		
		await apiClient(`/chat/rooms/${roomId}`, {
		  method: 'DELETE',
		  requiresAuth: true
		});
		
		console.log("✅ deleteChatRoom - Deleted:", roomId);
		return roomId;
	} catch (error: any) {
		console.error("💥 deleteChatRoom - Error:", error);
		return rejectWithValue(error.message || "Failed to delete chat room");
	}
  }
);

// Mark room as read
export const markRoomAsRead = createAsyncThunk(
  'chat/markRoomAsRead',
  async ({ roomId, userId }: { roomId: string; userId: string }, { rejectWithValue }) => {
    try {
		console.log("👁️ markRoomAsRead - Marking room as read:", roomId, userId);
		
		await apiClient(`/chat/rooms/${roomId}/mark-read`, {
		  method: 'POST',
		  headers: { 'Content-Type': 'application/json' },
		  body: JSON.stringify({ userId }),
		  requiresAuth: true
		});
		
		console.log("✅ markRoomAsRead - Marked as read:", roomId);
		return { roomId, userId };
	} catch (error: any) {
		console.error("💥 markRoomAsRead - Error:", error);
		return rejectWithValue(error.message || "Failed to mark room as read");
	}
  }
);

// Get unread counts
export const fetchUnreadCounts = createAsyncThunk(
  'chat/fetchUnreadCounts',
  async (userId: string, { rejectWithValue }) => {
    try {
		console.log("📊 fetchUnreadCounts - Fetching for user:", userId);
		
		const response = await apiClient(`/chat/rooms/unread-counts?userId=${userId}`, {
		  method: 'GET',
		  requiresAuth: true
		});
		
		console.log("✅ fetchUnreadCounts - Counts:", response);
		return response;
	} catch (error: any) {
		console.error("💥 fetchUnreadCounts - Error:", error);
		return rejectWithValue(error.message || "Failed to fetch unread counts");
	}
  }
);

// Add participants
export const addParticipantsToRoom = createAsyncThunk(
  'chat/addParticipantsToRoom',
  async ({ roomId, participantIds }: { roomId: string; participantIds: string[] }, { rejectWithValue }) => {
    try {
		console.log("➕ addParticipantsToRoom - Adding participants:", roomId, participantIds);
		
		const response = await apiClient(`/chat/rooms/${roomId}/participants`, {
		  method: 'POST',
		  headers: { 'Content-Type': 'application/json' },
		  body: JSON.stringify({ participantIds }),
		  requiresAuth: true
		});
		
		console.log("✅ addParticipantsToRoom - Added:", response);
		return response;
	} catch (error: any) {
		console.error("💥 addParticipantsToRoom - Error:", error);
		return rejectWithValue(error.message || "Failed to add participants");
	}
  }
);

// Remove participants
export const removeParticipantsFromRoom = createAsyncThunk(
  'chat/removeParticipantsFromRoom',
  async ({ roomId, participantIds }: { roomId: string; participantIds: string[] }, { rejectWithValue }) => {
    try {
		console.log("➖ removeParticipantsFromRoom - Removing participants:", roomId, participantIds);
		
		const response = await apiClient(`/chat/rooms/${roomId}/participants`, {
		  method: 'DELETE',
		  headers: { 'Content-Type': 'application/json' },
		  body: JSON.stringify({ participantIds }),
		  requiresAuth: true
		});
		
		console.log("✅ removeParticipantsFromRoom - Removed:", response);
		return response;
	} catch (error: any) {
		console.error("💥 removeParticipantsFromRoom - Error:", error);
		return rejectWithValue(error.message || "Failed to remove participants");
	}
  }
);

// Handle unread count update
export const handleUnreadCountUpdate = createAsyncThunk(
  'chat/handleUnreadCountUpdate',
  async ({ roomId, count }: { roomId: string; count: number }, { dispatch }) => {
    console.log("📈 handleUnreadCountUpdate - Updating count:", roomId, count);
    // This would typically update the local state
    return { roomId, count };
  }
);

// Batch mark rooms as read
export const markMultipleRoomsAsRead = createAsyncThunk(
  'chat/markMultipleRoomsAsRead',
  async ({ roomIds, userId }: { roomIds: string[]; userId: string }, { rejectWithValue }) => {
    try {
		console.log("👁️ markMultipleRoomsAsRead - Marking multiple rooms as read:", roomIds, userId);
		
		await apiClient('/chat/rooms/mark-read-bulk', {
		  method: 'POST',
		  headers: { 'Content-Type': 'application/json' },
		  body: JSON.stringify({ roomIds, userId }),
		  requiresAuth: true
		});
		
		console.log("✅ markMultipleRoomsAsRead - Marked as read:", roomIds);
		return roomIds;
	} catch (error: any) {
		console.error("💥 markMultipleRoomsAsRead - Error:", error);
		return rejectWithValue(error.message || "Failed to mark rooms as read");
	}
  }
);

// Delete a specific chat message
export const deleteChatMessage = createAsyncThunk(
  'chat/deleteChatMessage',
  async ({ messageId, roomId }: { messageId: string; roomId: string }, { rejectWithValue }) => {
    try {
		console.log("🗑️ deleteChatMessage - Deleting message:", messageId, "from room:", roomId);
		
		await apiClient(`/chat/messages/${messageId}`, {
		  method: 'DELETE',
		  requiresAuth: true
		});

		console.log("✅ deleteChatMessage - Deleted:", messageId);
		return { messageId, roomId };
	} catch (error: any) {
		console.error("💥 deleteChatMessage - Error:", error);
		return rejectWithValue(error.message || "Failed to delete message");
	}
  }
);

// TEST THUNK - for debugging API connectivity
export const testApiConnection = createAsyncThunk(
  'chat/testApiConnection',
  async (userId: string, { rejectWithValue }) => {
    try {
      console.log("🧪 testApiConnection - Testing API connectivity for user:", userId);
      
      // Test basic API connectivity
      const response = await apiClient('/chat/test', {
        method: 'GET',
        requiresAuth: true
      });
      
      console.log("✅ testApiConnection - API is reachable:", response);
      return response;
    } catch (error: any) {
      console.error("💥 testApiConnection - API test failed:", error);
      return rejectWithValue(error.message || "API connection test failed");
    }
  }
);