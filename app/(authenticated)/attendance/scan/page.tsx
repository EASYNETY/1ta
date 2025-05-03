// app/(authenticated)/attendance/scan/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import BarcodeScanner from "@/lib/barcode-scanner"
import { StudentInfoModal } from "@/components/students/student-info-modal"

// Redux imports
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
    markStudentAttendance,
    resetMarkingStatus,
    selectAttendanceMarkingLoading,
    selectAttendanceMarkingError,
    selectAttendanceMarkingStatus,
    selectLastMarkedStudentId,
} from "@/features/attendance/store/attendance-slice"

// Class options hook
import { useCourseClassOptions } from "@/features/classes/hooks/useCourseClassOptions"
import { selectCourseClass, setCourseClass } from "@/features/classes/store/classSessionSlice"

// UI Components
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, Loader2, UserCheck, Power, PowerOff, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

// Mock student data for demonstration
interface StudentInfo {
    id: string | number
    name: string
    email: string
    dateOfBirth?: string
    classId?: string
    className?: string
    barcodeId: string
}

// Mock function to fetch student info
const fetchStudentInfo = async (studentId: string): Promise<StudentInfo | null> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Mock student data - ensure we have exact matches for the barcodes
    const mockStudents: Record<string, StudentInfo> = {
        "STUDENT-123": {
            id: "3",
            name: "Student User",
            email: "student@example.com",
            dateOfBirth: "2000-01-01",
            classId: "1",
            className: "Computer Science 101",
            barcodeId: "STUDENT-123",
        },
        "TEMP-123": {
            id: "4",
            name: "New Student",
            email: "newstudent@example.com",
            barcodeId: "TEMP-123",
        },
        // Add more test data for common IDs
        "1": {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            dateOfBirth: "1999-05-15",
            classId: "2",
            className: "Physics 101",
            barcodeId: "1",
        },
        "2": {
            id: "2",
            name: "Jane Smith",
            email: "jane@example.com",
            dateOfBirth: "2000-08-22",
            classId: "3",
            className: "Chemistry 101",
            barcodeId: "2",
        },
        "3": {
            id: "3",
            name: "Student User",
            email: "student@example.com",
            dateOfBirth: "2000-01-01",
            classId: "1",
            className: "Computer Science 101",
            barcodeId: "3",
        },
        "4": {
            id: "4",
            name: "New Student",
            email: "newstudent@example.com",
            barcodeId: "4",
        },
    }

    // Log the scanned ID for debugging
    console.log("Fetching student with ID:", studentId)

    return mockStudents[studentId] || null
}

