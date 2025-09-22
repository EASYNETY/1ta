// features/chat/components/ChatLayout.tsx - FIXED VERSION

"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { ChatRoomList } from "./ChatRoomList";
import { ChatMessageList } from "./ChatMessageList";
import { ChatMessageInput } from "./ChatMessageInput";
import { ChatRoomHeader } from "./ChatRoomHeader";
import { SelectChatPrompt } from "./SelectChatPrompt";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Menu, MessageSquare, AlertTriangle, RefreshCw } from "lucide-react";
import { selectSelectedRoomId, selectSelectedRoom, selectChatRooms, selectChatUnreadCount, selectMessageStatusForRoom } from "../store/chatSlice";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { fetchChatMessages } from "../store/chat-thunks";
import { useSocket } from "../services/socketService";

export const ChatLayout: React.FC = () => {
    const dispatch = useAppDispatch();
    const selectedRoomId = useAppSelector(selectSelectedRoomId);
    const selectedRoom = useAppSelector(selectSelectedRoom);
    const allRooms = useAppSelector(selectChatRooms);
    const totalUnreadCount = useAppSelector(selectChatUnreadCount);
    const messageStatus = useAppSelector((state) =>
        selectedRoomId ? selectMessageStatusForRoom(state, selectedRoomId) : 'idle'
    );

    // Socket service for real-time messaging
    const { joinRoom, leaveRoom, isConnected } = useSocket();
    
    const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
    const [loadingError, setLoadingError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const fetchAbortController = useRef<AbortController | null>(null);
    const lastFetchedRoomId = useRef<string | null>(null);

    // Mobile view detection
    const [isMobileView, setIsMobileView] = useState(false);

    useEffect(() => {
        const checkMobileView = () => {
            setIsMobileView(window.innerWidth < 768);
        };
        checkMobileView();
        window.addEventListener("resize", checkMobileView);
        return () => window.removeEventListener("resize", checkMobileView);
    }, []);

    // Close sheet on room selection
    useEffect(() => {
        if (selectedRoomId && mobileSheetOpen) {
            setMobileSheetOpen(false);
        }
    }, [selectedRoomId, mobileSheetOpen]);

    // Join/leave socket rooms when selected room changes
    useEffect(() => {
        if (selectedRoomId) {
            if (isConnected) {
                console.log('🔗 Joining socket room:', selectedRoomId);
                joinRoom(selectedRoomId);
            } else {
                console.log('⚠️ Socket not connected, cannot join room:', selectedRoomId);
            }
        }

        // Cleanup: leave previous room when component unmounts or room changes
        return () => {
            if (selectedRoomId && isConnected) {
                console.log('🚪 Leaving socket room:', selectedRoomId);
                leaveRoom(selectedRoomId);
            }
        };
    }, [selectedRoomId, joinRoom, leaveRoom, isConnected]);

    // FIXED: Clean message fetching logic
    useEffect(() => {
        // Reset states when no room is selected
        if (!selectedRoomId) {
            setLoadingError(null);
            lastFetchedRoomId.current = null;
            // Cancel any ongoing fetch
            if (fetchAbortController.current) {
                fetchAbortController.current.abort();
                fetchAbortController.current = null;
            }
            return;
        }

        // Don't fetch if we just fetched this room (prevents infinite loops)
        if (lastFetchedRoomId.current === selectedRoomId && messageStatus !== 'failed') {
            console.log("🔄 Skipping fetch - already fetched this room:", selectedRoomId);
            return;
        }

        // Cancel previous fetch if ongoing
        if (fetchAbortController.current) {
            fetchAbortController.current.abort();
        }

        const fetchMessages = async () => {
            console.log("📨 Starting message fetch for room:", selectedRoomId);
            setLoadingError(null);
            
            // Create new abort controller
            fetchAbortController.current = new AbortController();
            lastFetchedRoomId.current = selectedRoomId;

            try {
                await dispatch(fetchChatMessages({ 
                    roomId: selectedRoomId, 
                    page: 1, 
                    limit: 30 
                })).unwrap();
                
                console.log("✅ Messages fetched successfully for room:", selectedRoomId);
                setRetryCount(0);
                
            } catch (error: any) {
                // Only set error if not aborted
                if (!fetchAbortController.current?.signal.aborted) {
                    console.error("❌ Failed to fetch messages:", error);
                    setLoadingError(error.message || "Failed to load messages");
                }
            } finally {
                fetchAbortController.current = null;
            }
        };

        // Add small delay to prevent rapid successive calls
        const timeoutId = setTimeout(fetchMessages, 100);
        
        return () => {
            clearTimeout(timeoutId);
        };
    }, [selectedRoomId, dispatch, retryCount]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (fetchAbortController.current) {
                fetchAbortController.current.abort();
            }
        };
    }, []);

    // Manual retry function
    const handleRetry = useCallback(() => {
        console.log("🔄 Manual retry triggered");
        setRetryCount(prev => prev + 1);
        setLoadingError(null);
        lastFetchedRoomId.current = null; // Force refetch
    }, []);

    // Emergency reset function
    const handleEmergencyReset = useCallback(() => {
        console.log("🚨 Emergency reset triggered");
        setLoadingError(null);
        setRetryCount(0);
        lastFetchedRoomId.current = null;
        
        // Cancel any ongoing requests
        if (fetchAbortController.current) {
            fetchAbortController.current.abort();
            fetchAbortController.current = null;
        }
        
        // Force page refresh as last resort
        window.location.reload();
    }, []);

    const handleRoomSelectInSheet = () => {
        setMobileSheetOpen(false);
    };

    // Determine loading state
    const isLoading = messageStatus === 'loading' && !loadingError;
    const hasError = messageStatus === 'failed' || !!loadingError;

    return (
        <div className="flex h-[calc(100vh-var(--header-height,4rem))] border rounded-lg overflow-hidden bg-background/5 backdrop-blur-sm relative">
            {/* Mobile Menu Button */}
            <div className="md:hidden absolute top-3 left-3 z-20">
                <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                    <SheetTrigger asChild>
                        <DyraneButton variant="secondary" size="icon" className="h-9 w-9 shadow-md relative">
                            <Menu className="h-5 w-5" />
                            {totalUnreadCount > 0 && (
                                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                                    {totalUnreadCount > 9 ? "9+" : totalUnreadCount}
                                </Badge>
                            )}
                        </DyraneButton>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-auto bg-background/5 backdrop-blur-sm rounded-r-3xl sm:rounded-none border-r flex flex-col">
                        <SheetHeader className="p-4 border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    <SheetTitle className="text-lg font-semibold">Chat Rooms</SheetTitle>
                                </div>
                                {totalUnreadCount > 0 && (
                                    <Badge variant="default" className="h-5 px-2 text-xs bg-primary text-primary-foreground">
                                        {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                                    </Badge>
                                )}
                            </div>
                        </SheetHeader>
                        <div className="flex-1 overflow-y-auto">
                            <ChatRoomList onRoomSelect={handleRoomSelectInSheet} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <div className="w-full w-1/2 max-w-[380px] hidden md:flex md:flex-col border-r bg-muted/5 backdrop-blur-sm">
                <div className="p-4 py-4.5 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Discussions</h2>
                    </div>
                    {totalUnreadCount > 0 && (
                        <Badge variant="default" className="h-6 px-2.5 text-xs bg-primary text-primary-foreground font-semibold">
                            {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                        </Badge>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto">
                    <ChatRoomList />
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {selectedRoomId && selectedRoom ? (
                    <>
                        {/* Header */}
                        <ChatRoomHeader room={selectedRoom} isMobileView={isMobileView} />

                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex items-center justify-center p-6 border-b bg-muted/10">
                                <div className="flex items-center gap-3">
                                    <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                                    <span className="text-sm text-muted-foreground">
                                        Loading messages...
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {hasError && (
                            <div className="flex items-center justify-center p-6 border-b bg-destructive/5">
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <div className="flex items-center gap-2 text-sm text-destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        {loadingError || "Failed to load messages"}
                                    </div>
                                    <div className="flex gap-2">
                                        <DyraneButton onClick={handleRetry} variant="outline" size="sm">
                                            <RefreshCw className="h-4 w-4 mr-1" />
                                            Retry {retryCount > 0 && `(${retryCount + 1})`}
                                        </DyraneButton>
                                        {retryCount > 2 && (
                                            <DyraneButton onClick={handleEmergencyReset} variant="destructive" size="sm">
                                                Reset Page
                                            </DyraneButton>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Messages - Show if not loading */}
                        {!isLoading && (
                            <div className="flex-1 overflow-y-auto">
                                <ChatMessageList />
                            </div>
                        )}

                        {/* Input - Always show */}
                        <ChatMessageInput />
                    </>
                ) : (
                    <div className={`flex-1 ${isMobileView && allRooms.length > 0 ? 'pt-16 md:pt-0' : ''}`}>
                        <SelectChatPrompt />
                    </div>
                )}
            </div>
        </div>
    );
};