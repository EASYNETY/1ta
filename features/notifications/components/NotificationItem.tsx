"use client"

import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { Notification } from "../types/notification-types";

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  // Format the time (e.g., "2 hours ago", "3 days ago")
  const formattedTime = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  // Get icon based on notification type
  const getNotificationIcon = () => {
    switch (notification.type) {
      case "assignment":
        return "📝";
      case "grade":
        return "🎓";
      case "course":
        return "📚";
      case "announcement":
        return "📢";
      case "message":
        return "💬";
      case "payment":
        return "💰";
      case "system":
        return "⚙️";
      default:
        return "🔔";
    }
  };

  return (
    <Link 
      href={notification.href || '#'} 
      className="block" 
      onClick={onClick}
    >
      <div 
        className={cn(
          "rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50 cursor-pointer",
          !notification.read 
            ? "border-primary/20 bg-primary/5 dark:bg-primary/10" 
            : "border-border/30"
        )}
      >
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">
              {getNotificationIcon()}
            </span>
            <h4 className="font-medium text-foreground">{notification.title}</h4>
          </div>
          {!notification.read && (
            <div 
              aria-label="Unread" 
              className="h-2 w-2 rounded-full bg-primary flex-shrink-0 ml-2" 
            />
          )}
        </div>
        <p className="text-muted-foreground text-xs leading-snug line-clamp-2">
          {notification.message}
        </p>
        <p className="mt-2 text-[10px] text-muted-foreground/80">
          {formattedTime}
        </p>
      </div>
    </Link>
  );
}
