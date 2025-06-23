// features/schedule/components/ScheduleView.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, AlertTriangle, Loader2 } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, parseISO, isValid, formatISO, endOfWeek } from "date-fns";
import { DayPickerSingleProps } from "react-day-picker";
import { cn } from "@/lib/utils";
import { safeArray, safeFilter, safeSort } from '@/lib/utils/safe-data';

// Import Slice Actions and Selectors
import {
    fetchSchedule,
    setViewStartDate,
    selectScheduleEvents,
    selectScheduleStatus,
    selectScheduleError,
    selectScheduleViewStartDate,
    clearScheduleError,
} from '../store/schedule-slice'; // Adjust path
import type { ScheduleEvent } from '../types/schedule-types'; // Import types

// Import Modular Components
import { ScheduleHeader } from './ScheduleHeader';
import { ScheduleDatePickerContent } from './ScheduleDatePickerContent';
import { ScheduleListView } from './list/ScheduleListView';
import { ScheduleTimetableView } from './timetable/ScheduleTimetableView';
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";

interface ScheduleViewProps {
    role: string;
    userId?: string;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ role, userId }) => {
    const dispatch = useAppDispatch();
    const events = useAppSelector(selectScheduleEvents);
    const status = useAppSelector(selectScheduleStatus);
    const error = useAppSelector(selectScheduleError);
    const viewStartDateStr = useAppSelector(selectScheduleViewStartDate);

    // --- Core State ---
    const [viewMode, setViewMode] = useState<'list' | 'timetable'>('list');
    // Selected day state is now managed *within* ScheduleListView if needed for scrolling
    // If needed globally (e.g., highlight in timetable), keep it here:
    const [selectedDayForHighlight, setSelectedDayForHighlight] = useState<Date | null>(null);

    // --- Date Picker State ---
    const [popoverOpen, setPopoverOpen] = useState(false);
    // Display month for picker defaults to current week start
    const [displayMonthForPicker, setDisplayMonthForPicker] = useState(() =>
        isValid(parseISO(viewStartDateStr)) ? parseISO(viewStartDateStr) : new Date()
    );

    // --- Derived Date Computations ---
    const currentWeekStart = useMemo(() => {
        try {
            const parsed = parseISO(viewStartDateStr);
            return isValid(parsed) ? startOfWeek(parsed, { weekStartsOn: 1 }) : startOfWeek(new Date(), { weekStartsOn: 1 });
        } catch { return startOfWeek(new Date(), { weekStartsOn: 1 }); }
    }, [viewStartDateStr]);

    const currentWeekEnd = useMemo(() => endOfWeek(currentWeekStart, { weekStartsOn: 1 }), [currentWeekStart]);
    const weekDays = useMemo(() => Array.from({ length: 7 }).map((_, index) => addDays(currentWeekStart, index)), [currentWeekStart]);

    // Sync Picker display month with current week
    useEffect(() => {
        setDisplayMonthForPicker(currentWeekStart);
    }, [currentWeekStart]);

    // --- Data Fetching ---
    useEffect(() => {
        if (role && userId) {
            const startDateISO = formatISO(currentWeekStart, { representation: 'date' });
            const endDateISO = formatISO(currentWeekEnd, { representation: 'date' });
            dispatch(fetchSchedule({ role, userId, startDate: startDateISO, endDate: endDateISO }));
        }
        if (status === 'failed') { // Clear error if status changes away from failed
            dispatch(clearScheduleError());
        }
    }, [dispatch, role, userId, viewStartDateStr, currentWeekStart, currentWeekEnd]); // Rerun if view changes


    // Use safe utility functions for data handling

    // --- Data Grouping for List View ---
    const eventsByDay = useMemo(() => {
        return weekDays.map(day => ({
            date: day,
            events: safeSort(
                safeFilter<ScheduleEvent>(events, event => {
                    try {
                        if (!event || !event.startTime) return false;
                        const eventDate = parseISO(event.startTime);
                        return isValid(eventDate) && isSameDay(eventDate, day);
                    } catch { return false; }
                }),
                (a, b) => {
                    try {
                        return parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime();
                    } catch {
                        return 0;
                    }
                }
            )
        }));
    }, [events, weekDays]);


    // --- Event Handlers ---
    const goToPreviousWeek = () => dispatch(setViewStartDate(formatISO(subWeeks(currentWeekStart, 1), { representation: 'date' })));
    const goToNextWeek = () => dispatch(setViewStartDate(formatISO(addWeeks(currentWeekStart, 1), { representation: 'date' })));
    const goToCurrentWeek = () => dispatch(setViewStartDate(formatISO(startOfWeek(new Date(), { weekStartsOn: 1 }), { representation: 'date' })));

    const handlePickerSelect: DayPickerSingleProps['onSelect'] = (selectedDate) => {
        if (selectedDate) {
            const weekStartOfSelected = startOfWeek(selectedDate, { weekStartsOn: 1 });
            dispatch(setViewStartDate(formatISO(weekStartOfSelected, { representation: 'date' })));
            setSelectedDayForHighlight(selectedDate); // Update highlighted day
            setPopoverOpen(false);
        }
    };

    const handleListViewDayClick = (day: Date) => {
        setSelectedDayForHighlight(day); // Update highlight
        // Scrolling logic is now inside ScheduleListView
    }
    // --- End Event Handlers ---


    // --- Validation Check ---
    if (!role || (role !== 'admin' && !userId)) {
        return (
            <Alert variant="default" className="m-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Missing Information</AlertTitle>
                <AlertDescription>User context (role/ID) is required to display the schedule.</AlertDescription>
            </Alert>
        );
    }

    // --- Date Picker Trigger Element ---
    const datePickerTrigger = (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <DyraneButton variant="outline" size="icon" aria-label="Select Month and Year">
                    <CalendarIcon className="h-4 w-4" />
                </DyraneButton>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background/80 backdrop-blur-sm border">
                {/* Render the date picker content component */}
                <ScheduleDatePickerContent
                    displayMonth={displayMonthForPicker}
                    setDisplayMonth={setDisplayMonthForPicker}
                    onDateSelect={handlePickerSelect}
                    selectedDate={selectedDayForHighlight as Date || undefined} // Pass selected day for visual feedback
                // Allow selection of future dates for schedule planning
                />
            </PopoverContent>
        </Popover>
    );
    // --- End Date Picker Trigger ---


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

            {/* Header */}
            <ScheduleHeader
                currentWeekStart={currentWeekStart}
                currentWeekEnd={currentWeekEnd}
                onPreviousWeek={goToPreviousWeek}
                onNextWeek={goToNextWeek}
                onGoToToday={goToCurrentWeek}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                datePickerTrigger={datePickerTrigger} // Pass the trigger element
                isLoading={status === 'loading'}
            />

            {/* Content Area */}
            <div className="mt-6">
                {status === 'loading' && (
                    <div className="mt-6 space-y-4">
                        <Skeleton className="h-12 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                    </div>
                )}
                {status === 'succeeded' && viewMode === 'list' && (
                    <ScheduleListView
                        eventsByDay={eventsByDay}
                        selectedDay={selectedDayForHighlight}
                        weekDays={weekDays}
                        onDayClick={handleListViewDayClick}
                    />
                )}
                {status === 'succeeded' && viewMode === 'timetable' && (
                    <ScheduleTimetableView
                        events={events} // Pass flat events list
                        weekDays={weekDays}
                    />
                )}
                {/* Consider adding an 'idle' state message if needed */}
            </div>
        </div>
    );
}

export default ScheduleView;