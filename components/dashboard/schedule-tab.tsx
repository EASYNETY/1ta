// components/dashboard/schedule-tab.tsx

"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card";
import { CardContent } from "@/components/ui/card";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { CalendarIcon, Clock, Video, Users, MapPin, BookOpen, ChevronLeft, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react';
import {
    format,
    startOfWeek,
    addDays,
    isSameDay,
    addWeeks,
    subWeeks,
    isToday,
    parseISO,
    isValid,
    formatISO,
    endOfWeek
} from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
    fetchSchedule,
    setViewStartDate,
    selectScheduleEvents,
    selectScheduleStatus,
    selectScheduleError,
    selectScheduleViewStartDate,
    clearScheduleError,
} from '@/features/schedule/store/schedule-slice'; // Adjust path if necessary
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ScheduleEvent } from "@/features/schedule/types/schedule-types"; // Import type
import { safeArray, safeFilter, safeSort, safeLength, safeParseDate } from "@/lib/utils/safe-data"; // Import safe utility functions

// Helper function to safely format time string
const safeFormatTime = (dateString: string | undefined | null): string => {
    if (!dateString) return "N/A";
    try {
        const date = parseISO(dateString);
        if (isValid(date)) {
            return format(date, "h:mm a");
        }
        return "Invalid Time";
    } catch {
        return "Error";
    }
};

