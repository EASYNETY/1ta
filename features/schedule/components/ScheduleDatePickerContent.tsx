// features/schedule/components/ScheduleDatePickerContent.tsx
import React, { useMemo } from 'react';
import { format, setMonth, setYear } from 'date-fns';
import { Calendar } from '@/components/ui/calendar'; // Use Shadcn Calendar
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DayPickerSingleProps, Modifiers } from 'react-day-picker';
import { useMediaQuery } from "@/hooks/use-media-query";

// Helper Functions (can be moved to utils if shared)
const generateYears = (center: number, range = 120) => {
    const start = Math.max(1900, center - Math.floor(range / 1.5));
    const end = Math.min(new Date().getFullYear() + 5, center + Math.ceil(range / 2.5));
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};
const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(0, i), "MMMM"),
}));

interface ScheduleDatePickerContentProps {
    displayMonth: Date; // The month currently shown in the calendar
    setDisplayMonth: (date: Date) => void; // Callback to update display month
    onDateSelect: DayPickerSingleProps['onSelect']; // Callback when a date is selected
    selectedDate?: Date | undefined; // Optional: currently selected date for visual feedback
    toDate?: Date; // Max selectable date
    fromDate?: Date; // Min selectable date
}

export const ScheduleDatePickerContent: React.FC<ScheduleDatePickerContentProps> = ({
    displayMonth,
    setDisplayMonth,
    onDateSelect,
    selectedDate,
    toDate,
    fromDate,
}) => {
    const isMdUp = useMediaQuery("(min-width: 768px)");

    const currentYear = displayMonth.getFullYear();
    const currentMonth = displayMonth.getMonth();
    const years = useMemo(() => generateYears(currentYear), [currentYear]);

    return (
        <>
            {/* Month/Year Select Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 border-b">
                <Select value={String(currentMonth)} onValueChange={(val) => setDisplayMonth(setMonth(displayMonth, +val))}>
                    <SelectTrigger className="w-[120px] h-8 text-xs focus:ring-0"><SelectValue placeholder="Month" /></SelectTrigger>
                    <SelectContent>{months.map(({ value, label }) => (<SelectItem key={value} value={String(value)} className="text-xs">{label}</SelectItem>))}</SelectContent>
                </Select>
                <Select value={String(currentYear)} onValueChange={(val) => setDisplayMonth(setYear(displayMonth, +val))}>
                    <SelectTrigger className="w-[90px] h-8 text-xs focus:ring-0"><SelectValue placeholder="Year" /></SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">{years.map((year) => (<SelectItem key={year} value={String(year)} className="text-xs">{year}</SelectItem>))}</SelectContent>
                </Select>
            </div>
            {/* Actual Calendar */}
            <Calendar
                mode="single"
                selected={selectedDate} // Visually mark selected date if passed
                month={displayMonth}    // Control displayed month
                onMonthChange={setDisplayMonth} // Allow navigation
                onSelect={onDateSelect} // Handler for date selection
                toDate={toDate}
                fromDate={fromDate}
                initialFocus
                numberOfMonths={isMdUp ? 2 : 1}
                classNames={{ caption: "hidden", caption_dropdowns: "hidden" }} // Hide internal nav
            // Modifiers can be passed if needed for attendance view, but not needed for basic date selection
            />
        </>
    );
};