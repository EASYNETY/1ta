// app/(authenticated)/attendance/teacher/page.tsx OR wherever TeacherAttendanceView is used
"use client";

import * as React from "react"; // Import React
import { useState, useMemo, useEffect, useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import {
    format,
    parseISO,
    startOfMonth,
    endOfMonth,
    isSameDay,
    isWeekend,
    addMonths,
    subMonths,
    isToday,
    compareDesc,
    setMonth,
    setYear,
} from "date-fns";
import { Calendar as CalendarIcon, Search, X, Check, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { selectCourseDailyAttendances } from "@/features/attendance/store/attendance-slice";
import type { DailyAttendance, AttendanceStatus } from "@/data/mock-attendance-data"; // Ensure AttendanceRecord is imported if used
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useMediaQuery } from "@/hooks/use-media-query"; // Assuming hook exists
import { DayClickEventHandler, DayPickerSingleProps, Modifiers } from "react-day-picker"; // Import specific types

// --- In-file Type Definitions ---
type AttendanceStatusIndicator = "present" | "absent" | "late" | "holiday" | string;
type AttendanceDataForPicker = Record<string, AttendanceStatusIndicator>;

// Define CalendarProps based on react-day-picker types used
export interface CalendarProps extends Omit<DayPickerSingleProps, 'modifiers' | 'classNames' | 'styles'> {
    modifiers?: Modifiers; // Use Modifiers type from react-day-picker
    modifiersClassNames?: Record<string, string>; // Matching structure for class names
    classNames?: DayPickerSingleProps['classNames']; // Keep standard classNames prop
    styles?: DayPickerSingleProps['styles']; // Keep standard styles prop
}

// --- Helper Functions ---
const generateYears = (center: number, range = 120) => {
    const start = Math.max(1900, center - Math.floor(range / 1.5));
    const end = Math.min(new Date().getFullYear() + 5, center + Math.ceil(range / 2.5));
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(0, i), "MMMM"),
}));

const formatDateKey = (date: Date): string => format(date, "yyyy-MM-dd");
// --- End Helper Functions ---

