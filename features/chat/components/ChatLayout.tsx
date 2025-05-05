// features/chat/components/ChatLayout.tsx

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { ChatRoomList } from "./ChatRoomList"
import { ChatMessageList } from "./ChatMessageList"
import { ChatMessageInput } from "./ChatMessageInput"
import { ChatRoomHeader } from "./ChatRoomHeader"
import { SelectChatPrompt } from "./SelectChatPrompt"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { selectSelectedRoomId, selectSelectedRoom } from "../store/chatSlice"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export const ChatLayout: React.FC = () => {
    const dispatch = useAppDispatch()
    const selectedRoomId = useAppSelector(selectSelectedRoomId)
    const selectedRoom = useAppSelector(selectSelectedRoom)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Close mobile menu when a room is selected
    useEffect(() => {
        if (selectedRoomId && mobileMenuOpen) {
            setMobileMenuOpen(false)
        }
    }, [selectedRoomId, mobileMenuOpen])

    return (
        <div className="flex h-[calc(100vh-4rem)] border rounded-lg overflow-hidden bg-background/5 backdrop-blur-sm">
            {/* Mobile Menu Button */}
            <div className="md:hidden absolute top-4 left-4 z-10">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <DyraneButton variant="outline" size="icon" className="h-9 w-9">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </DyraneButton>
                    </SheetTrigger>
                    <SheetContent side="left" className="px-2 w-[300px] border-none bg-muted/5 backdrop-blur-sm rounded-r-3xl sm:rounded-none">
                        <VisuallyHidden>
                            <SheetTitle>Chat Rooms</SheetTitle>
                        </VisuallyHidden>
                        <ChatRoomList onRoomSelect={() => setMobileMenuOpen(false)} />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Sidebar - Hidden on mobile */}
            <div className="w-full max-w-xs hidden md:flex md:flex-col border-r">
                <ChatRoomList />
            </div>

            {/* Main Chat Area */}
            <div className="flex flex-1 flex-col">
                {selectedRoomId && selectedRoom ? (
                    <>
                        <ChatRoomHeader room={selectedRoom} />
                        <ChatMessageList />
                        <ChatMessageInput />
                    </>
                ) : (
                    <SelectChatPrompt />
                )}
            </div>
        </div>
    )
}
