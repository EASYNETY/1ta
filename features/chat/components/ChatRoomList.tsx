// features/chat/components/ChatRoomList.tsx

"use client"

import React, { useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, MessageSquarePlus, Search, MoreVertical, Edit, Trash2, RefreshCw } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
    selectChatRooms,
    selectRoomStatus,
    selectSelectedRoomId,
    selectChatRoom,
    selectChatUnreadCount,
} from "../store/chatSlice"
import { ChatRoomItem } from "./ChatRoomItem"
import { ChatRoomType } from "../types/chat-types"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { fetchChatRooms } from "../store/chat-thunks"
import Link from "next/link"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { 
    DropdownMenu, 
    DropdownMenuTrigger, 
    DropdownMenuContent, 
    DropdownMenuItem,
    DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { apiClient } from "@/lib/api-client";
import { ChatRoomForm } from "./ChatRoomForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchAllUsers } from "../store/user-thunks";
import { selectUsers, selectUsersStatus, selectUsersError } from "../store/user-slice";
import { Badge } from "@/components/ui/badge";
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ChatRoomListProps {
    onRoomSelect?: () => void
}

export const ChatRoomList: React.FC<ChatRoomListProps> = ({ onRoomSelect }) => {
    const dispatch = useAppDispatch()
    const rooms = useAppSelector(selectChatRooms)
    const status = useAppSelector(selectRoomStatus)
    const selectedRoomId = useAppSelector(selectSelectedRoomId)
    const totalUnreadCount = useAppSelector(selectChatUnreadCount)
    const currentUser = useAppSelector((state) => state.auth.user)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [filter, setFilter] = React.useState<ChatRoomType | "all">("all")
    const router = useRouter();
    const [updatingRoomId, setUpdatingRoomId] = useState<string | null>(null);
    const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
    const [editingRoom, setEditingRoom] = useState<any | null>(null);
    const [roomToDelete, setRoomToDelete] = useState<any | null>(null);

    // User management state with better selectors
    const users = useAppSelector(selectUsers);
    const usersStatus = useAppSelector(selectUsersStatus);
    const usersError = useAppSelector(selectUsersError);
    
    // Fetch users when component mounts or when status is idle
    useEffect(() => {
        if (usersStatus === "idle") {
            console.log("Fetching users...");
            dispatch(fetchAllUsers());
        }
    }, [dispatch, usersStatus]);

    // Debug logging
    useEffect(() => {
        console.log("Users state:", { users: users.length, status: usersStatus, error: usersError });
    }, [users, usersStatus, usersError]);

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

    // Retry fetching users
    const handleRetryFetchUsers = () => {
        console.log("Retrying user fetch...");
        dispatch(fetchAllUsers());
    };


     // QUICK FIX: Extract users from chat room participants as fallback
    const extractUsersFromRooms = React.useMemo(() => {
        if (!rooms || rooms.length === 0) return [];
        
        const usersMap = new Map();
        
        rooms.forEach(room => {
            if (room.participants && Array.isArray(room.participants)) {
                room.participants.forEach(participant => {
                    if (participant && participant.id && !usersMap.has(participant.id)) {
                        usersMap.set(participant.id, {
                            id: participant.id,
                            name: participant.name || participant.displayName || 'Unknown User',
                            email: participant.email || '',
                            role: participant.role || 'student',
                        });
                    }
                });
            }
        });
        
        return Array.from(usersMap.values());
    }, [rooms]);


        // Try to get users from Redux first, fallback to room participants
    const [availableUsers, setAvailableUsers] = React.useState([]);
    const [usersFetchStatus, setUsersFetchStatus] = React.useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');
    const [usersFetchError, setUsersFetchError] = React.useState<string | null>(null);

    // User fetching effect with fallback
    useEffect(() => {
        const loadUsers = async () => {
            setUsersFetchStatus('loading');
            setUsersFetchError(null);
            
            try {
                // Try to dispatch fetchAllUsers
                const result = await dispatch(fetchAllUsers()).unwrap();
                setAvailableUsers(result);
                setUsersFetchStatus('succeeded');
            } catch (error) {
                console.warn('Failed to fetch users from API, using room participants fallback:', error);
                
                // Use extracted users from rooms as fallback
                if (extractUsersFromRooms.length > 0) {
                    setAvailableUsers(extractUsersFromRooms);
                    setUsersFetchStatus('succeeded');
                } else {
                    // Last resort: create some mock users based on current user
                    const mockUsers = [
                        ...(currentUser ? [{
                            id: currentUser.id,
                            name: currentUser.name || currentUser.email || 'Current User',
                            email: currentUser.email || '',
                            role: currentUser.role || 'student'
                        }] : []),
                        // Add some default roles
                        { id: 'mock-admin', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
                        { id: 'mock-teacher', name: 'Teacher User', email: 'teacher@example.com', role: 'teacher' }
                    ];
                    setAvailableUsers(mockUsers);
                    setUsersFetchStatus('succeeded');
                }
            }
        };

        if (usersFetchStatus === 'idle') {
            loadUsers();
        }
    }, [dispatch, usersFetchStatus, extractUsersFromRooms, currentUser]);


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

    // Delete Room handler
    const handleDeleteRoom = async (roomId: string) => {
        setDeletingRoomId(roomId);
        try {
            await apiClient(`/chat/rooms/${roomId}`, {
                method: "DELETE",
                requiresAuth: true
            });
            toast.success("Room deleted successfully");
            dispatch(fetchChatRooms(currentUser!.id));
            if (roomId === selectedRoomId) {
                dispatch(selectChatRoom(""));
            }
        } catch (err: any) {
            console.error("Delete room error:", err);
            toast.error(err.message || "Failed to delete room");
        } finally {
            setDeletingRoomId(null);
            setRoomToDelete(null);
        }
    };

    // Handle room form submission for updates
    const handleRoomFormSubmit = async (data: any) => {
        if (!editingRoom) return;
        
        setUpdatingRoomId(editingRoom.id);
        try {
            console.log("Updating room with data:", data);
            const response = await apiClient(`/chat/rooms/${editingRoom.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    name: data.name,
                    type: data.type,
                    participantIds: data.participantIds
                }),
                headers: { "Content-Type": "application/json" },
                requiresAuth: true
            });
            
            console.log("Room update response:", response);
            toast.success("Room updated successfully");
            dispatch(fetchChatRooms(currentUser!.id));
        } catch (err: any) {
            console.error("Update room error:", err);
            toast.error(err.message || "Failed to update room");
        } finally {
            setUpdatingRoomId(null);
            setEditingRoom(null);
        }
    };

    const canManageRoom = (room: any) => {
        // Allow if user is admin/super_admin or if they're a teacher/instructor in the room
        return (
            currentUser?.role === "admin" || 
            currentUser?.role === "super_admin" ||
            (currentUser?.role === "teacher" && room.participants?.some((p: any) => 
                p.id === currentUser.id && (p.role === "teacher" || p.role === "instructor")
            ))
        );
    };

    return (
        <div className="flex h-full flex-col">
            {/* Header with Search and Unread Count */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold">Messages</h2>
                    {totalUnreadCount > 0 && (
                        <Badge variant="default" className="h-6 px-2 text-xs bg-primary text-primary-foreground">
                            {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                        </Badge>
                    )}
                </div>
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
            <div className="flex p-2 gap-1 overflow-x-auto scrollbar-hide bg-muted/15 rounded-lg mx-4">
                <DyraneButton
                    variant={filter === "all" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full text-xs px-3 whitespace-nowrap"
                    onClick={() => setFilter("all")}
                >
                    All {totalUnreadCount > 0 && filter === "all" && `(${totalUnreadCount})`}
                </DyraneButton>
                <DyraneButton
                    variant={filter === ChatRoomType.COURSE ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full text-xs px-3 whitespace-nowrap"
                    onClick={() => setFilter(ChatRoomType.COURSE)}
                >
                    Courses
                </DyraneButton>
                <DyraneButton
                    variant={filter === ChatRoomType.CLASS ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full text-xs px-3 whitespace-nowrap"
                    onClick={() => setFilter(ChatRoomType.CLASS)}
                >
                    Classes
                </DyraneButton>
                <DyraneButton
                    variant={filter === ChatRoomType.EVENT ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full text-xs px-3 whitespace-nowrap"
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
                                <div key={room.id} className="flex items-center group">
                                    <div className="flex-1">
                                        <ChatRoomItem
                                            room={room}
                                            isSelected={room.id === selectedRoomId}
                                            onClick={() => handleSelectRoom(room.id)}
                                        />
                                    </div>
                                    
                                    {/* Room Management Actions */}
                                    {canManageRoom(room) && (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <DyraneButton
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        disabled={updatingRoomId === room.id || deletingRoomId === room.id}
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                        <span className="sr-only">Open menu</span>
                                                    </DyraneButton>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem
                                                        onClick={() => setEditingRoom(room)}
                                                        disabled={updatingRoomId === room.id}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        {updatingRoomId === room.id ? "Updating..." : "Edit Room"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setRoomToDelete(room)}
                                                        disabled={deletingRoomId === room.id}
                                                        className="flex items-center gap-2 text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        {deletingRoomId === room.id ? "Deleting..." : "Delete Room"}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </nav>
            </ScrollArea>

            {/* Create Chat Button (for teachers/admins/super_admins only) */}
            {(currentUser?.role === "teacher" || currentUser?.role === "admin" || currentUser?.role === "super_admin") && (
                <div className="p-4 py-5 border-t">
                    <DyraneButton className="w-full" size="sm" asChild>
                        <Link href="/chat/create">
                            <MessageSquarePlus className="mr-2 h-4 w-4" />
                            Create Chat Room
                        </Link>
                    </DyraneButton>
                </div>
            )}

          {/* Edit Room Dialog - Updated */}
            <Dialog open={!!editingRoom} onOpenChange={open => !open && setEditingRoom(null)}>
                <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Chat Room</DialogTitle>
                    </DialogHeader>
                    
                    {/* Updated user loading logic */}
                    {usersFetchStatus === "loading" ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Skeleton className="h-8 w-32" />
                            <div className="text-sm text-muted-foreground">Loading users...</div>
                        </div>
                    ) : usersFetchStatus === "failed" ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <AlertCircle className="h-12 w-12 text-destructive" />
                            <div className="text-center">
                                <div className="text-sm font-medium text-destructive mb-2">Failed to load users</div>
                                <div className="text-xs text-muted-foreground mb-4">
                                    {usersFetchError || "Unable to fetch user list for room management"}
                                </div>
                                <DyraneButton 
                                    onClick={() => {
                                        setUsersFetchStatus('idle');
                                        setUsersFetchError(null);
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Retry Loading Users
                                </DyraneButton>
                            </div>
                        </div>
                    ) : usersFetchStatus === "succeeded" && availableUsers.length > 0 ? (
                        <>
                            {/* Show source of users for debugging */}
                            {process.env.NODE_ENV === 'development' && (
                                <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                                    <span className="font-semibold">Debug:</span> Using {availableUsers.length} users 
                                    {availableUsers === extractUsersFromRooms ? ' (from room participants)' : ' (from API)'}
                                </div>
                            )}
                            <ChatRoomForm
                                initialRoom={editingRoom}
                                onSubmit={handleRoomFormSubmit}
                                onCancel={() => setEditingRoom(null)}
                                users={availableUsers}
                                isLoading={updatingRoomId === editingRoom?.id}
                            />
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-sm text-muted-foreground">No users available for room management</div>
                            <div className="text-xs text-muted-foreground mt-2">
                                Try creating or joining some chat rooms first to populate the user list.
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!roomToDelete} onOpenChange={open => !open && setRoomToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chat Room</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{roomToDelete?.name}"? This action cannot be undone.
                            All messages in this room will be permanently lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => roomToDelete && handleDeleteRoom(roomToDelete.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deletingRoomId === roomToDelete?.id}
                        >
                            {deletingRoomId === roomToDelete?.id ? "Deleting..." : "Delete Room"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}