// features/chat/components/ChatLayout.tsx
"use client"; // Needed for hooks

import React from 'react';
import { ChatRoomList } from './ChatRoomList';
import { ChatMessageList } from './ChatMessageList';
import { ChatMessageInput } from './ChatMessageInput';
import { useAppSelector } from '@/store/hooks';
import { SelectChatPrompt } from './SelectChatPrompt'; // Create this simple component

export const ChatLayout: React.FC = () => {
    const selectedRoomId = useAppSelector(state => state.chat.selectedRoomId);

    return (
        // Ensure layout takes full height available
        <div className="flex h-[calc(100vh_-_var(--header-height,4rem))] border rounded-lg overflow-hidden"> {/* Adjust height calc */}
            {/* Sidebar */}
            <div className="w-full max-w-xs hidden md:flex md:flex-col"> {/* Sidebar hidden on small screens */}
                <ChatRoomList />
            </div>

            {/* Main Chat Area */}
            <div className="flex flex-1 flex-col">
                {selectedRoomId ? (
                    <>
                        {/* TODO: Add Chat Header with room name/participants */}
                        <ChatMessageList />
                        <ChatMessageInput />
                    </>
                ) : (
                    // Show prompt if no room selected (mainly for larger screens)
                    <SelectChatPrompt />
                )}
            </div>
        </div>
    );
};