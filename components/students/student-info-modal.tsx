// components/students/student-info-modal.tsx

"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Calendar,
    School,
    BookOpen,
    User as UserIcon, // Renamed to avoid conflict if User is a type
    CheckCircle,
    XCircle,
    Loader2,
    Barcode,
    AlertTriangle,
    CreditCard, // Added for payment status
    ScanLine // Added for casual scan mode
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { isToday, isYesterday, format } from "date-fns";


// This interface should align with the data you pass from ScanPage.tsx
// which in turn should be derived from your canonical User/StudentUser type.
interface StudentInfo {
    id: string;
    name: string;
    email: string;
    dateOfBirth?: string | null;
    classId?: string | null;     // Student's assigned class ID
    className?: string;          // Name of the student's assigned class
    barcodeId: string;
    isActive?: boolean;      // This will be interpreted as paid status for display
    avatarUrl?: string | null; // URL for the student's avatar image
}

interface StudentInfoModalProps {
    isOpen: boolean
    onClose: () => void        // Function to visually close the modal
    onResumeScan: () => void   // Function to reset state AND resume scanning in parent
    studentInfo: StudentInfo | null // The student data to display
    isLoading: boolean         // True when student details are being fetched/processed after scan
    scannedId: string | null   // The ID that was scanned from the barcode
    apiStatus: "success" | "error" | "idle" | "loading" // Status of the markAttendance API call
    apiError: string | null    // Error message from the markAttendance API call
    casualScanMode?: boolean   // Whether we're in casual scan mode (view only)
    checkInDateTime?: string   // New: Date and time of check-in
    lectureName?: string       // New: Name of the lecture/class checked in for
}

