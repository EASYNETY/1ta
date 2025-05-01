// components/attendance/attendance-tab.tsx

"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardHeader, CardTitle, CardContent, Card } from "@/components/ui/card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { useAppSelector } from "@/store/hooks"
import { CalendarIcon, Check, X, AlertCircle, Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWeekend, addMonths, subMonths } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BarcodeDialog } from "@/components/tools/BarcodeDialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

// Mock attendance data for student
const mockStudentAttendance = [
    { date: "2023-12-01", status: "present" },
    { date: "2023-12-02", status: "present" },
    { date: "2023-12-05", status: "present" },
    { date: "2023-12-06", status: "present" },
    { date: "2023-12-07", status: "present" },
    { date: "2023-12-08", status: "late" },
    { date: "2023-12-09", status: "present" },
    { date: "2023-12-12", status: "absent" },
    { date: "2023-12-13", status: "present" },
    { date: "2023-12-14", status: "present" },
    { date: "2023-12-15", status: "present" },
    { date: "2023-12-16", status: "present" },
    { date: "2023-12-19", status: "present" },
    { date: "2023-12-20", status: "present" },
]

// Mock attendance data for teacher
const mockClassAttendance = [
    {
        date: "2023-12-20",
        courseTitle: "Web Development Bootcamp",
        totalStudents: 45,
        present: 42,
        absent: 2,
        late: 1,
        students: [
            { id: "1", name: "John Smith", status: "present" },
            { id: "2", name: "Jane Doe", status: "present" },
            { id: "3", name: "Michael Johnson", status: "absent" },
            { id: "4", name: "Emily Williams", status: "present" },
            { id: "5", name: "David Brown", status: "present" },
            { id: "6", name: "Sarah Miller", status: "late" },
            { id: "7", name: "Robert Wilson", status: "present" },
            { id: "8", name: "Jennifer Moore", status: "present" },
            { id: "9", name: "William Taylor", status: "absent" },
            { id: "10", name: "Elizabeth Anderson", status: "present" },
        ]
    },
    {
        date: "2023-12-19",
        courseTitle: "Web Development Bootcamp",
        totalStudents: 45,
        present: 40,
        absent: 3,
        late: 2,
        students: [
            { id: "1", name: "John Smith", status: "present" },
            { id: "2", name: "Jane Doe", status: "present" },
            { id: "3", name: "Michael Johnson", status: "present" },
            { id: "4", name: "Emily Williams", status: "absent" },
            { id: "5", name: "David Brown", status: "present" },
            { id: "6", name: "Sarah Miller", status: "late" },
            { id: "7", name: "Robert Wilson", status: "present" },
            { id: "8", name: "Jennifer Moore", status: "present" },
            { id: "9", name: "William Taylor", status: "absent" },
            { id: "10", name: "Elizabeth Anderson", status: "late" },
        ]
    }
]

