// app/(authenticated)/manage-schedule/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Use if needed for back button
import { Button } from '@/components/ui/button';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { Plus, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// Import Schedule specific components and actions
import { ScheduleEventTable } from '@/features/schedule/components/manage/ScheduleEventTable'; // NEW Component
import {
    fetchAllScheduleEvents, // New thunk to fetch all events
    deleteScheduleEvent,    // Existing delete thunk
    resetOperationStatus, // Reset status after delete
    selectAllScheduleEvents,
    selectSchedulePagination, // Use pagination state
    selectScheduleStatus,
    selectScheduleOperationStatus, // To disable delete while processing
    selectScheduleError,
    clearScheduleError, // Clear errors on load
} from '@/features/schedule/store/schedule-slice'; // Adjust path
import { AuthorizationGuard } from '@/components/auth/AuthenticationGuard';
import { ScheduleEventFilters, ScheduleFilters } from '@/features/schedule/components/manage/ScheduleEventFilters';
import { formatISO } from 'date-fns';


// Default filter state
const defaultFilters: ScheduleFilters = {
    dateFrom: undefined,
    dateTo: undefined,
    eventType: 'all',
    courseId: 'all',
    instructorId: 'all',
    searchTerm: '',
};


export default function ManageSchedulePage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const allEvents = useAppSelector(selectAllScheduleEvents);
    const pagination = useAppSelector(selectSchedulePagination); // Use pagination info
    const status = useAppSelector(selectScheduleStatus);
    const operationStatus = useAppSelector(selectScheduleOperationStatus);
    const error = useAppSelector(selectScheduleError);

    // --- State for Filters and Pagination ---
    const [filters, setFilters] = useState<ScheduleFilters>(defaultFilters);
    const [currentPage, setCurrentPage] = useState(1); // Example pagination state
    const limit = 10; // Example limit
    // --- End State ---

    // Fetch function abstracted
    const fetchEvents = useCallback((pageToFetch: number = 1) => {
        // Prepare filter params for API/mock
        const fetchParams: any = { // Use 'any' for flexibility or define a specific type
            page: pageToFetch,
            limit: limit,
        };
        if (filters.searchTerm) fetchParams.search = filters.searchTerm;
        if (filters.dateFrom) fetchParams.dateFrom = formatISO(filters.dateFrom, { representation: 'date' });
        if (filters.dateTo) fetchParams.dateTo = formatISO(filters.dateTo, { representation: 'date' });
        if (filters.eventType !== 'all') fetchParams.type = filters.eventType;
        if (filters.courseId !== 'all') fetchParams.courseId = filters.courseId;
        if (filters.instructorId !== 'all') fetchParams.instructorId = filters.instructorId;

        dispatch(fetchAllScheduleEvents(fetchParams));
        setCurrentPage(pageToFetch); // Update current page state
    }, [dispatch, filters, limit]); // Dependencies for useCallback


    // Initial data fetch
    useEffect(() => {
        fetchEvents(1); // Fetch page 1 initially
        dispatch(clearScheduleError());
        return () => { dispatch(resetOperationStatus()); }
    }, [dispatch, fetchEvents]); // Depend on the stable fetchEvents callback

    // --- Filter Handlers ---
    const handleFilterChange = useCallback(<K extends keyof ScheduleFilters>(key: K, value: ScheduleFilters[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleApplyFilters = () => {
        fetchEvents(1); // Refetch with current filters, reset to page 1
    };

    const handleResetFilters = () => {
        setFilters(defaultFilters);
        // Need to refetch after resetting
        // Use setTimeout to allow state to update before refetching
        setTimeout(() => {
            fetchEvents(1);
        }, 0);
    };
    // --- End Filter Handlers ---


    // Delete Handler
    const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
        try {
            await dispatch(deleteScheduleEvent(eventId)).unwrap();
            toast.success(`Event "${eventTitle}" deleted successfully.`);
            // Refetch the *current* page after delete to update the list
            fetchEvents(currentPage);
            dispatch(resetOperationStatus());
        } catch (err: any) {
            toast.error(`Failed to delete event: ${err.message || 'Unknown error'}`);
            dispatch(resetOperationStatus());
        }
    };

    const isLoading = status === 'loading';
    const isDeleting = operationStatus === 'loading';

    return (
        <AuthorizationGuard allowedRoles={['admin','super_admin']}> {/* Adjust roles if needed */}
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
                    <div>
                        <DyraneButton variant="outline" size="sm" onClick={() => router.back()} className="mb-2 sm:mb-0 mr-2">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                        </DyraneButton>
                        <h1 className="text-3xl font-bold inline-block align-middle">Manage Schedule Events</h1>
                    </div>
                    <DyraneButton size="sm" asChild>
                        <Link href="/manage-schedule/create">
                            <Plus className="mr-2 h-4 w-4" /> Create Event
                        </Link>
                    </DyraneButton>
                </div>

                {/* --- Render Filters Component --- */}
                <ScheduleEventFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onApplyFilters={handleApplyFilters}
                    onResetFilters={handleResetFilters}
                />
                {/* --- End Filters Component --- */}


                {/* Error Display */}
                {status === 'failed' && error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error Loading Events</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Loading Skeletons */}
                {isLoading && (
                    <div className="space-y-2 mt-4 border rounded-md p-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                )}

                {/* Event Table */}
                {!isLoading && status === 'succeeded' && (
                    <ScheduleEventTable
                        events={allEvents}
                        onDeleteEvent={handleDeleteEvent}
                        isDeleting={isDeleting} // Pass deleting status to disable buttons in rows
                    />
                )}

                {/* TODO: Add Pagination Controls */}
                {/* <PaginationControls pagination={pagination} onPageChange={(page) => dispatch(fetchAllScheduleEvents({ page }))} /> */}

            </div>
        </AuthorizationGuard>
    );
}
