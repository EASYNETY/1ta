// app/(authenticated)/attendance/scan/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import BarcodeScanner from "@/lib/barcode-scanner";
import { StudentInfoModal } from "@/components/students/student-info-modal";

// Redux imports
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    markStudentAttendance,
    resetMarkingStatus,
    selectAttendanceMarkingLoading, // This is for the API call itself
    selectAttendanceMarkingError,
    selectAttendanceMarkingStatus,
    selectLastMarkedStudentId, // You might not need this if modal shows info
} from "@/features/attendance/store/attendance-slice";

// Class options hook
import { useCourseClassOptions } from "@/features/classes/hooks/useCourseClassOptions";
import { selectCourseClass, setCourseClass } from "@/features/classes/store/classSessionSlice";

// UI Components
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, Loader2, UserCheck, Power, PowerOff, AlertTriangle, ScanLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Using CardHeader


// Mock student data (KEEP THIS EXACTLY AS IS FOR TESTING)
interface StudentInfo {
    id: string | number; // Use the actual student DB ID here
    name: string;
    email: string;
    dateOfBirth?: string;
    classId?: string; // May not be needed if fetched based on classInstance
    className?: string;
    barcodeId: string; // The ID scanned from the barcode
    paidStatus?: boolean; // Optional, if you want to show payment status
}

