"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

// Define the scanner status type
export type DirectScannerStatus = 'inactive' | 'active' | 'error';

// Props for the hook
interface UseDirectScannerProps {
    onBarcodeReceived: (barcode: string) => void;
    isEnabled: boolean;
    scanDelay?: number;      // Minimum delay between scans in ms
    maxLength?: number;      // Maximum barcode length
    minLength?: number;      // Minimum barcode length
    prefixKeys?: string[];   // Optional prefix keys that indicate a scanner (e.g., Tab)
    suffixKeys?: string[];   // Optional suffix keys that indicate end of scan (e.g., Enter)
    timeout?: number;        // Timeout for scan sequence in ms
    verbose?: boolean;       // Enable verbose logging
}

// Return type for the hook
interface UseDirectScannerReturn {
    status: DirectScannerStatus;
    lastScanTime: number | null;
    errorMessage: string | null;
}

/**
 * Custom hook for handling direct USB/HID barcode scanner input.
 * 
 * This hook treats the barcode scanner as a keyboard device and captures
 * rapid keyboard input sequences that are likely from a scanner rather than human typing.
 */
const useDirectScanner = ({
    onBarcodeReceived,
    isEnabled = true,
    scanDelay = 500,
    maxLength = 100,
    minLength = 3,
    prefixKeys = [],
    suffixKeys = ['Enter'],
    timeout = 50,
    verbose = false
}: UseDirectScannerProps): UseDirectScannerReturn => {
    const [status, setStatus] = useState<DirectScannerStatus>('inactive');
    const [lastScanTime, setLastScanTime] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Refs to track state between renders
    const bufferRef = useRef<string>('');
    const lastKeyTimeRef = useRef<number>(0);
    const processingRef = useRef<boolean>(false);
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const isEnabledRef = useRef<boolean>(isEnabled);
    const lastProcessedBarcodeRef = useRef<string>('');
    const lastProcessedTimeRef = useRef<number>(0);

    // Update ref when prop changes
    useEffect(() => {
        isEnabledRef.current = isEnabled;
        if (isEnabled && status !== 'active') {
            setStatus('active');
            if (verbose) console.log('[DirectScanner] Scanner activated');
        } else if (!isEnabled && status !== 'inactive') {
            setStatus('inactive');
            if (verbose) console.log('[DirectScanner] Scanner deactivated');
        }
    }, [isEnabled, status, verbose]);

    // Process the buffer and emit a barcode if valid
    const processBuffer = useCallback(() => {
        if (processingRef.current) return;
        processingRef.current = true;

        try {
            let barcode = bufferRef.current.trim();
            
            // Remove suffix keys if present
            for (const suffix of suffixKeys) {
                if (barcode.endsWith(suffix)) {
                    barcode = barcode.slice(0, -suffix.length);
                    break;
                }
            }

            // Remove prefix keys if present
            for (const prefix of prefixKeys) {
                if (barcode.startsWith(prefix)) {
                    barcode = barcode.slice(prefix.length);
                    break;
                }
            }

            // Validate barcode
            if (barcode.length >= minLength && barcode.length <= maxLength) {
                const now = Date.now();
                
                // Prevent duplicate scans within scanDelay period
                if (barcode !== lastProcessedBarcodeRef.current || 
                    now - lastProcessedTimeRef.current > scanDelay) {
                    
                    if (verbose) console.log(`[DirectScanner] Valid barcode detected: ${barcode}`);
                    
                    // Update tracking vars
                    lastProcessedBarcodeRef.current = barcode;
                    lastProcessedTimeRef.current = now;
                    setLastScanTime(now);
                    
                    // Call the callback
                    onBarcodeReceived(barcode);
                } else if (verbose) {
                    console.log(`[DirectScanner] Duplicate scan ignored: ${barcode}`);
                }
            } else if (verbose && barcode.length > 0) {
                console.log(`[DirectScanner] Invalid barcode length (${barcode.length}): ${barcode}`);
            }
        } catch (error) {
            console.error('[DirectScanner] Error processing barcode:', error);
            setErrorMessage(error instanceof Error ? error.message : String(error));
            setStatus('error');
        } finally {
            // Reset buffer and processing flag
            bufferRef.current = '';
            processingRef.current = false;
        }
    }, [minLength, maxLength, onBarcodeReceived, prefixKeys, scanDelay, suffixKeys, verbose]);

    // Handle keydown events
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!isEnabledRef.current) return;

        const now = Date.now();
        const timeSinceLastKey = now - lastKeyTimeRef.current;
        lastKeyTimeRef.current = now;

        // If a timeout is set, clear it
        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
            timeoutIdRef.current = null;
        }

        // Check if this is a suffix key that should trigger processing
        const isSuffixKey = suffixKeys.includes(event.key);
        
        // If this is a suffix key or the time between keys is within scanner speed,
        // add to buffer (unless it's a modifier key)
        if (!event.ctrlKey && !event.altKey && !event.metaKey) {
            // For suffix keys, we want to include them in the buffer for processing
            if (isSuffixKey) {
                bufferRef.current += event.key;
                processBuffer();
                event.preventDefault(); // Prevent default action for suffix keys
                return;
            }
            
            // For normal keys, add to buffer if within scanner speed or starting a new scan
            if (timeSinceLastKey < timeout || bufferRef.current.length === 0) {
                // Only add printable characters or specific keys
                if (event.key.length === 1 || prefixKeys.includes(event.key)) {
                    bufferRef.current += event.key;
                }
                
                // Set timeout to process buffer if no more keys are pressed
                timeoutIdRef.current = setTimeout(() => {
                    if (bufferRef.current.length > 0) {
                        processBuffer();
                    }
                }, timeout);
            }
        }
    }, [processBuffer, prefixKeys, suffixKeys, timeout]);

    // Set up and clean up event listeners
    useEffect(() => {
        if (isEnabled) {
            if (verbose) console.log('[DirectScanner] Adding keyboard event listeners');
            window.addEventListener('keydown', handleKeyDown);
            setStatus('active');
        }

        return () => {
            if (verbose) console.log('[DirectScanner] Removing keyboard event listeners');
            window.removeEventListener('keydown', handleKeyDown);
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
                timeoutIdRef.current = null;
            }
        };
    }, [isEnabled, handleKeyDown, verbose]);

    return {
        status,
        lastScanTime,
        errorMessage
    };
};

export default useDirectScanner;
