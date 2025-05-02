// lib/BarcodeScanner.tsx
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useZxing } from 'react-zxing'; // <-- Import the hook
import type { DecodeHintType } from '@zxing/library'; // Import hint types if needed
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';

type BarcodeScannerProps = {
    onResult: (value: string) => void;
    onError?: (error: Error) => void; // For errors *during* scanning or setup
    onDeviceError?: (error: Error) => void; // Specifically for device access errors
    className?: string;
    paused?: boolean; // Control scanning externally
    deviceId?: string; // Allow parent to pass specific device ID
    timeBetweenDecodingAttempts?: number; // Customize delay
};

export interface BarcodeScannerHandle {
    reset: () => void; // May not be needed with the hook's handling
    // Torch controls could be exposed here if needed
    // turnTorchOn: () => void;
    // turnTorchOff: () => void;
    // isTorchOn: () => boolean;
    // isTorchAvailable: () => boolean;
}

export const BarcodeScanner = forwardRef<BarcodeScannerHandle, BarcodeScannerProps>(
    (
        {
            onResult,
            onError, // General scanning errors
            onDeviceError, // Camera access errors
            className,
            paused = false,
            deviceId: initialDeviceId, // Device ID passed from parent
            timeBetweenDecodingAttempts
        },
        ref
    ) => {
        const [hasPermission, setHasPermission] = useState<boolean | null>(null);
        const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
        // Internal state for selected device, potentially overridden by parent prop
        const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(initialDeviceId);

        // Effect for permissions and devices (similar to before)
        useEffect(() => {
            let stream: MediaStream | null = null;
            const checkPermissionsAndDevices = async () => {
                try {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
                    setVideoDevices(videoInputDevices);

                    if (videoInputDevices.length > 0) {
                        stream = await navigator.mediaDevices.getUserMedia({ video: true });
                        setHasPermission(true);
                        // Set default/initial device only if not provided by parent
                        if (!initialDeviceId) {
                            const backCamera = videoInputDevices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
                            setSelectedDeviceId(backCamera?.deviceId || videoInputDevices[0]?.deviceId);
                        } else {
                            setSelectedDeviceId(initialDeviceId); // Use parent's preference
                        }
                    } else {
                        setHasPermission(false);
                        console.error("No video input devices found.");
                        if (onDeviceError) onDeviceError(new Error("No video input devices found."));
                    }
                } catch (err) {
                    console.error("Error accessing media devices.", err);
                    setHasPermission(false);
                    if (onDeviceError) onDeviceError(err instanceof Error ? err : new Error('Unknown camera access error'));
                } finally {
                    if (stream) stream.getTracks().forEach(track => track.stop());
                }
            };
            checkPermissionsAndDevices();
            return () => { if (stream) stream.getTracks().forEach(track => track.stop()); };
        }, [initialDeviceId, onDeviceError]); // Rerun if initialDeviceId changes

        // --- Use the useZxing Hook ---
        const {
            ref: zxingRef, // Ref for the <video> element
            torch,        // Torch controls (optional)
            // Other potential properties if needed from the hook
        } = useZxing({
            deviceId: selectedDeviceId as string, // Pass the selected device ID
            paused: paused || !selectedDeviceId || hasPermission === false, // Pause if prop says so, or no device/permission
            onDecodeResult(result) {
                onResult(result.getText()); // Call parent's handler with decoded text
            },
            onDecodeError(error) {
                if (error?.name !== 'NotFoundException' && !error?.message?.includes('NotFoundException')) {
                    console.error('Decode Error:', error);
                    if (onError) onError(error);
                }
            }
            ,
            onError(error: any) { // Catches other errors like camera stream issues
                console.error('Hook Error:', error);
                if (onDeviceError) onDeviceError(error); // Treat as device error
                setHasPermission(false); // Assume permission/access issue on hook error
            },
            timeBetweenDecodingAttempts,
        });

        // Expose methods via ref (reset might be less useful now)
        useImperativeHandle(ref, () => ({
            reset: () => {
                console.log('Scanner reset called - may not have direct effect on hook');
                // Hook might re-initialize based on prop changes anyway
            },
            // Example: Exposing torch controls
            // turnTorchOn: torch.on,
            // turnTorchOff: torch.off,
            // isTorchOn: () => torch.isOn,
            // isTorchAvailable: () => torch.isAvailable,
        }));


        return (
            <div className={cn("w-full space-y-4", className)}>
                {/* Optional Camera Selection Dropdown */}
                {videoDevices.length > 1 && (
                    <div className="space-y-1.5">
                        <Label htmlFor="camera-select-hook">Select Camera</Label>
                        <Select
                            value={selectedDeviceId}
                            onValueChange={setSelectedDeviceId} // Update local state, hook will react
                            disabled={paused} // Disable selection if paused
                        >
                            <SelectTrigger id="camera-select-hook">
                                <SelectValue placeholder="Select a camera" />
                            </SelectTrigger>
                            <SelectContent>
                                {videoDevices.map((device) => (
                                    <SelectItem key={device.deviceId} value={device.deviceId}>
                                        {device.label || `Camera ${device.deviceId.substring(0, 6)}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Video Element Area */}
                <div className="relative aspect-video bg-muted rounded-md overflow-hidden border border-dashed flex items-center justify-center">
                    {/* Render placeholder based on permission state */}
                    {hasPermission === null && (
                        <p className="text-muted-foreground text-sm flex items-center gap-1"><Loader2 className="h-4 w-4 animate-spin" /> Checking permissions...</p>
                    )}
                    {hasPermission === false && (
                        <Alert variant="destructive" className="m-4">
                            <Camera className="h-4 w-4" />
                            <AlertTitle>Camera Access Denied</AlertTitle>
                            <AlertDescription>Please grant camera permission.</AlertDescription>
                        </Alert>
                    )}
                    {/* Render video element only when ready */}
                    {hasPermission && (
                        <>
                            <video
                                ref={zxingRef} // Assign the ref from the hook to the video element
                                className={cn(
                                    "absolute top-0 left-0 w-full h-full object-cover",
                                    { 'hidden': paused } // Hide video if paused
                                )}
                            />
                            {/* Show placeholder if paused */}
                            {paused && <p className="text-muted-foreground">Scanner paused</p>}
                            {/* Visual cue for scanning area (optional) */}
                            {!paused && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <ScanLine className="w-2/3 h-auto text-primary/50 animate-pulse" strokeWidth={1} />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Optional Torch Button (Example) */}
                {/* {torch.isAvailable && hasPermission && (
                     <Button onClick={() => torch.isOn ? torch.off() : torch.on()} variant="outline" size="sm">
                         {torch.isOn ? 'Turn Off' : 'Turn On'} Torch
                     </Button>
                 )} */}
            </div>
        );
    }
);
BarcodeScanner.displayName = 'BarcodeScanner';