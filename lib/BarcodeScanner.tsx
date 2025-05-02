// lib/BarcodeScanner.tsx
import React, { useState, useEffect } from 'react';
import RqrbScanner from "react-qr-barcode-scanner"; // Renamed import to avoid name clash

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, Loader2, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type BarcodeScannerProps = {
    onResult: (text: string) => void; // Callback when a barcode is successfully scanned
    onDecodeError?: (error: Error) => void; // Optional: Callback for errors *during* decoding (e.g., blurry image)
    onDeviceError?: (error: Error) => void; // Optional: Callback for camera device errors (permissions, not found)
    className?: string;
    paused?: boolean; // If true, stops scanning and hides the camera view
    timeBetweenDecodingAttempts?: number; // Maps to 'delay' prop
    facingMode?: 'user' | 'environment'; // Control front/back camera
    stopStream?: boolean; // Propagate stopStream for unmounting scenarios
    width?: number | string; // Pass through width
    height?: number | string; // Pass through height
};

// No longer using forwardRef or exposing handles as the new component doesn't support it directly
export const BarcodeScanner: React.FC<BarcodeScannerProps> = (
    {
        onResult,
        onDecodeError, // Renamed for clarity from original 'onError'
        onDeviceError,
        className,
        paused = false,
        timeBetweenDecodingAttempts = 500, // Default from new library's docs
        facingMode = "environment", // Default from new library's docs
        stopStream = false,         // Default to false
        width = "100%",             // Default from new library's docs
        height = "100%",            // Default from new library's docs
    }
) => {
    // State to hold camera device errors (permissions, etc.)
    const [deviceError, setDeviceError] = useState<Error | null>(null);
    const {toast} = useToast(); // Assuming you have a toast function for notifications

    const handleUpdate = (err: any, result: any) => {
        if (result) {
            // Check if the result object and text property exist
            if (result.text) {
                setDeviceError(null); // Clear any previous device error on successful scan
                onResult(result.text);
            } else {
                // Handle cases where result is truthy but text is missing (shouldn't usually happen)
                console.warn("Scan result detected, but no text found:", result);
            }
        } else if (err) {
            // This 'err' is often a decoding error (NotFoundException)
            // Filter out common 'NotFoundException' unless a specific handler is provided
            if (err?.name !== 'NotFoundException' && !err?.message?.includes('NotFoundException')) {
                console.error("Decoding Error:", err);
                if (onDecodeError) {
                    onDecodeError(err instanceof Error ? err : new Error(String(err)));
                }
            }
            // Don't set deviceError here, as this is usually a decode error, not a device issue
        }
    };

    const handleError = (error: string | DOMException) => {
        console.error("Camera error:", error);
        // Optionally handle differently based on type
        if (typeof error === "string") {
            toast({ title: "Camera Error", description: error, variant: "destructive" });
        } else {
            toast({ title: "Camera Error", description: error.message, variant: "destructive" });
        }
    };


    return (
        <div className={cn("w-full space-y-4", className)}>
            {/* --- REMOVE Camera Selection Dropdown --- */}

            {/* Video Element Area */}
            <div className="relative aspect-video bg-muted rounded-md overflow-hidden border border-dashed flex items-center justify-center">
                {/* Show device error if present */}
                {deviceError ? (
                    <Alert variant="destructive" className="m-4 w-auto">
                        <Camera className="h-4 w-4" />
                        <AlertTitle>Camera Error</AlertTitle>
                        <AlertDescription>
                            {deviceError.name === 'NotAllowedError'
                                ? "Camera permission denied. Please grant access."
                                : deviceError.message || "Could not access camera."}
                        </AlertDescription>
                    </Alert>
                ) : paused ? (
                    // Show paused state
                    <p className="text-muted-foreground">Scanner paused</p>
                ) : (
                    // Render the Scanner component if no error and not paused
                    <>
                        <RqrbScanner
                            onUpdate={handleUpdate}
                            onError={handleError} // Use the specific onError for device issues
                            delay={timeBetweenDecodingAttempts}
                            facingMode={facingMode}
                            stopStream={stopStream} // Pass through stopStream
                            // Using width/height props instead of absolute positioning the video
                            width={width}
                            height={height}
                            // Add constraints if needed, e.g., for aspect ratio, but width/height often suffice
                            videoConstraints={{
                                // Example: force a specific aspect ratio if needed
                                // aspectRatio: 16 / 9,
                                // Ensure the facingMode is passed within constraints if preferred
                                facingMode: facingMode
                            }}
                        />
                        {/* Visual cue for scanning area (optional) - place it over the scanner */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <ScanLine className="w-2/3 h-auto text-primary/50 animate-pulse" strokeWidth={1} />
                        </div>
                    </>
                )}

                {/* Initial Loading - Can be basic as the component handles camera init */}
                {/* This might flash briefly before the camera starts or an error occurs */}
                {!deviceError && !paused && !stopStream && (
                    // Simple placeholder while camera initializes (often very fast)
                    // Or you could add a more sophisticated loading state if needed
                    <div className="absolute inset-0 flex items-center justify-center bg-muted -z-10">
                        {/* <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> */}
                        {/* Keep it clean, scanner component might show video quickly */}
                    </div>
                )}
            </div>

            {/* --- REMOVE Torch Button Example using useZxing --- */}
            {/* Torch control would need state management if added back */}
            {/* Example (requires adding state like `[torchOn, setTorchOn] = useState(false);`):
                <button onClick={() => setTorchOn(prev => !prev)}>Toggle Torch</button>
                <RqrbScanner ... torch={torchOn} ... />
                Note the documentation's advice about toggling torch *after* mount.
            */}
        </div>
    );
};

BarcodeScanner.displayName = 'BarcodeScanner'; // Keep display name if used in dev tools