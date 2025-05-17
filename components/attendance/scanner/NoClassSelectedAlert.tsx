"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import {
    selectCourseClassOptionsStatus
} from "@/features/classes/store/classes-slice";

interface NoClassSelectedAlertProps {
    casualScanMode: boolean;
    onRetryFetchOptions: () => void;
}

export function NoClassSelectedAlert({
    casualScanMode,
    onRetryFetchOptions
}: NoClassSelectedAlertProps) {
    const classOptionsStatus = useAppSelector(selectCourseClassOptionsStatus);
    const classOptionsLoading = classOptionsStatus === 'loading';

    // Don't show if in casual mode
    if (casualScanMode) {
        return null;
    }

    return (
        <div className="space-y-4 pt-4">
            <Alert variant="default" className="mt-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Select a Class or Enable Casual Mode</AlertTitle>
                <AlertDescription>
                    {classOptionsLoading ? "Loading class list..." :
                        classOptionsStatus === 'failed' ? "Could not load class list. Please try again." :
                            "Please choose a class from the dropdown above to mark attendance, or enable casual scan mode to just view student details without marking attendance."}
                    {classOptionsStatus === 'failed' &&
                        <Button variant="link" size="sm" onClick={onRetryFetchOptions} className="p-0 h-auto text-xs mt-1">Retry loading classes</Button>
                    }
                </AlertDescription>
            </Alert>
        </div>
    );
}
