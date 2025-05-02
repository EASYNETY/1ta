// features/chat/components/ChatRoomItem.tsx
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';
import { parseISO } from 'date-fns';
import type { ChatRoom } from '../types/chat-types';

interface ChatRoomItemProps {
    room: ChatRoom;
    isSelected: boolean;
    onClick: () => void;
}

export const ChatRoomItem: React.FC<ChatRoomItemProps> = ({ room, isSelected, onClick }) => {

    const formatLastMessageTime = (timestamp?: string): string => {
        if (!timestamp) return '';
        try {
            const date = parseISO(timestamp);
            return formatDistanceToNowStrict(date, { addSuffix: true });
        } catch {
            return '';
        }
    };

    // Determine avatar (e.g., use first participant if group, or other logic)
    const displayParticipant = room.isGroupChat ? null : room.participants?.[0]; // Example logic

    return (
        <button
            onClick={onClick}
            className={cn(
                "flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors",
                isSelected
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/80 hover:bg-muted/50 hover:text-foreground"
            )}
            aria-current={isSelected ? "page" : undefined}
        >
            {/* Avatar Placeholder - replace with logic for group/DM icons */}
            <Avatar className="h-9 w-9 border">
                {/* Add logic here for group avatar or 1-on-1 participant avatar */}
                {/* <AvatarImage src={displayParticipant?.avatarUrl} alt={room.name} /> */}
                <AvatarFallback className={cn(isSelected ? "bg-primary/20" : "bg-muted")}>
                    {room.name?.charAt(0).toUpperCase() || '?'}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 overflow-hidden">
                <p className={cn("truncate font-medium text-sm", isSelected ? "text-primary" : "text-foreground")}>
                    {room.name}
                </p>
                {room.lastMessage && (
                    <p className={cn("truncate text-xs", isSelected ? "text-primary/80" : "text-muted-foreground")}>
                        {room.lastMessage.senderName && room.isGroupChat ? `${room.lastMessage.senderName}: ` : ''}
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
                        {room.unreadCount > 9 ? '9+' : room.unreadCount}
                    </Badge>
                ) : (
                    <div className="h-5 w-5"></div> // Placeholder for alignment
                )}

            </div>
        </button>
    );
};