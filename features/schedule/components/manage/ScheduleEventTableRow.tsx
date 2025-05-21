// features/schedule/components/manage/ScheduleEventTableRow.tsx
import Link from 'next/link';
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { MoreHorizontal, Eye, Pencil, Trash2, BookOpen, Users, Clock, Video } from 'lucide-react'; // Use Trash2
import type { ScheduleEvent, ScheduleEventType } from '../../types/schedule-types';
import { format, parseISO, isValid } from 'date-fns';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';

interface ScheduleEventTableRowProps {
    event: ScheduleEvent;
    onDelete: (eventId: string, eventTitle: string) => Promise<void> | void;
    isDeleting: boolean;
}

// Helper function to safely format time string
const safeFormatTime = (dateString: string | undefined | null): string => {
    if (!dateString) return "N/A";
    try {
        const date = parseISO(dateString);
        return isValid(date) ? format(date, "h:mm a") : "Invalid";
    } catch { return "Error"; }
};
const safeFormatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "N/A";
    try {
        const date = parseISO(dateString);
        return isValid(date) ? format(date, "MMM d, yyyy") : "Invalid";
    } catch { return "Error"; }
}

// Badge/Icon helpers (copied or imported from list view)
const getEventTypeBadge = (type: ScheduleEventType) => {
    switch (type) {
        case "lecture": return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">Lecture</Badge>;
        case "lab": return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">Lab</Badge>;
        case "exam": return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700">Exam</Badge>;
        case "office-hours": return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700">Office Hours</Badge>;
        case "meeting": return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700">Meeting</Badge>;
        default: return <Badge variant="secondary">{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>;
    }
};


export function ScheduleEventTableRow({ event, onDelete, isDeleting }: ScheduleEventTableRowProps) {

    const deleteDescription = (
        <>This action cannot be undone. This will permanently delete the event <strong>{event.title}</strong>.</>
    );

    // Handle both camelCase and snake_case field names from API
    const startTime = event.startTime || event.start_time;
    const endTime = event.endTime || event.end_time;
    const courseTitle = event.courseTitle || event.course_title;
    const classId = event.classId || event.class_id;

    return (
        <TableRow>
            <TableCell className="font-medium">{event.title}</TableCell>
            <TableCell>{getEventTypeBadge(event.type)}</TableCell>
            <TableCell>{safeFormatDate(startTime)}</TableCell>
            <TableCell className="whitespace-nowrap">{safeFormatTime(startTime)} - {safeFormatTime(endTime)}</TableCell>
            <TableCell className="text-xs text-muted-foreground truncate">
                {courseTitle || classId || 'N/A'}
            </TableCell>
            <TableCell>{event.instructor || 'N/A'}</TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <DyraneButton variant="ghost" size="icon" className="h-8 w-8 p-0" disabled={isDeleting}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </DyraneButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/manage-schedule/${event.id}`}><Eye className="mr-2 h-4 w-4" /> View</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/manage-schedule/${event.id}/edit`}><Pencil className="mr-2 h-4 w-4" /> Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <ConfirmationDialog
                            title="Delete Event?"
                            description={deleteDescription}
                            confirmText="Delete"
                            variant="destructive"
                            onConfirm={() => onDelete(event.id, event.title)}
                            confirmDisabled={isDeleting} // Disable confirm while deleting
                            trigger={
                                <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="flex items-center text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                    disabled={isDeleting} // Disable trigger item too
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