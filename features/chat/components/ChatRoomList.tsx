// features/chat/components/ChatRoomList.tsx

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, MessageSquarePlus, Search, MoreVertical, Edit, Trash2, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
    selectSelectedRoomId,
    selectChatRoom,
    setRooms,
} from "../store/chatSlice";
import { ChatRoomItem } from "./ChatRoomItem";
import { ChatRoom, ChatUser, ChatRoomType } from "../types/chat-types";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { fetchChatRooms, deleteChatRoom, updateChatRoom } from "../store/chat-thunks";
import { fetchAllChatUsers } from "../store/user-thunks";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { 
    DropdownMenu, 
    DropdownMenuTrigger, 
    DropdownMenuContent, 
    DropdownMenuItem,
    DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { ChatRoomForm } from "./ChatRoomForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

export const ChatRoomList: React.FC<{ onRoomSelect?: () => void }> = ({ onRoomSelect }) => {
    const dispatch = useAppDispatch();
    
    // --- STATE MANAGEMENT FIX: Use local state to prevent infinite loops ---
    const [localRooms, setLocalRooms] = useState<ChatRoom[]>([]);
    const [status, setStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false);
    
    const selectedRoomId = useAppSelector(selectSelectedRoomId);
    const currentUser = useAppSelector((state) => state.auth.user);
    const [searchQuery, setSearchQuery] = useState("");
    
    const [editingRoom, setEditingRoom] = useState<ChatRoom | null>(null);
    const [roomToDelete, setRoomToDelete] = useState<ChatRoom | null>(null);
    const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([]);

    // --- DATA FETCHING FIX: Simplified and robust fetching logic ---
    const handleFetchRooms = useCallback(async (isManualRefresh = false) => {
        if (!currentUser?.id) return;
        if (status === 'loading' && !isManualRefresh) return;

        setStatus('loading');
        setError(null);
        
        try {
            const rooms = await dispatch(fetchChatRooms(currentUser.id)).unwrap();
            setLocalRooms(rooms);
            dispatch(setRooms(rooms)); // Sync global store once after fetch
            setStatus('succeeded');
            if (isManualRefresh) toast.success("Chat rooms refreshed");
        } catch (e: any) {
            const errorMessage = typeof e === 'string' ? e : "Failed to fetch chat rooms";
            setError(errorMessage);
            setStatus('failed');
            if (isManualRefresh) toast.error(errorMessage);
        } finally {
            setHasFetched(true);
        }
    }, [currentUser?.id, dispatch, status]);

    useEffect(() => {
        if (currentUser?.id && !hasFetched) {
            handleFetchRooms();
        }
    }, [currentUser?.id, hasFetched, handleFetchRooms]);
    
    useEffect(() => {
        dispatch(fetchAllChatUsers()).then(action => {
            if (action.meta.requestStatus === 'fulfilled') {
                setAvailableUsers(action.payload as ChatUser[]);
            }
        });
    }, [dispatch]);

    const handleSelectRoom = (roomId: string) => {
        if (roomId !== selectedRoomId) {
            dispatch(selectChatRoom(roomId));
            onRoomSelect?.();
        }
    };

    const handleRoomFormSubmit = async (data: any) => {
        if (!editingRoom) return;
        
        const action = updateChatRoom({ roomId: editingRoom.id, ...data });
        
        try {
            await dispatch(action).unwrap();
            toast.success("Room updated successfully");
            setEditingRoom(null);
            handleFetchRooms(true); // Manually refresh list after change
        } catch (e: any) {
            toast.error(typeof e === 'string' ? e : 'Failed to update room');
        }
    };

    const handleDelete = async (roomId: string) => {
        try {
            await dispatch(deleteChatRoom(roomId)).unwrap();
            toast.success("Room deleted successfully");
            setRoomToDelete(null);
            handleFetchRooms(true); // Manually refresh
        } catch (e: any) {
            toast.error(typeof e === 'string' ? e : 'Failed to delete room');
        }
    };

    const filteredRooms = React.useMemo(() => {
        if (!localRooms) return [];
        return localRooms.filter((room) =>
            room.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [localRooms, searchQuery]);

    const canManageRoom = (room: ChatRoom) =>
      currentUser?.role === "admin" || currentUser?.role === "super_admin";

    return (
        <div className="flex h-full flex-col">
            <div className="p-4 border-b">
                <div className="flex items-center gap-2">
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
                        variant="ghost"
                        size="icon"
                        onClick={() => handleFetchRooms(true)}
                        disabled={status === "loading"}
                        title="Refresh rooms"
                    >
                        <RefreshCw className={`h-4 w-4 ${status === "loading" ? "animate-spin" : ""}`} />
                    </DyraneButton>
                </div>
            </div>

            <ScrollArea className="flex-1 overflow-y-auto">
                <nav className="grid gap-1 p-2">
                    {status === 'loading' && !hasFetched && (
                        Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
                    )}

                    {status === 'failed' && (
                        <div className="p-4 text-center">
                            <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
                            <p className="mt-2 text-sm font-medium">Failed to load rooms</p>
                            <p className="mt-1 text-xs text-muted-foreground">{error}</p>
                            <Button variant="outline" size="sm" className="mt-4" onClick={() => handleFetchRooms(true)}>
                                Try Again
                            </Button>
                        </div>
                    )}

                    {status === 'succeeded' && filteredRooms.length === 0 && (
                        <div className="p-4 text-center text-muted-foreground">
                            <p className="text-sm">
                                {searchQuery ? 'No rooms match your search.' : 'No chat rooms found.'}
                            </p>
                        </div>
                    )}
                    
                    {status === 'succeeded' && filteredRooms.map((room) => (
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
                                            <DyraneButton variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </DyraneButton>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setEditingRoom(room)}>
                                                <Edit className="h-4 w-4 mr-2" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => setRoomToDelete(room)} className="text-destructive">
                                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </ScrollArea>

            {canManageRoom({} as any) && (
                 <div className="p-4 py-3 border-t">
                    <DyraneButton asChild className="w-full" size="sm">
                        <Link href="/chat/create">
                            <MessageSquarePlus className="mr-2 h-4 w-4" />
                            Create New Room
                        </Link>
                    </DyraneButton>
                </div>
            )}
            
            <Dialog open={!!editingRoom} onOpenChange={(open) => !open && setEditingRoom(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Chat Room</DialogTitle>
                    </DialogHeader>
                    <ChatRoomForm
                        initialRoom={editingRoom}
                        onSubmit={handleRoomFormSubmit}
                        onCancel={() => setEditingRoom(null)}
                        users={availableUsers}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!roomToDelete} onOpenChange={(open) => !open && setRoomToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the chat room "{roomToDelete?.name}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => roomToDelete && handleDelete(roomToDelete.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};