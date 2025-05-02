// features/chat/components/ChatMessage.tsx
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, parseISO } from 'date-fns'; // Or timeago.js
import { cn } from '@/lib/utils';
import type { ChatMessage as MessageType } from '../types/chat-types'; // Use correct type
import { useAppSelector } from '@/store/hooks';

interface ChatMessageProps {
    message: MessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const currentUser = useAppSelector(state => state.auth.user);
    const isOwnMessage = message.senderId === currentUser?.id;

    // Safely format timestamp
    const formatTimestamp = (ts: string) => {
        try {
            return format(parseISO(ts), 'p'); // Format like '4:30 PM'
        } catch {
            return 'Invalid time';
        }
    };

    return (
        <div className={cn("flex items-end gap-2", isOwnMessage ? "justify-end" : "justify-start")}>
            {/* Avatar for other users */}
            {!isOwnMessage && (
                <Avatar className="h-6 w-6">
                    <AvatarImage src={message.sender?.avatarUrl} alt={message.sender?.name} />
                    <AvatarFallback>{message.sender?.name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
            )}
            {/* Message Bubble */}
            <div
                className={cn(
                    "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                    isOwnMessage
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                )}
            >
                {/* Sender Name (for group chats, shown for others) */}
                {!isOwnMessage && message.sender?.name && (
                    <p className="text-xs font-semibold mb-0.5 text-muted-foreground">{message.sender.name}</p>
                )}
                {/* Message Content */}
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                {/* Timestamp */}
                <p className={cn("mt-1 text-xs", isOwnMessage ? "text-primary-foreground/70 text-right" : "text-muted-foreground/70 text-left")}>
                    {formatTimestamp(message.timestamp)}
                </p>
            </div>
            {/* Avatar for own messages (optional, less common) */}
            {/* {isOwnMessage && <Avatar>...</Avatar>} */}
        </div>
    );
};