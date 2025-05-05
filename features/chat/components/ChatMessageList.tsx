// features/chat/components/ChatMessageList.tsx

"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
    fetchChatMessages,
    selectCurrentRoomMessages,
    selectMessageStatusForRoom,
    selectSelectedRoomId,
} from "../store/chatSlice"
import { ChatMessage } from "./ChatMessage"

export const ChatMessageList: React.FC = () => {
    const dispatch = useAppDispatch()
    const selectedRoomId = useAppSelector(selectSelectedRoomId)
    const messages = useAppSelector(selectCurrentRoomMessages)
    const status = useAppSelector((state) => selectMessageStatusForRoom(state, selectedRoomId || ""))
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [page, setPage] = useState(1)
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)

    // Fetch messages when room changes
    useEffect(() => {
        if (selectedRoomId && status === "idle") {
            dispatch(fetchChatMessages({ roomId: selectedRoomId }))
            setPage(1)
            setHasScrolledToBottom(false)
        }
    }, [selectedRoomId, status, dispatch])

    // Scroll to bottom on initial load or when new messages arrive
    useEffect(() => {
        if (messages.length > 0 && status === "succeeded" && !hasScrolledToBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
            setHasScrolledToBottom(true)
        }
    }, [messages, status, hasScrolledToBottom])

    // Load more messages
    const handleLoadMore = () => {
        if (selectedRoomId && status !== "loading") {
            const nextPage = page + 1
            dispatch(
                fetchChatMessages({
                    roomId: selectedRoomId,
                    page: nextPage,
                    limit: 20,
                }),
            )
            setPage(nextPage)
        }
    }

    // Group messages by sender for better UI
    const groupedMessages = messages.reduce(
        (groups, message, index) => {
            const prevMessage = messages[index - 1]

            // Start a new group if:
            // 1. This is the first message
            // 2. The sender changed
            // 3. More than 5 minutes passed since the last message
            const shouldStartNewGroup =
                !prevMessage ||
                prevMessage.senderId !== message.senderId ||
                new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() > 5 * 60 * 1000

            if (shouldStartNewGroup) {
                groups.push([message])
            } else {
                groups[groups.length - 1].push(message)
            }

            return groups
        },
        [] as (typeof messages)[],
    )

    return (
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-6">
                {/* Load More Button */}
                {messages.length > 0 && (
                    <div className="flex justify-center mb-4">
                        <Button variant="ghost" size="sm" onClick={handleLoadMore} disabled={status === "loading"}>
                            {status === "loading" ? "Loading..." : "Load earlier messages"}
                        </Button>
                    </div>
                )}

                {/* Loading State */}
                {status === "loading" && messages.length === 0 && (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-3/4 rounded-lg" />
                        <Skeleton className="h-12 w-1/2 rounded-lg ml-auto" />
                        <Skeleton className="h-12 w-2/3 rounded-lg" />
                    </div>
                )}

                {/* Error State */}
                {status === "failed" && (
                    <div className="text-center text-destructive text-sm flex flex-col items-center gap-2 py-10">
                        <AlertCircle className="h-6 w-6" />
                        <p>Failed to load messages.</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => selectedRoomId && dispatch(fetchChatMessages({ roomId: selectedRoomId }))}
                        >
                            Try Again
                        </Button>
                    </div>
                )}

                {/* Empty State */}
                {status === "succeeded" && messages.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-10">
                        No messages yet. Start the conversation!
                    </div>
                )}

                {/* Render Message Groups */}
                {groupedMessages.map((group, groupIndex) => (
                    <div key={`group-${groupIndex}`} className="space-y-1">
                        {group.map((message, messageIndex) => (
                            <ChatMessage
                                key={message.id}
                                message={message}
                                showSenderInfo={messageIndex === 0} // Only show sender info for first message in group
                            />
                        ))}
                    </div>
                ))}

                {/* Empty div at the end to scroll to */}
                <div ref={messagesEndRef} />
            </div>
        </ScrollArea>
    )
}
