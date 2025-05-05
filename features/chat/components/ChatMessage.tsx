// features/chat/components/ChatMessage.tsx

import type React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, parseISO, isToday, isYesterday } from "date-fns"
import { cn } from "@/lib/utils"
import { type ChatMessage as MessageType, MessageType as MsgType } from "../types/chat-types"
import { useAppSelector } from "@/store/hooks"
import { FileIcon } from "lucide-react"

interface ChatMessageProps {
    message: MessageType
    showSenderInfo: boolean // Whether to show sender info (for first message in a group)
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, showSenderInfo }) => {
    const currentUser = useAppSelector((state) => state.auth.user)
    const isOwnMessage = message.senderId === currentUser?.id

    // Format timestamp with smart display
    const formatTimestamp = (ts: string) => {
        try {
            const date = parseISO(ts)

            if (isToday(date)) {
                return format(date, "p") // e.g., "4:30 PM"
            } else if (isYesterday(date)) {
                return `Yesterday, ${format(date, "p")}`
            } else {
                return format(date, "MMM d, p") // e.g., "Jan 5, 4:30 PM"
            }
        } catch {
            return "Invalid time"
        }
    }

    // Render different content based on message type
    const renderMessageContent = () => {
        switch (message.type) {
            case MsgType.IMAGE:
                return (
                    <div className="mt-1 max-w-[240px]">
                        <img
                            src={message.metadata?.imageUrl || "/placeholder.svg"}
                            alt="Image"
                            className="rounded-md max-h-[240px] object-contain"
                        />
                    </div>
                )
            case MsgType.FILE:
                return (
                    <div className="mt-1 flex items-center gap-2 p-2 rounded-md bg-background/50">
                        <FileIcon className="h-4 w-4 text-blue-500" />
                        <span className="text-sm truncate">{message.metadata?.fileName || "File"}</span>
                        {message.metadata?.fileSize && (
                            <span className="text-xs text-muted-foreground">{(message.metadata.fileSize / 1024).toFixed(0)} KB</span>
                        )}
                    </div>
                )
            case MsgType.SYSTEM:
                return <div className="italic text-muted-foreground">{message.content}</div>
            default:
                return <p className="whitespace-pre-wrap break-words">{message.content}</p>
        }
    }

    return (
        <div
            className={cn(
                "flex gap-2",
                isOwnMessage ? "justify-end" : "justify-start",
                !showSenderInfo && !isOwnMessage && "pl-8", // Indent subsequent messages
            )}
        >
            {/* Avatar for other users */}
            {!isOwnMessage && showSenderInfo && (
                <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                    <AvatarImage src={message.sender?.avatarUrl || "/placeholder.svg"} alt={message.sender?.name || ""} />
                    <AvatarFallback>{message.sender?.name?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
            )}

            <div className="flex flex-col max-w-[75%]">
                {/* Sender Name (for group chats, shown for others) */}
                {!isOwnMessage && showSenderInfo && message.sender?.name && (
                    <span className="text-xs font-medium ml-1 mb-1 text-muted-foreground">{message.sender.name}</span>
                )}

                {/* Message Bubble */}
                <div
                    className={cn(
                        "rounded-lg px-3 py-2 text-sm",
                        isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted",
                        message.type === MsgType.SYSTEM && "bg-transparent px-0",
                    )}
                >
                    {renderMessageContent()}
                </div>

                {/* Timestamp */}
                <span
                    className={cn(
                        "text-[10px] mt-1",
                        isOwnMessage ? "text-right text-muted-foreground/70" : "text-left text-muted-foreground/70",
                    )}
                >
                    {formatTimestamp(message.timestamp)}
                </span>
            </div>
        </div>
    )
}
