// features/chat/components/ChatRoomList.tsx


"use client"

import React, { useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, MessageSquarePlus, Search } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
    selectChatRooms,
    selectRoomStatus,
    selectSelectedRoomId,
    selectChatRoom,
} from "../store/chatSlice"
import { ChatRoomItem } from "./ChatRoomItem"
import { ChatRoomType } from "../types/chat-types"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { fetchChatRooms } from "../store/chat-thunks"

interface ChatRoomListProps {
    onRoomSelect?: () => void
}

export const ChatRoomList: React.FC<ChatRoomListProps> = ({ onRoomSelect }) => {
    const dispatch = useAppDispatch()
    const rooms = useAppSelector(selectChatRooms)
    const status = useAppSelector(selectRoomStatus)
    const selectedRoomId = useAppSelector(selectSelectedRoomId)
    const currentUser = useAppSelector((state) => state.auth.user)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [filter, setFilter] = React.useState<ChatRoomType | "all">("all")

    useEffect(() => {
        if (currentUser?.id && status === "idle") {
            dispatch(fetchChatRooms(currentUser.id))
        }
    }, [dispatch, currentUser?.id, status])

    const handleSelectRoom = (roomId: string) => {
        if (roomId !== selectedRoomId) {
            dispatch(selectChatRoom(roomId))
            onRoomSelect?.()
        }
    }

    // Filter rooms based on search query and type filter
    const filteredRooms = rooms.filter((room) => {
        const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = filter === "all" || room.type === filter
        return matchesSearch && matchesFilter
    })

    // Group rooms by type for better organization
    const groupedRooms = filteredRooms.reduce(
        (acc, room) => {
            const type = room.type
            if (!acc[type]) {
                acc[type] = []
            }
            acc[type].push(room)
            return acc
        },
        {} as Record<ChatRoomType, typeof rooms>,
    )

    return (
        <div className="flex h-full flex-col">
            {/* Header with Search */}
            <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">Messages</h2>
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search chats..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex p-2 gap-1 overflow-x-auto scrollbar-hide bg-muted/15 rounded-lg">
                <DyraneButton
                    variant={filter === "all" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full text-xs px-3"
                    onClick={() => setFilter("all")}
                >
                    All
                </DyraneButton>
                <DyraneButton
                    variant={filter === ChatRoomType.COURSE ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full text-xs px-3"
                    onClick={() => setFilter(ChatRoomType.COURSE)}
                >
                    Courses
                </DyraneButton>
                <DyraneButton
                    variant={filter === ChatRoomType.CLASS ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full text-xs px-3"
                    onClick={() => setFilter(ChatRoomType.CLASS)}
                >
                    Classes
                </DyraneButton>
                <DyraneButton
                    variant={filter === ChatRoomType.EVENT ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full text-xs px-3"
                    onClick={() => setFilter(ChatRoomType.EVENT)}
                >
                    Events
                </DyraneButton>
            </div>

            {/* Room List */}
            <ScrollArea className="flex-1 overflow-y-auto">
                <nav className="grid gap-1 p-2">
                    {status === "loading" && (
                        <>
                            <Skeleton className="h-14 w-full rounded-lg" />
                            <Skeleton className="h-14 w-full rounded-lg" />
                            <Skeleton className="h-14 w-full rounded-lg" />
                        </>
                    )}

                    {status === "failed" && (
                        <div className="p-4 text-center text-destructive text-sm flex items-center justify-center gap-2">
                            <AlertCircle className="h-4 w-4" /> Failed to load rooms.
                        </div>
                    )}

                    {status === "succeeded" && filteredRooms.length === 0 && (
                        <p className="p-4 text-center text-sm text-muted-foreground">
                            {searchQuery ? "No matching chats found." : "No active chats found."}
                        </p>
                    )}

                    {/* Render rooms grouped by type */}
                    {Object.entries(groupedRooms).map(([type, rooms]) => (
                        <div key={type} className="mb-4">
                            <h3 className="text-xs font-medium text-muted-foreground px-2 mb-1 uppercase">
                                {type === ChatRoomType.COURSE
                                    ? "Courses"
                                    : type === ChatRoomType.CLASS
                                        ? "Classes"
                                        : type === ChatRoomType.EVENT
                                            ? "Events"
                                            : type === ChatRoomType.ANNOUNCEMENT
                                                ? "Announcements"
                                                : "Other"}
                            </h3>
                            {rooms.map((room) => (
                                <ChatRoomItem
                                    key={room.id}
                                    room={room}
                                    isSelected={room.id === selectedRoomId}
                                    onClick={() => handleSelectRoom(room.id)}
                                />
                            ))}
                        </div>
                    ))}
                </nav>
            </ScrollArea>

            {/* Create Chat DyraneButton (for teachers/admins only) */}
            {(currentUser?.role === "teacher" || currentUser?.role === "admin") && (
                <div className="p-4 border-t">
                    <DyraneButton className="w-full" size="sm">
                        <MessageSquarePlus className="mr-2 h-4 w-4" />
                        Create Chat Room
                    </DyraneButton>
                </div>
            )}
        </div>
    )
}
