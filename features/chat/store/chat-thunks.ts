import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
	ChatRoom,
	ChatMessage,
	FetchRoomsResponse,
	FetchMessagesResponse,
	SendMessageResponse,
	CreateRoomPayload,
	CreateRoomResponse,
	MarkReadResponse,
} from "../types/chat-types";
import { get, post } from "@/lib/api-client";
import { MarkRoomReadPayload } from "@/data/mock-chat-data";

// Fetch chat rooms for a user
// export const fetchChatRooms = createAsyncThunk<
// 	ChatRoom[],
// 	string, // userId
// 	{ rejectValue: string }
// >("chat/fetchRooms", async (userId, { rejectWithValue }) => {
// 	try {
// 		const response = await get<FetchRoomsResponse>(
// 			`/chat/rooms/user/${userId}`
// 		);
// 		return response.rooms;
// 	} catch (e: any) {
// 		return rejectWithValue(e.message || "Failed to fetch chat rooms");
// 	}
// });

// Fetch messages for a specific room
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
			const response = await get<FetchMessagesResponse>(
				`/chat/messages?roomId=${roomId}&page=${page}&limit=${limit}`
			);
			return response.messages;
		} catch (e: any) {
			return rejectWithValue(e.message || "Failed to fetch messages");
		}
	}
);

export const fetchChatRooms = createAsyncThunk<
	ChatRoom[],
	void, // No argument is needed (changed from string)
	{ rejectValue: string }
>("chat/fetchRooms", async (_, { rejectWithValue }) => {
	try {
        // Call a generic endpoint that returns all rooms.
        // Adjust "/chat/rooms" if your backend endpoint is different (e.g., "/chat/rooms/all").
		const response = await get<FetchRoomsResponse>(
			`/chat/rooms` 
		);
		// Assuming your apiClient still unwraps the response, 
        // and the response.data contains a `rooms` array.
		return response.rooms; 
	} catch (e: any) {
		return rejectWithValue(e.message || "Failed to fetch chat rooms");
	}
});

// Send a new message
export interface SendMessageParams {
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
			const response = await post<SendMessageResponse>("/chat/messages", {
				roomId,
				content,
				senderId, // Include senderId for mock API
			});
			return response.message;
		} catch (e: any) {
			return rejectWithValue(e.message || "Failed to send message");
		}
	}
);

export const createChatRoom = createAsyncThunk<
	ChatRoom,
	CreateRoomPayload,
	{ rejectValue: string }
>("chat/createRoom", async (payload, { rejectWithValue }) => {
	try {
		// apiClient.post will return the content of the 'data' field from the backend response,
		// which is the ChatRoom object.
		const newChatRoom = await post<ChatRoom>("/chat/rooms", payload);

		if (!newChatRoom || !newChatRoom.id) {
			console.error(
				"Failed to create chat room: API response did not contain a valid room object.",
				newChatRoom
			);
			return rejectWithValue(
				"Failed to create chat room: Invalid response from server."
			);
		}
		console.log("Chat room created successfully in thunk:", newChatRoom);
		return newChatRoom;
	} catch (e: any) {
		const errorMessage =
			e.response?.data?.message || e.message || "Failed to create chat room";
		console.error("Error creating chat room in thunk:", errorMessage, e);
		return rejectWithValue(errorMessage);
	}
});

export const markRoomAsRead = createAsyncThunk<
	{ roomId: string; updatedRoom?: ChatRoom }, // Return roomId and optionally the updated room data
	MarkRoomReadPayload,
	{ rejectValue: string }
>("chat/markRoomAsRead", async (payload, { rejectWithValue }) => {
	try {
		// In a real API, you might not need to send all messages,
		// just the roomId and maybe the timestamp of the last read message.
		const response = await post<MarkReadResponse>(
			"/chat/rooms/mark-read",
			payload
		); // Example endpoint
		if (response.success) {
			return { roomId: payload.roomId, updatedRoom: response.updatedRoom };
		} else {
			return rejectWithValue(
				response.message || "Failed to mark room as read."
			);
		}
	} catch (e: any) {
		const errorMessage =
			e.response?.data?.message || e.message || "Failed to mark room as read";
		return rejectWithValue(errorMessage);
	}
});
