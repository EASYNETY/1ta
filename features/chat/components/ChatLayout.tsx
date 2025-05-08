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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"; // Added SheetHeader
import { Button } from "@/components/ui/button"; // Standard Button
import { Menu, X } from "lucide-react"; // Added X for a potential close button inside sheet
import { selectSelectedRoomId, selectSelectedRoom, selectChatRoom, selectChatRooms } from "../store/chatSlice"; // Ensure selectChatRoom is imported if used by ChatRoomList for selection
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"; // Assuming this is your custom button
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export const ChatLayout: React.FC = () => {
    // const dispatch = useAppDispatch(); // dispatch is not used in this component directly
    const selectedRoomId = useAppSelector(selectSelectedRoomId);
    const selectedRoom = useAppSelector(selectSelectedRoom);
    const allRooms = useAppSelector(selectChatRooms); // Get all rooms for context

    const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

    // Effect to close the sheet when a room is selected (and the screen is mobile-sized)
    // This assumes `selectedRoomId` changing means a room was effectively "selected".
    useEffect(() => {
        if (selectedRoomId && mobileSheetOpen) {
            // Only close if it was open, to avoid unnecessary state updates
            setMobileSheetOpen(false);
        }
        // No dependency on mobileSheetOpen here to avoid loops if selection happens
        // while sheet is programmatically opened.
    }, [selectedRoomId]);


    // Determine if the layout should be considered "mobile"
    // This is a client-side check, so it won't cause hydration mismatches for initial render.
    // For more robust SSR/SSG, you might use a CSS-only approach or a hook that debounces window resize.
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
            <div className="md:hidden absolute top-3 left-3 z-20"> {/* z-20 to be above chat content */}
                <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                    <SheetTrigger asChild>
                        <DyraneButton variant="secondary" size="icon" className="h-9 w-9 shadow-md">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Open chat rooms menu</span>
                        </DyraneButton>
                    </SheetTrigger>
                    <SheetContent
                        side="left"
                        className="p-0 w-auto bg-background/5 backdrop-blur-sm rounded-r-3xl sm:rounded-none border-r flex flex-col" // Use bg-background for sheet
                        onOpenAutoFocus={(e) => e.preventDefault()} // Prevent auto-focus on first element in sheet
                    >
                        <SheetHeader className="p-4 border-b">
                            <SheetTitle className="text-lg font-semibold">Chat Rooms</SheetTitle>
                            {/* Optional: Close button inside the sheet header */}
                            {/* <SheetClose asChild>
                                <Button variant="ghost" size="icon" className="absolute top-3 right-3">
                                    <X className="h-5 w-5" />
                                    <span className="sr-only">Close menu</span>
                                </Button>
                            </SheetClose> */}
                        </SheetHeader>
                        <div className="flex-1 overflow-y-auto">
                            <ChatRoomList onRoomSelect={handleRoomSelectInSheet} />
                        </div>
                        {/* You could add a footer to the sheet if needed */}
                    </SheetContent>
                </Sheet>
            </div>

            {/* 
                Desktop Sidebar:
                - Shown only on screens `md` and larger.
                - Takes up a fixed width.
            */}
            <div className="w-full w-1/2 max-w-[360px] hidden md:flex md:flex-col border-r bg-muted/5 backdrop-blur-sm"> {/* Added a subtle bg */}
                <div className="p-4 py-4.5 border-b">
                    <h2 className="text-lg font-semibold">Chat Rooms</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <ChatRoomList /> {/* No onRoomSelect needed here as it doesn't control sheet */}
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
                        {/* ChatRoomHeader might also need to be aware of mobile view for its own layout adjustments */}
                        <ChatRoomHeader room={selectedRoom} isMobileView={isMobileView} />
                        <ChatMessageList />
                        <ChatMessageInput />
                    </>
                ) : (
                    // On mobile, if no room is selected, the sheet is likely the primary way to select one.
                    // On desktop, this prompt is more prominent.
                    <div className={`flex-1 ${isMobileView && allRooms.length > 0 ? 'pt-16 md:pt-0' : ''}`}> {/* Add padding top on mobile if menu button is present */}
                        <SelectChatPrompt />
                    </div>
                )}
            </div>
        </div>
    );
};