// features/chat/components/ChatLayout.tsx - OPTIMIZED VERSION

"use client";

import type React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { ChatRoomList } from "./ChatRoomList";
import { ChatMessageList } from "./ChatMessageList";
import { ChatMessageInput } from "./ChatMessageInput";
import { ChatRoomHeader } from "./ChatRoomHeader";
import { SelectChatPrompt } from "./SelectChatPrompt";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Menu, MessageSquare } from "lucide-react";
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
    const [lastFetchedRoomId, setLastFetchedRoomId] = useState<string | null>(null);

    // Memoize mobile view detection to prevent unnecessary re-renders
    const [isMobileView, setIsMobileView] = useState(false);

    const checkMobileView = useCallback(() => {
        const mobile = window.innerWidth < 768;
        setIsMobileView(mobile);
    }, []);

    useEffect(() => {
        checkMobileView(); // Initial check
        window.addEventListener("resize", checkMobileView);
        return () => window.removeEventListener("resize", checkMobileView);
    }, [checkMobileView]);

    // Effect to close the sheet when a room is selected (mobile only)
    useEffect(() => {
        if (selectedRoomId && mobileSheetOpen) {
            setMobileSheetOpen(false);
        }
    }, [selectedRoomId, mobileSheetOpen]);

    // Optimized message fetching with debouncing and caching
    useEffect(() => {
        if (!selectedRoomId) {
            setLastFetchedRoomId(null);
            return;
        }

        // Avoid refetching messages for the same room
        if (selectedRoomId === lastFetchedRoomId) {
            return;
        }

        const fetchMessages = async () => {
            setIsLoadingMessages(true);
            console.log(`🔥 Fetching messages for room: ${selectedRoomId}`);
            
            try {
                await dispatch(fetchChatMessages({ 
                    roomId: selectedRoomId, 
                    page: 1, 
                    limit: 50 // Increased limit for better UX
                })).unwrap();
                
                setLastFetchedRoomId(selectedRoomId);
            } catch (error) {
                console.error("Failed to fetch messages:", error);
                // Optionally show error toast/notification
            } finally {
                setIsLoadingMessages(false);
            }
        };

        // Add a small delay to prevent rapid successive calls
        const timeoutId = setTimeout(fetchMessages, 100);
        
        return () => clearTimeout(timeoutId);
    }, [selectedRoomId, dispatch, lastFetchedRoomId]);

    const handleRoomSelectInSheet = useCallback(() => {
        setMobileSheetOpen(false);
    }, []);

    // Memoize the mobile menu button to prevent unnecessary re-renders
    const mobileMenuButton = useMemo(() => (
        <div className="md:hidden absolute top-3 left-3 z-20">
            <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                <SheetTrigger asChild>
                    <DyraneButton variant="secondary" size="icon" className="h-9 w-9 shadow-md relative">
                        <Menu className="h-5 w-5" />
                        {totalUnreadCount > 0 && (
                            <Badge
                                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground"
                            >
                                {totalUnreadCount > 9 ? "9+" : totalUnreadCount}
                            </Badge>
                        )}
                        <span className="sr-only">
                            Open chat rooms menu {totalUnreadCount > 0 && `(${totalUnreadCount} unread)`}
                        </span>
                    </DyraneButton>
                </SheetTrigger>
                <SheetContent
                    side="left"
                    className="p-0 w-auto bg-background/5 backdrop-blur-sm rounded-r-3xl sm:rounded-none border-r flex flex-col"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
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
    ), [mobileSheetOpen, totalUnreadCount, handleRoomSelectInSheet]);

    // Memoize desktop sidebar
    const desktopSidebar = useMemo(() => (
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
    ), [totalUnreadCount]);

    return (
        <div className="flex h-[calc(100vh-var(--header-height,4rem))] border rounded-lg overflow-hidden bg-background/5 backdrop-blur-sm relative">
            {mobileMenuButton}
            {desktopSidebar}

            {/* Main Chat Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {selectedRoomId && selectedRoom ? (
                    <>
                        {/* Header */}
                        <ChatRoomHeader room={selectedRoom} isMobileView={isMobileView} />

                        {/* Loading indicator */}
                        {isLoadingMessages && (
                            <div className="flex items-center justify-center p-4 border-b bg-muted/20">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                                    Loading messages...
                                </div>
                            </div>
                        )}

                        {/* Scrollable Messages */}
                        <div className="flex-1 overflow-y-auto">
                            <ChatMessageList />
                        </div>

                        {/* Input */}
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