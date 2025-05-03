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
import { Calendar, School, BookOpen, User, CheckCircle, XCircle, Loader2, Barcode, AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface StudentInfo {
    id: string | number
    name: string
    email: string
    dateOfBirth?: string
    classId?: string
    className?: string
    barcodeId: string // Ensure this matches the scanned ID type/format if needed
}

interface StudentInfoModalProps {
    isOpen: boolean
    onClose: () => void // Just closes the modal
    onResumeScan: () => void // Resets state AND resumes scanning
    studentInfo: StudentInfo | null
    isLoading: boolean // Loading student info specifically
    scannedId: string | null
    apiStatus: "success" | "error" | "idle" | "loading" // Added loading state for API call
    apiError: string | null
}

export function StudentInfoModal({
    isOpen,
    onClose,
    onResumeScan, // Pass this down
    studentInfo,
    isLoading, // Loading student *details*
    scannedId,
    apiStatus, // Status of the *attendance marking* API call
    apiError,
}: StudentInfoModalProps) {

    // This function handles closing the modal AND triggering the scan resumption
    const handleCloseAndResume = () => {
        onClose(); // Close the modal visually
        onResumeScan(); // Trigger the parent component's resume logic
    };

    const getDialogTitle = () => {
        if (isLoading) return "Fetching Student Details...";
        if (apiStatus === "loading") return "Marking Attendance..."; // If marking takes time
        if (studentInfo) return "Student Information";
        if (scannedId && !studentInfo && !isLoading) return "Student Not Found";
        return "Scan Result";
    }

    const getDialogDescription = () => {
        if (isLoading) return `Looking for student with barcode: ${scannedId}...`;
        if (apiStatus === 'loading') return "Processing attendance..."
        if (studentInfo && apiStatus === 'success') return `Attendance marked for ${studentInfo.name}.`;
        if (studentInfo && apiStatus === 'error') return `Failed to mark attendance for ${studentInfo.name}.`;
        if (studentInfo) return `Details for barcode: ${scannedId}`;
        if (scannedId && !studentInfo && !isLoading) return `No student record found for barcode: ${scannedId}.`;
        return "Ready to display scan results.";
    }


    return (
        // Prevent closing on overlay click if an action is in progress
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseAndResume()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{getDialogTitle()}</DialogTitle>
                    <DialogDescription>
                        {getDialogDescription()}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 min-h-[150px]"> {/* Added min-height */}
                    {isLoading ? ( // Skeleton for fetching student info
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[200px]" />
                                    <Skeleton className="h-4 w-[150px]" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        </div>
                    ) : !studentInfo && scannedId ? ( // Student not found state
                        <div className="p-4 border border-orange-200 bg-orange-50/50 rounded-md text-orange-700 flex flex-col items-center text-center">
                            <AlertTriangle className="h-8 w-8 mb-2 text-orange-500" />
                            <span className="font-semibold">Student Not Found</span>
                            <p className="mt-1 text-sm">No student record associated with barcode:</p>
                            <code className="mt-1 text-sm font-mono bg-orange-100 px-1.5 py-0.5 rounded">{scannedId}</code>
                        </div>
                    ) : studentInfo ? ( // Student found - display details
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <User className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-semibold text-lg">{studentInfo.name}</h3>
                                    <p className="text-sm text-muted-foreground">{studentInfo.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-2">
                                <InfoItem icon={BookOpen} label="Student ID" value={studentInfo.id} />
                                <InfoItem icon={Barcode} label="Barcode ID" value={studentInfo.barcodeId} isCode />
                                <InfoItem icon={Calendar} label="Date of Birth" value={studentInfo.dateOfBirth} />
                                <InfoItem icon={School} label="Class" value={studentInfo.className} />
                            </div>

                            {/* API Status Feedback */}
                            {apiStatus === "success" && !isLoading && (
                                <div className="p-2 mt-3 bg-green-50 text-green-700 rounded-md text-sm flex items-center gap-2 border border-green-200">
                                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                                    Attendance marked successfully.
                                </div>
                            )}
                            {apiStatus === "error" && !isLoading && (
                                <div className="p-2 mt-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center gap-2 border border-red-200">
                                    <XCircle className="h-4 w-4 flex-shrink-0" />
                                    Error: {apiError || "Could not mark attendance."}
                                </div>
                            )}
                            {apiStatus === "loading" && !isLoading && ( // Show if marking is in progress
                                <div className="p-2 mt-3 bg-blue-50 text-blue-700 rounded-md text-sm flex items-center gap-2 border border-blue-200">
                                    <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                                    Marking attendance...
                                </div>
                            )}

                        </div>
                    ) : null /* Initial state before scan */}
                </div>

                <DialogFooter className="sm:justify-end">
                    {/* Show loading indicator during API call */}
                    {apiStatus === 'loading' && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 mr-auto">
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Processing...
                        </Badge>
                    )}
                    <Button
                        type="button"
                        onClick={handleCloseAndResume}
                        // Disable button while marking attendance
                        disabled={apiStatus === 'loading'}
                    >
                        {/* Change button text based on outcome */}
                        {apiStatus === 'success' ? "Scan Next" : (studentInfo || apiStatus === 'error' || (!studentInfo && scannedId)) ? "Scan Next" : "Close"}
                        {/* Or keep it simple: "Scan Next" / "Close" */}
                        {/* {apiStatus === 'success' || apiStatus === 'error' || (!studentInfo && scannedId) ? "Scan Next" : "Close"} */}

                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Helper component for displaying info items
const InfoItem: React.FC<{ icon: React.ElementType, label: string, value?: string | number | null, isCode?: boolean }> = ({ icon: Icon, label, value, isCode = false }) => {
    if (!value) return null; // Don't render if value is missing

    return (
        <div className="flex items-center gap-2 text-sm py-1">
            <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">{label}:</span>
            {isCode ? (
                <code className="font-mono text-xs bg-secondary px-1 py-0.5 rounded">{value}</code>
            ) : (
                <span className="font-medium truncate">{value}</span>
            )}
        </div>
    );
}