export function ScheduleTab() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const events = useAppSelector(selectScheduleEvents);
    const status = useAppSelector(selectScheduleStatus);
    const error = useAppSelector(selectScheduleError);
    const viewStartDateStr = useAppSelector(selectScheduleViewStartDate);
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const daySectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const currentWeekStart = useMemo(() => {
        try {
            const parsed = parseISO(viewStartDateStr);
            return isValid(parsed) ? startOfWeek(parsed, { weekStartsOn: 1 }) : startOfWeek(new Date(), { weekStartsOn: 1 });
        } catch {
            return startOfWeek(new Date(), { weekStartsOn: 1 });
        }
    }, [viewStartDateStr]);

    const currentWeekEnd = useMemo(() => endOfWeek(currentWeekStart, { weekStartsOn: 1 }), [currentWeekStart]);

    // Fetch schedule data
    useEffect(() => {
        if (user?.id && user.role) {
            const startDateISO = formatISO(currentWeekStart, { representation: 'date' });
            const endDateISO = formatISO(currentWeekEnd, { representation: 'date' });
            dispatch(fetchSchedule({
                role: user.role,
                userId: user.id,
                startDate: startDateISO,
                endDate: endDateISO,
            }));
        }
    }, [dispatch, user?.id, user?.role, viewStartDateStr]); // Trigger refetch when week changes

    // Reset selected day when week changes
    useEffect(() => {
        setSelectedDay(null);
        daySectionRefs.current = {};
    }, [viewStartDateStr]);

    if (!user) return null;

    // Navigation Handlers
    const goToPreviousWeek = () => dispatch(setViewStartDate(formatISO(subWeeks(currentWeekStart, 1), { representation: 'date' })));
    const goToNextWeek = () => dispatch(setViewStartDate(formatISO(addWeeks(currentWeekStart, 1), { representation: 'date' })));
    const goToCurrentWeek = () => dispatch(setViewStartDate(formatISO(startOfWeek(new Date(), { weekStartsOn: 1 }), { representation: 'date' })));

    // Data Processing
    const weekDays = useMemo(() => Array.from({ length: 7 }).map((_, index) => addDays(currentWeekStart, index)), [currentWeekStart]);
    const eventsByDay = useMemo(() => {
        return weekDays.map(day => ({
            date: day,
            events: safeSort(
                safeFilter<ScheduleEvent>(events, event => {
                    try {
                        if (!event || !event.startTime) return false;
                        const eventDate = safeParseDate(event.startTime)
                        return isValid(eventDate) && isSameDay(eventDate, day);
                    } catch { return false; }
                }),
                (a, b) => {
                    try {
                        return safeParseDate(a.startTime).getTime() - safeParseDate(b.startTime).getTime();
                    } catch {
                        return 0;
                    }
                }
            )
        }));
    }, [events, weekDays]);

    // --- Badge/Icon Helper Functions ---
    const getEventTypeBadge = (type: ScheduleEvent['type']) => { // Use specific type
        switch (type) {
            case "lecture": return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"><BookOpen className="mr-1 h-3 w-3" />Lecture</Badge>;
            case "lab": return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"><Users className="mr-1 h-3 w-3" />Lab</Badge>;
            case "exam": return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"><Clock className="mr-1 h-3 w-3" />Exam</Badge>;
            case "office-hours": return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700"><Users className="mr-1 h-3 w-3" />Office Hours</Badge>;
            case "meeting": return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700"><Video className="mr-1 h-3 w-3" />Meeting</Badge>;
            default: return <Badge variant="secondary">{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>;
        }
    };

    const getEventTypeIcon = (type: ScheduleEvent['type']) => { // Use specific type
        switch (type) {
            case "lecture": return <BookOpen className="h-5 w-5 text-primary" />;
            case "lab": return <Users className="h-5 w-5 text-primary" />;
            case "exam": return <Clock className="h-5 w-5 text-primary" />;
            case "office-hours": return <Users className="h-5 w-5 text-primary" />;
            case "meeting": return <Video className="h-5 w-5 text-primary" />;
            default: return <CalendarIcon className="h-5 w-5 text-primary" />;
        }
    };

    // Click Handler for Day Headers
    const handleDayClick = (day: Date) => {
        setSelectedDay(day);
        const dayKey = formatISO(day, { representation: 'date' });
        const element = daySectionRefs.current[dayKey];
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // --- Render ---
    return (
        <div className="space-y-6">
            {/* Error Display */}
            {status === 'failed' && error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Schedule</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Calendar Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <h2 className="text-lg font-medium flex items-center whitespace-nowrap">
                    <CalendarIcon className="mr-2 h-5 w-5 flex-shrink-0" />
                    <span>
                        {format(currentWeekStart, "MMMM d")} - {format(addDays(currentWeekStart, 6), "MMMM d, yyyy")}
                    </span>
                </h2>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <DyraneButton variant="outline" size="sm" onClick={goToPreviousWeek} disabled={status === 'loading'}>
                        <ChevronLeft className="h-4 w-4" /> Previous
                    </DyraneButton>
                    <DyraneButton variant="outline" size="sm" onClick={goToCurrentWeek} disabled={status === 'loading'}>
                        Today
                    </DyraneButton>
                    <DyraneButton variant="outline" size="sm" onClick={goToNextWeek} disabled={status === 'loading'}>
                        Next <ChevronRight className="h-4 w-4" />
                    </DyraneButton>
                </div>
            </div>

            {/* Loading Skeleton or Calendar Day Headers */}
            {status === 'loading' ? (
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-md" />)}
                </div>
            ) : (
                <div className="grid grid-cols-7 gap-1.5 md:gap-2 bg-muted/40 dark:bg-muted/20 p-1.5 md:p-2 rounded-lg"> {/* Added background & padding */}
                    {weekDays.map((day, index) => {
                        const isSelected = selectedDay && isSameDay(day, selectedDay);
                        const todayClass = isToday(day);
                        return (
                            <button // Changed to button for semantics
                                key={index}
                                type="button" // Explicitly set type
                                onClick={() => handleDayClick(day)}
                                className={cn(
                                    "flex flex-col items-center justify-center text-center p-1.5 md:p-2 rounded-md transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
                                    "hover:bg-accent hover:text-accent-foreground",
                                    todayClass ? "bg-primary/5 dark:bg-primary/10" : "bg-background/50 dark:bg-muted/40",
                                    isSelected ? "bg-primary/90 text-primary scale-105 shadow-md ring-2 ring-primary/50 ring-offset-1 dark:ring-offset-background" : "hover:scale-[1.02]", // Enhanced selected style
                                    !isSelected && todayClass && "border border-primary/30", // Border for today if not selected
                                )}
                            >
                                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{format(day, "EEE")}</div> {/* Smaller, uppercase day name */}
                                <div className={cn(
                                    "text-xl md:text-2xl font-bold mt-0.5", // Adjusted size & margin
                                    todayClass && !isSelected ? "text-primary" : "",
                                    isSelected ? "" : "text-foreground/90" // Default text color if not selected
                                )}>
                                    {format(day, "d")}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Loading Skeleton for Events */}
            {status === 'loading' && (
                <div className="space-y-4 mt-6"> {/* Added margin top */}
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                </div>
            )}

            {/* Events List (only show when succeeded) */}
            {status === 'succeeded' && (
                <div className="space-y-6 mt-6"> {/* Added margin top */}
                    {eventsByDay.map(({ date, events: dailyEvents }) => {
                        const shouldRenderDay = dailyEvents.length > 0 || isToday(date) || (selectedDay && isSameDay(date, selectedDay));
                        const dayKey = formatISO(date, { representation: 'date' });

                        return (
                            shouldRenderDay && (
                                <div
                                    key={dayKey}
                                    ref={el => { daySectionRefs.current[dayKey] = el; }}
                                    className="scroll-mt-16 pt-2" // Increased scroll margin top, added padding top
                                >
                                    <h3 className="text-md font-semibold mb-3 sticky top-0 bg-background/95 backdrop-blur-sm py-2 px-1 z-10 border-b -mx-1"> {/* Sticky header with blur */}
                                        {format(date, "EEEE, MMMM d")}
                                        {isToday(date) && <span className="ml-2 text-primary font-semibold">(Today)</span>}
                                    </h3>
                                    {dailyEvents.length > 0 ? (
                                        <motion.div // Animate the list of events for the day
                                            className="space-y-3"
                                            initial="hidden"
                                            animate="visible"
                                            variants={{
                                                visible: { transition: { staggerChildren: 0.07 } },
                                                hidden: {}
                                            }}
                                        >
                                            {dailyEvents.map((event: ScheduleEvent) => ( // Added type annotation
                                                <motion.div
                                                    key={event.id}
                                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-card/5 backdrop-blur-sm hover:shadow-md transition-shadow duration-150"
                                                    variants={{ // Item animation
                                                        hidden: { opacity: 0, y: 15 },
                                                        visible: { opacity: 1, y: 0 }
                                                    }}
                                                >
                                                    {/* Event Details Rendering */}
                                                    <div className="flex items-start gap-3 mb-3 sm:mb-0 flex-grow">
                                                        <div className="bg-primary/10 p-2 rounded-md mt-1 flex-shrink-0">
                                                            {getEventTypeIcon(event.type)}
                                                        </div>
                                                        <div className="flex-grow">
                                                            <h4 className="font-semibold">{event.title}</h4>
                                                            {event.courseTitle && <p className="text-sm text-muted-foreground">{event.courseTitle}</p>}
                                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                                                                {getEventTypeBadge(event.type)}
                                                                <span className="flex items-center"><Clock className="mr-1 h-3 w-3" />{safeFormatTime(event.startTime)} - {safeFormatTime(event.endTime)}</span>
                                                                {event.location && <span className="flex items-center"><MapPin className="mr-1 h-3 w-3" />{event.location}</span>}
                                                                {event.instructor && <span className="flex items-center"><Users className="mr-1 h-3 w-3" />{event.instructor}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Action Buttons */}
                                                    <div className="flex-shrink-0 self-end sm:self-center">
                                                        {/* Use optional chaining for event.courseSlug */}
                                                        {event.meetingLink ? (
                                                            <DyraneButton variant="outline" size="sm" className="whitespace-nowrap" asChild>
                                                                <a href={event.meetingLink} target="_blank" rel="noopener noreferrer">Join Meeting</a>
                                                            </DyraneButton>
                                                        ) : event.courseSlug ? (
                                                            <DyraneButton variant="outline" size="sm" className="whitespace-nowrap" asChild>
                                                                <Link href={`/courses/${event.courseSlug}`}>View Course</Link>
                                                            </DyraneButton>
                                                        ) : event.courseId ? ( // Fallback to courseId if slug missing
                                                            <DyraneButton variant="outline" size="sm" className="whitespace-nowrap" asChild>
                                                                <Link href={`/courses/${event.courseId}`}>View Course</Link>
                                                            </DyraneButton>
                                                        ) : null}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground py-4 italic pl-1">
                                            No classes scheduled for {isToday(date) ? 'today' : 'this day'}.
                                        </p>
                                    )}
                                </div>
                            )
                        );
                    })}
                    {/* Message if no events in the whole week */}
                    {safeLength(events) === 0 && status === 'succeeded' && (
                        <DyraneCard>
                            <CardContent className="p-8 text-center">
                                <p className="text-muted-foreground">No classes found for this week.</p>
                            </CardContent>
                        </DyraneCard>
                    )}
                </div>
            )}
        </div>
    );
}