// app/(authenticated)/attendance/scan/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import BarcodeScanner from "@/lib/barcode-scanner"

// UI Components
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, Loader2, UserCheck, Power, PowerOff, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

// Mock data for demonstration
const MOCK_CLASSES = [
    { id: "class1", courseName: "Mathematics", sessionName: "Morning Session" },
    { id: "class2", courseName: "Physics", sessionName: "Afternoon Session" },
    { id: "class3", courseName: "Computer Science", sessionName: "Evening Session" },
]

export default function ScanPage() {
    const router = useRouter()
    const { toast } = useToast()

    // State
    const [selectedClass, setSelectedClass] = useState<any>(null)
    const [isScanning, setIsScanning] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error">("idle")
    const [lastScannedId, setLastScannedId] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    // Set isScanning to false on mount
    useEffect(() => {
        setIsScanning(false)

        // Cleanup function
        return () => {
            // Reset states when component unmounts
            setIsScanning(false)
            setScanStatus("idle")
        }
    }, [])

    // Activate scanner when class is selected
    useEffect(() => {
        if (selectedClass) {
            setIsScanning(true)
            setScanStatus("idle")
            setLastScannedId(null)
            setErrorMessage(null)
        } else {
            setIsScanning(false)
        }
    }, [selectedClass])

    // Handle class selection
    const handleClassChange = (value: string) => {
        if (value === "select-a-class") {
            setSelectedClass(null)
            return
        }

        const selected = MOCK_CLASSES.find((c) => c.id === value)
        setSelectedClass(selected || null)
    }

    // Handle barcode detection
    const handleBarcodeDetected = async (studentId: string) => {
        if (!selectedClass || isLoading) return

        setIsLoading(true)
        setLastScannedId(studentId)
        setScanStatus("idle")
        setErrorMessage(null)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // 80% success rate for demo purposes
            if (Math.random() > 0.2) {
                setScanStatus("success")
                toast({
                    variant: "success",
                    title: "Attendance Marked",
                    description: `Student: ${studentId} marked successfully.`,
                })
            } else {
                throw new Error("Student not found in this class")
            }
        } catch (error: any) {
            setScanStatus("error")
            setErrorMessage(error.message)
            toast({
                variant: "destructive",
                title: "Marking Failed",
                description: `${error.message}. ID: ${studentId}`,
            })
        } finally {
            setIsLoading(false)
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

        switch (scanStatus) {
            case "success":
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                        <CheckCircle className="mr-1 h-3 w-3" /> Success: {lastScannedId}
                    </Badge>
                )
            case "error":
                return (
                    <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" /> Error: {errorMessage} (ID: {lastScannedId})
                    </Badge>
                )
            case "idle":
                if (isScanning && selectedClass) {
                    return <Badge variant="outline">Ready to scan</Badge>
                }
                if (!selectedClass) {
                    return <Badge variant="secondary">Select a class to start</Badge>
                }
                return <Badge variant="secondary">Scanner paused</Badge>
            default:
                return null
        }
    }

    return (
        <Card className="mx-auto bg-card/5 backdrop-blur-sm border border-card/30 backdrop-saturate-150 shadow-md">
            <CardContent className="space-y-6">
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
                            {MOCK_CLASSES.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                    {option.courseName} - {option.sessionName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {!selectedClass && (
                        <p className="text-xs text-muted-foreground pt-1">You must select a class before scanning.</p>
                    )}
                </div>

                {/* Scanner Section */}
                <div className="space-y-4">
                    {selectedClass ? (
                        <>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <UserCheck className="h-4 w-4" /> Scanning for:
                                    <span className="font-medium">
                                        {selectedClass.courseName} - {selectedClass.sessionName}
                                    </span>
                                </p>

                                {/* Manual Pause/Resume Button */}
                                <Button variant="outline" size="sm" onClick={toggleScanner} disabled={isLoading || !selectedClass}>
                                    {isScanning ? <PowerOff className="mr-2 h-4 w-4" /> : <Power className="mr-2 h-4 w-4" />}
                                    {isScanning ? "Pause Scanner" : "Resume Scanner"}
                                </Button>
                            </div>

                            {/* Barcode Scanner */}
                            <div className="flex justify-center">
                                <BarcodeScanner
                                    onDetected={handleBarcodeDetected}
                                    width={400}
                                    height={400}
                                    isActive={isScanning && !isLoading}
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
    )
}
