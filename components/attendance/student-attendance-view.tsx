"use client"

import { useState, useMemo } from "react"
import { useAppSelector } from "@/store/hooks"
import { format, parseISO, isToday } from "date-fns"
import { Check, X, Clock, Calendar, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { selectStudentAttendanceRecords } from "@/features/attendance/store/attendance-slice"
import type { StudentAttendanceRecord, AttendanceStatus } from "@/data/mock-attendance-data"
import { cn } from "@/lib/utils"
import { isStudent } from "@/types/user.types"

export function StudentAttendanceView() {
    const { user } = useAppSelector((state) => state.auth)
    const [selectedRecord, setSelectedRecord] = useState<StudentAttendanceRecord | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)

    // Get attendance records for the current user
    const studentRecords = useAppSelector((state) =>
        user?.id ? selectStudentAttendanceRecords(state, String(user.id)) : [],
    )

    // Calculate attendance statistics
    const attendanceStats = useMemo(() => {
        const total = studentRecords.length
        if (total === 0)
            return { total: 0, present: 0, absent: 0, late: 0, presentPercentage: 0, absentPercentage: 0, latePercentage: 0 }

        const present = studentRecords.filter((a) => a.status === "present").length
        const absent = studentRecords.filter((a) => a.status === "absent").length
        const late = studentRecords.filter((a) => a.status === "late").length

        const presentPercentage = (present / total) * 100
        const absentPercentage = (absent / total) * 100
        const latePercentage = (late / total) * 100

        return { total, present, absent, late, presentPercentage, absentPercentage, latePercentage }
    }, [studentRecords])

    // Helper function to get status classes
    const getStatusClasses = (status: AttendanceStatus): string => {
        switch (status) {
            case "present":
                return "bg-green-200/30 text-green-800 border-green-300 dark:bg-green-300/10 dark:text-green-400 dark:border-green-400/20";
            case "absent":
                return "bg-red-200/30 text-red-800 border-red-300 dark:bg-red-300/10 dark:text-red-400 dark:border-red-400/20";
            case "late":
                return "bg-amber-200/30 text-amber-800 border-amber-300 dark:bg-amber-300/10 dark:text-amber-400 dark:border-amber-400/20";
            default:
                return "bg-muted/50 text-muted-foreground border-border dark:bg-muted/10 dark:text-muted-foreground dark:border-muted/30";
        }
    };


    // Helper function to get status icon
    const getStatusIcon = (status: AttendanceStatus) => {
        switch (status) {
            case "present":
                return <Check className="h-4 w-4 text-green-600 dark:text-green-300" />
            case "absent":
                return <X className="h-4 w-4 text-red-600 dark:text-red-300" />
            case "late":
                return <Clock className="h-4 w-4 text-amber-600 dark:text-amber-300" />
            default:
                return null
        }
    }

    // Helper function to get status text
    const getStatusText = (status: AttendanceStatus): string => {
        switch (status) {
            case "present":
                return "You were present on this day."
            case "absent":
                return "You were marked absent on this day."
            case "late":
                return "You arrived late on this day."
            default:
                return "No attendance record for this day."
        }
    }

    // Handle record click
    const handleRecordClick = (record: StudentAttendanceRecord) => {
        setSelectedRecord(record)
        setIsDetailsOpen(true)
    }

    if (!user) return null

    return (
        <div className="space-y-6">
            {/* Attendance Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    {
                        label: "Present",
                        value: attendanceStats.present,
                        percent: attendanceStats.presentPercentage,
                        icon: <Check className="h-4 w-4" />,
                        color: "bg-green-600",
                    },
                    {
                        label: "Absent",
                        value: attendanceStats.absent,
                        percent: attendanceStats.absentPercentage,
                        icon: <X className="h-4 w-4" />,
                        color: "bg-red-600",
                    },
                    {
                        label: "Late",
                        value: attendanceStats.late,
                        percent: attendanceStats.latePercentage,
                        icon: <Clock className="h-4 w-4" />,
                        color: "bg-amber-600",
                    },
                ].map(({ label, value, percent, icon, color }) => (
                    <Card key={label} className="shadow-sm bg-card/5 backdrop-blur-sm">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium">{label}</CardTitle>
                            <div className="h-4 w-4 text-muted-foreground">{icon}</div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{value} days</div>
                            <p className="text-xs text-muted-foreground mt-1 mb-2">{percent.toFixed(1)}% of recorded days</p>
                            <Progress value={percent} className={`h-2 ${color}`} />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Attendance Records List */}
            <Card className="bg-card/5 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Attendance History</CardTitle>
                </CardHeader>
                <CardContent>
                    {studentRecords.length > 0 ? (
                        <div className="space-y-2">
                            {studentRecords.map((record) => (
                                <div
                                    key={record.date}
                                    onClick={() => handleRecordClick(record)}
                                    className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">
                                            {format(parseISO(record.date), "EEEE, MMMM d, yyyy")}
                                            {isToday(parseISO(record.date)) && (
                                                <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                                                    Today
                                                </Badge>
                                            )}
                                        </span>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "capitalize text-xs px-2 py-0.5 font-semibold border",
                                            getStatusClasses(record.status),
                                        )}
                                    >
                                        <span className="flex items-center gap-1">
                                            {getStatusIcon(record.status)}
                                            {record.status}
                                        </span>
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">No attendance records found.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Attendance Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Attendance Details</DialogTitle>
                        <DialogDescription>
                            {selectedRecord && format(parseISO(selectedRecord.date), "EEEE, MMMM d, yyyy")}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRecord && (
                        <div className="space-y-4 py-4">
                            <div className={cn("p-4 rounded-md border", getStatusClasses(selectedRecord.status))}>
                                <div className="flex items-center gap-2 mb-2">
                                    {getStatusIcon(selectedRecord.status)}
                                    <span className="font-semibold capitalize">{selectedRecord.status}</span>
                                </div>
                                <p>{getStatusText(selectedRecord.status)}</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Student ID:</span>
                                    <span className="font-medium">{user.id}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Student Name:</span>
                                    <span className="font-medium">{user.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Class:</span>
                                    {isStudent(user) &&
                                        <span className="font-medium">{user.classId || "Not assigned"}</span>
                                    }
                                </div>
                                {selectedRecord.date && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Time:</span>
                                        <span className="font-medium">{selectedRecord.date}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button onClick={() => setIsDetailsOpen(false)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}