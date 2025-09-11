// features/schedule/components/timetable/TimetableEventItem.tsx
"use client";

import React from 'react';
import type { ScheduleEvent, ScheduleEventType } from '../../types/schedule-types';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
    Clock,
    Video,
    Users,
    MapPin,
    BookOpen,
    CalendarIcon as EventIcon
} from 'lucide-react';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';

// Helper Function: Safely formats a date string into a time like "8:00 am".
const safeFormatTime = (dateString: string | undefined | null): string => {
    if (!dateString) return "N/A";
    try {
        const date = parseISO(dateString);
        return isValid(date) ? format(date, "h:mm a") : "?";
    } catch {
        return "Err";
    }
};

// Helper Function: Returns a specific icon based on the event's type.
const getEventTypeIcon = (type: ScheduleEventType) => {
    switch (type) {
        case "lecture": return <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
        case "lab": return <Users className="h-5 w-5 text-green-600 dark:text-green-400" />;
        case "exam": return <Clock className="h-5 w-5 text-red-600 dark:text-red-400" />;
        case "office-hours": return <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
        case "meeting": return <Video className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
        default: return <EventIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
};

// Helper Function: Returns a set of Tailwind classes for background and border colors based on the event type.
const getEventTypeBgColor = (type: ScheduleEventType): string => {
    switch (type) {
        case "lecture": return "bg-blue-500/20 border-blue-500/50 hover:border-blue-500/40";
        case "lab": return "bg-green-500/20 border-green-500/50 hover:border-green-500/40";
        case "exam": return "bg-red-500/20 border-red-500/50 hover:border-red-500/40";
        case "office-hours": return "bg-purple-500/20 border-purple-500/50 hover:border-purple-500/40";
        case "meeting": return "bg-indigo-500/20 border-indigo-500/50 hover:border-indigo-500/40";
        default: return "bg-muted/85 border-border hover:border-border/40";
    }
};

// Interface defining the props for our component.
interface TimetableEventItemProps {
    event: ScheduleEvent;
    dayIndex: number;
    top: number;
    height: number;
    colSpan: number;
}

export const TimetableEventItem: React.FC<TimetableEventItemProps> = ({
    event,
    dayIndex,
    top,
    height,
    colSpan,
}) => {
    // Create a descriptive title for the browser's native tooltip.
    const tooltipTitle = `${event.title} (${safeFormatTime(event.startTime)} - ${safeFormatTime(event.endTime)})`;

    const actualColSpan = Math.min(colSpan, 7 - dayIndex);

    const primaryAction = event.meetingLink ? (
        <DyraneButton variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
            <a href={event.meetingLink} target="_blank" rel="noopener noreferrer">Join</a>
        </DyraneButton>
    ) : event.courseSlug ? (
        <DyraneButton variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
            <Link href={`/courses/${event.courseSlug}`}>Details</Link>
        </DyraneButton>
    ) : null;

    return (
        <div
            title={tooltipTitle}
            className={cn(
                "absolute flex p-2 rounded-lg border transition-all duration-150 ease-in-out z-10 hover:z-20 hover:shadow-xl backdrop-blur-md group cursor-pointer",
                getEventTypeBgColor(event.type)
            )}
            style={{
                top: `${top}px`,
                height: `${height}px`,
                gridColumn: `${dayIndex + 1} / span ${actualColSpan}`,
                transform: 'translateX(4px)',
                width: `calc(100% - 8px)`,
            }}
        >
            {/* Icon Column: Only displayed if the event's height is sufficient. */}
            {height > 40 && (
                <div className="flex-shrink-0 pr-2 mr-2 border-r border-gray-500/10">
                    {getEventTypeIcon(event.type)}
                </div>
            )}

            {/* Main Details Column: This will take up the remaining space. */}
            <div className="flex-grow flex flex-col justify-center min-w-0"> {/* `min-w-0` is crucial for text truncation to work inside flexbox. */}
                <h4 className="font-semibold text-sm truncate">{event.title}</h4>

                {/* Responsive Detail: Show course title or location if height allows. */}
                {height > 30 && (
                    <p className="text-xs text-muted-foreground truncate">
                        {event.courseTitle || event.location || 'General Event'}
                    </p>
                )}

                {/* Responsive Detail: Show time and location only if there is a lot of vertical space. */}
                {height > 60 && (
                    <div className="flex items-center gap-x-2 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center"><Clock className="mr-1 h-3 w-3" />{safeFormatTime(event.startTime)}</span>
                        {event.location && <span className="flex items-center truncate"><MapPin className="mr-1 h-3 w-3" />{event.location}</span>}
                    </div>
                )}
            </div>

            {/* Action Button: Appears on the far right, only if height is sufficient and the user is hovering over the event. */}
            {height > 45 && primaryAction && (
                <div className="flex-shrink-0 ml-2 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {primaryAction}
                </div>
            )}
        </div>
    );
};
