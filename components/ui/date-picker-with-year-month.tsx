// components/ui/date-picker-with-year-month.tsx
"use client";

import * as React from "react";
import { format, setMonth, setYear } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/use-media-query";

interface DatePickerWithYearMonthProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    disabled?: (date: Date) => boolean;
    fromDate?: Date;
    toDate?: Date;
    buttonClassName?: string;
    placeholder?: string;
    ariaLabel?: string;
}

const generateYears = (center: number, range = 120) => {
    const start = Math.max(1900, center - Math.floor(range / 1.5));
    const end = Math.min(new Date().getFullYear() + 5, center + Math.ceil(range / 2.5));
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(0, i), "MMMM"),
}));

export function DatePickerWithYearMonth({
    date,
    setDate,
    disabled,
    fromDate,
    toDate = new Date(),
    buttonClassName,
    placeholder = "Select date",
    ariaLabel = "Select Date",
}: DatePickerWithYearMonthProps) {
    const [popoverOpen, setPopoverOpen] = React.useState(false);
    const isSm = useMediaQuery("(max-width: 640px)");
    const isMdUp = useMediaQuery("(min-width: 768px)");

    const initialYear = date?.getFullYear() ?? new Date().getFullYear();
    const initialMonth = date?.getMonth() ?? new Date().getMonth();

    const [displayMonth, setDisplayMonth] = React.useState<Date>(
        setMonth(new Date(initialYear, 0), initialMonth)
    );

    const currentYear = displayMonth.getFullYear();
    const currentMonth = displayMonth.getMonth();

    React.useEffect(() => {
        if (!date) return;
        if (
            date.getFullYear() !== currentYear ||
            date.getMonth() !== currentMonth
        ) {
            setDisplayMonth(date);
        }
    }, [date]);

    const years = React.useMemo(() => generateYears(currentYear), [currentYear]);

    const onSelectDate = (d: Date | undefined) => {
        // Ensure we're preserving the full date including day
        if (d) {
            console.log("Selected date:", d);
            // Create a new Date object to ensure we have all date components
            const fullDate = new Date(d);
            console.log("Full date to be set:", fullDate);
            setDate(fullDate);
        } else {
            setDate(undefined);
        }
        setPopoverOpen(false);
    };

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    aria-label={ariaLabel}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                        buttonClassName
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, isSm ? "MMM yyyy" : "PPP") : placeholder}
                </Button>
            </PopoverTrigger>

            <PopoverContent className={cn("w-auto p-0 bg-background/5 backdrop-blur-sm", isMdUp && "md:min-w-[540px]")}>
                <div className="flex flex-wrap items-center justify-between gap-2 p-2 border-b">
                    <Select value={String(currentMonth)} onValueChange={(val) => setDisplayMonth(setMonth(displayMonth, +val))}>
                        <SelectTrigger className="w-[120px] h-8 text-xs focus:ring-0">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map(({ value, label }) => (
                                <SelectItem key={value} value={String(value)} className="text-xs">
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={String(currentYear)} onValueChange={(val) => setDisplayMonth(setYear(displayMonth, +val))}>
                        <SelectTrigger className="w-[90px] h-8 text-xs focus:ring-0">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px] overflow-y-auto">
                            {years.map((year) => (
                                <SelectItem key={year} value={String(year)} className="text-xs">
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Calendar
                    mode="single"
                    selected={date}
                    month={displayMonth}
                    onMonthChange={setDisplayMonth}
                    onSelect={onSelectDate}
                    fromDate={fromDate}
                    toDate={toDate}
                    disabled={disabled}
                    initialFocus
                    numberOfMonths={isMdUp ? 2 : 1}
                    classNames={{
                        caption: "hidden",
                        caption_dropdowns: "hidden",
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
