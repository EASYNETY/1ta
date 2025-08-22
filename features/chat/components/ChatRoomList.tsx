// features/chat/components/ChatRoomList.tsx - FIXED VERSION WITH STATE UPDATE FIX

"use client"

import React, { useEffect, useState } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, MessageSquarePlus, Search, MoreVertical, Edit, Trash2, RefreshCw, Bug } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
    selectChatRooms,
    selectRoomStatus,
    selectSelectedRoomId,
    selectChatRoom,
    selectChatUnreadCount,
    setRooms,
} from "../store/chatSlice"
import { ChatRoomItem } from "./ChatRoomItem"
import { ChatRoomType, ChatRoom, ChatUser } from "../types/chat-types"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { fetchChatRooms } from "../store/chat-thunks"
import Link from "next/link"
import { useRouter } from "next/navigation";
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
import { fetchAllUsers, fetchAllChatUsers } from "../store/user-thunks";
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
    // Use local state for rooms instead of Redux
    const [localRooms, setLocalRooms] = useState<ChatRoom[]>([])
    const [status, setStatus] = React.useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle')
    const selectedRoomId = useAppSelector(selectSelectedRoomId)
    const totalUnreadCount = useAppSelector(selectChatUnreadCount)
    const unreadCount = Number(totalUnreadCount || 0);
    const currentUser = useAppSelector((state) => state.auth.user)
    const [searchQuery, setSearchQuery] = React.useState("")
    // Always show all rooms by default
    const [filter, setFilter] = React.useState<ChatRoomType | "all">("all")
    const router = useRouter();
    const [updatingRoomId, setUpdatingRoomId] = useState<string | null>(null);
    const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
    const [editingRoom, setEditingRoom] = useState<any | null>(null);
    const [roomToDelete, setRoomToDelete] = useState<any | null>(null);
    
    // Debug state
    const [showDebugInfo, setShowDebugInfo] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [lastFetchTime, setLastFetchTime] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false); // NEW: Track if we've already fetched

    // User management state
    const [availableUsers, setAvailableUsers] = React.useState<ChatUser[]>([]);
    const [usersFetchStatus, setUsersFetchStatus] = React.useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');
    const [usersFetchError, setUsersFetchError] = React.useState<string | null>(null);

    // ENHANCED DEBUG LOGGING
    useEffect(() => {
        console.log("🏪 ChatRoomList State Update:");
        console.log("- Current User:", currentUser);
        console.log("- Rooms:", localRooms);
        console.log("- Rooms length:", localRooms?.length || 0);
        console.log("- Status:", status);
        console.log("- Selected Room ID:", selectedRoomId);
        console.log("- Total Unread:", totalUnreadCount);
        console.log("- Fetch Error:", fetchError);
        console.log("- Has Fetched:", hasFetched);
    }, [localRooms, status, currentUser, selectedRoomId, totalUnreadCount, fetchError, hasFetched]);

    // FIXED MAIN FETCH EFFECT - Only fetch once when user is available
    useEffect(() => {
        // Fetch chat rooms directly using apiClient
        const fetchRoomsDirect = async () => {
            if (!currentUser?.id) {
                setFetchError("No user ID available");
                setStatus('failed');
                return;
            }
            setStatus('loading');
            setFetchError(null);
            setLastFetchTime(new Date().toLocaleTimeString());
            try {
                const response = await apiClient("/chat/rooms?userId=" + currentUser.id, {
                    method: "GET",
                    requiresAuth: true
                });
                const roomsData = (response as any)?.data || (response as any);
                setLocalRooms(roomsData as ChatRoom[]);
                // Keep redux store in sync so selectedRoom selector works
                dispatch(setRooms(roomsData as ChatRoom[]));
                setStatus('succeeded');
                setHasFetched(true);
                setTimeout(() => {
                    console.log("Rooms from API:", roomsData);
                }, 1000);
            } catch (error: any) {
                setFetchError(error.message || "Failed to fetch chat rooms");
                setStatus('failed');
                setHasFetched(false);
            }
        };
        fetchRoomsDirect();
    }, [dispatch, currentUser?.id, hasFetched]); // Depend on hasFetched instead of status

    // MANUAL REFRESH FUNCTION
    const handleManualRefresh = async () => {
        if (!currentUser?.id) {
            toast.error("No user ID available");
            return;
        }

        console.log("🔄 Manual refresh triggered");
        setFetchError(null);
        setLastFetchTime(new Date().toLocaleTimeString());
        setHasFetched(false); // Reset to allow fresh fetch

        try {
            setStatus('loading');
            setFetchError(null);
            setLastFetchTime(new Date().toLocaleTimeString());
            setHasFetched(false);
            const response = await apiClient("/chat/rooms?userId=" + currentUser.id, {
                method: "GET",
                requiresAuth: true
            });
            const roomsData = (response as any)?.data || (response as any);
            setLocalRooms(roomsData as ChatRoom[]);
                // Keep redux store in sync after manual refresh
                dispatch(setRooms(roomsData as ChatRoom[]));
            setStatus('succeeded');
            setHasFetched(true);
            toast.success("Chat rooms refreshed");
        } catch (error: any) {
            setFetchError(error.message || "Refresh failed");
            setStatus('failed');
            toast.error("Failed to refresh chat rooms");
        }
    };

    // USER FETCHING WITH FALLBACK
    const extractUsersFromRooms = React.useMemo(() => {
        if (!localRooms || localRooms.length === 0) return [];
        
        const usersMap = new Map();
        
    localRooms.forEach(room => {
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
    }, [localRooms]);

    useEffect(() => {
        const loadUsers = async () => {
            setUsersFetchStatus('loading');
            setUsersFetchError(null);
            
            try {
                const result = await dispatch(fetchAllChatUsers()).unwrap();
                    setAvailableUsers(result as ChatUser[]);
                console.log("👥 Users fetched for Chats:", result);
                setUsersFetchStatus('succeeded');
            } catch (error: any) {
                console.error('❌ Failed to fetch users from API:', error);
                setUsersFetchError(error.message || 'Unable to fetch users');
                
                // Fallback to extracted users
                if (extractUsersFromRooms.length > 0) {
                    console.log("🔄 Using fallback users from rooms");
                    setAvailableUsers(extractUsersFromRooms as ChatUser[]);
                    setUsersFetchStatus('succeeded');
                } else {
                    setAvailableUsers([]);
                    setUsersFetchStatus('failed');
                }
            }
        };

        if (usersFetchStatus === 'idle') {
            loadUsers();
        }
    }, [dispatch, usersFetchStatus, extractUsersFromRooms]);

    const handleSelectRoom = (roomId: string) => {
        if (roomId !== selectedRoomId) {
            dispatch(selectChatRoom(roomId))
            onRoomSelect?.()
        }
    }

    // Filter rooms based on search query and type filter
    const filteredRooms = React.useMemo(() => {
        if (!localRooms || !Array.isArray(localRooms)) {
            console.log("⚠️ Rooms is not an array:", typeof localRooms, localRooms);
            return [];
        }

        // Always show all rooms regardless of type filter
        return localRooms.filter((room) => {
            const matchesSearch = room.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) || false;
            // Ignore type filter for now to show all rooms
            // const matchesFilter = filter === "all" || room.type === filter;
            return matchesSearch; // Only filter by search
        });
    }, [localRooms, searchQuery, filter]);

    // Group rooms by type for better organization
    const groupedRooms = React.useMemo(() => {
        if (!filteredRooms || filteredRooms.length === 0) return {} as Record<string, ChatRoom[]>;
        
        return filteredRooms.reduce(
            (acc: Record<string, ChatRoom[]>, room: ChatRoom) => {
                const type = room.type;
                if (!acc[type]) {
                    acc[type] = [];
                }
                acc[type].push(room);
                return acc;
            },
            {} as Record<string, ChatRoom[]>,
        );
    }, [filteredRooms]);

    // Delete Room handler
    const handleDeleteRoom = async (roomId: string) => {
        setDeletingRoomId(roomId);
        try {
            await apiClient(`/chat/rooms/${roomId}`, {
                method: "DELETE",
                requiresAuth: true
            });
            toast.success("Room deleted successfully");
            if (currentUser?.id) {
                setHasFetched(false); // Reset to allow fresh fetch
                dispatch(fetchChatRooms(currentUser.id));
            }
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
            await apiClient(`/chat/rooms/${editingRoom.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    name: data.name,
                    type: data.type,
                    participantIds: data.participantIds
                }),
                headers: { "Content-Type": "application/json" },
                requiresAuth: true
            });
            
            toast.success("Room updated successfully");
            if (currentUser?.id) {
                setHasFetched(false); // Reset to allow fresh fetch
                dispatch(fetchChatRooms(currentUser.id));
            }
        } catch (err: any) {
            console.error("Update room error:", err);
            toast.error(err.message || "Failed to update room");
        } finally {
            setUpdatingRoomId(null);
            setEditingRoom(null);
        }
    };

    const canManageRoom = (room: any) => {
        return (
            currentUser?.role === "admin" || 
            currentUser?.role === "super_admin" ||
            (currentUser?.role === "teacher" && room.participants?.some((p: any) => 
                p.id === currentUser.id && (p.role === "teacher" || p.role === "instructor")
            ))
        );
    };

    // DEBUG INFO COMPONENT
    const DebugInfo = () => (
        <div className="p-4 m-2 border-2 border-blue-200 bg-blue-50 rounded-lg text-xs">
            <div className="font-bold mb-2">🐛 Debug Information</div>
            <div><strong>Current User:</strong> {currentUser ? `${currentUser.name || currentUser.email} (${currentUser.id})` : 'None'}</div>
            <div><strong>Status:</strong> {status}</div>
            <div><strong>Has Fetched:</strong> {hasFetched ? 'Yes' : 'No'}</div>
            <div><strong>Rooms Count:</strong> {localRooms?.length || 0}</div>
            <div><strong>Filtered Rooms:</strong> {filteredRooms.length}</div>
            <div><strong>Last Fetch:</strong> {lastFetchTime || 'Never'}</div>
            <div><strong>Fetch Error:</strong> {fetchError || 'None'}</div>
            <div><strong>Available Users:</strong> {availableUsers.length}</div>
            <div className="mt-2">
                <strong>Rooms Data Sample:</strong>
                <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(localRooms?.slice(0, 3), null, 2)}
                </pre>
            </div>
        </div>
    );

    return (
        <div className="flex h-full flex-col">
            {/* Header with Search, Debug Toggle, and Unread Count */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold">Messages</h2>
                    <div className="flex items-center gap-2">
                        {process.env.NODE_ENV === 'development' && (
                            <DyraneButton
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDebugInfo(!showDebugInfo)}
                                className="h-6 w-6 p-0"
                            >
                                <Bug className="h-3 w-3" />
                            </DyraneButton>
                        )}
                        {unreadCount > 0 && (
                            <Badge variant="default" className="h-6 px-2 text-xs bg-primary text-primary-foreground">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </Badge>
                        )}
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search chats..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <DyraneButton
                        variant="outline"
                        size="sm"
                        onClick={handleManualRefresh}
                        disabled={status === "loading"}
                        className="flex items-center gap-1"
                    >
                        <RefreshCw className={`h-3 w-3 ${status === "loading" ? "animate-spin" : ""}`} />
                        {status === "loading" ? "Loading..." : "Refresh"}
                    </DyraneButton>
                </div>
            </div>

            {/* Debug Info */}
            {showDebugInfo && process.env.NODE_ENV === 'development' && <DebugInfo />}

            {/* Filter Tabs */}
            <div className="flex p-2 gap-1 overflow-x-auto scrollbar-hide bg-muted/15 rounded-lg mx-4">
                <DyraneButton
                    variant={filter === "all" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full text-xs px-3 whitespace-nowrap"
                    onClick={() => setFilter("all")}
                >
                    All {unreadCount > 0 && filter === "all" && `(${unreadCount})`}
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
                        <div className="space-y-2">
                            <div className="text-center text-sm text-muted-foreground py-2">Loading chat rooms...</div>
                            <Skeleton className="h-14 w-full rounded-lg" />
                            <Skeleton className="h-14 w-full rounded-lg" />
                            <Skeleton className="h-14 w-full rounded-lg" />
                        </div>
                    )}

                    {status === "failed" && (
                        <div className="p-4 text-center">
                            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                            <p className="text-sm font-medium text-destructive mb-1">Failed to load rooms</p>
                            <p className="text-xs text-muted-foreground mb-3">
                                {fetchError || "Unable to connect to chat service"}
                            </p>
                            <DyraneButton
                                variant="outline"
                                size="sm"
                                onClick={handleManualRefresh}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Try Again
                            </DyraneButton>
                        </div>
                    )}

                    {status === "succeeded" && filteredRooms.length === 0 && (
                        <div className="p-4 text-center">
                            <div className="text-6xl mb-2">💬</div>
                            <p className="text-sm font-medium mb-1">
                                {searchQuery ? "No matching chats found" : "No chat rooms yet"}
                            </p>
                            <p className="text-xs text-muted-foreground mb-3">
                                {searchQuery 
                                    ? "Try adjusting your search terms" 
                                    : "Create or join a chat room to get started"
                                }
                            </p>
                            {!searchQuery && (currentUser?.role === "teacher" || currentUser?.role === "admin" || currentUser?.role === "super_admin") && (
                                <DyraneButton variant="outline" size="sm" asChild>
                                    <Link href="/chat/create">
                                        <MessageSquarePlus className="mr-2 h-4 w-4" />
                                        Create Chat Room
                                    </Link>
                                </DyraneButton>
                            )}
                        </div>
                    )}

                    {/* Render rooms grouped by type */}
                    {Object.entries(groupedRooms).map(([type, typeRooms]) => (
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
                            {typeRooms.map((room) => (
                                <div key={room.id} className="flex items-center group">
                                    <div className="flex-1">
                                        <ChatRoomItem
                                            room={room}
                                            isSelected={room.id === selectedRoomId}
                                            onClick={() => handleSelectRoom(room.id)}
                                        />
                                    </div>
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

            {/* Edit Room Dialog */}
            <Dialog open={!!editingRoom} onOpenChange={open => !open && setEditingRoom(null)}>
                <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Chat Room</DialogTitle>
                    </DialogHeader>
                    
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
                        <ChatRoomForm
                            initialRoom={editingRoom}
                            onSubmit={handleRoomFormSubmit}
                            onCancel={() => setEditingRoom(null)}
                            users={availableUsers}
                            isLoading={updatingRoomId === editingRoom?.id}
                        />
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