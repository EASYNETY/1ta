// features/chat/store/chat-thunks.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
	ChatRoom,
	ChatMessage,
	CreateRoomPayload,
	MarkReadResponse,
} from "../types/chat-types";
import { get, post } from "@/lib/api-client";
import { MarkRoomReadPayload } from "@/data/mock-chat-data";

export const fetchChatRooms = createAsyncThunk<
	ChatRoom[],
	void,
	{ rejectValue: string }
>("chat/fetchRooms", async (_, { rejectWithValue }) => {
	try {
		const apiClientResponse = await get<any>(`/chat/rooms`);
		const roomsArray: ChatRoom[] = [];
		if (apiClientResponse && typeof apiClientResponse === "object") {
			Object.keys(apiClientResponse).forEach((key) => {
				if (!isNaN(parseInt(key, 10))) {
					roomsArray.push(apiClientResponse[key]);
				}
			});
		}
		return roomsArray;
	} catch (e: any) {
		return rejectWithValue(e.message || "Failed to fetch chat rooms");
	}
});

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

export const markRoomAsRead = createAsyncThunk<
	{ roomId: string },
	MarkRoomReadPayload,
	{ rejectValue: string }
>("chat/markRoomAsRead", async (payload, { rejectWithValue }) => {
	try {
		const response = await post<MarkReadResponse>(
			"/chat/rooms/mark-read",
			payload
		);
		if (response.success) {
			return { roomId: payload.roomId };
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
