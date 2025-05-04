// features/schedule/components/timetable/TimetableEventItem.tsx
import React from 'react';
import type { ScheduleEvent } from '../../types/schedule-types'; // Adjust path
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

// Helper function to safely format time string
const safeFormatTime = (dateString: string | undefined | null): string => {
    if (!dateString) return "N/A";
    try {
        const date = parseISO(dateString);
        if (isValid(date)) { return format(date, "h:mma"); } // Use shorter format for timetable
        return "?";
    } catch { return "Err"; }
};

// Helper to get type-based background color
const getEventTypeBgColor = (type: ScheduleEvent['type']): string => {
    switch (type) {
        case "lecture": return "bg-blue-500/20 border-blue-400 dark:bg-blue-500/30 dark:border-blue-700";
        case "lab": return "bg-green-500/20 border-green-400 dark:bg-green-500/30 dark:border-green-700";
        case "exam": return "bg-red-500/20 border-red-400 dark:bg-red-500/30 dark:border-red-700";
        case "office-hours": return "bg-purple-500/20 border-purple-400 dark:bg-purple-500/30 dark:border-purple-700";
        case "meeting": return "bg-indigo-500/20 border-indigo-400 dark:bg-indigo-500/30 dark:border-indigo-700";
        default: return "bg-muted/50 border-border";
    }
};


interface TimetableEventItemProps {
    event: ScheduleEvent;
    dayIndex: number; // Column index (0-6)
    top: number; // Calculated top position in pixels
    height: number; // Calculated height in pixels
}

export const TimetableEventItem: React.FC<TimetableEventItemProps> = ({
    event,
    dayIndex,
    top,
    height,
}) => {
    const title = `${event.title} (${safeFormatTime(event.startTime)} - ${safeFormatTime(event.endTime)})`;

    return (
        <div
            key={event.id}
            className={cn(
                "absolute text-[10px] leading-tight rounded border p-1 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer z-10", // Base styles
                getEventTypeBgColor(event.type) // Type-specific background/border
            )}
            style={{
                gridColumnStart: dayIndex + 1, // CSS grid column (1-based)
                top: `${top}px`,
                height: `${height}px`,
                left: '2px', // Small offset
                right: '2px',
            }}
            title={title} // Tooltip for full details
        >
            {/* Display more info if height allows */}
            {height > 25 && <p className="font-semibold truncate">{event.title}</p>}
            {(height > 40 || height <= 25) && <p className="text-muted-foreground truncate">{safeFormatTime(event.startTime)}</p>}
            {/* Optionally add link or icon if space permits */}
        </div>
    );
};