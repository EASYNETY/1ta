"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCourseClass, setCourseClass } from "@/features/classes/store/classSessionSlice";
// --- CORRECTED IMPORTS ---
import {
    selectAllAdminClasses,
    selectClassesStatus,
} from "@/features/classes/store/classes-slice";
import { fetchAllClassesAdmin } from "@/features/classes/store/classes-thunks";
import type { CourseClass, CourseClassOption } from "@/features/classes/types/classes-types";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ScanLine, RefreshCw, Loader2 } from "lucide-react";

interface ClassSelectorProps {
    casualScanMode: boolean;
    setCasualScanMode: (mode: boolean) => void;
}

export function ClassSelector({ casualScanMode, setCasualScanMode }: ClassSelectorProps) {
    const dispatch = useAppDispatch();
    const selectedClass = useAppSelector(selectCourseClass);

    // --- CORRECTED: Use the admin classes selector and status ---
    const allFetchedClasses = useAppSelector(selectAllAdminClasses);
    const classesStatus = useAppSelector(selectClassesStatus);
    const classesLoading = classesStatus === 'loading' || classesStatus === 'idle';

    // --- CORRECTED: Fetch all admin classes if needed ---
    useEffect(() => {
        if (classesStatus === 'idle' || classesStatus === 'failed') {
            dispatch(fetchAllClassesAdmin({ page: 1, limit: 5000 })); // Fetch all classes with very high limit
        }
    }, [dispatch, classesStatus]);


    // --- FIX APPLIED HERE: Map the full class objects to the simple option format ---
    const classOptions: CourseClassOption[] = useMemo(() => {
        if (!allFetchedClasses) return [];
        return allFetchedClasses.map((cls: CourseClass) => ({
            id: cls.id,
            // Use the most descriptive name available
            courseName: cls.course?.name || cls.courseTitle || cls.name,
            sessionName: cls.name, // The primary 'name' often serves as the session name
        }));
    }, [allFetchedClasses]);


    // Handle class selection
    const handleClassChange = (value: string) => {
        if (!value) {
            dispatch(setCourseClass({
                id: '',
                courseName: '',
                sessionName: ''
            })); // Clear the selected class            return;
        }

        // Find the selected option from our mapped `classOptions`
        const selectedOption = classOptions.find(option => option.id === value);
        if (selectedOption) {
            dispatch(setCourseClass(selectedOption));
            // If selecting a class, ensure casual mode is off
            if (casualScanMode) {
                setCasualScanMode(false);
            }
        }
    };

    // Handle retry fetch
    const handleRetryFetch = () => {
        dispatch(fetchAllClassesAdmin({ page: 1, limit: 5000 }));
    };

    // Toggle casual scan mode
    const handleToggleCasualMode = (checked: boolean) => {
        setCasualScanMode(checked);
        // If enabling casual mode, clear the selected class
        if (checked && selectedClass?.id) {
            dispatch(setCourseClass({ id: '', courseName: "", sessionName: "" }));
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Class Selection Dropdown */}
                <div className="flex-1">
                    <Label htmlFor="classSelect">Select Class for Attendance</Label>
                    <Select
                        value={selectedClass?.id || ""}
                        onValueChange={handleClassChange}
                        disabled={classesLoading || casualScanMode}
                    >
                        <SelectTrigger id="classSelect" className="w-full mt-2">
                            <SelectValue placeholder="Select a class to begin scanning..." />
                        </SelectTrigger>
                        <SelectContent>
                            {classesLoading && (
                                <SelectItem value="loading" disabled>
                                    <div className="flex items-center">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Loading classes...
                                    </div>
                                </SelectItem>
                            )}
                            {classOptions.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                    {option.courseName} - {option.sessionName}
                                </SelectItem>
                            ))}
                            {!classesLoading && classOptions.length === 0 && (
                                <SelectItem value="no-classes" disabled>
                                    No classes available to select.
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* Casual Mode Toggle */}
                <div className="flex-shrink-0 flex items-end">
                    <div className="flex items-center space-x-2 h-10">
                        <Switch
                            id="casualMode"
                            checked={casualScanMode}
                            onCheckedChange={handleToggleCasualMode}
                            disabled={classesLoading}
                        />
                        <Label htmlFor="casualMode" className="cursor-pointer flex items-center gap-1">
                            <ScanLine className="h-4 w-4 text-purple-500" />
                            Casual Mode
                        </Label>
                    </div>
                </div>

                {/* Retry Button */}
                {classesStatus === 'failed' && (
                    <div className="flex-shrink-0 flex items-end">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleRetryFetch}
                            className="h-10 w-10"
                            aria-label="Retry fetching classes"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Helper Text */}
            {casualScanMode ? (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <ScanLine className="h-4 w-4 text-purple-500" />
                    <strong>Casual Scan Mode is ON:</strong> Student barcodes will be identified without marking attendance.
                </p>
            ) : selectedClass?.id ? (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <ScanLine className="h-4 w-4 text-primary" />
                    <strong>Scanning for:</strong> {selectedClass.courseName} - {selectedClass.sessionName}
                </p>
            ) : (
                <p className="text-xs text-muted-foreground">
                    You must select a class before scanning can begin, or enable Casual Mode.
                </p>
            )}
        </div>
    );
}