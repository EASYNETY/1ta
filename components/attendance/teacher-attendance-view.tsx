// app/(authenticated)/attendance/teacher/page.tsx OR wherever TeacherAttendanceView is used
"use client";

import * as React from "react";
import { useState, useMemo, useEffect, useCallback, useRef } from "react"; // Added useRef
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  format,
  parseISO,
  // startOfMonth, // Not directly used, consider removing if not needed by other parts
  // endOfMonth, // Not directly used
  isSameDay, // Useful for comparing dates
  isWeekend,
  // addMonths, // Not directly used
  // subMonths, // Not directly used
  // isToday, // Not directly used
  compareDesc,
  setMonth,
  setYear,
} from "date-fns";
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
import { Label } from "@/components/ui/label"; // Adjusted path
import { selectCourseClass, setCourseClass } from "@/features/classes/store/classSessionSlice";
import { useToast } from "@/hooks/use-toast";
import { CourseClassOption } from "@/features/classes/types/classes-types";
import { selectAllCourseClassOptions, selectCourseClassOptionsStatus } from "@/features/classes/store/classes-slice";
import { fetchCourseClassOptionsForScanner } from "@/features/classes/store/classes-thunks";


// --- In-file Type Definitions ---
type AttendanceStatusIndicator = "present" | "absent" | "late" | "holiday" | string;
type AttendanceDataForPicker = Record<string, AttendanceStatusIndicator>;

export interface CalendarProps extends Omit<DayPickerSingleProps, 'modifiers' | 'classNames' | 'styles'> {
  modifiers?: Modifiers;
  modifiersClassNames?: Record<string, string>;
  classNames?: DayPickerSingleProps['classNames'];
  styles?: DayPickerSingleProps['styles'];
}

const generateYears = (center: number, range = 120) => {
  const start = Math.max(1900, center - Math.floor(range / 1.5));
  const end = Math.min(new Date().getFullYear() + 5, center + Math.ceil(range / 2.5));
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

const months = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: format(new Date(0, i), "MMMM"),
}));

// const formatDateKey = (date: Date): string => format(date, "yyyy-MM-dd"); // Not used, consider removing

