"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCourseClass, setCourseClass } from "@/features/classes/store/classSessionSlice";
import {
    selectAllCourseClassOptions,
    selectCourseClassOptionsStatus
} from "@/features/classes/store/classes-slice";
import { fetchCourseClassOptionsForScanner } from "@/features/classes/store/classes-thunks";
import { CourseClassOption } from "@/features/classes/types/classes-types";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ScanLine, RefreshCw } from "lucide-react";

interface ClassSelectorProps {
    casualScanMode: boolean;
    setCasualScanMode: (mode: boolean) => void;
}

export function ClassSelector({ casualScanMode, setCasualScanMode }: ClassSelectorProps) {
    const dispatch = useAppDispatch();
    const selectedClass = useAppSelector(selectCourseClass);
    const classOptions = useAppSelector(selectAllCourseClassOptions) || [];
    const classOptionsStatus = useAppSelector(selectCourseClassOptionsStatus);
    const classOptionsLoading = classOptionsStatus === 'loading';
    const initialClassOptionsFetchAttempted = useRef(false);

    // Effect: Fetch class options when component mounts
    useEffect(() => {
        if (!initialClassOptionsFetchAttempted.current && classOptionsStatus !== 'loading' && classOptionsStatus !== 'succeeded') {
            console.log("ClassSelector: Fetching class options for scanner");
            dispatch(fetchCourseClassOptionsForScanner());
            initialClassOptionsFetchAttempted.current = true;
        }
    }, [dispatch, classOptionsStatus]);

    // Handle class selection
    const handleClassChange = (value: string) => {
        if (!value) {
            dispatch(setCourseClass({ id: '', courseName: "", sessionName: "" }));
            return;
        }

        const selectedOption = classOptions.find(option => option.id === value);
        if (selectedOption) {
            dispatch(setCourseClass({
                id: selectedOption.id,
                courseName: selectedOption.courseName,
                sessionName: selectedOption.sessionName,
            }));

            // If selecting a class, turn off casual mode
            if (casualScanMode) {
                setCasualScanMode(false);
            }
        }
    };

    // Handle retry fetch options
    const handleRetryFetchOptions = () => {
        dispatch(fetchCourseClassOptionsForScanner());
    };

    // Toggle casual scan mode
    const handleToggleCasualMode = (checked: boolean) => {
        setCasualScanMode(checked);

        // If enabling casual mode, clear selected class
        if (checked && selectedClass?.id) {
            dispatch(setCourseClass({ id: '', courseName: "", sessionName: "" }));
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Class Selection Dropdown */}
                <div className="flex-1">
                    <Label htmlFor="classSelect">Select Class</Label>
                    <Select
                        value={selectedClass?.id || ""}
                        onValueChange={handleClassChange}
                        disabled={classOptionsLoading || casualScanMode}
                    >
                        <SelectTrigger id="classSelect" className="w-full">
                            <SelectValue placeholder="Select a class to mark attendance" />
                        </SelectTrigger>
                        <SelectContent>
                            {classOptions.map((option: CourseClassOption) => (
                                <SelectItem key={option.id} value={option.id}>
                                    {option.courseName} - {option.sessionName}
                                </SelectItem>
                            ))}
                            {classOptions.length === 0 && !classOptionsLoading && (
                                <SelectItem value="no-classes" disabled>
                                    No classes available
                                </SelectItem>
                            )}
                            {classOptionsLoading && (
                                <SelectItem value="loading" disabled>
                                    Loading classes...
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
                            disabled={classOptionsLoading}
                        />
                        <Label htmlFor="casualMode" className="cursor-pointer flex items-center gap-1">
                            <ScanLine className="h-4 w-4 text-purple-500" />
                            Casual Mode
                        </Label>
                    </div>
                </div>

                {/* Retry Button - Only show when fetch failed */}
                {classOptionsStatus === 'failed' && (
                    <div className="flex-shrink-0 flex items-end">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleRetryFetchOptions}
                            className="h-10 w-10"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Helper Text */}
            {!selectedClass?.id && !casualScanMode && !classOptionsLoading && classOptionsStatus !== 'failed' && (
                <p className="text-xs text-muted-foreground">You must select a class before scanning can begin, or enable casual scan mode.</p>
            )}
            {casualScanMode && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <ScanLine className="h-4 w-4 text-purple-500" /> Casual scan mode:
                    <span className="font-medium text-purple-700">
                        Students will be identified but attendance won't be marked
                    </span>
                </p>
            )}
            {selectedClass?.id && !casualScanMode && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <ScanLine className="h-4 w-4" /> Scanning for:
                    <span className="font-medium text-primary">
                        {selectedClass.courseName} - {selectedClass.sessionName}
                    </span>
                </p>
            )}
        </div>
    );
}
