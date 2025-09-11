// lib/barcode-scanner.tsx

"use client"

import type React from "react";
import { useState, useRef, useCallback } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { Maximize, Focus, Barcode } from "lucide-react";

interface BarcodeScannerProps {
    onDetected: (code: string) => void;
    width?: number | string; // Allow percentage for responsiveness
    height?: number | string; // Allow percentage for responsiveness
    isActive?: boolean; // Control scanner activation
    scanDelay?: number; // Control scan frequency
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
    onDetected,
    width = "100%", // Default to fill container width
    height = 300,
    isActive = true,
    scanDelay = 500 // Default delay between scans (ms)
}) => {
    // Cooldown is handled by the scanDelay prop of the library itself if available,
    // or managed externally by the parent pausing the scanner (isActive=false)
    // Keeping internal cooldown for immediate feedback if needed
    const [isProcessing, setIsProcessing] = useState(false);
    const scannerRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false); // For manual focus visual feedback
    const lastScanTime = useRef<number>(0);
    const lastScannedCode = useRef<string | null>(null);


    // Handle manual focus visual effect
    const handleFocus = useCallback(() => {
        if (isActive) {
            setIsFocused(true);
            setTimeout(() => setIsFocused(false), 300); // Shorter visual feedback
        }
    }, [isActive]);

    // Handle successful scan
    const handleScan = useCallback((result: any) => {
        // Basic validation and type checking
        if (!result) return;
        const code = String(result?.text ?? result).trim();
        if (!code) return; // Ignore empty scans

        const now = Date.now();

        // Prevent processing the exact same code rapidly + respect external active state
        if (!isActive || isProcessing || (code === lastScannedCode.current && now - lastScanTime.current < (scanDelay * 2))) return;


        setIsProcessing(true);
        lastScanTime.current = now;
        lastScannedCode.current = code;

        // console.log("Scanner Component Detected:", code); // Debug log

        onDetected(code);

        // Reset processing state after a short delay, parent component controls actual readiness via `isActive`
        setTimeout(() => {
            setIsProcessing(false);
            // Optional: Clear last scanned code if you want to allow immediate rescan of same code after modal close
            // lastScannedCode.current = null;
        }, 1500); // Allow time for modal to appear and processing to start

    }, [isActive, onDetected, isProcessing, scanDelay]);

    // Only render scanner component when active to save resources
    if (!isActive) {
        return (
            <div className="flex items-center justify-center border rounded-lg bg-muted h-[300px] w-full max-w-[500px] mx-auto">
                {/* Consider matching height prop */}
                <p className="text-muted-foreground">Scanner Paused</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full"> {/* Ensure container takes width */}
            {/* Scanner with visual guides */}
            {/* Consider making the outer div responsive if width/height are percentages */}
            <div
                className="relative border rounded-lg overflow-hidden bg-black" // Added bg-black for better camera contrast
                ref={scannerRef}
                style={{ width: width, height: height }}
                onClick={handleFocus} // Allow clicking anywhere on scanner to focus
            >
                <BarcodeScannerComponent
                    width={width} // Pass props
                    height={height} // Pass props
                    onUpdate={(err, result) => {
                        if (err) {
                            // console.error("Scanner Error:", err); // Optional: Log non-critical errors
                        } else if (result) {
                            handleScan(result);
                        }
                    }}
                // Some libraries have props like facingMode, constraints, delayBetweenScanAttempts
                // Check react-qr-barcode-scanner docs for performance tuning props
                // Example: scanDelay={scanDelay} // Pass the prop if supported
                />

                {/* Scanning overlay with visual guides */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Corner guides (subtler) */}
                    <div className="absolute top-2 left-2 w-10 h-10 border-t-2 border-l-2 border-primary/70"></div>
                    <div className="absolute top-2 right-2 w-10 h-10 border-t-2 border-r-2 border-primary/70"></div>
                    <div className="absolute bottom-2 left-2 w-10 h-10 border-b-2 border-l-2 border-primary/70"></div>
                    <div className="absolute bottom-2 right-2 w-10 h-10 border-b-2 border-r-2 border-primary/70"></div>

                    {/* Rectangular barcode target area - centered */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div
                            className={`w-3/4 max-w-xs h-1/3 max-h-24 border-2 border-dashed ${isFocused ? "border-green-500" : "border-white/40"
                                } flex items-center justify-center transition-colors duration-200 rounded`} // Added rounded
                        >
                            {/* Optional: Icon inside target */}
                            {/* <Barcode className={`h-8 w-12 ${isFocused ? "text-green-500/80" : "text-white/30"}`} /> */}
                        </div>
                    </div>

                    {/* Horizontal scanning line - single, centered */}
                    <div className="absolute inset-x-4 top-1/2 transform -translate-y-1/2 h-0.5 bg-red-500/80 animate-scan-line rounded"></div>

                    {/* Focus animation - subtle pulse on focus */}
                    {isFocused && <div className="absolute inset-0 border-2 border-green-500 rounded-lg animate-pulse opacity-60"></div>}

                    {/* Processing indicator */}
                    {isProcessing && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <p className="text-white font-semibold animate-pulse">Processing...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Scanning instructions */}
            <div className="mt-3 text-sm text-center text-muted-foreground flex items-center justify-center gap-2">
                <Maximize className="h-4 w-4" />
                <span>Align barcode within the frame</span>
            </div>

            {/* Manual Focus Button - Optional */}
            <button
                onClick={handleFocus}
                className="mt-1 text-xs text-primary flex items-center justify-center gap-1 hover:underline"
                disabled={!isActive || isProcessing}
            >
                <Focus className="h-3 w-3" />
                <span>Tap scanner to focus</span>
            </button>
        </div>
    );
};

export default BarcodeScanner;

// Add this CSS to your global stylesheet (e.g., globals.css) if not using styled-jsx
/*
@keyframes scanLine {
    0% { transform: translateY(-50px); opacity: 0.5; }
    50% { transform: translateY(50px); opacity: 1; }
    100% { transform: translateY(-50px); opacity: 0.5; }
}
.animate-scan-line {
    animation: scanLine 2.5s ease-in-out infinite;
}
*/
