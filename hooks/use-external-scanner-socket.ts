"use client";

import { useEffect, useState, useRef, useCallback } from 'react';

// Define the WebSocket connection status type
export type WebSocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// Props for the hook
interface UseExternalScannerSocketProps {
    onBarcodeReceived: (barcode: string) => void;
    isEnabled: boolean;
    classId?: string;
    userId?: string;
    serverUrl?: string;
    casualMode?: boolean; // Flag to indicate casual scan mode (no attendance marking)
}

/**
 * Custom hook for connecting to an external barcode scanner via WebSocket
 */
export function useExternalScannerSocket({
    onBarcodeReceived,
    isEnabled,
    classId,
    userId,
    serverUrl,
    casualMode = false
}: UseExternalScannerSocketProps) {
    // Default to environment variable or fallback URL
    const wsServerUrl = serverUrl || process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001';

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

    // Store WebSocket instance in a ref to persist across renders
    const socketRef = useRef<WebSocket | null>(null);

    // Track reconnection attempts
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 5;

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

        // In casual mode, we only need userId, not classId
        if (!isEnabled || !userId || (!casualMode && !classId)) {
            return;
        }

        try {
            setStatus('connecting');

            // Create WebSocket connection with query parameters
            const queryParams = new URLSearchParams({
                userId,
                ...(classId ? { classId } : {}),
                // No need to pass casualMode to backend as it's handled in frontend
            }).toString();

            const socket = new WebSocket(`${wsServerUrl}?${queryParams}`);
            socketRef.current = socket;

            // Connection opened
            socket.onopen = () => {
                console.log('Connected to external scanner WebSocket server');
                setStatus('connected');
                reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
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

                // Attempt to reconnect if enabled and not a normal closure
                if (isEnabled && event.code !== 1000) {
                    const shouldReconnect = reconnectAttemptsRef.current < maxReconnectAttempts;

                    if (shouldReconnect) {
                        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
                        console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);

                        setTimeout(() => {
                            reconnectAttemptsRef.current += 1;
                            connectWebSocket();
                        }, delay);
                    } else {
                        console.error('Maximum reconnection attempts reached');
                        console.log('You may need to check if the WebSocket server is running or if there are network issues.');
                    }
                }
            };

            // Connection error
            socket.onerror = () => {
                // The error event doesn't contain detailed information in the browser
                // Just log that an error occurred and set the status
                console.error('WebSocket connection error occurred');
                console.log('WebSocket server URL:', wsServerUrl);
                console.log('Connection parameters:', {
                    userId: userId || 'not provided',
                    classId: classId || 'not provided'
                    // casualMode is only used in frontend logic, not sent to backend
                });

                setStatus('error');

                // The actual error handling will be done in the onclose handler
                // which will be called automatically after an error
            };

            // Listen for messages
            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    // Check if the message contains a barcode
                    if (data && data.barcodeId) {
                        console.log('Barcode received from external scanner:', data.barcodeId);
                        onBarcodeReceived(data.barcodeId);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
        } catch (error) {
            console.error('Error creating WebSocket connection');
            console.log('WebSocket server URL:', wsServerUrl);
            console.log('Connection parameters:', {
                userId: userId || 'not provided',
                classId: classId || 'not provided'
                // casualMode is only used in frontend logic, not sent to backend
            });

            // Log additional details if available
            if (error instanceof Error) {
                console.error('Error details:', error.message);
            }

            setStatus('error');
        }
    }, [wsServerUrl, isEnabled, userId, classId, casualMode, onBarcodeReceived, cleanupSocket]);

    // Connect/disconnect based on isEnabled prop
    useEffect(() => {
        // In casual mode, we only need userId, not classId
        if (isEnabled && userId && (casualMode || classId)) {
            connectWebSocket();
        } else {
            cleanupSocket();
        }

        // Cleanup on unmount
        return cleanupSocket;
    }, [isEnabled, userId, classId, casualMode, connectWebSocket, cleanupSocket]);

    // Return the connection status and a manual reconnect function
    return {
        status,
        reconnect: connectWebSocket
    };
}
