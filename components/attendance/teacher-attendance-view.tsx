// app/(authenticated)/attendance/facilitator/page.tsx
// FINAL CORRECTED VERSION - Adapted for the real API response

"use client";

import * as React from "react";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { format, parseISO, isSameDay, isWeekend, compareDesc, setMonth, setYear } from "date-fns";
import { Calendar as CalendarIcon, Search, X, Check, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  selectCourseDailyAttendances,
  fetchCourseAttendance,
  selectFetchingCourseAttendance
} from "@/features/attendance/store/attendance-slice";
import type { DailyAttendance, AttendanceStatus } from "@/data/mock-attendance-data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { DayClickEventHandler, DayPickerSingleProps, Modifiers } from "react-day-picker";
import { Label } from "@/components/ui/label";
import { selectCourseClass, setCourseClass } from "@/features/classes/store/classSessionSlice";
import { selectAllAdminClasses, selectClassesStatus } from "@/features/classes/store/classes-slice";
import { fetchAllClassesAdmin } from "@/features/classes/store/classes-thunks";
import type { CourseClass, CourseClassOption } from "@/features/classes/types/classes-types";

// --- In-file Type Definitions ---
type AttendanceStatusIndicator = "present" | "absent" | "late" | "holiday" | string;
type AttendanceDataForPicker = Record<string, AttendanceStatusIndicator>;

export interface CalendarProps extends Omit<DayPickerSingleProps, 'modifiers' | 'classNames' | 'styles'> {
  modifiers?: Modifiers;
  modifiersClassNames?: Record<string, string>;
  classNames?: DayPickerSingleProps['classNames'];
  styles?: DayPickerSingleProps['styles'];
}

const generateYears = (center: number, range = 10) => {
  const start = center - Math.floor(range / 2);
  const end = center + Math.ceil(range / 2);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

const months = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: format(new Date(0, i), "MMMM"),
}));

