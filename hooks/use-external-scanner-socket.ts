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
    verbose?: boolean;          // Enable verbose logging for debugging
}

// Return type for the hook
interface UseExternalScannerSocketReturn {
    status: WebSocketStatus;
    reconnect: () => void;
    connectionAttempts: number;
    maxAttempts: number;
    maxAttemptsReached: boolean;
}

// --- Helper Function for Message Processing ---
interface ProcessMessageParams {
    rawData: MessageEvent['data'];
    onBarcodeReceived: (barcode: string) => void;
    isEchoServer: boolean;
    verbose: boolean;
}

function processWebSocketMessage({
    rawData,
    onBarcodeReceived,
    isEchoServer,
    verbose
}: ProcessMessageParams): void {
    const logPrefix = '[WebSocket-MessageHandler]';

    if (verbose) {
        console.log(`${logPrefix} Raw data received:`, typeof rawData === 'string' ? rawData.substring(0, 200) + (rawData.length > 200 ? '...' : '') : rawData);
    }

    if (isEchoServer) {
        if (verbose) console.log(`${logPrefix} Echo server response, skipping barcode processing.`);
        return;
    }

    if (typeof rawData !== 'string') {
        console.warn(`${logPrefix} Received binary data or non-string data type, not processed as barcode:`, typeof rawData);
        return;
    }

    const messageString = rawData;
    let parsedData: any;

    try {
        parsedData = JSON.parse(messageString);
        if (verbose) {
            console.log(`${logPrefix} Successfully parsed JSON data:`, parsedData);
        }
    } catch (e) {
        if (verbose) {
            console.log(`${logPrefix} Data is not valid JSON. Treating as raw barcode: "${messageString}"`);
        }
        onBarcodeReceived(messageString);
        console.log(`${logPrefix} CALLED onBarcodeReceived with raw string: "${messageString}"`);
        return;
    }

    let barcodeValue: string | undefined = undefined;
    let formatMatched: string | null = null;

    // Check known JSON formats
    if (parsedData && typeof parsedData.barcodeId === 'string') {
        barcodeValue = parsedData.barcodeId;
        formatMatched = 'Format 1 (barcodeId)';
    } else if (parsedData && parsedData.type === 'barcode_scan_received' && parsedData.data && typeof parsedData.data.barcodeId === 'string') {
        barcodeValue = parsedData.data.barcodeId;
        formatMatched = 'Format 2 (type:barcode_scan_received, data.barcodeId)';
    } else if (parsedData && parsedData.type === 'barcode' && typeof parsedData.value === 'string') {
        barcodeValue = parsedData.value;
        formatMatched = 'Format 3 (type:barcode, value)';
    } else if (parsedData && parsedData.barcode && typeof parsedData.barcode === 'string') {
        barcodeValue = parsedData.barcode;
        formatMatched = 'Format 4 (barcode property)';
    } else if (parsedData && parsedData.type === 'scan' && typeof parsedData.code === 'string') {
        barcodeValue = parsedData.code;
        formatMatched = 'Format 5 (type:scan, code)';
    } else if (parsedData && parsedData.type === 'scan-result' && parsedData.success === true) {
        const possibleBarcode = parsedData.data?.barcode || parsedData.data?.code || parsedData.barcode || parsedData.code;
        if (typeof possibleBarcode === 'string') {
            barcodeValue = possibleBarcode;
            formatMatched = 'Scan-result format';
        } else {
            if (verbose) console.log(`${logPrefix} Received scan-result but without valid barcode data in expected fields:`, parsedData);
        }
    }

    if (barcodeValue) {
        if (verbose) console.log(`${logPrefix} Found barcode in ${formatMatched}: "${barcodeValue}"`);
        onBarcodeReceived(barcodeValue);
        console.log(`${logPrefix} CALLED onBarcodeReceived with extracted barcode: "${barcodeValue}"`);
        return;
    }

    // Handle other known message types (non-barcode)
    if (parsedData?.type === 'pong') {
        if (verbose) console.log(`${logPrefix} Pong received.`);
        return;
    }
    if (parsedData?.type === 'welcome') {
        if (verbose) console.log(`${logPrefix} Welcome message received:`, parsedData.message || parsedData.data || parsedData);
        return;
    }
    if (parsedData?.type === 'barcode_scan_received' && parsedData?.data?.status === 'received') {
        if (verbose) console.log(`${logPrefix} Barcode scan received confirmation:`, parsedData.data);
        // We already processed this message type above for the barcode value
        return;
    }
    if (parsedData?.message && (
        parsedData.message.toString().toLowerCase().includes('welcome') ||
        parsedData.message.toString().toLowerCase().includes('connected')
    )) {
        if (verbose) console.log(`${logPrefix} Server status/info message:`, parsedData.message);
        return;
    }

    // If no specific barcode format matched, try heuristic search
    if (verbose) console.log(`${logPrefix} No known barcode format matched directly. Attempting heuristic search...`);
    const commonBarcodeProps = ['barcodeId', 'code', 'barcode', 'id', 'value', 'scanData', 'dataString', 'text'];
    for (const prop of commonBarcodeProps) {
        if (parsedData && typeof parsedData[prop] === 'string' && parsedData[prop].length > 0 && parsedData[prop].length < 200) {
            barcodeValue = parsedData[prop];
            formatMatched = `Heuristic match (top-level property "${prop}")`;
            break;
        }
        if (parsedData && parsedData.data && typeof parsedData.data === 'object' && parsedData.data !== null) {
            if (typeof parsedData.data[prop] === 'string' && parsedData.data[prop].length > 0 && parsedData.data[prop].length < 200) {
                barcodeValue = parsedData.data[prop];
                formatMatched = `Heuristic match (nested "data.${prop}")`;
                break;
            }
        }
    }

    if (barcodeValue) {
        if (verbose) console.log(`${logPrefix} Found barcode via ${formatMatched}: "${barcodeValue}"`);
        onBarcodeReceived(barcodeValue);
        console.log(`${logPrefix} CALLED onBarcodeReceived with heuristically found barcode: "${barcodeValue}"`);
        return;
    }

    // Always log barcode_scan_received messages for debugging purposes
    if (parsedData?.type === 'barcode_scan_received') {
        console.log(`${logPrefix} Received barcode_scan_received message:`, parsedData);
        console.log(`${logPrefix} Data structure:`, JSON.stringify(parsedData));
    }

    if (verbose) {
        console.log(`${logPrefix} Message processed, but no barcode identified. Full data:`, parsedData);
    } else {
        // Default log for unrecognized format when not verbose
        console.log('[WebSocket] Received message in unrecognized format:', parsedData);
    }
}

