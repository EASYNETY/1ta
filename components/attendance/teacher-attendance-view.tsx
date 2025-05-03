"use client"

import { useState, useMemo, useEffect } from "react"
import { useAppSelector } from "@/store/hooks"
import {
    format,
    parseISO,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isWeekend,
    addMonths,
    subMonths,
    isToday,
    compareDesc,
} from "date-fns"
import { Calendar, ChevronLeft, ChevronRight, Search, X, Check, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { selectCourseDailyAttendances } from "@/features/attendance/store/attendance-slice"
import type { DailyAttendance, AttendanceStatus } from "@/data/mock-attendance-data"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function TeacherAttendanceView() {
    const { user } = useAppSelector((state) => state.auth)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [showDetailsPanel, setShowDetailsPanel] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    // Hardcoded course ID for demo purposes
    const courseClassId = "webDevBootcamp"

    // Get attendance data for the course
    const courseDailyAttendances = useAppSelector((state) => selectCourseDailyAttendances(state, courseClassId))

    // Get days in the current month
    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    })

    // Navigation functions
    const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
    const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
    const goToToday = () => {
        const today = new Date()
        setCurrentMonth(today)

        const formattedToday = format(today, "yyyy-MM-dd")
        const todayHasData = courseDailyAttendances.some((a) => a.date === formattedToday)

        if (todayHasData) {
            setSelectedDate(today)
            setShowDetailsPanel(true)
        } else {
            selectMostRecentDateWithData()
        }
    }

    // Select the most recent date with attendance data
    const selectMostRecentDateWithData = () => {
        const sortedDates = [...courseDailyAttendances].map((att) => parseISO(att.date)).sort(compareDesc)

        if (sortedDates.length > 0) {
            setSelectedDate(sortedDates[0])
            setShowDetailsPanel(true)
        } else {
            setSelectedDate(null)
            setShowDetailsPanel(false)
        }
    }

    // Initialize with most recent data
    useEffect(() => {
        if (courseDailyAttendances.length > 0 && !selectedDate) {
            const today = new Date()
            const formattedToday = format(today, "yyyy-MM-dd")
            const todayHasData = courseDailyAttendances.some((a) => a.date === formattedToday)

            if (todayHasData) {
                setSelectedDate(today)
                setShowDetailsPanel(true)
            } else {
                selectMostRecentDateWithData()
            }
        }
    }, [courseDailyAttendances])

    // Get attendance details for the selected date
    const selectedDayAttendanceDetails: DailyAttendance | null = useMemo(() => {
        if (!selectedDate || !courseDailyAttendances) return null
        const formattedDate = format(selectedDate, "yyyy-MM-dd")
        return courseDailyAttendances.find((a) => a.date === formattedDate) || null
    }, [selectedDate, courseDailyAttendances])

    // Filter students based on search query
    const filteredStudents = useMemo(() => {
        if (!selectedDayAttendanceDetails) return []
        const studentsOnSelectedDay = selectedDayAttendanceDetails.attendances || []
        if (!searchQuery) return studentsOnSelectedDay
        return studentsOnSelectedDay.filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }, [selectedDayAttendanceDetails, searchQuery])

    // Helper function to get status classes
    const getStatusClasses = (status: AttendanceStatus): string => {
        switch (status) {
            case "present":
                return "bg-green-50 text-green-700 border-green-200"
            case "absent":
                return "bg-red-50 text-red-700 border-red-200"
            case "late":
                return "bg-amber-50 text-amber-700 border-amber-200"
            default:
                return "bg-muted/50 text-muted-foreground border-border"
        }
    }

    // Helper function to get status icon
    const getStatusIcon = (status: AttendanceStatus) => {
        switch (status) {
            case "present":
                return <Check className="h-4 w-4 text-green-600" />
            case "absent":
                return <X className="h-4 w-4 text-red-600" />
            case "late":
                return <Clock className="h-4 w-4 text-amber-600" />
            default:
                return null
        }
    }

    // Calculate attendance statistics for the selected day
    const attendanceStats = useMemo(() => {
        if (!selectedDayAttendanceDetails) return { present: 0, absent: 0, late: 0, total: 0 }

        const attendances = selectedDayAttendanceDetails.attendances
        const present = attendances.filter((a) => a.status === "present").length
        const absent = attendances.filter((a) => a.status === "absent").length
        const late = attendances.filter((a) => a.status === "late").length
        const total = attendances.length

        return { present, absent, late, total }
    }, [selectedDayAttendanceDetails])

    if (!user) return null

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Calendar Card */}
            <div className="md:col-span-1">
                <Card className="shadow-sm" >
                    <CardHeader>
                        <div className="flex items-center justify-between gap-2">
                            <CardTitle className="text-base font-semibold">Select Date</CardTitle>
                            <div className="flex items-center gap-1">
                                <h3 className="text-sm font-medium">{format(currentMonth, "MMMM yyyy")}</h3>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goToPreviousMonth}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goToToday}>
                                    <Calendar className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goToNextMonth}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                <div key={day} className="text-xs font-semibold text-muted-foreground">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {daysInMonth.map((day, i) => {
                                const isSelected = selectedDate && isSameDay(day, selectedDate)
                                const formattedDayString = format(day, "yyyy-MM-dd")
                                const hasAttendance = courseDailyAttendances.some((a) => a.date === formattedDayString)
                                const isDayToday = isToday(day)

                                return (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            if (hasAttendance) {
                                                setSelectedDate(day)
                                                setShowDetailsPanel(true)
                                                setSearchQuery("")
                                            }
                                        }}
                                        disabled={isWeekend(day) || !hasAttendance}
                                        className={cn(
                                            "h-8 w-8 rounded-md text-xs flex items-center justify-center transition-all duration-150 relative",
                                            "border border-transparent cursor-pointer",
                                            isWeekend(day) ? "text-muted-foreground/60 cursor-not-allowed bg-muted/30" : "",
                                            isDayToday && !isSelected && "bg-accent",
                                            hasAttendance &&
                                            !isWeekend(day) &&
                                            "text-foreground hover:bg-accent focus-visible:bg-accent focus-visible:ring-1 focus-visible:ring-ring cursor-pointer",
                                            isSelected &&
                                            hasAttendance &&
                                            "bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90",
                                            !hasAttendance && !isWeekend(day) && "text-muted-foreground cursor-default",
                                            hasAttendance &&
                                            !isWeekend(day) &&
                                            !isSelected &&
                                            "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary/80",
                                        )}
                                        aria-label={`Select date ${format(day, "PPP")}${hasAttendance ? "" : " (No data)"}`}
                                    >
                                        {format(day, "d")}
                                    </button>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Attendance Details Panel */}
            <div className="md:col-span-2">
                <motion.div
                    key={selectedDate ? format(selectedDate, "yyyy-MM-dd") : "empty"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                >
                    {selectedDayAttendanceDetails && showDetailsPanel ? (
                        <Card className="shadow-sm h-full">
                            <CardHeader>
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <CardTitle className="text-lg mb-1">Attendance for {format(selectedDate!, "PPP")}</CardTitle>
                                        <div className="flex gap-2 text-sm text-muted-foreground">
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                {attendanceStats.present} Present
                                            </Badge>
                                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                {attendanceStats.absent} Absent
                                            </Badge>
                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                                {attendanceStats.late} Late
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 flex-shrink-0"
                                        onClick={() => setShowDetailsPanel(false)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="relative pt-2">
                                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search students..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 h-9"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="max-h-[calc(100vh-250px)] overflow-y-auto space-y-1 pr-3 pt-0">
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => (
                                        <div
                                            key={student.studentId}
                                            className="flex items-center justify-between p-2 -mx-2 rounded hover:bg-accent transition-colors"
                                        >
                                            <span className="text-sm font-medium">{student.name}</span>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "capitalize text-xs px-2 py-0.5 font-semibold border",
                                                    getStatusClasses(student.status),
                                                )}
                                            >
                                                <span className="flex items-center gap-1">
                                                    {getStatusIcon(student.status)}
                                                    {student.status}
                                                </span>
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        {searchQuery ? "No students found matching search." : "No attendance records found for this day."}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6 bg-muted/30 rounded-lg border-2 border-dashed border-border">
                            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-1">Select a Date</h3>
                            <p className="text-sm text-muted-foreground max-w-xs">
                                Choose a date from the calendar with recorded attendance (indicated by a dot) to view the student list.
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
