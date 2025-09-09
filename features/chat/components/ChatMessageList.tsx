// features/chat/components/ChatMessageList.tsx

"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Wifi, WifiOff, Users, MessageSquare } from "lucide-react";
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
    const [hasMore, setHasMore] = useState(true);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

    const { joinRoom, leaveRoom } = useSocket();

    useEffect(() => {
        if (selectedRoomId) {
            joinRoom(selectedRoomId);
            if (messageLoadingStatus === "idle" || messages.length === 0) {
                dispatch(fetchChatMessages({ roomId: selectedRoomId, page: 1, limit: 50 }));
                setPage(1);
                setHasMore(true);
            }
        }
        return () => {
            if (selectedRoomId) {
                leaveRoom(selectedRoomId);
            }
        };
    }, [selectedRoomId, dispatch]);

    useEffect(() => {
        if (shouldAutoScroll) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, shouldAutoScroll]);

    const handleLoadMore = useCallback(async () => {
        if (!selectedRoomId || messageLoadingStatus === "loading" || !hasMore) return;
        const nextPage = page + 1;
        const result = await dispatch(fetchChatMessages({ roomId: selectedRoomId, page: nextPage, limit: 20 }));
        if (result.meta.requestStatus === 'fulfilled' && (result.payload as any).data.length === 0) {
            setHasMore(false);
        }
        setPage(nextPage);
    }, [selectedRoomId, messageLoadingStatus, hasMore, page, dispatch]);

    const handleDeleteMessage = useCallback(async (messageId: string) => {
        if (!selectedRoomId) return;
        dispatch(deleteChatMessage({ roomId: selectedRoomId, messageId }));
    }, [selectedRoomId, dispatch]);

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
            <div className="p-2 text-sm text-muted-foreground">
                {typingUsers.map(u => u.userName).join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
            </div>
        );
    };

    if (!selectedRoomId) {
        return <SelectChatPrompt />;
    }

    return (
        <div className="flex-1 flex flex-col relative overflow-hidden">
            <ScrollArea ref={scrollAreaRef} className="flex-1 px-2">
                <div className="py-4">
                    {hasMore && (
                        <div className="text-center">
                            <Button variant="ghost" size="sm" onClick={handleLoadMore} disabled={messageLoadingStatus === "loading"}>
                                Load More
                            </Button>
                        </div>
                    )}

                    {messageLoadingStatus === 'loading' && messages.length === 0 && (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center space-x-4 p-2">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        ))
                    )}
                    
                    {groupedMessages.map((group, groupIndex) => (
                        <div key={groupIndex} className="mb-4">
                            {group.map((message, messageIndex) => (
                                <ChatMessage
                                    key={message.id}
                                    message={message}
                                    showSenderInfo={messageIndex === 0}
                                    onReply={onReply}
                                    onForward={onForward}
                                    onDelete={handleDeleteMessage}
                                />
                            ))}
                        </div>
                    ))}
                    <TypingIndicator />
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>
        </div>
    );
};