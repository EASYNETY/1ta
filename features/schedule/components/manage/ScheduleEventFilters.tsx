// features/schedule/components/manage/ScheduleEventFilters.tsx
"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePickerWithYearMonth } from '@/components/ui/date-picker-with-year-month'; // Use existing component
import { Search, X, Filter } from 'lucide-react';
import type { ScheduleEventType } from '../../types/schedule-types';

// Mock data for dropdowns (replace with fetched data)
const mockEventTypes: ScheduleEventType[] = ["lecture", "lab", "exam", "office-hours", "meeting", "other"];
const mockCourses = [
    { id: '1', title: 'PMP® Certification Training' },
    { id: 'webdev_101', title: 'Web Development Bootcamp' },
    // Add more courses
];
const mockInstructors = [
    { id: 'teacher_1', name: 'Dr. Sarah Johnson' },
    { id: 'teacher_2', name: 'Michael Chen' },
    // Add more instructors
];


// Define the shape of filter values
export interface ScheduleFilters {
    dateFrom: Date | undefined;
    dateTo: Date | undefined;
    eventType: ScheduleEventType | 'all';
    courseId: string | 'all';
    instructorId: string | 'all';
    searchTerm: string;
}

interface ScheduleEventFiltersProps {
    filters: ScheduleFilters;
    onFilterChange: <K extends keyof ScheduleFilters>(key: K, value: ScheduleFilters[K]) => void;
    onApplyFilters: () => void; // Callback to trigger data refetch
    onResetFilters: () => void; // Callback to clear all filters
}

export function ScheduleEventFilters({
    filters,
    onFilterChange,
    onApplyFilters,
    onResetFilters
}: ScheduleEventFiltersProps) {

    const handleDateChange = (key: 'dateFrom' | 'dateTo') => (date: Date | undefined) => {
        onFilterChange(key, date);
    };

    const handleSelectChange = (key: 'eventType' | 'courseId' | 'instructorId') => (value: string) => {
        // Handle 'all' case for selects
        onFilterChange(key, value === 'all' ? 'all' : value as any); // Cast needed for type safety
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange('searchTerm', e.target.value);
    };

    // Check if any filters are active besides the default 'all'/'empty' states
    const hasActiveFilters =
        filters.dateFrom !== undefined ||
        filters.dateTo !== undefined ||
        filters.eventType !== 'all' ||
        filters.courseId !== 'all' ||
        filters.instructorId !== 'all' ||
        filters.searchTerm !== '';

    return (
        <div className="mb-6 p-4 border rounded-lg bg-card/5 backdrop-blur-sm shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end">
                {/* Search Term */}
                <div className="xl:col-span-2">
                    <label htmlFor="searchTerm" className="block text-sm font-medium text-muted-foreground mb-1">Search Title/Desc</label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="searchTerm"
                            placeholder="Search events..."
                            className="pl-8 h-9"
                            value={filters.searchTerm}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                {/* Date From */}
                <div>
                    <label htmlFor="dateFrom" className="block text-sm font-medium text-muted-foreground mb-1">Date From</label>
                    <DatePickerWithYearMonth
                        date={filters.dateFrom}
                        setDate={handleDateChange('dateFrom')}
                        placeholder="Start date"
                        buttonClassName="h-9 text-xs"
                        toDate={filters.dateTo} // Prevent start date being after end date
                    />
                </div>

                {/* Date To */}
                <div>
                    <label htmlFor="dateTo" className="block text-sm font-medium text-muted-foreground mb-1">Date To</label>
                    <DatePickerWithYearMonth
                        date={filters.dateTo}
                        setDate={handleDateChange('dateTo')}
                        placeholder="End date"
                        buttonClassName="h-9 text-xs"
                        fromDate={filters.dateFrom} // Prevent end date being before start date
                    />
                </div>

                {/* Event Type */}
                <div>
                    <label htmlFor="eventType" className="block text-sm font-medium text-muted-foreground mb-1">Event Type</label>
                    <Select value={filters.eventType} onValueChange={handleSelectChange('eventType')}>
                        <SelectTrigger id="eventType" className="h-9 text-xs">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {mockEventTypes.map(type => (
                                <SelectItem key={type} value={type} className="capitalize text-xs">{type.replace('-', ' ')}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Course */}
                <div>
                     <label htmlFor="courseId" className="block text-sm font-medium text-muted-foreground mb-1">Course</label>
                     <Select value={filters.courseId} onValueChange={handleSelectChange('courseId')}>
                        <SelectTrigger id="courseId" className="h-9 text-xs">
                            <SelectValue placeholder="All Courses" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="all">All Courses</SelectItem>
                             {mockCourses.map(course => (
                                 <SelectItem key={course.id} value={course.id} className="text-xs">{course.title}</SelectItem>
                             ))}
                         </SelectContent>
                    </Select>
                </div>

                {/* Instructor */}
                <div>
                    <label htmlFor="instructorId" className="block text-sm font-medium text-muted-foreground mb-1">Instructor</label>
                    <Select value={filters.instructorId} onValueChange={handleSelectChange('instructorId')}>
                        <SelectTrigger id="instructorId" className="h-9 text-xs">
                            <SelectValue placeholder="All Instructors" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="all">All Instructors</SelectItem>
                             {mockInstructors.map(instructor => (
                                 <SelectItem key={instructor.id} value={instructor.id} className="text-xs">{instructor.name}</SelectItem>
                             ))}
                         </SelectContent>
                    </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 xl:col-start-6 self-end">
                    <Button onClick={onApplyFilters} size="sm" className="h-9 w-full sm:w-auto">
                        <Filter className="mr-2 h-4 w-4" /> Apply
                    </Button>
                    {/* Show Reset only if filters are active */}
                    {hasActiveFilters && (
                        <Button onClick={onResetFilters} variant="ghost" size="sm" className="h-9 w-full sm:w-auto">
                            <X className="mr-2 h-4 w-4" /> Reset
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}