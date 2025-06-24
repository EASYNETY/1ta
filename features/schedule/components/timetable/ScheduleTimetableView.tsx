// features/schedule/components/timetable/ScheduleTimetableView.tsx
import React, { useMemo } from 'react';
import { format, parseISO, isValid, isToday, setYear, setMonth, setDay, differenceInMinutes, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { safeArray, safeFilter, safeMap, safeParseDate, safeFormatDate } from '@/lib/utils/safe-data';
import type { ScheduleEvent } from '../../types/schedule-types'; // Adjust path
import { TimetableEventItem } from './TimetableEventItem'; // Import the item component

interface ScheduleTimetableViewProps {
    events: ScheduleEvent[];
    weekDays: Date[]; // Dates for the current week
}

// Define timetable display range
const TIMETABLE_START_HOUR = 7; // 7 AM
const TIMETABLE_END_HOUR = 20; // 8 PM (inclusive hour, grid ends after this)
const HOUR_HEIGHT_PX = 60; // Height for one hour slot

export const ScheduleTimetableView: React.FC<ScheduleTimetableViewProps> = ({
    events,
    weekDays,
}) => {

    const timetableHours = useMemo(() => {
        return Array.from({ length: TIMETABLE_END_HOUR - TIMETABLE_START_HOUR + 1 }, (_, i) => TIMETABLE_START_HOUR + i);
    }, []);

    // --- Event Positioning Logic ---
    const getEventPositionAndDuration = (event: ScheduleEvent): { top: number; height: number } => {
        const minuteHeight = HOUR_HEIGHT_PX / 60;
        const defaultResult = { top: 0, height: HOUR_HEIGHT_PX }; // Default fallback

        try {
            if (!event || !event.startTime || !event.endTime) return defaultResult;

            // Use safe date parsing
            const startTime = safeParseDate(event.startTime, new Date());
            const endTime = safeParseDate(event.endTime, new Date());

            // Validate dates
            if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) return defaultResult;

            // Minutes from the very start of the day (00:00)
            const startMinutesFromDayStart = startTime.getHours() * 60 + startTime.getMinutes();
            const eventDurationMinutes = differenceInMinutes(endTime, startTime);

            // Validate duration (prevent negative durations)
            if (eventDurationMinutes <= 0) return defaultResult;

            // Calculate offset from the timetable's visual start hour
            const offsetMinutesFromViewStart = startMinutesFromDayStart - (TIMETABLE_START_HOUR * 60);

            const top = Math.max(0, offsetMinutesFromViewStart * minuteHeight); // Ensure top isn't negative
            const height = Math.max(15, eventDurationMinutes * minuteHeight); // Minimum height 15px

            return { top, height };

        } catch (error) {
            console.error("Error calculating event position:", error);
            return defaultResult; // Fallback
        }
    };
    // --- End Event Positioning ---


    return (
        <div className="border rounded-lg overflow-hidden bg-card/5 backdrop-blur-sm">
            <div className="grid grid-cols-[auto,repeat(7,1fr)]"> {/* Time col + 7 Day cols */}
                {/* Header Row */}
                <div className="sticky top-0 z-20 bg-muted border-b border-r h-16 flex items-center justify-center"> {/* Corner */}
                    <span className="text-xs font-semibold text-muted-foreground">Time</span>
                </div>
                {weekDays.map(day => (
                    <div key={format(day, 'yyyy-MM-dd')} className="sticky top-0 z-20 bg-muted border-b border-r p-2 text-center last:border-r-0">
                        <div className="text-xs font-semibold uppercase text-muted-foreground">{format(day, 'EEE')}</div>
                        <div className={cn("text-xl font-bold", isToday(day) && "text-primary")}>{format(day, 'd')}</div>
                    </div>
                ))}

                {/* Time Slots and Events Grid */}
                <div className="row-start-2 col-start-1 border-r grid"> {/* Time Column */}
                    {timetableHours.map(hour => (
                        <div key={hour} className="h-[60px] border-b text-right pr-2 pt-0.5 text-[10px] text-muted-foreground relative">
                            {/* Line at the top of the hour slot */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-border"></div>
                            {/* Time label */}
                            <span>{format(new Date(0, 0, 0, hour), 'ha')}</span>
                        </div>
                    ))}
                    {/* Add an extra border at the bottom */}
                    <div className="h-0 border-b"></div>
                </div>
                {/* Event Area Grid (7 columns) */}
                <div className="row-start-2 col-start-2 col-span-7 grid grid-cols-7 relative">
                    {/* Background Grid Lines */}
                    {weekDays.map((day, dayIndex) => (
                        <div key={dayIndex} className={cn("border-r relative", dayIndex === 6 && "border-r-0")}>
                            {timetableHours.map((_, hourIndex) => (
                                <div key={hourIndex} className="h-[60px] border-b"></div>
                            ))}
                            {/* Add an extra border at the bottom */}
                            <div className="h-0 border-b"></div>
                        </div>
                    ))}

                    {/* Absolutely Positioned Events */}
                    {safeMap(safeFilter(events, event => {
                        try {
                            if (!event || !event.startTime) return false;

                            // Use safe date parsing
                            const eventDate = safeParseDate(event.startTime);
                            if (isNaN(eventDate.getTime())) return false;

                            // Check if event is in current week
                            const dayIndex = weekDays.findIndex(d => isSameDay(d, eventDate));
                            return dayIndex !== -1; // Only include events in the current week
                        } catch (error) {
                            console.error("Error filtering event:", error);
                            return false;
                        }
                    }), event => {
                        // Use safe date parsing for the event date
                        const eventDate = safeParseDate(event.startTime);

                        // Find which day column this event belongs to
                        const dayIndex = weekDays.findIndex(d => isSameDay(d, eventDate));

                        // Get positioning information
                        const { top, height } = getEventPositionAndDuration(event);

                        return (
                            <TimetableEventItem
                                key={event.id || `event-${dayIndex}-${top}`} // Fallback key if id is missing
                                event={event}
                                dayIndex={dayIndex}
                                top={top}
                                height={height}
                                colSpan={3}
                            />
                        );
                    })}
                </div>

            </div>
        </div>
    );
};