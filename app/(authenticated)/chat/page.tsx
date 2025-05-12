// app/(authenticated)/chat/page.tsx

"use client"

import { useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { ChatLayout } from "@/features/chat/components/ChatLayout"
import { fetchChatRooms } from "@/features/chat/store/chat-thunks"

export default function ChatPage() {
    const dispatch = useAppDispatch()
    const currentUser = useAppSelector((state) => state.auth.user)
    const roomStatus = useAppSelector((state) => state.chat.roomStatus)

    // Initialize chat data when the page loads
    useEffect(() => {
        if (currentUser?.id && roomStatus === "idle") {
            dispatch(fetchChatRooms(currentUser.id))
        }
    }, [dispatch, currentUser?.id, roomStatus])

    return <ChatLayout />
}
