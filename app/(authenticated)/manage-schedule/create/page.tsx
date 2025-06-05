// app/(authenticated)/manage-schedule/create/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { createScheduleEvent, resetOperationStatus } from '@/features/schedule/store/schedule-slice'; // Adjust path
import { ScheduleEventForm } from '@/features/schedule/components/forms/ScheduleEventForm'; // Adjust path
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AuthorizationGuard } from '@/components/auth/AuthenticationGuard';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { CreateScheduleEventPayload } from '@/features/schedule/types/schedule-types';

export default function CreateScheduleEventPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async (data: CreateScheduleEventPayload) => {
        setIsSubmitting(true);
        try {
            await dispatch(createScheduleEvent(data)).unwrap();
            toast.success(`Event "${data.title}" created successfully!`);
            dispatch(resetOperationStatus());
            router.push('/manage-schedule'); // Redirect to manage list
        } catch (error: any) {
            toast.error(`Failed to create event: ${error.message || 'Unknown error'}`);
            setIsSubmitting(false);
        }
    };

    return (
        <AuthorizationGuard allowedRoles={['admin','super_admin']}> {/* Adjust roles */}
            <div className="mx-auto">
                <DyraneButton variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Manage Schedule
                </DyraneButton>
                <ScheduleEventForm
                    onSubmit={handleCreate as any}
                    isSubmitting={isSubmitting}
                    mode="create"
                />
            </div>
        </AuthorizationGuard>
    );
}