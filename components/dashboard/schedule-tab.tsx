// components/dashboard/schedule-tab.tsx

"use client";

import React, { useState, useEffect, useMemo } from "react"; // Import React and useMemo
import { motion } from "framer-motion";
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card";
import { CardContent } from "@/components/ui/card";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { useAppSelector, useAppDispatch } from "@/store/hooks"; // Import useDispatch
import { CalendarIcon, Clock, Video, Users, MapPin, BookOpen, ChevronLeft, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react'; // Import necessary icons
import {
    format,
    startOfWeek,
    addDays,
    isSameDay,
    addWeeks,
    subWeeks,
    isToday,
    parseISO, // Import parseISO
    isValid,   // Import isValid
    formatISO
} from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

import {
    fetchSchedule, // Import the thunk
    setViewStartDate, // Import action to change week
    selectScheduleEvents,
    selectScheduleStatus,
    selectScheduleError,
    selectScheduleViewStartDate,
    clearScheduleError,
} from '@/features/schedule/store/schedule-slice';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


// Helper function to safely format time string (can be moved to lib/utils)
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
    // Select data from the schedule slice
    const events = useAppSelector(selectScheduleEvents);
    const status = useAppSelector(selectScheduleStatus);
    const error = useAppSelector(selectScheduleError);
    const viewStartDateStr = useAppSelector(selectScheduleViewStartDate); // YYYY-MM-DD string

    // Use state for the start of the week being viewed, controlled by Redux action
    const currentWeekStart = useMemo(() => {
        try {
            const parsed = parseISO(viewStartDateStr);
            return isValid(parsed) ? startOfWeek(parsed, { weekStartsOn: 1 }) : startOfWeek(new Date(), { weekStartsOn: 1 });
        } catch {
            return startOfWeek(new Date(), { weekStartsOn: 1 }); // Fallback
        }
    }, [viewStartDateStr]);


    // Fetch schedule data when the component mounts or dependencies change
    useEffect(() => {
        if (user?.id && user.role && status === 'idle') { // Fetch only if idle and user details available
            console.log("Dashboard ScheduleTab: Fetching schedule...");
            dispatch(fetchSchedule({ role: user.role, userId: user.id }));
        }
        // Clear error on mount
        dispatch(clearScheduleError());
    }, [dispatch, user?.id, user?.role, status]); // Dependencies for initial fetch


    // Refetch when viewStartDateStr changes (week navigation)
    useEffect(() => {
        if (user?.id && user.role) {
            console.log("Dashboard ScheduleTab: Refetching schedule for new week...");
            // Always refetch when week changes for simplicity, or add logic to check if data for that week exists
            dispatch(fetchSchedule({ role: user.role, userId: user.id }));
        }
    }, [viewStartDateStr, dispatch, user?.id, user?.role]);


    if (!user) return null; // Or a login prompt

    // --- Navigation Handlers --- (Dispatch actions instead of setting local state)
    const goToPreviousWeek = () => {
        const newStartDate = subWeeks(currentWeekStart, 1);
        dispatch(setViewStartDate(formatISO(newStartDate, { representation: 'date' })));
    };
    const goToNextWeek = () => {
        const newStartDate = addWeeks(currentWeekStart, 1);
        dispatch(setViewStartDate(formatISO(newStartDate, { representation: 'date' })));
    };
    const goToCurrentWeek = () => {
        const newStartDate = startOfWeek(new Date(), { weekStartsOn: 1 });
        dispatch(setViewStartDate(formatISO(newStartDate, { representation: 'date' })));
    };

    // --- Data Processing (moved inside useMemo for performance) ---
    const weekDays = useMemo(() => Array.from({ length: 7 }).map((_, index) => addDays(currentWeekStart, index)), [currentWeekStart]);

    const eventsByDay = useMemo(() => {
        const weekEnd = addDays(currentWeekStart, 7);
        // Filter events based on the current view window (derived from currentWeekStart)
        const weekEvents = events.filter(event => {
            try {
                const eventDate = parseISO(event.startTime);
                return isValid(eventDate) && eventDate >= currentWeekStart && eventDate < weekEnd;
            } catch { return false; }
        });

        return weekDays.map(day => ({
            date: day,
            events: weekEvents.filter(event => {
                try {
                    const eventDate = parseISO(event.startTime);
                    return isValid(eventDate) && isSameDay(eventDate, day);
                } catch { return false; }
            }).sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime())
        }));
    }, [events, weekDays, currentWeekStart]);


    // --- START: Badge/Icon Helper Functions ---
    const getEventTypeBadge = (type: string) => {
        switch (type) {
            case "lecture":
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
                        <BookOpen className="mr-1 h-3 w-3" />
                        Lecture
                    </Badge>
                );
            case "lab":
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                        <Users className="mr-1 h-3 w-3" />
                        Lab
                    </Badge>
                );
            case "exam":
                return (
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700">
                        <Clock className="mr-1 h-3 w-3" />
                        Exam
                    </Badge>
                );
            case "office-hours":
                return (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700">
                        <Users className="mr-1 h-3 w-3" />
                        Office Hours
                    </Badge>
                );
            case "meeting": // Example for meeting
                return (
                    <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700">
                        <Video className="mr-1 h-3 w-3" />
                        Meeting
                    </Badge>
                );
            default:
                return (
                    <Badge variant="secondary">
                        {type.charAt(0).toUpperCase() + type.slice(1)} {/* Capitalize unknown type */}
                    </Badge>
                );
        }
    };

    const getEventTypeIcon = (type: string) => {
        switch (type) {
            case "lecture": return <BookOpen className="h-5 w-5 text-primary" />;
            case "lab": return <Users className="h-5 w-5 text-primary" />;
            case "exam": return <Clock className="h-5 w-5 text-primary" />;
            case "office-hours": return <Users className="h-5 w-5 text-primary" />;
            case "meeting": return <Video className="h-5 w-5 text-primary" />;
            default: return <CalendarIcon className="h-5 w-5 text-primary" />;
        }
    };
    // --- END: Badge/Icon Helper Functions ---

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

            {/* Loading Skeleton for Calendar Grid */}
            {status === 'loading' && (
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-md" />)}
                </div>
            )}

            {/* Weekly Calendar Day Headers (only show when not loading) */}
            {status !== 'loading' && (
                <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day, index) => (
                        <div key={index} className={cn("text-center p-2 rounded-md", isToday(day) ? "bg-primary/10" : "")}>
                            <div className="text-sm font-medium">{format(day, "EEE")}</div>
                            <div className={cn("text-2xl", isToday(day) ? "text-primary font-bold" : "")}>{format(day, "d")}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Loading Skeleton for Events */}
            {status === 'loading' && (
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                </div>
            )}

            {/* Events List (only show when succeeded) */}
            {status === 'succeeded' && (
                <div className="space-y-6">
                    {eventsByDay.map(({ date, events: dailyEvents }, index) => (
                        (dailyEvents.length > 0 || isToday(date)) && ( // Render day section if events exist or it's today
                            <div key={index}>
                                <h3 className="text-md font-medium mb-3 sticky top-0 bg-background/95 py-2 z-10 border-b">
                                    {format(date, "EEEE, MMMM d")}
                                    {isToday(date) && <span className="ml-2 text-primary font-semibold">(Today)</span>}
                                </h3>
                                {dailyEvents.length > 0 ? (
                                    <div className="space-y-3">
                                        {dailyEvents.map(event => (
                                            <motion.div
                                                key={event.id}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                                            >
                                                {/* --- Event Details Rendering (same as ScheduleView) --- */}
                                                <div className="flex items-start gap-3 mb-3 sm:mb-0 flex-grow">
                                                    <div className="bg-primary/10 p-2 rounded-md mt-1">{getEventTypeIcon(event.type)}</div>
                                                    <div className="flex-grow">
                                                        <h3 className="font-medium">{event.title}</h3>
                                                        {event.courseTitle && <p className="text-sm text-muted-foreground">{event.courseTitle}</p>}
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                                                            {getEventTypeBadge(event.type)}
                                                            <span className="flex items-center"><Clock className="mr-1 h-3 w-3" />{safeFormatTime(event.startTime)} - {safeFormatTime(event.endTime)}</span>
                                                            {event.location && <span className="flex items-center"><MapPin className="mr-1 h-3 w-3" />{event.location}</span>}
                                                            {event.instructor && <span className="flex items-center"><Users className="mr-1 h-3 w-3" />{event.instructor}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0 self-end sm:self-center">
                                                    {event.meetingLink ? (
                                                        <DyraneButton variant="outline" size="sm" className="whitespace-nowrap" asChild>
                                                            <a href={event.meetingLink} target="_blank" rel="noopener noreferrer">Join Meeting</a>
                                                        </DyraneButton>
                                                    ) : event.courseSlug ? (
                                                        <DyraneButton variant="outline" size="sm" className="whitespace-nowrap" asChild>
                                                            {/* TODO: Link to specific course page */}
                                                            <Link href={`/courses/${event.courseSlug}`}>View Course</Link>
                                                        </DyraneButton>
                                                    ) : null}
                                                </div>

                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground py-4 italic">No events scheduled for {isToday(date) ? 'today' : 'this day'}.</p>
                                )}
                            </div>
                        )
                    ))}
                    {/* Message if no events in the whole week */}
                    {events.length === 0 && (
                        <DyraneCard>
                            <CardContent className="p-8 text-center">
                                <p className="text-muted-foreground">No events found for this week.</p>
                            </CardContent>
                        </DyraneCard>
                    )}
                </div>
            )}
        </div>
    );
}