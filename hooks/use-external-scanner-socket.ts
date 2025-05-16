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
                console.log('WebSocket connection closed:', event.code, event.reason);
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
                    }
                }
            };

            // Connection error
            socket.onerror = (error) => {
                console.error('WebSocket connection error:', error);
                setStatus('error');
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
            console.error('Error creating WebSocket connection:', error);
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
