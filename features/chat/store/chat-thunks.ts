import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
	ChatRoom,
	ChatMessage,
	FetchRoomsResponse,
	FetchMessagesResponse,
	SendMessageResponse,
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
