// app/(authenticated)/attendance/scan/page.tsx

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import BarcodeScanner from "@/lib/barcode-scanner";
import { StudentInfoModal } from "@/components/students/student-info-modal";
import { useExternalScannerSocket } from "@/hooks/use-external-scanner-socket";
import { safeArray } from "@/lib/utils/safe-data";
import { beepSounds } from "@/public/sound/beep";

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
import { selectSafeUsers, selectUsersLoading, selectUsersError } from "@/features/auth/store/auth-selectors";

// UI Components
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Loader2,
    UserCheck,
    Power,
    PowerOff,
    AlertTriangle,
    ScanLine,
    Wifi,
    WifiOff,
    RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { selectAllCourseClassOptions, selectCourseClassOptionsStatus } from "@/features/classes/store/classes-slice";
import { fetchCourseClassOptionsForScanner } from "@/features/classes/store/classes-thunks";
import { CourseClassOption } from "@/features/classes/types/classes-types";
import { PageHeader } from "@/components/layout/auth/page-header";
import { fetchUsersByRole } from "@/features/auth/store/user-thunks";
import { StudentUser, User } from "@/types/user.types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

// Scanner mode type
type ScannerMode = "camera" | "external";


export default function ScanPage() {
    const router = useRouter();
    const { toast } = useToast();
    const dispatch = useAppDispatch();

    // Redux state
    const loggedInUser = useAppSelector((state) => state.auth.user); // Keep direct access for user
    const allFetchedUsers = useAppSelector(selectSafeUsers); // Using safe selector for users array
    const isLoadingStudents = useAppSelector(selectUsersLoading);
    const studentsFetchError = useAppSelector(selectUsersError);
    const selectedClass = useAppSelector(selectCourseClass);
    const markingLoading = useAppSelector(selectAttendanceMarkingLoading);
    const apiError = useAppSelector(selectAttendanceMarkingError);
    const apiStatus = useAppSelector(selectAttendanceMarkingStatus);

    const classOptions = useAppSelector(selectAllCourseClassOptions); // Using safe selector that handles null/undefined
    const classOptionsStatus = useAppSelector(selectCourseClassOptionsStatus);
    const classOptionsLoading = classOptionsStatus === 'loading';

    // Local state
    const [isScannerActive, setIsScannerActive] = useState(false);
    const [lastScannedId, setLastScannedId] = useState<string | null>(null);
    const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
    const [fetchingStudentInfo, setFetchingStudentInfo] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessingScan, setIsProcessingScan] = useState(false);
    const [scannerMode, setScannerMode] = useState<ScannerMode>("camera"); // Default to camera scanner
    const [casualScanMode, setCasualScanMode] = useState(false); // New state for casual scan mode
    const initialClassOptionsFetchAttempted = useRef(false);
    const initialStudentsFetchAttempted = useRef(false);


    // Effect 1: User validation and fetching class options (dropdown)
    useEffect(() => {
        if (loggedInUser === undefined) return;
        if (!loggedInUser || (loggedInUser.role !== "admin" && loggedInUser.role !== "teacher")) {
            toast({ variant: "destructive", title: "Unauthorized", description: "Access denied." });
            router.replace("/dashboard");
            return;
        }
        dispatch(resetMarkingStatus());

        const needsFetchOptions =
            classOptionsStatus === 'idle' ||
            classOptionsStatus === 'failed' ||
            (classOptionsStatus === 'succeeded' && classOptions.length === 0 && !initialClassOptionsFetchAttempted.current);

        if (needsFetchOptions) {
            dispatch(fetchCourseClassOptionsForScanner());
            initialClassOptionsFetchAttempted.current = true;
        }
    }, [loggedInUser, dispatch, router, toast, classOptionsStatus, classOptions.length]);

    // Effect 2: Fetch all students (with role 'student') when component mounts or user changes
    // We only fetch students once, or if the fetch failed previously.
    useEffect(() => {
        // Use safeArray to ensure allFetchedUsers is always an array
        const users = safeArray(allFetchedUsers);

        if (loggedInUser && users.length === 0 && !isLoadingStudents && !studentsFetchError && !initialStudentsFetchAttempted.current) {
            console.log("ScanPage: Fetching all students for barcode lookup.");
            dispatch(fetchUsersByRole({ role: "student" })); // Fetch all students, high limit
            initialStudentsFetchAttempted.current = true;
        }
    }, [dispatch, loggedInUser, allFetchedUsers, isLoadingStudents, studentsFetchError]);


    const handleRetryFetchOptions = () => {
        console.log("Manually retrying class options fetch");
        initialClassOptionsFetchAttempted.current = false; // Allow re-attempt
        dispatch(fetchCourseClassOptionsForScanner());
    };

    const handleRetryFetchStudents = () => {
        initialStudentsFetchAttempted.current = false; // Allow re-attempt
        if (loggedInUser) {
            console.log("ScanPage: Manually retrying fetch for all students.");
            dispatch(fetchUsersByRole({ role: "student" }));
        }
    };


    // Control Scanner Activation
    useEffect(() => {
        // Use safeArray to ensure allFetchedUsers is always an array
        const users = safeArray(allFetchedUsers);

        // Activate scanner if (a class is selected OR in casual scan mode), modal is closed, and student list is available
        const studentListReady = (users.length > 0) || (!isLoadingStudents && !studentsFetchError);
        const shouldScan = (!!selectedClass?.id || casualScanMode) && !isModalOpen && studentListReady;

        if (shouldScan && !isScannerActive) {
            setIsScannerActive(true);
            if (casualScanMode) {
                console.log(`${scannerMode} Scanner Activated in casual mode (view only)`);
            } else {
                console.log(`${scannerMode} Scanner Activated for class:`, selectedClass?.id);
            }
        } else if ((!shouldScan || !studentListReady) && isScannerActive) {
            setIsScannerActive(false);
            if (!selectedClass?.id && !casualScanMode) console.log(`${scannerMode} Scanner Paused: No class selected and not in casual mode.`);
            if (isModalOpen) console.log(`${scannerMode} Scanner Paused: Modal is open.`);
            if (!studentListReady) console.log(`${scannerMode} Scanner Paused: Student list not ready.`);
        }
    }, [selectedClass, isModalOpen, isScannerActive, allFetchedUsers, isLoadingStudents, studentsFetchError, scannerMode, casualScanMode]);


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


    // Handle Barcode Detection - MAJOR CHANGES HERE
    const handleBarcodeDetected = useCallback(async (scannedData: any) => {
        console.log("--- Scan Detected ---");
        setIsScannerActive(false);
        setIsModalOpen(true);
        setIsProcessingScan(true);
        dispatch(resetMarkingStatus());

        // Play beep sound when barcode is detected
        beepSounds.scanner();

        const potentialId = typeof scannedData === 'object' && scannedData?.text ? scannedData.text : String(scannedData ?? '');
        const scannedBarcodeId = potentialId.trim();
        setLastScannedId(scannedBarcodeId);
        console.log(`Processed Barcode ID: "${scannedBarcodeId}" from ${scannerMode} scanner`);

        if (!scannedBarcodeId) {
            setStudentInfo(null);
            setIsProcessingScan(false);
            toast({ variant: "destructive", title: "Scan Error", description: "Detected an empty or invalid barcode." });
            return;
        }

        // Use safeArray to ensure allFetchedUsers is always an array
        const users = safeArray(allFetchedUsers);

        if (isLoadingStudents || users.length === 0) {
            setStudentInfo(null);
            setIsProcessingScan(false);
            toast({ variant: "destructive", title: "Processing Error", description: "Student list not yet available. Please wait a moment and try again." });
            return;
        }

        // Find student in the locally stored Redux state (allFetchedUsers)
        // Ensure your CanonicalUser (StudentUser) has a barcodeId field!
        const foundStudent = users.find(
            (student: any) => {
                const studentUser = student as StudentUser;
                return studentUser.barcodeId === scannedBarcodeId && studentUser.role === 'student';
            }
        ) as StudentUser | undefined; // Cast to StudentUser

        console.log("Search result in allFetchedUsers for barcode", scannedBarcodeId, ":", foundStudent);

        if (foundStudent) {
            // Map CanonicalUser (StudentUser) to local StudentInfo for the modal
            const studentDataForModal: StudentInfo = {
                id: foundStudent.id,
                name: foundStudent.name,
                email: foundStudent.email,
                dateOfBirth: foundStudent.dateOfBirth,
                classId: foundStudent.classId, // This is student's general class, not necessarily selectedClass.id
                // className: foundStudent.class?.name, // If you have nested class info
                barcodeId: foundStudent.barcodeId || scannedBarcodeId, // Fallback just in case
                isActive: foundStudent.isActive,
                avatarUrl: foundStudent.avatarUrl,
            };
            setStudentInfo(studentDataForModal);

            if (selectedClass?.id && loggedInUser?.id && !casualScanMode) {
                // Only mark attendance if not in casual scan mode
                const payload = {
                    studentId: String(foundStudent.id),
                    classInstanceId: selectedClass.id, // The class session being scanned FOR
                    markedByUserId: loggedInUser.id,
                    timestamp: new Date().toISOString(),
                    scannedBarcode: scannedBarcodeId,
                };
                console.log("Dispatching markStudentAttendance with payload:", payload);
                try {
                    await dispatch(markStudentAttendance(payload)).unwrap();
                    console.log("Attendance marked successfully via Redux.");
                    // Play success beep sound
                    beepSounds.success();
                } catch (reduxError: any) {
                    console.error("Attendance marking failed via Redux:", reduxError);
                    // Play error beep sound
                    beepSounds.error();
                    // Error will be handled by apiError selector for display
                }
            } else if (casualScanMode) {
                console.log("Casual scan mode: Student found but attendance not marked");
                // In casual mode, we just display the student info without marking attendance
                dispatch(resetMarkingStatus()); // Ensure we're in a clean state
                // Make sure the modal is open and student info is set
                setIsModalOpen(true);
                setIsProcessingScan(false);
            } else {
                console.error("Missing data for marking attendance:", { studentId: foundStudent.id, selectedClass, loggedInUser });
                // Potentially show a toast if class not selected, though scanner shouldn't be active then.
            }
        } else {
            console.log("Student not found in local list for barcode:", scannedBarcodeId);
            setStudentInfo(null); // Clear previous student info if any
            // Play error beep sound for student not found
            beepSounds.error();
            // Toast for student not found is implicitly handled by studentInfo being null in modal
        }
        setIsProcessingScan(false);
    }, [allFetchedUsers, selectedClass, loggedInUser, dispatch, toast, isLoadingStudents, scannerMode, casualScanMode]);

    // External Scanner WebSocket Integration
    // Only enable WebSocket when in external scanner mode and scanner is active
    const isWebSocketEnabled = scannerMode === 'external' && isScannerActive;

    // Use a ref to track previous WebSocket status for debugging
    const prevSocketStatusRef = useRef<string | null>(null);

    // Define a custom WebSocket URL for testing if needed
    // You can uncomment and modify this to test with different WebSocket servers
    // const testWebSocketUrl = 'wss://echo.websocket.org';

    const {
        status: socketStatus,
        reconnect: reconnectSocket,
        connectionAttempts,
        maxAttempts,
        maxAttemptsReached
    } = useExternalScannerSocket({
        onBarcodeReceived: handleBarcodeDetected,
        isEnabled: isWebSocketEnabled,
        maxReconnectAttempts: 5, // Set maximum reconnection attempts
        connectionTimeout: 10000, // 10 seconds timeout for initial connection
        pingInterval: 30000, // Send ping every 30 seconds
        reconnectDelayBase: 1000, // Start with 1 second delay
        reconnectDelayMax: 30000, // Maximum 30 seconds delay
        // serverUrl: testWebSocketUrl // Uncomment to use a test server
    });

    // Log WebSocket status changes for debugging
    useEffect(() => {
        if (prevSocketStatusRef.current !== socketStatus) {
            console.log(`WebSocket status changed: ${prevSocketStatusRef.current || 'initial'} -> ${socketStatus}`);
            prevSocketStatusRef.current = socketStatus;

            // Show toast notifications for connection status changes
            if (socketStatus === 'connected') {
                // Play connection success sound
                beepSounds.success();
                toast({
                    title: "External Scanner Connected",
                    description: "Ready to receive barcode scans",
                    variant: "default"
                });
            } else if (socketStatus === 'error' && prevSocketStatusRef.current !== 'error') {
                // Play error sound
                beepSounds.error();
                toast({
                    title: "Scanner Connection Error",
                    description: "Could not connect to external scanner service",
                    variant: "destructive"
                });
            } else if (socketStatus === 'disconnected' && prevSocketStatusRef.current === 'connected') {
                // Play notification sound
                beepSounds.notification();
                toast({
                    title: "Scanner Disconnected",
                    description: "Connection to external scanner was lost",
                    variant: "destructive"
                });
            }
        }
    }, [socketStatus, toast]);


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
        if (!selectedClass?.id && !casualScanMode) {
            toast({ title: "Select a Class", description: "Please select a class first or enable casual scan mode." });
            return;
        }

        // Only clear class if we're not in casual mode
        if (!casualScanMode && selectedClass?.id) {
            dispatch(setCourseClass({
                id: '',
                courseName: "",
                sessionName: "",
            }));
        }

        // Toggling isScannerActive directly. The useEffect watching it will handle console logs.
        setIsScannerActive((prev) => {
            const newState = !prev;
            toast({ title: `Scanner ${newState ? "Resumed" : "Paused"}` });
            return newState;
        });
    }, [selectedClass, toast, casualScanMode]); // Added casualScanMode to deps

    // Toggle casual scan mode
    const toggleCasualScanMode = useCallback(() => {
        // Reset scanner state
        setIsScannerActive(false);
        setLastScannedId(null);
        setStudentInfo(null);
        setIsModalOpen(false);
        dispatch(resetMarkingStatus());

        // Toggle casual mode
        const newMode = !casualScanMode;
        setCasualScanMode(newMode);

        // Handle side effects after state update
        if (newMode) {
            toast({
                title: "Casual Scan Mode Enabled",
                description: "Students will be identified but attendance won't be marked."
            });

            // Clear selected class when entering casual mode
            if (selectedClass?.id) {
                // Use setTimeout to ensure this happens after render
                setTimeout(() => {
                    dispatch(setCourseClass({
                        id: '',
                        courseName: "",
                        sessionName: "",
                    }));
                }, 0);
            }
        } else {
            toast({
                title: "Casual Scan Mode Disabled",
                description: "Select a class to mark attendance."
            });
        }
    }, [dispatch, selectedClass, toast, casualScanMode]);


    // Render Status Badge Logic
    const renderStatusBadge = () => {
        if (isModalOpen) {
            if (fetchingStudentInfo) return <Badge variant="outline"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Fetching Info...</Badge>;
            if (markingLoading) return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Marking...</Badge>;
            return <Badge variant="outline">Processing Scan...</Badge>
        }

        // Use safeArray to ensure allFetchedUsers is always an array
        const users = safeArray(allFetchedUsers);

        if (isLoadingStudents && users.length === 0) {
            return <Badge variant="outline"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Loading Students...</Badge>;
        }
        if (studentsFetchError && users.length === 0) {
            return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" /> Students Failed to Load</Badge>;
        }

        // Casual scan mode badge
        if (casualScanMode) {
            if (isScannerActive) {
                return <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-300"><ScanLine className="mr-1 h-3 w-3" /> Casual Scan Mode (View Only)</Badge>;
            } else {
                return <Badge variant="secondary" className="bg-purple-50/50 text-purple-700/70 border-purple-300/50"><PowerOff className="mr-1 h-3 w-3" /> Casual Scan Mode Paused</Badge>;
            }
        }

        // External scanner WebSocket status badges
        if (scannerMode === 'external' && (selectedClass?.id || casualScanMode)) {
            if (socketStatus === 'connecting') {
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Connecting to scanner... ({connectionAttempts}/{maxAttempts})
                    </Badge>
                );
            }
            if (socketStatus === 'error') {
                return (
                    <Badge variant="destructive">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        {maxAttemptsReached
                            ? 'Connection Failed (Max Attempts)'
                            : 'Scanner Connection Error'}
                    </Badge>
                );
            }
            if (socketStatus === 'connected' && isScannerActive) {
                if (apiStatus === 'success' && lastScannedId) {
                    return (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 animate-fade-out">
                            <CheckCircle className="mr-1 h-3 w-3" /> Success: {lastScannedId}
                        </Badge>
                    );
                }
                return <Badge variant="secondary" className="border-green-500 bg-green-50 text-green-700"><Wifi className="mr-1 h-3 w-3" /> External Scanner Ready</Badge>;
            }
            if (socketStatus === 'connected' && !isScannerActive) {
                return <Badge variant="secondary"><WifiOff className="mr-1 h-3 w-3" /> External Scanner Paused</Badge>;
            }
            return <Badge variant="secondary"><WifiOff className="mr-1 h-3 w-3" /> External Scanner Disconnected</Badge>;
        }

        // Camera scanner status badges
        if (scannerMode === 'camera' && (selectedClass?.id || casualScanMode)) {
            if (isScannerActive) {
                if (apiStatus === 'success' && lastScannedId) {
                    return (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 animate-fade-out">
                            <CheckCircle className="mr-1 h-3 w-3" /> Success: {lastScannedId}
                        </Badge>
                    );
                }
                return <Badge variant="secondary" className="border-green-500"><ScanLine className="mr-1 h-3 w-3" /> Camera Ready</Badge>;
            } else {
                if (apiStatus === 'error' && lastScannedId) {
                    return (
                        <Badge variant="destructive" className="animate-fade-out">
                            <XCircle className="mr-1 h-3 w-3" /> Error: {lastScannedId}
                        </Badge>
                    );
                }
                return <Badge variant="secondary"><PowerOff className="mr-1 h-3 w-3" /> Camera Paused</Badge>;
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
                        <div className="flex justify-between items-center">
                            <Label htmlFor="courseClassSelect">Select Class/Session</Label>

                            {/* Casual Scan Mode Toggle */}
                            <Button
                                variant={casualScanMode ? "secondary" : "outline"}
                                size="sm"
                                onClick={toggleCasualScanMode}
                                className={`text-xs ${casualScanMode ? 'bg-purple-50 text-purple-700 border-purple-300' : ''}`}
                            >
                                {casualScanMode ? (
                                    <>
                                        <ScanLine className="mr-1 h-3 w-3" /> Casual Mode: ON
                                    </>
                                ) : (
                                    <>
                                        <ScanLine className="mr-1 h-3 w-3" /> Casual Mode: OFF
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                            <Select
                                value={selectedClass?.id || ""}
                                onValueChange={handleClassChange}
                                disabled={classOptionsLoading || markingLoading || fetchingStudentInfo || casualScanMode}
                            >
                                <SelectTrigger id="courseClassSelect" className="w-full sm:w-auto sm:min-w-[300px] flex-grow">
                                    <SelectValue placeholder={casualScanMode ? "Casual scan mode active..." : "Select a class to start scanning..."} />
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
                        {!selectedClass?.id && !casualScanMode && !classOptionsLoading && classOptionsStatus !== 'failed' && (
                            <p className="text-xs text-muted-foreground pt-1">You must select a class before scanning can begin, or enable casual scan mode.</p>
                        )}
                        {casualScanMode && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 pt-2">
                                <ScanLine className="h-4 w-4 text-purple-500" /> Casual scan mode:
                                <span className="font-medium text-purple-700">
                                    Students will be identified but attendance won't be marked
                                </span>
                            </p>
                        )}
                        {selectedClass?.id && !casualScanMode && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 pt-2">
                                <UserCheck className="h-4 w-4" /> Scanning for:
                                <span className="font-medium text-primary">
                                    {selectedClass.courseName} - {selectedClass.sessionName}
                                </span>
                            </p>
                        )}
                    </div>


                    {/* Scanner Mode Selection */}
                    {(selectedClass?.id || casualScanMode) && (
                        <div className="pt-4">
                            <Label htmlFor="scannerMode">Scanner Mode</Label>
                            <Tabs
                                defaultValue="camera"
                                value={scannerMode}
                                onValueChange={(value) => setScannerMode(value as ScannerMode)}
                                className="w-full mt-2"
                            >
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="camera">Camera Scanner</TabsTrigger>
                                    <TabsTrigger value="external">External Scanner</TabsTrigger>
                                </TabsList>

                                <TabsContent value="camera" className="mt-4">
                                    <div className="flex justify-center items-center w-full h-[350px]">
                                        <div className="w-full max-w-md">
                                            <BarcodeScanner
                                                width="100%"
                                                height={300}
                                                onDetected={handleBarcodeDetected}
                                                isActive={scannerMode === 'camera' && isScannerActive}
                                                scanDelay={750}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="external" className="mt-4">
                                    <div className="flex flex-col justify-center items-center w-full h-[350px] border rounded-lg bg-muted p-6 text-center">
                                        <div className="mb-4">
                                            {socketStatus === 'connected' ? (
                                                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                                    <Wifi className="h-8 w-8 text-green-600" />
                                                </div>
                                            ) : socketStatus === 'connecting' ? (
                                                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                                                </div>
                                            ) : socketStatus === 'error' ? (
                                                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                                    <AlertTriangle className="h-8 w-8 text-red-600" />
                                                </div>
                                            ) : (
                                                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                                    <WifiOff className="h-8 w-8 text-gray-600" />
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-lg font-semibold mb-2">
                                            {socketStatus === 'connected'
                                                ? 'External Scanner Connected'
                                                : socketStatus === 'connecting'
                                                ? 'Connecting to External Scanner...'
                                                : socketStatus === 'error'
                                                ? 'Connection Error'
                                                : 'External Scanner Disconnected'}
                                        </h3>

                                        <p className="text-muted-foreground mb-4">
                                            {socketStatus === 'connected'
                                                ? 'Ready to receive scans from external barcode scanner.'
                                                : socketStatus === 'connecting'
                                                ? 'Attempting to establish connection to the external scanner service...'
                                                : socketStatus === 'error'
                                                ? 'Failed to connect to the external scanner service. Please check your connection and try again.'
                                                : 'Waiting for connection to external scanner service.'}
                                        </p>

                                        {socketStatus === 'connected' && (
                                            <div className="text-sm text-green-600 mb-4">
                                                <div className="flex items-center justify-center mb-2">
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Connection established. Scanner is active and ready.
                                                </div>

                                                {/* Live connection indicator */}
                                                <div className="flex items-center justify-center mt-2">
                                                    <span className="relative flex h-3 w-3 mr-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                                    </span>
                                                    <span>Live connection</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Connection Attempts Indicator */}
                                        {(socketStatus === 'connecting' || socketStatus === 'error') && (
                                            <div className={`text-sm mb-2 ${socketStatus === 'error' ? 'text-red-600' : 'text-blue-600'}`}>
                                                <p className="flex items-center justify-center">
                                                    {socketStatus === 'connecting' ? (
                                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                    ) : (
                                                        <AlertTriangle className="h-4 w-4 mr-1" />
                                                    )}
                                                    {maxAttemptsReached ? (
                                                        <>Maximum connection attempts reached ({maxAttempts})</>
                                                    ) : (
                                                        <>Connection attempt {connectionAttempts} of {maxAttempts}</>
                                                    )}
                                                </p>
                                            </div>
                                        )}

                                        {socketStatus === 'error' && (
                                            <div className="text-sm text-red-600 mb-4 max-w-md">
                                                <p>Possible reasons for connection failure:</p>
                                                <ul className="list-disc text-left pl-8 mt-2">
                                                    <li>The scanner service is not running</li>
                                                    <li>Network connectivity issues</li>
                                                    <li>Firewall blocking WebSocket connections</li>
                                                    <li>Server is using a different protocol (ws:// vs wss://)</li>
                                                </ul>
                                            </div>
                                        )}

                                        {/* Reconnect Button */}
                                        {(socketStatus === 'disconnected' || socketStatus === 'error') && (
                                            <Button
                                                variant={socketStatus === 'error' ? "default" : "outline"}
                                                onClick={reconnectSocket}
                                                className={`mt-2 ${socketStatus === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                                            >
                                                {maxAttemptsReached ? (
                                                    <>
                                                        <RefreshCw className="mr-2 h-4 w-4" />
                                                        Reset & Try Again
                                                    </>
                                                ) : socketStatus === 'error' ? (
                                                    <>
                                                        <RefreshCw className="mr-2 h-4 w-4" />
                                                        Try Again
                                                    </>
                                                ) : (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4" />
                                                        Reconnect
                                                    </>
                                                )}
                                            </Button>
                                        )}

                                        {socketStatus === 'connected' && (
                                            <div className="mt-2 text-sm text-muted-foreground">
                                                <p>Scan a barcode with your external scanner to identify a student</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}

                    {/* Scanner Section - No Class Selected and Not in Casual Mode */}
                    {!selectedClass?.id && !casualScanMode && (
                        <div className="space-y-4 pt-4">
                            <Alert variant="default" className="mt-6">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Select a Class or Enable Casual Mode</AlertTitle>
                                <AlertDescription>
                                    {classOptionsLoading ? "Loading class list..." :
                                        classOptionsStatus === 'failed' ? "Could not load class list. Please try again." :
                                            "Please choose a class from the dropdown above to mark attendance, or enable casual scan mode to just view student details without marking attendance."}
                                    {classOptionsStatus === 'failed' &&
                                        <Button variant="link" size="sm" onClick={handleRetryFetchOptions} className="p-0 h-auto text-xs mt-1">Retry loading classes</Button>
                                    }
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}
                </CardContent>
            </Card>

            <StudentInfoModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onResumeScan={handleResumeScan}
                studentInfo={studentInfo}
                isLoading={fetchingStudentInfo}
                scannedId={lastScannedId}
                apiStatus={casualScanMode ? 'success' : (markingLoading ? 'loading' : apiStatus)}
                apiError={apiError}
                casualScanMode={casualScanMode}
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