export function Attendance() {
    const { user } = useAppSelector((state) => state.auth)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
    const [showModal, setShowModal] = useState(false)


    if (!user) return null

    // Get days in current month
    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    })

    // Navigate to previous month
    const goToPreviousMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1))
    }

    // Navigate to next month
    const goToNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1))
    }

    // Get attendance status for a specific date
    const getAttendanceStatus = (date: Date) => {
        const formattedDate = format(date, "yyyy-MM-dd")
        const attendance = mockStudentAttendance.find(a => a.date === formattedDate)
        return attendance?.status || null
    }

    // Get status color
    const getStatusColor = (status: string | null) => {
        switch (status) {
            case "present":
                return "bg-green-100 text-green-800 border-green-300"
            case "absent":
                return "bg-red-100 text-red-800 border-red-300"
            case "late":
                return "bg-yellow-100 text-yellow-800 border-yellow-300"
            default:
                return "bg-gray-100 text-gray-800 border-gray-300"
        }
    }

    // Get status icon
    const getStatusIcon = (status: string | null) => {
        switch (status) {
            case "present":
                return <Check className="h-4 w-4 text-green-600" />
            case "absent":
                return <X className="h-4 w-4 text-red-600" />
            case "late":
                return <Clock className="h-4 w-4 text-yellow-600" />
            default:
                return null
        }
    }

    const getStatusStyle = (status: any) => {
        switch (status) {
            case "present": return "bg-green-100 text-green-800 border-green-300"
            case "absent": return "bg-red-100 text-red-800 border-red-300"
            case "late": return "bg-yellow-100 text-yellow-800 border-yellow-300"
            default: return ""
        }
    }

    // Calculate attendance statistics
    const calculateAttendanceStats = () => {
        const total = mockStudentAttendance.length
        const present = mockStudentAttendance.filter(a => a.status === "present").length
        const absent = mockStudentAttendance.filter(a => a.status === "absent").length
        const late = mockStudentAttendance.filter(a => a.status === "late").length

        const presentPercentage = (present / total) * 100
        const absentPercentage = (absent / total) * 100
        const latePercentage = (late / total) * 100

        return {
            total,
            present,
            absent,
            late,
            presentPercentage,
            absentPercentage,
            latePercentage
        }
    }

    const stats = calculateAttendanceStats()

    // Get selected day's attendance for teacher view
    const getSelectedDayAttendance = () => {
        if (!selectedDate) return null

        const formattedDate = format(selectedDate, "yyyy-MM-dd")
        return mockClassAttendance.find(a => a.date === formattedDate)
    }

    const selectedDayAttendance = useMemo(() => {
        if (!selectedDate) return null
        const formattedDate = format(selectedDate, "yyyy-MM-dd")
        return mockClassAttendance.find(a => a.date === formattedDate)
    }, [selectedDate])

    // Filter students based on search query
    const filteredStudents = useMemo(() => {
        if (!selectedDayAttendance) return []
        return selectedDayAttendance.students.filter(student =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [selectedDayAttendance, searchQuery])


    return (
        <div className="space-y-6">
            {user.role === "student" ? (
                <>
                    {/* Student Attendance View */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: "Present", value: stats.present, color: "green", percent: stats.presentPercentage },
                            { label: "Absent", value: stats.absent, color: "red", percent: stats.absentPercentage },
                            { label: "Late", value: stats.late, color: "yellow", percent: stats.latePercentage },
                        ].map(({ label, value, color, percent }) => (
                            <DyraneCard key={label}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">{label}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{value} days</div>
                                    <Progress value={percent} className={`h-2 mt-2 bg-${color}-100`} />
                                    <p className="text-xs text-muted-foreground mt-1">{percent.toFixed(1)}% of courses</p>
                                </CardContent>
                            </DyraneCard>
                        ))}
                    </div>

                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium">{format(currentMonth, "MMMM yyyy")}</h2>
                        <div className="flex gap-2">
                            <DyraneButton variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>Previous</DyraneButton>
                            <DyraneButton variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</DyraneButton>
                            <DyraneButton variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>Next</DyraneButton>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                            <div key={day} className="text-center font-medium text-sm py-2">{day}</div>
                        ))}

                        {daysInMonth.map((day, i) => {
                            const status = getAttendanceStatus(day)

                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-14 p-2 border rounded-md flex flex-col items-center justify-center text-sm cursor-pointer",
                                        isWeekend(day) ? "bg-muted/50" : "",
                                        getStatusStyle(status)
                                    )}
                                >
                                    {format(day, "d")}
                                    {status && <span className="mt-1">{getStatusIcon(status)}</span>}
                                </div>
                            )
                        })}
                    </div>

                    <Card className="w-full max-w-md mx-auto border border-muted shadow-md rounded-2xl">
                        <CardHeader className="text-center">
                            <CardTitle className="text-lg font-semibold text-foreground">
                                Student Barcode
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            <p className="text-muted-foreground text-sm">
                                Show this to scan your attendance
                            </p>
                            <BarcodeDialog userId={user.id} lineColor="gold" />
                        </CardContent>
                    </Card>
                </>
            ) : (
                <>
                    {/* Teacher Attendance View */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3">
                            <DyraneCard>
                                <CardHeader>
                                    <CardTitle>Attendance Calendar</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-medium">
                                            {format(currentMonth, "MMMM yyyy")}
                                        </h3>
                                        <div className="flex gap-1">
                                            <DyraneButton variant="ghost" size="icon" onClick={goToPreviousMonth}>
                                                <ChevronLeft className="h-4 w-4" />
                                            </DyraneButton>
                                            <DyraneButton variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date())}>
                                                <CalendarIcon className="h-4 w-4" />
                                            </DyraneButton>
                                            <DyraneButton variant="ghost" size="icon" onClick={goToNextMonth}>
                                                <ChevronRight className="h-4 w-4" />
                                            </DyraneButton>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-7 gap-1 text-center">
                                        {["M", "T", "W", "T", "F", "S", "S"].map((day) => (
                                            <div key={day} className="text-xs font-medium py-1">
                                                {day}
                                            </div>
                                        ))}

                                        {daysInMonth.map((day, i) => {
                                            const isSelected = selectedDate && isSameDay(day, selectedDate)
                                            const hasAttendance = mockClassAttendance.some(a => a.date === format(day, "yyyy-MM-dd"))

                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        const hasAttendance = mockClassAttendance.some(a => a.date === format(day, "yyyy-MM-dd"))
                                                        if (hasAttendance) {
                                                            setSelectedDate(day)
                                                            setShowModal(true)
                                                        }
                                                    }}

                                                    className={cn(
                                                        "h-8 w-8 rounded-full text-xs flex items-center justify-center transition-colors cursor-pointer",
                                                        isSelected && "bg-primary text-white",
                                                        hasAttendance && !isSelected && "bg-primary/10 text-primary",
                                                        !hasAttendance && "text-muted-foreground hover:bg-accent"
                                                    )}
                                                >
                                                    {format(day, "d")}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </DyraneCard>
                        </div>
                    </div>
                </>
            )}

            {showModal && selectedDayAttendance && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-4"
                >
                    <DyraneCard className="shadow-lg border border-muted bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Attendance for {format(new Date(selectedDayAttendance.date), "PPP")}
                            </CardTitle>
                            <Input
                                placeholder="Search student..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="mt-2"
                            />
                        </CardHeader>
                        <CardContent className="max-h-[300px] overflow-y-auto space-y-2">
                            {filteredStudents.map((student) => (
                                <div key={student.id} className="flex items-center justify-between">
                                    <span>{student.name}</span>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "capitalize",
                                            student.status === "present" && "bg-green-100 text-green-700",
                                            student.status === "late" && "bg-yellow-100 text-yellow-700",
                                            student.status === "absent" && "bg-red-100 text-red-700"
                                        )}
                                    >
                                        {student.status}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </DyraneCard>
                </motion.div>
            )}

        </div>
    )
}


