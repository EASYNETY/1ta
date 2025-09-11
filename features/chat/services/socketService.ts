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
    private isInitializing = false;
    private lastConnectErrorTs: number = 0;
    private lastMaxReconnectLogTs: number = 0;

    initialize(user: any) {
        // Prevent duplicate initialization while an init/connect is already in progress
        if (this.isInitializing || (this.socket && this.socket.connected)) {
            return;
        }

        this.currentUser = user;
        this.isInitializing = true;

        // Disable socket.io built-in reconnection logic to avoid double reconnect loops.
        // We handle reconnection ourselves (exponential backoff + visibility checks).
        this.socket = io(process.env.NEXT_PUBLIC_API_URL || 'https://api.onetechacademy.com', {
            transports: ['websocket', 'polling'],
            withCredentials: true,
            timeout: 20000,
            reconnection: false,
            autoConnect: true,
            forceNew: true,
            query: {
                userId: user.id,
                userName: user.name || user.email,
            }
        });

        this.setupEventListeners();

        // Reconnect when the tab becomes visible to avoid background reconnect storms
        if (typeof window !== 'undefined') {
            const onVisibility = () => {
                if (document.visibilityState === 'visible' && this.socket && !this.socket.connected) {
                    // reset attempts so we can try again when user returns
                    this.reconnectAttempts = 0;
                    this.handleReconnect();
                }
            };
            document.removeEventListener('visibilitychange', onVisibility);
            document.addEventListener('visibilitychange', onVisibility);
        }
    }

    private setupEventListeners() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('🔌 Connected to chat server');
            this.reconnectAttempts = 0;
            store.dispatch(connectionStatusChanged({ status: 'connected', timestamp: Date.now() }));
            
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
            this.isInitializing = false;
            store.dispatch(connectionStatusChanged({ status: 'disconnected', timestamp: Date.now() }));

            // Only attempt reconnect for server-initiated disconnects or network issues
            // and only when page is visible to avoid background storms
            if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'ping timeout') {
                this.handleReconnect();
            }
        });

        this.socket.on('connect_error', (error) => {
            // Throttle connect_error logs to avoid flooding the console
            const now = Date.now();
            if (now - this.lastConnectErrorTs > 10000) { // once every 10s
                console.error('🚨 Connection error:', error?.message || error);
                this.lastConnectErrorTs = now;
            } else {
                // Use debug-level log for repeated errors
                console.debug('🚨 Connection error (throttled):', error?.message || error);
            }

            store.dispatch(connectionStatusChanged({ 
                status: 'error', 
                error: error?.message || String(error),
                timestamp: Date.now() 
            }));

            this.handleReconnect();
        });

        // Chat events
        this.socket.on('newMessage', (message) => {
            console.log('📩 New message received:', message);
            store.dispatch(messageReceived({
                ...message,
                timestamp: message.createdAt || message.timestamp || new Date().toISOString(),
                isDelivered: true,
                deliveredAt: new Date().toISOString()
            }));

            // Auto-mark as delivered if user is online
            this.markMessageAsDelivered(message.id, message.roomId);
        });

        this.socket.on('messageDelivered', (data) => {
            console.log('✅ Message delivered:', data);
            store.dispatch(messageDelivered({
                messageId: data.messageId,
                roomId: data.roomId,
                deliveredAt: data.deliveredAt
            }));
        });

        this.socket.on('messageRead', (data) => {
            console.log('👁️ Message read:', data);
            store.dispatch(messageRead({
                messageId: data.messageId,
                roomId: data.roomId,
                readAt: data.readAt,
                readBy: data.readBy
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
        // Avoid reconnect storms: only try when tab is visible
        if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
            console.debug('🔕 Tab not visible — deferring reconnect until visible');
            return;
        }

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            const now = Date.now();
            // Throttle the max-reconnect log to once per minute
            if (now - this.lastMaxReconnectLogTs > 60000) {
                console.log('🚫 Max reconnect attempts reached');
                this.lastMaxReconnectLogTs = now;
            } else {
                console.debug('🚫 Max reconnect attempts reached (throttled)');
            }
            // dispatch a final failed status so UI can react
            store.dispatch(connectionStatusChanged({ status: 'failed', timestamp: Date.now() }));
            return;
        }

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
        this.reconnectAttempts++;

        console.log(`🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

        this.reconnectTimeout = setTimeout(() => {
            // Make sure socket still exists and isn't already connected
            if (this.socket && !this.socket.connected) {
                try {
                    // mark that we're attempting a connection
                    this.isInitializing = true;
                    this.socket.connect();
                } catch (err) {
                    console.debug('Reconnect attempt failed to call connect():', err);
                    this.isInitializing = false;
                }
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
    sendMessage(roomId: string, content: string, type = 'text', metadata?: any) {
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
                timestamp: new Date().toISOString()
            };

            // Send to server via HTTP API first, then socket will broadcast
            console.log('📤 Sending message via API:', messageData);
            resolve(messageData);
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

    getConnectionStatus() {
        if (!this.socket) return 'disconnected';
        if (this.socket.connected) return 'connected';
        if (this.socket.connecting) return 'connecting';
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
    
    useEffect(() => {
        if (currentUser && !socketService.isConnected()) {
            socketService.initialize(currentUser);
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
