// features/chat/components/ChatMessageList.tsx
import React, { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { fetchChatMessages, selectCurrentRoomMessages, selectMessageStatusForRoom, selectSelectedRoomId } from '../store/chatSlice';
import { ChatMessage } from './ChatMessage'; // Import the single message component
import { ScrollArea } from '@/components/ui/scroll-area';

export const ChatMessageList: React.FC = () => {
    const dispatch = useAppDispatch();
    const selectedRoomId = useAppSelector(selectSelectedRoomId);
    const messages = useAppSelector(selectCurrentRoomMessages); // Selector gets messages for selected room
    const status = useAppSelector(state => selectMessageStatusForRoom(state, selectedRoomId)); // Status for *this* room
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null); // Ref to scroll to bottom

    // Fetch messages when room changes or initially
    useEffect(() => {
        if (selectedRoomId && status === 'idle') {
            console.log(`ChatMessageList: Fetching messages for room ${selectedRoomId}`);
            dispatch(fetchChatMessages({ roomId: selectedRoomId }));
        }
    }, [selectedRoomId, status, dispatch]);

    // Scroll to bottom when messages change or first load
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]); // Dependency on messages array


    return (
        <ScrollArea ref={scrollAreaRef} className="h-full flex-1 p-4"> {/* Make it scrollable */}
            <div className="space-y-3 pr-2"> {/* Add padding-right for scrollbar */}
                {status === 'loading' && (
                    <div className="space-y-3">
                        <Skeleton className="h-16 w-3/4 rounded-lg" />
                        <Skeleton className="h-12 w-1/2 rounded-lg self-end ml-auto" />
                        <Skeleton className="h-20 w-2/3 rounded-lg" />
                    </div>
                )}
                {status === 'failed' && (
                    <div className="text-center text-destructive text-sm flex flex-col items-center gap-2 py-10">
                        <AlertCircle className="h-6 w-6" />
                        <p>Failed to load messages.</p>
                    </div>
                )}
                {status === 'succeeded' && messages.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-10">
                        No messages yet. Start the conversation!
                    </div>
                )}
                {status === 'succeeded' && messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
                {/* Empty div at the end to scroll to */}
                <div ref={messagesEndRef} />
            </div>
        </ScrollArea>
    );
};