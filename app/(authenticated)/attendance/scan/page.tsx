// app/(authenticated)/attendance/scan/page.tsx

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import useExternalScannerSocket from "@/hooks/use-external-scanner-socket";
import useDirectScanner from "@/hooks/use-direct-scanner";
import { beepSounds } from "@/public/sound/beep";

// Redux imports
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetMarkingStatus } from "@/features/attendance/store/attendance-slice";
import { selectCourseClass } from "@/features/classes/store/classSessionSlice";
import { selectSafeUsers } from "@/features/auth/store/auth-selectors";
import { fetchCourseClassOptionsForScanner } from "@/features/classes/store/classes-thunks";
import { fetchUsersByRole } from "@/features/auth/store/user-thunks";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/auth/page-header";

// Custom Components
import { ClassSelector } from "@/components/attendance/scanner/ClassSelector";
import { ScannerModeSelector } from "@/components/attendance/scanner/ScannerModeSelector";
import { ScannerControls } from "@/components/attendance/scanner/ScannerControls";
import { ScannerStatusBadge } from "@/components/attendance/scanner/ScannerStatusBadge";
import { ScanResultHandler } from "@/components/attendance/scanner/ScanResultHandler";
import { NoClassSelectedAlert } from "@/components/attendance/scanner/NoClassSelectedAlert";

// Types
interface StudentInfo {
    id: string;
    name: string;
    email: string;
    dateOfBirth?: string | null;
    classId?: string | null;
    barcodeId: string;
    isActive?: boolean;
    avatarUrl?: string | null;
}

