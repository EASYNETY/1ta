// features/chat/components/ChatRoomList.tsx
import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, MessageSquarePlus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import {
    fetchChatRooms,
    selectChatRooms,
    selectRoomStatus,
    selectSelectedRoomId,
    selectChatRoom, // Action to select room
} from '../store/chatSlice';
import { ChatRoomItem } from './ChatRoomItem';

export const ChatRoomList: React.FC = () => {
    const dispatch = useAppDispatch();
    const rooms = useAppSelector(selectChatRooms);
    const status = useAppSelector(selectRoomStatus);
    const selectedRoomId = useAppSelector(selectSelectedRoomId);
    const currentUser = useAppSelector(state => state.auth.user);

    useEffect(() => {
        if (currentUser?.id && status === 'idle') {
            console.log("ChatRoomList: Fetching rooms...");
            dispatch(fetchChatRooms(currentUser.id));
        }
    }, [dispatch, currentUser?.id, status]);

    const handleSelectRoom = (roomId: string) => {
        if (roomId !== selectedRoomId) {
            dispatch(selectChatRoom(roomId));
        }
    };

    return (
        <div className="flex h-full flex-col border-r bg-muted/40 dark:bg-zinc-900/50">
            {/* Header (Optional: Search, Create New) */}
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Messages</h2>
                <DyraneButton variant="ghost" size="icon" className="h-8 w-8">
                    {/* TODO: Implement Create Chat Room Modal */}
                    <MessageSquarePlus className="h-4 w-4" />
                    <span className="sr-only">New Chat</span>
                </DyraneButton>
            </div>

            {/* Room List */}
            <ScrollArea className="flex-1 overflow-y-auto">
                <nav className="grid gap-1 p-2">
                    {status === 'loading' && (
                        <>
                            <Skeleton className="h-14 w-full rounded-lg" />
                            <Skeleton className="h-14 w-full rounded-lg" />
                            <Skeleton className="h-14 w-full rounded-lg" />
                        </>
                    )}
                    {status === 'failed' && (
                        <div className="p-4 text-center text-destructive text-sm flex items-center justify-center gap-2">
                            <AlertCircle className="h-4 w-4" /> Failed to load rooms.
                        </div>
                    )}
                    {status === 'succeeded' && rooms.length === 0 && (
                        <p className="p-4 text-center text-sm text-muted-foreground">No active chats found.</p>
                    )}
                    {status === 'succeeded' && rooms.map((room) => (
                        <ChatRoomItem
                            key={room.id}
                            room={room}
                            isSelected={room.id === selectedRoomId}
                            onClick={() => handleSelectRoom(room.id)}
                        />
                    ))}
                </nav>
            </ScrollArea>
        </div>
    );
};