// app/(authenticated)/attendance/scan/page.tsx

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import BarcodeScanner from "@/lib/barcode-scanner";
import { StudentInfoModal } from "@/components/students/student-info-modal";

// Redux imports
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    markStudentAttendance,
    resetMarkingStatus,
    selectAttendanceMarkingLoading,
    selectAttendanceMarkingError,
    selectAttendanceMarkingStatus,
} from "@/features/attendance/store/attendance-slice";

import { selectCourseClass, setCourseClass } from "@/features/classes/store/classSessionSlice";

// UI Components
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, Loader2, UserCheck, Power, PowerOff, AlertTriangle, ScanLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { selectAllCourseClassOptions, selectCourseClassOptionsStatus } from "@/features/classes/store/classes-slice";
import { fetchCourseClassOptionsForScanner } from "@/features/classes/store/classes-thunks";
import { CourseClassOption } from "@/features/classes/types/classes-types";
import { PageHeader } from "@/components/layout/auth/page-header";


// Mock student data (KEEP THIS EXACTLY AS IS FOR TESTING)
interface StudentInfo {
    id: string | number;
    name: string;
    email: string;
    dateOfBirth?: string;
    classId?: string;
    className?: string;
    barcodeId: string;
    paidStatus?: boolean;
}

const fetchStudentInfo = async (scannedBarcodeId: string): Promise<StudentInfo | null> => {
    console.log(`fetchStudentInfo called with: "${scannedBarcodeId}" (Type: ${typeof scannedBarcodeId})`);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const mockStudents: Record<string, StudentInfo> = {
        "STUDENT-123": { id: "S1", name: "Alice Wonderland", email: "alice@example.com", dateOfBirth: "2001-03-10", classId: "1", className: "CS 101", barcodeId: "STUDENT-123", paidStatus: true },
        "TEMP-123": { id: "S2", name: "Bob The Builder", email: "bob@example.com", barcodeId: "TEMP-123", className: "Temporary Pass", paidStatus: false },
        "1": { id: "1", name: "Charlie Chaplin", email: "charlie@example.com", dateOfBirth: "1999-05-15", classId: "2", className: "Physics 101", barcodeId: "1", paidStatus: true },
        "2": { id: "2", name: "Diana Prince", email: "diana@example.com", dateOfBirth: "2000-08-22", classId: "3", className: "Chemistry 101", barcodeId: "2", paidStatus: false },
        "3": { id: "2", name: "Ethan Hunt", email: "ethan@example.com", dateOfBirth: "2000-01-01", classId: "1", className: "CS 101", barcodeId: "3", paidStatus: true },
        "4": { id: "4", name: "Fiona Shrek", email: "fiona@example.com", dateOfBirth: "2000-01-01", classId: "3", barcodeId: "4", className: "Arts 101", paidStatus: false },
        "CODE/128#EXTRA": { id: "S5", name: "Special Code User", email: "special@example.com", barcodeId: "CODE/128#EXTRA", className: "Advanced Topics", paidStatus: true },
    };
    const foundStudent = mockStudents[scannedBarcodeId] || null;
    console.log(`fetchStudentInfo returning for "${scannedBarcodeId}":`, foundStudent);
    return foundStudent;
};


