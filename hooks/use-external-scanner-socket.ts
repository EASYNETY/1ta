"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';

// Define the WebSocket connection status type
export type WebSocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// Props for the hook
interface UseExternalScannerSocketProps {
    onBarcodeReceived: (barcode: string) => void;
    isEnabled: boolean;
    serverUrl?: string;
    maxReconnectAttempts?: number;
    connectionTimeout?: number; // Timeout for initial connection in ms
    pingInterval?: number; // Interval for sending ping messages in ms
    reconnectDelayBase?: number; // Base delay for reconnection in ms
    reconnectDelayMax?: number; // Maximum delay for reconnection in ms
}

// Return type for the hook
interface UseExternalScannerSocketReturn {
    status: WebSocketStatus;
    reconnect: () => void;
    connectionAttempts: number;
    maxAttempts: number;
    maxAttemptsReached: boolean;
}

/**
 * Custom hook for connecting to an external barcode scanner via WebSocket
 * This simplified version just connects to the socket without passing any parameters
 */
export function useExternalScannerSocket({
    onBarcodeReceived,
    isEnabled,
    serverUrl,
    maxReconnectAttempts = 5, // Default to 5 reconnection attempts
    connectionTimeout = 10000, // Default to 10 seconds
    pingInterval = 30000, // Default to 30 seconds
    reconnectDelayBase = 1000, // Default to 1 second
    reconnectDelayMax = 30000 // Default to 30 seconds
}: UseExternalScannerSocketProps): UseExternalScannerSocketReturn {
    // Derive WebSocket URL with proper protocol using useMemo
    const derivedWsServerUrl = useMemo(() => {
        const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
        let url = serverUrl || process.env.NEXT_PUBLIC_WEBSOCKET_URL;

        if (!url) {
            // If no URL is provided, use a public echo server for testing
            url = isSecure ? 'wss://echo.websocket.org' : 'ws://echo.websocket.org';
            console.log('[WebSocket] No URL provided, using echo server for testing:', url);
            return url;
        }

        // Ensure the URL has the correct protocol
        if (url.startsWith('http://')) {
            url = url.replace('http://', 'ws://');
        } else if (url.startsWith('https://')) {
            url = url.replace('https://', 'wss://');
        } else if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
            // Add the appropriate protocol if missing
            const protocol = isSecure ? 'wss://' : 'ws://';
            url = `${protocol}${url}`;
        }

        return url;
    }, [serverUrl]);

    // Log the WebSocket URL when the hook is initialized (helpful for debugging)
    useEffect(() => {
        console.log('[WebSocket] Server URL configured as:', derivedWsServerUrl);

        // Check if the URL is valid
        if (!derivedWsServerUrl.startsWith('ws://') && !derivedWsServerUrl.startsWith('wss://')) {
            console.warn('[WebSocket] URL may be invalid. It should start with ws:// or wss://');
        }
    }, [derivedWsServerUrl]);

    // Track connection status
    const [status, setStatus] = useState<WebSocketStatus>('disconnected');

    // Track connection attempts for UI display
    const [connectionAttempts, setConnectionAttempts] = useState(0);

    // Track if maximum attempts have been reached
    const [maxAttemptsReached, setMaxAttemptsReached] = useState(false);

    // Store WebSocket instance in a ref to persist across renders
    const socketRef = useRef<WebSocket | null>(null);

    // Track reconnection attempts
    const reconnectAttemptsRef = useRef(0);

    // Track if automatic reconnection is enabled
    const autoReconnectEnabledRef = useRef(true);

    // Refs for timeout IDs to ensure they can be cleared
    const connectionTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const pingIntervalIdRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup function to close the WebSocket connection
    // isGracefulShutdown: true when cleanup is intentional (e.g., isEnabled becomes false)
    const cleanupSocket = useCallback((isGracefulShutdown = false) => {
        // Clear all timeouts and intervals
        if (connectionTimeoutIdRef.current) {
            clearTimeout(connectionTimeoutIdRef.current);
            connectionTimeoutIdRef.current = null;
        }

        if (reconnectTimeoutIdRef.current) {
            clearTimeout(reconnectTimeoutIdRef.current);
            reconnectTimeoutIdRef.current = null;
        }

        if (pingIntervalIdRef.current) {
            clearInterval(pingIntervalIdRef.current);
            pingIntervalIdRef.current = null;
        }

        if (socketRef.current) {
            console.log(`[WebSocket] Cleaning up socket connection (graceful: ${isGracefulShutdown})`);

            // If this is a graceful shutdown, disable auto-reconnect
            // This prevents the onclose handler from triggering a reconnect
            if (isGracefulShutdown) {
                autoReconnectEnabledRef.current = false;
            }

            // Remove all event listeners to prevent memory leaks
            socketRef.current.onopen = null;
            socketRef.current.onclose = null;
            socketRef.current.onerror = null;
            socketRef.current.onmessage = null;

            // Close the connection if it's still open
            if (socketRef.current.readyState === WebSocket.OPEN ||
                socketRef.current.readyState === WebSocket.CONNECTING) {
                try {
                    // Use code 1000 (Normal Closure) for graceful shutdowns
                    socketRef.current.close(isGracefulShutdown ? 1000 : undefined);
                } catch (e) {
                    console.error('[WebSocket] Error closing socket:', e);
                }
            }

            socketRef.current = null;

            if (isGracefulShutdown) {
                setStatus('disconnected');
            }
        }
    }, []);

    // Function to establish WebSocket connection
    const connectWebSocket = useCallback(() => {
        // Clean up any existing connection first with graceful=true to prevent auto-reconnect
        cleanupSocket(true);

        if (!isEnabled) {
            console.log('[WebSocket] Connection disabled, not connecting');
            return;
        }

        // Re-enable auto-reconnect for this new connection attempt
        autoReconnectEnabledRef.current = true;

        // Check if we've already reached the maximum number of attempts
        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            console.log(`[WebSocket] Maximum connection attempts (${maxReconnectAttempts}) already reached`);
            setStatus('error');
            setMaxAttemptsReached(true);
            return;
        }

        // Increment connection attempts
        reconnectAttemptsRef.current += 1;
        setConnectionAttempts(reconnectAttemptsRef.current);

        console.log(`[WebSocket] Connection attempt ${reconnectAttemptsRef.current} of ${maxReconnectAttempts}`);

        try {
            setStatus('connecting');
            console.log(`[WebSocket] Attempting to connect to server at ${derivedWsServerUrl}...`);

            // Create WebSocket connection
            let socket: WebSocket;

            try {
                socket = new WebSocket(derivedWsServerUrl);
                socketRef.current = socket;
            } catch (error) {
                console.error('[WebSocket] Error creating instance:', error);
                setStatus('error');
                setMaxAttemptsReached(reconnectAttemptsRef.current >= maxReconnectAttempts);
                return;
            }

            // Set a connection timeout
            connectionTimeoutIdRef.current = setTimeout(() => {
                if (socket && (socket.readyState === WebSocket.CONNECTING)) {
                    console.error(`[WebSocket] Connection timeout after ${connectionTimeout}ms`);
                    try {
                        socket.close();
                    } catch (e) {
                        console.error('[WebSocket] Error closing socket after timeout:', e);
                    }
                    setStatus('error');

                    // Check if we've reached max attempts
                    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
                        setMaxAttemptsReached(true);
                    }
                }
            }, connectionTimeout);

            // Connection opened
            socket.onopen = () => {
                // Make sure this is for the current socket
                if (socketRef.current !== socket) return;

                // Clear the connection timeout
                if (connectionTimeoutIdRef.current) {
                    clearTimeout(connectionTimeoutIdRef.current);
                    connectionTimeoutIdRef.current = null;
                }

                console.log('[WebSocket] Connected to external scanner server');
                setStatus('connected');
                setMaxAttemptsReached(false);
                reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection

                // Send a test message if using echo server
                if (derivedWsServerUrl.includes('echo.websocket.org')) {
                    try {
                        socket.send(JSON.stringify({ type: 'test', message: 'Connection test' }));
                        console.log('[WebSocket] Test message sent to echo server');
                    } catch (e) {
                        console.error('[WebSocket] Error sending test message:', e);
                    }
                }

                // Set up ping interval to keep connection alive
                pingIntervalIdRef.current = setInterval(() => {
                    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                        try {
                            // Send a ping message
                            if (derivedWsServerUrl.includes('echo.websocket.org')) {
                                socketRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
                            } else {
                                // For our custom server, use a format it understands
                                socketRef.current.send(JSON.stringify({ type: 'ping' }));
                            }
                            console.log('[WebSocket] Ping sent to keep connection alive');
                        } catch (e) {
                            console.error('[WebSocket] Error sending ping:', e);
                        }
                    }
                }, pingInterval);
            };

            // Connection closed
            socket.onclose = (event) => {
                // Make sure this is for the current socket
                if (socketRef.current !== socket) return;

                // Clear any pending timeouts
                if (connectionTimeoutIdRef.current) {
                    clearTimeout(connectionTimeoutIdRef.current);
                    connectionTimeoutIdRef.current = null;
                }

                if (pingIntervalIdRef.current) {
                    clearInterval(pingIntervalIdRef.current);
                    pingIntervalIdRef.current = null;
                }

                // Log closure details with more context
                const closeCodes = {
                    1000: 'Normal Closure',
                    1001: 'Going Away',
                    1002: 'Protocol Error',
                    1003: 'Unsupported Data',
                    1005: 'No Status Received',
                    1006: 'Abnormal Closure',
                    1007: 'Invalid frame payload data',
                    1008: 'Policy Violation',
                    1009: 'Message too big',
                    1010: 'Missing Extension',
                    1011: 'Internal Error',
                    1012: 'Service Restart',
                    1013: 'Try Again Later',
                    1014: 'Bad Gateway',
                    1015: 'TLS Handshake'
                };

                const codeDescription = closeCodes[event.code as keyof typeof closeCodes] || 'Unknown';
                console.log(`[WebSocket] Connection closed: ${event.code} (${codeDescription})${event.reason ? `, Reason: ${event.reason}` : ''}`);

                // If it's an abnormal closure (common when server is not available)
                if (event.code === 1006) {
                    console.log('[WebSocket] This usually indicates the server is not available or not accepting connections.');
                    console.log('[WebSocket] Check if the server is running and accessible at:', derivedWsServerUrl);
                }

                setStatus('disconnected');

                // Don't attempt to reconnect if:
                // 1. Auto-reconnect is disabled (e.g., after cleanupSocket(true))
                // 2. isEnabled is false (component is being unmounted or disabled)
                // 3. It's a normal closure (code 1000)
                if (!autoReconnectEnabledRef.current || !isEnabled || event.code === 1000) {
                    console.log('[WebSocket] Not attempting to reconnect due to:',
                        !autoReconnectEnabledRef.current ? 'auto-reconnect disabled' :
                        !isEnabled ? 'connection disabled' :
                        'normal closure');
                    return;
                }

                // Check if we should reconnect
                const shouldReconnect = reconnectAttemptsRef.current < maxReconnectAttempts;

                if (shouldReconnect) {
                    // Calculate exponential backoff delay (1s, 2s, 4s, 8s, 16s, etc.)
                    // but cap it at the maximum delay
                    const delay = Math.min(reconnectDelayBase * Math.pow(2, reconnectAttemptsRef.current - 1), reconnectDelayMax);
                    console.log(`[WebSocket] Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);

                    // Store the timeout ID so it can be cleared if needed
                    reconnectTimeoutIdRef.current = setTimeout(() => {
                        // Double-check isEnabled and autoReconnectEnabledRef before reconnecting
                        if (isEnabled && autoReconnectEnabledRef.current) {
                            connectWebSocket();
                        }
                    }, delay);
                } else {
                    console.error(`[WebSocket] Maximum reconnection attempts (${maxReconnectAttempts}) reached`);
                    console.log('[WebSocket] You may need to check if the server is running or if there are network issues.');
                    console.log('[WebSocket] Auto-reconnect disabled. User can manually reconnect if needed.');

                    // Disable auto-reconnect after max attempts
                    autoReconnectEnabledRef.current = false;

                    // Set status to error and mark max attempts reached
                    setStatus('error');
                    setMaxAttemptsReached(true);
                }
            };

            // Connection error
            socket.onerror = () => {
                // Make sure this is for the current socket
                if (socketRef.current !== socket) return;

                // The error event doesn't contain detailed information in the browser
                // Just log that an error occurred and set the status
                console.error('[WebSocket] Connection error occurred');
                console.log('[WebSocket] Server URL:', derivedWsServerUrl);

                // Set status to error immediately (onclose will usually follow)
                setStatus('error');

                // Check if we've reached max attempts
                if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
                    setMaxAttemptsReached(true);
                }

                // The actual error handling will be done in the onclose handler
                // which will be called automatically after an error
                console.log('[WebSocket] Waiting for onclose event with more details...');
            };

            // Listen for messages
            socket.onmessage = (event) => {
                // Make sure this is for the current socket
                if (socketRef.current !== socket) return;

                // Check if the data is binary
                if (typeof event.data !== 'string') {
                    console.warn('[WebSocket] Received binary data, not supported:', event.data);
                    return;
                }

                console.log('[WebSocket] Message received:', event.data.substring(0, 100) + (event.data.length > 100 ? '...' : ''));

                try {
                    // Handle echo server responses differently
                    if (derivedWsServerUrl.includes('echo.websocket.org')) {
                        console.log('[WebSocket] Echo response received:', event.data);
                        // Don't process echo responses as barcodes
                        return;
                    }

                    // Try to parse as JSON
                    let data;
                    try {
                        data = JSON.parse(event.data);
                    } catch (e) {
                        // If not JSON, treat as plain text (might be just the barcode ID)
                        console.log('[WebSocket] Received non-JSON message, treating as barcode:', event.data);
                        onBarcodeReceived(event.data);
                        return;
                    }

                    // Check if the message contains a barcode
                    if (data && data.barcodeId) {
                        console.log('[WebSocket] Barcode received from external scanner:', data.barcodeId);
                        onBarcodeReceived(data.barcodeId);
                    } else if (data && data.type === 'barcode' && data.value) {
                        // Alternative format
                        console.log('[WebSocket] Barcode received in alternative format:', data.value);
                        onBarcodeReceived(data.value);
                    } else if (data && data.type === 'pong') {
                        // Server responded to our ping
                        console.log('[WebSocket] Received pong from server');
                    } else {
                        console.log('[WebSocket] Received message does not contain recognized barcode format:', data);
                    }
                } catch (error) {
                    console.error('[WebSocket] Error processing message:', error);
                }
            };
        } catch (error) {
            console.error('[WebSocket] Error creating connection');
            console.log('[WebSocket] Server URL:', derivedWsServerUrl);

            // Log additional details if available
            if (error instanceof Error) {
                console.error('[WebSocket] Error details:', error.message);
            }

            setStatus('error');
            setMaxAttemptsReached(reconnectAttemptsRef.current >= maxReconnectAttempts);
        }
    }, [derivedWsServerUrl, isEnabled, onBarcodeReceived, cleanupSocket, connectionTimeout, reconnectDelayBase, reconnectDelayMax, maxReconnectAttempts, pingInterval]);

    // Connect/disconnect based on isEnabled prop
    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;

        if (isEnabled) {
            console.log('[WebSocket] Connection enabled, connecting...');

            // Reset connection attempts when initially enabling the connection
            reconnectAttemptsRef.current = 0;
            setConnectionAttempts(0);
            setMaxAttemptsReached(false);

            // Re-enable auto-reconnect
            autoReconnectEnabledRef.current = true;

            // Add a small delay before connecting to avoid React rendering issues
            timeoutId = setTimeout(() => {
                // Double-check isEnabled in case it changed during the timeout
                if (isEnabled) {
                    connectWebSocket();
                }
            }, 100);
        } else {
            console.log('[WebSocket] Connection disabled, cleaning up');
            setStatus('disconnected');
            cleanupSocket(true); // Graceful shutdown
        }

        // Cleanup on unmount or when dependencies change
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }

            // Always clean up with graceful=true on unmount
            cleanupSocket(true);
        };
    }, [isEnabled, connectWebSocket, cleanupSocket, derivedWsServerUrl]);

    // Manual reconnect function that resets the connection attempts
    const manualReconnect = useCallback(() => {
        console.log('[WebSocket] Manual reconnection initiated by user');

        // Reset connection attempts
        reconnectAttemptsRef.current = 0;
        setConnectionAttempts(0);

        // Reset max attempts reached flag
        setMaxAttemptsReached(false);

        // Re-enable auto-reconnect
        autoReconnectEnabledRef.current = true;

        // Connect
        connectWebSocket();
    }, [connectWebSocket]);

    // Return the connection status, attempts, and reconnect function
    return {
        status,
        reconnect: manualReconnect,
        connectionAttempts, // Use the state variable instead of the ref
        maxAttempts: maxReconnectAttempts,
        maxAttemptsReached // Include the maxAttemptsReached flag
    };
}
