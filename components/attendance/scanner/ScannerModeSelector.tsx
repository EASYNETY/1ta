"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import BarcodeScanner from "@/lib/barcode-scanner";
import { ExternalScannerStatus } from "./ExternalScannerStatus";
import { DirectScannerStatus } from "./DirectScannerStatus";

export type ScannerMode = "camera" | "external" | "direct";

interface ScannerModeSelectorProps {
    scannerMode: ScannerMode;
    setScannerMode: (mode: ScannerMode) => void;
    isScannerActive: boolean;
    onBarcodeDetected: (barcode: any) => void;
    // WebSocket external scanner props
    socketStatus: string;
    reconnectSocket: () => void;
    connectionAttempts: number;
    maxAttempts: number;
    maxAttemptsReached: boolean;
    // Direct USB scanner props
    directScannerStatus: string;
    directScannerLastScanTime: number | null;
    directScannerErrorMessage: string | null;
}

export function ScannerModeSelector({
    scannerMode,
    setScannerMode,
    isScannerActive,
    onBarcodeDetected,
    socketStatus,
    reconnectSocket,
    connectionAttempts,
    maxAttempts,
    maxAttemptsReached,
    directScannerStatus,
    directScannerLastScanTime,
    directScannerErrorMessage
}: ScannerModeSelectorProps) {
    return (
        <div className="pt-4">
            <Label htmlFor="scannerMode">Scanner Mode</Label>
            <Tabs
                defaultValue="camera"
                value={scannerMode}
                onValueChange={(value) => setScannerMode(value as ScannerMode)}
                className="w-full mt-2"
            >
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="camera">Camera</TabsTrigger>
                    <TabsTrigger value="external">WebSocket</TabsTrigger>
                    <TabsTrigger value="direct">USB/HID</TabsTrigger>
                </TabsList>

                <TabsContent value="camera" className="mt-4">
                    <div className="flex justify-center items-center w-full h-[350px]">
                        <div className="w-full max-w-md">
                            <BarcodeScanner
                                width="100%"
                                height={300}
                                onDetected={onBarcodeDetected}
                                isActive={scannerMode === 'camera' && isScannerActive}
                                scanDelay={750}
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="external" className="mt-4">
                    <ExternalScannerStatus
                        socketStatus={socketStatus}
                        reconnectSocket={reconnectSocket}
                        connectionAttempts={connectionAttempts}
                        maxAttempts={maxAttempts}
                        maxAttemptsReached={maxAttemptsReached}
                        isActive={isScannerActive}
                    />
                </TabsContent>

                <TabsContent value="direct" className="mt-4">
                    <DirectScannerStatus
                        status={directScannerStatus}
                        isActive={scannerMode === 'direct' && isScannerActive}
                        lastScanTime={directScannerLastScanTime}
                        errorMessage={directScannerErrorMessage}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
