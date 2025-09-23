// services/socketService.ts
import { io, Socket } from 'socket.io-client';
import { store } from '@/store';
import {
    messageReceived,
    userJoined,
    userLeft,
    userTyping,
    connectionStatusChanged,
    messageDelivered,
    messageRead
} from '@/features/chat/store/chatSlice';
import { post } from '@/lib/api-client';

class SocketService {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    private currentUser: any = null;
    private connectedRooms: Set<string> = new Set();
    private typingTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
    private isInitializing = false;
    private lastConnectErrorTs: number = 0;
    private lastMaxReconnectLogTs: number = 0;

    initialize(user: any) {
        if (this.isInitializing || (this.socket && this.socket.connected)) return;

        this.currentUser = user;
        this.isInitializing = true;

        this.socket = io(process.env.NEXT_PUBLIC_API_URL || 'https://api.onetechacademy.com', {
            transports: ['websocket', 'polling'],
            withCredentials: true,
            timeout: 20000,
            reconnection: false,
            autoConnect: true,
            forceNew: true,
            query: {
                userId: user.id,
                userName: user.name || user.email
            }
        });

        this.setupEventListeners();

        if (typeof window !== 'undefined') {
            const onVisibility = () => {
                if (document.visibilityState === 'visible' && this.socket && !this.socket.connected) {
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

        this.socket.on('connect', () => {
            console.log('🔌 Connected to chat server');
            this.reconnectAttempts = 0;
            store.dispatch(connectionStatusChanged('connected'));

            this.socket!.emit('authenticate', {
                userId: this.currentUser.id,
                userName: this.currentUser.name || this.currentUser.email,
                userEmail: this.currentUser.email,
                userRole: this.currentUser.role
            });

            this.connectedRooms.forEach(roomId => this.joinRoom(roomId));
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Disconnected from chat server:', reason);
            this.isInitializing = false;
            store.dispatch(connectionStatusChanged('disconnected'));

            if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'ping timeout') this.handleReconnect();
        });

        this.socket.on('connect_error', (error) => {
            const now = Date.now();
            if (now - this.lastConnectErrorTs > 10000) {
                console.error('🚨 Connection error:', error?.message || error);
                this.lastConnectErrorTs = now;
            } else {
                console.debug('🚨 Connection error (throttled):', error?.message || error);
            }

            store.dispatch(connectionStatusChanged('error'));
            this.handleReconnect();
        });

        // New message
        this.socket.on('newMessage', (message: any) => {
            try {
                console.log('📩 New message received:', message);

                const normalizedMessage = {
                    ...message,
                    timestamp: message.createdAt || message.timestamp || new Date().toISOString(),
                    isDelivered: true,
                    deliveredAt: new Date().toISOString()
                };

                const roomId = (normalizedMessage.roomId || (normalizedMessage.room && normalizedMessage.room.id) || null);
                store.dispatch(messageReceived({ roomId, message: normalizedMessage }));

                if (normalizedMessage.senderId && normalizedMessage.senderId !== this.currentUser.id) {
                    this.markMessageAsDelivered(normalizedMessage.id, normalizedMessage.roomId || roomId);
                }
            } catch (err) {
                console.error('Error handling newMessage socket event:', err);
            }
        });

        // Server acknowledgement for sent messages (used to reconcile optimistic messages)
        this.socket.on('messageAck', (ack: any) => {
            try {
                console.log('📬 Received messageAck from server:', ack);

                const serverMessage = ack.message || null;
                const tempId = ack.tempId || null;

                if (!serverMessage) return;

                const normalizedMessage = {
                    ...serverMessage,
                    timestamp: serverMessage.createdAt || serverMessage.timestamp || new Date().toISOString(),
                };

                const roomId = normalizedMessage.roomId || (normalizedMessage.room && normalizedMessage.room.id) || null;

                // Include tempId so reducer can match optimistic messages and replace them
                if (tempId) {
                    normalizedMessage.tempId = tempId;
                }

                store.dispatch(messageReceived({ roomId, message: normalizedMessage }));
            } catch (err) {
                console.error('Error handling messageAck:', err);
            }
        });

        this.socket.on('messageDelivered', (data: any) => {
            console.log('✅ Message delivered:', data);
            store.dispatch(messageDelivered({ messageId: data.messageId, roomId: data.roomId }));
        });

        this.socket.on('messageRead', (data: any) => {
            console.log('👁️ Message read:', data);
            store.dispatch(messageRead({ messageId: data.messageId, roomId: data.roomId, userId: data.userId }));
        });

        this.socket.on('userJoined', (data: any) => {
            console.log('👋 User joined:', data);
            store.dispatch(userJoined(data));
        });

        this.socket.on('userLeft', (data: any) => {
            console.log('👋 User left:', data);
            store.dispatch(userLeft(data));
        });

        this.socket.on('userTyping', (data: any) => {
            console.log('⌨️ User typing:', data);
            if (data.userId !== this.currentUser.id) {
                store.dispatch(userTyping(data));

                const key = `${data.roomId}-${data.userId}`;
                if (this.typingTimers.has(key)) clearTimeout(this.typingTimers.get(key)!);

                if (data.isTyping) {
                    const timer = setTimeout(() => {
                        store.dispatch(userTyping({ ...data, isTyping: false }));
                        this.typingTimers.delete(key);
                    }, 3000);
                    this.typingTimers.set(key, timer);
                }
            }
        });

        this.socket.on('roomJoined', (data: any) => {
            console.log('🏠 Joined room:', data);
            this.connectedRooms.add(data.roomId);
        });

        this.socket.on('roomLeft', (data: any) => {
            console.log('🚪 Left room:', data);
            this.connectedRooms.delete(data.roomId);
        });

        this.socket.on('roomCreated', (data: any) => {
            console.log('🆕 Room created:', data);
            if (data.room && Array.isArray(data.room.participants) && data.room.participants.some((p: any) => p.id === this.currentUser.id)) {
                this.joinRoom(data.room.id);
            }
        });

        this.socket.on('onlineUsers', (users: any) => {
            console.log('👥 Online users updated:', users);
            // noop for now
        });
    }

    private handleReconnect() {
        if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
            console.debug('🔕 Tab not visible — deferring reconnect until visible');
            return;
        }

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            const now = Date.now();
            if (now - this.lastMaxReconnectLogTs > 60000) {
                console.log('🚫 Max reconnect attempts reached');
                this.lastMaxReconnectLogTs = now;
            }
            store.dispatch(connectionStatusChanged('error'));
            return;
        }

        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout as any);

        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
        this.reconnectAttempts++;
        console.log(`🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

        this.reconnectTimeout = setTimeout(() => {
            if (this.socket && !this.socket.connected) {
                try {
                    this.isInitializing = true;
                    this.socket.connect();
                } catch (err) {
                    console.debug('Reconnect attempt failed to call connect():', err);
                    this.isInitializing = false;
                }
            }
        }, delay) as unknown as ReturnType<typeof setTimeout>;
    }

    joinRoom(roomId: string) {
        if (this.socket?.connected) {
            console.log('🔗 Joining room:', roomId);
            this.socket.emit('joinRoom', { roomId, userId: this.currentUser.id, userName: this.currentUser.name || this.currentUser.email });
            this.connectedRooms.add(roomId);
        }
    }

    leaveRoom(roomId: string) {
        if (this.socket?.connected) {
            console.log('🚪 Leaving room:', roomId);
            this.socket.emit('leaveRoom', { roomId, userId: this.currentUser.id, userName: this.currentUser.name || this.currentUser.email });
            this.connectedRooms.delete(roomId);
        }
    }

    sendMessage(roomId: string, content: string, type = 'text', metadata?: any, tempId?: string) {
        return new Promise<any>(async (resolve, reject) => {
            if (!this.socket?.connected) return reject(new Error('Not connected to chat server'));
            if (!this.currentUser) return reject(new Error('User not authenticated'));

            try {
                const messageData = {
                    roomId,
                    content,
                    type,
                    metadata,
                    senderId: this.currentUser.id,
                    senderName: this.currentUser.name || this.currentUser.email,
                    timestamp: new Date().toISOString(),
                    tempId: tempId || `temp_${Date.now()}_${Math.random()}`
                };

                console.log('📤 Sending message via API:', messageData);

                const response = await post<any>('/chat/messages', messageData);

                if (response && response.id) {
                    console.log('✅ Message sent successfully:', response);
                    this.socket.emit('sendMessage', { ...messageData, id: response.id, tempId: messageData.tempId, createdAt: response.createdAt || response.timestamp });
                    resolve(response);
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (error: any) {
                console.error('💥 Failed to send message:', error);
                reject(error);
            }
        });
    }

    markMessageAsDelivered(messageId: string, roomId: string) {
        if (this.socket?.connected) {
            this.socket.emit('messageDelivered', { messageId, roomId, userId: this.currentUser.id, deliveredAt: new Date().toISOString() });
        }
    }

    markMessageAsRead(messageId: string, roomId: string) {
        if (this.socket?.connected) {
            this.socket.emit('messageRead', { messageId, roomId, userId: this.currentUser.id, readAt: new Date().toISOString() });
        }
    }

    markRoomAsRead(roomId: string) {
        if (this.socket?.connected) {
            this.socket.emit('roomRead', { roomId, userId: this.currentUser.id, readAt: new Date().toISOString() });
        }
    }

    startTyping(roomId: string) {
        if (this.socket?.connected) {
            this.socket.emit('typing', { roomId, userId: this.currentUser.id, userName: this.currentUser.name || this.currentUser.email });
        }
    }

    stopTyping(roomId: string) {
        if (this.socket?.connected) {
            this.socket.emit('stopTyping', { roomId, userId: this.currentUser.id, userName: this.currentUser.name || this.currentUser.email });
        }
    }

    updateUserPresence(status: 'online' | 'away' | 'busy' | 'offline') {
        if (this.socket?.connected) {
            this.socket.emit('presenceUpdate', { userId: this.currentUser.id, status, lastSeen: new Date().toISOString() });
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    getConnectionStatus() {
        if (!this.socket) return 'disconnected';
        if (this.socket.connected) return 'connected';
        return 'connecting';
    }

    disconnect() {
        console.log('🔌 Disconnecting from chat server');
        this.typingTimers.forEach(timer => clearTimeout(timer));
        this.typingTimers.clear();
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout as any);
        this.connectedRooms.clear();
        if (this.socket) {
            this.socket.disconnect();
            this.socket.removeAllListeners();
            this.socket = null;
        }
    }

    uploadFile(file: File, roomId: string, onProgress?: (progress: number) => void) {
        return new Promise((resolve, reject) => {
            if (!this.socket?.connected) return reject(new Error('Not connected to chat server'));
            const reader = new FileReader();
            reader.onload = () => {
                const fileData = {
                    roomId,
                    type: file.type.startsWith('image/') ? 'image' : 'file',
                    metadata: {
                        fileName: file.name,
                        fileSize: file.size,
                        fileType: file.type,
                        fileUrl: reader.result as string
                    }
                };
                resolve(fileData);
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }
}

export const socketService = new SocketService();

import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';

export const useSocket = () => {
    const currentUser = useAppSelector((state: any) => state.auth.user);

    useEffect(() => {
        if (currentUser && !socketService.isConnected()) socketService.initialize(currentUser);
        return () => {
            // keep persistent connection; do not disconnect on unmount
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