export default function ScanPage() {
    const router = useRouter();
    const { toast } = useToast();
    const dispatch = useAppDispatch();

    // Redux state
    const { user } = useAppSelector((state) => state.auth);
    const selectedClass = useAppSelector(selectCourseClass);
    const markingLoading = useAppSelector(selectAttendanceMarkingLoading);
    const apiError = useAppSelector(selectAttendanceMarkingError);
    const apiStatus = useAppSelector(selectAttendanceMarkingStatus);

    const classOptions = useAppSelector(selectAllCourseClassOptions);
    const classOptionsStatus = useAppSelector(selectCourseClassOptionsStatus);
    const classOptionsLoading = classOptionsStatus === 'loading';

    // Local state
    const [isScannerActive, setIsScannerActive] = useState(false);
    const [lastScannedId, setLastScannedId] = useState<string | null>(null);
    const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
    const [fetchingStudentInfo, setFetchingStudentInfo] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Ref to track if an initial fetch attempt for class options has been made for the current user.
    const initialFetchAttempted = useRef(false);

    // Effect to reset initialFetchAttempted flag when user.id changes
    useEffect(() => {
        console.log("User ID changed or component mounted/updated. Resetting initialFetchAttempted flag.");
        initialFetchAttempted.current = false;
    }, [user?.id]);


    // Primary Effect for user validation and fetching class options
    useEffect(() => {
        if (user === undefined) {
            console.log("ScanPage: User data is undefined, waiting for auth slice.");
            return; // Wait for user object to be determined
        }

        if (!user || (user.role !== "admin" && user.role !== "teacher")) {
            toast({ variant: "destructive", title: "Unauthorized", description: "Access denied." });
            router.replace("/dashboard");
            return;
        }

        console.log("ScanPage: User validated. Resetting marking status.");
        dispatch(resetMarkingStatus());

        // Conditional logic to fetch class options
        const needsFetch =
            classOptionsStatus === 'idle' ||
            classOptionsStatus === 'failed' ||
            (classOptionsStatus === 'succeeded' && classOptions.length === 0 && !initialFetchAttempted.current);

        if (needsFetch) {
            console.log(`ScanPage: Triggering fetch for course class options. Current Status: ${classOptionsStatus}, Options Length: ${classOptions.length}, Initial Fetch Attempted: ${initialFetchAttempted.current}`);
            dispatch(fetchCourseClassOptionsForScanner());
            initialFetchAttempted.current = true; // Mark that an attempt has been made for this user context
        } else {
            console.log(`ScanPage: Skipping fetch for course class options. Current Status: ${classOptionsStatus}, Options Length: ${classOptions.length}, Initial Fetch Attempted: ${initialFetchAttempted.current}`);
        }

        // No specific cleanup for fetch logic needed here, as re-runs are controlled by dependencies.
        // resetMarkingStatus() is called at the start of this effect.
    }, [user, dispatch, router, toast, classOptionsStatus, classOptions.length]); // Added classOptionsStatus and classOptions.length for re-evaluation if they change externally.
    // The `needsFetch` logic prevents loop.


    const handleRetryFetchOptions = () => {
        console.log("Manually retrying class options fetch");
        initialFetchAttempted.current = false; // Allow re-attempt
        dispatch(fetchCourseClassOptionsForScanner());
    };

    // Control Scanner Activation based on Class Selection & Modal State
    useEffect(() => {
        const shouldScan = !!selectedClass?.id && !isModalOpen;
        if (shouldScan && !isScannerActive) { // Activate only if it's not already active
            setIsScannerActive(true);
            console.log("Scanner Activated for class:", selectedClass.id);
        } else if (!shouldScan && isScannerActive) { // Deactivate only if it's active
            setIsScannerActive(false);
            if (!selectedClass?.id) console.log("Scanner Paused: No class selected.");
            if (isModalOpen) console.log("Scanner Paused: Modal is open.");
        }
    }, [selectedClass, isModalOpen, isScannerActive]); // Added isScannerActive to prevent unnecessary state sets


    // Handle Class Selection
    const handleClassChange = useCallback((value: string) => {
        dispatch(resetMarkingStatus());
        setLastScannedId(null);
        setStudentInfo(null);
        setIsModalOpen(false);

        if (value === "select-a-class" || !value) { // Handle empty value as well
            dispatch(setCourseClass({ id: '', courseName: "", sessionName: "" }));
            // Scanner deactivation is handled by the useEffect watching selectedClass
        } else {
            const selected = classOptions.find((option: CourseClassOption) => option.id === value);
            if (selected) {
                dispatch(setCourseClass(selected));
                console.log("Selected Class:", selected);
                toast({ title: "Class Selected", description: `Scanner ready for ${selected.courseName} - ${selected.sessionName}` });
            }
        }
    }, [dispatch, classOptions, toast]);


    // Handle Barcode Detection
    const handleBarcodeDetected = useCallback(async (scannedData: any) => {
        console.log("--- Scan Detected ---");
        console.log("Raw scanner data:", scannedData);

        setIsScannerActive(false);
        setIsModalOpen(true);
        setFetchingStudentInfo(true);
        dispatch(resetMarkingStatus());

        const potentialId = typeof scannedData === 'object' && scannedData !== null && scannedData.text
            ? scannedData.text
            : scannedData;
        const barcodeId = String(potentialId ?? '').trim();
        setLastScannedId(barcodeId);
        console.log(`Processed Barcode ID: "${barcodeId}"`);

        if (!barcodeId) {
            console.error("Scan resulted in empty barcode ID.");
            setStudentInfo(null);
            setFetchingStudentInfo(false);
            toast({ variant: "destructive", title: "Scan Error", description: "Detected an empty barcode." });
            return;
        }

        let fetchedInfo: StudentInfo | null = null;
        try {
            fetchedInfo = await fetchStudentInfo(barcodeId);
            setStudentInfo(fetchedInfo);
        } catch (error) {
            console.error("Error fetching student info:", error);
            setStudentInfo(null);
            toast({ variant: "destructive", title: "Lookup Error", description: "Could not fetch student details." });
        } finally {
            setFetchingStudentInfo(false);
        }

        if (fetchedInfo && selectedClass?.id && user?.id) {
            const payload = {
                studentId: String(fetchedInfo.id),
                classInstanceId: selectedClass.id,
                markedByUserId: user.id,
                timestamp: new Date().toISOString(),
                scannedBarcode: barcodeId,
            };
            console.log("Dispatching markStudentAttendance with payload:", payload);
            try {
                await dispatch(markStudentAttendance(payload)).unwrap();
                console.log("Attendance marked successfully via Redux.");
            } catch (error: any) {
                console.error("Attendance marking failed via Redux:", error);
            }
        } else if (!fetchedInfo) {
            console.log("Student not found, attendance not marked.");
        } else {
            console.error("Missing data for marking attendance:", { fetchedInfo, selectedClass, user });
        }
    }, [selectedClass, user, dispatch, toast]);


    // Handle Modal Close
    const handleModalClose = useCallback(() => {
        setIsModalOpen(false);
        // Scanner activation/deactivation is handled by the useEffect watching isModalOpen
    }, []);

    // Resume Scanning
    const handleResumeScan = useCallback(() => {
        console.log("--- Resuming Scan ---");
        setLastScannedId(null);
        setStudentInfo(null);
        dispatch(resetMarkingStatus());
        setFetchingStudentInfo(false);
        setIsModalOpen(false); // Ensure modal is closed first
        // Scanner re-activation is handled by the useEffect watching selectedClass and isModalOpen
    }, [dispatch]);

    // Toggle scanner manually
    const toggleScanner = useCallback(() => {
        if (!selectedClass?.id) {
            toast({ title: "Select a Class", description: "Please select a class first." });
            return;
        }

        dispatch(setCourseClass(
            {
                id: '',
                courseName: "",
                sessionName: "",
            }
        ));

        // Toggling isScannerActive directly. The useEffect watching it will handle console logs.
        setIsScannerActive((prev) => {
            const newState = !prev;
            toast({ title: `Scanner ${newState ? "Resumed" : "Paused"}` });
            return newState;
        });
    }, [selectedClass, toast]); // Removed isScannerActive from deps as it's being set


    // Render Status Badge Logic
    const renderStatusBadge = () => {
        if (isModalOpen) {
            if (fetchingStudentInfo) return <Badge variant="outline"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Fetching Info...</Badge>;
            if (markingLoading) return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Marking...</Badge>;
            return <Badge variant="outline">Processing Scan...</Badge>
        }

        if (selectedClass?.id) {
            if (isScannerActive) {
                if (apiStatus === 'success' && lastScannedId) {
                    return (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 animate-fade-out">
                            <CheckCircle className="mr-1 h-3 w-3" /> Success: {lastScannedId}
                        </Badge>
                    );
                }
                return <Badge variant="secondary" className="border-green-500"><ScanLine className="mr-1 h-3 w-3" /> Ready to Scan</Badge>;
            } else {
                if (apiStatus === 'error' && lastScannedId) {
                    return (
                        <Badge variant="destructive" className="animate-fade-out">
                            <XCircle className="mr-1 h-3 w-3" /> Error: {lastScannedId}
                        </Badge>
                    );
                }
                return <Badge variant="secondary"><PowerOff className="mr-1 h-3 w-3" /> Scanner Paused</Badge>;
            }
        }
        return <Badge variant="secondary">Select a class to start</Badge>;
    };


    return (
        <div className="w-full mx-auto">
            <PageHeader
                heading='Scan Attendance'
                actions={renderStatusBadge()}
            />
            <Card className="bg-card/5 backdrop-blur-sm border border-card/30 shadow-lg">
                <CardContent className="p-6 space-y-6">

                    {/* Class Selection */}
                    <div className="space-y-1.5">
                        <Label htmlFor="courseClassSelect">Select Class/Session</Label>
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                            <Select
                                value={selectedClass?.id || ""}
                                onValueChange={handleClassChange}
                                disabled={classOptionsLoading || markingLoading || fetchingStudentInfo}
                            >
                                <SelectTrigger id="courseClassSelect" className="w-full sm:w-auto sm:min-w-[300px] flex-grow">
                                    <SelectValue placeholder="Select a class to start scanning..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {classOptionsLoading && !classOptions?.length && (
                                        <SelectItem value="loading" disabled>
                                            <div className="flex items-center">
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading classes...
                                            </div>
                                        </SelectItem>
                                    )}
                                    <SelectItem value="select-a-class">-- Select a Class --</SelectItem>
                                    {classOptions?.map((option) => (
                                        <SelectItem key={option.id} value={option.id}>
                                            {option.courseName} - {option.sessionName}
                                        </SelectItem>
                                    ))}
                                    {!classOptionsLoading && classOptionsStatus === 'succeeded' && classOptions?.length === 0 && (
                                        <SelectItem value="no-classes" disabled>No classes available</SelectItem>
                                    )}
                                    {classOptionsStatus === 'failed' && (
                                        <div className="p-2 text-center text-destructive">
                                            Failed to load classes.
                                            <Button variant="link" onClick={handleRetryFetchOptions} className="text-xs">Retry</Button>
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>

                            {/* Manual Pause/Resume Button */}
                            {selectedClass?.id && (
                                <Button
                                    variant="outline"
                                    size="default"
                                    onClick={toggleScanner}
                                    disabled={!selectedClass?.id || markingLoading || fetchingStudentInfo}
                                    className="w-full sm:w-auto flex-shrink-0"
                                >
                                    {isScannerActive ? <PowerOff className="mr-2 h-4 w-4" /> : <Power className="mr-2 h-4 w-4" />}
                                    {isScannerActive ? "Pause Scanner" : "Resume Scanner"}
                                </Button>
                            )}
                        </div>
                        {!selectedClass?.id && !classOptionsLoading && classOptionsStatus !== 'failed' && (
                            <p className="text-xs text-muted-foreground pt-1">You must select a class before scanning can begin.</p>
                        )}
                        {selectedClass?.id && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 pt-2">
                                <UserCheck className="h-4 w-4" /> Scanning for:
                                <span className="font-medium text-primary">
                                    {selectedClass.courseName} - {selectedClass.sessionName}
                                </span>
                            </p>
                        )}
                    </div>


                    {/* Scanner Section */}
                    <div className="space-y-4 pt-4">
                        {selectedClass?.id ? (
                            <div className="flex justify-center items-center w-full h-[350px]">
                                <div className="w-full max-w-md">
                                    <BarcodeScanner
                                        width="100%"
                                        height={300}
                                        onDetected={handleBarcodeDetected}
                                        isActive={isScannerActive}
                                        scanDelay={750}
                                    />
                                </div>
                            </div>
                        ) : (
                            <Alert variant="default" className="mt-6">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Select a Class</AlertTitle>
                                <AlertDescription>
                                    {classOptionsLoading ? "Loading class list..." :
                                        classOptionsStatus === 'failed' ? "Could not load class list. Please try again." :
                                            "Please choose a class or session from the dropdown above to begin scanning attendance."}
                                    {classOptionsStatus === 'failed' &&
                                        <Button variant="link" size="sm" onClick={handleRetryFetchOptions} className="p-0 h-auto text-xs mt-1">Retry loading classes</Button>
                                    }
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </CardContent>
            </Card>

            <StudentInfoModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onResumeScan={handleResumeScan}
                studentInfo={studentInfo}
                isLoading={fetchingStudentInfo}
                scannedId={lastScannedId}
                apiStatus={markingLoading ? 'loading' : apiStatus}
                apiError={apiError}
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