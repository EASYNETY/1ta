// features/chat/components/ChatLayout.tsx

"use client";

import type React from "react";
import { useState, useEffect } from "react";
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

export const ChatLayout: React.FC = () => {
    const selectedRoomId = useAppSelector(selectSelectedRoomId);
    const selectedRoom = useAppSelector(selectSelectedRoom);
    const allRooms = useAppSelector(selectChatRooms);
    const totalUnreadCount = useAppSelector(selectChatUnreadCount);
    const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

    // Effect to close the sheet when a room is selected (and the screen is mobile-sized)
    useEffect(() => {
        if (selectedRoomId && mobileSheetOpen) {
            setMobileSheetOpen(false);
        }
    }, [selectedRoomId, mobileSheetOpen]);

    // Determine if the layout should be considered "mobile"
    const [isMobileView, setIsMobileView] = useState(false);

    useEffect(() => {
        const checkMobileView = () => {
            setIsMobileView(window.innerWidth < 768); // Tailwind's `md` breakpoint is 768px
        };
        checkMobileView(); // Initial check
        window.addEventListener("resize", checkMobileView);
        return () => window.removeEventListener("resize", checkMobileView);
    }, []);

    const handleRoomSelectInSheet = () => {
        setMobileSheetOpen(false);
    };

    return (
        <div className="flex h-[calc(100vh-var(--header-height,4rem))] border rounded-lg overflow-hidden bg-background/5 backdrop-blur-sm relative">
            {/* 
                Mobile Menu Button: 
                - Shown only on screens smaller than `md`.
                - Positioned absolutely.
                - Triggers the Sheet.
            */}
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

            {/* 
                Desktop Sidebar:
                - Shown only on screens `md` and larger.
                - Takes up a fixed width.
            */}
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

            {/* 
                Main Chat Area:
                - Takes up the remaining space.
                - Displays either the selected chat or a prompt.
            */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {selectedRoomId && selectedRoom ? (
                    <>
                        <ChatRoomHeader room={selectedRoom} isMobileView={isMobileView} />
                        <ChatMessageList />
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