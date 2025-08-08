// features/chat/store/user-slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchAllUsers, fetchUsersWithSearch, fetchChatRoomUsers } from './user-thunks';

export interface User {
  id: string;
  name: string;
  email?: string;
  role: 'student' | 'teacher' | 'instructor' | 'admin' | 'super_admin';
  avatar?: string | null;
  isActive?: boolean;
  isParticipant?: boolean; // For chat room context
}

interface UserState {
  users: User[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  searchQuery: string;
  filteredUsers: User[];
  chatRoomUsers: { [roomId: string]: User[] };
  lastFetchTime: number | null;
}

const initialState: UserState = {
  users: [],
  status: 'idle',
  error: null,
  searchQuery: '',
  filteredUsers: [],
  chatRoomUsers: {},
  lastFetchTime: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.filteredUsers = state.users.filter(user =>
        user.name.toLowerCase().includes(action.payload.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(action.payload.toLowerCase()))
      );
    },
    clearUsers: (state) => {
      state.users = [];
      state.filteredUsers = [];
      state.status = 'idle';
      state.error = null;
    },
    resetUserState: (state) => {
      return initialState;
    },
    updateUser: (state, action: PayloadAction<Partial<User> & { id: string }>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Handle fetchAllUsers
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload;
        state.filteredUsers = action.payload; // Initially show all users
        state.error = null;
        state.lastFetchTime = Date.now();
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || 'Failed to fetch users';
        console.error('fetchAllUsers failed:', action.error);
      });

    // Handle fetchUsersWithSearch
    builder
      .addCase(fetchUsersWithSearch.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsersWithSearch.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload;
        state.filteredUsers = action.payload;
        state.error = null;
        state.lastFetchTime = Date.now();
      })
      .addCase(fetchUsersWithSearch.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || 'Failed to search users';
      });

    // Handle fetchChatRoomUsers
    builder
      .addCase(fetchChatRoomUsers.pending, (state) => {
        // Don't change global status for room-specific fetch
      })
      .addCase(fetchChatRoomUsers.fulfilled, (state, action) => {
        const { roomId, users } = action.payload;
        state.chatRoomUsers[roomId] = users;
      })
      .addCase(fetchChatRoomUsers.rejected, (state, action) => {
        console.error('fetchChatRoomUsers failed:', action.error);
      });
  },
});

export const { 
  setSearchQuery, 
  clearUsers, 
  resetUserState, 
  updateUser 
} = userSlice.actions;

// Selectors
export const selectUsers = (state: { users: UserState }) => state.users.users;
export const selectUsersStatus = (state: { users: UserState }) => state.users.status;
export const selectUsersError = (state: { users: UserState }) => state.users.error;
export const selectFilteredUsers = (state: { users: UserState }) => state.users.filteredUsers;
export const selectSearchQuery = (state: { users: UserState }) => state.users.searchQuery;
export const selectChatRoomUsers = (state: { users: UserState }, roomId: string) => 
  state.users.chatRoomUsers[roomId] || [];

export default userSlice.reducer;