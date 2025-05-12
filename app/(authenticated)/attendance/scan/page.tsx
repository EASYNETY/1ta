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
import { fetchUsersByRole } from "@/features/auth/store/user-thunks";
import { StudentUser, User } from "@/types/user.types";

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
    const {
        user: loggedInUser, // Renamed to avoid conflict with student 'user' objects
        users: allFetchedUsers, // This will store users fetched by fetchUsersByRole (mostly students)
        usersLoading: isLoadingStudents,
        usersError: studentsFetchError
    } = useAppSelector((state) => state.auth);
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
    const [isProcessingScan, setIsProcessingScan] = useState(false);
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
        if (loggedInUser && (!allFetchedUsers || allFetchedUsers.length === 0) && !isLoadingStudents && !studentsFetchError && !initialStudentsFetchAttempted.current) {
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
        // Activate scanner if a class is selected, modal is closed, and student list is available (or loading is done)
        const studentListReady = (allFetchedUsers && allFetchedUsers.length > 0) || (!isLoadingStudents && !studentsFetchError);
        const shouldScan = !!selectedClass?.id && !isModalOpen && studentListReady;

        if (shouldScan && !isScannerActive) {
            setIsScannerActive(true);
            console.log("Scanner Activated for class:", selectedClass?.id);
        } else if ((!shouldScan || !studentListReady) && isScannerActive) {
            setIsScannerActive(false);
            if (!selectedClass?.id) console.log("Scanner Paused: No class selected.");
            if (isModalOpen) console.log("Scanner Paused: Modal is open.");
            if (!studentListReady && selectedClass?.id) console.log("Scanner Paused: Student list not ready.");
        }
    }, [selectedClass, isModalOpen, isScannerActive, allFetchedUsers, isLoadingStudents, studentsFetchError]);


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

        const potentialId = typeof scannedData === 'object' && scannedData?.text ? scannedData.text : String(scannedData ?? '');
        const scannedBarcodeId = potentialId.trim();
        setLastScannedId(scannedBarcodeId);
        console.log(`Processed Barcode ID: "${scannedBarcodeId}"`);

        if (!scannedBarcodeId) {
            setStudentInfo(null);
            setIsProcessingScan(false);
            toast({ variant: "destructive", title: "Scan Error", description: "Detected an empty or invalid barcode." });
            return;
        }

        if (isLoadingStudents || !allFetchedUsers) {
            setStudentInfo(null);
            setIsProcessingScan(false);
            toast({ variant: "destructive", title: "Processing Error", description: "Student list not yet available. Please wait a moment and try again." });
            return;
        }

        // Find student in the locally stored Redux state (allFetchedUsers)
        // Ensure your CanonicalUser (StudentUser) has a barcodeId field!
        const foundStudent = allFetchedUsers.find(
            (student: User) => (student as StudentUser).barcodeId === scannedBarcodeId && student.role === 'student'
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

            if (selectedClass?.id && loggedInUser?.id) {
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
                } catch (reduxError: any) {
                    console.error("Attendance marking failed via Redux:", reduxError);
                    // Error will be handled by apiError selector for display
                }
            } else {
                console.error("Missing data for marking attendance:", { studentId: foundStudent.id, selectedClass, loggedInUser });
                // Potentially show a toast if class not selected, though scanner shouldn't be active then.
            }
        } else {
            console.log("Student not found in local list for barcode:", scannedBarcodeId);
            setStudentInfo(null); // Clear previous student info if any
            // Toast for student not found is implicitly handled by studentInfo being null in modal
        }
        setIsProcessingScan(false);
    }, [allFetchedUsers, selectedClass, loggedInUser, dispatch, toast, isLoadingStudents]);


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

        if (isLoadingStudents && (!allFetchedUsers || allFetchedUsers.length === 0)) {
            return <Badge variant="outline"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Loading Students...</Badge>;
        }
        if (studentsFetchError && (!allFetchedUsers || allFetchedUsers.length === 0)) {
            return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" /> Students Failed to Load</Badge>;
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