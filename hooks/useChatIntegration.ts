// hooks/useChatIntegration.ts - Complete real-time chat integration

import { useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { socketService, useSocket } from '@/services/socketService';
import { 
    selectSelectedRoomId, 
    selectChatRooms,
    connectionStatusChanged,
    messageReceived,
    userJoined,
    userLeft,
    userTyping,
    messageDelivered,
    messageRead
} from '@/features/chat/store/chatSlice';
import { fetchChatRooms } from '@/features/chat/store/chat-thunks';
import { toast } from 'react-hot-toast';

export const useChatIntegration = () => {
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector(state => state.auth.user);
    const selectedRoomId = useAppSelector(selectSelectedRoomId);
    const rooms = useAppSelector(selectChatRooms);
    const socket = useSocket();

    // Initialize socket connection when user is available
    useEffect(() => {
        if (currentUser && !socket.isConnected) {
            console.log('🚀 Initializing chat for user:', currentUser.name || currentUser.email);
            socketService.initialize(currentUser);
        }

        // Cleanup on user logout
        return () => {
            if (!currentUser) {
                console.log('🔌 User logged out, disconnecting chat');
                socketService.disconnect();
            }
        };
    }, [currentUser, socket.isConnected]);

    // Load user's chat rooms when component mounts
    useEffect(() => {
        if (currentUser?.id) {
            console.log('📝 Loading chat rooms for user:', currentUser.id);
            dispatch(fetchChatRooms(currentUser.id));
        }
    }, [currentUser?.id, dispatch]);

    // Setup window visibility detection for better presence
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                socket.updateUserPresence('away');
            } else {
                socket.updateUserPresence('online');
            }
        };

        const handleFocus = () => socket.updateUserPresence('online');
        const handleBlur = () => socket.updateUserPresence('away');

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
        };
    }, [socket]);

    // Handle browser notifications for new messages
    useEffect(() => {
        const requestNotificationPermission = async () => {
            if ('Notification' in window && Notification.permission === 'default') {
                await Notification.requestPermission();
            }
        };

        requestNotificationPermission();
    }, []);

    // Show browser notifications for new messages when app is not focused
    const showNotification = useCallback((message: any) => {
        if (!document.hidden || !('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }

        // Don't notify for own messages
        if (message.senderId === currentUser?.id) return;

        // Find room name
        const room = rooms.find(r => r.id === message.roomId);
        const roomName = room?.name || 'Chat Room';

        const notification = new Notification(`${message.senderName} in ${roomName}`, {
            body: message.content,
            icon: message.sender?.avatarUrl || '/default-avatar.png',
            tag: message.roomId, // Replace previous notification from same room
        });

        notification.onclick = () => {
            window.focus();
            // Could dispatch action to select room here
            notification.close();
        };

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);
    }, [currentUser?.id, rooms]);

    // Listen for new messages and show notifications
    useEffect(() => {
        const unsubscribe = socketService.getIO()?.on('newMessage', (message: any) => {
            showNotification(message);
        });

        return () => unsubscribe?.();
    }, [showNotification]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd/Ctrl + K to search rooms (if you implement search)
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                // Implement room search
                console.log('🔍 Room search shortcut triggered');
            }

            // Escape to clear selection
            if (e.key === 'Escape' && selectedRoomId) {
                // Could clear selection or close modals
                console.log('⏫ Escape pressed in chat');
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedRoomId]);

    return {
        // Connection status
        isConnected: socket.isConnected,
        connectionStatus: socket.connectionStatus,
        
        // Room management
        joinRoom: socket.joinRoom,
        leaveRoom: socket.leaveRoom,
        
        // Message management
        sendMessage: socket.sendMessage,
        markMessageAsRead: socket.markMessageAsRead,
        markRoomAsRead: socket.markRoomAsRead,
        
        // Typing indicators
        startTyping: socket.startTyping,
        stopTyping: socket.stopTyping,
        
        // File uploads
        uploadFile: socket.uploadFile,
        
        // Presence
        updateUserPresence: socket.updateUserPresence,
        
        // Utility functions
        showNotification,
        
        // State
        currentUser,
        selectedRoomId,
        rooms
    };
};