export function FacilitatorAttendanceView() {
  const dispatch = useAppDispatch();

  // --- State Hooks ---
  const [displayMonth, setDisplayMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  // --- Redux Selectors ---
  const selectedClass = useAppSelector(selectCourseClass);
  // CORRECTED: Use the selector that holds the array of class objects
  const availableClasses = useAppSelector(selectAllAdminClasses);
  const classesStatus = useAppSelector(selectClassesStatus);
  const fetchingAttendance = useAppSelector(selectFetchingCourseAttendance);

  const classesLoading = classesStatus === 'loading' || classesStatus === 'idle';

  // --- Data Fetching Effects ---
  useEffect(() => {
    // Fetch the list of classes if it's not already loaded or has failed.
    if (classesStatus === 'idle' || classesStatus === 'failed') {
      dispatch(fetchAllClassesAdmin({ page: 1, limit: 5000 })); // Fetch all classes for the dropdown with very high limit
    }
  }, [dispatch, classesStatus]);

  useEffect(() => {
    // When a class is selected, fetch its specific attendance data.
    if (selectedClass?.id) {
      dispatch(fetchCourseAttendance(selectedClass.id));
    }
  }, [dispatch, selectedClass?.id]);
  

  // --- Event Handlers ---
  const handleClassChange = useCallback((classId: string) => {
    const newSelectedClass = availableClasses.find((c: CourseClass) => c.id === classId);
    if (newSelectedClass) {
      // To make the state compatible with `setCourseClass`, we map the properties.
      const classToSet = {
        id: newSelectedClass.id,
        courseName: newSelectedClass.courseTitle || newSelectedClass.name, // Use courseTitle or fallback to name
        sessionName: newSelectedClass.name, // The main name can be the session name
      } as CourseClassOption;
      dispatch(setCourseClass(classToSet));
    } else {
      dispatch(setCourseClass({
        id: '',
        courseName: '',
        sessionName: ''
      })); // Clear the selected class
    }
    // Reset view state when class changes
    setSelectedDate(undefined);
    setDisplayMonth(new Date());
    setShowDetailsPanel(false);
  }, [dispatch, availableClasses]);

  const handleDayClick: DayClickEventHandler = (day, modifiers) => {
    if (modifiers.disabled) return;
    setSelectedDate(day);
    setShowDetailsPanel(true);
    setPopoverOpen(false);
  };

  // --- Memoized Calculations ---
  const courseDailyAttendances = useAppSelector((state) =>
    selectCourseDailyAttendances(state, selectedClass?.id)
  );


  useEffect(() => {
  console.log("Selected Class:", selectedClass?.id);
  console.log("Fetched Attendances:", courseDailyAttendances);
}, [selectedClass?.id, courseDailyAttendances]);


  const attendanceDataForPicker = useMemo(() => {
    return (courseDailyAttendances || []).reduce((acc, att) => {
      acc[att.date] = "hasData";
      return acc;
    }, {} as AttendanceDataForPicker);
  }, [courseDailyAttendances]);

  const selectedDayAttendanceDetails: DailyAttendance | null = useMemo(() => {
    if (!selectedDate || !courseDailyAttendances) return null;
    
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    return courseDailyAttendances.find(a => format(parseISO(a.date), "yyyy-MM-dd") === formattedDate) || null;
    // const formattedDate = format(selectedDate, "yyyy-M-d"); // Use a format that matches the keys
    // // Find a match ignoring timezones by checking just the date part
    // return courseDailyAttendances.find(a => format(parseISO(a.date), "yyyy-M-d") === formattedDate) || null;
  }, [selectedDate, courseDailyAttendances]);

  const filteredStudents = useMemo(() => {
    if (!selectedDayAttendanceDetails) return [];
    const students = selectedDayAttendanceDetails.attendances || [];
    if (!searchQuery) return students;
    return students.filter(student => student.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [selectedDayAttendanceDetails, searchQuery]);

  const attendanceStats = useMemo(() => {
    if (!selectedDayAttendanceDetails) return { present: 0, absent: 0, late: 0, total: 0 };
    const { attendances = [] } = selectedDayAttendanceDetails;
    return {
      present: attendances.filter(a => a.status === "present").length,
      absent: attendances.filter(a => a.status === "absent").length,
      late: attendances.filter(a => a.status === "late").length,
      total: attendances.length,
    };
  }, [selectedDayAttendanceDetails]);

  // --- Auto-select first available date logic ---
  useEffect(() => {
    if (courseDailyAttendances && courseDailyAttendances.length > 0 && !selectedDate) {
      const latestDate = [...courseDailyAttendances].sort((a, b) => compareDesc(parseISO(a.date), parseISO(b.date)))[0];
      if (latestDate) {
        const dateToSelect = parseISO(latestDate.date);
        setSelectedDate(dateToSelect);
        setDisplayMonth(dateToSelect);
        setShowDetailsPanel(true);
      }
    }
  }, [courseDailyAttendances, selectedDate]);


  // --- UI Constants & Helpers ---
  const isSm = useMediaQuery("(max-width: 640px)");
  const currentYear = displayMonth.getFullYear();
  const years = React.useMemo(() => generateYears(currentYear), [currentYear]);

  const getStatusClasses = (status: AttendanceStatus) => ({
    "present": "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700",
    "absent": "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700",
    "late": "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700",
  }[status] || "bg-muted text-muted-foreground border-border");

  const getStatusIcon = (status: AttendanceStatus) => ({
    "present": <Check className="h-4 w-4 text-green-600" />,
    "absent": <X className="h-4 w-4 text-red-600" />,
    "late": <Clock className="h-4 w-4 text-amber-600" />,
  }[status] || null);


  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="class-select">Select Class/Session</Label>
        <Select value={selectedClass?.id || ""} onValueChange={handleClassChange} disabled={classesLoading}>
          <SelectTrigger id="class-select" className="w-full sm:w-[400px]">
            <SelectValue placeholder="Select a class to view attendance..." />
          </SelectTrigger>
          <SelectContent>
            {classesLoading && <SelectItem value="loading" disabled><div className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading classes...</div></SelectItem>}
            {availableClasses.map((cls: CourseClass) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.courseTitle || cls.name}
              </SelectItem>
            ))}
            {!classesLoading && availableClasses.length === 0 && <SelectItem value="no-classes" disabled>No classes available.</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Select Date</CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-4">
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")} disabled={!selectedClass?.id}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>{selectedDate ? format(selectedDate, "PPP") : "Select a date"}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2 border-b">
                    <Select value={String(displayMonth.getMonth())} onValueChange={(val) => setDisplayMonth(setMonth(displayMonth, +val))}>
                      <SelectTrigger className="w-[140px] h-9 text-sm focus:ring-0"><SelectValue /></SelectTrigger>
                      <SelectContent>{months.map(({ value, label }) => (<SelectItem key={value} value={String(value)}>{label}</SelectItem>))}</SelectContent>
                    </Select>
                    <Select value={String(displayMonth.getFullYear())} onValueChange={(val) => setDisplayMonth(setYear(displayMonth, +val))}>
                      <SelectTrigger className="w-[100px] h-9 text-sm focus:ring-0"><SelectValue /></SelectTrigger>
                      <SelectContent>{years.map((year) => (<SelectItem key={year} value={String(year)}>{year}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <Calendar
                    mode="single" selected={selectedDate} month={displayMonth} onMonthChange={setDisplayMonth}
                    onDayClick={handleDayClick} toDate={new Date()} disabled={isWeekend} initialFocus
                    modifiers={{ hasData: (date) => Object.keys(attendanceDataForPicker).some(d => isSameDay(parseISO(d), date)) }}
                    modifiersClassNames={{ hasData: 'relative after:content-[""] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-primary' }}
                    classNames={{ caption: "hidden" }}
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="sm" className="w-full mt-2 text-xs" onClick={() => { setDisplayMonth(new Date()); setSelectedDate(new Date()) }} disabled={!selectedClass?.id}>Go to Today</Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <motion.div key={selectedDate ? format(selectedDate, "yyyy-MM-dd") : 'empty'}>
            {fetchingAttendance ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6 text-center rounded-lg bg-card border"><Loader2 className="w-10 h-10 mb-4 text-primary animate-spin" /><h3 className="font-semibold">Loading Attendance...</h3></div>
            ) : selectedClass?.id ? (
              showDetailsPanel && selectedDayAttendanceDetails ? (
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle>Attendance for {format(selectedDate!, "PPP")}</CardTitle>
                        <div className="flex flex-wrap gap-2 mt-2 text-xs">
                          <Badge variant="outline" className={getStatusClasses("present")}>{attendanceStats.present} Present</Badge>
                          <Badge variant="outline" className={getStatusClasses("absent")}>{attendanceStats.absent} Absent</Badge>
                          <Badge variant="outline" className={getStatusClasses("late")}>{attendanceStats.late} Late</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="w-8 h-8 -mt-1 -mr-2" onClick={() => setShowDetailsPanel(false)}><X className="w-4 h-4" /></Button>
                    </div>
                    <div className="relative mt-4"><Search className="absolute text-muted-foreground w-4 h-4 left-3 top-1/2 -translate-y-1/2" /><Input placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div>
                  </CardHeader>
                  <CardContent className="max-h-[calc(100vh-350px)] overflow-y-auto pt-0">
                    {filteredStudents.length > 0 ? (
                      <div className="space-y-1">
                        {filteredStudents.map(student => (
                          <div key={student.studentId} className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
                            <p className="font-medium text-sm">{student.name}</p>
                            <div className={cn("flex items-center gap-2 px-2 py-1 text-xs font-semibold capitalize rounded-md", getStatusClasses(student.status))}>
                              {getStatusIcon(student.status)}
                              {student.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-muted-foreground text-sm">{searchQuery ? 'No students found for your search.' : 'No attendance records for this day.'}</div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6 text-center rounded-lg bg-card border border-dashed">
                  <CalendarIcon className="w-12 h-12 mb-4 text-muted-foreground" />
                  <h3 className="font-semibold">{selectedDate ? 'No Records Found' : 'Select a Date'}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedDate ? `No attendance data recorded for ${format(selectedDate, "PPP")}.` : "Choose a date from the calendar to view details."}</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6 text-center rounded-lg bg-card border border-dashed">
                <CalendarIcon className="w-12 h-12 mb-4 text-muted-foreground" />
                <h3 className="font-semibold">Select a Class</h3>
                <p className="mt-1 text-sm text-muted-foreground">Please select a class from the dropdown to begin.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Backward compatibility export
export const TeacherAttendanceView = FacilitatorAttendanceView;