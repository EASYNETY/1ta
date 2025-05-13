"use client"

import React, { useEffect } from "react";
import { Bell, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
  fetchNotifications, 
  markAllNotificationsAsRead,
  selectNotifications,
  selectNotificationsStatus,
  selectUnreadCount
} from "../store/notifications-slice";
import { NotificationItem } from "./NotificationItem";

interface NotificationListProps {
  onNotificationClick?: () => void;
}

export function NotificationList({ onNotificationClick }: NotificationListProps) {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const status = useAppSelector(selectNotificationsStatus);
  const unreadCount = useAppSelector(selectUnreadCount);
  
  // Fetch notifications when component mounts
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchNotifications({ limit: 20 }));
    }
  }, [dispatch, status]);

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead({ userId: "current" }));
  };

  // Render loading state
  if (status === "loading" && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Loader2 className="mb-2 size-10 text-muted-foreground/50 animate-spin" />
        <p className="text-sm text-muted-foreground">Loading notifications...</p>
      </div>
    );
  }

  // Render empty state
  if (status === "succeeded" && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bell className="mb-2 size-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">You're all caught up!</p>
      </div>
    );
  }

  // Render error state
  if (status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bell className="mb-2 size-10 text-red-500/50" />
        <p className="text-sm text-muted-foreground">Failed to load notifications</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4"
          onClick={() => dispatch(fetchNotifications({ limit: 20 }))}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {unreadCount > 0 && (
        <div className="px-4 py-2 border-b">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </Button>
        </div>
      )}
      
      <ScrollArea className="flex-1 overflow-y-scroll">
        <div className="p-4 space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={onNotificationClick}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
