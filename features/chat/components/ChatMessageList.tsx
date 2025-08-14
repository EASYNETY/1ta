// features/chat/components/ChatMessageList.tsx - Enhanced with real-time features

"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Wifi, WifiOff, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    selectCurrentRoomMessages,
    selectMessageStatusForRoom,
    selectSelectedRoomId,
    selectSelectedRoom,
    selectTypingUsersForRoom,
    selectConnectionStatus,
    markRoomAsRead,
} from "../store/chatSlice";
import { ChatMessage } from "./ChatMessage";
import { fetchChatMessages, deleteChatMessage } from "../store/chat-thunks";
import { useSocket } from "../services/socketService";
import { cn, getInitials, generateColorFromString, getContrastColor } from "@/lib/utils";
import { MessageType } from "../types/chat-types";

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
    const selectedRoom = useAppSelector(selectSelectedRoom);
    const messages = useAppSelector(selectCurrentRoomMessages);
    const messageLoadingStatus = useAppSelector((state) =>
        selectedRoomId ? selectMessageStatusForRoom(state, selectedRoomId) : "idle"
    );
    const typingUsers = useAppSelector((state) =>
        selectedRoomId ? selectTypingUsersForRoom(state, selectedRoomId) : []
    );
    const connectionStatus = useAppSelector(selectConnectionStatus);
    const currentUser = useAppSelector((state) => state.auth.user);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(1);
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [isNearBottom, setIsNearBottom] = useState(true);

    const { joinRoom, leaveRoom, markRoomAsRead: socketMarkAsRead } = useSocket();

    // Join/leave room when selectedRoomId changes
    useEffect(() => {
        if (selectedRoomId) {
            console.log(`Joining room: ${selectedRoomId}`);
            joinRoom(selectedRoomId);
            
            // Mark room as read when entering
            if (currentUser?.id) {
                dispatch(markRoomAsRead(selectedRoomId));
                socketMarkAsRead(selectedRoomId);
            }
        }

        return () => {
            if (selectedRoomId) {
                console.log(`Leaving room: ${selectedRoomId}`);
                leaveRoom(selectedRoomId);
            }
        };
    }, [selectedRoomId, joinRoom, leaveRoom, dispatch, currentUser?.id, socketMarkAsRead]);

    // Fetch messages when room changes
    useEffect(() => {
        if (selectedRoomId && messageLoadingStatus === "idle") {
            console.log(`Fetching messages for room ${selectedRoomId}`);
            dispatch(fetchChatMessages({ 
                roomId: selectedRoomId, 
                page: 1, 
                limit: 30 
            }));
            setPage(1);
            setHasScrolledToBottom(false);
            setShouldAutoScroll(true);
            setHasMore(true);
        }
    }, [selectedRoomId, messageLoadingStatus, dispatch]);

    // Auto-scroll logic
    const checkScrollPosition = useCallback(() => {
        if (scrollAreaRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
            const nearBottom = distanceFromBottom < 100;
            
            setIsNearBottom(nearBottom);
            setShouldAutoScroll(nearBottom);
        }
    }, []);

    // Scroll to bottom for new messages
    useEffect(() => {
        if (messages.length > 0 && shouldAutoScroll) {
            const lastMessage = messages[messages.length - 1];
            const isOwnMessage = lastMessage?.senderId === currentUser?.id;
            const isInitialLoad = messageLoadingStatus === "succeeded" && !hasScrolledToBottom;
            
            if (isOwnMessage || isInitialLoad || isNearBottom) {
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ 
                        behavior: isInitialLoad ? "auto" : "smooth" 
                    });
                }, 100);
                setHasScrolledToBottom(true);
            }
        }
    }, [messages, shouldAutoScroll, currentUser?.id, messageLoadingStatus, hasScrolledToBottom, isNearBottom]);

    // Load more messages
    const handleLoadMore = useCallback(async () => {
        if (!selectedRoomId || messageLoadingStatus === "loading" || !hasMore) return;

        const nextPage = page + 1;
        console.log(`Loading more messages for room ${selectedRoomId}, page ${nextPage}`);
        
        const result = await dispatch(fetchChatMessages({
            roomId: selectedRoomId,
            page: nextPage,
            limit: 20,
        }));

        if (result.meta.requestStatus === 'fulfilled') {
            const payload = result.payload as any;
            if (payload.data?.pagination?.hasMore === false) {
                setHasMore(false);
            }
            setPage(nextPage);
        }
    }, [selectedRoomId, messageLoadingStatus, hasMore, page, dispatch]);

    // Handle message deletion
    const handleDeleteMessage = useCallback(async (messageId: string) => {
        if (!selectedRoomId) return;
        
        try {
            await dispatch(deleteChatMessage({ 
                roomId: selectedRoomId, 
                messageId 
            }));
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    }, [selectedRoomId, dispatch]);

    // Group messages by sender and time
    const groupedMessages = useMemo(() => {
        return messages.reduce((groups: any[][], message: any, index: number) => {
            const prevMessage = messages[index - 1];
            const nextMessage = messages[index + 1];
            
            const shouldStartNewGroup =
                !prevMessage ||
                prevMessage.senderId !== message.senderId ||
                new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() > 5 * 60 * 1000;

            const isLastInGroup = 
                !nextMessage ||
                nextMessage.senderId !== message.senderId ||
                new Date(nextMessage.timestamp).getTime() - new Date(message.timestamp).getTime() > 5 * 60 * 1000;

            if (shouldStartNewGroup) {
                groups.push([{ ...message, isLastInGroup }]);
            } else {
                const currentGroup = groups[groups.length - 1];
                // Update previous message to not be last in group
                if (currentGroup.length > 0) {
                    currentGroup[currentGroup.length - 1].isLastInGroup = false;
                }
                currentGroup.push({ ...message, isLastInGroup });
            }
            return groups;
        }, []);
    }, [messages]);

    // Typing indicator component
    const TypingIndicator = () => {
        if (typingUsers.length === 0) return null;

        const displayUsers = typingUsers.slice(0, 3);
        const moreCount = Math.max(0, typingUsers.length - 3);

        return (
            <div className="flex items-center gap-2 px-4 py-2 text-muted-foreground">
                <div className="flex -space-x-1">
                    {displayUsers.map((user) => {
                        const bgColor = generateColorFromString(user.userId);
                        const textColor = getContrastColor(bgColor);
                        
                        return (
                            <Avatar key={user.userId} className="h-6 w-6 border-2 border-background">
                                <AvatarFallback 
                                    style={{ backgroundColor: bgColor, color: textColor }}
                                    className="text-xs"
                                >
                                    {getInitials(user.userName)}
                                </AvatarFallback>
                            </Avatar>
                        );
                    })}
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-sm">
                        {displayUsers.map(u => u.userName).join(', ')}
                        {moreCount > 0 && ` and ${moreCount} more`}
                        {typingUsers.length === 1 ? ' is' : ' are'} typing
                    </span>
                    <div className="flex gap-0.5">
                        {[0, 1, 2].map(i => (
                            <div
                                key={i}
                                className="h-1 w-1 bg-current rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.2}s` }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Connection status indicator
    const ConnectionIndicator = () => {
        const { status, error } = connectionStatus;
        
        if (status === 'connected') return null;

        return (
            <div className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm border-b",
                status === 'connecting' && "bg-yellow-50 dark:bg-yellow-900/10 text-yellow-600 dark:text-yellow-400",
                status === 'disconnected' && "bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400",
                status === 'error' && "bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400"
            )}>
                {status === 'connecting' ? (
                    <Wifi className="h-4 w-4 animate-pulse" />
                ) : (
                    <WifiOff className="h-4 w-4" />
                )}
                <span>
                    {status === 'connecting' && 'Connecting...'}
                    {status === 'disconnected' && 'Disconnected from chat'}
                    {status === 'error' && `Connection error: ${error || 'Unknown error'}`}
                </span>
            </div>
        );
    };

    // Scroll to bottom button
    const ScrollToBottomButton = () => {
        if (isNearBottom || messages.length === 0) return null;

        return (
            <div className="absolute bottom-4 right-4 z-10">
                <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full shadow-lg"
                    onClick={() => {
                        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                        setShouldAutoScroll(true);
                    }}
                >
                    Scroll to bottom
                </Button>
            </div>
        );
    };

    if (!selectedRoomId) {
        return null;
    }

    return (
        <div className="flex-1 flex flex-col relative overflow-hidden">
            <ConnectionIndicator />
            
            {/* Room info header - optional */}
            {selectedRoom && (
                <div className="px-4 py-2 border-b bg-muted/20 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>
                            {selectedRoom.participants?.length || 0} member{selectedRoom.participants?.length !== 1 ? 's' : ''}
                        </span>
                        {connectionStatus.status === 'connected' && (
                            <Badge variant="secondary" className="text-xs">
                                Online
                            </Badge>
                        )}
                    </div>
                </div>
            )}

            <ScrollArea 
                ref={scrollAreaRef} 
                className="flex-1 px-2"
                onScroll={checkScrollPosition}
            >
                <div className="py-4">
                    {/* Load more button */}
                    {hasMore && messages.length >= 20 && (
                        <div className="flex justify-center py-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLoadMore}
                                disabled={messageLoadingStatus === "loading"}
                                className="text-xs"
                            >
                                {messageLoadingStatus === "loading" ? (
                                    <>
                                        <div className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    "Load earlier messages"
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Initial loading state */}
                    {messageLoadingStatus === "loading" && messages.length === 0 && (
                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-12 w-3/4 rounded-lg" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error state */}
                    {messageLoadingStatus === "failed" && (
                        <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground mb-4">
                                Failed to load messages
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    if (selectedRoomId) {
                                        dispatch(fetchChatMessages({ 
                                            roomId: selectedRoomId, 
                                            page: 1, 
                                            limit: 30 
                                        }));
                                    }
                                }}
                            >
                                Try Again
                            </Button>
                        </div>
                    )}

                    {/* Empty state */}
                    {messageLoadingStatus === "succeeded" && messages.length === 0 && (
                        <div className="text-center py-12">
                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-medium mb-2">No messages yet</h3>
                            <p className="text-sm text-muted-foreground">
                                Be the first to send a message in this chat room
                            </p>
                        </div>
                    )}

                    {/* Message groups */}
                    {groupedMessages.map((group, groupIndex) => (
                        <div key={`group-${groupIndex}-${group[0]?.id}`} className="mb-6">
                            {group.map((message, messageIndex) => (
                                <div key={message.id} className="mb-1">
                                    <ChatMessage
                                        message={message}
                                        showSenderInfo={messageIndex === 0}
                                        isLast={messageIndex === group.length - 1}
                                        onReply={onReply}
                                        onForward={onForward}
                                        onDelete={handleDeleteMessage}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* Typing indicator */}
                    <TypingIndicator />

                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            <ScrollToBottomButton />
        </div>
    );
};