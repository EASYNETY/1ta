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
import { isToday, isYesterday, format, parseISO, isValid } from "date-fns";


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
    paymentStatus?: string;
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
    paymentStatus?: string;
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
    paymentStatus
}: StudentInfoModalProps) {

    // This function handles closing the modal AND triggering the scan resumption
    const handleCloseAndResume = () => {
        onClose();        // Close the modal visually
        onResumeScan();   // Trigger the parent component's resume logic
    };



    // Parse ISO safely: if the string has timezone (Z or ±HH:MM), use parseISO (keeps absolute time, formats to local).
    // If it has NO timezone, treat it as already-local and build a local Date (prevents unwanted UTC shift).
    const parseLocalAware = (ts: string): Date => {
        const trimmed = ts.trim();

        // Normalize space separator to 'T' for simpler splitting
        const normalized = trimmed.replace(" ", "T");

        // Has explicit timezone? (Z or ±HH:MM at the end)
        const hasTZ = /[zZ]$|[+\-]\d{2}:\d{2}$/.test(normalized);
        if (hasTZ) {
            return parseISO(normalized);
        }

        // No timezone → treat as local wall time
        const [datePart, timePart = "00:00:00"] = normalized.split("T");
        const [y, m, d] = (datePart || "").split("-").map((n) => parseInt(n, 10));
        const [hh = 0, mm = 0, ss = 0] = (timePart.split(".")[0] || "")
            .split(":")
            .map((n) => parseInt(n, 10));

        return new Date(y || 0, (m || 1) - 1, d || 1, hh || 0, mm || 0, ss || 0);
    };

    const formatLocalTimestampKeepDate = (ts?: string | null): string => {
        if (!ts) return "";

        try {
            // Parse ISO string
            const date = parseISO(ts);
            if (!isValid(date)) return String(ts);

            // Format in local time with seconds
            return format(date, "yyyy-MM-dd HH:mm:ss");
        } catch {
            return String(ts);
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
                                <div className="flex-grow min-w-0"> {/* Added min-w-0 here to help constrain the name/email */}
                                    <h3 className="font-semibold text-xl leading-tight truncate">{studentInfo.name}</h3>
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
                                        value={formatLocalTimestampKeepDate(checkInDateTime)}
                                    />
                                )}
                                {/* Treat isActive as Paid Status */}
                                <InfoItem
                                    icon={CreditCard}
                                    label="Payment Status"
                                    value={paymentStatus || studentInfo?.paymentStatus || "Unknown"}  // Use API payment status first
                                    valueAsBadge={true}
                                    badgeVariant={
                                        (() => {
                                            const status = (paymentStatus || studentInfo?.paymentStatus || "Unknown").toLowerCase();
                                            switch (status) {
                                                case 'paid':
                                                    return "default" as const;
                                                case 'pending':
                                                    return "secondary" as const;
                                                case 'not paid':
                                                case 'failed':
                                                case 'cancelled':
                                                case 'refunded':
                                                    return "destructive" as const;
                                                default:
                                                    return "secondary" as const;
                                            }
                                        })()
                                    }
                                    badgeClassName={
                                        (() => {
                                            const status = (paymentStatus || studentInfo?.paymentStatus || "Unknown").toLowerCase();
                                            switch (status) {
                                                case 'paid':
                                                    return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-600/30";
                                                case 'pending':
                                                    return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-600/30";
                                                case 'not paid':
                                                case 'failed':
                                                case 'cancelled':
                                                case 'refunded':
                                                    return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-600/30";
                                                default:
                                                    return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-600/30";
                                            }
                                        })()
                                    }
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
    value?: string | number | null | boolean,
    isCode?: boolean,
    valueAsBadge?: boolean,
    badgeVariant?: "default" | "secondary" | "destructive" | "outline",
    badgeClassName?: string
}> = ({ icon: Icon, label, value, isCode = false, valueAsBadge = false, badgeVariant = "secondary", badgeClassName = "" }) => {
    if (value === undefined || value === null || String(value).trim() === '') {
        return null;
    }

    let displayValue: React.ReactNode;
    const stringValue = String(value);

    if (valueAsBadge) {
        displayValue = (
            <Badge variant={badgeVariant} className={badgeClassName}>
                {stringValue}
            </Badge>
        );
    } else if (isCode) {
        displayValue = <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{stringValue}</code>;
    } else {
        // --- FIX 1: Changed <span> to <p> ---
        // This makes it a block-level element, which is more reliable for truncation within a flex container.
        displayValue = <p className="font-medium truncate">{stringValue}</p>;
    }

    return (
        <div className="flex items-start gap-2.5 text-sm py-1">
            <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-[3px]" />
            <span className="text-muted-foreground min-w-[110px] w-[110px] flex-shrink-0">{label}:</span>
            {/* --- FIX 2: Removed `break-words` ---
                This class is for multi-line wrapping and conflicts with single-line truncation.
                The `min-w-0` is the crucial part that allows the container to shrink and the truncation to activate. */}
            <div className="flex-grow min-w-0">{displayValue}</div>
        </div>
    );
}