export function TeacherAttendanceView() {
    const { user } = useAppSelector((state) => state.auth);
    const [displayMonth, setDisplayMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [showDetailsPanel, setShowDetailsPanel] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [popoverOpen, setPopoverOpen] = React.useState(false);

    const isSm = useMediaQuery("(max-width: 640px)");
    const isMdUp = useMediaQuery("(min-width: 768px)");

    const courseClassId = "webDevBootcamp"; // Hardcoded for demo
    const courseDailyAttendances = useAppSelector((state) => selectCourseDailyAttendances(state, courseClassId));

    // Prepare Attendance Data & Modifiers
    const attendanceDataForPicker = useMemo(() => {
        const data: AttendanceDataForPicker = {};
        courseDailyAttendances.forEach(att => {
            data[att.date] = "hasData";
        });
        return data;
    }, [courseDailyAttendances]);

    const attendanceModifiers = React.useMemo<Modifiers>(() => {
        const mods: Modifiers = {
            selected: [],
            disabled: [],
            hidden: [],
            outside: [],
            today: [],
            range_start: [],
            range_end: [],
            range_middle: [],
        };

        Object.entries(attendanceDataForPicker).forEach(([dateStr, status]) => {
            const key = `modifier_${status}` as keyof Modifiers;
            if (!mods[key]) {
                // @ts-ignore: we are dynamically assigning a custom modifier
                mods[key] = [];
            }

            try {
                const [year, month, day] = dateStr.split("-").map(Number);
                if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                    const attendanceDate = new Date(Date.UTC(year, month - 1, day));
                    if (!isNaN(attendanceDate.getTime())) {
                        // @ts-ignore: dynamically adding to custom modifier
                        mods[key].push(attendanceDate);
                    }
                }
            } catch (e) {
                console.error(`Error parsing date: ${dateStr}`, e);
            }
        });

        mods.today.push(new Date());

        return mods;
    }, [attendanceDataForPicker]);


    const modifierClassNames: CalendarProps['modifiersClassNames'] = {
        modifier_hasData: 'relative after:content-[""] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-primary',
        modifier_today: 'bg-accent text-accent-foreground rounded-md font-bold',
    };

    // Date Picker Navigation Logic
    const currentYear = displayMonth.getFullYear();
    const currentMonth = displayMonth.getMonth();
    const years = React.useMemo(() => generateYears(currentYear), [currentYear]);

    // Select Most Recent Date
    const selectMostRecentDateWithData = useCallback(() => {
        const sortedDates = [...courseDailyAttendances]
            .map((att) => parseISO(att.date))
            .sort(compareDesc);

        if (sortedDates.length > 0) {
            setSelectedDate(sortedDates[0]);
            setDisplayMonth(sortedDates[0]);
            setShowDetailsPanel(true);
            setSearchQuery("");
        } else {
            setSelectedDate(undefined);
            setShowDetailsPanel(false);
        }
    }, [courseDailyAttendances]);

    // Initialize View Effect
    useEffect(() => {
        if (courseDailyAttendances.length > 0 && !selectedDate) {
            const today = new Date();
            const formattedToday = format(today, "yyyy-MM-dd");
            const todayHasData = courseDailyAttendances.some((a) => a.date === formattedToday);

            if (todayHasData) {
                setSelectedDate(today);
                setDisplayMonth(today);
                setShowDetailsPanel(true);
            } else {
                selectMostRecentDateWithData();
            }
        }
        else if (courseDailyAttendances.length === 0) {
            setShowDetailsPanel(false);
            setSelectedDate(undefined);
        }
    }, [courseDailyAttendances, selectedDate, selectMostRecentDateWithData]);

    // Get Details for Selected Date
    const selectedDayAttendanceDetails: DailyAttendance | null = useMemo(() => {
        if (!selectedDate) return null;
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        return courseDailyAttendances.find((a) => a.date === formattedDate) || null;
    }, [selectedDate, courseDailyAttendances]);

    // Filter Students
    const filteredStudents = useMemo(() => {
        if (!selectedDayAttendanceDetails) return [];
        const studentsOnSelectedDay = selectedDayAttendanceDetails.attendances || [];
        if (!searchQuery) return studentsOnSelectedDay;
        return studentsOnSelectedDay.filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [selectedDayAttendanceDetails, searchQuery]);

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

    // Calculate Attendance Stats
    const attendanceStats = useMemo(() => {
        if (!selectedDayAttendanceDetails) return { present: 0, absent: 0, late: 0, total: 0 };
        const attendances = selectedDayAttendanceDetails.attendances ?? []; // Use nullish coalescing
        const present = attendances.filter((a) => a.status === "present").length;
        const absent = attendances.filter((a) => a.status === "absent").length;
        const late = attendances.filter((a) => a.status === "late").length;
        const total = attendances.length;
        return { present, absent, late, total };
    }, [selectedDayAttendanceDetails]);

    // Handler: Day Click in Date Picker
    const handleDayClick: DayClickEventHandler = (day, modifiers) => {
        if (modifiers.modifier_hasData) { // Check specific modifier
            setSelectedDate(day);
            setShowDetailsPanel(true);
            setSearchQuery("");
            setPopoverOpen(false);
        } else {
            console.log("No attendance data for this day.");
            // Optionally provide user feedback, e.g., via toast
        }
    };

    if (!user) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date Picker Card */}
            <div className="md:col-span-1">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Select Date</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {selectedDate ? format(selectedDate, "PPP") : "No date selected"}
                        </p>
                    </CardHeader>
                    <CardContent className="p-2 md:p-4">
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    aria-label={"Select Attendance Date"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal mb-2",
                                        !selectedDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    <span>{format(displayMonth, isSm ? "MMM yyyy" : "MMMM yyyy")}</span>
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className={cn("w-auto p-0 bg-background/80 backdrop-blur-sm border", isMdUp && "md:min-w-[540px]")}>
                                <div className="flex flex-wrap items-center justify-between gap-2 p-2 border-b">
                                    <Select value={String(currentMonth)} onValueChange={(val) => setDisplayMonth(setMonth(displayMonth, +val))}>
                                        <SelectTrigger className="w-[120px] h-8 text-xs focus:ring-0"><SelectValue placeholder="Month" /></SelectTrigger>
                                        <SelectContent>{months.map(({ value, label }) => (<SelectItem key={value} value={String(value)} className="text-xs">{label}</SelectItem>))}</SelectContent>
                                    </Select>
                                    <Select value={String(currentYear)} onValueChange={(val) => setDisplayMonth(setYear(displayMonth, +val))}>
                                        <SelectTrigger className="w-[90px] h-8 text-xs focus:ring-0"><SelectValue placeholder="Year" /></SelectTrigger>
                                        <SelectContent className="max-h-[200px] overflow-y-auto">{years.map((year) => (<SelectItem key={year} value={String(year)} className="text-xs">{year}</SelectItem>))}</SelectContent>
                                    </Select>
                                </div>
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    month={displayMonth}
                                    onMonthChange={setDisplayMonth}
                                    onSelect={undefined} // Use onDayClick only
                                    onDayClick={handleDayClick}
                                    toDate={new Date()}
                                    disabled={isWeekend}
                                    initialFocus
                                    numberOfMonths={isMdUp ? 2 : 1}
                                    modifiers={attendanceModifiers}
                                    modifiersClassNames={modifierClassNames}
                                    classNames={{ caption: "hidden", caption_dropdowns: "hidden" }}
                                />
                            </PopoverContent>
                        </Popover>
                        <Button variant="outline" size="sm" className="w-full mt-2 text-xs" onClick={() => setDisplayMonth(new Date())}>
                            Go to Current Month
                        </Button>
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
                                        <div className="flex flex-wrap gap-2 text-xs"> {/* Changed to flex-wrap */}
                                            <Badge variant="outline" className={getStatusClasses("present") + " px-2 py-0.5"}>{attendanceStats.present} Present</Badge>
                                            <Badge variant="outline" className={getStatusClasses("absent") + " px-2 py-0.5"}>{attendanceStats.absent} Absent</Badge>
                                            <Badge variant="outline" className={getStatusClasses("late") + " px-2 py-0.5"}>{attendanceStats.late} Late</Badge>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => setShowDetailsPanel(false)}><X className="h-4 w-4" /></Button>
                                </div>
                                <div className="relative mt-2">
                                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search students..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 h-9"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="max-h-[calc(100vh-280px)] overflow-y-auto space-y-1 pr-3 pt-0"> {/* Adjusted max-h */}
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => (
                                        <div key={student.studentId} className="flex items-center justify-between p-2 -mx-2 rounded hover:bg-accent transition-colors">
                                            <span className="text-sm font-medium truncate pr-2">{student.name}</span>
                                            <Badge variant="outline" className={cn("capitalize text-xs px-2 py-0.5 font-medium border whitespace-nowrap", getStatusClasses(student.status))}>
                                                <span className="flex items-center gap-1">{getStatusIcon(student.status)}{student.status}</span>
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
    );
}