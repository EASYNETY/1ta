// services/socketService.ts
import { io, Socket } from 'socket.io-client';
import { store } from '@/store';
import { messageReceived, userJoined, userLeft, userTyping, connectionStatusChanged, messageDelivered, messageRead } from '@/features/chat/store/chatSlice';

class SocketService {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private currentUser: any = null;
    private connectedRooms: Set<string> = new Set();
    private typingTimers: Map<string, NodeJS.Timeout> = new Map();

    initialize(user: any) {
        console.log('🔌 SocketService.initialize() called with user:', user?.id);

        if (this.socket?.connected) {
            console.log('🔌 Socket already connected, disconnecting first');
            this.disconnect();
        }

        this.currentUser = user;

        if (!user) {
            console.warn('⚠️ SocketService.initialize() called without user');
            return;
        }

        console.log('🔌 Creating new socket connection for user:', user.id);

        this.socket = io(process.env.NEXT_PUBLIC_API_URL || 'https://api.onetechacademy.com', {
            transports: ['websocket', 'polling'],
            withCredentials: true,
            timeout: 20000,
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            autoConnect: true,
            forceNew: true,
            query: {
                userId: user.id,
                userName: user.name || user.email,
            }
        });

        this.setupEventListeners();
    }

    private setupEventListeners() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('🔌 Connected to chat server');
            this.reconnectAttempts = 0;
            store.dispatch(connectionStatusChanged('connected'));
            
            // Authenticate user
            this.socket!.emit('authenticate', {
                userId: this.currentUser.id,
                userName: this.currentUser.name || this.currentUser.email,
                userEmail: this.currentUser.email,
                userRole: this.currentUser.role
            });

            // Rejoin previously connected rooms
            this.connectedRooms.forEach(roomId => {
                this.joinRoom(roomId);
            });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Disconnected from chat server:', reason);
            store.dispatch(connectionStatusChanged('disconnected'));
            
