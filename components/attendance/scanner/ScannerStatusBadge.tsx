"use client";

import { Badge } from "@/components/ui/badge";
import {
    CheckCircle,
    Loader2,  // Still needed for loading state
    AlertTriangle,  // Still needed for error state
    ScanLine,
    // Wifi,  // Commented out for now - will be used when WebSocket scanner is re-enabled
    // WifiOff,  // Commented out for now - will be used when WebSocket scanner is re-enabled
    PowerOff,
    Keyboard
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectCourseClass } from "@/features/classes/store/classSessionSlice";
import {
    selectUsersLoading,
    selectUsersError
} from "@/features/auth/store/auth-selectors";
import { safeArray } from "@/lib/utils/safe-data";

interface ScannerStatusBadgeProps {
    isScannerActive: boolean;
    casualScanMode: boolean;
    scannerMode: string;
    socketStatus?: string; // Made optional since WebSocket scanner is commented out for now
    allFetchedUsers: any[];
}

export function ScannerStatusBadge({
    isScannerActive,
    casualScanMode,
    scannerMode,
    socketStatus,
    allFetchedUsers
}: ScannerStatusBadgeProps) {
    const selectedClass = useAppSelector(selectCourseClass);
    const isLoadingStudents = useAppSelector(selectUsersLoading);
    const studentsFetchError = useAppSelector(selectUsersError);

    // Use safeArray to ensure allFetchedUsers is always an array
    const users = safeArray(allFetchedUsers);

    // Loading state
    if (isLoadingStudents) {
        return <Badge variant="outline"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Loading Students...</Badge>;
    }

    // Error state
    if (studentsFetchError && users.length === 0) {
        return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" /> Students Failed to Load</Badge>;
    }

    // Casual scan mode badge
    if (casualScanMode) {
        if (isScannerActive) {
            return <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-300">
                <ScanLine className="mr-1 h-3 w-3" /> Casual Scan Mode (View Only)
            </Badge>;
        } else {
            return <Badge variant="secondary" className="bg-purple-50/50 text-purple-700/70 border-purple-300/50">
                <PowerOff className="mr-1 h-3 w-3" /> Casual Scan Mode Paused
            </Badge>;
        }
    }

    // Regular mode with class selected
    if (selectedClass?.id) {
        if (isScannerActive) {
            // WebSocket scanner mode commented out for now
            /*if (scannerMode === 'external') {
                if (socketStatus === 'connected') {
                    return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200"><Wifi className="mr-1 h-3 w-3" /> WebSocket Scanner Ready</Badge>;
                } else if (socketStatus === 'connecting') {
                    return <Badge variant="outline"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Connecting Scanner...</Badge>;
                } else if (socketStatus === 'error') {
                    return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" /> Scanner Connection Error</Badge>;
                } else {
                    return <Badge variant="outline"><WifiOff className="mr-1 h-3 w-3" /> Scanner Disconnected</Badge>;
                }
            } else*/ if (scannerMode === 'direct') {
                return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200"><Keyboard className="mr-1 h-3 w-3" /> USB Scanner Ready</Badge>;
            } else {
                return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="mr-1 h-3 w-3" /> Camera Scanner Ready</Badge>;
            }
        } else {
            return <Badge variant="secondary"><PowerOff className="mr-1 h-3 w-3" /> Scanner Paused</Badge>;
        }
    }

    return <Badge variant="secondary">Select a class to start</Badge>;
}
