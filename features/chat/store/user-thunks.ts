// features/chat/store/user-thunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api-client';

// Fetch all users for chat room management
export const fetchAllUsers = createAsyncThunk(
  'users/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient('/admin/users', {
        method: 'GET',
        requiresAuth: true,
      });

      // Ensure the response is an array and has the expected structure
      if (!Array.isArray(response)) {
        throw new Error('Invalid response format: expected array of users');
      }

      // Transform the response to ensure consistent structure
      return response.map((user: any) => ({
        id: user.id || user._id, // Handle both id formats
        name: user.name || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
        email: user.email || '',
        role: user.role || 'student',
        avatar: user.avatar || user.avatarUrl || null,
        isActive: user.isActive !== false, // Default to true if not specified
      }));
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      
      // Return a more descriptive error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch users';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchAllChatUsers = createAsyncThunk(
  'users/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient('/admin/users', {
        method: 'GET',
        requiresAuth: true,
      });

      // ✅ Handle both formats: direct array or nested object
      const usersArray = response?.data?.users || response?.data?.data?.users;
      if (!Array.isArray(usersArray)) {
        throw new Error('Invalid response format: expected array of users');
      }

      return usersArray.map((user: any) => ({
        id: user.id || user._id,
        name:
          user.name ||
          user.fullName ||
          `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
          'Unknown User',
        email: user.email || '',
        role: user.role || 'student',
        avatar: user.avatar || user.avatarUrl || null,
        isActive: user.isActive !== false,
      }));
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch users';
      return rejectWithValue(errorMessage);
    }
  }
);



// Alternative: Fetch users with search/filtering
export const fetchUsersWithSearch = createAsyncThunk(
  'users/fetchUsersWithSearch',
  async ({ search = '', role }: { search?: string; role?: string } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (role) params.append('role', role);
      
      const response = await apiClient(`/users?${params.toString()}`, {
        method: 'GET',
        requiresAuth: true,
      });

      if (!Array.isArray(response)) {
        throw new Error('Invalid response format');
      }

      return response.map((user: any) => ({
        id: user.id || user._id,
        name: user.name || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
        email: user.email || '',
        role: user.role || 'student',
        avatar: user.avatar || user.avatarUrl || null,
        isActive: user.isActive !== false,
      }));
    } catch (error: any) {
      console.error('Failed to fetch users with search:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch users');
    }
  }
);

// Fetch users specifically for a chat room (participants and potential participants)
export const fetchChatRoomUsers = createAsyncThunk(
  'users/fetchChatRoomUsers',
  async (roomId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient(`/chat/rooms/${roomId}/available-users`, {
        method: 'GET',
        requiresAuth: true,
      });

      return {
        roomId,
        users: response.map((user: any) => ({
          id: user.id || user._id,
          name: user.name || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
          email: user.email || '',
          role: user.role || 'student',
          avatar: user.avatar || user.avatarUrl || null,
          isParticipant: user.isParticipant || false,
        }))
      };
    } catch (error: any) {
      console.error('Failed to fetch chat room users:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch chat room users');
    }
  }
);