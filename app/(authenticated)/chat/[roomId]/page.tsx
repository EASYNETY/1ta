// app/(authenticated)/chat/[roomId]/page.tsx

"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { useAppDispatch } from "@/store/hooks"
import { ChatLayout } from "@/features/chat/components/ChatLayout"
import { selectChatRoom } from "@/features/chat/store/chatSlice"

export default function ChatRoomPage() {
    const params = useParams()
    const dispatch = useAppDispatch()
    const roomId = params.roomId as string

    // Select the room when the page loads
    useEffect(() => {
        if (roomId) {
            dispatch(selectChatRoom(roomId))
        }
    }, [dispatch, roomId])

    return <ChatLayout />
}
