// features/schedule/components/manage/ScheduleEventTableRow.tsx
import Link from 'next/link';
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button'; // DyraneButton is used
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import type { ScheduleEvent, ScheduleEventType } from '../../types/schedule-types'; // Ensure this type uses snake_case
import { format, parseISO, isValid } from 'date-fns';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';

interface ScheduleEventTableRowProps {
    event: ScheduleEvent; // Expecting ScheduleEvent with snake_case fields
    onDelete: (eventId: string, eventTitle: string) => Promise<void> | void;
    isDeleting: boolean;
}

// Helper function to safely format time string
const safeFormatTime = (dateString?: string | null): string => {
    if (!dateString) return "N/A";
    try {
        const date = parseISO(dateString);
        return isValid(date) ? format(date, "p") : "Invalid"; // 'p' for localized time, e.g., 1:00 PM
    } catch { return "Error"; }
};

const safeFormatDate = (dateString?: string | null): string => {
    if (!dateString) return "N/A";
    try {
        const date = parseISO(dateString);
        return isValid(date) ? format(date, "MMM d, yyyy") : "Invalid"; // e.g., Jul 16, 2024
    } catch { return "Error"; }
}

// Badge styling based on event type
const getEventTypeBadgeVariant = (type?: ScheduleEventType) => {
    switch (type) {
        case 'lecture': return 'default';
        case 'lab': return 'secondary';
        case 'exam': return 'destructive';
        case 'office-hours': return 'outline'; // Or a specific color like 'info' if you have it
        case 'meeting': return 'default'; // Consider 'warning' or another distinct color
        default: return 'secondary';
    }
};

const EventTypeBadge = ({ type }: { type?: ScheduleEventType }) => {
    if (!type) return <Badge variant="secondary">N/A</Badge>;
    return (
        <Badge variant={getEventTypeBadgeVariant(type)} className="capitalize text-xs px-2 py-0.5">
            {type.replace('-', ' ')}
        </Badge>
    );
};


export function ScheduleEventTableRow({ event, onDelete, isDeleting }: ScheduleEventTableRowProps) {

    const deleteDescription = (
        <>This action cannot be undone. This will permanently delete the event <strong>{event.title}</strong>.</>
    );

    // Directly use snake_case fields from the event object
    // Prefer denormalized names for concise display in a table row
    const courseDisplay = event.course_title || event.course_name || (event.course?.name ? `Course: ${event.course.name}` : null);
    const classDisplay = event.class_name || (event.class?.name ? `Class: ${event.class.name}` : `Class ID: ${event.class_id}`);
    const instructorDisplay = event.instructor_name || event.instructorUser?.name || event.instructor;


    // Determine what to show in the "Course/Class" column
    let courseClassText = "N/A";
    if (courseDisplay) {
        courseClassText = courseDisplay;
    } else if (classDisplay) { // If no course title, show class name/ID
        courseClassText = classDisplay;
    } else if (event.class_id) { // Fallback to class_id if no names
        courseClassText = `Class ID: ${event.class_id}`;
    }


    return (
        <TableRow key={event.id}> {/* Added key prop */}
            <TableCell className="font-medium truncate max-w-xs pr-2">{event.title}</TableCell>
            <TableCell><EventTypeBadge type={event.type} /></TableCell>
            <TableCell className="whitespace-nowrap">{safeFormatDate(event.start_time)}</TableCell>
            <TableCell className="whitespace-nowrap">
                {event.start_time_formatted && event.end_time_formatted ? (
                    `${event.start_time_formatted.split(', ')[1]} - ${event.end_time_formatted.split(', ')[1]}` // Extract time part
                ) : (
                    `${safeFormatTime(event.start_time)} - ${safeFormatTime(event.end_time)}`
                )}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">
                {courseClassText}
            </TableCell>
            <TableCell className="truncate max-w-[150px]">{instructorDisplay || 'N/A'}</TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <DyraneButton variant="ghost" size="icon" className="h-8 w-8 p-0" disabled={isDeleting}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </DyraneButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/manage-schedule/${event.id}`}><Eye className="mr-2 h-4 w-4" /> View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/manage-schedule/${event.id}/edit`}><Pencil className="mr-2 h-4 w-4" /> Edit Event</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <ConfirmationDialog
                            title="Delete Event?"
                            description={deleteDescription}
                            confirmText="Delete"
                            variant="destructive"
                            onConfirm={() => onDelete(event.id, event.title)}
                            confirmDisabled={isDeleting}
                            trigger={
                                <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()} // Prevents closing menu on select
                                    className="flex items-center text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/30 cursor-pointer"
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            }
                        />
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}