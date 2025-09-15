// features/chat/store/chat-thunks.ts - FIXED VERSION WITH BETTER ERROR HANDLING

import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from '@/lib/api-client';
import type {
	ChatRoom,
	ChatMessage,
} from "../types/chat-types";
import { get, post } from "@/lib/api-client";

export interface FetchMessagesParams {
	roomId: string;
	page?: number;
	limit?: number;
}

// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map<string, Promise<any>>();

// FIXED fetchChatRooms with better error handling
export const fetchChatRooms = createAsyncThunk(
  'chat/fetchChatRooms',
  async (userId: string, { rejectWithValue, signal }) => {
    try {
      console.log("🔍 fetchChatRooms - Starting fetch for user ID:", userId);
      
      if (!userId) {
        console.error("❌ fetchChatRooms - No user ID provided");
        return rejectWithValue("User ID is required");
      }

      const requestKey = `rooms-${userId}`;
      if (ongoingRequests.has(requestKey)) {
        console.log("⏳ fetchChatRooms - Request already in progress, waiting...");
        return await ongoingRequests.get(requestKey);
      }

      const url = `/chat/rooms?userId=${userId}&includeUnread=true`;
      console.log("📡 fetchChatRooms - Making API call to:", url);

      const requestPromise = apiClient(url, {
        method: 'GET',
        requiresAuth: true,
        signal // Add abort signal support
      });

      ongoingRequests.set(requestKey, requestPromise);

      try {
        const response: any = await requestPromise;
        console.log("📦 fetchChatRooms - Raw API response:", response);

        if (signal?.aborted) {
          throw new Error('Request aborted');
        }

        let rooms = [];
        
        if (response?.success && Array.isArray(response.data)) {
          rooms = response.data;
        } else if (Array.isArray(response)) {
          rooms = response;
        } else if (response?.data && Array.isArray(response.data)) {
          rooms = response.data;
        } else if (response?.rooms && Array.isArray(response.rooms)) {
          rooms = response.rooms;
        } else {
          console.warn("⚠️ fetchChatRooms - Unexpected response format, returning empty array");
          rooms = [];
        }

        console.log("🏠 fetchChatRooms - Processed rooms count:", rooms.length);

        const processedRooms = rooms.map((room: any) => ({
          ...room, 
          unreadCount: room.unreadCount || 0,
          id: room.id || room._id,
          name: room.name || 'Unnamed Room',
          type: room.type || 'general',
          participants: room.participants || [],
          lastMessage: room.lastMessage || null,
          lastMessageAt: room.lastMessageAt || room.updatedAt || room.createdAt,
          createdAt: room.createdAt || new Date().toISOString(),
          updatedAt: room.updatedAt || new Date().toISOString()
        }));

        return processedRooms;

      } finally {
        ongoingRequests.delete(requestKey);
      }

    } catch (error: any) {
      console.error("💥 fetchChatRooms - Error occurred:", error);
      
      if (error.name === 'AbortError' || error.message === 'Request aborted') {
        console.log("🛑 fetchChatRooms - Request was aborted");
        return rejectWithValue("Request cancelled");
      }
      
      let errorMessage = "Failed to fetch chat rooms";
      
      if (error.response?.status === 401) {
        errorMessage = "Authentication required. Please log in again.";
      } else if (error.response?.status === 403) {
        errorMessage = "Access denied. You don't have permission to view chat rooms.";
      } else if (error.response?.status === 404) {
        errorMessage = "Chat service not found. Please check your connection.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = "Network error. Please check your internet connection.";
      } else {
        errorMessage = error.message || "Unknown error occurred";
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// FIXED fetchChatMessages with better request management
export const fetchChatMessages = createAsyncThunk<
	{ data: ChatMessage[], pagination?: any },
	FetchMessagesParams,
	{ rejectValue: string }
>(
	"chat/fetchMessages",
	async ({ roomId, page = 1, limit = 30 }, { rejectWithValue, signal }) => {
		try {
			console.log("📨 fetchChatMessages - Fetching messages for room:", roomId, "page:", page);

			if (!roomId) {
				return rejectWithValue("Room ID is required");
			}

			// Prevent duplicate requests
			const requestKey = `messages-${roomId}-${page}-${limit}`;
			if (ongoingRequests.has(requestKey)) {
				console.log("⏳ fetchChatMessages - Request already in progress, waiting...");
				try {
					return await ongoingRequests.get(requestKey);
				} catch (error) {
					// If the ongoing request fails, we'll make a new one
					ongoingRequests.delete(requestKey);
				}
			}

			// const url = `/chat/messages?roomId=${roomId}&page=${page}&limit=${limit}`;
			const url = `/chat/messages?roomId=${roomId}&page=${page}&limit=${limit}&_ts=${Date.now()}`;
			console.log("📡 fetchChatMessages - API URL:", url);

			const requestPromise = get<any>(url, { signal });
			ongoingRequests.set(requestKey, requestPromise);

			try {
				const apiClientResponse = await requestPromise;
				console.log("📦 fetchChatMessages - Raw response:", apiClientResponse);

				if (signal?.aborted) {
					throw new Error('Request aborted');
				}

				const messagesArray: ChatMessage[] = [];
				let pagination = null;

				// Handle different response formats
				if (apiClientResponse?.success && Array.isArray(apiClientResponse.data)) {
					apiClientResponse.data.forEach((msg: any) => {
						messagesArray.push(mapApiMessageToChatMessage(msg));
					});
					pagination = apiClientResponse.pagination;
				} else if (Array.isArray(apiClientResponse)) {
					apiClientResponse.forEach((msg) => {
						messagesArray.push(mapApiMessageToChatMessage(msg));
					});
				} else if (apiClientResponse?.data && Array.isArray(apiClientResponse.data)) {
					apiClientResponse.data.forEach((msg: any) => {
						messagesArray.push(mapApiMessageToChatMessage(msg));
					});
					pagination = apiClientResponse.pagination;
				} else if (apiClientResponse?.messages && Array.isArray(apiClientResponse.messages)) {
					apiClientResponse.messages.forEach((msg: any) => {
						messagesArray.push(mapApiMessageToChatMessage(msg));
					});
					pagination = apiClientResponse.pagination;
				} else {
					console.warn("⚠️ fetchChatMessages - Unexpected response format, returning empty array");
				}

				console.log("✅ fetchChatMessages - Processed messages:", messagesArray.length);
				return { data: messagesArray, pagination };

			} finally {
				ongoingRequests.delete(requestKey);
			}

		} catch (e: any) {
			console.error("💥 fetchChatMessages - Error:", e);
			
			if (e.name === 'AbortError' || e.message === 'Request aborted') {
				console.log("🛑 fetchChatMessages - Request was aborted");
				return rejectWithValue("Request cancelled");
			}
			
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
>("chat/sendMessage", async (payload, { rejectWithValue, signal }) => {
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

		const newApiMessage = await post<any>("/chat/messages", messagePayload, { signal });
		
		if (signal?.aborted) {
			throw new Error('Request aborted');
		}
		
		console.log("✅ sendChatMessage - Message sent:", newApiMessage);
		return mapApiMessageToChatMessage(newApiMessage);
	} catch (e: any) {
		console.error("💥 sendChatMessage - Error:", e);
		
		if (e.name === 'AbortError' || e.message === 'Request aborted') {
			return rejectWithValue("Message sending was cancelled");
		}
		
		return rejectWithValue(e.message || "Failed to send message");
	}
});

export const createChatRoom = createAsyncThunk<
	ChatRoom,
	any,
	{ rejectValue: string }
>("chat/createRoom", async (payload, { rejectWithValue, signal }) => {
	try {
		console.log("🗂️ createChatRoom - Creating room:", payload);
		
		if (!payload.name?.trim()) {
			return rejectWithValue("Room name is required");
		}

		const newChatRoom = await post<ChatRoom>("/chat/rooms", payload, { signal });
		
		if (signal?.aborted) {
			throw new Error('Request aborted');
		}
		
		console.log("✅ createChatRoom - Room created:", newChatRoom);
		
		if (!newChatRoom || !newChatRoom.id) {
			throw new Error("Invalid response from server on room creation.");
		}
		
		return newChatRoom;
	} catch (e: any) {
		console.error("💥 createChatRoom - Error:", e);
		
		if (e.name === 'AbortError' || e.message === 'Request aborted') {
			return rejectWithValue("Room creation was cancelled");
		}
		
		const errorMessage = e.message || "Failed to create chat room";
		return rejectWithValue(errorMessage);
	}
});

// Enhanced message mapping with better validation
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
		isDelivered: apiMessage.isDelivered || false,
		isRead: apiMessage.isRead || false,
		deliveredAt: apiMessage.deliveredAt,
		readAt: apiMessage.readAt
	};

	return mapped;
};

// Update existing chat room
export const updateChatRoom = createAsyncThunk(
  'chat/updateChatRoom',
  async ({ roomId, name, type, participantIds }: { roomId: string; name: string; type: string; participantIds: string[] }, { rejectWithValue, signal }) => {
    try {
		console.log("🔧 updateChatRoom - Updating room:", roomId, { name, type, participantIds });
		
		const response = await apiClient(`/chat/rooms/${roomId}`, {
		  method: 'PUT',
		  headers: { 'Content-Type': 'application/json' },
		  body: JSON.stringify({ name, type, participantIds }),
		  requiresAuth: true,
		  signal
		});
		
		if (signal?.aborted) {
			throw new Error('Request aborted');
		}
		
		console.log("✅ updateChatRoom - Updated:", response);
		return response;
	} catch (error: any) {
		console.error("💥 updateChatRoom - Error:", error);
		
		if (error.name === 'AbortError' || error.message === 'Request aborted') {
			return rejectWithValue("Update was cancelled");
		}
		
		return rejectWithValue(error.message || "Failed to update chat room");
	}
  }
);

// Delete chat room
export const deleteChatRoom = createAsyncThunk(
  'chat/deleteChatRoom',
  async (roomId: string, { rejectWithValue, signal }) => {
    try {
		console.log("🗑️ deleteChatRoom - Deleting room:", roomId);
		
		await apiClient(`/chat/rooms/${roomId}`, {
		  method: 'DELETE',
		  requiresAuth: true,
		  signal
		});
		
		if (signal?.aborted) {
			throw new Error('Request aborted');
		}
		
		console.log("✅ deleteChatRoom - Deleted:", roomId);
		return roomId;
	} catch (error: any) {
		console.error("💥 deleteChatRoom - Error:", error);
		
		if (error.name === 'AbortError' || error.message === 'Request aborted') {
			return rejectWithValue("Delete was cancelled");
		}
		
		return rejectWithValue(error.message || "Failed to delete chat room");
	}
  }
);

// Mark room as read
export const markRoomAsRead = createAsyncThunk(
  'chat/markRoomAsRead',
  async ({ roomId, userId }: { roomId: string; userId: string }, { rejectWithValue, signal }) => {
    try {
		console.log("👁️ markRoomAsRead - Marking room as read:", roomId, userId);
		
		await apiClient(`/chat/rooms/${roomId}/mark-read`, {
		  method: 'POST',
		  headers: { 'Content-Type': 'application/json' },
		  body: JSON.stringify({ userId }),
		  requiresAuth: true,
		  signal
		});
		
		if (signal?.aborted) {
			throw new Error('Request aborted');
		}
		
		console.log("✅ markRoomAsRead - Marked as read:", roomId);
		return { roomId, userId };
	} catch (error: any) {
		console.error("💥 markRoomAsRead - Error:", error);
		
		if (error.name === 'AbortError' || error.message === 'Request aborted') {
			return rejectWithValue("Mark as read was cancelled");
		}
		
		return rejectWithValue(error.message || "Failed to mark room as read");
	}
  }
);

// Clean up function for ongoing requests (call this when component unmounts)
export const cleanupOngoingRequests = () => {
	ongoingRequests.clear();
	console.log("🧹 Cleaned up all ongoing requests");
};

// Get unread counts
export const fetchUnreadCounts = createAsyncThunk(
  'chat/fetchUnreadCounts',
  async (userId: string, { rejectWithValue, signal }) => {
    try {
		console.log("📊 fetchUnreadCounts - Fetching for user:", userId);
		
		const response = await apiClient(`/chat/rooms/unread-counts?userId=${userId}`, {
		  method: 'GET',
		  requiresAuth: true,
		  signal
		});
		
		if (signal?.aborted) {
			throw new Error('Request aborted');
		}
		
		console.log("✅ fetchUnreadCounts - Counts:", response);
		return response;
	} catch (error: any) {
		console.error("💥 fetchUnreadCounts - Error:", error);
		
		if (error.name === 'AbortError' || error.message === 'Request aborted') {
			return rejectWithValue("Fetch unread counts was cancelled");
		}
		
		return rejectWithValue(error.message || "Failed to fetch unread counts");
	}
  }
);

// TEST THUNK - for debugging API connectivity
export const testApiConnection = createAsyncThunk(
  'chat/testApiConnection',
  async (userId: string, { rejectWithValue, signal }) => {
    try {
      console.log("🧪 testApiConnection - Testing API connectivity for user:", userId);
      
      const response = await apiClient('/chat/test', {
        method: 'GET',
        requiresAuth: true,
        signal
      });
      
      if (signal?.aborted) {
        throw new Error('Request aborted');
      }
      
      console.log("✅ testApiConnection - API is reachable:", response);
      return response;
    } catch (error: any) {
      console.error("💥 testApiConnection - API test failed:", error);
      
      if (error.name === 'AbortError' || error.message === 'Request aborted') {
        return rejectWithValue("API test was cancelled");
      }
      
      return rejectWithValue(error.message || "API connection test failed");
    }
  }
);