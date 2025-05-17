"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import BarcodeScanner from "@/lib/barcode-scanner";
import { ExternalScannerStatus } from "./ExternalScannerStatus";

export type ScannerMode = "camera" | "external";

interface ScannerModeSelectorProps {
    scannerMode: ScannerMode;
    setScannerMode: (mode: ScannerMode) => void;
    isScannerActive: boolean;
    onBarcodeDetected: (barcode: any) => void;
    socketStatus: string;
    reconnectSocket: () => void;
    connectionAttempts: number;
    maxAttempts: number;
    maxAttemptsReached: boolean;
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
    maxAttemptsReached
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
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="camera">Camera Scanner</TabsTrigger>
                    <TabsTrigger value="external">External Scanner</TabsTrigger>
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
            </Tabs>
        </div>
    );
}
