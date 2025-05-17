"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wifi, WifiOff, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
        <Card className="p-6 h-auto flex flex-col justify-center items-center backdrop-blur-sm border border-card/30 shadow-lg">
            <div className="text-center space-y-6 w-full max-w-md">
                {/* Connection Status Icon with Ping Effect */}
                <div className="flex justify-center relative">
                    {socketStatus === 'connected' ? (
                        <div className="relative">
                            {/* Outer ping animation */}
                            <div className="absolute inset-0 rounded-full bg-green-500/20 dark:bg-green-500/30 animate-ping-slow"></div>
                            {/* Middle glow */}
                            <div className="absolute inset-0 rounded-full bg-green-400/20 dark:bg-green-400/20 blur-md"></div>
                            {/* Inner container */}
                            <div className="relative h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/60 flex items-center justify-center border border-green-200 dark:border-green-700 shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                                <Wifi className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    ) : socketStatus === 'connecting' ? (
                        <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center border border-blue-200 dark:border-blue-700 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                            <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
                        </div>
                    ) : socketStatus === 'error' ? (
                        <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/60 flex items-center justify-center border border-red-200 dark:border-red-700 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                    ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800/60 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                            <WifiOff className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Status Text */}
                <div>
                    <h3 className={cn(
                        "text-lg font-medium mb-1",
                        socketStatus === 'connected' && "text-green-700 dark:text-green-400",
                        socketStatus === 'connecting' && "text-blue-700 dark:text-blue-400",
                        socketStatus === 'error' && "text-red-700 dark:text-red-400"
                    )}>
                        {socketStatus === 'connected' ? 'External Scanner Connected' :
                         socketStatus === 'connecting' ? 'Connecting to Scanner...' :
                         socketStatus === 'error' ? 'Connection Error' :
                         'Scanner Disconnected'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {socketStatus === 'connected' ? 'Ready to receive barcode scans from external scanner' :
                         socketStatus === 'connecting' ? `Attempting to connect (${connectionAttempts}/${maxAttempts})` :
                         socketStatus === 'error' ? 'Failed to connect to the external scanner' :
                         'Waiting for connection to external barcode scanner'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        WebSocket URL: {process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'Not configured'}
                    </p>
                </div>

                {/* Connection Progress (only show when connecting or error) */}
                {(socketStatus === 'connecting' || (socketStatus === 'error' && maxAttemptsReached)) && (
                    <div className="w-full">
                        <Progress
                            value={connectionProgress}
                            className={cn(
                                "h-2",
                                socketStatus === 'connecting' && "bg-blue-100 dark:bg-blue-950/50",
                                socketStatus === 'error' && "bg-red-100 dark:bg-red-950/50",
                                // Apply indicator styles via CSS variables that will be picked up by the component
                                socketStatus === 'connecting' && "[--progress-indicator:theme(colors.blue.500)] dark:[--progress-indicator:theme(colors.blue.600)]",
                                socketStatus === 'error' && "[--progress-indicator:theme(colors.red.500)] dark:[--progress-indicator:theme(colors.red.600)]"
                            )}
                        />
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
                    className={cn(
                        "mt-2 transition-all duration-300",
                        socketStatus === 'connected' && "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/50",
                        socketStatus === 'error' && "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800",
                        socketStatus === 'disconnected' && "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                    )}
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
                    <Alert variant="default" className="mt-4 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <AlertTitle className="text-yellow-800 dark:text-yellow-400">Scanner Paused</AlertTitle>
                        <AlertDescription className="text-yellow-700 dark:text-yellow-300/80">
                            Resume the scanner to connect to the external device.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Debug information - only show in development */}
                {process.env.NODE_ENV !== 'production' && socketStatus === 'connected' && (
                    <div className="mt-4 p-3 border border-dashed border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900/50 text-xs">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Debug Information</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                            Expected message format: <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded">{"{ type: 'barcode_scan_received', data: { barcodeId: 'CODE123', timestamp: '...', status: 'received' } }"}</code>
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Check browser console for detailed WebSocket message logs.
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
}