export function StudentInfoModal({
    isOpen,
    onClose,
    onResumeScan,
    studentInfo,
    isLoading,
    scannedId,
    apiStatus,
    apiError,
    casualScanMode = false,
    checkInDateTime,
    lectureName,
}: StudentInfoModalProps) {

    // This function handles closing the modal AND triggering the scan resumption
    const handleCloseAndResume = () => {
        onClose();        // Close the modal visually
        onResumeScan();   // Trigger the parent component's resume logic
    };



    const formatLocalTimestamp = (ts?: string | null): string => {
        if (!ts) return "";

        try {
            const [datePart, timePart] = ts.split("T");
            if (!datePart || !timePart) return ts;

            const [year, month, day] = datePart.split("-").map(Number);
            const [hour, minute, second] = timePart.split(":").map(Number);

            // Construct a *local* date (no UTC shift)
            const date = new Date(year, month - 1, day, hour, minute, second || 0);

            if (isToday(date)) return format(date, "HH:mm");
            if (isYesterday(date)) return `Yesterday ${format(date, "HH:mm")}`;
            return format(date, "dd/MM/yyyy HH:mm");
        } catch (error) {
            console.error("Error formatting timestamp:", error);
            return ts;
        }
    };

    const getDialogTitle = () => {
        if (isLoading) return "Processing Scan...";
        if (apiStatus === "loading") return "Marking Attendance...";
        if (studentInfo) return "Student Information";
        if (scannedId && !studentInfo && !isLoading) return "Student Not Found";
        return "Scan Result"; // Default title
    }

    const getDialogDescription = () => {
        if (isLoading) return `Looking up student with barcode: ${scannedId || 'N/A'}...`;
        if (apiStatus === 'loading') return "Submitting attendance record to the server...";

        if (casualScanMode && studentInfo) {
            return `Viewing details for ${studentInfo.name} (Casual scan mode - attendance not marked)`;
        }

        if (studentInfo && apiStatus === 'success') return `Attendance successfully marked for ${studentInfo.name}.`;
        if (studentInfo && apiStatus === 'error') return `Failed to mark attendance for ${studentInfo.name}. Please try again.`;
        if (studentInfo) return `Details for student associated with barcode: ${scannedId || 'N/A'}`;
        if (scannedId && !studentInfo && !isLoading) return `No student record found for barcode: ${scannedId || 'N/A'}.`;
        return "Scan result will appear here once a barcode is detected.";
    }

    return (
        // Prevent closing on overlay click if an action is in progress (e.g., apiStatus === 'loading')
        <Dialog open={isOpen} onOpenChange={(open: boolean) => { if (!open) handleCloseAndResume(); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{getDialogTitle()}</DialogTitle>
                    <DialogDescription>
                        {getDialogDescription()}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 min-h-[200px]"> {/* Adjusted min-height for content consistency */}
                    {isLoading ? ( // Skeleton UI when student info is being looked up
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-16 w-16 rounded-full" /> {/* Avatar skeleton */}
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-[200px]" /> {/* Name skeleton */}
                                    <Skeleton className="h-4 w-[150px]" /> {/* Email skeleton */}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 mt-4 pt-2 border-t">
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-6 w-full" />
                            </div>
                        </div>
                    ) : !studentInfo && scannedId ? ( // Student not found state
                        <div className="p-4 border border-orange-300 bg-orange-50 rounded-md text-orange-700 flex flex-col items-center text-center space-y-2">
                            <AlertTriangle className="h-10 w-10 text-orange-500" />
                            <span className="font-semibold text-lg">Student Not Found</span>
                            <p className="text-sm">No student record is associated with the scanned barcode:</p>
                            <code className="text-sm font-mono bg-orange-100 text-orange-800 px-2 py-1 rounded">{scannedId}</code>
                        </div>
                    ) : studentInfo ? ( // Student found - display details
                        <div className="space-y-3">
                            <div className="flex items-center space-x-4 pb-3">
                                {studentInfo.avatarUrl ? (
                                    <img
                                        src={studentInfo.avatarUrl}
                                        alt={studentInfo.name}
                                        className="h-16 w-16 rounded-full object-cover border-2 border-primary/20 shadow-sm"
                                    />
                                ) : (
                                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0 border shadow-sm">
                                        <UserIcon className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="flex-grow">
                                    <h3 className="font-semibold text-xl leading-tight">{studentInfo.name}</h3>
                                    <p className="text-sm text-muted-foreground truncate">{studentInfo.email}</p>
                                </div>
                            </div>

                            <div className="border-t pt-3 grid grid-cols-1 gap-x-4 gap-y-1.5"> {/* Reduced gap-y slightly */}
                                <InfoItem icon={Barcode} label="Barcode ID" value={studentInfo.barcodeId} isCode />
                                <InfoItem icon={BookOpen} label="Student ID" value={studentInfo.barcodeId} isCode />
                                {studentInfo.className && <InfoItem icon={School} label="Registered Class" value={studentInfo.className} />}
                                {lectureName && <InfoItem icon={BookOpen} label="Lecture/Class" value={lectureName} />}
                                <InfoItem icon={Calendar} label="Date of Birth" value={studentInfo.dateOfBirth || "Not Provided"} />
                                {/* {checkInDateTime && <InfoItem icon={Calendar} label="Check-in Time" value={checkInDateTime} />} */}
                                {checkInDateTime && (
                                    <InfoItem
                                        icon={Calendar}
                                        label="Check-in Time"
                                        value={formatLocalTimestamp(checkInDateTime)}
                                    />
                                )}
                                {/* Treat isActive as Paid Status */}
                                <InfoItem
                                    icon={CreditCard}
                                    label="Payment Status"
                                    value={(studentInfo.isActive === true || Number(studentInfo.isActive) === 1) ? "Paid" : studentInfo.isActive === false ? "Unpaid" : "Unknown"}
                                    valueAsBadge={true}
                                    badgeVariant={
                                        (studentInfo.isActive === true || Number(studentInfo.isActive) === 1) ? "default"
                                            : studentInfo.isActive === false ? "destructive"
                                                : "secondary"
                                    }
                                    badgeClassName={(studentInfo.isActive === true || Number(studentInfo.isActive) === 1) ? "bg-green-100 text-green-800 border-green-200" : ""}
                                />
                            </div>

                            {/* API Status Feedback for Attendance Marking */}
                            {casualScanMode && !isLoading && (
                                <div className="p-3 mt-3 bg-purple-50 text-purple-700 rounded-md text-sm flex items-center gap-2 border border-purple-200 dark:bg-purple-700/10 dark:text-purple-300 dark:border-purple-600/30">
                                    <ScanLine className="h-5 w-5 flex-shrink-0" />
                                    Casual scan mode: Student details viewed only (attendance not marked).
                                </div>
                            )}
                            {!casualScanMode && apiStatus === "success" && !isLoading && (
                                <div className="p-3 mt-3 bg-green-50 text-green-700 rounded-md text-sm flex items-center gap-2 border border-green-200 dark:bg-green-700/10 dark:text-green-300 dark:border-green-600/30">
                                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                                    Attendance marked successfully.
                                </div>
                            )}
                            {!casualScanMode && apiStatus === "error" && !isLoading && (
                                <div className="p-3 mt-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center gap-2 border border-red-200 dark:bg-red-700/10 dark:text-red-300 dark:border-red-600/30">
                                    <XCircle className="h-5 w-5 flex-shrink-0" />
                                    Error: {apiError || "Could not mark attendance."}
                                </div>
                            )}
                            {!casualScanMode && apiStatus === "loading" && !isLoading && ( // Show if marking is in progress (after student info is loaded)
                                <div className="p-3 mt-3 bg-blue-50 text-blue-700 rounded-md text-sm flex items-center gap-2 border border-blue-200 dark:bg-blue-700/10 dark:text-blue-300 dark:border-blue-600/30">
                                    <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin" />
                                    Marking attendance, please wait...
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-10">
                            Ready to scan.
                        </div>
                    ) /* Initial state before any scan */}
                </div>

                <DialogFooter className="sm:justify-end pt-4">
                    {apiStatus === 'loading' && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 mr-auto dark:bg-blue-700/20 dark:text-blue-300 dark:border-blue-600/30">
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Processing...
                        </Badge>
                    )}
                    <Button
                        type="button"
                        onClick={handleCloseAndResume}
                        disabled={apiStatus === 'loading'} // Disable button while attendance marking is in progress
                        className="w-full sm:w-auto"
                    >
                        {casualScanMode && studentInfo
                            ? "Scan Another Student"
                            : apiStatus === 'success' || apiStatus === 'error' || (!studentInfo && scannedId)
                                ? "Scan Next Student"
                                : "Close"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Helper component for displaying info items
const InfoItem: React.FC<{
    icon: React.ElementType,
    label: string,
    value?: string | number | null | boolean, // Allow boolean for generic use if needed
    isCode?: boolean,
    valueAsBadge?: boolean,
    badgeVariant?: "default" | "secondary" | "destructive" | "outline",
    badgeClassName?: string
}> = ({ icon: Icon, label, value, isCode = false, valueAsBadge = false, badgeVariant = "secondary", badgeClassName = "" }) => {
    // More robust check for empty or undefined values
    if (value === undefined || value === null || String(value).trim() === '') {
        // Optionally display N/A for specifically empty strings if desired, else hide
        // For now, we just don't render the item if value is not meaningfully present
        return null;
    }

    let displayValue: React.ReactNode;
    const stringValue = String(value); // Convert to string for display in Badge or span

    if (valueAsBadge) {
        displayValue = (
            <Badge variant={badgeVariant} className={badgeClassName}>
                {stringValue}
            </Badge>
        );
    } else if (isCode) {
        displayValue = <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{stringValue}</code>;
    } else {
        displayValue = <span className="font-medium truncate">{stringValue}</span>;
    }

    return (
        <div className="flex items-start gap-2.5 text-sm py-1"> {/* Adjusted gap and py */}
            <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-[3px]" /> {/* Fine-tuned icon alignment */}
            <span className="text-muted-foreground min-w-[110px] w-[110px] flex-shrink-0">{label}:</span> {/* Fixed width for labels */}
            <div className="flex-grow min-w-0 break-words">{displayValue}</div> {/* Allow words to break */}
        </div>
    );
}