export default function ScanPage() {
    const router = useRouter();
    const { toast } = useToast();
    const dispatch = useAppDispatch();

    // Redux state
    const loggedInUser = useAppSelector((state) => state.auth.user);
    const allFetchedUsers = useAppSelector((state) => selectSafeUsers(state));
    const selectedClass = useAppSelector(selectCourseClass);

    // Local state
    const [isScannerActive, setIsScannerActive] = useState(false);
    const [lastScannedId, setLastScannedId] = useState<string | null>(null);
    const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
    const [fetchingStudentInfo, setFetchingStudentInfo] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scannerMode, setScannerMode] = useState<"camera" | "external" | "direct">("direct");
    const [casualScanMode, setCasualScanMode] = useState(false);

    // Refs to track initialization
    const initialStudentsFetchAttempted = useRef(false);

    // Effect: User validation
    useEffect(() => {
        if (loggedInUser === undefined) return;
        if (!loggedInUser || (loggedInUser.role !== "admin" && loggedInUser.role !== "teacher")) {
            toast({ variant: "destructive", title: "Unauthorized", description: "Access denied." });
            router.replace("/dashboard");
            return;
        }
        dispatch(resetMarkingStatus());
    }, [loggedInUser, dispatch, router, toast]);

    // Effect: Fetch all students when component mounts
    useEffect(() => {
        if (loggedInUser && !initialStudentsFetchAttempted.current) {
            console.log("ScanPage: Fetching all students for barcode lookup.");
            dispatch(fetchUsersByRole({ role: "student" }));
            initialStudentsFetchAttempted.current = true;
        }
    }, [dispatch, loggedInUser]);

    // Handle barcode detection
    const handleBarcodeDetected = useCallback(async (scannedData: any) => {
        console.log("--- Scan Detected ---", scannedData);
        setIsScannerActive(false);
        setIsModalOpen(true);
        dispatch(resetMarkingStatus());

        // Play beep sound when barcode is detected
        beepSounds.scanner();

        // Handle different types of scanned data
        let scannedBarcodeId: string;

        if (typeof scannedData === 'object') {
            if (scannedData?.text) {
                // Camera scanner format
                scannedBarcodeId = scannedData.text.trim();
                console.log("Camera scanner format detected");
            } else if (scannedData?.barcodeId) {
                // Direct barcodeId property
                scannedBarcodeId = scannedData.barcodeId.trim();
                console.log("Direct barcodeId property detected");
            } else if (scannedData?.data?.barcodeId) {
                // Nested data.barcodeId property
                scannedBarcodeId = scannedData.data.barcodeId.trim();
                console.log("Nested data.barcodeId property detected");
            } else {
                // Unknown object format, convert to string
                scannedBarcodeId = String(scannedData).trim();
                console.log("Unknown object format, converted to string");
            }
        } else {
            // Simple string format
            scannedBarcodeId = String(scannedData ?? '').trim();
            console.log("Simple string format detected");
        }

        setLastScannedId(scannedBarcodeId);
        console.log(`Processed Barcode ID: "${scannedBarcodeId}" from ${scannerMode} scanner`);

        setFetchingStudentInfo(true);
    }, [dispatch, scannerMode]);

    // WebSocket for external scanner - commented out for now, will be used in future
    const isWebSocketEnabled = false; // scannerMode === 'external' && isScannerActive;

    // Use the external scanner socket hook with verbose logging - keeping the code but disabling it
    const {
        status: socketStatus,
        reconnect: reconnectSocket,
        connectionAttempts,
        maxAttempts,
        maxAttemptsReached
    } = useExternalScannerSocket({
        onBarcodeReceived: handleBarcodeDetected,
        isEnabled: isWebSocketEnabled, // Always disabled for now
        verbose: false // Disable verbose logging since we're not using it
    });

    // Direct USB/HID scanner
    const isDirectScannerEnabled = scannerMode === 'direct' && isScannerActive;

    // Use the direct scanner hook
    const {
        status: directScannerStatus,
        lastScanTime: directScannerLastScanTime,
        errorMessage: directScannerErrorMessage
    } = useDirectScanner({
        onBarcodeReceived: handleBarcodeDetected,
        isEnabled: isDirectScannerEnabled,
        verbose: process.env.NODE_ENV !== 'production', // Enable verbose logging only in development
        scanDelay: 500, // Minimum delay between scans in ms
        minLength: 3,   // Minimum barcode length
        maxLength: 100, // Maximum barcode length
        timeout: 50     // Timeout for scan sequence in ms
    });

    // Auto-connect when scanner mode changes to external and scanner is active
    // Commented out for now, will be used in future
    /*useEffect(() => {
        if (scannerMode === 'external' && isScannerActive && socketStatus === 'disconnected') {
            if (process.env.NODE_ENV !== 'production') {
                console.log('Auto-connecting to external scanner...');
            }
            reconnectSocket();
        }
    }, [scannerMode, isScannerActive, socketStatus, reconnectSocket]);*/

    // Note: Modal close and resume scan are handled by ScanResultHandler component

    // Toggle scanner manually
    const toggleScanner = useCallback(() => {
        setIsScannerActive((prev) => {
            const newState = !prev;
            toast({ title: `Scanner ${newState ? "Resumed" : "Paused"}` });
            return newState;
        });
    }, [toast]);

    // Handle retry fetch options
    const handleRetryFetchOptions = useCallback(() => {
        dispatch(fetchCourseClassOptionsForScanner());
    }, [dispatch]);

    return (
        <div className="w-full mx-auto">
            <PageHeader
                heading='Scan Attendance'
                actions={
                    <ScannerStatusBadge
                        isScannerActive={isScannerActive}
                        casualScanMode={casualScanMode}
                        scannerMode={scannerMode}
                        socketStatus={socketStatus}
                        allFetchedUsers={allFetchedUsers}
                    />
                }
            />

            <Card className="bg-card/5 backdrop-blur-sm border border-card/30 shadow-lg">
                <CardContent className="p-6 space-y-6">
                    {/* Class Selection and Casual Mode Toggle */}
                    <ClassSelector
                        casualScanMode={casualScanMode}
                        setCasualScanMode={setCasualScanMode}
                    />

                    {/* Scanner Controls */}
                    <ScannerControls
                        isScannerActive={isScannerActive}
                        toggleScanner={toggleScanner}
                        casualScanMode={casualScanMode}
                        fetchingStudentInfo={fetchingStudentInfo}
                    />

                    {/* Scanner Mode Selection */}
                    {(selectedClass?.id || casualScanMode) && (
                        <ScannerModeSelector
                            scannerMode={scannerMode}
                            setScannerMode={setScannerMode}
                            isScannerActive={isScannerActive}
                            onBarcodeDetected={handleBarcodeDetected}
                            socketStatus={socketStatus}
                            reconnectSocket={reconnectSocket}
                            connectionAttempts={connectionAttempts}
                            maxAttempts={maxAttempts}
                            maxAttemptsReached={maxAttemptsReached}
                            directScannerStatus={directScannerStatus}
                            directScannerLastScanTime={directScannerLastScanTime}
                            directScannerErrorMessage={directScannerErrorMessage}
                        />
                    )}

                    {/* No Class Selected Alert */}
                    <NoClassSelectedAlert
                        casualScanMode={casualScanMode}
                        onRetryFetchOptions={handleRetryFetchOptions}
                    />
                </CardContent>
            </Card>

            {/* Student Info Modal */}
            <ScanResultHandler
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                lastScannedId={lastScannedId}
                setLastScannedId={setLastScannedId}
                studentInfo={studentInfo}
                setStudentInfo={setStudentInfo}
                fetchingStudentInfo={fetchingStudentInfo}
                setFetchingStudentInfo={setFetchingStudentInfo}
                setIsScannerActive={setIsScannerActive}
                casualScanMode={casualScanMode}
                allFetchedUsers={allFetchedUsers}
            />

            <style jsx global>{`
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                .animate-fade-out {
                    animation: fadeOut 1.5s ease-out forwards;
                }
             `}</style>
        </div>
    );
}
