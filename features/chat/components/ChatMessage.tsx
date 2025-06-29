// features/chat/components/ChatMessage.tsx

"use client";

import type React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, parseISO, isToday, isYesterday, isValid } from "date-fns";
import { cn, generateColorFromString, getContrastColor, getInitials } from "@/lib/utils";
import { type ChatMessage as MessageType, MessageType as MsgType } from "../types/chat-types";
import { useAppSelector } from "@/store/hooks";
import { FileIcon } from "lucide-react";

// --- Component ---

interface ChatMessageProps {
    message: MessageType;
    showSenderInfo: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, showSenderInfo }) => {
    const currentUser = useAppSelector((state) => state.auth.user);
    const isOwnMessage = message.senderId === currentUser?.id;

    const formatTimestamp = (ts: string | null | undefined): string => {
        // FIX #1: Handle null, undefined, or empty string inputs at the start.
        // This is the most common case for new rooms with no messages.
        // Returning an empty string is often cleaner in the UI than "Invalid time".
        if (!ts) {
            return "";
        }

        try {
            const date = parseISO(ts);

            // FIX #2: Check if the parsed date is valid. 
            // This handles cases where `ts` is a string but not a valid date format.
            if (!isValid(date)) {
                // Log a warning for developers to find bad data, but don't show an ugly error to users.
                console.warn(`Invalid timestamp provided to formatTimestamp: "${ts}"`);
                return "";
            }

            // --- Original logic is kept, as it's correct ---
            if (isToday(date)) {
                return format(date, "p"); // e.g., "4:30 PM"
            } else if (isYesterday(date)) {
                return `Yesterday, ${format(date, "p")}`; // e.g., "Yesterday, 2:15 PM"
            } else {
                return format(date, "MMM d, p"); // e.g., "Jun 28, 10:00 AM"
            }
        } catch (error) {
            // This catch block is now a final safety net for any other unexpected errors.
            console.error("Error formatting timestamp:", error);
            return "";
        }
    };

    const renderMessageContent = () => {
        switch (message.type) {
            case MsgType.IMAGE:
                return (
                    <div className="mt-1 max-w-[240px] sm:max-w-[300px]">
                        <img
                            src={message.metadata?.imageUrl || "/placeholder.svg"}
                            alt="Image content" // More descriptive alt
                            className="rounded-md max-h-[240px] sm:max-h-[300px] object-contain"
                        />
                    </div>
                );
            case MsgType.FILE:
                return (
                    // Consider making this a link if fileUrl is present
                    <a
                        href={message.metadata?.fileUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            "mt-1 flex items-center gap-2 p-2 rounded-md hover:bg-opacity-70 transition-colors",
                            isOwnMessage ? "bg-primary/20 hover:bg-primary/30" : "bg-muted-foreground/10 hover:bg-muted-foreground/20"
                        )}
                    >
                        <FileIcon className="h-5 w-5 flex-shrink-0 text-blue-500" />
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate">
                                {message.metadata?.fileName || "File"}
                            </span>
                            {message.metadata?.fileSize && (
                                <span className="text-xs text-muted-foreground">
                                    {(message.metadata.fileSize / 1024).toFixed(1)} KB
                                </span>
                            )}
                        </div>
                    </a>
                );
            case MsgType.SYSTEM:
                return <div className="text-xs italic text-muted-foreground px-2">{message.content}</div>;
            default: // TEXT
                return <p className="whitespace-pre-wrap break-words">{message.content}</p>;
        }
    };

    const fallbackBgColor = message.sender?.id ? generateColorFromString(message.sender.id) : '#e5e7eb'; // default gray
    const contrast = getContrastColor(fallbackBgColor);
    // Tailwind classes for text color, or you can use inline style for `color`
    const fallbackTextColorClass = contrast === 'light' ? 'text-gray-700' : 'text-white';
    const initials = getInitials(message.sender?.name);


    if (message.type === MsgType.SYSTEM) {
        return (
            <div className="flex justify-center my-2">
                <div
                    className={cn(
                        "rounded-full px-3 py-1 text-xs text-center",
                        "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                    )}
                >
                    {message.content}
                </div>
            </div>
        )
    }


    return (
        <div
            className={cn(
                "flex gap-2 items-start", // items-start to align avatar with top of message block
                isOwnMessage ? "justify-end" : "justify-start",
                !showSenderInfo && !isOwnMessage && "pl-10", // Indent subsequent messages (8 for avatar + 2 for gap)
            )}
        >
            {/* Avatar for other users' messages */}
            {!isOwnMessage && (
                <div className="flex-shrink-0 h-8 w-8 mt-0.5"> {/* Container for avatar visibility control */}
                    {showSenderInfo ? (
                        <Avatar className="h-full w-full">
                            <AvatarImage
                                src={message.sender?.avatarUrl || undefined}
                                alt={message.sender?.name || "User Avatar"}
                            />
                            <AvatarFallback
                                style={{ backgroundColor: fallbackBgColor }}
                                className={cn("text-xs font-medium", fallbackTextColorClass)}
                            >
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    ) : (
                        <div className="h-8 w-8" /> // Placeholder to maintain alignment
                    )}
                </div>
            )}

            <div className={cn(
                "flex flex-col",
                isOwnMessage ? "items-end" : "items-start",
                "max-w-[70%] sm:max-w-[65%]" // Control message width
            )}>
                {/* Sender Name (for group chats, shown for others if it's the first message in their group) */}
                {!isOwnMessage && showSenderInfo && message.sender?.name && (
                    <span className="text-xs font-medium mb-0.5 text-muted-foreground">
                        {message.sender.name}
                    </span>
                )}

                {/* Message Bubble */}
                <div
                    className={cn(
                        "rounded-lg px-3 py-2 text-sm shadow-sm",
                        isOwnMessage
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted text-foreground rounded-bl-none",
                        // message.type === MsgType.SYSTEM && "bg-transparent px-0 shadow-none", // System messages handled separately now
                    )}
                >
                    {renderMessageContent()}
                </div>

                {/* Timestamp (shown below the bubble) */}
                <span
                    className={cn(
                        "text-[10px] mt-1 text-muted-foreground/80",
                        isOwnMessage ? "pr-1" : "pl-1" // Minor padding for timestamp
                    )}
                >
                    {formatTimestamp(message.timestamp)}
                </span>
            </div>
        </div>
    );
};