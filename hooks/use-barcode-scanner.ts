"use client";

// Import the real implementation
import useExternalScannerSocket from './use-external-scanner-socket';

/**
 * This is a wrapper around useExternalScannerSocket for backward compatibility
 */
function useBarcodeScanner(
  onBarcodeReceived: (barcode: string) => void,
  isEnabled: boolean
) {
  // Use the real implementation with default settings
  return useExternalScannerSocket({
    onBarcodeReceived,
    isEnabled,
    verbose: process.env.NODE_ENV !== 'production' // Enable verbose logging only in development
  });
}

export default useBarcodeScanner;
