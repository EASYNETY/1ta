// features/schedule/components/list/ScheduleListView.tsx
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isSameDay, formatISO } from 'date-fns';
import { DyraneCard } from '@/components/dyrane-ui/dyrane-card';
import { CardContent } from '@/components/ui/card';
import { ScheduleEventCard } from './ScheduleEventCard'; // Import the event card
import type { ScheduleEvent } from '../../types/schedule-types'; // Adjust path
import { cn } from '@/lib/utils';

interface EventsByDay {
    date: Date;
    events: ScheduleEvent[];
}

interface ScheduleListViewProps {
    eventsByDay: EventsByDay[];
    selectedDay: Date | null;
    weekDays: Date[]; // Pass weekdays for header rendering
    onDayClick: (day: Date) => void; // Callback for clicking day headers
}

export const ScheduleListView: React.FC<ScheduleListViewProps> = ({
    eventsByDay,
    selectedDay,
    weekDays,
    onDayClick,
}) => {
    const daySectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // Scroll to selected day (if applicable) - Keep this logic here
    useEffect(() => {
        if (selectedDay) {
            const dayKey = formatISO(selectedDay, { representation: 'date' });
            const element = daySectionRefs.current[dayKey];
            // Timeout helps ensure element is rendered before scrolling
            setTimeout(() => {
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [selectedDay]);


    return (
        <>
            {/* Optional: Day Headers (can be hidden/shown based on screen size or preference) */}
            <div className="hidden md:grid grid-cols-7 gap-1.5 md:gap-2 bg-muted/40 dark:bg-muted/20 p-1.5 md:p-2 rounded-lg mb-6">
                {weekDays.map((day, index) => {
                    const isSelected = selectedDay && isSameDay(day, selectedDay);
                    const todayClass = isToday(day);
                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={() => onDayClick(day)}
                            className={cn(
                                "flex flex-col items-center justify-center text-center p-1.5 md:p-2 rounded-md transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
                                "hover:bg-accent hover:text-accent-foreground",
                                todayClass ? "bg-primary/5 dark:bg-primary/10" : "bg-background/50 dark:bg-muted/40",
                                isSelected ? "bg-primary text-primary-foreground scale-105 shadow-md ring-2 ring-primary/50 ring-offset-1 dark:ring-offset-background" : "hover:scale-[1.02]",
                                !isSelected && todayClass && "border border-primary/30",
                            )}
                        >
                            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{format(day, "EEE")}</div>
                            <div className={cn(
                                "text-xl md:text-2xl font-bold mt-0.5",
                                todayClass && !isSelected ? "text-primary" : "",
                                isSelected ? "" : "text-foreground/90"
                            )}>
                                {format(day, "d")}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Events List */}
            <div className="space-y-6">
                {eventsByDay.map(({ date, events: dailyEvents }) => {
                    // Determine if the day section should render (has events, is today, or is selected)
                    const shouldRenderDay = dailyEvents.length > 0 || isToday(date) || (selectedDay && isSameDay(date, selectedDay));
                    const dayKey = formatISO(date, { representation: 'date' });

                    return (
                        shouldRenderDay && (
                            <div
                                key={dayKey}
                                ref={el => { daySectionRefs.current[dayKey] = el; }}
                                className="scroll-mt-16 pt-2" // scroll-mt for sticky header offset
                            >
                                {/* Sticky Day Header */}
                                <h3 className="text-md font-semibold mb-3 sticky top-0 bg-background/95 backdrop-blur-sm py-2 px-1 z-10 border-b -mx-1">
                                    {format(date, "EEEE, MMMM d")}
                                    {isToday(date) && <span className="ml-2 text-primary font-semibold">(Today)</span>}
                                </h3>
                                {dailyEvents.length > 0 ? (
                                    <motion.div
                                        className="space-y-3"
                                        initial="hidden"
                                        animate="visible"
                                        variants={{
                                            visible: { transition: { staggerChildren: 0.07 } },
                                            hidden: {}
                                        }}
                                    >
                                        {dailyEvents.map((event) => (
                                            <ScheduleEventCard key={event.id} event={event} />
                                        ))}
                                    </motion.div>
                                ) : (
                                    <p className="text-sm text-muted-foreground py-4 italic pl-1">
                                        No scheduled events for {isToday(date) ? 'today' : 'this day'}.
                                    </p>
                                )}
                            </div>
                        )
                    );
                })}
                {/* Display message if no events at all for the week */}
                {eventsByDay.every(day => day.events.length === 0) && (
                    <DyraneCard>
                        <CardContent className="p-8 text-center">
                            <p className="text-muted-foreground">No events found for this week.</p>
                        </CardContent>
                    </DyraneCard>
                )}
            </div>
        </>
    );
};