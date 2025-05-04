// features/schedule/components/list/ScheduleEventCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock, Video, Users, MapPin, BookOpen, CalendarIcon as EventIcon } from 'lucide-react'; // Use EventIcon alias
import { Badge } from '@/components/ui/badge';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import type { ScheduleEvent, ScheduleEventType } from '../../types/schedule-types'; // Adjust path
import { format, parseISO, isValid } from 'date-fns';

// Helper function to safely format time string
const safeFormatTime = (dateString: string | undefined | null): string => {
    if (!dateString) return "N/A";
    try {
        const date = parseISO(dateString);
        if (isValid(date)) { return format(date, "h:mm a"); }
        return "Invalid Time";
    } catch { return "Error"; }
};

// Type specific badge/icon logic (can be moved to utils)
const getEventTypeBadge = (type: ScheduleEventType) => {
    switch (type) {
        case "lecture": return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"><BookOpen className="mr-1 h-3 w-3" />Lecture</Badge>;
        case "lab": return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"><Users className="mr-1 h-3 w-3" />Lab</Badge>;
        case "exam": return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"><Clock className="mr-1 h-3 w-3" />Exam</Badge>;
        case "office-hours": return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700"><Users className="mr-1 h-3 w-3" />Office Hours</Badge>;
        case "meeting": return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700"><Video className="mr-1 h-3 w-3" />Meeting</Badge>;
        default: return <Badge variant="secondary">{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>;
    }
};

const getEventTypeIcon = (type: ScheduleEventType) => {
    switch (type) {
        case "lecture": return <BookOpen className="h-5 w-5 text-primary" />;
        case "lab": return <Users className="h-5 w-5 text-primary" />;
        case "exam": return <Clock className="h-5 w-5 text-primary" />;
        case "office-hours": return <Users className="h-5 w-5 text-primary" />;
        case "meeting": return <Video className="h-5 w-5 text-primary" />;
        default: return <EventIcon className="h-5 w-5 text-primary" />;
    }
};

interface ScheduleEventCardProps {
    event: ScheduleEvent;
}

export const ScheduleEventCard: React.FC<ScheduleEventCardProps> = ({ event }) => {
    const variants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    };

    // Determine primary link/action
    const primaryAction = event.meetingLink ? (
        <DyraneButton variant="outline" size="sm" className="whitespace-nowrap" asChild>
            <a href={event.meetingLink} target="_blank" rel="noopener noreferrer">Join Meeting</a>
        </DyraneButton>
    ) : event.courseSlug ? (
        <DyraneButton variant="outline" size="sm" className="whitespace-nowrap" asChild>
            <Link href={`/courses/${event.courseSlug}`}>View Course</Link>
        </DyraneButton>
    ) : event.courseId ? ( // Fallback to courseId
        <DyraneButton variant="outline" size="sm" className="whitespace-nowrap" asChild>
            <Link href={`/courses/${event.courseId}`}>View Course</Link>
        </DyraneButton>
    ) : null;


    return (
        <motion.div
            variants={variants}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-card/5 backdrop-blur-sm hover:shadow-md transition-shadow duration-150"
        >
            {/* Event Details */}
            <div className="flex items-start gap-3 mb-3 sm:mb-0 flex-grow">
                <div className="bg-primary/10 p-2 rounded-md mt-1 flex-shrink-0">
                    {getEventTypeIcon(event.type)}
                </div>
                <div className="flex-grow min-w-0"> {/* Added min-w-0 */}
                    <h4 className="font-semibold truncate">{event.title}</h4>
                    {event.courseTitle && <p className="text-sm text-muted-foreground truncate">{event.courseTitle}</p>}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                        {getEventTypeBadge(event.type)}
                        <span className="flex items-center whitespace-nowrap"><Clock className="mr-1 h-3 w-3" />{safeFormatTime(event.startTime)} - {safeFormatTime(event.endTime)}</span>
                        {event.location && <span className="flex items-center truncate"><MapPin className="mr-1 h-3 w-3 flex-shrink-0" />{event.location}</span>}
                        {event.instructor && <span className="flex items-center truncate"><Users className="mr-1 h-3 w-3 flex-shrink-0" />{event.instructor}</span>}
                    </div>
                </div>
            </div>
            {/* Action Button */}
            {primaryAction && (
                <div className="flex-shrink-0 self-end sm:self-center">
                    {primaryAction}
                </div>
            )}
        </motion.div>
    );
};