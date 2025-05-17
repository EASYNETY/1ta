"use client";

import { useEffect, useState, useRef, useCallback } from 'react';

// Define the WebSocket connection status type
export type WebSocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// Props for the hook
interface UseExternalScannerSocketProps {
    onBarcodeReceived: (barcode: string) => void;
    isEnabled: boolean;
    serverUrl?: string;
    maxReconnectAttempts?: number;
}

// Return type for the hook
interface UseExternalScannerSocketReturn {
    status: WebSocketStatus;
    reconnect: () => void;
    connectionAttempts: number;
    maxAttempts: number;
}

/**
 * Custom hook for connecting to an external barcode scanner via WebSocket
 * This simplified version just connects to the socket without passing any parameters
 */
export function useExternalScannerSocket({
    onBarcodeReceived,
    isEnabled,
    serverUrl,
    maxReconnectAttempts = 5 // Default to 5 reconnection attempts
}: UseExternalScannerSocketProps): UseExternalScannerSocketReturn {
    // Default to environment variable or fallback URL
    // For development testing, we'll use a more reliable echo server if no specific URL is provided
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';

    // Use environment variable first, then fallback to default
    let wsServerUrl = serverUrl || process.env.NEXT_PUBLIC_WEBSOCKET_URL;

    if (!wsServerUrl) {
        // If no URL is provided, use a public echo server for testing
        // This helps isolate if the issue is with our server or the WebSocket implementation
        wsServerUrl = isSecure
            ? 'wss://echo.websocket.org'
            : 'ws://echo.websocket.org';

        console.log('No WebSocket URL provided, using echo server for testing:', wsServerUrl);
    } else {
        // Ensure the URL has the correct protocol
        if (wsServerUrl.startsWith('http://')) {
            wsServerUrl = wsServerUrl.replace('http://', 'ws://');
        } else if (wsServerUrl.startsWith('https://')) {
            wsServerUrl = wsServerUrl.replace('https://', 'wss://');
        } else if (!wsServerUrl.startsWith('ws://') && !wsServerUrl.startsWith('wss://')) {
            // Add the appropriate protocol if missing
            const protocol = isSecure ? 'wss://' : 'ws://';
            wsServerUrl = `${protocol}${wsServerUrl}`;
        }
    }

    // Log the WebSocket URL when the hook is initialized (helpful for debugging)
    useEffect(() => {
        console.log('WebSocket server URL configured as:', wsServerUrl);

        // Check if the URL is valid
        if (!wsServerUrl.startsWith('ws://') && !wsServerUrl.startsWith('wss://')) {
            console.warn('WebSocket URL may be invalid. It should start with ws:// or wss://');
        }
    }, [wsServerUrl]);

    // Track connection status
    const [status, setStatus] = useState<WebSocketStatus>('disconnected');

    // Track connection attempts for UI display
    const [connectionAttempts, setConnectionAttempts] = useState(0);

    // Store WebSocket instance in a ref to persist across renders
    const socketRef = useRef<WebSocket | null>(null);

    // Track reconnection attempts
    const reconnectAttemptsRef = useRef(0);

    // Track if automatic reconnection is enabled
    const autoReconnectEnabledRef = useRef(true);

    // Cleanup function to close the WebSocket connection
    const cleanupSocket = useCallback(() => {
        if (socketRef.current) {
            // Remove all event listeners to prevent memory leaks
            socketRef.current.onopen = null;
            socketRef.current.onclose = null;
            socketRef.current.onerror = null;
            socketRef.current.onmessage = null;

            // Close the connection if it's still open
            if (socketRef.current.readyState === WebSocket.OPEN ||
                socketRef.current.readyState === WebSocket.CONNECTING) {
                socketRef.current.close();
            }

            socketRef.current = null;
            setStatus('disconnected');
        }
    }, []);

    // Function to establish WebSocket connection
    const connectWebSocket = useCallback(() => {
        // Clean up any existing connection first
        cleanupSocket();

        if (!isEnabled) {
            console.log('WebSocket connection disabled, not connecting');
            return;
        }

        // Check if we've already reached the maximum number of attempts
        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            console.log(`Maximum connection attempts (${maxReconnectAttempts}) already reached`);
            setStatus('error');
            return;
        }

        // Increment connection attempts
        reconnectAttemptsRef.current += 1;
        setConnectionAttempts(reconnectAttemptsRef.current);

        console.log(`Connection attempt ${reconnectAttemptsRef.current} of ${maxReconnectAttempts}`);

        try {
            setStatus('connecting');
            console.log(`Attempting to connect to WebSocket server at ${wsServerUrl}...`);

            // Create WebSocket connection
            let socket: WebSocket;

            try {
                socket = new WebSocket(wsServerUrl);
                socketRef.current = socket;
            } catch (error) {
                console.error('Error creating WebSocket instance:', error);
                setStatus('error');
                return;
            }

            // Set a connection timeout
            const connectionTimeoutId = setTimeout(() => {
                if (socket && (socket.readyState === WebSocket.CONNECTING)) {
                    console.error('WebSocket connection timeout after 10 seconds');
                    try {
                        socket.close();
                    } catch (e) {
                        console.error('Error closing socket after timeout:', e);
                    }
                    setStatus('error');
                }
            }, 10000); // 10 second timeout

            // Connection opened
            socket.onopen = () => {
                clearTimeout(connectionTimeoutId);
                console.log('Connected to external scanner WebSocket server');
                setStatus('connected');
                reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection

                // Send a test message if using echo server
                if (wsServerUrl.includes('echo.websocket.org')) {
                    try {
                        socket.send(JSON.stringify({ type: 'test', message: 'Connection test' }));
                        console.log('Test message sent to echo server');
                    } catch (e) {
                        console.error('Error sending test message:', e);
                    }
                }
            };

            // Connection closed
            socket.onclose = (event) => {
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
                console.log(`WebSocket connection closed: ${event.code} (${codeDescription})${event.reason ? `, Reason: ${event.reason}` : ''}`);

                // If it's an abnormal closure (common when server is not available)
                if (event.code === 1006) {
                    console.log('This usually indicates the server is not available or not accepting WebSocket connections.');
                    console.log('Check if the WebSocket server is running and accessible at:', wsServerUrl);
                }

                setStatus('disconnected');

                // Attempt to reconnect if enabled, not a normal closure, and auto-reconnect is enabled
                if (isEnabled && event.code !== 1000 && autoReconnectEnabledRef.current) {
                    const shouldReconnect = reconnectAttemptsRef.current < maxReconnectAttempts;

                    if (shouldReconnect) {
                        // Calculate exponential backoff delay (1s, 2s, 4s, 8s, 16s, etc.)
                        // but cap it at 30 seconds maximum
                        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 30000);
                        console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);

                        setTimeout(() => {
                            if (isEnabled && autoReconnectEnabledRef.current) {
                                connectWebSocket();
                            }
                        }, delay);
                    } else {
                        console.error(`Maximum reconnection attempts (${maxReconnectAttempts}) reached`);
                        console.log('You may need to check if the WebSocket server is running or if there are network issues.');
                        console.log('Auto-reconnect disabled. User can manually reconnect if needed.');

                        // Disable auto-reconnect after max attempts
                        autoReconnectEnabledRef.current = false;

                        // Set status to error to show the reconnect button
                        setStatus('error');
                    }
                }
            };

            // Connection error
            socket.onerror = () => {
                // The error event doesn't contain detailed information in the browser
                // Just log that an error occurred and set the status
                console.error('WebSocket connection error occurred');
                console.log('WebSocket server URL:', wsServerUrl);

                setStatus('error');

                // The actual error handling will be done in the onclose handler
                // which will be called automatically after an error
            };

            // Listen for messages
            socket.onmessage = (event) => {
                console.log('WebSocket message received:', event.data);

                try {
                    // Handle echo server responses differently
                    if (wsServerUrl.includes('echo.websocket.org')) {
                        console.log('Echo response received:', event.data);
                        // Don't process echo responses as barcodes
                        return;
                    }

                    // Try to parse as JSON
                    let data;
                    try {
                        data = JSON.parse(event.data);
                    } catch (e) {
                        // If not JSON, treat as plain text (might be just the barcode ID)
                        console.log('Received non-JSON message, treating as barcode:', event.data);
                        onBarcodeReceived(event.data);
                        return;
                    }

                    // Check if the message contains a barcode
                    if (data && data.barcodeId) {
                        console.log('Barcode received from external scanner:', data.barcodeId);
                        onBarcodeReceived(data.barcodeId);
                    } else if (data && data.type === 'barcode' && data.value) {
                        // Alternative format
                        console.log('Barcode received in alternative format:', data.value);
                        onBarcodeReceived(data.value);
                    } else {
                        console.log('Received message does not contain recognized barcode format:', data);
                    }
                } catch (error) {
                    console.error('Error processing WebSocket message:', error);
                }
            };
        } catch (error) {
            console.error('Error creating WebSocket connection');
            console.log('WebSocket server URL:', wsServerUrl);

            // Log additional details if available
            if (error instanceof Error) {
                console.error('Error details:', error.message);
            }

            setStatus('error');
        }
    }, [wsServerUrl, isEnabled, onBarcodeReceived, cleanupSocket]);

    // Track if component is mounted to prevent state updates after unmount
    const isMountedRef = useRef(true);

    // Set up mount/unmount tracking
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Connect/disconnect based on isEnabled prop
    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;
        let pingIntervalId: NodeJS.Timeout | null = null;

        const setupConnection = () => {
            if (!isMountedRef.current) return;

            if (isEnabled) {
                console.log('WebSocket connection enabled, connecting...');

                // Reset connection attempts when initially enabling the connection
                reconnectAttemptsRef.current = 0;
                setConnectionAttempts(0);

                // Re-enable auto-reconnect
                autoReconnectEnabledRef.current = true;

                connectWebSocket();

                // Set up a ping interval to keep the connection alive
                // This helps with some servers that might close idle connections
                pingIntervalId = setInterval(() => {
                    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                        try {
                            // Send a ping message
                            if (wsServerUrl.includes('echo.websocket.org')) {
                                socketRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
                            } else {
                                // For our custom server, use a format it understands
                                socketRef.current.send(JSON.stringify({ type: 'ping' }));
                            }
                            console.log('Ping sent to keep WebSocket connection alive');
                        } catch (e) {
                            console.error('Error sending ping:', e);
                        }
                    }
                }, 30000); // Send a ping every 30 seconds
            } else {
                console.log('WebSocket connection disabled, cleaning up');
                cleanupSocket();
            }
        };

        // Add a small delay before connecting to avoid React rendering issues
        timeoutId = setTimeout(setupConnection, 300);

        // Cleanup on unmount or when dependencies change
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            if (pingIntervalId) {
                clearInterval(pingIntervalId);
            }
            cleanupSocket();
        };
    }, [isEnabled, connectWebSocket, cleanupSocket, wsServerUrl]);

    // Manual reconnect function that resets the connection attempts
    const manualReconnect = useCallback(() => {
        console.log('Manual reconnection initiated by user');

        // Reset connection attempts
        reconnectAttemptsRef.current = 0;
        setConnectionAttempts(0);

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
        maxAttempts: maxReconnectAttempts
    };
}
