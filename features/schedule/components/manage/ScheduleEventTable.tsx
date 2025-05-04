// features/schedule/components/manage/ScheduleEventTable.tsx
import type { ScheduleEvent } from '../../types/schedule-types';
import { ScheduleEventTableRow } from './ScheduleEventTableRow'; // NEW Component
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ScheduleEventTableProps {
    events: ScheduleEvent[];
    onDeleteEvent: (eventId: string, eventTitle: string) => Promise<void> | void;
    isDeleting: boolean; // To disable actions while delete is in progress
}

export function ScheduleEventTable({ events, onDeleteEvent, isDeleting }: ScheduleEventTableProps) {

    const safeEvents = Array.isArray(events) ? events : [];


    return (
        <div className="border rounded-md">
            <Table className='bg-background/5 backdrop-blur-sm'>
                <TableHeader>
                    <TableRow className='bg-muted text-foreground'>
                        <TableHead>Event Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Course/Class</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {/* Use safeEvents for checks and mapping */}
                    {safeEvents.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                No schedule events found.
                            </TableCell>
                        </TableRow>
                    )}
                    {safeEvents.map((event) => (
                        <ScheduleEventTableRow
                            key={event.id}
                            event={event}
                            onDelete={onDeleteEvent}
                            isDeleting={isDeleting} // Pass down deleting state
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}