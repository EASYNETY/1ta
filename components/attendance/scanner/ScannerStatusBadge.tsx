"use client";

import { Badge } from "@/components/ui/badge";
import { 
    CheckCircle, 
    XCircle, 
    Loader2, 
    AlertTriangle, 
    ScanLine, 
    Wifi, 
    WifiOff, 
    PowerOff 
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
    socketStatus: string;
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
            if (scannerMode === 'external') {
                if (socketStatus === 'connected') {
                    return <Badge variant="success"><Wifi className="mr-1 h-3 w-3" /> External Scanner Ready</Badge>;
                } else if (socketStatus === 'connecting') {
                    return <Badge variant="outline"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Connecting Scanner...</Badge>;
                } else if (socketStatus === 'error') {
                    return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" /> Scanner Connection Error</Badge>;
                } else {
                    return <Badge variant="outline"><WifiOff className="mr-1 h-3 w-3" /> Scanner Disconnected</Badge>;
                }
            } else {
                return <Badge variant="success"><CheckCircle className="mr-1 h-3 w-3" /> Camera Scanner Ready</Badge>;
            }
        } else {
            return <Badge variant="secondary"><PowerOff className="mr-1 h-3 w-3" /> Scanner Paused</Badge>;
        }
    }

    return <Badge variant="secondary">Select a class to start</Badge>;
}
