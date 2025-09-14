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
    const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [userScrolledUp, setUserScrolledUp] = useState(false);
    const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);
    const [prevMessageCount, setPrevMessageCount] = useState(0);
    const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
    const [refreshCount, setRefreshCount] = useState(0);

    const { joinRoom, leaveRoom } = useSocket();

    // Auto-refresh function to fetch latest messages
    const autoRefreshMessages = useCallback(async () => {
        if (!selectedRoomId || isAutoRefreshing || messageLoadingStatus === 'loading') return;
        
        console.log('🔄 Auto-refreshing messages for room:', selectedRoomId, 'Attempt:', refreshCount + 1);
        setIsAutoRefreshing(true);
        setRefreshCount(prev => prev + 1);
        
        try {
            const result = await dispatch(fetchChatMessages({ 
                roomId: selectedRoomId, 
                page: 1, 
                limit: 50,
                timestamp: Date.now() // Add timestamp to prevent caching
            }));
            
            console.log('✅ Auto-refresh result:', result);
            
            if (result.meta.requestStatus === 'fulfilled') {
                const fetchedMessages = (result.payload as any)?.data ?? [];
                console.log('📨 Fetched messages count:', fetchedMessages.length);
            }
        } catch (error) {
            console.error('❌ Auto-refresh failed:', error);
        } finally {
            setTimeout(() => setIsAutoRefreshing(false), 500);
        }
    }, [selectedRoomId, dispatch, isAutoRefreshing, messageLoadingStatus, refreshCount]);

    // Start auto-refresh interval
    const startAutoRefresh = useCallback(() => {
        if (autoRefreshRef.current) {
            clearInterval(autoRefreshRef.current);
        }
        
        console.log('🚀 Starting auto-refresh for room:', selectedRoomId);
        
        // Auto-refresh every 3 seconds
        autoRefreshRef.current = setInterval(() => {
            autoRefreshMessages();
        }, 3000);
    }, [autoRefreshMessages, selectedRoomId]);

    // Stop auto-refresh interval
    const stopAutoRefresh = useCallback(() => {
        if (autoRefreshRef.current) {
            console.log('🛑 Stopping auto-refresh');
            clearInterval(autoRefreshRef.current);
            autoRefreshRef.current = null;
        }
    }, []);

    // Effect for joining/leaving rooms and initial message fetch
    useEffect(() => {
        if (selectedRoomId) {
            console.log('🏠 Joining room:', selectedRoomId);
            joinRoom(selectedRoomId);
            setUserScrolledUp(false);
            setShowNewMessageIndicator(false);
            setPrevMessageCount(0);
            setRefreshCount(0);

            // Initial fetch
            if (messageLoadingStatus === "idle" || messages.length === 0) {
                setPage(1);
                setHasMore(true);
                console.log('📥 Initial message fetch');
                dispatch(fetchChatMessages({ roomId: selectedRoomId, page: 1, limit: 50 }));
            }

            // Start auto-refresh for this room
            setTimeout(() => {
                startAutoRefresh();
            }, 2000); // Wait 2 seconds before starting auto-refresh
        }

        return () => {
            if (selectedRoomId) {
                console.log('👋 Leaving room:', selectedRoomId);
                leaveRoom(selectedRoomId);
            }
            stopAutoRefresh();
        };
    }, [selectedRoomId, dispatch, joinRoom, leaveRoom, startAutoRefresh, stopAutoRefresh]);

    // Track message count changes to detect new messages
    useEffect(() => {
        console.log('📊 Messages changed - Count:', messages.length, 'Previous:', prevMessageCount);
        
        if (messages.length > prevMessageCount && prevMessageCount > 0) {
            console.log('🆕 New messages detected! Auto-scrolling...');
            const viewport = viewportRef.current;
            if (!viewport) return;

            if (!userScrolledUp) {
                setTimeout(() => {
                    viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
                    console.log('⬇️ Scrolled to bottom');
                }, 100);
                setShowNewMessageIndicator(false);
            } else {
                console.log('👆 User scrolled up, showing indicator');
                setShowNewMessageIndicator(true);
            }
        }
        setPrevMessageCount(messages.length);
    }, [messages.length, userScrolledUp, prevMessageCount]);

    // Initial scroll to bottom when messages first load
    useEffect(() => {
        if (messages.length > 0 && prevMessageCount === 0 && !userScrolledUp) {
            const viewport = viewportRef.current;
            if (!viewport) return;
            
            console.log('📜 Initial scroll to bottom');
            setTimeout(() => {
                viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'auto' });
            }, 300);
        }
    }, [messages.length, prevMessageCount, userScrolledUp]);

    // Scroll Event Handler
    const handleScroll = useCallback(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const isAtBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 50;
        const isNearTop = viewport.scrollTop < 200;

        if (isAtBottom) {
            setUserScrolledUp(false);
            setShowNewMessageIndicator(false);
        } else {
            setUserScrolledUp(true);
        }

        // Auto-load older messages when scrolling near top
        if (isNearTop && hasMore && messageLoadingStatus !== "loading") {
            handleLoadMore();
        }
    }, [hasMore, messageLoadingStatus]);

    const scrollToBottom = () => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
        setUserScrolledUp(false);
        setShowNewMessageIndicator(false);
    };

    // Load older messages (for scrolling up)
    const handleLoadMore = useCallback(async () => {
        if (!selectedRoomId || messageLoadingStatus === "loading" || !hasMore) return;
        
        console.log('📚 Loading more messages, page:', page + 1);
        
        const viewport = viewportRef.current;
        const scrollHeightBefore = viewport?.scrollHeight || 0;
        const scrollTopBefore = viewport?.scrollTop || 0;
        
        const nextPage = page + 1;
        const result = await dispatch(fetchChatMessages({ 
            roomId: selectedRoomId, 
            page: nextPage, 
            limit: 20 
        }));
        
        const fetchedMessages = (result.payload as any)?.data ?? [];
        if (result.meta.requestStatus === 'fulfilled' && fetchedMessages.length === 0) {
            setHasMore(false);
            console.log('🔚 No more messages to load');
        } else {
            // Maintain scroll position after loading older messages
            setTimeout(() => {
                if (viewport) {
                    const scrollHeightAfter = viewport.scrollHeight;
                    const scrollHeightDiff = scrollHeightAfter - scrollHeightBefore;
                    viewport.scrollTo({ 
                        top: scrollTopBefore + scrollHeightDiff, 
                        behavior: 'auto' 
                    });
                }
            }, 100);
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
            {/* Debug Panel */}
            <div className="absolute top-2 left-2 z-50 bg-black/80 text-white text-xs p-3 rounded-lg font-mono">
                <div>🏠 Room: {selectedRoomId?.slice(-8)}</div>
                <div>📨 Messages: {messages.length}</div>
                <div>🔄 Refreshes: {refreshCount}</div>
                <div>⚡ Status: {messageLoadingStatus}</div>
                <div>🔄 Auto: {isAutoRefreshing ? '🟢 ON' : '🔴 OFF'}</div>
                <div>📍 Scroll: {userScrolledUp ? '👆 UP' : '⬇️ BOTTOM'}</div>
            </div>

            {/* Auto-refresh indicator */}
            {isAutoRefreshing && (
                <div className="absolute top-2 right-2 z-50">
                    <div className="flex items-center space-x-2 bg-green-500/90 text-white px-3 py-2 rounded-lg shadow-lg animate-pulse">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span className="text-sm font-medium">Fetching latest...</span>
                    </div>
                </div>
            )}

            <ScrollArea 
                className="flex-1 px-4" 
                viewportRef={viewportRef} 
                onScroll={handleScroll}
            >
                <div className="py-4">
                    {hasMore && (
                        <div className="text-center mb-4">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleLoadMore} 
                                disabled={messageLoadingStatus === "loading"}
                            >
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