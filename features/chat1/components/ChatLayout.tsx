// features/chat/components/ChatLayout.tsx - EMERGENCY FIX

"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { ChatRoomList } from "./ChatRoomList";
import { ChatMessageList } from "./ChatMessageList";
import { ChatMessageInput } from "./ChatMessageInput";
import { ChatRoomHeader } from "./ChatRoomHeader";
import { SelectChatPrompt } from "./SelectChatPrompt";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Menu, MessageSquare, AlertTriangle } from "lucide-react";
import { selectSelectedRoomId, selectSelectedRoom, selectChatRooms, selectChatUnreadCount } from "../store/chatSlice";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { fetchChatMessages } from "../store/chat-thunks";

export const ChatLayout: React.FC = () => {
    const dispatch = useAppDispatch();
    const selectedRoomId = useAppSelector(selectSelectedRoomId);
    const selectedRoom = useAppSelector(selectSelectedRoom);
    const allRooms = useAppSelector(selectChatRooms);
    const totalUnreadCount = useAppSelector(selectChatUnreadCount);
    const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [loadingError, setLoadingError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

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

    // EMERGENCY FIX: Aggressive timeout and error handling
    useEffect(() => {
        if (!selectedRoomId) {
            setIsLoadingMessages(false);
            setLoadingError(null);
            return;
        }

        let timeoutId: NodeJS.Timeout;
        let aborted = false;

        const fetchWithTimeout = async () => {
            setIsLoadingMessages(true);
            setLoadingError(null);
            
            console.log(`🚨 EMERGENCY FETCH: ${selectedRoomId}`);

            // Create abort controller for timeout
            const abortController = new AbortController();
            
            // Set aggressive 10-second timeout
            const emergencyTimeout = setTimeout(() => {
                abortController.abort();
                if (!aborted) {
                    setIsLoadingMessages(false);
                    setLoadingError("Request timed out after 10 seconds");
                    console.error("🚨 FETCH TIMEOUT for room:", selectedRoomId);
                }
            }, 10000);

            try {
                // Try to fetch messages with timeout
                const result = await Promise.race([
                    dispatch(fetchChatMessages({ 
                        roomId: selectedRoomId, 
                        page: 1, 
                        limit: 20 // Reduced limit for faster loading
                    })).unwrap(),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), 8000)
                    )
                ]);

                if (!aborted) {
                    setIsLoadingMessages(false);
                    setRetryCount(0);
                    console.log("✅ Messages loaded successfully");
                }
            } catch (error: any) {
                clearTimeout(emergencyTimeout);
                if (!aborted) {
                    setIsLoadingMessages(false);
                    const errorMessage = error.message || "Failed to load messages";
                    setLoadingError(errorMessage);
                    console.error("🚨 FETCH ERROR:", error);
                }
            } finally {
                clearTimeout(emergencyTimeout);
            }
        };

        // Immediate fetch with minimal delay
        timeoutId = setTimeout(fetchWithTimeout, 50);

        return () => {
            aborted = true;
            clearTimeout(timeoutId);
        };
    }, [selectedRoomId, dispatch, retryCount]);

    // Manual retry function
    const handleRetry = useCallback(() => {
        setRetryCount(prev => prev + 1);
        setLoadingError(null);
    }, []);

    // Emergency reset function
    const handleEmergencyReset = useCallback(() => {
        setIsLoadingMessages(false);
        setLoadingError(null);
        setRetryCount(0);
        // Force re-render by clearing and setting room
        window.location.reload();
    }, []);

    const handleRoomSelectInSheet = () => {
        setMobileSheetOpen(false);
    };

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

                        {/* EMERGENCY: Loading/Error States */}
                        {isLoadingMessages && (
                            <div className="flex items-center justify-center p-6 border-b bg-muted/20">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                                        Loading messages... ({retryCount > 0 ? `Retry ${retryCount}` : 'Please wait'})
                                    </div>
                                    <DyraneButton 
                                        onClick={handleEmergencyReset} 
                                        variant="outline" 
                                        size="sm"
                                        className="text-xs"
                                    >
                                        Emergency Reset
                                    </DyraneButton>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {loadingError && (
                            <div className="flex items-center justify-center p-6 border-b bg-destructive/10">
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <div className="flex items-center gap-2 text-sm text-destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        {loadingError}
                                    </div>
                                    <div className="flex gap-2">
                                        <DyraneButton onClick={handleRetry} variant="outline" size="sm">
                                            Retry ({retryCount + 1})
                                        </DyraneButton>
                                        <DyraneButton onClick={handleEmergencyReset} variant="destructive" size="sm">
                                            Reset Page
                                        </DyraneButton>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Messages - Only show if not loading and no error */}
                        {!isLoadingMessages && !loadingError && (
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