// app/(authenticated)/attendance/scan/page.tsx
'use client';

import React, { FC, useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useToast } from '@/hooks/use-toast';

// --- Import the NEW BarcodeScanner component ---
import { BarcodeScanner } from '@/lib/BarcodeScanner'; // Adjusted path if necessary

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
import { ArrowLeft, CheckCircle, XCircle, Loader2, UserCheck, Power, PowerOff, AlertTriangle } from 'lucide-react'; // Added Power icons, AlertTriangle


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
    const [isLeaving, setIsLeaving] = useState(false); // State to trigger stopStream on unmount/navigation
    const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null);


    // --- Effects ---
    useEffect(() => {
        if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
            toast({ variant: "destructive", title: "Unauthorized", description: "Access denied." });
            router.replace('/dashboard');
            return; // Prevent further execution if unauthorized
        }

        // Reset marking status on mount
        dispatch(resetMarkingStatus());

        // Activate scanner only when a class is selected initially
        // Note: The second useEffect handles activation when class *changes*
        setIsScannerActive(!!selectedClass);

        // Cleanup function for when the component unmounts (e.g., navigating away)
        return () => {
            console.log("ScanPage unmounting, stopping stream...");
            setIsLeaving(true); // Signal to stop the stream in the BarcodeScanner component
            dispatch(resetMarkingStatus());
            if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
            // No need for a timeout here, just setting the state should be enough
            // for the BarcodeScanner's stopStream prop to take effect before unmount.
        };
    }, [user, router, toast, dispatch, selectedClass]); // Add selectedClass dependency here too

    // Effect to activate/deactivate scanner when selectedClass changes
    useEffect(() => {
        setIsScannerActive(!!selectedClass); // Activate scanner if class is selected, pause if not
        // Reset status if class changes
        if (selectedClass) {
            dispatch(resetMarkingStatus());
            setLastSuccessfulScan(null);
        } else {
            setIsLeaving(true); // Set leaving state if no class is selected
        }
        // Reset leaving state if class changes (relevant if user deselects then reselects)
        setIsLeaving(false);
    }, [selectedClass, dispatch]);


    // --- Handlers ---
    const handleCourseClassChange = (value: string) => {
        const selected = classOptions.find((option) => option.id === value);
        if (selected) {
            dispatch(setCourseClass(selected));
            console.log("Selected Class:", selected);
        } else {
            dispatch(setCourseClass({
                id: '',
                courseName: "",
                sessionName: "",
            })); // Use null or undefined consistently for no selection
        }
    };

    // Passed to BarcodeScanner's onResult prop
    const handleBarcodeScanResult = useCallback((scannedStudentId: string) => {
        // Double-check conditions here too, though scanner should be paused if met
        if (!selectedClass || isLoading || !isScannerActive || isLeaving) {
            console.log("Scan ignored:", { hasClass: !!selectedClass, isLoading, isScannerActive, isLeaving });
            return;
        }
        // Prevent re-processing the same scan immediately after success/error
        if (scannedStudentId === lastSuccessfulScan && (apiStatus === 'success' || apiStatus === 'error')) {
            console.log("Scan ignored: Same as last processed scan", scannedStudentId);
            return;
        }

        console.log("Handling Scanned Barcode:", scannedStudentId);
        console.log("Selected Class Context:", selectedClass);

        // *Temporarily pause scanning via state* right before dispatching
        setIsScannerActive(false);
        setLastSuccessfulScan(scannedStudentId); // Set immediately to prevent quick rescans
        dispatch(resetMarkingStatus()); // Reset status before new API call

        const payload = {
            studentId: scannedStudentId,
            classInstanceId: selectedClass.id,
            markedByUserId: user!.id, // Assuming user is guaranteed by initial check
            timestamp: new Date().toISOString(),
        };

        dispatch(markStudentAttendance(payload))
            .unwrap()
            .then((response) => {
                toast({ variant: "success", title: "Attendance Marked", description: `Student: ${response.studentId} marked. ${response.message || ''}` });
                // Keep lastSuccessfulScan set from before dispatch
                // Resume scanning after delay
                resultTimeoutRef.current = setTimeout(() => {
                    setLastSuccessfulScan(null); // Clear after timeout
                    dispatch(resetMarkingStatus());
                    // Re-activate scanner *only if* a class is still selected and not leaving
                    if (selectedClass && !isLeaving) setIsScannerActive(true);
                }, 1500); // Success delay
            })
            .catch((error) => { // Catch the rejected value directly
                const errorMsg = typeof error === 'string' ? error : 'An unknown error occurred.';
                toast({ variant: "destructive", title: "Marking Failed", description: `${errorMsg}. ID: ${scannedStudentId}` });
                // Keep lastSuccessfulScan set from before dispatch
                // Resume scanning after delay
                resultTimeoutRef.current = setTimeout(() => {
                    setLastSuccessfulScan(null); // Clear after timeout
                    dispatch(resetMarkingStatus()); // Keep error state until next scan/timeout
                    // Re-activate scanner *only if* a class is still selected and not leaving
                    if (selectedClass && !isLeaving) setIsScannerActive(true);
                }, 2500); // Error delay
            });

    }, [selectedClass, user, dispatch, toast, isLoading, isScannerActive, lastSuccessfulScan, apiStatus, isLeaving]); // Added isLeaving

    // Handle errors reported by the BarcodeScanner component itself (e.g., camera access)
    const handleScannerDeviceError = useCallback((error: Error) => {
        toast({
            variant: "destructive",
            title: "Scanner Error",
            description: error.message || "Could not initialize camera.",
        });
        setIsScannerActive(false); // Stop trying to scan if device error occurs
        // Optionally set an error state specific to the scanner device
    }, [toast]);

    // Optional: Handle decoding errors (e.g., barcode not found in frame)
    const handleScannerDecodeError = useCallback((error: Error) => {
        // Often 'NotFoundException' - you might want to ignore these or log sparingly
        if (error?.name !== 'NotFoundException') {
            console.warn("Scanner Decode Warning:", error.message);
            // Optionally provide subtle feedback that scanning is active but nothing is found
        }
    }, []);

    // --- UI Feedback ---
    const renderStatusFeedback = () => {
        if (isLoading) return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Processing...</Badge>;
        switch (apiStatus) {
            case 'success': return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300"><CheckCircle className="mr-1 h-3 w-3" /> Success: {lastMarkedStudentId}</Badge>;
            case 'error': return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Error: {apiError} (ID: {lastSuccessfulScan})</Badge>; // Show ID related to error
            case 'idle':
                if (isScannerActive) return <Badge variant="outline">Ready to scan</Badge>;
                if (!selectedClass) return <Badge variant="secondary">Select a class to start</Badge>
                return <Badge variant="secondary">Scanner paused</Badge>; // If paused manually or during processing
            default: return null;
        }
    };

    // --- Render ---
    return (
        <div className="mx-auto space-y-6">
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
                    // Disable selection while API call is in progress OR if leaving page
                    disabled={isLoading || isLeaving}
                >
                    <SelectTrigger id="courseClassSelect" className="w-full md:w-1/2 lg:w-1/3">
                        <SelectValue placeholder="Select a class to start scanning..." />
                    </SelectTrigger>
                    <SelectContent>
                        {classOptions.length === 0 && <SelectItem value="loading" disabled>Loading classes...</SelectItem>}
                        {/* Provide an explicit way to deselect */}
                        <SelectItem value="select-a-class">-- Select a Class --</SelectItem>
                        {classOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                                {option.courseName} - {option.sessionName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {!selectedClass && !isLeaving && <p className="text-xs text-muted-foreground pt-1">You must select a class before scanning.</p>}
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
                                // Disable button if API call is happening, no class selected, or leaving page
                                disabled={isLoading || !selectedClass || isLeaving}
                            >
                                {isScannerActive ? <PowerOff className="mr-2 h-4 w-4" /> : <Power className="mr-2 h-4 w-4" />}
                                {isScannerActive ? 'Pause Scanner' : 'Resume Scanner'}
                            </Button>
                        </div>
                        {/* --- Use the NEW BarcodeScanner --- */}
                        <BarcodeScanner
                            // --- Remove ref ---
                            onResult={handleBarcodeScanResult}
                            onDeviceError={handleScannerDeviceError} // Use the correct prop for device errors
                            onDecodeError={handleScannerDecodeError} // Optional: handle decode errors
                            paused={!isScannerActive} // Control via state
                            stopStream={isLeaving} // Pass the leaving state to stop stream on unmount
                            className="rounded-lg overflow-hidden shadow-inner"
                        // Optional: Add other props like facingMode, timeBetweenDecodingAttempts if needed
                        // timeBetweenDecodingAttempts={300} // Example: scan faster
                        // facingMode="user" // Example: use front camera
                        />
                    </>
                ) : (
                    !isLeaving && ( // Don't show this alert if we are just navigating away
                        <Alert variant="default" className="mt-6">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Select a Class</AlertTitle>
                            <AlertDescription>
                                Please choose a class or session from the dropdown above to begin scanning attendance.
                            </AlertDescription>
                        </Alert>
                    )
                )}
            </div>

            {/* Status Feedback Area */}
            <div className="text-center pt-2 min-h-[2.5rem] mt-4">
                {!isLeaving && renderStatusFeedback()}
            </div>
        </div>
    );
};

export default ScanPage;