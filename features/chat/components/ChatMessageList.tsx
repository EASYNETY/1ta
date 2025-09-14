"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowDown, MessageSquare } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
    selectCurrentRoomMessages,
    selectMessageStatusForRoom,
    selectSelectedRoomId,
    selectTypingUsersForRoom,
} from "../store/chatSlice";
import { ChatMessage } from "./ChatMessage";
import { fetchChatMessages, deleteChatMessage } from "../store/chat-thunks";
import { useSocket } from "../services/socketService";

// --- Best Practice Note ---
// Your real-time logic should live in `socketService.ts`.
// That service should listen for 'new_message' events from the server
// and dispatch an action to add the message to the Redux store.
// This component should NOT listen for socket events directly. It just
// needs to react to the `messages` array changing in the store.

interface ChatMessageListProps {
    onReply?: (message: any) => void;
    onForward?: (message: any) => void;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
    onReply,
    onForward
}) => {
    const dispatch = useAppDispatch();
    const selectedRoomId = useAppSelector(selectSelectedRoomId);
    const messages = useAppSelector(selectCurrentRoomMessages);
    const messageLoadingStatus = useAppSelector((state) =>
        selectedRoomId ? selectMessageStatusForRoom(state, selectedRoomId) : "idle"
    );
    const typingUsers = useAppSelector((state) =>
        selectedRoomId ? selectTypingUsersForRoom(state, selectedRoomId) : []
    );

    const viewportRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // --- State for Smart Scrolling ---
    const [userScrolledUp, setUserScrolledUp] = useState(false);
    const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);

    const { joinRoom, leaveRoom } = useSocket();

    // Effect for joining/leaving rooms and initial message fetch
    useEffect(() => {
        if (selectedRoomId) {
            joinRoom(selectedRoomId);
            setUserScrolledUp(false); // Reset scroll state on room change
            setShowNewMessageIndicator(false);

            // Fetch initial messages only if the room is new or empty
            if (messageLoadingStatus === "idle" || messages.length === 0) {
                setPage(1);
                setHasMore(true);
                dispatch(fetchChatMessages({ roomId: selectedRoomId, page: 1, limit: 50 }));
            }
        }
        return () => {
            if (selectedRoomId) {
                leaveRoom(selectedRoomId);
            }
        };
    }, [selectedRoomId, dispatch]);


    // --- Smart Scrolling Effect ---
    // This effect handles scrolling when new messages arrive.
    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        // If user has not scrolled up, auto-scroll to the bottom.
        if (!userScrolledUp) {
            viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
            setShowNewMessageIndicator(false);
        } else {
            // If user has scrolled up, show the indicator.
            // Check to avoid showing indicator for the very first message load.
            if (messages.length > 1) {
                setShowNewMessageIndicator(true);
            }
        }
    }, [messages, userScrolledUp]);


    // --- Scroll Event Handler ---
    // This function detects if the user has manually scrolled up.
    const handleScroll = useCallback(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const isAtBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 50; // 50px buffer

        if (isAtBottom) {
            setUserScrolledUp(false);
            setShowNewMessageIndicator(false);
        } else {
            setUserScrolledUp(true);
        }
    }, []);

    const scrollToBottom = () => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
        setUserScrolledUp(false);
        setShowNewMessageIndicator(false);
    };

    // --- Data Loading and Deletion ---
    const handleLoadMore = useCallback(async () => {
        if (!selectedRoomId || messageLoadingStatus === "loading" || !hasMore) return;
        const nextPage = page + 1;
        const result = await dispatch(fetchChatMessages({ roomId: selectedRoomId, page: nextPage, limit: 20 }));
        
        const fetchedMessages = (result.payload as any)?.data ?? [];
        if (result.meta.requestStatus === 'fulfilled' && fetchedMessages.length === 0) {
            setHasMore(false);
        }
        setPage(nextPage);
    }, [selectedRoomId, messageLoadingStatus, hasMore, page, dispatch]);

    const handleDeleteMessage = useCallback(async (messageId: string) => {
        if (!selectedRoomId) return;
        dispatch(deleteChatMessage({ roomId: selectedRoomId, messageId }));
    }, [selectedRoomId, dispatch]);


    // Memoized message grouping for performance
    const groupedMessages = useMemo(() => {
        if (!messages || messages.length === 0) return [];
        return messages.reduce((groups: any[][], message: any, index: number) => {
            const prevMessage = messages[index - 1];
            const shouldStartNewGroup = !prevMessage || prevMessage.senderId !== message.senderId;
            if (shouldStartNewGroup) {
                groups.push([message]);
            } else {
                groups[groups.length - 1].push(message);
            }
            return groups;
        }, []);
    }, [messages]);

    const TypingIndicator = () => {
        if (!typingUsers || typingUsers.length === 0) return null;
        return (
            <div className="px-4 pb-2 text-sm text-muted-foreground animate-pulse">
                {typingUsers.map(u => u.userName).join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
            </div>
        );
    };
    
    // Fallback UI when no room is selected
    if (!selectedRoomId) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageSquare size={48} className="mb-4" />
                <h2 className="text-xl font-medium">Select a Chat</h2>
                <p>Choose a conversation from the sidebar to start messaging.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col relative overflow-hidden bg-muted/20">
            <ScrollArea 
                className="flex-1 px-4" 
                viewportRef={viewportRef} 
                onScroll={handleScroll}
            >
                <div className="py-4">
                    {hasMore && (
                        <div className="text-center mb-4">
                            <Button variant="ghost" size="sm" onClick={handleLoadMore} disabled={messageLoadingStatus === "loading"}>
                                {messageLoadingStatus === "loading" ? "Loading..." : "Load More Messages"}
                            </Button>
                        </div>
                    )}

                    {messageLoadingStatus === 'loading' && messages.length === 0 ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex items-start space-x-4 p-2">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            </div>
                        ))
                    ) : (
                        groupedMessages.map((group, groupIndex) => (
                            <div key={groupIndex} className="mb-1">
                                {group.map((message) => (
                                    <ChatMessage
                                        key={message.id}
                                        message={message}
                                        onReply={onReply}
                                        onForward={onForward}
                                        onDelete={handleDeleteMessage}
                                    />
                                ))}
                            </div>
                        ))
                    )}
                </div>
                <ScrollBar />
            </ScrollArea>
            <TypingIndicator />

            {/* --- New Message Indicator Button --- */}
            {showNewMessageIndicator && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
                    <Button
                        size="sm"
                        className="rounded-full shadow-lg animate-bounce"
                        onClick={scrollToBottom}
                    >
                        <ArrowDown className="h-4 w-4 mr-2" />
                        New Message
                    </Button>
                </div>
            )}
        </div>
    );
};