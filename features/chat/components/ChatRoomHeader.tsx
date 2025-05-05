// features/chat/components/ChatRoomHeader.tsx

import type React from "react"
import { type ChatRoom, ChatRoomType } from "../types/chat-types"
import { Users, Calendar, BookOpen, Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ChatRoomHeaderProps {
    room: ChatRoom
}

export const ChatRoomHeader: React.FC<ChatRoomHeaderProps> = ({ room }) => {
    // Get the appropriate icon based on room type
    const getRoomIcon = () => {
        switch (room.type) {
            case ChatRoomType.COURSE:
                return <BookOpen className="h-4 w-4 text-blue-500" />
            case ChatRoomType.CLASS:
                return <Users className="h-4 w-4 text-green-500" />
            case ChatRoomType.EVENT:
                return <Calendar className="h-4 w-4 text-amber-500" />
            case ChatRoomType.ANNOUNCEMENT:
                return <Bell className="h-4 w-4 text-red-500" />
            default:
                return <Users className="h-4 w-4" />
        }
    }

    // Get badge text based on room type
    const getRoomTypeBadge = () => {
        switch (room.type) {
            case ChatRoomType.COURSE:
                return "Course"
            case ChatRoomType.CLASS:
                return "Class"
            case ChatRoomType.EVENT:
                return "Event"
            case ChatRoomType.ANNOUNCEMENT:
                return "Announcement"
            default:
                return "Group"
        }
    }

    return (
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
                <div className="flex items-center">{getRoomIcon()}</div>
                <div>
                    <h2 className="text-base font-medium">{room.name}</h2>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs px-2 py-0 h-5">
                            {getRoomTypeBadge()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{room.participants.length} participants</span>
                    </div>
                </div>
            </div>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge variant="secondary" className="cursor-help">
                            {room.participants.filter((p) => p.role === "teacher").length} teachers
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-xs">
                            {room.participants
                                .filter((p) => p.role === "teacher")
                                .map((t) => t.name)
                                .join(", ")}
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}