/**
 * Custom hook for connecting to an external barcode scanner via WebSocket.
 */
const useExternalScannerSocket = ({
    onBarcodeReceived,
    isEnabled,
    serverUrl,
    maxReconnectAttempts = 5,
    connectionTimeout = 10000,
    pingInterval = 30000,
    reconnectDelayBase = 1000,
    reconnectDelayMax = 30000,
    verbose = false // Default verbose to false
}: UseExternalScannerSocketProps): UseExternalScannerSocketReturn => {
    const derivedWsServerUrl = useMemo(() => {
        const isClient = typeof window !== 'undefined';
        const isSecure = isClient && window.location.protocol === 'https:';
        let url = serverUrl || process.env.NEXT_PUBLIC_WEBSOCKET_URL;

        if (!url) {
            url = isSecure ? 'wss://echo.websocket.org' : 'ws://echo.websocket.org';
            if (verbose) console.log('[WebSocket] No URL provided, using echo server for testing:', url);
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
    }, [serverUrl, verbose]); // Added verbose to re-log if it changes

    useEffect(() => {
        if (verbose) console.log('[WebSocket] Server URL configured as:', derivedWsServerUrl);
        if (!derivedWsServerUrl.startsWith('ws://') && !derivedWsServerUrl.startsWith('wss://')) {
            console.warn('[WebSocket] URL may be invalid. It should start with ws:// or wss://');
        }
    }, [derivedWsServerUrl, verbose]);

    const [status, setStatus] = useState<WebSocketStatus>('disconnected');
    const [currentConnectionAttempts, setCurrentConnectionAttempts] = useState(0);
    const [maxAttemptsReached, setMaxAttemptsReached] = useState(false);

    const socketRef = useRef<WebSocket | null>(null);
    const reconnectAttemptsInternalRef = useRef(0);
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
            if (verbose) console.log(`[WebSocket] Cleaning up socket (graceful: ${isGracefulShutdown})`);
            if (isGracefulShutdown) {
                autoReconnectEnabledRef.current = false;
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
        if (isGracefulShutdown) {
            setStatus('disconnected');
        }
    }, [verbose]); // Added verbose

    const connectWebSocket = useCallback(() => {
        cleanupSocket(true);
        autoReconnectEnabledRef.current = true;

        if (!isEnabled) {
            if (verbose) console.log('[WebSocket] Connection disabled, not connecting.');
            setStatus('disconnected');
            return;
        }

        if (reconnectAttemptsInternalRef.current >= maxReconnectAttempts) {
            console.error(`[WebSocket] Max reconnection attempts (${maxReconnectAttempts}) reached prior to new attempt.`);
            setStatus('error');
            setMaxAttemptsReached(true);
            autoReconnectEnabledRef.current = false;
            return;
        }

        reconnectAttemptsInternalRef.current += 1;
        setCurrentConnectionAttempts(reconnectAttemptsInternalRef.current);
        setMaxAttemptsReached(false);

        if (verbose) console.log(`[WebSocket] Attempt ${reconnectAttemptsInternalRef.current}/${maxReconnectAttempts} to ${derivedWsServerUrl}`);
        setStatus('connecting');

        try {
            const socket = new WebSocket(derivedWsServerUrl);
            socketRef.current = socket;

            connectionTimeoutIdRef.current = setTimeout(() => {
                if (socketRef.current === socket && socket.readyState === WebSocket.CONNECTING) {
                    console.error(`[WebSocket] Connection timeout after ${connectionTimeout / 1000}s`);
                    socket.close(1006, "Connection timeout");
                }
            }, connectionTimeout);

            socket.onopen = () => {
                if (socketRef.current !== socket) return;

                if (connectionTimeoutIdRef.current) clearTimeout(connectionTimeoutIdRef.current);
                if (verbose) console.log('[WebSocket] Connected to server.');
                setStatus('connected');
                reconnectAttemptsInternalRef.current = 0;
                setCurrentConnectionAttempts(0);
                setMaxAttemptsReached(false);

                if (derivedWsServerUrl.includes('echo.websocket.org')) {
                    try {
                        socket.send(JSON.stringify({ type: 'test', message: 'Connection test' }));
                        if (verbose) console.log('[WebSocket] Test message sent to echo server');
                    } catch (e) {
                        console.error('[WebSocket] Error sending test message:', e);
                    }
                }

                if (pingIntervalIdRef.current) clearInterval(pingIntervalIdRef.current);
                pingIntervalIdRef.current = setInterval(() => {
                    if (socketRef.current === socket && socket.readyState === WebSocket.OPEN) {
                        try {
                            const pingMsg = derivedWsServerUrl.includes('echo.websocket.org')
                                ? { type: 'ping', timestamp: Date.now() }
                                : { type: 'ping' };
                            socket.send(JSON.stringify(pingMsg));
                            if (verbose) console.log('[WebSocket] Ping sent.');
                        } catch (e) {
                            console.error('[WebSocket] Error sending ping:', e);
                        }
                    }
                }, pingInterval);
            };

            socket.onclose = (event) => {
                if (socketRef.current !== socket) return;

                if (connectionTimeoutIdRef.current) clearTimeout(connectionTimeoutIdRef.current);
                if (pingIntervalIdRef.current) clearInterval(pingIntervalIdRef.current);
                pingIntervalIdRef.current = null;

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

                if (autoReconnectEnabledRef.current && isEnabled && event.code !== 1000 && reconnectAttemptsInternalRef.current >= maxReconnectAttempts) {
                    setStatus('error');
                } else {
                    setStatus('disconnected');
                }

                if (!autoReconnectEnabledRef.current || !isEnabled || event.code === 1000) {
                    if (verbose) console.log('[WebSocket] Auto-reconnect not attempted or not applicable.');
                    if (reconnectAttemptsInternalRef.current >= maxReconnectAttempts && event.code !== 1000) {
                        setMaxAttemptsReached(true);
                        setStatus('error');
                    }
                    return;
                }

                if (reconnectAttemptsInternalRef.current < maxReconnectAttempts) {
                    const delay = Math.min(
                        reconnectDelayBase * Math.pow(2, reconnectAttemptsInternalRef.current -1 ),
                        reconnectDelayMax
                    );
                    if (verbose) console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsInternalRef.current + 1}/${maxReconnectAttempts})`);
                    reconnectTimeoutIdRef.current = setTimeout(() => {
                        if (isEnabled && autoReconnectEnabledRef.current) {
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
                if (socketRef.current !== socket) return;
                console.error('[WebSocket] Connection error. URL:', derivedWsServerUrl, 'Event:', errorEvent);
                setStatus('error');
                if (reconnectAttemptsInternalRef.current >= maxReconnectAttempts) {
                    setMaxAttemptsReached(true);
                }
            };

            socket.onmessage = (event: MessageEvent) => {
                if (socketRef.current !== socket) return; // Stale socket check

                processWebSocketMessage({
                    rawData: event.data,
                    onBarcodeReceived: onBarcodeReceived, // Passed directly
                    isEchoServer: derivedWsServerUrl.includes('echo.websocket.org'),
                    verbose: verbose // Pass verbose flag
                });
            };

        } catch (error) {
            console.error('[WebSocket] Error creating WebSocket instance:', error);
            setStatus('error');
            if (reconnectAttemptsInternalRef.current >= maxReconnectAttempts) {
                setMaxAttemptsReached(true);
                autoReconnectEnabledRef.current = false;
            }
        }
    }, [
        derivedWsServerUrl,
        isEnabled,
        onBarcodeReceived,
        cleanupSocket, // cleanupSocket now depends on verbose
        maxReconnectAttempts,
        connectionTimeout,
        pingInterval,
        reconnectDelayBase,
        reconnectDelayMax,
        verbose // Added verbose as a dependency
    ]);

    useEffect(() => {
        let initialConnectTimeoutId: NodeJS.Timeout | null = null;

        if (isEnabled) {
            if (verbose) console.log('[WebSocket] Hook enabled. Initiating connection sequence.');
            autoReconnectEnabledRef.current = true;
            reconnectAttemptsInternalRef.current = 0;
            setCurrentConnectionAttempts(0);
            setMaxAttemptsReached(false);

            initialConnectTimeoutId = setTimeout(() => {
                if (isEnabled && autoReconnectEnabledRef.current) {
                    connectWebSocket();
                }
            }, 100);

            return () => {
                if (initialConnectTimeoutId) clearTimeout(initialConnectTimeoutId);
                if (verbose) console.log('[WebSocket] Hook cleanup (isEnabled changed or unmount).');
                cleanupSocket(true);
                setStatus('disconnected');
            };
        } else {
            if (verbose) console.log('[WebSocket] Hook disabled. Cleaning up any existing connection.');
            cleanupSocket(true);
            setStatus('disconnected');
            reconnectAttemptsInternalRef.current = 0;
            setCurrentConnectionAttempts(0);
            setMaxAttemptsReached(false);
        }
    }, [isEnabled, derivedWsServerUrl, connectWebSocket, cleanupSocket, verbose]); // Added verbose, connectWebSocket, cleanupSocket

    const manualReconnect = useCallback(() => {
        if (verbose) console.log('[WebSocket] Manual reconnection initiated.');
        if (status === 'connecting') {
            if (verbose) console.log('[WebSocket] Already attempting to connect.');
            return;
        }
        autoReconnectEnabledRef.current = true;
        reconnectAttemptsInternalRef.current = 0;
        setCurrentConnectionAttempts(0);
        setMaxAttemptsReached(false);
        connectWebSocket();
    }, [connectWebSocket, status, verbose]); // Added verbose

    return {
        status,
        reconnect: manualReconnect,
        connectionAttempts: currentConnectionAttempts,
        maxAttempts: maxReconnectAttempts,
        maxAttemptsReached,
    };
};

// Export the hook as both named and default export for maximum compatibility
export { useExternalScannerSocket };
export default useExternalScannerSocket;

// This is a workaround for Next.js module resolution issues
// @ts-ignore
if (typeof window !== 'undefined' && module.hot) {
  // @ts-ignore
  module.hot.accept();
}