export function TeacherAttendanceView() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const [displayMonth, setDisplayMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const selectedClass = useAppSelector(selectCourseClass); // CRITICAL: Ensure selectCourseClass is memoized (e.g. with reselect)
  const classOptions = useAppSelector(selectAllCourseClassOptions);
  const classOptionsStatus = useAppSelector(selectCourseClassOptionsStatus);
  const classOptionsLoading = classOptionsStatus === 'loading';
  const fetchingAttendance = useAppSelector(selectFetchingCourseAttendance);

  const initialFetchAttempted = useRef(false);

  // --- Fetch Class Options (aligned with ScanPage) ---
  useEffect(() => {
    // Reset flag if user context changes, or on initial mount for the component instance
    initialFetchAttempted.current = false;
  }, [user?.id]); // Or simply [] if user context isn't primary driver for re-fetching options list globally

  useEffect(() => {
    if (user === undefined) { // Wait for auth slice to determine user
        console.log("TeacherAttendanceView: User data is undefined.");
        return;
    }
    // No role check here as this view might be accessible to students too, adjust if needed.

    const needsFetch =
        classOptionsStatus === 'idle' ||
        classOptionsStatus === 'failed' ||
        (classOptionsStatus === 'succeeded' && (!classOptions || classOptions.length === 0) && !initialFetchAttempted.current);

    if (needsFetch) {
        console.log(`TeacherAttendanceView: Triggering fetch for course class options. Status: ${classOptionsStatus}, Options Length: ${classOptions?.length}, Initial Fetch Attempted: ${initialFetchAttempted.current}`);
        dispatch(fetchCourseClassOptionsForScanner());
        initialFetchAttempted.current = true;
    } else {
        console.log(`TeacherAttendanceView: Skipping fetch for course class options. Status: ${classOptionsStatus}, Options Length: ${classOptions?.length}`);
    }
  }, [user, dispatch, classOptionsStatus, classOptions]); // Removed fetchCourseClassOptionsForScanner from deps as it's a stable dispatch

  // Force classOptionsStatus to 'succeeded' if it's stuck in 'loading' for too long
  useEffect(() => {
    if (classOptionsStatus === 'loading') {
      const timer = setTimeout(() => {
        console.log("TeacherAttendanceView: Class options loading timeout, forcing status to succeeded");
        dispatch(setCourseClassOptionStatus('succeeded'));
      }, 5000); // 5 seconds timeout

      return () => clearTimeout(timer);
    }
  }, [classOptionsStatus, dispatch]);
  // --- End Fetch Class Options ---

  // Fetch attendance data when a class is selected
  useEffect(() => {
    if (selectedClass?.id) {
      console.log(`TeacherAttendanceView: Fetching attendance data for class ${selectedClass.id}`);
      dispatch(fetchCourseAttendance(selectedClass.id));
    }
  }, [dispatch, selectedClass?.id]);

  const handleClassChange = useCallback((value: string) => {
    if (value === "select-a-class" || !value) {
      dispatch(setCourseClass({ id: '', courseName: "", sessionName: "" }));
    } else {
      const selected = classOptions.find((option: CourseClassOption) => option.id === value);
      if (selected) {
        dispatch(setCourseClass(selected));
        // Toasting here might be too frequent if class changes often programmatically.
        // Consider if it's only for user-initiated changes.
        // toast({ title: "Class Selected", description: `Viewing attendance for ${selected.courseName} - ${selected.sessionName}` });
      }
    }
    // Reset date selection when class changes to avoid showing old data
    setSelectedDate(undefined);
    setDisplayMonth(new Date()); // Reset calendar to current month
    setShowDetailsPanel(false);
  }, [dispatch, classOptions /*, toast (if re-enabled) */]);

  const handleRetryFetchOptions = () => {
    initialFetchAttempted.current = false;
    dispatch(fetchCourseClassOptionsForScanner());
  };

  const isSm = useMediaQuery("(max-width: 640px)");
  const isMdUp = useMediaQuery("(min-width: 768px)");

  // CRITICAL: Ensure selectCourseDailyAttendances is memoized (e.g. with reselect)
  // It should handle selectedClass?.id being undefined or '' by returning a STABLE empty array.
  const courseDailyAttendances = useAppSelector((state) =>
    selectCourseDailyAttendances(state, selectedClass?.id)
  );

  const attendanceDataForPicker = useMemo(() => {
    const data: AttendanceDataForPicker = {};
    (courseDailyAttendances || []).forEach(att => { // Guard against null/undefined courseDailyAttendances
      data[att.date] = "hasData";
    });
    return data;
  }, [courseDailyAttendances]);

  const attendanceModifiers = React.useMemo<Modifiers>(() => {
    const mods: Modifiers = { today: [new Date()] } as Modifiers; // Initialize with today
    Object.entries(attendanceDataForPicker).forEach(([dateStr, status]) => {
      const key = `modifier_${status}` as keyof Modifiers; // Custom modifier key
      if (!mods[key]) mods[key] = [];
      try {
        const [year, month, day] = dateStr.split("-").map(Number);
        // Ensure UTC to match typical ISO date string storage and avoid timezone issues with Date constructor
        const attendanceDate = new Date(Date.UTC(year, month - 1, day));
        if (!isNaN(attendanceDate.getTime())) {
          (mods[key] as Date[]).push(attendanceDate);
        }
      } catch (e) { console.error(`Error parsing date: ${dateStr}`, e); }
    });
    return mods;
  }, [attendanceDataForPicker]);

  const modifierClassNames: CalendarProps['modifiersClassNames'] = {
    modifier_hasData: 'relative after:content-[""] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-primary',
    modifier_today: 'bg-accent text-accent-foreground rounded-md font-bold',
  };

  const currentYear = displayMonth.getFullYear();
  const currentMonth = displayMonth.getMonth();
  const years = React.useMemo(() => generateYears(currentYear), [currentYear]);

  // Effect to initialize or update view based on attendance data and selected class
  useEffect(() => {
    // This effect runs when courseDailyAttendances (i.e., selected class's data) changes,
    // or when selectedDate is changed by the user/calendar.
    const hasData = courseDailyAttendances && courseDailyAttendances.length > 0;

    if (!selectedClass?.id) { // No class selected
        setSelectedDate(undefined);
        setShowDetailsPanel(false);
        // setDisplayMonth(new Date()); // Optionally reset calendar view
        return;
    }

    if (hasData) {
        // If a date is already selected and still valid for current data, keep it.
        // Otherwise, try to pick a new one.
        const currentSelectedDateIsValid = selectedDate && courseDailyAttendances.some(att => isSameDay(parseISO(att.date), selectedDate));

        if (currentSelectedDateIsValid && showDetailsPanel) { // Ensure panel is shown if date is valid
            return; // Date is fine, panel is shown, do nothing
        }
        if(currentSelectedDateIsValid && !showDetailsPanel) {
            setShowDetailsPanel(true); // Date is fine, but panel was hidden, show it
            return;
        }


        // No valid date selected or current selection is not in new data, find a default.
        const today = new Date();
        const todayHasData = courseDailyAttendances.some(att => isSameDay(parseISO(att.date), today));
        let newSelectedDateToSet: Date | undefined = undefined;

        if (todayHasData) {
            newSelectedDateToSet = today;
        } else {
            const sortedDates = [...courseDailyAttendances]
                .map((att) => parseISO(att.date))
                .sort(compareDesc);
            if (sortedDates.length > 0) {
                newSelectedDateToSet = sortedDates[0];
            }
        }

        if (newSelectedDateToSet) {
            // Only update if the new date is different from the current selectedDate
            // This helps prevent loops if newSelectedDateToSet happens to be the same as selectedDate
            if (!selectedDate || !isSameDay(newSelectedDateToSet, selectedDate)) {
                setSelectedDate(newSelectedDateToSet);
                setDisplayMonth(newSelectedDateToSet); // Update calendar view to the month of the new selected date
            }
            setShowDetailsPanel(true);
            // setSearchQuery(""); // Reset search when auto-selecting date
        } else { // No data to select a date from
            setSelectedDate(undefined);
            setShowDetailsPanel(false);
        }
    } else { // No attendance data for the selected class
        setSelectedDate(undefined);
        setShowDetailsPanel(false);
        // Optionally reset displayMonth: setDisplayMonth(new Date());
    }
  }, [courseDailyAttendances, selectedClass?.id]); // Key dependencies. selectedDate removed to avoid loop if it's set inside.
                                                  // Add showDetailsPanel to deps if its external changes should re-trigger logic.

  const selectedDayAttendanceDetails: DailyAttendance | null = useMemo(() => {
    if (!selectedDate || !courseDailyAttendances) return null;
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    return courseDailyAttendances.find((a) => a.date === formattedDate) || null;
  }, [selectedDate, courseDailyAttendances]);

  const filteredStudents = useMemo(() => {
    if (!selectedDayAttendanceDetails) return [];
    const studentsOnSelectedDay = selectedDayAttendanceDetails.attendances || [];
    if (!searchQuery) return studentsOnSelectedDay;
    return studentsOnSelectedDay.filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [selectedDayAttendanceDetails, searchQuery]);

  const getStatusClasses = (status: AttendanceStatus): string => {
    switch (status) {
      case "present": return "bg-green-200/30 text-green-800 border-green-300 dark:bg-green-300/10 dark:text-green-400 dark:border-green-400/20";
      case "absent": return "bg-red-200/30 text-red-800 border-red-300 dark:bg-red-300/10 dark:text-red-400 dark:border-red-400/20";
      case "late": return "bg-amber-200/30 text-amber-800 border-amber-300 dark:bg-amber-300/10 dark:text-amber-400 dark:border-amber-400/20";
      default: return "bg-muted/50 text-muted-foreground border-border dark:bg-muted/10 dark:text-muted-foreground dark:border-muted/30";
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case "present": return <Check className="h-4 w-4 text-green-600 dark:text-green-300" />;
      case "absent": return <X className="h-4 w-4 text-red-600 dark:text-red-300" />;
      case "late": return <Clock className="h-4 w-4 text-amber-600 dark:text-amber-300" />;
      default: return null;
    }
  };

  const attendanceStats = useMemo(() => {
    if (!selectedDayAttendanceDetails) return { present: 0, absent: 0, late: 0, total: 0 };
    const attendances = selectedDayAttendanceDetails.attendances ?? [];
    const present = attendances.filter((a) => a.status === "present").length;
    const absent = attendances.filter((a) => a.status === "absent").length;
    const late = attendances.filter((a) => a.status === "late").length;
    return { present, absent, late, total: attendances.length };
  }, [selectedDayAttendanceDetails]);

  const handleDayClick: DayClickEventHandler = (day, modifiers) => {
    if (modifiers.disabled) return; // Don't do anything for disabled days

    // Check if the day has data using our custom modifier OR if it's selectable in general
    // The `modifier_hasData` implies there's data.
    // If you want to allow selecting any day (even without data) and then show "no data", adjust this.
    if (modifiers.modifier_hasData) {
      setSelectedDate(day);
      // setDisplayMonth(day); // Calendar's onMonthChange will handle this if month navigation occurs
      setShowDetailsPanel(true);
      setSearchQuery("");
      setPopoverOpen(false); // Close popover on day click
    } else {
      // toast({ variant: "default", title: "No Data", description: "No attendance data recorded for this day." });
      // Decide if selecting a day with no data should clear the panel or show "no data found"
      setSelectedDate(day); // Select the day
      setShowDetailsPanel(true); // Show panel (it will say no records)
      setSearchQuery("");
      setPopoverOpen(false);
    }
  };

  if (!user && classOptionsStatus !== 'loading' && classOptionsStatus !== 'idle') { // Better loading/auth check
      // This might redirect or show a login prompt if user is truly null after auth check.
      // For now, returning null if user is definitively not available post-loading.
      return <p>Authenticating or user not found...</p>;
  }
  if (user === undefined && (classOptionsStatus === 'loading' || classOptionsStatus === 'idle')) {
      return <div className="flex justify-center items-center h-32"><Loader2 className="h-8 w-8 animate-spin" /></div>; // Initial loading state
  }


  return (
    <div className="space-y-2">
      <div className="space-y-1.5">
        <Label htmlFor="courseClassSelect">Select Class/Session</Label>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <Select
            value={selectedClass?.id || ""}
            onValueChange={handleClassChange}
            disabled={classOptionsLoading && classOptionsStatus !== 'succeeded'}
          >
            <SelectTrigger id="courseClassSelect" className="w-full sm:w-auto sm:min-w-[300px] flex-grow">
              <SelectValue placeholder="Select a class to view attendance..." />
            </SelectTrigger>
            <SelectContent>
              {classOptionsLoading && classOptionsStatus === 'loading' && (
                <SelectItem value="loading" disabled>
                  <div className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading classes...</div>
                </SelectItem>
              )}
              <SelectItem value="select-a-class">-- Select a Class --</SelectItem>
              {classOptions?.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.courseName} - {option.sessionName}
                </SelectItem>
              ))}
              {!classOptionsLoading && classOptionsStatus === 'succeeded' && classOptions?.length === 0 && (
                <SelectItem value="no-classes" disabled>No classes available</SelectItem>
              )}
              {classOptionsStatus === 'failed' && (
                <div className="p-2 text-center text-destructive">
                  Failed to load classes.
                  <Button variant="link" onClick={handleRetryFetchOptions} className="text-xs">Retry</Button>
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    className={cn("w-full justify-start text-left font-normal mb-2", !selectedDate && "text-muted-foreground")}
                    disabled={!selectedClass?.id} // Disable if no class selected
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
                    onMonthChange={setDisplayMonth} // Let calendar control month changes
                    onDayClick={handleDayClick} // Use onDayClick for selection logic
                    // onSelect={handleDateSelect} // Use onDayClick primarily
                    toDate={new Date()} // Can't select future dates
                    disabled={isWeekend} // Example: disable weekends
                    initialFocus
                    numberOfMonths={isMdUp ? 2 : 1}
                    modifiers={attendanceModifiers}
                    modifiersClassNames={modifierClassNames}
                    classNames={{ caption: "hidden", caption_dropdowns: "hidden" }} // Hiding default nav as we have custom
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="sm" className="w-full mt-2 text-xs" onClick={() => setDisplayMonth(new Date())}  disabled={!selectedClass?.id}>
                Go to Current Month
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <motion.div
            key={selectedDate ? format(selectedDate, "yyyy-MM-dd") : (selectedClass?.id || "empty")}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            {fetchingAttendance ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6 bg-muted/30 rounded-lg border-2 border-dashed border-border">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <h3 className="text-lg font-semibold mb-1">Loading Attendance Data</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Please wait while we fetch attendance records...
                </p>
              </div>
            ) : selectedClass?.id ? (
              showDetailsPanel && selectedDayAttendanceDetails ? (
                <Card className="shadow-sm h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <CardTitle className="text-lg mb-1">Attendance for {format(selectedDate!, "PPP")}</CardTitle>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="outline" className={getStatusClasses("present") + " px-2 py-0.5"}>{attendanceStats.present} Present</Badge>
                          <Badge variant="outline" className={getStatusClasses("absent") + " px-2 py-0.5"}>{attendanceStats.absent} Absent</Badge>
                          <Badge variant="outline" className={getStatusClasses("late") + " px-2 py-0.5"}>{attendanceStats.late} Late</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => setShowDetailsPanel(false)}><X className="h-4 w-4" /></Button>
                    </div>
                    <div className="relative mt-2">
                      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-9" />
                    </div>
                  </CardHeader>
                  <CardContent className="max-h-[calc(100vh-280px)] overflow-y-auto space-y-1 pr-3 pt-0">
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
                  <h3 className="text-lg font-semibold mb-1">
                    {selectedDate ? "No Attendance Data" : "Select a Date"}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {selectedDate
                        ? `No attendance data recorded for ${format(selectedDate, "PPP")}.`
                        : "Choose a date from the calendar with recorded attendance (indicated by a dot) to view details."
                    }
                  </p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6 bg-muted/30 rounded-lg border-2 border-dashed border-border">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-1">Select a Class</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Please select a class/session first to see attendance data.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}