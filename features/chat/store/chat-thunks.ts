// features/chat/store/chat-thunks.ts - Missing functions
import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api-client';
import { ChatMessage, MessageType } from '../types/chat-types';

// This was missing from your chat-thunks file
export const deleteChatMessage = createAsyncThunk(
    'chat/deleteChatMessage',
    async ({ roomId, messageId }: { roomId: string; messageId: string }, { rejectWithValue }) => {
        try {
            const response = await apiClient(`/chat/rooms/${roomId}/messages/${messageId}`, {
                method: 'DELETE',
                requiresAuth: true,
            });

            return { roomId, messageId, data: response.data };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete message');
        }
    }
);

// If you don't have these other functions, here they are as well:
export const fetchChatRooms = createAsyncThunk(
    'chat/fetchChatRooms',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await apiClient(`/chat/rooms?userId=${userId}`, {
                requiresAuth: true,
            });

            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch chat rooms');
        }
    }
);

export const fetchChatMessages = createAsyncThunk(
    'chat/fetchChatMessages',
    async ({ roomId, page = 1, limit = 30 }: { roomId: string; page?: number; limit?: number }, { rejectWithValue }) => {
        try {
            const response = await apiClient(`/chat/rooms/${roomId}/messages?page=${page}&limit=${limit}`, {
                requiresAuth: true,
            });

            return { roomId, data: response.data, page, limit };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch messages');
        }
    }
);

export const sendChatMessage = createAsyncThunk(
    'chat/sendChatMessage',
    async ({ 
        roomId, 
        content, 
        type, 
        parentMessageId, 
        metadata,
        tempId 
    }: { 
        roomId: string; 
        content: string; 
        type: MessageType;
        parentMessageId?: string | null;
        metadata?: any;
        tempId?: string;
    }, { rejectWithValue }) => {
        try {
            const response = await apiClient(`/chat/rooms/${roomId}/messages`, {
                method: 'POST',
                body: JSON.stringify({
                    content,
                    type,
                    parentMessageId,
                    metadata
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                requiresAuth: true,
            });

            return { roomId, tempId, message: response.data };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to send message');
        }
    }
);

export const createChatRoom = createAsyncThunk(
    'chat/createChatRoom',
    async ({ 
        name, 
        type, 
        participantIds, 
        description 
    }: { 
        name: string; 
        type: string;
        participantIds: string[];
        description?: string;
    }, { rejectWithValue }) => {
        try {
            const response = await apiClient('/chat/rooms', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    type,
                    participantIds,
                    description
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                requiresAuth: true,
            });

            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create chat room');
        }
    }
);

export const updateChatRoom = createAsyncThunk(
    'chat/updateChatRoom',
    async ({ 
        roomId,
        name, 
        type, 
        participantIds, 
        description 
    }: { 
        roomId: string;
        name?: string; 
        type?: string;
        participantIds?: string[];
        description?: string;
    }, { rejectWithValue }) => {
        try {
            const response = await apiClient(`/chat/rooms/${roomId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name,
                    type,
                    participantIds,
                    description
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                requiresAuth: true,
            });

            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update chat room');
        }
    }
);