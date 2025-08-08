// features/chat/components/ChatRoomItem.tsx

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Users, Calendar, Megaphone, BookOpen, GraduationCap } from "lucide-react";
import { ChatRoomType } from "../types/chat-types";
import { formatDistanceToNow } from "date-fns";

interface ChatRoomItemProps {
  room: {
    id: string;
    name: string;
    type: ChatRoomType;
    lastMessageAt?: string;
    lastMessage?: {
      content: string;
      sender?: {
        name: string;
      };
    };
    participants?: Array<{
      id: string;
      name: string;
      avatar?: string;
    }>;
    unreadCount?: number; // Add this to your room type
  };
  isSelected: boolean;
  onClick: () => void;
}

export const ChatRoomItem: React.FC<ChatRoomItemProps> = ({
  room,
  isSelected,
  onClick,
}) => {
  const getTypeIcon = (type: ChatRoomType) => {
    switch (type) {
      case ChatRoomType.CLASS:
        return <GraduationCap className="h-4 w-4" />;
      case ChatRoomType.COURSE:
        return <BookOpen className="h-4 w-4" />;
      case ChatRoomType.EVENT:
        return <Calendar className="h-4 w-4" />;
      case ChatRoomType.ANNOUNCEMENT:
        return <Megaphone className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: ChatRoomType) => {
    switch (type) {
      case ChatRoomType.CLASS:
        return "text-blue-500";
      case ChatRoomType.COURSE:
        return "text-green-500";
      case ChatRoomType.EVENT:
        return "text-purple-500";
      case ChatRoomType.ANNOUNCEMENT:
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };

  const formatLastMessageTime = (timestamp?: string) => {
    if (!timestamp) return "";
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "";
    }
  };

  const truncateMessage = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Determine if this room has unread messages
  const hasUnread = (room.unreadCount ?? 0) > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all hover:bg-accent/50",
        isSelected && "bg-accent shadow-sm border",
        hasUnread && !isSelected && "bg-primary/5 border border-primary/20"
      )}
    >
      {/* Room Avatar/Icon */}
      <div className="relative flex-shrink-0">
        {room.participants && room.participants.length > 0 ? (
          <Avatar className="h-10 w-10">
            <AvatarImage src={room.participants[0]?.avatar} alt={room.participants[0]?.name} />
            <AvatarFallback className="text-xs font-medium">
              {getInitials(room.participants[0]?.name || room.name)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full bg-muted",
            getTypeColor(room.type)
          )}>
            {getTypeIcon(room.type)}
          </div>
        )}
        
        {/* Unread indicator dot */}
        {hasUnread && (
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-background" />
        )}
      </div>

      {/* Room Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between mb-1">
          <p className={cn(
            "text-sm font-medium truncate",
            hasUnread && "font-semibold"
          )}>
            {room.name}
          </p>
          
          {/* Unread Count Badge */}
          {hasUnread && (
            <Badge 
              variant="default" 
              className="h-5 min-w-[20px] px-1.5 text-xs font-semibold bg-primary text-primary-foreground ml-2 flex-shrink-0"
            >
              {room.unreadCount! > 99 ? "99+" : room.unreadCount}
            </Badge>
          )}
        </div>

        {/* Last Message Preview */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex-1 min-w-0">
            {room.lastMessage ? (
              <p className={cn(
                "truncate",
                hasUnread && "font-medium text-foreground/80"
              )}>
                {room.lastMessage.sender && (
                  <span className="font-medium">
                    {room.lastMessage.sender.name}:{" "}
                  </span>
                )}
                {truncateMessage(room.lastMessage.content)}
              </p>
            ) : (
              <p className="truncate text-muted-foreground/60">
                No messages yet
              </p>
            )}
          </div>
          
          {/* Last Message Time */}
          {room.lastMessageAt && (
            <span className="ml-2 flex-shrink-0 text-xs text-muted-foreground/70">
              {formatLastMessageTime(room.lastMessageAt)}
            </span>
          )}
        </div>

        {/* Participants Count */}
        <div className="flex items-center gap-1 mt-1">
          <Users className="h-3 w-3 text-muted-foreground/60" />
          <span className="text-xs text-muted-foreground/70">
            {room.participants?.length || 0} members
          </span>
          
          {/* Room Type Badge */}
          <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0.5 h-auto">
            {room.type}
          </Badge>
        </div>
      </div>
    </button>
  );
};