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
import Link from "next/link"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { apiClient } from "@/lib/api-client";

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
    const router = useRouter();
    const [updatingRoomId, setUpdatingRoomId] = useState<string | null>(null);
    const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);

    // Get token from localStorage or Redux (adjust as needed)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

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
    const filteredRooms = (rooms ?? []).filter((room) => {
        const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = filter === "all" || room.type === filter
        return matchesSearch && matchesFilter
    })

    // Group rooms by type for better organization
    const groupedRooms = (filteredRooms ?? []).reduce(
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

    // Update Room handler
    const handleUpdateRoom = async (roomId: string, newName: string) => {
        setUpdatingRoomId(roomId);
        try {
            await apiClient(`/chat/rooms/${roomId}`, {
                method: "PUT",
                body: JSON.stringify({ name: newName }),
                headers: { "Content-Type": "application/json" },
                requiresAuth: true
            });
            toast.success("Room updated");
            dispatch(fetchChatRooms(currentUser.id));
        } catch (err) {
            toast.error("Failed to update room");
        } finally {
            setUpdatingRoomId(null);
        }
    };

    // Delete Room handler
    const handleDeleteRoom = async (roomId: string) => {
        setDeletingRoomId(roomId);
        try {
            await apiClient(`/chat/rooms/${roomId}`, {
                method: "DELETE",
                requiresAuth: true
            });
            toast.success("Room deleted");
            dispatch(fetchChatRooms(currentUser.id));
            if (roomId === selectedRoomId) {
                dispatch(selectChatRoom(""));
            }
        } catch (err) {
            toast.error("Failed to delete room");
        } finally {
            setDeletingRoomId(null);
        }
    };


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
                                <div key={room.id} className="flex items-center">
                                    <ChatRoomItem
                                        room={room}
                                        isSelected={room.id === selectedRoomId}
                                        onClick={() => handleSelectRoom(room.id)}
                                    />
                                    {/* Show CRUD actions for admin/super_admin as a dropdown */}
                                    {(currentUser?.role === "admin" || currentUser?.role === "super_admin") && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <button type="button" className="ml-2 px-2 py-1 rounded bg-muted text-xs hover:bg-muted/70">Actions</button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        console.log('Update clicked for room', room.id);
                                                        const newName = prompt("Enter new room name", room.name);
                                                        if (newName && newName !== room.name) {
                                                            handleUpdateRoom(room.id, newName);
                                                        }
                                                    }}
                                                    disabled={updatingRoomId === room.id}
                                                >
                                                    {updatingRoomId === room.id ? "Updating..." : "Update Room"}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        console.log('Delete clicked for room', room.id);
                                                        if (confirm("Are you sure you want to delete this room?")) {
                                                            handleDeleteRoom(room.id);
                                                        }
                                                    }}
                                                    disabled={deletingRoomId === room.id}
                                                >
                                                    {deletingRoomId === room.id ? "Deleting..." : "Delete Room"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </nav>
            </ScrollArea>

            {/* Create Chat DyraneButton (for teachers/admins/super_admins only) */}
            {(currentUser?.role === "teacher" || currentUser?.role === "admin" || currentUser?.role === "super_admin") && (
                <div className="p-4 py-5 border-t">
                    <DyraneButton className="w-full" size="sm" asChild>
                        {/* Use asChild with Link */}
                        <Link href="/chat/create">
                            <MessageSquarePlus className="mr-2 h-4 w-4" />
                            Create Chat Room</Link>
                    </DyraneButton>
                </div>
            )}
        </div>
    )
}
