"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wifi, WifiOff, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";

interface ExternalScannerStatusProps {
    socketStatus: string;
    reconnectSocket: () => void;
    connectionAttempts: number;
    maxAttempts: number;
    maxAttemptsReached: boolean;
    isActive: boolean;
}

export function ExternalScannerStatus({
    socketStatus,
    reconnectSocket,
    connectionAttempts,
    maxAttempts,
    maxAttemptsReached,
    isActive
}: ExternalScannerStatusProps) {
    // Calculate connection progress percentage
    const connectionProgress = maxAttemptsReached
        ? 100
        : (connectionAttempts / maxAttempts) * 100;

    return (
        <Card className="p-6 h-[350px] flex flex-col justify-center items-center">
            <div className="text-center space-y-6 w-full max-w-md">
                {/* Connection Status Icon */}
                <div className="flex justify-center">
                    {socketStatus === 'connected' ? (
                        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                            <Wifi className="h-8 w-8 text-green-600" />
                        </div>
                    ) : socketStatus === 'connecting' ? (
                        <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                        </div>
                    ) : socketStatus === 'error' ? (
                        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                    ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <WifiOff className="h-8 w-8 text-gray-600" />
                        </div>
                    )}
                </div>

                {/* Status Text */}
                <div>
                    <h3 className="text-lg font-medium mb-1">
                        {socketStatus === 'connected' ? 'External Scanner Connected' :
                         socketStatus === 'connecting' ? 'Connecting to Scanner...' :
                         socketStatus === 'error' ? 'Connection Error' :
                         'Scanner Disconnected'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {socketStatus === 'connected' ? 'Ready to receive barcode scans' :
                         socketStatus === 'connecting' ? `Attempting to connect (${connectionAttempts}/${maxAttempts})` :
                         socketStatus === 'error' ? 'Failed to connect to the external scanner' :
                         'Waiting for connection to external barcode scanner'}
                    </p>
                </div>

                {/* Connection Progress (only show when connecting or error) */}
                {(socketStatus === 'connecting' || (socketStatus === 'error' && maxAttemptsReached)) && (
                    <div className="w-full">
                        <Progress value={connectionProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                            {maxAttemptsReached
                                ? `Maximum connection attempts reached (${maxAttempts}/${maxAttempts})`
                                : `Connection attempt ${connectionAttempts} of ${maxAttempts}`}
                        </p>
                    </div>
                )}

                {/* Reconnect Button - Always show but with different styles based on status */}
                <Button
                    onClick={reconnectSocket}
                    variant={socketStatus === 'connected' ? "outline" : "default"}
                    className={`mt-2 ${socketStatus === 'connected' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800' : ''}`}
                    disabled={socketStatus === 'connecting' || !isActive}
                >
                    {socketStatus === 'connecting' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    {socketStatus === 'connected' ? 'Reconnect Scanner' :
                     socketStatus === 'connecting' ? 'Connecting...' :
                     socketStatus === 'error' ? 'Retry Connection' :
                     'Connect Scanner'}
                </Button>

                {/* Alert for inactive scanner */}
                {!isActive && (
                    <Alert variant="default" className="mt-4 bg-yellow-50 border-yellow-200">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <AlertTitle>Scanner Paused</AlertTitle>
                        <AlertDescription>
                            Resume the scanner to connect to the external device.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </Card>
    );
}