export default function ScanPage() {
    const router = useRouter()
    const { toast } = useToast()
    const dispatch = useAppDispatch()

    // Redux state
    const { user } = useAppSelector((state) => state.auth)
    const selectedClass = useAppSelector(selectCourseClass)
    const isLoading = useAppSelector(selectAttendanceMarkingLoading)
    const apiError = useAppSelector(selectAttendanceMarkingError)
    const apiStatus = useAppSelector(selectAttendanceMarkingStatus)
    const lastMarkedStudentId = useAppSelector(selectLastMarkedStudentId)

    // Local state
    const classOptions = useCourseClassOptions()
    const [isScanning, setIsScanning] = useState(false)
    const [lastScannedId, setLastScannedId] = useState<string | null>(null)
    const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null)
    const [fetchingStudent, setFetchingStudent] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Set isScanning to false on mount and check authorization
    useEffect(() => {
        setIsScanning(false)

        // Check if user is authorized
        if (!user || (user.role !== "admin" && user.role !== "teacher")) {
            toast({
                variant: "destructive",
                title: "Unauthorized",
                description: "Access denied.",
            })
            router.replace("/dashboard")
            return
        }

        // Reset marking status on mount
        dispatch(resetMarkingStatus())

        // Cleanup function
        return () => {
            setIsScanning(false)
            dispatch(resetMarkingStatus())
        }
    }, [user, router, toast, dispatch, isModalOpen])

    // Activate scanner when class is selected
    useEffect(() => {
        if (selectedClass?.id) {
            setIsScanning(true)
            toast({
                variant: "default",
                title: "Scanner Activated",
                description: `Scanning for ${selectedClass.courseName} - ${selectedClass.sessionName}`,
            })
            dispatch(resetMarkingStatus())
            setLastScannedId(null)
            setStudentInfo(null)
        } else {
            setIsScanning(false)
        }
    }, [selectedClass, dispatch, toast, isModalOpen])

    // Handle class selection
    const handleClassChange = (value: string) => {
        if (value === "select-a-class") {
            dispatch(
                setCourseClass({
                    id: "",
                    courseName: "",
                    sessionName: "",
                }),
            )
            return
        }

        const selected = classOptions.find((option) => option.id === value)
        if (selected) {
            dispatch(setCourseClass(selected))
            console.log("Selected Class:", selected)
        }
    }

    // Handle barcode detection
    const handleBarcodeDetected = async (studentId: string) => {
        if (!selectedClass?.id || isLoading || !isScanning) return

        // Ensure studentId is a string and trim any whitespace
        const barcodeId = String(studentId).trim()
        console.log("Detected barcode:", barcodeId)

        // Immediately pause scanning and open modal
        setIsScanning(false)
        setIsModalOpen(true)
        setLastScannedId(barcodeId)
        dispatch(resetMarkingStatus())

        // Fetch student info
        setFetchingStudent(true)
        try {
            const info = await fetchStudentInfo(barcodeId)
            console.log("Fetched student info:", info)
            setStudentInfo(info)
        } catch (error) {
            console.error("Error fetching student info:", error)
        } finally {
            setFetchingStudent(false)
        }

        const payload = {
            studentId: barcodeId,
            classInstanceId: selectedClass.id,
            markedByUserId: user!.id,
            timestamp: new Date().toISOString(),
        }

        dispatch(markStudentAttendance(payload))
            .unwrap()
            .then((response) => {
                toast({
                    variant: "success",
                    title: "Attendance Marked",
                    description: `Student: ${response.studentId} marked. ${response.message || ""}`,
                })
                // Note: We don't auto-resume scanning here
                // The user must close the modal to resume scanning
            })
            .catch((error) => {
                const errorMsg = typeof error === "string" ? error : "An unknown error occurred."
                toast({
                    variant: "destructive",
                    title: "Marking Failed",
                    description: `${errorMsg}. ID: ${barcodeId}`,
                })
                // Note: We don't auto-resume scanning here
                // The user must close the modal to resume scanning
            })
    }

    // Handle modal close
    const handleModalClose = () => {
        setIsModalOpen(false)
    }

    // Resume scanning (called after modal is closed)
    const handleResumeScan = () => {
        if (selectedClass?.id) {
            // Reset states
            setLastScannedId(null)
            setStudentInfo(null)
            dispatch(resetMarkingStatus())

            // Resume scanning
            setIsScanning(true)
        }
    }

    // Toggle scanner
    const toggleScanner = () => {
        setIsScanning((prev) => !prev)
    }

    // Render status badge
    const renderStatusBadge = () => {
        if (isLoading) {
            return (
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Processing...
                </Badge>
            )
        }

        switch (apiStatus) {
            case "success":
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                        <CheckCircle className="mr-1 h-3 w-3" /> Success: {lastMarkedStudentId}
                    </Badge>
                )
            case "error":
                return (
                    <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" /> Error: {apiError} (ID: {lastScannedId})
                    </Badge>
                )
            case "idle":
                if (isScanning && selectedClass?.id) {
                    return <Badge variant="outline">Ready to scan</Badge>
                }
                if (!selectedClass?.id) {
                    return <Badge variant="secondary">Select a class to start</Badge>
                }
                return <Badge variant="secondary">Scanner paused</Badge>
            default:
                return null
        }
    }

    if (isLoading && !studentInfo && !isModalOpen) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        )
    }

    return (
        <>
            <Card className="mx-auto bg-card/5 backdrop-blur-sm border border-card/30 backdrop-saturate-150 shadow-md">
                <CardContent className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold">Scan Attendance</h1>
                    </div>

                    {/* Class Selection */}
                    <div className="space-y-1.5">
                        <Label htmlFor="courseClassSelect">Select Class/Session</Label>
                        <Select value={selectedClass?.id || ""} onValueChange={handleClassChange} disabled={isLoading}>
                            <SelectTrigger id="courseClassSelect" className="w-full md:w-1/2">
                                <SelectValue placeholder="Select a class to start scanning..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="select-a-class">-- Select a Class --</SelectItem>
                                {classOptions.length === 0 && (
                                    <SelectItem value="loading" disabled>
                                        Loading classes...
                                    </SelectItem>
                                )}
                                {classOptions.map((option) => (
                                    <SelectItem key={option.id} value={option.id}>
                                        {option.courseName} - {option.sessionName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {!selectedClass?.id && (
                            <p className="text-xs text-muted-foreground pt-1">You must select a class before scanning.</p>
                        )}
                    </div>

                    {/* Scanner Section */}
                    <div className="space-y-4">
                        {selectedClass?.id ? (
                            <>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <UserCheck className="h-4 w-4" /> Scanning for:
                                        <span className="font-medium">
                                            {selectedClass.courseName} - {selectedClass.sessionName}
                                        </span>
                                    </p>

                                    {/* Manual Pause/Resume Button */}
                                    <Button variant="outline" size="sm" onClick={toggleScanner} disabled={isLoading || !selectedClass.id}>
                                        {isScanning ? <PowerOff className="mr-2 h-4 w-4" /> : <Power className="mr-2 h-4 w-4" />}
                                        {isScanning ? "Pause Scanner" : "Resume Scanner"}
                                    </Button>
                                </div>

                                {/* Barcode Scanner */}
                                <div className="flex justify-center">
                                    <BarcodeScanner
                                        onDetected={handleBarcodeDetected}
                                        width={400}
                                        height={300} // Adjusted for better barcode scanning ratio
                                        isActive={isScanning && !isLoading && !isModalOpen}
                                    />
                                </div>
                            </>
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

                    {/* Status Feedback Area */}
                    <div className="text-center pt-2 min-h-[2.5rem]">{renderStatusBadge()}</div>
                </CardContent>
            </Card>

            {/* Student Info Modal */}
            <StudentInfoModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                studentInfo={studentInfo}
                isLoading={fetchingStudent}
                scannedId={lastScannedId}
                apiStatus={apiStatus}
                apiError={apiError}
                onResumeScan={handleResumeScan}
            />
        </>
    )
}
