// components/attendance/attendance-tab.tsx

"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card";
import { CardHeader, CardTitle, CardContent, Card } from "@/components/ui/card";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
    selectStudentAttendanceRecords,
    selectCourseDailyAttendances,
    // selectCourseAttendanceForDate, // We get this from courseDailyAttendances now
} from "@/features/attendance/store/attendance-slice";
import { CalendarIcon, Check, X, Clock, Search, ChevronLeft, ChevronRight, Info } from 'lucide-react'; // Added Info icon
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWeekend, addMonths, subMonths, parseISO, isToday, compareDesc } from "date-fns"; // Added isToday, compareDesc
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BarcodeDialog } from "@/components/tools/BarcodeDialog";
import { Progress } from "@/components/ui/progress";
import { StudentAttendanceRecord, DailyAttendance, AttendanceStatus } from "@/data/mock-attendance-data"; // Import DailyAttendance


export function Attendance() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState("");
    // Start with null, will be set by useEffect for teacher
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    // Controls the visibility of the details panel/modal area
    const [showDetailsPanel, setShowDetailsPanel] = useState(false);

    const courseClassIdForTeacher = "webDevBootcamp"; // Hardcoded

    // --- Get Data from Slice ---
    // --- Get Data from Slice ---
    // CORRECTED LOGIC: Only fetch student records if the user's role IS 'student'
    const studentRecords = useAppSelector(state =>
        user?.role === 'student' && user?.id != null
            ? selectStudentAttendanceRecords(state, String(user.id))
            : [] // Return empty array for non-students or if ID is missing
    );

    // This selector remains correct - it's intended for the teacher/admin view
    const courseDailyAttendances = useAppSelector(state =>
        // We fetch this regardless of role, but only *use* it in the non-student view
        selectCourseDailyAttendances(state, courseClassIdForTeacher)
    );

    // --- Component Logic ---
    if (!user) return null; // Or a loading state

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });

    const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(today);
        // For teacher, also try to select today's data if available
        if (user.role !== 'student') {
            const formattedToday = format(today, "yyyy-MM-dd");
            const todayHasData = courseDailyAttendances.some(a => a.date === formattedToday);
            if (todayHasData) {
                setSelectedDate(today);
                setShowDetailsPanel(true);
            } else {
                // If today has no data, maybe select the most recent day?
                selectMostRecentDateWithData();
            }
        }
    };

    // --- Teacher: Select most recent day with data ---
    const selectMostRecentDateWithData = () => {
        const sortedDates = [...courseDailyAttendances]
            .map(att => parseISO(att.date))
            .sort(compareDesc); // Sort descending (most recent first)

        if (sortedDates.length > 0) {
            setSelectedDate(sortedDates[0]);
            setShowDetailsPanel(true);
        } else {
            setSelectedDate(null);
            setShowDetailsPanel(false);
        }
    };


    // --- Teacher: Initial Load Logic ---
    useEffect(() => {
        if (user?.role !== 'student' && courseDailyAttendances.length > 0 && !selectedDate) {
            // On initial load for teacher, select today if it has data, otherwise the most recent day
            const today = new Date();
            const formattedToday = format(today, "yyyy-MM-dd");
            const todayHasData = courseDailyAttendances.some(a => a.date === formattedToday);

            if (todayHasData) {
                setSelectedDate(today);
                setShowDetailsPanel(true);
            } else {
                selectMostRecentDateWithData();
            }
        }
        // Only run once on mount or when role/data changes significantly
    }, [user?.role, courseDailyAttendances]);


    // --- Student View Logic ---
    const getStudentAttendanceStatusForDate = (date: Date): StudentAttendanceRecord['status'] | null => {
        const formattedDate = format(date, "yyyy-MM-dd");
        const attendance = studentRecords.find(a => a.date === formattedDate);
        return attendance?.status || null;
    };

    const studentAttendanceStats = useMemo(() => {
        // ... (calculation logic remains the same)
        const total = studentRecords.length;
        if (total === 0) return { total: 0, present: 0, absent: 0, late: 0, presentPercentage: 0, absentPercentage: 0, latePercentage: 0 };
        const present = studentRecords.filter(a => a.status === "present").length;
        const absent = studentRecords.filter(a => a.status === "absent").length;
        const late = studentRecords.filter(a => a.status === "late").length;
        const presentPercentage = total > 0 ? (present / total) * 100 : 0;
        const absentPercentage = total > 0 ? (absent / total) * 100 : 0;
        const latePercentage = total > 0 ? (late / total) * 100 : 0;
        return { total, present, absent, late, presentPercentage, absentPercentage, latePercentage };
    }, [studentRecords]);


    // --- Shared Helper Function (Status Icon) ---
    const getStatusIcon = (status: AttendanceStatus | null) => {
        switch (status) {
            case "present": return <Check className="h-4 w-4 text-[var(--attendance-present-fg)]" />;
            case "absent": return <X className="h-4 w-4 text-[var(--attendance-absent-fg)]" />;
            case "late": return <Clock className="h-4 w-4 text-[var(--attendance-late-fg)]" />;
            default: return null;
        }
    };

    // --- Shared Helper Function (Status Classes for Badges/Backgrounds) ---
    const getStatusClasses = (status: AttendanceStatus | null): string => {
        switch (status) {
            case "present": return "bg-[var(--attendance-present-bg)] text-[var(--attendance-present-fg)] border-[var(--attendance-present-border)]";
            case "absent": return "bg-[var(--attendance-absent-bg)] text-[var(--attendance-absent-fg)] border-[var(--attendance-absent-border)]";
            case "late": return "bg-[var(--attendance-late-bg)] text-[var(--attendance-late-fg)] border-[var(--attendance-late-border)]";
            default: return "bg-muted/50 text-muted-foreground border-border"; // Default subtle style
        }
    };


    // --- Teacher View Logic ---
    const selectedDayAttendanceDetails: DailyAttendance | null = useMemo(() => {
        if (!selectedDate || !courseDailyAttendances) return null;
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        return courseDailyAttendances.find(a => a.date === formattedDate) || null;
    }, [selectedDate, courseDailyAttendances]);

    const filteredStudentsForModal = useMemo(() => {
        if (!selectedDayAttendanceDetails) return [];
        const studentsOnSelectedDay = selectedDayAttendanceDetails.attendances || [];
        if (!searchQuery) return studentsOnSelectedDay;
        return studentsOnSelectedDay.filter(student =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [selectedDayAttendanceDetails, searchQuery]);


    // --- RENDER ---
    return (
        <div className="space-y-6 md:space-y-8">
            {user.role === "student" ? (
                <>
                    {/* Student: Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: "Present", value: studentAttendanceStats.present, colorVar: "--chart-1", percent: studentAttendanceStats.presentPercentage },
                            { label: "Absent", value: studentAttendanceStats.absent, colorVar: "--chart-4", percent: studentAttendanceStats.absentPercentage }, // Use different chart colors
                            { label: "Late", value: studentAttendanceStats.late, colorVar: "--chart-2", percent: studentAttendanceStats.latePercentage },
                        ].map(({ label, value, colorVar, percent }) => (
                            <DyraneCard key={label} className="shadow-sm">
                                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm font-medium">{label}</CardTitle>
                                    {/* Optional: Add subtle icon */}
                                    {label === 'Present' && <Check className="h-4 w-4 text-muted-foreground" />}
                                    {label === 'Absent' && <X className="h-4 w-4 text-muted-foreground" />}
                                    {label === 'Late' && <Clock className="h-4 w-4 text-muted-foreground" />}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{value} days</div>
                                    <p className="text-xs text-muted-foreground mt-1 mb-2">
                                        {(percent ?? 0).toFixed(1)}% of recorded days
                                    </p>
                                    <Progress
                                        value={percent ?? 0}
                                        className="h-2"
                                    />
                                </CardContent>
                            </DyraneCard>
                        ))}
                    </div>

                    {/* Student: Calendar */}
                    <DyraneCard>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                                <CardTitle className="text-lg font-semibold">Attendance Calendar</CardTitle>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-medium text-center sm:text-right">
                                        {format(currentMonth, "MMMM yyyy")}
                                    </h2>
                                    <div className="flex gap-1">
                                        <DyraneButton variant="outline" size="icon" className="h-8 w-8" onClick={goToPreviousMonth}><ChevronLeft className="h-4 w-4" /></DyraneButton>
                                        <DyraneButton variant="outline" size="icon" className="h-8 w-8" onClick={goToToday}><CalendarIcon className="h-4 w-4" /></DyraneButton>
                                        <DyraneButton variant="outline" size="icon" className="h-8 w-8" onClick={goToNextMonth}><ChevronRight className="h-4 w-4" /></DyraneButton>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                    <div key={day} className="text-xs font-semibold text-muted-foreground">{day}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {daysInMonth.map((day, i) => {
                                    const status = getStudentAttendanceStatusForDate(day);
                                    const isDayToday = isToday(day);

                                    return (
                                        <div
                                            key={i}
                                            className={cn(
                                                "aspect-square p-2 border rounded-md flex flex-col items-center justify-center text-sm relative transition-colors",
                                                // Base styles
                                                isWeekend(day) ? "bg-muted/30 text-muted-foreground" : "bg-background",
                                                // Status override
                                                status ? getStatusClasses(status) : "",
                                                // Today indicator
                                                isDayToday && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                            )}
                                            title={status ? `Status: ${status}` : undefined} // Tooltip for status
                                        >
                                            <span className={cn(
                                                "font-medium",
                                                status ? "font-semibold" : "" // Make date bolder if status exists
                                            )}>
                                                {format(day, "d")}
                                            </span>
                                            {status && (
                                                <span className="mt-1 absolute bottom-1 right-1">
                                                    {getStatusIcon(status)}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </DyraneCard>

                    {/* Student: Barcode */}
                    <DyraneCard className="w-full max-w-md mx-auto shadow-sm">
                        <CardHeader className="text-center">
                            <CardTitle className="text-lg font-semibold text-foreground">
                                Student Barcode
                            </CardTitle>
                            <p className="text-muted-foreground text-sm pt-1">
                                Show this barcode to the administrator to scan your attendance.
                            </p>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4 pb-6">
                            {user.id && <BarcodeDialog userId={String(user.id)} lineColor="var(--primary)" />}
                        </CardContent>
                    </DyraneCard>
                </>
            ) : (
                <>
                    {/* Teacher: Main Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Teacher: Calendar Card (Left Column) */}
                        <div className="md:col-span-1">
                            <DyraneCard className="shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center justify-between gap-2">
                                        <CardTitle className="text-base font-semibold">Select Date</CardTitle>
                                        <div className="flex items-center gap-1">
                                            <h3 className="text-sm font-medium">
                                                {format(currentMonth, "MMMM yyyy")}
                                            </h3>
                                            <DyraneButton variant="ghost" size="icon" className="h-7 w-7" onClick={goToPreviousMonth}><ChevronLeft className="h-4 w-4" /></DyraneButton>
                                            <DyraneButton variant="ghost" size="icon" className="h-7 w-7" onClick={goToToday}><CalendarIcon className="h-4 w-4" /></DyraneButton>
                                            <DyraneButton variant="ghost" size="icon" className="h-7 w-7" onClick={goToNextMonth}><ChevronRight className="h-4 w-4" /></DyraneButton>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                            <div key={day} className="text-xs font-semibold text-muted-foreground">{day}</div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-1">
                                        {daysInMonth.map((day, i) => {
                                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                                            const formattedDayString = format(day, "yyyy-MM-dd");
                                            const hasAttendance = courseDailyAttendances.some(a => a.date === formattedDayString);
                                            const isDayToday = isToday(day);

                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        if (hasAttendance) {
                                                            setSelectedDate(day);
                                                            setShowDetailsPanel(true);
                                                            setSearchQuery(""); // Reset search on new date select
                                                        } else {
                                                            // Optionally provide feedback for non-clickable days
                                                        }
                                                    }}
                                                    disabled={isWeekend(day) || !hasAttendance}
                                                    className={cn(
                                                        "h-8 w-8 rounded-md text-xs flex items-center justify-center transition-all duration-150 relative",
                                                        // Base styles
                                                        "border border-transparent", // Base border
                                                        isWeekend(day) ? "text-muted-foreground/60 cursor-not-allowed bg-muted/30" : "",
                                                        // Today indicator (subtle)
                                                        isDayToday && !isSelected && "bg-accent",
                                                        // Has Attendance indicator & interaction
                                                        hasAttendance && !isWeekend(day) && "text-foreground hover:bg-accent focus-visible:bg-accent focus-visible:ring-1 focus-visible:ring-ring cursor-pointer",
                                                        // Selected state
                                                        isSelected && hasAttendance && "bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90",
                                                        // No Attendance
                                                        !hasAttendance && !isWeekend(day) && "text-muted-foreground cursor-default",
                                                        // Dot indicator for attendance
                                                        hasAttendance && !isWeekend(day) && !isSelected && "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary/80"
                                                    )}
                                                    aria-label={`Select date ${format(day, "PPP")}${hasAttendance ? '' : ' (No data)'}`}
                                                >
                                                    {format(day, "d")}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </DyraneCard>
                        </div>

                        {/* Teacher: Attendance Details Panel (Right Column) */}
                        <div className="md:col-span-2">
                            {/* Use Framer Motion for appearance */}
                            <motion.div
                                key={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'empty'} // Animate when date changes or becomes empty
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {selectedDayAttendanceDetails && showDetailsPanel ? (
                                    <DyraneCard className="shadow-sm h-full"> {/* Ensure card takes height */}
                                        <CardHeader>
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    <CardTitle className="text-lg mb-1">
                                                        Attendance for {format(selectedDate!, "PPP")}
                                                    </CardTitle>
                                                    {/* You could add stats here too: */}
                                                    {/* <p className="text-sm text-muted-foreground">
                                                        {selectedDayAttendanceDetails.attendances.filter(s => s.status === 'present').length} Present,{' '}
                                                        {selectedDayAttendanceDetails.attendances.filter(s => s.status === 'absent').length} Absent,{' '}
                                                        {selectedDayAttendanceDetails.attendances.filter(s => s.status === 'late').length} Late
                                                    </p> */}
                                                </div>
                                                <DyraneButton variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => setShowDetailsPanel(false)}>
                                                    <X className="h-4 w-4" />
                                                </DyraneButton>
                                            </div>
                                            <div className="relative pt-2">
                                                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search students..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-8 h-9" // Consistent height
                                                />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="max-h-[calc(100vh-250px)] overflow-y-auto space-y-1 pr-3 pt-0"> {/* Adjust max-h as needed */}
                                            {filteredStudentsForModal.length > 0 ? (
                                                filteredStudentsForModal.map((student) => (
                                                    <div
                                                        key={student.studentId}
                                                        className="flex items-center justify-between p-2 -mx-2 rounded hover:bg-accent transition-colors" // Use accent for hover
                                                    >
                                                        <span className="text-sm font-medium">{student.name}</span>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "capitalize text-xs px-2 py-0.5 font-semibold border",
                                                                getStatusClasses(student.status) // Use helper for classes
                                                            )}
                                                        >
                                                            {student.status}
                                                        </Badge>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground text-center py-8">
                                                    {searchQuery ? "No students found matching search." : "No attendance records found for this day."}
                                                </p>
                                            )}
                                        </CardContent>
                                    </DyraneCard>
                                ) : (
                                    /* Placeholder when no date is selected or details panel is hidden */
                                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6 bg-muted/30 rounded-lg border-2 border-dashed border-border">
                                        <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold mb-1">Select a Date</h3>
                                        <p className="text-sm text-muted-foreground max-w-xs">
                                            Choose a date from the calendar with recorded attendance (indicated by a dot) to view the student list.
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}