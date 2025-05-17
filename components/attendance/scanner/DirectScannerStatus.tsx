"use client";

import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Keyboard, KeyboardOff, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DirectScannerStatusProps {
    status: string;
    isActive: boolean;
    lastScanTime: number | null;
    errorMessage: string | null;
}

export function DirectScannerStatus({
    status,
    isActive,
    lastScanTime,
    errorMessage
}: DirectScannerStatusProps) {
    // Calculate time since last scan
    const getTimeSinceLastScan = () => {
        if (!lastScanTime) return null;
        
        const seconds = Math.floor((Date.now() - lastScanTime) / 1000);
        
        if (seconds < 60) return `${seconds} seconds ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        return `${Math.floor(seconds / 3600)} hours ago`;
    };

    const timeSinceLastScan = getTimeSinceLastScan();

    return (
        <Card className="p-6 h-[350px] flex flex-col justify-center items-center backdrop-blur-sm border border-card/30 shadow-lg">
            <div className="text-center space-y-6 w-full max-w-md">
                {/* Scanner Status Icon */}
                <div className="flex justify-center relative">
                    {status === 'active' && isActive ? (
                        <div className="relative">
                            {/* Outer ping animation */}
                            <div className="absolute inset-0 rounded-full bg-green-500/20 dark:bg-green-500/30 animate-ping-slow"></div>
                            {/* Middle glow */}
                            <div className="absolute inset-0 rounded-full bg-green-400/20 dark:bg-green-400/20 blur-md"></div>
                            {/* Inner container */}
                            <div className="relative z-10 bg-background dark:bg-background/80 rounded-full p-4 border border-green-200 dark:border-green-800 shadow-lg">
                                <Keyboard className="h-10 w-10 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    ) : status === 'error' ? (
                        <div className="bg-background dark:bg-background/80 rounded-full p-4 border border-red-200 dark:border-red-800 shadow-lg">
                            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
                        </div>
                    ) : (
                        <div className="bg-background dark:bg-background/80 rounded-full p-4 border border-muted shadow-lg">
                            <KeyboardOff className="h-10 w-10 text-muted-foreground" />
                        </div>
                    )}
                </div>

                {/* Status Text */}
                <div>
                    <h3 className={cn(
                        "text-lg font-medium mb-1",
                        status === 'active' && isActive && "text-green-700 dark:text-green-400",
                        status === 'error' && "text-red-700 dark:text-red-400"
                    )}>
                        {status === 'active' && isActive ? 'Direct Scanner Active' :
                         status === 'error' ? 'Scanner Error' :
                         'Scanner Inactive'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {status === 'active' && isActive ? 'Ready to receive barcode scans from USB/HID scanner' :
                         status === 'error' ? (errorMessage || 'An error occurred with the scanner') :
                         'Scanner is currently disabled'}
                    </p>
                </div>

                {/* Last Scan Info */}
                {lastScanTime && (
                    <div className="mt-4">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Last scan: {timeSinceLastScan}
                        </Badge>
                    </div>
                )}

                {/* Error Message */}
                {status === 'error' && errorMessage && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Scanner Error</AlertTitle>
                        <AlertDescription>
                            {errorMessage}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Instructions */}
                <div className="mt-4 text-sm text-muted-foreground">
                    <p>Connect your USB barcode scanner and scan a barcode.</p>
                    <p className="mt-1">Make sure the scanner is configured for keyboard emulation mode.</p>
                </div>
            </div>
        </Card>
    );
}
