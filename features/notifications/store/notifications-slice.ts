// features/notifications/store/notifications-slice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { get, post } from "@/lib/api-client";
import type { RootState } from "@/store";
import type { 
  Notification, 
  NotificationsState, 
  NotificationResponse,
  MarkAsReadPayload,
  MarkAllAsReadPayload
} from "../types/notification-types";

// Initial state
const initialState: NotificationsState = {
  notifications: [],
  totalNotifications: 0,
  unreadCount: 0,
  status: "idle",
  error: null,
  markAsReadStatus: "idle",
  markAsReadError: null
};

// Async thunks
export const fetchNotifications = createAsyncThunk<
  { notifications: Notification[]; total: number; unreadCount: number },
  { page?: number; limit?: number },
  { rejectValue: string }
>(
  "notifications/fetchNotifications",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await get<NotificationResponse>(
        `/notifications?page=${page}&limit=${limit}`
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch notifications");
      }

      // Calculate unread count
      const unreadCount = response.data.notifications.filter(
        notification => !notification.read
      ).length;

      return {
        notifications: response.data.notifications,
        total: response.data.pagination.total,
        unreadCount
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch notifications");
    }
  }
);

export const markNotificationAsRead = createAsyncThunk<
  { notificationId: string },
  MarkAsReadPayload,
  { rejectValue: string }
>(
  "notifications/markAsRead",
  async ({ notificationId }, { rejectWithValue }) => {
    try {
      const response = await post<{ success: boolean; message?: string }>(
        `/notifications/${notificationId}/read`,
        {}
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to mark notification as read");
      }

      return { notificationId };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to mark notification as read");
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk<
  { success: boolean },
  MarkAllAsReadPayload,
  { rejectValue: string }
>(
  "notifications/markAllAsRead",
  async ({ userId }, { rejectWithValue }) => {
    try {
      const response = await post<{ success: boolean; message?: string }>(
        `/notifications/mark-all-read`,
        { userId }
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to mark all notifications as read");
      }

      return { success: true };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to mark all notifications as read");
    }
  }
);

// Slice
const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.totalNotifications = 0;
      state.unreadCount = 0;
    },
    resetNotificationStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
    resetMarkAsReadStatus: (state) => {
      state.markAsReadStatus = "idle";
      state.markAsReadError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.notifications = action.payload.notifications;
        state.totalNotifications = action.payload.total;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch notifications";
      })
      
      // Mark notification as read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.markAsReadStatus = "loading";
        state.markAsReadError = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.markAsReadStatus = "succeeded";
        
        // Update the notification in the state
        const index = state.notifications.findIndex(
          notification => notification.id === action.payload.notificationId
        );
        
        if (index !== -1) {
          state.notifications[index].read = true;
          // Decrement unread count if it was previously unread
          if (state.unreadCount > 0) {
            state.unreadCount -= 1;
          }
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.markAsReadStatus = "failed";
        state.markAsReadError = action.payload || "Failed to mark notification as read";
      })
      
      // Mark all notifications as read
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.markAsReadStatus = "loading";
        state.markAsReadError = null;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.markAsReadStatus = "succeeded";
        
        // Mark all notifications as read
        state.notifications.forEach(notification => {
          notification.read = true;
        });
        
        // Reset unread count
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.markAsReadStatus = "failed";
        state.markAsReadError = action.payload || "Failed to mark all notifications as read";
      });
  }
});

// Actions
export const { 
  clearNotifications, 
  resetNotificationStatus, 
  resetMarkAsReadStatus 
} = notificationsSlice.actions;

// Selectors
export const selectNotifications = (state: RootState) => state.notifications.notifications;
export const selectTotalNotifications = (state: RootState) => state.notifications.totalNotifications;
export const selectUnreadCount = (state: RootState) => state.notifications.unreadCount;
export const selectNotificationsStatus = (state: RootState) => state.notifications.status;
export const selectNotificationsError = (state: RootState) => state.notifications.error;
export const selectMarkAsReadStatus = (state: RootState) => state.notifications.markAsReadStatus;
export const selectMarkAsReadError = (state: RootState) => state.notifications.markAsReadError;

// Reducer
export default notificationsSlice.reducer;
