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
import { MessageType, MessageStatus } from '../types/chat-types';
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
    
    // Queue for storing messages that failed to send
    private messageRetryQueue: Map<string, {
        attempts: number;
        maxAttempts: number;
        lastAttempt: number;
        data: any;
        timeout: ReturnType<typeof setTimeout> | null;
    }> = new Map();
    
    private readonly MAX_RETRY_ATTEMPTS = 3;
    private readonly RETRY_DELAY = 2000; // 2 seconds

    private handleIncomingMessage(message: any) {
        try {
            // Only handle messages from others
            if (message.senderId === this.currentUser.id) return;

            // If we're not already in this room, join it
            if (!this.connectedRooms.has(message.roomId)) {
                this.joinRoom(message.roomId);
            }

            // You can add notification sound or browser notification here
            // For example:
            if (typeof window !== 'undefined' && document.visibilityState !== 'visible') {
                // Show browser notification if tab is not visible
                if (Notification.permission === 'granted') {
                    new Notification('New Message', {
                        body: `${message.senderName}: ${message.content}`,
                        icon: '/app-icon.png' // Add your app icon path
                    });
                }
            }
        } catch (err) {
            console.error('Error handling incoming message:', err);
        }
    }

    async initialize(user: any) {
        try {
            // Prevent multiple initialization attempts
            if (this.isInitializing) {
                return;
            }

            // If already connected with same user, don't reinitialize
            if (this.socket?.connected && this.currentUser?.id === user.id) {
                return;
            }

            // Clean up existing socket if any
            if (this.socket) {
                this.socket.removeAllListeners();
                this.socket.disconnect();
                this.socket = null;
            }

            this.currentUser = user;
            this.isInitializing = true;
            store.dispatch(connectionStatusChanged('connecting'));

            // Use the WebSocket URL if available, otherwise derive from API URL
            let wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
            
            if (!wsUrl && process.env.NEXT_PUBLIC_API_BASE_URL) {
                wsUrl = process.env.NEXT_PUBLIC_API_BASE_URL
                    .replace(/^https?/, 'wss')
                    .replace('/api', '');
            }

            if (!wsUrl) {
                wsUrl = typeof window !== 'undefined' && 
                    (window.location.hostname.includes('onetechacademy.com') || 
                     window.location.hostname.includes('1techacademy.com'))
                    ? 'wss://api.onetechacademy.com'
                    : 'ws://localhost:5000';
            }

            // Get authentication token with fallbacks
            const authToken = user.token || 
                (typeof window !== 'undefined' ? 
                    localStorage.getItem('authToken') ||
                    localStorage.getItem('token') ||
                    sessionStorage.getItem('authToken') || 
                    '' : 
                    '');

            if (!authToken) {
                throw new Error('No authentication token available');
            }

            // Configure socket with optimized settings
            this.socket = io(wsUrl, {
                transports: ['websocket'],
                withCredentials: true,
                timeout: 20000, // Increased timeout for stability
                reconnection: true,
                reconnectionAttempts: Infinity, // Keep trying to reconnect
                reconnectionDelay: 2000,
                reconnectionDelayMax: 10000,
                autoConnect: true,
                forceNew: false,
                auth: { token: authToken },
                query: {
                    userId: user.id,
                    userName: user.name || user.email,
                    userRole: user.role || 'user',
                    timestamp: Date.now() // Prevent caching issues
                }
            });

        this.setupEventListeners();
    }

    private setupEventListeners() {
        if (!this.socket) return;

        // Clean up any existing listeners to prevent duplicates
        this.socket.removeAllListeners();

        // Connection events
        this.socket.on('connect', () => {
            this.isInitializing = false;
            this.reconnectAttempts = 0;
            store.dispatch(connectionStatusChanged('connected'));
            
            // Authenticate immediately after connection
            this.socket!.emit('authenticate', {
                userId: this.currentUser.id,
                userName: this.currentUser.name || this.currentUser.email,
                userEmail: this.currentUser.email,
                userRole: this.currentUser.role,
                timestamp: Date.now()
            });

            // Rejoin all rooms after reconnection
            if (this.connectedRooms.size > 0) {
                console.log('Rejoining rooms after reconnect:', Array.from(this.connectedRooms));
                this.connectedRooms.forEach(roomId => this.joinRoom(roomId));
            }
        });

        this.socket.on('disconnect', (reason) => {
            this.isInitializing = false;
            store.dispatch(connectionStatusChanged('disconnected'));

            // Handle different disconnect scenarios
            switch (reason) {
                case 'io server disconnect':
                    // Server forcefully disconnected us, usually due to authentication
                    setTimeout(() => this.initialize(this.currentUser), 5000);
                    break;
                case 'transport close':
                case 'ping timeout':
                    // Network or timeout issues, attempt reconnect
                    this.handleReconnect();
                    break;
                default:
                    // For other cases, let Socket.IO handle reconnection
                    break;
            }
        });

        this.socket.on('connect_error', (error) => {
            const now = Date.now();
            if (now - this.lastConnectErrorTs > 10000) { // Throttle error logging
                this.lastConnectErrorTs = now;
                store.dispatch(connectionStatusChanged('error'));

                // Check for specific error types
                if (error.message?.includes('auth')) {
                    // Authentication error - might need to refresh token
                    this.handleAuthError();
                } else if (error.message?.includes('ECONNREFUSED')) {
                    // Server unreachable - might need to try alternate URL
                    this.handleServerUnreachable();
                }
            }
        });

        this.socket.on('reconnect', (attemptNumber) => {
            this.reconnectAttempts = 0;
            this.isInitializing = false;
            store.dispatch(connectionStatusChanged('connected'));

            // Re-authenticate with fresh timestamp
            this.socket!.emit('authenticate', {
                userId: this.currentUser.id,
                userName: this.currentUser.name || this.currentUser.email,
                userEmail: this.currentUser.email,
                userRole: this.currentUser.role,
                timestamp: Date.now()
            });

            // Rejoin rooms with fresh state
            if (this.connectedRooms.size > 0) {
                const rooms = Array.from(this.connectedRooms);
                this.connectedRooms.clear(); // Clear and rejoin to ensure clean state
                rooms.forEach(roomId => this.joinRoom(roomId));
            }
        });

        // Add ping/pong monitoring
        let lastPingTime = Date.now();
        
        this.socket.on('ping', () => {
            lastPingTime = Date.now();
        });

        // Monitor connection health
        const healthCheck = setInterval(() => {
            if (this.socket?.connected && Date.now() - lastPingTime > 30000) {
                // No ping for 30 seconds, connection might be stale
                this.socket.disconnect();
                this.handleReconnect();
            }
        }, 10000);

        // Clean up health check on disconnect
        this.socket.on('disconnect', () => {
            clearInterval(healthCheck);
        });

        this.socket.on('reconnect_error', (error) => {
            console.error('🚨 Reconnection failed:', error?.message || error);
            store.dispatch(connectionStatusChanged('error'));
        });

        this.socket.on('reconnect_failed', () => {
            console.error('🚨 All reconnection attempts failed');
            store.dispatch(connectionStatusChanged('error'));
        });

        // New message event handler with improved delivery tracking
        this.socket.on('newMessage', (message: any) => {
            try {
                console.log('📩 New message received:', message);
                console.log('🔍 Current store state:', store.getState().chat);
                console.log('🔍 Socket connection status:', this.socket?.connected);
                console.log('🔍 Connected rooms:', Array.from(this.connectedRooms));

                // Ensure we have a valid message object
                if (!message) {
                    console.error('❌ Received empty message');
                    return;
                }

                const roomId = message.roomId || (message.room && message.room.id) || null;
                if (!roomId) {
                    console.error('❌ Invalid message - missing roomId:', message);
                    return;
                }

                // Auto-join room if we're not in it yet
                if (!this.connectedRooms.has(roomId)) {
                    console.log('🔄 Auto-joining room for new message:', roomId);
                    this.joinRoom(roomId);
                }

                // Normalize and enhance message data
                const normalizedMessage = {
                    ...message,
                    id: message.id || message.tempId || `temp_${Date.now()}_${Math.random()}`,
                    roomId: roomId, // Ensure roomId is set
                    timestamp: message.createdAt || message.timestamp || new Date().toISOString(),
                    status: message.status || 'delivered',
                    isDelivered: true,
                    deliveredAt: new Date().toISOString(),
                    // Add sender info if missing
                    senderId: message.senderId || message.userId,
                    senderName: message.senderName || message.userName || 'Unknown User'
                };

                console.log('📨 Processing message:', {
                    id: normalizedMessage.id,
                    roomId: normalizedMessage.roomId,
                    senderId: normalizedMessage.senderId,
                    timestamp: normalizedMessage.timestamp
                });

                // If this is our message being echoed back
                if (normalizedMessage.senderId === this.currentUser.id) {
                    console.log('📨 Message echo received, updating local state:', normalizedMessage.id);
                } else {
                    console.log('📥 Received message from:', normalizedMessage.senderName);
                    // Acknowledge receipt to sender
                    this.markMessageAsDelivered(normalizedMessage.id, roomId);
                    
                    // Play notification sound or show notification if needed
                    this.handleIncomingMessage(normalizedMessage);
                }

                // Force update with complete message object for both sender and receiver
                const messagePayload = {
                    roomId,
                    message: {
                        ...normalizedMessage,
                        isOptimistic: false
                    }
                };
                
                console.log('📤 Dispatching to Redux:', messagePayload);
                store.dispatch(messageReceived(messagePayload));
                
                // Verify the state was updated
                const updatedState = store.getState().chat;
                console.log('📊 Updated Redux state:', {
                    roomMessages: updatedState.messages[roomId]?.length || 0,
                    lastMessage: updatedState.messages[roomId]?.[updatedState.messages[roomId]?.length - 1]
                });
            } catch (err) {
                console.error('Error handling newMessage socket event:', err);
            }
        });

        // Enhanced message acknowledgement handler
        this.socket.on('messageAck', (ack: any) => {
            try {
                console.log('📬 Received messageAck from server:', ack);

                const { message: serverMessage, tempId, error } = ack;

                if (error) {
                    console.error('❌ Server reported message error:', error);
                    // Dispatch error state for the message if needed
                    return;
                }

                if (!serverMessage) {
                    console.warn('⚠️ Received empty messageAck');
                    return;
                }

                const normalizedMessage = {
                    ...serverMessage,
                    timestamp: serverMessage.createdAt || serverMessage.timestamp || new Date().toISOString(),
                    isDelivered: true,
                    deliveredAt: new Date().toISOString()
                };

                // Ensure roomId is available
                const roomId = normalizedMessage.roomId || (normalizedMessage.room && normalizedMessage.room.id);
                if (!roomId) {
                    console.error('❌ Invalid messageAck - missing roomId:', normalizedMessage);
                    return;
                }

                // Include tempId for optimistic update reconciliation
                if (tempId) {
                    normalizedMessage.tempId = tempId;
                    console.log('🔄 Reconciling optimistic message:', tempId);
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
            
            // Verify latest messages after joining
            console.log('🔄 Verifying latest messages for room:', data.roomId);
            const chatState = store.getState().chat;
            const roomMessages = chatState.messages[data.roomId] || [];
            console.log(`📊 Room has ${roomMessages.length} messages after join`);
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
        // Don't attempt reconnect if not in chat page
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/chat')) {
            return;
        }

        // Don't stack reconnection attempts
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        this.reconnectAttempts++;

        this.reconnectTimeout = setTimeout(() => {
            if (!this.socket?.connected) {
                this.initialize(this.currentUser);
            }
        }, delay) as unknown as ReturnType<typeof setTimeout>;
    }

    private handleAuthError() {
        // Clear existing token
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('token');
            sessionStorage.removeItem('authToken');
        }

        // Attempt to refresh token or redirect to login
        if (typeof window !== 'undefined') {
            window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
        }
    }

    private handleServerUnreachable() {
        // If production URL fails, try alternate URLs
        const isProduction = typeof window !== 'undefined' &&
            (window.location.hostname.includes('onetechacademy.com') ||
             window.location.hostname.includes('1techacademy.com'));

        if (isProduction) {
            const alternateUrls = [
                'wss://api2.onetechacademy.com',
                'wss://backup-api.onetechacademy.com',
                'wss://api.onetechacademy.com:443'
            ];

            // Try each URL in sequence
            const tryNextUrl = async (urls: string[]) => {
                if (urls.length === 0) return;

                const url = urls.shift()!;
                try {
                    await fetch(url.replace('wss', 'https') + '/health');
                    // If health check succeeds, reinitialize with this URL
                    this.initialize(this.currentUser);
                } catch {
                    // Try next URL
                    tryNextUrl(urls);
                }
            };

            tryNextUrl([...alternateUrls]);
        }
    }

    joinRoom(roomId: string) {
        if (!roomId) {
            console.error('❌ Attempted to join room with invalid roomId');
            return;
        }

        if (!this.socket) {
            console.log('⚠️ No socket instance when trying to join room:', roomId);
            return;
        }

        if (!this.socket.connected) {
            console.log('⚠️ Socket not connected, queueing room join for:', roomId);
            this.connectedRooms.add(roomId); // Add to set so it auto-joins on connect
            return;
        }

        // Prevent duplicate join if we're already in the process of joining
        if (this.connectedRooms.has(roomId)) {
            console.log('ℹ️ Already joined or joining room:', roomId);
            return;
        }

        console.log('🔗 Joining room:', roomId);
        console.log('⏳ Waiting for message sync...');
        
        // Add to connected rooms set before emitting to prevent race conditions
        this.connectedRooms.add(roomId);
        
        // Join room immediately - no delay needed for real-time messaging
        if (this.socket?.connected) {
            this.socket.emit('joinRoom', {
                roomId,
                userId: this.currentUser.id,
                userName: this.currentUser.name || this.currentUser.email,
                timestamp: new Date().toISOString()
            });
            console.log('✅ Room join completed immediately:', roomId);
        } else {
            console.log('❌ Socket disconnected during join:', roomId);
            this.connectedRooms.delete(roomId);
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
            if (!this.currentUser) return reject(new Error('User not authenticated'));

            // Generate temp ID if not provided
            const messageTemp = tempId || `temp_${Date.now()}_${Math.random()}`;

            // Prepare message data
            const messageData = {
                roomId,
                content,
                type: type as MessageType,
                metadata,
                senderId: this.currentUser.id,
                senderName: this.currentUser.name || this.currentUser.email,
                timestamp: new Date().toISOString(),
                tempId: messageTemp,
                status: MessageStatus.SENDING, // Add status for optimistic UI
                id: messageTemp    // Use tempId as temporary id for optimistic UI
            };

            // Dispatch optimistic update immediately
            store.dispatch(messageReceived({
                roomId,
                message: messageData
            }));

            try {
                console.log('📤 Sending message via API:', messageData);

                // Send via API first for persistence
                const response = await post<any>('/chat/messages', messageData);

                if (response && response.id) {
                    console.log('✅ Message persisted successfully:', response);

                    // Single emit via socket for real-time delivery with all required info
                    if (this.socket?.connected) {
                        console.log('🔍 Socket connection status before emit:', this.socket.connected);
                        console.log('🔍 Connected rooms:', Array.from(this.connectedRooms));
                        
                        const socketMessage = {
                            ...messageData,
                            id: response.id,
                            tempId: messageTemp,
                            createdAt: response.createdAt || response.timestamp,
                            isDelivered: true,
                            deliveredAt: new Date().toISOString()
                        };
                        
                        // Verify we're in the room before sending
                        if (!this.connectedRooms.has(roomId)) {
                            console.log('⚠️ Not in room, joining before send:', roomId);
                            await new Promise<void>((resolve) => {
                                this.joinRoom(roomId);
                                // Wait briefly for room join to complete
                                setTimeout(resolve, 500);
                            });
                        }

                        console.log('📤 Broadcasting message via socket:', socketMessage);
                        this.socket.emit('sendMessage', socketMessage, (ack: any) => {
                            if (!ack || ack.error) {
                                console.warn('⚠️ Socket delivery failed, enqueueing for retry:', messageTemp);
                                this.enqueueForRetry(messageData, messageTemp);
                            } else {
                                console.log('✅ Socket delivery confirmed:', messageTemp);
                            }
                        });
                    } else {
                        console.warn('⚠️ Socket disconnected, enqueueing for retry:', messageTemp);
                        this.enqueueForRetry(messageData, messageTemp);
                    }

                    resolve(response);
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (error: any) {
                console.error('💥 Failed to send message:', error);
                
                // If API call fails but we have socket connection, try socket-only delivery
                if (this.socket?.connected) {
                    console.log('🔄 API failed, attempting socket-only delivery:', messageTemp);
                    this.socket.emit('sendMessage', messageData, (ack: any) => {
                        if (!ack || ack.error) {
                            this.enqueueForRetry(messageData, messageTemp);
                        }
                    });
                } else {
                    // Both API and socket failed, queue for retry
                    this.enqueueForRetry(messageData, messageTemp);
                }
                
                reject(error);
            }
        });
    }

    private async sendMessageViaAPI(roomId: string, content: string, type: string, metadata: any, tempId: string | undefined): Promise<any> {
        const messageTemp = tempId || `temp_${Date.now()}_${Math.random()}`;

        const messageData = {
            roomId,
            content,
            type: type as MessageType,
            metadata,
            senderId: this.currentUser.id,
            senderName: this.currentUser.name || this.currentUser.email,
            timestamp: new Date().toISOString(),
            tempId: messageTemp
        };

        console.log('📤 Sending message via API:', messageData);

        const response = await post<any>('/chat/messages', messageData);

        if (!response || !response.id) {
            console.error('❌ Invalid response from server:', response);
            throw new Error('Invalid response from server');
        }

        console.log('✅ Message persisted successfully:', response);

        // Attempt socket emission if connected
        if (this.socket?.connected) {
            const socketMessage = {
                ...messageData,
                id: response.id,
                tempId: messageTemp,
                createdAt: response.createdAt || response.timestamp,
                isDelivered: true,
                deliveredAt: new Date().toISOString()
            };

            console.log('📤 Broadcasting message via socket:', socketMessage);
            this.socket.emit('sendMessage', socketMessage);
        } else {
            console.warn('⚠️ Socket disconnected, message persisted but real-time delivery delayed');
        }

        return response;
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
            'https://api.onetechacademy.com/socket.io/?EIO=4&transport=polling',
            'https://api.onetechacademy.com:443/socket.io/?EIO=4&transport=polling',
            'http://api.onetechacademy.com:5000/socket.io/?EIO=4&transport=polling'
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

    private enqueueForRetry(messageData: any, tempId: string) {
        if (this.messageRetryQueue.has(tempId)) {
            console.log('📋 Message already in retry queue:', tempId);
            return;
        }

        const entry = {
            attempts: 0,
            maxAttempts: this.MAX_RETRY_ATTEMPTS,
            lastAttempt: Date.now(),
            data: messageData,
            timeout: null
        };

        this.messageRetryQueue.set(tempId, entry);
        this.scheduleRetry(tempId);
    }

    private scheduleRetry(tempId: string) {
        const entry = this.messageRetryQueue.get(tempId);
        if (!entry) return;

        if (entry.attempts >= entry.maxAttempts) {
            console.log('❌ Max retry attempts reached for message:', tempId);
            this.messageRetryQueue.delete(tempId);
            return;
        }

        entry.timeout = setTimeout(async () => {
            try {
                if (!this.socket?.connected) {
                    console.log('📡 Socket not connected, rescheduling retry for:', tempId);
                    this.scheduleRetry(tempId);
                    return;
                }

                entry.attempts++;
                entry.lastAttempt = Date.now();

                console.log(`🔄 Retry attempt ${entry.attempts}/${entry.maxAttempts} for message:`, tempId);
                
                const response = await this.sendMessage(
                    entry.data.roomId,
                    entry.data.content,
                    entry.data.type,
                    entry.data.metadata,
                    tempId
                );

                if (response && response.id) {
                    console.log('✅ Retry successful for message:', tempId);
                    this.messageRetryQueue.delete(tempId);
                } else {
                    console.log('❌ Retry failed, scheduling next attempt for:', tempId);
                    this.scheduleRetry(tempId);
                }
            } catch (error) {
                console.error('❌ Error during retry for message:', tempId, error);
                this.scheduleRetry(tempId);
            }
        }, this.RETRY_DELAY * Math.pow(2, entry.attempts)); // Exponential backoff
    }

    disconnect() {
        console.log('🔌 Disconnecting from chat server');
        this.typingTimers.forEach(timer => clearTimeout(timer));
        this.typingTimers.clear();

        // Clear any retry timers
        this.messageRetryQueue.forEach(entry => {
            if (entry.timeout) clearTimeout(entry.timeout);
        });
        this.messageRetryQueue.clear();

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
    const connectionStatus = useAppSelector((state: any) => state.chat.connectionStatus);

    useEffect(() => {
        let initialized = false;
        
        if (currentUser && !socketService.isConnected() && !initialized) {
            initialized = true;
            socketService.initialize(currentUser).catch(err => {
                console.error('Failed to initialize socket:', err);
                initialized = false;
            });
        }

        return () => {
            // Only clean up if navigating away from chat
            if (window.location.pathname.indexOf('/chat') === -1) {
                socketService.disconnect();
                initialized = false;
            }
        };
    }, [currentUser]);

    // Prevent rapid reconnection attempts
    useEffect(() => {
        let reconnectTimeout: NodeJS.Timeout;
        
        if (connectionStatus === 'disconnected' && currentUser) {
            reconnectTimeout = setTimeout(() => {
                socketService.initialize(currentUser);
            }, 5000); // Wait 5 seconds before reconnecting
        }

        return () => {
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
        };
    }, [connectionStatus, currentUser]);

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