// app/(authenticated)/manage-schedule/[eventId]/edit/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    fetchScheduleEventById,
    updateScheduleEvent,
    selectCurrentScheduleEvent,
    selectScheduleOperationStatus,
    selectScheduleStatus, // Use main status for fetching
    resetOperationStatus,
    clearCurrentScheduleEvent
} from '@/features/schedule/store/schedule-slice'; // Adjust path
import { ScheduleEventForm } from '@/features/schedule/components/forms/ScheduleEventForm'; // Adjust path
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { UpdateScheduleEventPayload } from '@/features/schedule/store/schedule-slice';
import { AuthorizationGuard } from '@/components/auth/AuthenticationGuard';

export default function EditScheduleEventPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const eventId = params.eventId as string;

    const currentEvent = useAppSelector(selectCurrentScheduleEvent);
    const fetchStatus = useAppSelector(selectScheduleStatus);
    const operationStatus = useAppSelector(selectScheduleOperationStatus);

    useEffect(() => {
        if (eventId) {
            dispatch(fetchScheduleEventById(eventId));
        }
        return () => {
            dispatch(clearCurrentScheduleEvent());
            dispatch(resetOperationStatus());
        }
    }, [dispatch, eventId]);

    const handleUpdate = async (data: UpdateScheduleEventPayload) => { // Expects object with id
        try {
            await dispatch(updateScheduleEvent(data)).unwrap();
            toast.success(`Event "${data.title || currentEvent?.title}" updated successfully!`);
            dispatch(resetOperationStatus());
            router.push('/manage-schedule'); // Redirect after update
        } catch (error: any) {
            toast.error(`Failed to update event: ${error.message || 'Unknown error'}`);
            // isSubmitting is handled by operationStatus
        }
    };

     const isLoading = fetchStatus === 'loading';
     const isSubmitting = operationStatus === 'loading';


    return (
        <AuthorizationGuard allowedRoles={['admin']}> {/* Adjust roles */}
             <div className="mx-auto">
                <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Manage Schedule
                 </Button>
                 {isLoading && !currentEvent && (
                     <div className="space-y-4 p-4 border rounded-md"> {/* Form Skeleton */}
                         <Skeleton className="h-8 w-1/2" />
                         <Skeleton className="h-10 w-full" />
                         <Skeleton className="h-10 w-full" />
                         {/* Add more skeleton fields */}
                    </div>
                 )}
                 {!isLoading && !currentEvent && fetchStatus === 'succeeded' && (
                      <p className='text-center text-muted-foreground'>Schedule event not found.</p>
                 )}
                 {currentEvent && (
                    <ScheduleEventForm
                        initialData={currentEvent}
                        onSubmit={(formData) => handleUpdate({id: eventId, ...formData})} // Add id here
                        isSubmitting={isSubmitting}
                        mode="edit"
                    />
                 )}
            </div>
        </AuthorizationGuard>
    );
}