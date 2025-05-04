// features/schedule/components/ScheduleHeader.tsx
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button'; // Or use standard Button
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, List, Grid } from 'lucide-react';

interface ScheduleHeaderProps {
    currentWeekStart: Date;
    currentWeekEnd: Date;
    onPreviousWeek: () => void;
    onNextWeek: () => void;
    onGoToToday: () => void; // Renamed for clarity
    viewMode: 'list' | 'timetable';
    onViewModeChange: (mode: 'list' | 'timetable') => void;
    datePickerTrigger: React.ReactNode; // The trigger element for the date picker popover
    isLoading: boolean;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
    currentWeekStart,
    currentWeekEnd,
    onPreviousWeek,
    onNextWeek,
    onGoToToday,
    viewMode,
    onViewModeChange,
    datePickerTrigger,
    isLoading,
}) => {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left Side: Date Info & Month/Year Picker Trigger */}
            <div className="flex items-center gap-2">
                {datePickerTrigger} {/* Render the trigger passed from parent */}
                <h2 className="text-lg font-medium whitespace-nowrap">
                    {format(currentWeekStart, "MMM d")} - {format(currentWeekEnd, "MMM d, yyyy")}
                </h2>
            </div>

            {/* Right Side: Navigation and View Toggles */}
            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end">
                {/* Week Navigation */}
                <DyraneButton variant="outline" size="sm" onClick={onPreviousWeek} disabled={isLoading}>
                    <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline ml-1">Prev</span>
                </DyraneButton>
                <DyraneButton variant="outline" size="sm" onClick={onGoToToday} disabled={isLoading}>
                    Today
                </DyraneButton>
                <DyraneButton variant="outline" size="sm" onClick={onNextWeek} disabled={isLoading}>
                    <span className="hidden sm:inline mr-1">Next</span> <ChevronRight className="h-4 w-4" />
                </DyraneButton>
                {/* View Mode Toggle */}
                <div className="flex items-center rounded-md bg-muted p-1 ml-2">
                    <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="px-2 py-1 h-auto rounded-sm cursor-pointer"
                        onClick={() => onViewModeChange('list')}
                        aria-label="List View"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'timetable' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="px-2 py-1 h-auto rounded-sm cursor-pointer"
                        onClick={() => onViewModeChange('timetable')}
                        aria-label="Timetable View"
                    >
                        <Grid className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};