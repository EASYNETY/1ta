// features/chat/components/ChatMessageInput.tsx
import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { Textarea } from '@/components/ui/textarea';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { SendHorizonal, Loader2 } from 'lucide-react';
import { sendChatMessage, selectSelectedRoomId, selectSendMessageStatus } from '../store/chatSlice';

export const ChatMessageInput: React.FC = () => {
    const dispatch = useAppDispatch();
    const [messageContent, setMessageContent] = useState('');
    const selectedRoomId = useAppSelector(selectSelectedRoomId);
    const currentUser = useAppSelector(state => state.auth.user);
    const sendStatus = useAppSelector(selectSendMessageStatus);
    const isLoading = sendStatus === 'loading';

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault(); // Prevent form submission if wrapped in form
        const trimmedContent = messageContent.trim();
        if (!trimmedContent || !selectedRoomId || !currentUser?.id || isLoading) return;

        console.log(`Sending message to room ${selectedRoomId}: ${trimmedContent}`);
        dispatch(sendChatMessage({
            roomId: selectedRoomId,
            senderId: currentUser.id,
            content: trimmedContent,
        }));
        setMessageContent(''); // Clear input after dispatch
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Send on Enter, new line on Shift+Enter
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent default newline
            handleSendMessage();
        }
    };


    return (
        <div className="flex items-center gap-2 border-t p-4 bg-background">
            <Textarea
                placeholder="Type your message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1} // Start with 1 row
                className="flex-1 resize-none min-h-[40px] max-h-[120px] rounded-full px-4 py-2 border-input bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring"
                disabled={!selectedRoomId || isLoading}
            />
            <DyraneButton
                type="button" // Use button type if not in a form
                onClick={handleSendMessage}
                size="icon"
                className="rounded-full h-9 w-9 flex-shrink-0" // Consistent size
                disabled={!selectedRoomId || !messageContent.trim() || isLoading}
                aria-label="Send message"
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <SendHorizonal className="h-4 w-4" />
                )}
            </DyraneButton>
        </div>
    );
};