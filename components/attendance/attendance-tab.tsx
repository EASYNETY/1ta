// components/attendance/attendance-tab.tsx

"use client";

import { useMemo, useState, useEffect } from "react"; // Added useEffect
import { motion } from "framer-motion";
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card";
import { CardHeader, CardTitle, CardContent, Card } from "@/components/ui/card";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
// Import hooks and selectors from Redux
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
    selectStudentAttendanceRecords,
    selectCourseDailyAttendances,
    selectCourseAttendanceForDate,
    // If you add fetching thunks: import { fetchStudentAttendance, fetchCourseAttendance } from "@/features/attendance/store/attendance-slice";
} from "@/features/attendance/store/attendance-slice";
import { CalendarIcon, Check, X, AlertCircle, Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWeekend, addMonths, subMonths, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BarcodeDialog } from "@/components/tools/BarcodeDialog";
// Removed unused Tabs imports for now
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { StudentAttendanceRecord } from "@/data/mock-attendance-data"; // Import type if needed


export function Attendance() {
    const dispatch = useAppDispatch(); // If needed for fetching
    const { user } = useAppSelector((state) => state.auth);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Keep selected date as Date object
    const [showModal, setShowModal] = useState(false);

    // --- TODO: Determine Course Class ID ---
    // This should ideally come from props, context, or route
    const courseClassIdForTeacher = "webDevBootcamp"; // Hardcoded based on mock data

    // --- Fetch Data (Example - uncomment if you implement fetching thunks) ---
    // useEffect(() => {
    //     if (user?.role === 'student' && user.id) {
    //         // dispatch(fetchStudentAttendance(user.id));
    //     } else if (user?.role === 'teacher' && courseClassIdForTeacher) {
    //         // dispatch(fetchCourseAttendance(courseClassIdForTeacher));
    //     }
    // }, [dispatch, user, courseClassIdForTeacher]);

    // --- Get Data from Slice ---
    const studentRecords = useAppSelector(state =>
        user?.id ? selectStudentAttendanceRecords(state, user.id) : []
    );

    const courseDailyAttendances = useAppSelector(state =>
        selectCourseDailyAttendances(state, courseClassIdForTeacher)
    );

    // --- Component Logic ---
    if (!user) return null;

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });

    const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const goToToday = () => {
        setCurrentMonth(new Date());
        setSelectedDate(new Date()); // Optionally reset selected date too
    }


    // --- Student View Logic ---

    // Get attendance status for a specific date for the student
    const getStudentAttendanceStatusForDate = (date: Date): StudentAttendanceRecord['status'] | null => {
        const formattedDate = format(date, "yyyy-MM-dd");
        // Search in the records fetched from the slice
        const attendance = studentRecords.find(a => a.date === formattedDate);
        return attendance?.status || null;
    };

    // Calculate student attendance statistics using data from the slice
    const studentAttendanceStats = useMemo(() => {
        const total = studentRecords.length;
        if (total === 0) {
            return { total: 0, present: 0, absent: 0, late: 0, presentPercentage: 0, absentPercentage: 0, latePercentage: 0 };
        }
        const present = studentRecords.filter(a => a.status === "present").length;
        const absent = studentRecords.filter(a => a.status === "absent").length;
        const late = studentRecords.filter(a => a.status === "late").length;

        // Prevent division by zero
        const presentPercentage = total > 0 ? (present / total) * 100 : 0;
        const absentPercentage = total > 0 ? (absent / total) * 100 : 0;
        const latePercentage = total > 0 ? (late / total) * 100 : 0;

        return { total, present, absent, late, presentPercentage, absentPercentage, latePercentage };
    }, [studentRecords]); // Recalculate when studentRecords change


    // --- Shared Helper Functions (Status Styling) ---
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


    // --- Teacher View Logic ---

    // Get the specific day's attendance details using data from the slice
    const selectedDayAttendanceDetails = useMemo(() => {
        if (!selectedDate || !courseDailyAttendances) return null;
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        // Find the record for the selected date in the slice data
        return courseDailyAttendances.find(a => a.date === formattedDate) || null;
    }, [selectedDate, courseDailyAttendances]); // Recalculate when date or data changes

    // Filter students for the modal based on search query and selected day's data
    const filteredStudentsForModal = useMemo(() => {
        if (!selectedDayAttendanceDetails) return [];
        // Access the students array from the selected day's record
        const studentsOnSelectedDay = selectedDayAttendanceDetails.attendances || [];
        if (!searchQuery) return studentsOnSelectedDay; // Return all if no query
        return studentsOnSelectedDay.filter(student =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [selectedDayAttendanceDetails, searchQuery]); // Recalculate on selection or query change


    // --- Render Logic ---
    return (
        <div className="space-y-6">
            {user.role === "student" ? (
                <>
                    {/* Student Attendance View - Uses studentAttendanceStats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: "Present", value: studentAttendanceStats.present, color: "green", percent: studentAttendanceStats.presentPercentage },
                            { label: "Absent", value: studentAttendanceStats.absent, color: "red", percent: studentAttendanceStats.absentPercentage },
                            { label: "Late", value: studentAttendanceStats.late, color: "yellow", percent: studentAttendanceStats.latePercentage },
                        ].map(({ label, value, color, percent }) => (
                            <DyraneCard key={label}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">{label}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{value} days</div>
                                    {/* Ensure Progress receives a number */}
                                    <Progress value={percent ?? 0} className={`h-2 mt-2 bg-${color}-100`} />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {/* Handle potential NaN */}
                                        {(percent ?? 0).toFixed(1)}% of recorded days
                                    </p>
                                </CardContent>
                            </DyraneCard>
                        ))}
                    </div>

                    {/* Student Calendar Controls */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium">{format(currentMonth, "MMMM yyyy")}</h2>
                        <div className="flex gap-2">
                            <DyraneButton variant="outline" size="sm" onClick={goToPreviousMonth}>Previous</DyraneButton>
                            <DyraneButton variant="outline" size="sm" onClick={goToToday}>Today</DyraneButton>
                            <DyraneButton variant="outline" size="sm" onClick={goToNextMonth}>Next</DyraneButton>
                        </div>
                    </div>

                    {/* Student Calendar Grid - Uses getStudentAttendanceStatusForDate */}
                    <div className="grid grid-cols-7 gap-2">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                            <div key={day} className="text-center font-medium text-sm py-2">{day}</div>
                        ))}

                        {daysInMonth.map((day, i) => {
                            // Get status for this day from slice data
                            const status = getStudentAttendanceStatusForDate(day);
                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-14 p-2 border rounded-md flex flex-col items-center justify-center text-sm",
                                        isWeekend(day) ? "bg-muted/50" : "",
                                        // Apply status style if status exists
                                        status ? getStatusStyle(status) : "bg-gray-100 text-gray-800 border-gray-300" // Default style
                                    )}
                                >
                                    {format(day, "d")}
                                    {/* Render icon if status exists */}
                                    {status && <span className="mt-1">{getStatusIcon(status)}</span>}
                                </div>
                            );
                        })}
                    </div>

                    {/* Student Barcode */}
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
                            {/* Ensure user.id is passed */}
                            {user.id && <BarcodeDialog userId={user.id} lineColor="gold" />}
                        </CardContent>
                    </Card>
                </>
            ) : (
                <>
                    {/* Teacher Attendance View */}
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Teacher Calendar Card */}
                        <div className="w-full md:w-1/3"> {/* Adjust width as needed */}
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
                                            <DyraneButton variant="ghost" size="icon" onClick={goToPreviousMonth}><ChevronLeft className="h-4 w-4" /></DyraneButton>
                                            <DyraneButton variant="ghost" size="icon" onClick={goToToday}><CalendarIcon className="h-4 w-4" /></DyraneButton>
                                            <DyraneButton variant="ghost" size="icon" onClick={goToNextMonth}><ChevronRight className="h-4 w-4" /></DyraneButton>
                                        </div>
                                    </div>

                                    {/* Teacher Calendar Grid - Checks against courseDailyAttendances */}
                                    <div className="grid grid-cols-7 gap-1 text-center">
                                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                            <div key={day} className="text-xs font-medium py-1">{day}</div>
                                        ))}

                                        {daysInMonth.map((day, i) => {
                                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                                            const formattedDayString = format(day, "yyyy-MM-dd");
                                            // Check if attendance data exists for this day in the slice data
                                            const hasAttendance = courseDailyAttendances.some(a => a.date === formattedDayString);

                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        // Only allow selection if attendance exists for the day
                                                        if (hasAttendance) {
                                                            setSelectedDate(day); // Set the selected date (Date object)
                                                            setShowModal(true); // Show the modal
                                                        } else {
                                                            setSelectedDate(null); // Deselect if no data
                                                            setShowModal(false); // Hide modal
                                                        }
                                                    }}
                                                    disabled={isWeekend(day)} // Optionally disable weekends
                                                    className={cn(
                                                        "h-8 w-8 rounded-full text-xs flex items-center justify-center transition-colors",
                                                        isWeekend(day) ? "text-muted-foreground cursor-not-allowed" : "cursor-pointer",
                                                        isSelected && hasAttendance && "bg-primary text-primary-foreground font-semibold", // Selected style
                                                        hasAttendance && !isSelected && !isWeekend(day) && "bg-primary/10 text-primary hover:bg-primary/20", // Has data style
                                                        !hasAttendance && !isWeekend(day) && "text-muted-foreground hover:bg-accent" // No data style
                                                    )}
                                                >
                                                    {format(day, "d")}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </DyraneCard>
                        </div>

                        {/* Attendance Details Modal Area */}
                        {/* Wrap modal display logic */}
                        <div className="w-full md:w-2/3"> {/* Adjust width as needed */}
                            {showModal && selectedDayAttendanceDetails && (
                                <motion.div
                                    key={selectedDayAttendanceDetails.date} // Add key for animation reset on date change
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="mt-0 md:mt-0" // Adjust margin as needed
                                >
                                    <DyraneCard className="shadow-lg border border-muted bg-card">
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <CardTitle className="text-lg">
                                                    {/* Use parseISO to handle YYYY-MM-DD */}
                                                    Attendance for {format(parseISO(selectedDayAttendanceDetails.date), "PPP")}
                                                </CardTitle>
                                                <DyraneButton variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                                                    <X className="h-5 w-5" />
                                                </DyraneButton>
                                            </div>

                                            <div className="relative mt-2">
                                                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search students..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-8" // Add padding for icon
                                                />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="max-h-[400px] overflow-y-auto space-y-3 pr-3">
                                            {/* Use filteredStudentsForModal */}
                                            {filteredStudentsForModal.length > 0 ? (
                                                filteredStudentsForModal.map((student) => (
                                                    <div key={student.studentId} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                                                        <span className="text-sm">{student.name}</span>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "capitalize text-xs px-2 py-0.5", // Adjusted padding
                                                                student.status === "present" && "border-green-400 bg-green-100 text-green-800",
                                                                student.status === "late" && "border-yellow-400 bg-yellow-100 text-yellow-800",
                                                                student.status === "absent" && "border-red-400 bg-red-100 text-red-800"
                                                            )}
                                                        >
                                                            {student.status}
                                                        </Badge>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground text-center py-4">
                                                    {searchQuery ? "No students found matching your search." : "No attendance data found for this day."}
                                                </p>
                                            )}
                                        </CardContent>
                                    </DyraneCard>
                                </motion.div>
                            )}
                            {/* Show placeholder if no date is selected or no data */}
                            {!showModal && (
                                <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground text-center p-6 bg-muted/30 rounded-lg border border-dashed">
                                    <p>Select a date from the calendar with attendance data to view details.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}