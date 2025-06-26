// features/chat/store/chat-thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
	ChatRoom,
	ChatMessage,
	FetchMessagesResponse,
	SendMessageResponse,
	CreateRoomPayload,
	MarkReadResponse,
} from "../types/chat-types";
import { get, post } from "@/lib/api-client";
import { MarkRoomReadPayload } from "@/data/mock-chat-data";

export const fetchChatRooms = createAsyncThunk<
	ChatRoom[], // This thunk will return an array of ChatRoom objects
	void,
	{ rejectValue: string }
>("chat/fetchRooms", async (_, { rejectWithValue }) => {
	try {
		// Your api-client returns the `data` property of the response, which IS the ChatRoom array
		const roomsArray = await get<ChatRoom[]>(`/chat/rooms`);
		return roomsArray;
	} catch (e: any) {
		return rejectWithValue(e.message || "Failed to fetch chat rooms");
	}
});

// --- Other Thunks (Unchanged) ---
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
			const response = await get<{ messages: ChatMessage[] }>(
				`/chat/messages?roomId=${roomId}&page=${page}&limit=${limit}`
			);
			return response.messages;
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
>(
	"chat/sendMessage",
	async ({ roomId, senderId, content }, { rejectWithValue }) => {
		try {
			const response = await post<{ message: ChatMessage }>("/chat/messages", {
				roomId,
				content,
				senderId,
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

export const markRoomAsRead = createAsyncThunk<
	{ roomId: string; updatedRoom?: ChatRoom },
	MarkRoomReadPayload,
	{ rejectValue: string }
>("chat/markRoomAsRead", async (payload, { rejectWithValue }) => {
	try {
		const response = await post<MarkReadResponse>(
			"/chat/rooms/mark-read",
			payload
		);
		if (response.success) {
			return { roomId: payload.roomId, updatedRoom: response.updatedRoom };
		} else {
			return rejectWithValue(
				response.message || "Failed to mark room as read."
			);
		}
	} catch (e: any) {
		const errorMessage = e.message || "Failed to mark room as read";
		return rejectWithValue(errorMessage);
	}
});
