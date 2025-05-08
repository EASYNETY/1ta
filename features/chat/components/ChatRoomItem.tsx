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
    switch (room.type) {
      case ChatRoomType.COURSE:
        return <BookOpen className="h-4 w-4" />
      case ChatRoomType.CLASS:
        return <Users className="h-4 w-4" />
      case ChatRoomType.EVENT:
        return <Calendar className="h-4 w-4" />
      case ChatRoomType.ANNOUNCEMENT:
        return <Bell className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
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

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full flex-wrap items-center gap-3 rounded-lg p-2.5 text-left transition-colors cursor-pointer",
        isSelected ? "bg-primary/10 text-primary" : "bg-card/65 text-foreground/80 hover:bg-muted/50 hover:text-foreground",
      )}
      aria-current={isSelected ? "page" : undefined}
    >
      {/* Avatar with room type icon */}
      <Avatar className={cn("h-9 w-9 border", isSelected ? "border-primary/20" : "border-border")}>
        <AvatarFallback
          className={cn("flex items-center justify-center", isSelected ? "bg-primary/10 text-primary" : getRoomColor())}
        >
          {getRoomIcon()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 overflow-hidden">
        <p className={cn("truncate font-medium text-sm", isSelected ? "text-primary" : "text-foreground")}>
          {room.name}
        </p>
        {room.lastMessage && (
          <p className={cn("truncate text-xs", isSelected ? "text-primary/80" : "text-muted-foreground")}>
            {room.lastMessage.senderName && room.isGroupChat ? `${room.lastMessage.senderName}: ` : ""}
            {room.lastMessage.content}
          </p>
        )}
      </div>

      <div className="ml-auto flex flex-col items-end space-y-1 flex-shrink-0">
        {room.lastMessage?.timestamp && (
          <p className="text-[10px] text-muted-foreground whitespace-nowrap">
            {formatLastMessageTime(room.lastMessage.timestamp)}
          </p>
        )}
        {room.unreadCount && room.unreadCount > 0 ? (
          <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
            {room.unreadCount > 9 ? "9+" : room.unreadCount}
          </Badge>
        ) : (
          <div className="h-5 w-5"></div> // Placeholder for alignment
        )}
      </div>
    </button>
  )
}