// Helper hook for message operations
export const useMessageOperations = () => {
    const dispatch = useAppDispatch();
    const socket = useSocket();

    const sendTextMessage = useCallback(async (roomId: string, content: string, replyTo?: string) => {
        try {
            await socket.sendMessage(roomId, content, 'text', replyTo ? { parentMessageId: replyTo } : undefined);
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
        }
    }, [socket]);

    const sendFileMessage = useCallback(async (roomId: string, file: File) => {
        try {
            const uploadResult = await socket.uploadFile(file, roomId);
            await socket.sendMessage(roomId, file.name, 'file', uploadResult.metadata);
        } catch (error) {
            console.error('Failed to send file:', error);
            toast.error('Failed to send file');
        }
    }, [socket]);

    const editMessage = useCallback(async (messageId: string, newContent: string) => {
        // Implement message editing
        console.log('✏️ Edit message:', messageId, newContent);
    }, []);

    const deleteMessage = useCallback(async (messageId: string, roomId: string) => {
        try {
            // Call your API to delete message
            const response = await fetch(`/api/chat/messages/${messageId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                toast.success('Message deleted');
            } else {
                throw new Error('Failed to delete message');
            }
        } catch (error) {
            console.error('Failed to delete message:', error);
            toast.error('Failed to delete message');
        }
    }, []);

    const forwardMessage = useCallback(async (message: any, targetRoomIds: string[]) => {
        try {
            for (const roomId of targetRoomIds) {
                await socket.sendMessage(roomId, message.content, message.type, {
                    ...message.metadata,
                    isForwarded: true,
                    forwardedFrom: {
                        roomId: message.roomId,
                        originalSender: message.senderName
                    }
                });
            }
            toast.success(`Message forwarded to ${targetRoomIds.length} chat${targetRoomIds.length > 1 ? 's' : ''}`);
        } catch (error) {
            console.error('Failed to forward message:', error);
            toast.error('Failed to forward message');
        }
    }, [socket]);

    return {
        sendTextMessage,
        sendFileMessage,
        editMessage,
        deleteMessage,
        forwardMessage
    };
};

// Hook for chat UI state management
export const useChatUI = () => {
    const [replyingTo, setReplyingTo] = useState<any>(null);
    const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const startReply = useCallback((message: any) => {
        setReplyingTo(message);
    }, []);

    const cancelReply = useCallback(() => {
        setReplyingTo(null);
    }, []);

    const toggleMessageSelection = useCallback((messageId: string) => {
        setSelectedMessages(prev => 
            prev.includes(messageId) 
                ? prev.filter(id => id !== messageId)
                : [...prev, messageId]
        );
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedMessages([]);
    }, []);

    return {
        // Reply state
        replyingTo,
        startReply,
        cancelReply,
        
        // Selection state
        selectedMessages,
        toggleMessageSelection,
        clearSelection,
        isSelectionMode: selectedMessages.length > 0,
        
        // UI state
        showEmojiPicker,
        setShowEmojiPicker,
        searchQuery,
        setSearchQuery
    };
};

// Hook for chat room operations
export const useChatRoomOperations = () => {
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector(state => state.auth.user);

    const createRoom = useCallback(async (roomData: {
        name: string;
        type: string;
        participantIds: string[];
        description?: string;
    }) => {
        try {
            const response = await fetch('/api/chat/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roomData)
            });

            if (response.ok) {
                const result = await response.json();
                toast.success('Chat room created successfully');
                dispatch(fetchChatRooms(currentUser!.id));
                return result.data;
            } else {
                throw new Error('Failed to create room');
            }
        } catch (error) {
            console.error('Failed to create room:', error);
            toast.error('Failed to create chat room');
            throw error;
        }
    }, [dispatch, currentUser]);

    const updateRoom = useCallback(async (roomId: string, updates: any) => {
        try {
            const response = await fetch(`/api/chat/rooms/${roomId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                toast.success('Room updated successfully');
                dispatch(fetchChatRooms(currentUser!.id));
            } else {
                throw new Error('Failed to update room');
            }
        } catch (error) {
            console.error('Failed to update room:', error);
            toast.error('Failed to update room');
        }
    }, [dispatch, currentUser]);

    const deleteRoom = useCallback(async (roomId: string) => {
        try {
            const response = await fetch(`/api/chat/rooms/${roomId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast.success('Room deleted successfully');
                dispatch(fetchChatRooms(currentUser!.id));
            } else {
                throw new Error('Failed to delete room');
            }
        } catch (error) {
            console.error('Failed to delete room:', error);
            toast.error('Failed to delete room');
        }
    }, [dispatch, currentUser]);

    return {
        createRoom,
        updateRoom,
        deleteRoom
    };
};
