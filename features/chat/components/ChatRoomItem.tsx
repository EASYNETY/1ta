// features/chat/components/ChatRoomItem.tsx

"use client"

import type React from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDistanceToNowStrict } from "date-fns"
import { parseISO } from "date-fns"
import { type ChatRoom, ChatRoomType } from "../types/chat-types"
import { BookOpen, Calendar, Users, Bell } from "lucide-react"

interface ChatRoomItemProps {
  room: ChatRoom
  isSelected: boolean
  onClick: () => void
}

export const ChatRoomItem: React.FC<ChatRoomItemProps> = ({ room, isSelected, onClick }) => {
  const formatLastMessageTime = (timestamp?: string): string => {
    if (!timestamp) return ""
    try {
      const date = parseISO(timestamp)
      return formatDistanceToNowStrict(date, { addSuffix: false })
    } catch {
      return ""
    }
  }

  // Get the appropriate icon based on room type
  const getRoomIcon = () => {
    const iconClass = "h-4 w-4"
    switch (room.type) {
      case ChatRoomType.COURSE:
        return <BookOpen className={iconClass} />
      case ChatRoomType.CLASS:
        return <Users className={iconClass} />
      case ChatRoomType.EVENT:
        return <Calendar className={iconClass} />
      case ChatRoomType.ANNOUNCEMENT:
        return <Bell className={iconClass} />
      default:
        return <Users className={iconClass} />
    }
  }

  // Get the appropriate color based on room type
  const getRoomColor = () => {
    switch (room.type) {
      case ChatRoomType.COURSE:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case ChatRoomType.CLASS:
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case ChatRoomType.EVENT:
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      case ChatRoomType.ANNOUNCEMENT:
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  // Format unread count for display
  const getUnreadDisplay = () => {
    if (!room.unreadCount || room.unreadCount === 0) return null
    if (room.unreadCount > 99) return "99+"
    return room.unreadCount.toString()
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all duration-200 cursor-pointer relative",
        isSelected 
          ? "bg-primary/10 text-primary ring-2 ring-primary/20 shadow-sm" 
          : "bg-card/65 text-foreground/80 hover:bg-muted/70 hover:text-foreground hover:shadow-sm",
        room.unreadCount && room.unreadCount > 0 && !isSelected && "bg-primary/5 border-l-2 border-l-primary/30"
      )}
      aria-current={isSelected ? "page" : undefined}
    >
      {/* Avatar with room type icon */}
      <Avatar className={cn(
        "h-10 w-10 border transition-colors", 
        isSelected ? "border-primary/30 ring-2 ring-primary/10" : "border-border"
      )}>
        <AvatarFallback
          className={cn(
            "flex items-center justify-center transition-colors", 
            isSelected ? "bg-primary/15 text-primary" : getRoomColor()
          )}
        >
          {getRoomIcon()}
        </AvatarFallback>
      </Avatar>

      {/* Room Content */}
      <div className="flex-1 overflow-hidden min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className={cn(
            "truncate font-medium text-sm transition-colors", 
            isSelected ? "text-primary" : "text-foreground",
            room.unreadCount && room.unreadCount > 0 && !isSelected && "font-semibold"
          )}>
            {room.name}
          </p>
          {/* Timestamp */}
          {room.lastMessage?.timestamp && (
            <span className={cn(
              "text-[10px] whitespace-nowrap ml-2 transition-colors",
              isSelected ? "text-primary/70" : "text-muted-foreground"
            )}>
              {formatLastMessageTime(room.lastMessage.timestamp)}
            </span>
          )}
        </div>
        
        {/* Last Message */}
        {room.lastMessage && (
          <div className="flex items-center justify-between">
            <p className={cn(
              "truncate text-xs leading-relaxed transition-colors", 
              isSelected ? "text-primary/80" : "text-muted-foreground",
              room.unreadCount && room.unreadCount > 0 && !isSelected && "font-medium text-foreground/90"
            )}>
              {room.lastMessage.senderName && room.isGroupChat ? (
                <span className="font-medium">
                  {room.lastMessage.senderName}: 
                </span>
              ) : null}
              <span className={room.lastMessage.senderName && room.isGroupChat ? "ml-1" : ""}>
                {room.lastMessage.content}
              </span>
            </p>
          </div>
        )}

        {/* Room Type Badge (only shown when not selected and has space) */}
        {!isSelected && !room.lastMessage && (
          <div className="mt-1">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              {room.type === ChatRoomType.COURSE ? "Course" :
               room.type === ChatRoomType.CLASS ? "Class" :
               room.type === ChatRoomType.EVENT ? "Event" :
               room.type === ChatRoomType.ANNOUNCEMENT ? "Announcement" : "Group"}
            </Badge>
          </div>
        )}
      </div>

      {/* Unread Count Badge */}
      {getUnreadDisplay() && (
        <div className="flex flex-col items-end justify-center ml-2">
          <Badge 
            className={cn(
              "h-5 min-w-[20px] px-1.5 flex items-center justify-center text-[10px] font-semibold transition-all",
              isSelected 
                ? "bg-primary text-primary-foreground" 
                : "bg-primary text-primary-foreground animate-pulse"
            )}
          >
            {getUnreadDisplay()}
          </Badge>
        </div>
      )}

      {/* Online Indicator (if room has active participants) */}
      {room.activeParticipants && room.activeParticipants > 0 && (
        <div className="absolute top-2 right-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </button>
  )
}