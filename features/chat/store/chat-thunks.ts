import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
	ChatRoom,
	ChatMessage,
	FetchRoomsResponse,
	FetchMessagesResponse,
	SendMessageResponse,
	CreateRoomPayload,
	CreateRoomResponse,
} from "../types/chat-types";
import { get, post } from "@/lib/api-client";

// Fetch chat rooms for a user
export const fetchChatRooms = createAsyncThunk<
	ChatRoom[],
	string, // userId
	{ rejectValue: string }
>("chat/fetchRooms", async (userId, { rejectWithValue }) => {
	try {
		const response = await get<FetchRoomsResponse>(
			`/chat/rooms/user/${userId}`
		);
		return response.rooms;
	} catch (e: any) {
		return rejectWithValue(e.message || "Failed to fetch chat rooms");
	}
});

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
	ChatRoom, // Returns the created ChatRoom
	CreateRoomPayload, // Payload defined in mock-chat-data or a similar shared type
	{ rejectValue: string }
>("chat/createRoom", async (payload, { rejectWithValue }) => {
	try {
		const response = await post<CreateRoomResponse>("/chat/rooms", payload); // API endpoint for creating rooms
		if (response.success && response.room) {
			return response.room;
		} else {
			return rejectWithValue(
				"Failed to create chat room: No room data returned."
			);
		}
	} catch (e: any) {
		const errorMessage =
			e.response?.data?.message || e.message || "Failed to create chat room";
		return rejectWithValue(errorMessage);
	}
});