            if (reason === 'io server disconnect') {
                // Server disconnected, try to reconnect
                this.handleReconnect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('🚨 Connection error:', error);
            store.dispatch(connectionStatusChanged('error'));
            this.handleReconnect();
        });

        // Chat events
        this.socket.on('newMessage', (message) => {
            try {
                console.log('📩 New message received:', message);
                const normalizedMessage = {
                    ...message,
                    timestamp: message.createdAt || message.timestamp || new Date().toISOString(),
                    isDelivered: true,
                    deliveredAt: new Date().toISOString()
                };

                const roomId = normalizedMessage.roomId || normalizedMessage.room || null;
                store.dispatch(messageReceived({ roomId, message: normalizedMessage }));

                // Auto-mark as delivered if user is online
                if (normalizedMessage.senderId) {
                    this.markMessageAsDelivered(normalizedMessage.id, normalizedMessage.roomId);
                }
            } catch (err) {
                console.error('Error handling newMessage in root socketService:', err);
            }
        });

        this.socket.on('messageDelivered', (data) => {
            console.log('✅ Message delivered:', data);
            store.dispatch(messageDelivered({
                messageId: data.messageId,
                roomId: data.roomId
            }));
        });

        this.socket.on('messageRead', (data) => {
            console.log('👁️ Message read:', data);
            store.dispatch(messageRead({
                messageId: data.messageId,
                roomId: data.roomId,
                userId: data.userId
            }));
        });

        this.socket.on('userJoined', (data) => {
            console.log('👋 User joined:', data);
            store.dispatch(userJoined(data));
        });

        this.socket.on('userLeft', (data) => {
            console.log('👋 User left:', data);
            store.dispatch(userLeft(data));
        });

        this.socket.on('userTyping', (data) => {
            console.log('⌨️ User typing:', data);
            if (data.userId !== this.currentUser.id) {
                store.dispatch(userTyping(data));
                
                // Clear typing after 3 seconds
                const key = `${data.roomId}-${data.userId}`;
                if (this.typingTimers.has(key)) {
                    clearTimeout(this.typingTimers.get(key)!);
                }
                
                if (data.isTyping) {
                    const timer = setTimeout(() => {
                        store.dispatch(userTyping({
                            ...data,
                            isTyping: false
                        }));
                        this.typingTimers.delete(key);
                    }, 3000);
                    this.typingTimers.set(key, timer);
                }
            }
        });

        this.socket.on('roomJoined', (data) => {
            console.log('🏠 Joined room:', data);
            this.connectedRooms.add(data.roomId);
        });

        this.socket.on('roomLeft', (data) => {
            console.log('🚪 Left room:', data);
            this.connectedRooms.delete(data.roomId);
        });

        this.socket.on('roomCreated', (data) => {
            console.log('🆕 Room created:', data);
            // Auto-join the new room if current user is a participant
            if (data.room.participants.some((p: any) => p.id === this.currentUser.id)) {
                this.joinRoom(data.room.id);
            }
        });

        this.socket.on('onlineUsers', (users) => {
            console.log('👥 Online users updated:', users);
            // Handle online users update
        });
    }

    private handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('🚫 Max reconnect attempts reached');
            return;
        }

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
        this.reconnectAttempts++;

        console.log(`🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
        
        this.reconnectTimeout = setTimeout(() => {
            if (this.socket && !this.socket.connected) {
                this.socket.connect();
            }
        }, delay);
    }

    // Room Management
    joinRoom(roomId: string) {
        if (this.socket?.connected) {
            console.log('🔗 Joining room:', roomId);
            this.socket.emit('joinRoom', {
                roomId,
                userId: this.currentUser.id,
                userName: this.currentUser.name || this.currentUser.email
            });
            this.connectedRooms.add(roomId);
        }
    }

    leaveRoom(roomId: string) {
        if (this.socket?.connected) {
            console.log('🚪 Leaving room:', roomId);
            this.socket.emit('leaveRoom', {
                roomId,
                userId: this.currentUser.id,
                userName: this.currentUser.name || this.currentUser.email
            });
            this.connectedRooms.delete(roomId);
        }
    }

    // Message Management
    sendMessage(roomId: string, content: string, type = 'text', metadata?: any, tempId?: string) {
        return new Promise((resolve, reject) => {
            if (!this.socket?.connected) {
                reject(new Error('Not connected to chat server'));
                return;
            }

            const messageData = {
                roomId,
                content,
                type,
                metadata,
                senderId: this.currentUser.id,
                senderName: this.currentUser.name || this.currentUser.email,
                timestamp: new Date().toISOString(),
                tempId: tempId || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };

            console.log('📤 Sending message via WebSocket:', messageData);

            // Emit the message via WebSocket
            this.socket.emit('newMessage', messageData, (acknowledgement: any) => {
                if (acknowledgement && acknowledgement.success) {
                    console.log('✅ Message sent successfully via WebSocket:', acknowledgement);
                    resolve(messageData);
                } else {
                    console.error('❌ Message send failed:', acknowledgement);
                    reject(new Error(acknowledgement?.error || 'Failed to send message'));
                }
            });

            // Set a timeout in case no acknowledgement is received
            setTimeout(() => {
                reject(new Error('Message send timeout'));
            }, 10000);
        });
    }

    markMessageAsDelivered(messageId: string, roomId: string) {
        if (this.socket?.connected) {
            this.socket.emit('messageDelivered', {
                messageId,
                roomId,
                userId: this.currentUser.id,
                deliveredAt: new Date().toISOString()
            });
        }
    }

    markMessageAsRead(messageId: string, roomId: string) {
        if (this.socket?.connected) {
            this.socket.emit('messageRead', {
                messageId,
                roomId,
                userId: this.currentUser.id,
                readAt: new Date().toISOString()
            });
        }
    }

    markRoomAsRead(roomId: string) {
        if (this.socket?.connected) {
            this.socket.emit('roomRead', {
                roomId,
                userId: this.currentUser.id,
                readAt: new Date().toISOString()
            });
        }
    }

    // Typing Indicators
    startTyping(roomId: string) {
        if (this.socket?.connected) {
            this.socket.emit('typing', {
                roomId,
                userId: this.currentUser.id,
                userName: this.currentUser.name || this.currentUser.email
            });
        }
    }

    stopTyping(roomId: string) {
        if (this.socket?.connected) {
            this.socket.emit('stopTyping', {
                roomId,
                userId: this.currentUser.id,
                userName: this.currentUser.name || this.currentUser.email
            });
        }
    }

    // Status and presence
    updateUserPresence(status: 'online' | 'away' | 'busy' | 'offline') {
        if (this.socket?.connected) {
            this.socket.emit('presenceUpdate', {
                userId: this.currentUser.id,
                status,
                lastSeen: new Date().toISOString()
            });
        }
    }

    // Utility methods
    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    getIO(): Socket | null {
        console.log('🔍 SocketService.getIO() called', {
            hasSocket: !!this.socket,
            isConnected: this.socket?.connected,
            currentUser: !!this.currentUser,
            socketId: this.socket?.id
        });

        // If socket is not initialized but we have a current user, try to initialize
        if (!this.socket && this.currentUser) {
            console.log('🔄 SocketService.getIO(): Socket not initialized, initializing now...');
            this.initialize(this.currentUser);
        }

        return this.socket;
    }

    getConnectionStatus() {
        if (!this.socket) return 'disconnected';
        if (this.socket.connected) return 'connected';
    // Socket.IO client does not expose a 'connecting' boolean on the Socket type
    // Fallback: if socket exists but not connected, consider it 'connecting'
    if (this.socket && !this.socket.connected) return 'connecting';
        return 'disconnected';
    }

    disconnect() {
        console.log('🔌 Disconnecting from chat server');
        
        // Clear all timers
        this.typingTimers.forEach(timer => clearTimeout(timer));
        this.typingTimers.clear();
        
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        this.connectedRooms.clear();
        
        if (this.socket) {
            this.socket.disconnect();
            this.socket.removeAllListeners();
            this.socket = null;
        }
    }

    // File upload support
    uploadFile(file: File, roomId: string, onProgress?: (progress: number) => void) {
        return new Promise((resolve, reject) => {
            if (!this.socket?.connected) {
                reject(new Error('Not connected to chat server'));
                return;
            }

            // This would typically upload to your file server
            // and then send a message with file metadata
            const reader = new FileReader();
            
            reader.onload = () => {
                const fileData = {
                    roomId,
                    type: file.type.startsWith('image/') ? 'image' : 'file',
                    metadata: {
                        fileName: file.name,
                        fileSize: file.size,
                        fileType: file.type,
                        fileUrl: reader.result as string // In production, upload to cloud storage
                    }
                };
                
                resolve(fileData);
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }
}

// Export singleton instance
export const socketService = new SocketService();

// React hook for using socket service
import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';

export const useSocket = () => {
    const currentUser = useAppSelector(state => state.auth.user);

    console.log('🔍 useSocket hook called', {
        hasCurrentUser: !!currentUser,
        isConnected: socketService.isConnected(),
        currentUserId: currentUser?.id
    });

    useEffect(() => {
        console.log('🔍 useSocket useEffect triggered', {
            hasCurrentUser: !!currentUser,
            isConnected: socketService.isConnected(),
            currentUserId: currentUser?.id
        });

        if (currentUser) {
            // Always ensure socket service is initialized when user is available
            if (!socketService.isConnected()) {
                console.log('🔍 Initializing socket service for user:', currentUser.id);
                socketService.initialize(currentUser);
            } else {
                console.log('🔍 Socket service already connected for user:', currentUser.id);
            }
        }

        return () => {
            // Don't disconnect on unmount as we want persistent connection
            // socketService.disconnect();
        };
    }, [currentUser]);

    return {
        isConnected: socketService.isConnected(),
        connectionStatus: socketService.getConnectionStatus(),
        joinRoom: socketService.joinRoom.bind(socketService),
        leaveRoom: socketService.leaveRoom.bind(socketService),
        sendMessage: socketService.sendMessage.bind(socketService),
        startTyping: socketService.startTyping.bind(socketService),
        stopTyping: socketService.stopTyping.bind(socketService),
        markMessageAsRead: socketService.markMessageAsRead.bind(socketService),
        markRoomAsRead: socketService.markRoomAsRead.bind(socketService),
        uploadFile: socketService.uploadFile.bind(socketService),
        updateUserPresence: socketService.updateUserPresence.bind(socketService)
    };
};