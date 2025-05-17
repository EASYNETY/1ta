"use client";

import { Button } from "@/components/ui/button";
import { Power, PowerOff } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectCourseClass } from "@/features/classes/store/classSessionSlice";
import { selectAttendanceMarkingLoading } from "@/features/attendance/store/attendance-slice";

interface ScannerControlsProps {
    isScannerActive: boolean;
    toggleScanner: () => void;
    casualScanMode: boolean;
    fetchingStudentInfo: boolean;
}

export function ScannerControls({
    isScannerActive,
    toggleScanner,
    casualScanMode,
    fetchingStudentInfo
}: ScannerControlsProps) {
    const selectedClass = useAppSelector(selectCourseClass);
    const markingLoading = useAppSelector(selectAttendanceMarkingLoading);

    return (
        <div>
            {/* Manual Pause/Resume Button */}
            {(selectedClass?.id || casualScanMode) && (
                <Button
                    variant="outline"
                    size="default"
                    onClick={toggleScanner}
                    disabled={(!selectedClass?.id && !casualScanMode) || markingLoading || fetchingStudentInfo}
                    className="w-full sm:w-auto flex-shrink-0"
                >
                    {isScannerActive ? <PowerOff className="mr-2 h-4 w-4" /> : <Power className="mr-2 h-4 w-4" />}
                    {isScannerActive ? "Pause Scanner" : "Resume Scanner"}
                </Button>
            )}
        </div>
    );
}
