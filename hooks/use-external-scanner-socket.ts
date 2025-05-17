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
    pingInterval?: number;      // Interval for sending ping messages in ms
    reconnectDelayBase?: number;// Base delay for reconnection in ms
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
 * Custom hook for connecting to an external barcode scanner via WebSocket.
 */
export function useExternalScannerSocket({
    onBarcodeReceived,
    isEnabled,
    serverUrl,
    maxReconnectAttempts = 5,
    connectionTimeout = 10000,
    pingInterval = 30000,
    reconnectDelayBase = 1000,
    reconnectDelayMax = 30000
}: UseExternalScannerSocketProps): UseExternalScannerSocketReturn {
    const derivedWsServerUrl = useMemo(() => {
        const isClient = typeof window !== 'undefined';
        const isSecure = isClient && window.location.protocol === 'https:';
        let url = serverUrl || process.env.NEXT_PUBLIC_WEBSOCKET_URL;

        if (!url) {
            url = isSecure ? 'wss://echo.websocket.org' : 'ws://echo.websocket.org';
            console.log('[WebSocket] No URL provided, using echo server for testing:', url);
        } else {
            if (url.startsWith('http://')) {
                url = url.replace('http://', 'ws://');
            } else if (url.startsWith('https://')) {
                url = url.replace('https://', 'wss://');
            } else if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
                const protocol = isSecure ? 'wss://' : 'ws://';
                url = `${protocol}${url}`;
            }
        }
        return url;
    }, [serverUrl]);

    useEffect(() => {
        console.log('[WebSocket] Server URL configured as:', derivedWsServerUrl);
        if (!derivedWsServerUrl.startsWith('ws://') && !derivedWsServerUrl.startsWith('wss://')) {
            console.warn('[WebSocket] URL may be invalid. It should start with ws:// or wss://');
        }
    }, [derivedWsServerUrl]);

    const [status, setStatus] = useState<WebSocketStatus>('disconnected');
    const [currentConnectionAttempts, setCurrentConnectionAttempts] = useState(0);
    const [maxAttemptsReached, setMaxAttemptsReached] = useState(false);

    const socketRef = useRef<WebSocket | null>(null);
    const reconnectAttemptsInternalRef = useRef(0); // Tracks attempts for the current reconnection cycle
    const autoReconnectEnabledRef = useRef(true);

    const connectionTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const pingIntervalIdRef = useRef<NodeJS.Timeout | null>(null);


    const cleanupSocket = useCallback((isGracefulShutdown = false) => {
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
            console.log(`[WebSocket] Cleaning up socket (graceful: ${isGracefulShutdown})`);
            if (isGracefulShutdown) {
                autoReconnectEnabledRef.current = false; // Prevent onclose from auto-reconnecting
            }

            socketRef.current.onopen = null;
            socketRef.current.onmessage = null;
            socketRef.current.onerror = null;
            socketRef.current.onclose = null;

            if (socketRef.current.readyState === WebSocket.OPEN ||
                socketRef.current.readyState === WebSocket.CONNECTING) {
                try {
                    socketRef.current.close(isGracefulShutdown ? 1000 : undefined, "Client initiated disconnect");
                } catch (e) {
                    console.warn('[WebSocket] Error closing socket during cleanup:', e);
                }
            }
            socketRef.current = null;
        }
        // Set status to disconnected if this cleanup is intentional (graceful)
        // or if the status isn't already trying to connect via a new attempt.
        if (isGracefulShutdown) {
            setStatus('disconnected');
        }
    }, []);


    const connectWebSocket = useCallback(() => {
        cleanupSocket(true); // Gracefully cleanup old socket and disable its auto-reconnect
        autoReconnectEnabledRef.current = true; // Enable auto-reconnect for this new sequence

        if (!isEnabled) {
            console.log('[WebSocket] Connection disabled, not connecting.');
            setStatus('disconnected');
            return;
        }

        if (reconnectAttemptsInternalRef.current >= maxReconnectAttempts) {
            console.error(`[WebSocket] Max reconnection attempts (${maxReconnectAttempts}) reached prior to new attempt.`);
            setStatus('error');
            setMaxAttemptsReached(true);
            autoReconnectEnabledRef.current = false; // Ensure it stays off
            return;
        }

        reconnectAttemptsInternalRef.current += 1;
        setCurrentConnectionAttempts(reconnectAttemptsInternalRef.current);
        setMaxAttemptsReached(false); // Reset for new attempt sequence

        console.log(`[WebSocket] Attempt ${reconnectAttemptsInternalRef.current}/${maxReconnectAttempts} to ${derivedWsServerUrl}`);
        setStatus('connecting');

        try {
            const socket = new WebSocket(derivedWsServerUrl);
            socketRef.current = socket;

            connectionTimeoutIdRef.current = setTimeout(() => {
                if (socketRef.current === socket && socket.readyState === WebSocket.CONNECTING) {
                    console.error(`[WebSocket] Connection timeout after ${connectionTimeout / 1000}s`);
                    socket.close(1006, "Connection timeout"); // Let onclose handle next steps
                }
            }, connectionTimeout);

            socket.onopen = () => {
                if (socketRef.current !== socket) return; // Stale socket

                if (connectionTimeoutIdRef.current) clearTimeout(connectionTimeoutIdRef.current);
                console.log('[WebSocket] Connected to server.');
                setStatus('connected');
                reconnectAttemptsInternalRef.current = 0; // Reset on successful connection
                setCurrentConnectionAttempts(0);
                setMaxAttemptsReached(false);

                if (derivedWsServerUrl.includes('echo.websocket.org')) {
                    try {
                        socket.send(JSON.stringify({ type: 'test', message: 'Connection test' }));
                        console.log('[WebSocket] Test message sent to echo server');
                    } catch (e) {
                        console.error('[WebSocket] Error sending test message:', e);
                    }
                }

                // Clear any existing ping interval before starting a new one
                if (pingIntervalIdRef.current) clearInterval(pingIntervalIdRef.current);
                pingIntervalIdRef.current = setInterval(() => {
                    if (socketRef.current === socket && socket.readyState === WebSocket.OPEN) {
                        try {
                            const pingMsg = derivedWsServerUrl.includes('echo.websocket.org')
                                ? { type: 'ping', timestamp: Date.now() }
                                : { type: 'ping' };
                            socket.send(JSON.stringify(pingMsg));
                            // console.log('[WebSocket] Ping sent.'); // Can be noisy
                        } catch (e) {
                            console.error('[WebSocket] Error sending ping:', e);
                            // If ping fails, connection might be compromised. onclose should handle.
                        }
                    }
                }, pingInterval);
            };

            socket.onclose = (event) => {
                if (socketRef.current !== socket) return; // Stale socket

                if (connectionTimeoutIdRef.current) clearTimeout(connectionTimeoutIdRef.current);
                if (pingIntervalIdRef.current) clearInterval(pingIntervalIdRef.current);
                pingIntervalIdRef.current = null; // Ensure it's null after clearing

                const codeMap: { [key: number]: string } = {
                    1000: 'Normal Closure', 1001: 'Going Away', 1002: 'Protocol Error',
                    1003: 'Unsupported Data', 1005: 'No Status Received', 1006: 'Abnormal Closure',
                    1007: 'Invalid frame payload', 1008: 'Policy Violation', 1009: 'Message Too Big',
                    1010: 'Mandatory Ext.', 1011: 'Internal Error', 1012: 'Service Restart',
                    1013: 'Try Again Later', 1014: 'Bad Gateway', 1015: 'TLS Handshake',
                };
                const reason = codeMap[event.code] || 'Unknown';
                console.log(`[WebSocket] Connection closed: ${event.code} (${reason}) ${event.reason ? `| Reason: ${event.reason}` : ''}`);
                if (event.code === 1006) {
                     console.log('[WebSocket] Abnormal closure usually indicates server is unavailable or network issue.');
                }

                // Set status to disconnected, unless we're already about to hit max attempts and should show error
                if (autoReconnectEnabledRef.current && isEnabled && event.code !== 1000 && reconnectAttemptsInternalRef.current >= maxReconnectAttempts) {
                    setStatus('error');
                } else {
                    setStatus('disconnected');
                }


                if (!autoReconnectEnabledRef.current || !isEnabled || event.code === 1000) {
                    console.log('[WebSocket] Auto-reconnect not attempted or not applicable.');
                    if (reconnectAttemptsInternalRef.current >= maxReconnectAttempts && event.code !== 1000) {
                        setMaxAttemptsReached(true);
                        setStatus('error'); // Ensure status is error if max attempts were hit from a non-normal close
                    }
                    return;
                }

                if (reconnectAttemptsInternalRef.current < maxReconnectAttempts) {
                    const delay = Math.min(
                        reconnectDelayBase * Math.pow(2, reconnectAttemptsInternalRef.current -1),
                        reconnectDelayMax
                    );
                    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsInternalRef.current + 1}/${maxReconnectAttempts})`); // Next attempt number
                    reconnectTimeoutIdRef.current = setTimeout(() => {
                        if (isEnabled && autoReconnectEnabledRef.current) { // Double check
                            connectWebSocket();
                        }
                    }, delay);
                } else {
                    console.error(`[WebSocket] Max reconnection attempts (${maxReconnectAttempts}) reached.`);
                    setStatus('error');
                    setMaxAttemptsReached(true);
                    autoReconnectEnabledRef.current = false;
                }
            };

            socket.onerror = (errorEvent) => {
                if (socketRef.current !== socket) return; // Stale socket

                console.error('[WebSocket] Connection error. URL:', derivedWsServerUrl, 'Event:', errorEvent);
                // onclose will usually follow with more specific error codes.
                // Setting status to error here gives immediate feedback.
                // onclose might then change it or confirm based on retry logic.
                setStatus('error');
                // Max attempts check here is mostly for UI, onclose handles the logic
                if (reconnectAttemptsInternalRef.current >= maxReconnectAttempts) {
                    setMaxAttemptsReached(true);
                }
            };

            socket.onmessage = (event) => {
                if (socketRef.current !== socket) return; // Stale socket

                // console.log('[WebSocket] Message received:', event.data); // Can be very noisy
                if (derivedWsServerUrl.includes('echo.websocket.org')) {
                    console.log('[WebSocket] Echo response:', event.data);
                    return;
                }
                try {
                    let data;
                    if (typeof event.data === 'string') {
                        try {
                            data = JSON.parse(event.data);
                        } catch (e) {
                            // console.log('[WebSocket] Received non-JSON message, treating as raw barcode:', event.data);
                            onBarcodeReceived(event.data);
                            return;
                        }
                    } else {
                        console.warn('[WebSocket] Received binary message, not processed:', event.data);
                        return;
                    }

                    if (data && typeof data.barcodeId === 'string') {
                        onBarcodeReceived(data.barcodeId);
                    } else if (data && data.type === 'barcode' && typeof data.value === 'string') {
                        onBarcodeReceived(data.value);
                    } else if (data && data.type === 'pong') {
                         // console.log('[WebSocket] Pong received.');
                    }else {
                        console.log('[WebSocket] Received message in unrecognized format:', data);
                    }
                } catch (error) {
                    console.error('[WebSocket] Error processing message:', error);
                }
            };

        } catch (error) {
            console.error('[WebSocket] Error creating WebSocket instance:', error);
            setStatus('error');
            // If creation fails, it counts as an attempt. Check if max reached.
            if (reconnectAttemptsInternalRef.current >= maxReconnectAttempts) {
                setMaxAttemptsReached(true);
                autoReconnectEnabledRef.current = false;
            } else {
                // Optionally, if `new WebSocket` throws, you might want to retry after a delay
                // This is not typical for `new WebSocket` throwing (usually URL issues),
                // but if it were a transient issue, this could be added.
                // For now, assume `new WebSocket` failure means a configuration problem.
            }
        }
    }, [
        derivedWsServerUrl,
        isEnabled,
        onBarcodeReceived,
        cleanupSocket,
        maxReconnectAttempts,
        connectionTimeout,
        pingInterval,
        reconnectDelayBase,
        reconnectDelayMax,
    ]);

    // Effect for connecting/disconnecting based on isEnabled and URL changes
    useEffect(() => {
        let initialConnectTimeoutId: NodeJS.Timeout | null = null;

        if (isEnabled) {
            console.log('[WebSocket] Hook enabled. Initiating connection sequence.');
            autoReconnectEnabledRef.current = true;
            reconnectAttemptsInternalRef.current = 0; // Reset attempts for a fresh start
            setCurrentConnectionAttempts(0);
            setMaxAttemptsReached(false);

            // Small delay for initial connection. Can be removed if not strictly needed.
            initialConnectTimeoutId = setTimeout(() => {
                if (isEnabled && autoReconnectEnabledRef.current) { // Check again
                    connectWebSocket();
                }
            }, 100);

            return () => {
                if (initialConnectTimeoutId) clearTimeout(initialConnectTimeoutId);
                console.log('[WebSocket] Hook cleanup (isEnabled changed or unmount).');
                cleanupSocket(true); // Graceful shutdown
                setStatus('disconnected'); // Ensure status reflects disabled state
            };
        } else {
            // isEnabled is false
            console.log('[WebSocket] Hook disabled. Cleaning up any existing connection.');
            cleanupSocket(true); // Graceful shutdown
            setStatus('disconnected');
            // Ensure all state related to attempts is reset if it was disabled.
            reconnectAttemptsInternalRef.current = 0;
            setCurrentConnectionAttempts(0);
            setMaxAttemptsReached(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEnabled, derivedWsServerUrl]); // connectWebSocket and cleanupSocket are memoized

    const manualReconnect = useCallback(() => {
        console.log('[WebSocket] Manual reconnection initiated.');
        if (status === 'connecting') {
            console.log('[WebSocket] Already attempting to connect.');
            return;
        }
        autoReconnectEnabledRef.current = true;
        reconnectAttemptsInternalRef.current = 0;
        setCurrentConnectionAttempts(0);
        setMaxAttemptsReached(false);
        connectWebSocket();
    }, [connectWebSocket, status]);

    return {
        status,
        reconnect: manualReconnect,
        connectionAttempts: currentConnectionAttempts,
        maxAttempts: maxReconnectAttempts,
        maxAttemptsReached,
    };
}