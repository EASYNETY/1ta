// features/chat/components/ChatMessageList.tsx

"use client";

import React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
    selectCurrentRoomMessages,
    selectMessageStatusForRoom,
    selectSelectedRoomId,
} from "../store/chatSlice";
import { ChatMessage } from "./ChatMessage";
import { fetchChatMessages, markRoomAsRead } from "../store/chat-thunks";

export const ChatMessageList: React.FC = () => {
    const dispatch = useAppDispatch();
    const selectedRoomId = useAppSelector(selectSelectedRoomId);
    const messages = useAppSelector(selectCurrentRoomMessages);
    // Get the message loading status for the *currently selected room*
    const messageLoadingStatus = useAppSelector((state) =>
        selectedRoomId ? selectMessageStatusForRoom(state, selectedRoomId) : "idle"
    );
    const currentUser = useAppSelector((state) => state.auth.user);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(1);
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);


    // --- Effect 1: Fetch messages when room changes and they haven't been loaded ---
    useEffect(() => {
        if (selectedRoomId && messageLoadingStatus === "idle") {
            console.log(`ChatMessageList: Fetching messages for room ${selectedRoomId}, page 1`);
            dispatch(fetchChatMessages({ roomId: selectedRoomId, page: 1, limit: 30 })); // Initial fetch with page 1
            setPage(1); // Reset page for the new room
            setHasScrolledToBottom(false); // Reset scroll status for new room
        }
    }, [selectedRoomId, messageLoadingStatus, dispatch]);


    // --- Debounce utility ---
    const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        const callable = (...args: Parameters<F>) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => func(...args), waitFor);
        };
        return callable as any; // Adjust type if needed, or use a more robust debounce lib
    };

    // --- Debounced mark as read function ---
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedMarkRead = useCallback(
        debounce((roomId: string, userId: string) => {
            if (roomId && userId) { // Ensure params are valid before dispatching
                console.log(`ChatMessageList: Debounced dispatching markRoomAsRead for room ${roomId}, user ${userId}`);
                dispatch(markRoomAsRead({ roomId, userId }));
            }
        }, 1500), // Debounce for 1.5 seconds
        [dispatch] // dispatch is stable, so this is fine
    );

    // --- Effect 2: Mark room as read when room selection changes ---
    useEffect(() => {
        if (selectedRoomId && currentUser?.id) {
            // Call debouncedMarkRead whenever a room is selected by the current user.
            // The slice optimistically updates unreadCount for UI, this syncs with backend.
            debouncedMarkRead(selectedRoomId, currentUser.id);
        }
    }, [selectedRoomId, currentUser?.id, debouncedMarkRead]);


    // --- Effect 3: Scroll to bottom on new messages or successful load ---
    useEffect(() => {
        if (messages.length > 0 && messageLoadingStatus === "succeeded" && !hasScrolledToBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            setHasScrolledToBottom(true);
        }
        // If messages become empty (e.g., room change before fetch completes), reset scroll lock
        if (messages.length === 0) {
            setHasScrolledToBottom(false);
        }
    }, [messages, messageLoadingStatus, hasScrolledToBottom]);

    // --- Effect 4: Force scroll to bottom when new messages are sent ---
    useEffect(() => {
        // Check if the last message is from the current user (indicating a sent message)
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.senderId === currentUser?.id) {
            // Force scroll to bottom for user's own messages
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100); // Small delay to ensure DOM is updated
        }
    }, [messages, currentUser?.id]);


    // --- Load more messages ---
    const handleLoadMore = () => {
        if (selectedRoomId && messageLoadingStatus !== "loading") {
            const nextPage = page + 1;
            console.log(`ChatMessageList: Loading more messages for room ${selectedRoomId}, page ${nextPage}`);
            dispatch(
                fetchChatMessages({
                    roomId: selectedRoomId,
                    page: nextPage,
                    limit: 20, // Or your preferred limit
                }),
            );
            setPage(nextPage);
            // Don't setHasScrolledToBottom(false) here, user is scrolling up
        }
    };

    // --- Group messages by sender for better UI ---
    const groupedMessages = useMemo(() => { // Memoize groupedMessages
        return messages.reduce(
            (groups, message, index) => {
                const prevMessage = messages[index - 1];
                const shouldStartNewGroup =
                    !prevMessage ||
                    prevMessage.senderId !== message.senderId ||
                    new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() > 5 * 60 * 1000;

                if (shouldStartNewGroup) {
                    groups.push([message]);
                } else {
                    groups[groups.length - 1].push(message);
                }
                return groups;
            },
            [] as (typeof messages)[],
        );
    }, [messages]);


    return (
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4" id="chat-message-list-scrollarea">
            <div className="space-y-6">
                {/* Load More Button - Consider if hasMore prop from API is available */}
                {messages.length >= 20 && messageLoadingStatus !== 'loading' && ( // Basic condition, better with hasMore
                    <div className="flex justify-center pt-2">
                        <Button variant="outline" size="sm" onClick={handleLoadMore} disabled={messageLoadingStatus === "idle"}>
                            {messageLoadingStatus === "idle" && page > 1 ? "Loading more..." : "Load earlier messages"}
                        </Button>
                    </div>
                )}

                {/* Loading State (initial load) */}
                {messageLoadingStatus === "loading" && messages.length === 0 && (
                    <div className="space-y-4 pt-4">
                        {[...Array(3)].map((_, i) => (
                            <React.Fragment key={i}>
                                <Skeleton className="h-12 w-3/4 rounded-lg" />
                                <Skeleton className="h-12 w-1/2 rounded-lg ml-auto" />
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {messageLoadingStatus === "failed" && (
                    <div className="text-center text-destructive text-sm flex flex-col items-center gap-2 py-10">
                        <AlertCircle className="h-6 w-6" />
                        <p>Failed to load messages.</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => selectedRoomId && dispatch(fetchChatMessages({ roomId: selectedRoomId, page: 1, limit: 30 }))}
                        >
                            Try Again
                        </Button>
                    </div>
                )}

                {/* Empty State */}
                {messageLoadingStatus === "succeeded" && messages.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-10">
                        No messages yet. Start the conversation!
                    </div>
                )}

                {/* Render Message Groups */}
                {groupedMessages.map((group, groupIndex) => (
                    <div key={`group-${groupIndex}-${group[0]?.id}`} className="space-y-1"> {/* More stable key */}
                        {group.map((message, messageIndex) => (
                            <ChatMessage
                                key={message.id}
                                message={message}
                                showSenderInfo={messageIndex === 0}
                            />
                        ))}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
        </ScrollArea>
    );
};