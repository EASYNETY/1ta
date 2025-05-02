// app/(authenticated)/attendance/scan/page.tsx
'use client';

import React, { FC, useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useToast } from '@/hooks/use-toast';

// Your custom hook and slice action/selectors
import type { CourseClassOption } from "@/features/classes/hooks/useCourseClassOptions";
import { useCourseClassOptions } from "@/features/classes/hooks/useCourseClassOptions";
import { selectCourseClass, setCourseClass } from "@/features/classes/store/classSessionSlice";

// The attendance marking slice and actions
import {
    markStudentAttendance,
    resetMarkingStatus,
    selectAttendanceMarkingLoading,
    selectAttendanceMarkingError,
    selectAttendanceMarkingStatus,
    selectLastMarkedStudentId,
} from '@/features/attendance/store/attendance-slice'; // Adjust path

// UI Components
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, Loader2, UserCheck, Power, PowerOff } from 'lucide-react'; // Added Power icons
import { BarcodeScanner } from "@/lib/BarcodeScanner"; // Import the hook-based BarcodeScanner
import type { BarcodeScannerHandle } from "@/lib/BarcodeScanner"; // Import the handle type

const ScanPage: FC = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { toast } = useToast();

    // State from Redux store
    const { user } = useAppSelector((state) => state.auth);
    const selectedClass = useAppSelector(selectCourseClass);
    const isLoading = useAppSelector(selectAttendanceMarkingLoading);
    const apiError = useAppSelector(selectAttendanceMarkingError);
    const apiStatus = useAppSelector(selectAttendanceMarkingStatus);
    const lastMarkedStudentId = useAppSelector(selectLastMarkedStudentId);

    // Local state for this page
    const classOptions = useCourseClassOptions();
    const [lastSuccessfulScan, setLastSuccessfulScan] = useState<string | null>(null);
    const [isScannerActive, setIsScannerActive] = useState(false); // Control scanner activity
    const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const scannerRef = useRef<BarcodeScannerHandle>(null);

    // --- Effects ---
    useEffect(() => {
        if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
            toast({ variant: "destructive", title: "Unauthorized", description: "Access denied." });
            router.replace('/dashboard');
        }
        // Reset marking status on mount/unmount
        dispatch(resetMarkingStatus());
        // Activate scanner only when a class is selected initially or changes
        setIsScannerActive(!!selectedClass); // Activate if class selected
        return () => {
            dispatch(resetMarkingStatus());
            if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
        }
    }, [user, router, toast, dispatch]); // Run only once or when user changes

    // Effect to activate/deactivate scanner when selectedClass changes
    useEffect(() => {
        setIsScannerActive(!!selectedClass); // Activate scanner if class is selected, pause if not
        // Reset status if class changes
        if (selectedClass) {
            dispatch(resetMarkingStatus());
            setLastSuccessfulScan(null);
        }
    }, [selectedClass, dispatch]);


    // --- Handlers ---
    const handleCourseClassChange = (value: string) => {
        const selected = classOptions.find((option) => option.id === value);
        if (selected) {
            dispatch(setCourseClass(selected));
            // No need to manually activate scanner here, useEffect handles it
            console.log("Selected Class:", selected);
        } else {
            dispatch(setCourseClass({
                id: "",
                courseName: "",
                sessionName: "",
            })); // Reset selected class if 'select...' option chosen
        }
    };

    // Passed to BarcodeScanner's onResult prop
    const handleBarcodeScanResult = useCallback((scannedStudentId: string) => {
        // Double-check conditions here too, though scanner should be paused if met
        if (!selectedClass || isLoading || !isScannerActive) {
            return;
        }
        if (scannedStudentId === lastSuccessfulScan && apiStatus !== 'idle') {
            return;
        }

        console.log("Handling Scanned Barcode:", scannedStudentId);
        console.log("Selected Class Context:", selectedClass);

        // *Temporarily pause scanning via state* right before dispatching
        setIsScannerActive(false);
        dispatch(resetMarkingStatus());

        const payload = {
            studentId: scannedStudentId,
            classInstanceId: selectedClass.id,
            markedByUserId: user!.id,
            timestamp: new Date().toISOString(),
        };

        dispatch(markStudentAttendance(payload))
            .unwrap()
            .then((response) => {
                toast({ variant: "success", title: "Attendance Marked", description: `Student: ${response.studentId} marked. ${response.message || ''}` });
                setLastSuccessfulScan(response.studentId);
                // Resume scanning after delay
                resultTimeoutRef.current = setTimeout(() => {
                    setLastSuccessfulScan(null);
                    dispatch(resetMarkingStatus());
                    // Re-activate scanner *only if* a class is still selected
                    if (selectedClass) setIsScannerActive(true);
                }, 1500);
            })
            .catch((errorMsg) => {
                toast({ variant: "destructive", title: "Marking Failed", description: `${errorMsg}. ID: ${scannedStudentId}` });
                setLastSuccessfulScan(scannedStudentId);
                // Resume scanning after delay
                resultTimeoutRef.current = setTimeout(() => {
                    setLastSuccessfulScan(null);
                    dispatch(resetMarkingStatus());
                    // Re-activate scanner *only if* a class is still selected
                    if (selectedClass) setIsScannerActive(true);
                }, 2500);
            });

    }, [selectedClass, user, dispatch, toast, isLoading, isScannerActive, lastSuccessfulScan, apiStatus]);

    // Handle errors reported by the BarcodeScanner component itself (e.g., camera access)
    const handleScannerDeviceError = useCallback((error: Error) => {
        toast({
            variant: "destructive",
            title: "Scanner Error",
            description: error.message || "Could not initialize camera.",
        });
        setIsScannerActive(false); // Stop trying to scan if device error occurs
    }, [toast]);

    // --- UI Feedback ---
    const renderStatusFeedback = () => {
        if (isLoading) return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Processing...</Badge>;
        switch (apiStatus) {
            case 'success': return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300"><CheckCircle className="mr-1 h-3 w-3" /> Success: {lastMarkedStudentId}</Badge>;
            case 'error': return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Error: {apiError}</Badge>;
            case 'idle':
                if (isScannerActive) return <Badge variant="outline">Ready to scan</Badge>;
                if (!selectedClass) return <Badge variant="secondary">Select a class to start</Badge>
                return <Badge variant="secondary">Scanner paused</Badge>; // If paused manually or during processing
            default: return null;
        }
    };

    // --- Render ---
    return (
        <div className="container mx-auto py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">Scan Attendance</h1>
            </div>

            {/* Class Selection */}
            <div className="space-y-1.5">
                <Label htmlFor="courseClassSelect">Select Class/Session</Label>
                <Select
                    value={selectedClass?.id || ""}
                    onValueChange={handleCourseClassChange}
                    disabled={isLoading} // Disable only during API call, not general pause
                >
                    <SelectTrigger id="courseClassSelect" className="w-full md:w-1/2 lg:w-1/3">
                        <SelectValue placeholder="Select a class to start scanning..." />
                    </SelectTrigger>
                    <SelectContent>
                        {classOptions.length === 0 && <SelectItem value="loading" disabled>Loading classes...</SelectItem>}
                        <SelectItem value="Select">-- Select a Class --</SelectItem> {/* Add option to deselect */}
                        {classOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                                {option.courseName} - {option.sessionName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {!selectedClass && <p className="text-xs text-muted-foreground pt-1">You must select a class before scanning.</p>}
            </div>

            {/* Scanner Section */}
            <div className="mt-4 space-y-4">
                {selectedClass ? (
                    <>
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <UserCheck className="h-4 w-4" /> Scanning for: <span className='font-medium'>{selectedClass.courseName} - {selectedClass.sessionName}</span>
                            </p>
                            {/* Manual Pause/Resume Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsScannerActive(prev => !prev)}
                                disabled={isLoading || !selectedClass} // Disable if loading or no class selected
                            >
                                {isScannerActive ? <PowerOff className="mr-2 h-4 w-4" /> : <Power className="mr-2 h-4 w-4" />}
                                {isScannerActive ? 'Pause Scanner' : 'Resume Scanner'}
                            </Button>
                        </div>
                        <BarcodeScanner
                            ref={scannerRef}
                            onResult={handleBarcodeScanResult}
                            onDeviceError={handleScannerDeviceError}
                            paused={!isScannerActive} // Control via state
                            className="rounded-lg overflow-hidden shadow-inner"
                        />
                    </>
                ) : (
                    <Alert variant="default" className="mt-6">
                        <AlertTitle>Select a Class</AlertTitle>
                        <AlertDescription>
                            Please choose a class or session from the dropdown above to begin scanning attendance.
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Status Feedback Area */}
            <div className="text-center pt-2 min-h-[2.5rem] mt-4">
                {renderStatusFeedback()}
            </div>
        </div>
    );
};

export default ScanPage;