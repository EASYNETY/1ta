// features/notifications/types/notification-types.ts

export type NotificationType = 
  | "assignment" 
  | "grade" 
  | "course" 
  | "announcement" 
  | "message" 
  | "payment" 
  | "system";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
  href?: string; // Optional link to navigate to when clicked
  metadata?: Record<string, any>; // Optional additional data specific to notification type
}

export interface NotificationResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }
  };
  message?: string;
}

export interface MarkAsReadPayload {
  notificationId: string;
}

export interface MarkAllAsReadPayload {
  userId: string;
}

export interface NotificationsState {
  notifications: Notification[];
  totalNotifications: number;
  unreadCount: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  markAsReadStatus: "idle" | "loading" | "succeeded" | "failed";
  markAsReadError: string | null;
}
