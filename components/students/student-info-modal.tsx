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
import { Calendar, School, BookOpen, User, CheckCircle, XCircle, Loader2, Barcode } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface StudentInfo {
    id: string | number
    name: string
    email: string
    dateOfBirth?: string
    classId?: string
    className?: string
    barcodeId: string
}

interface StudentInfoModalProps {
    isOpen: boolean
    onClose: () => void
    studentInfo: StudentInfo | null
    isLoading: boolean
    scannedId: string | null
    apiStatus: "success" | "error" | "idle"
    apiError: string | null
    onResumeScan: () => void
}

export function StudentInfoModal({
    isOpen,
    onClose,
    studentInfo,
    isLoading,
    scannedId,
    apiStatus,
    apiError,
    onResumeScan,
}: StudentInfoModalProps) {
    const handleClose = () => {
        onClose()
        onResumeScan()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Student Information</DialogTitle>
                    <DialogDescription>
                        {isLoading ? "Fetching student details..." : studentInfo ? "Student found" : "No student found"}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        </div>
                    ) : !studentInfo && scannedId ? (
                        <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-700">
                            <div className="flex items-center gap-2">
                                <XCircle className="h-5 w-5" />
                                <span className="font-medium">Student Not Found</span>
                            </div>
                            <p className="mt-2 text-sm">No student found with ID: {scannedId}</p>
                        </div>
                    ) : studentInfo ? (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium">{studentInfo.name}</h3>
                                    <p className="text-sm text-muted-foreground">{studentInfo.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Badge variant="outline" className="gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {studentInfo.dateOfBirth || "No DOB"}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Badge variant="outline" className="gap-1">
                                        <School className="h-3 w-3" />
                                        {studentInfo.className || "No Class"}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Badge variant="outline" className="gap-1">
                                        <BookOpen className="h-3 w-3" />
                                        ID: {studentInfo.id}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Badge variant="outline" className="gap-1">
                                        <Barcode className="h-3 w-3" />
                                        Barcode: {studentInfo.barcodeId}
                                    </Badge>
                                </div>
                            </div>

                            {apiStatus === "success" && (
                                <div className="p-2 bg-green-50 text-green-700 rounded-md text-sm flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Attendance marked successfully
                                </div>
                            )}

                            {apiStatus === "error" && (
                                <div className="p-2 bg-red-50 text-red-700 rounded-md text-sm flex items-center gap-2">
                                    <XCircle className="h-4 w-4" />
                                    {apiError}
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                <DialogFooter className="sm:justify-between">
                    <div className="flex items-center gap-2">
                        {apiStatus === "success" ? (
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                <CheckCircle className="mr-1 h-3 w-3" /> Marked
                            </Badge>
                        ) : apiStatus === "error" ? (
                            <Badge variant="destructive">
                                <XCircle className="mr-1 h-3 w-3" /> Failed
                            </Badge>
                        ) : isLoading ? (
                            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Processing...
                            </Badge>
                        ) : null}
                    </div>
                    <Button type="button" onClick={handleClose}>
                        {apiStatus === "success" ? "Scan Next" : "Close"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
