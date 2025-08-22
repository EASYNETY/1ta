// features/chat/components/ChatRoomHeader.tsx

import type React from "react";
import { type ChatRoom, ChatRoomType } from "../types/chat-types";
import { Users, Calendar, BookOpen, Bell, ArrowLeft } from "lucide-react"; // Added ArrowLeft
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button"; // For back button
import { useAppDispatch } from "@/store/hooks"; // For back button action
import { selectChatRoom } from "../store/chatSlice"; // For back button action
import { cn } from "@/lib/utils";

interface ChatRoomHeaderProps {
    room: ChatRoom;
    isMobileView?: boolean; // Received from ChatLayout
}

export const ChatRoomHeader: React.FC<ChatRoomHeaderProps> = ({ room, isMobileView }) => {
    const dispatch = useAppDispatch();

    const getRoomIcon = () => {
        const iconClass = "h-4 w-4"; // Common class
        switch (room.type) {
            case ChatRoomType.COURSE:
                return <BookOpen className={cn(iconClass, "text-blue-500")} />;
            case ChatRoomType.CLASS:
                return <Users className={cn(iconClass, "text-green-500")} />;
            case ChatRoomType.EVENT:
                return <Calendar className={cn(iconClass, "text-amber-500")} />;
            case ChatRoomType.ANNOUNCEMENT:
                return <Bell className={cn(iconClass, "text-red-500")} />;
            default:
                return <Users className={iconClass} />;
        }
    };

    const getRoomTypeBadgeText = () => {
        // Renamed for clarity
        switch (room.type) {
            case ChatRoomType.COURSE:
                return "Course";
            case ChatRoomType.CLASS:
                return "Class";
            case ChatRoomType.EVENT:
                return "Event";
            case ChatRoomType.ANNOUNCEMENT:
                return "Announcement";
            default:
                return "Group";
        }
    };

    const facilitatorNames = room.participants
        .filter((p) => p.role === "teacher")
        .map((t) => t.name)
        .join(", ");

    const handleBack = () => {
        dispatch(selectChatRoom(null)); // Deselect the room
    };

    return (
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b bg-muted/20 shadow-sm">
            <div className="flex items-center gap-2 min-w-0 flex-1"> {/* min-w-0 and flex-1 for shrink/grow */}
                {isMobileView && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 mr-1" onClick={handleBack}>
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Back to room list</span>
                    </Button>
                )}
                <div className="flex-shrink-0">{getRoomIcon()}</div>
                <div className="flex flex-col min-w-0"> {/* min-w-0 for truncation */}
                    <h2 className="text-base font-semibold truncate" title={room.name}>
                        {room.name}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="px-1.5 py-0 text-[10px] h-4 leading-none">
                            {getRoomTypeBadgeText()}
                        </Badge>
                        <span className="truncate"> {/* Truncate participant count if needed */}
                            {room.participants.length} participant{room.participants.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            </div>

            {/* Facilitator Info - only show if there are facilitators and not an announcement room */}
            {facilitatorNames && room.type !== ChatRoomType.ANNOUNCEMENT && (
                <div className="ml-2 flex-shrink-0"> {/* Added ml-2 for spacing */}
                    <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge variant="secondary" className="cursor-default text-xs px-2 py-0.5 h-5">
                                    {room.participants.filter((p) => p.role === "teacher").length} facilitator{room.participants.filter((p) => p.role === "teacher").length !== 1 ? 's' : ''}
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs max-w-[200px]">{facilitatorNames || "No facilitators listed"}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )}
        </div>
    );
};