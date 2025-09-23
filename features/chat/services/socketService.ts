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

    async initialize(user: any) {
        if (this.isInitializing || (this.socket && this.socket.connected)) {
            console.log('🔄 Socket already initialized or initializing, skipping...');
            return;
        }

        this.currentUser = user;
        this.isInitializing = true;

        console.log('🚀 Initializing socket connection for user:', user.id, 'to:', process.env.NEXT_PUBLIC_API_URL || 'https://api.onetechacademy.com');
        // Use the same domain as the API but with WebSocket protocol
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://api.onetechacademy.com:5000';
        const wsUrl = apiUrl.replace(/^https?/, 'ws'); // Convert http/https to ws/wss

        console.log('🔌 Attempting WebSocket connection to:', wsUrl);

        // Detect environment properly - check if we're on the production domain
        const isProduction = typeof window !== 'undefined' &&
            (window.location.hostname.includes('onetechacademy.com') ||
             window.location.hostname.includes('1techacademy.com'));

        const wsUrls = isProduction
            ? ['ws://api.onetechacademy.com:5000', 'wss://api.onetechacademy.com:5000', 'ws://localhost:3000', 'ws://127.0.0.1:3000'] // Try HTTP first (working), then HTTPS
            : ['ws://localhost:3000', 'ws://localhost:8080', 'ws://127.0.0.1:3000', 'ws://api.onetechacademy.com:5000']; // Try localhost first in dev

        console.log('🔌 WebSocket URLs to try:', wsUrls);
        console.log('🔍 Environment check - isProduction:', isProduction);
        console.log('🔍 Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'SSR');
        console.log('🔍 Current location:', typeof window !== 'undefined' ? window.location.href : 'SSR');
        console.log('🔍 Production URL:', wsUrl);

        // Test if production WebSocket server is running
        if (isProduction) {
            const isProductionServerRunning = await this.testProductionWebSocketServer();
            if (!isProductionServerRunning) {
                console.log('⚠️ Production WebSocket server is not accessible');
                console.log('💡 Real-time messaging will not work until the server is deployed');
            }
        }

        // Get authentication token from various sources
        const getAuthToken = () => {
            if (user.token) return user.token;
            if (typeof window !== 'undefined') {
                return localStorage.getItem('authToken') ||
                       localStorage.getItem('token') ||
                       sessionStorage.getItem('authToken') ||
                       '';
            }
            return '';
        };

        const authToken = getAuthToken();
        console.log('🔐 WebSocket auth token:', authToken ? 'Present (' + authToken.substring(0, 10) + '...)' : 'Missing');

        this.socket = io(wsUrls[0], {
            transports: ['websocket', 'polling'],
            withCredentials: true,
            timeout: 5000, // Reduced timeout for faster failure detection
            reconnection: true, // Enable automatic reconnection
            reconnectionAttempts: 3, // Reduced attempts to fail faster
            reconnectionDelay: 1000,
            reconnectionDelayMax: 3000,
            randomizationFactor: 0.5,
            autoConnect: true,
            forceNew: false, // Don't force new connection to allow reconnection
            auth: {
                token: authToken
            },
            query: {
                userId: user.id,
                userName: user.name || user.email,
                userRole: user.role || 'user'
            }
        });

        // Test WebSocket connection immediately
        this.testWebSocketConnection(wsUrls);

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
            console.log('🔌 Connected to chat server successfully!');
            this.reconnectAttempts = 0;
            store.dispatch(connectionStatusChanged('connected'));
            console.log('📡 Socket connection status updated to: connected');

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
            console.log('🔍 Disconnect reason:', reason, 'Socket was connected:', this.socket?.connected);
            this.isInitializing = false;
            store.dispatch(connectionStatusChanged('disconnected'));
            console.log('📡 Socket connection status updated to: disconnected');

            if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'ping timeout') this.handleReconnect();
        });

        this.socket.on('connect_error', (error) => {
            const now = Date.now();
            if (now - this.lastConnectErrorTs > 5000) { // Reduced throttling for better visibility
                console.error('🚨 Connection error:', error?.message || error);
                console.error('🔍 Connection error details:', {
                    name: error?.name,
                    message: error?.message,
                    stack: error?.stack
                });
                this.lastConnectErrorTs = now;
            } else {
                console.debug('🚨 Connection error (throttled):', error?.message || error);
            }

            store.dispatch(connectionStatusChanged('error'));
            // Don't call handleReconnect here - let Socket.IO handle it automatically
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('🔄 Reconnected to chat server after', attemptNumber, 'attempts');
            this.reconnectAttempts = 0;
            store.dispatch(connectionStatusChanged('connected'));
            console.log('📡 Socket connection status updated to: connected');

            // Re-authenticate and rejoin rooms
            this.socket!.emit('authenticate', {
                userId: this.currentUser.id,
                userName: this.currentUser.name || this.currentUser.email,
                userEmail: this.currentUser.email,
                userRole: this.currentUser.role
            });

            this.connectedRooms.forEach(roomId => this.joinRoom(roomId));
        });

        this.socket.on('reconnect_error', (error) => {
            console.error('🚨 Reconnection failed:', error?.message || error);
            store.dispatch(connectionStatusChanged('error'));
        });

        this.socket.on('reconnect_failed', () => {
            console.error('🚨 All reconnection attempts failed');
            store.dispatch(connectionStatusChanged('error'));
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
            if (!roomId) return reject(new Error('Room ID is required'));

            if (!this.socket?.connected) {
                console.warn('⚠️ Socket not connected, attempting to send via API only');
                return this.sendMessageViaAPI(roomId, content, type, metadata, tempId, resolve, reject);
            }

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

                console.log('📤 Sending message via API and socket:', messageData);

                // Send via API first for persistence
                const response = await post<any>('/chat/messages', messageData);

                if (response && response.id) {
                    console.log('✅ Message sent successfully:', response);

                    // Emit via socket for real-time delivery
                    const socketMessage = {
                        ...messageData,
                        id: response.id,
                        tempId: messageData.tempId,
                        createdAt: response.createdAt || response.timestamp
                    };

                    this.socket.emit('sendMessage', socketMessage);

                    // Also emit to room for guaranteed delivery
                    this.socket.emit('sendMessage', {
                        ...socketMessage,
                        isDelivered: true,
                        deliveredAt: new Date().toISOString()
                    });

                    resolve(response);
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (error: any) {
                console.error('💥 Failed to send message:', error);

                // If socket send fails, try API-only fallback
                if (this.socket?.connected) {
                    console.log('🔄 Attempting API-only fallback for message delivery');
                    return this.sendMessageViaAPI(roomId!, content, type, metadata, tempId, resolve, reject);
                }

                reject(error);
            }
        });
    }

    private async sendMessageViaAPI(roomId: string, content: string, type: string, metadata: any, tempId: string | undefined, resolve: Function, reject: Function) {
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

            console.log('📤 Sending message via API only (fallback):', messageData);

            const response = await post<any>('/chat/messages', messageData);

            if (response && response.id) {
                console.log('✅ Message sent via API fallback:', response);

                // Try to emit via socket if connected now
                if (this.socket?.connected) {
                    this.socket.emit('sendMessage', {
                        ...messageData,
                        id: response.id,
                        tempId: messageData.tempId,
                        createdAt: response.createdAt || response.timestamp
                    });
                }

                resolve(response);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error: any) {
            console.error('💥 API fallback also failed:', error);
            reject(error);
        }
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

    private async testWebSocketConnection(urls: string[]) {
        console.log('🧪 Testing WebSocket connections...');

        for (const url of urls) {
            try {
                console.log(`🧪 Testing connection to: ${url}`);

                // For Socket.IO, we need to test the Socket.IO endpoint
                const socketIoUrl = url.replace(/\/$/, '') + '/socket.io/?EIO=4&transport=polling';

                console.log(`🧪 Testing Socket.IO endpoint: ${socketIoUrl}`);

                // Try to fetch the Socket.IO endpoint to see if it's accessible
                const response = await fetch(socketIoUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'User-Agent': 'Mozilla/5.0 (compatible; WebSocketTest/1.0)'
                    }
                });

                if (response.ok) {
                    console.log(`✅ WebSocket endpoint ${url} is accessible (HTTP ${response.status})`);
                    console.log(`✅ Socket.IO endpoint responded:`, await response.text());
                    break;
                } else {
                    console.log(`❌ WebSocket endpoint ${url} returned HTTP ${response.status}`);
                }
            } catch (error) {
                console.log(`❌ Cannot reach WebSocket endpoint ${url}:`, error);
            }
        }
    }

    private async testProductionWebSocketServer() {
        console.log('🔍 Testing production WebSocket server...');

        // Test if the production WebSocket server is actually running
        const productionUrls = [
            'http://api.onetechacademy.com:5000/socket.io/?EIO=4&transport=polling',
            'https://api.onetechacademy.com:5000/socket.io/?EIO=4&transport=polling',
            'https://api.onetechacademy.com:443/socket.io/?EIO=4&transport=polling',
            'https://api.onetechacademy.com:8080/socket.io/?EIO=4&transport=polling'
        ];

        for (const url of productionUrls) {
            try {
                console.log(`🔍 Testing production endpoint: ${url}`);

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'User-Agent': 'Mozilla/5.0 (compatible; WebSocketTest/1.0)'
                    }
                });

                if (response.ok) {
                    console.log(`✅ Production WebSocket server is RUNNING at ${url}`);
                    console.log(`✅ Response:`, await response.text());
                    return true;
                } else {
                    console.log(`❌ Production endpoint ${url} returned HTTP ${response.status}`);
                }
            } catch (error) {
                console.log(`❌ Cannot reach production endpoint ${url}:`, error);
            }
        }

        console.log('❌ Production WebSocket server is NOT running or not accessible');
        console.log('💡 This explains why real-time messages are not working');
        return false;
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
        if (currentUser && !socketService.isConnected()) {
            socketService.initialize(currentUser);
        }
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