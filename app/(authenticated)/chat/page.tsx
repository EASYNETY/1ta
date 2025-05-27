// app/(authenticated)/chat/page.tsx

"use client"

import { useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { ChatLayout } from "@/features/chat/components/ChatLayout"
import { fetchChatRooms } from "@/features/chat/store/chat-thunks"
import { clearCreateRoomStatus } from "@/features/chat/store/chatSlice"

export default function ChatPage() {
    const dispatch = useAppDispatch()
    const currentUser = useAppSelector((state) => state.auth.user)

    // Initialize chat data when the page loads
    useEffect(() => {
        if (currentUser?.id) {
            dispatch(clearCreateRoomStatus())
            dispatch(fetchChatRooms(currentUser.id))
        }
    }, [dispatch, currentUser?.id])

    return <ChatLayout />
}