const fetchStudentInfo = async (scannedBarcodeId: string): Promise<StudentInfo | null> => {
    console.log(`fetchStudentInfo called with: "${scannedBarcodeId}" (Type: ${typeof scannedBarcodeId})`);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const mockStudents: Record<string, StudentInfo> = {
        "STUDENT-123": { id: "S1", name: "Alice Wonderland", email: "alice@example.com", dateOfBirth: "2001-03-10", classId: "1", className: "CS 101", barcodeId: "STUDENT-123", paidStatus: true },
        "TEMP-123": { id: "S2", name: "Bob The Builder", email: "bob@example.com", barcodeId: "TEMP-123", className: "Temporary Pass", paidStatus: false },
        "1": { id: "1", name: "Charlie Chaplin", email: "charlie@example.com", dateOfBirth: "1999-05-15", classId: "2", className: "Physics 101", barcodeId: "1", paidStatus: true },
        "2": { id: "2", name: "Diana Prince", email: "diana@example.com", dateOfBirth: "2000-08-22", classId: "3", className: "Chemistry 101", barcodeId: "2", paidStatus: false },
        "3": { id: "2", name: "Ethan Hunt", email: "ethan@example.com", dateOfBirth: "2000-01-01", classId: "1", className: "CS 101", barcodeId: "3", paidStatus: true },
        "4": { id: "4", name: "Fiona Shrek", email: "fiona@example.com", dateOfBirth: "2000-01-01", classId: "3", barcodeId: "4", className: "Arts 101", paidStatus: false },
        // Add a student with a barcode containing special chars if needed for testing
        "CODE/128#EXTRA": { id: "S5", name: "Special Code User", email: "special@example.com", barcodeId: "CODE/128#EXTRA", className: "Advanced Topics", paidStatus: true },
    };

    // Log available keys for easier debugging
    // console.log("Available mock keys:", Object.keys(mockStudents));

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
    const markingLoading = useAppSelector(selectAttendanceMarkingLoading); // Loading state for the attendance marking API call
    const apiError = useAppSelector(selectAttendanceMarkingError);
    const apiStatus = useAppSelector(selectAttendanceMarkingStatus); // success | error | idle (for marking API)

    // Local state
    const { options: classOptions, isLoading: classOptionsLoading } = useCourseClassOptions();
    const [isScannerActive, setIsScannerActive] = useState(false); // Controls if the scanner *component* should be trying to scan
    const [lastScannedId, setLastScannedId] = useState<string | null>(null);
    const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
    const [fetchingStudentInfo, setFetchingStudentInfo] = useState(false); // Loading state specifically for fetchStudentInfo
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Authorization and Initial Setup
    useEffect(() => {
        // Check user role
        if (!user || (user.role !== "admin" && user.role !== "teacher")) {
            toast({ variant: "destructive", title: "Unauthorized", description: "Access denied." });
            router.replace("/dashboard");
        }
        // Reset Redux status on mount/unmount
        dispatch(resetMarkingStatus());
        return () => {
            dispatch(resetMarkingStatus());
            setIsScannerActive(false); // Ensure scanner is off on unmount
        };
    }, [user, router, toast, dispatch, isScannerActive]);

    // Control Scanner Activation based on Class Selection & Modal State
    useEffect(() => {
        // Activate scanner only if a class is selected AND the modal is closed
        const shouldScan = !!selectedClass?.id && !isModalOpen;
        setIsScannerActive(shouldScan);

        if (shouldScan) {
            console.log("Scanner Activated for class:", selectedClass.id);
            // Optional: Toast notification when scanning resumes
            // toast({ title: "Scanner Active", description: `Ready to scan for ${selectedClass.courseName}` });
        } else if (!selectedClass?.id) {
            console.log("Scanner Paused: No class selected.");
        } else if (isModalOpen) {
            console.log("Scanner Paused: Modal is open.");
        }

    }, [selectedClass, isModalOpen, isScannerActive]);


    // Handle Class Selection
    const handleClassChange = useCallback((value: string) => {
        dispatch(resetMarkingStatus()); // Reset API status when class changes
        setLastScannedId(null);
        setStudentInfo(null);
        setIsModalOpen(false); // Close modal if open

        if (value === "select-a-class") {
            dispatch(setCourseClass(
                {
                    id: '',
                    courseName: "",
                    sessionName: "",
                }
            )); // Use null or specific empty state object
            setIsScannerActive(false);
        } else {
            const selected = classOptions.find((option) => option.id === value);
            if (selected) {
                dispatch(setCourseClass(selected));
                console.log("Selected Class:", selected);
                // Scanner activation is handled by the useEffect watching selectedClass and isModalOpen
                toast({ title: "Class Selected", description: `Scanner ready for ${selected.courseName} - ${selected.sessionName}` });
            }
        }
    }, [dispatch, classOptions, toast]);


    // Handle Barcode Detection - The core logic loop
    const handleBarcodeDetected = useCallback(async (scannedData: any) => {
        console.log("--- Scan Detected ---");
        console.log("Raw scanner data:", scannedData);

        // Immediately stop scanner and show modal with loading state
        setIsScannerActive(false); // Stop the scanner component
        setIsModalOpen(true);
        setFetchingStudentInfo(true); // Indicate student lookup started
        dispatch(resetMarkingStatus()); // Reset previous API result

        const potentialId = typeof scannedData === 'object' && scannedData !== null && scannedData.text
            ? scannedData.text
            : scannedData;
        const barcodeId = String(potentialId ?? '').trim();
        setLastScannedId(barcodeId); // Store the processed ID for display
        console.log(`Processed Barcode ID: "${barcodeId}"`);

        if (!barcodeId) {
            console.error("Scan resulted in empty barcode ID.");
            setStudentInfo(null);
            setFetchingStudentInfo(false);
            // Optionally show an error in the modal or a toast
            toast({ variant: "destructive", title: "Scan Error", description: "Detected an empty barcode." });
            // Keep modal open to show error or close it? Decide UX.
            // setIsModalOpen(false); // Maybe close immediately for empty scan?
            // handleResumeScan(); // And resume?
            return; // Exit early
        }

        // --- 1. Fetch Student Information ---
        let fetchedInfo: StudentInfo | null = null;
        try {
            fetchedInfo = await fetchStudentInfo(barcodeId);
            setStudentInfo(fetchedInfo); // Update state with fetched info (or null)
        } catch (error) {
            console.error("Error fetching student info:", error);
            setStudentInfo(null);
            toast({ variant: "destructive", title: "Lookup Error", description: "Could not fetch student details." });
            // Error handled, modal will show "Not Found" or a generic error
        } finally {
            setFetchingStudentInfo(false); // Student lookup finished
        }

        // --- 2. Mark Attendance (if student found) ---
        if (fetchedInfo && selectedClass?.id && user?.id) {
            const payload = {
                studentId: String(fetchedInfo.id), // Use the ID from the fetched student data
                classInstanceId: selectedClass.id,
                markedByUserId: user.id,
                timestamp: new Date().toISOString(),
                scannedBarcode: barcodeId, // Optionally send the scanned barcode too
            };
            console.log("Dispatching markStudentAttendance with payload:", payload);

            try {
                await dispatch(markStudentAttendance(payload)).unwrap();
                // Success is handled by apiStatus change in the modal
                console.log("Attendance marked successfully via Redux.");
                // toast({ variant: "success", title: "Attendance Marked" }); // Modal gives feedback
            } catch (error: any) {
                // Error is handled by apiStatus/apiError change in the modal
                console.error("Attendance marking failed via Redux:", error);
                // toast({ variant: "destructive", title: "Marking Failed", description: error?.message || String(error) }); // Modal gives feedback
            }
        } else if (!fetchedInfo) {
            // If student not found, do nothing further here, modal shows the "Not Found" state.
            console.log("Student not found, attendance not marked.");
        } else {
            console.error("Missing data for marking attendance:", { fetchedInfo, selectedClass, user });
            // Handle this case if needed - maybe show an error in the modal?
        }

    }, [selectedClass, user, dispatch, toast]); // Dependencies for the callback


    // Handle Modal Close -> This just closes the modal visually
    const handleModalClose = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    // Resume Scanning -> Called by Modal's onResumeScan prop after it closes
    const handleResumeScan = useCallback(() => {
        console.log("--- Resuming Scan ---");
        setLastScannedId(null);
        setStudentInfo(null);
        dispatch(resetMarkingStatus()); // Clear API status
        setFetchingStudentInfo(false);
        // Activation is handled by the useEffect watching selectedClass and isModalOpen
        // Explicitly setting true here might be needed if useEffect doesn't trigger fast enough,
        // but rely on the effect first.
        if (selectedClass?.id) {
            setIsScannerActive(true);
        }
    }, [dispatch, selectedClass]);

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
        )); // Use null or specific empty state object
        setIsScannerActive((prev) => !prev);
        toast({ title: `Scanner ${!isScannerActive ? "Resumed" : "Paused"}` });
    }, [selectedClass, isScannerActive, toast]);


    // Render Status Badge Logic (Improved)
    const renderStatusBadge = () => {
        // Priority to modal/API states when modal was last open
        if (isModalOpen) {
            if (fetchingStudentInfo) return <Badge variant="outline"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Fetching Info...</Badge>;
            if (markingLoading) return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Marking...</Badge>;
            // Modal handles detailed status, so maybe show nothing here or just 'Processing'
            return <Badge variant="outline">Processing Scan...</Badge>
        }

        // Status when scanner is supposed to be active or paused
        if (selectedClass?.id) {
            if (isScannerActive) {
                // Show last successful scan briefly?
                if (apiStatus === 'success' && lastScannedId) {
                    return (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 animate-fade-out">
                            <CheckCircle className="mr-1 h-3 w-3" /> Success: {lastScannedId}
                        </Badge>
                    )
                }
                return <Badge variant="secondary" className="border-green-500"><ScanLine className="mr-1 h-3 w-3" /> Ready to Scan</Badge>;
            } else {
                // Show last error briefly?
                if (apiStatus === 'error' && lastScannedId) {
                    return (
                        <Badge variant="destructive" className="animate-fade-out">
                            <XCircle className="mr-1 h-3 w-3" /> Error: {lastScannedId}
                        </Badge>
                    )
                }
                return <Badge variant="secondary"><PowerOff className="mr-1 h-3 w-3" /> Scanner Paused</Badge>;
            }
        }

        // Default state - no class selected
        return <Badge variant="secondary">Select a class to start</Badge>;
    };


    return (
        <>
            <Card className="w-full  mx-auto bg-card/5 backdrop-blur-sm border border-card/30 shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="icon" onClick={() => router.back()} aria-label="Go back">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <CardTitle className="text-2xl font-bold">Scan Attendance</CardTitle>
                        </div>
                        {/* Status Badge Area in Header */}
                        <div className="min-h-[24px]">{renderStatusBadge()}</div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">

                    {/* Class Selection */}
                    <div className="space-y-1.5">
                        <Label htmlFor="courseClassSelect">Select Class/Session</Label>
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                            <Select
                                value={selectedClass?.id || ""}
                                onValueChange={handleClassChange}
                                disabled={classOptionsLoading || markingLoading || fetchingStudentInfo} // Disable while loading anything critical
                            >
                                <SelectTrigger id="courseClassSelect" className="w-full sm:w-auto sm:min-w-[300px] flex-grow">
                                    <SelectValue placeholder="Select a class to start scanning..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="select-a-class">-- Select a Class --</SelectItem>
                                    {classOptionsLoading && (
                                        <SelectItem value="loading" disabled>Loading classes...</SelectItem>
                                    )}
                                    {classOptions.map((option) => (
                                        <SelectItem key={option.id} value={option.id}>
                                            {option.courseName} - {option.sessionName}
                                        </SelectItem>
                                    ))}
                                    {!classOptionsLoading && classOptions.length === 0 && (
                                        <SelectItem value="no-classes" disabled>No classes available</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>

                            {/* Manual Pause/Resume Button */}
                            {selectedClass?.id && (
                                <Button
                                    variant="outline"
                                    size="default" // Make it standard size
                                    onClick={toggleScanner}
                                    disabled={!selectedClass?.id || markingLoading || fetchingStudentInfo} // Disable if busy
                                    className="w-full sm:w-auto flex-shrink-0"
                                >
                                    {isScannerActive ? <PowerOff className="mr-2 h-4 w-4" /> : <Power className="mr-2 h-4 w-4" />}
                                    {isScannerActive ? "Pause Scanner" : "Resume Scanner"}
                                </Button>
                            )}
                        </div>
                        {!selectedClass?.id && !classOptionsLoading && (
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
                            <div className="flex justify-center items-center w-full h-[350px]"> {/* Fixed height container */}
                                {/* Barcode Scanner Component */}
                                {/* Use max-width to control size on larger screens */}
                                <div className="w-full max-w-md">
                                    <BarcodeScanner
                                        // Using 100% width makes it responsive within its container
                                        width="100%"
                                        height={300} // Fixed height, adjust as needed
                                        onDetected={handleBarcodeDetected}
                                        // Pass the active state, controlled by class selection AND modal state
                                        isActive={isScannerActive}
                                        scanDelay={750} // Increase delay slightly
                                    />
                                </div>
                            </div>
                        ) : (
                            <Alert variant="default" className="mt-6">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Select a Class</AlertTitle>
                                <AlertDescription>
                                    Please choose a class or session from the dropdown above to begin scanning attendance.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Status Feedback Area (alternative position) */}
                    {/* <div className="text-center pt-2 min-h-[2.5rem]">{renderStatusBadge()}</div> */}

                </CardContent>
            </Card>

            {/* Student Info Modal - Pass necessary props */}
            <StudentInfoModal
                isOpen={isModalOpen}
                onClose={handleModalClose} // Only closes modal
                onResumeScan={handleResumeScan} // Closes modal AND resets/resumes scan
                studentInfo={studentInfo}
                isLoading={fetchingStudentInfo} // Pass student fetching status
                scannedId={lastScannedId}
                // Pass attendance marking status/error
                apiStatus={markingLoading ? 'loading' : apiStatus}
                apiError={apiError}
            />

            {/* CSS for fade-out animation */}
            <style jsx global>{`
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                .animate-fade-out {
                    animation: fadeOut 1.5s ease-out forwards;
                    /* Adjust duration as needed */
                }
             `}</style>
        </>
    );
}