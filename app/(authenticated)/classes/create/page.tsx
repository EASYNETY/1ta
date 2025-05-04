// app/(authenticated)/classes/create/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { createClass, resetOperationStatus } from '@/features/classes/store/classes-slice';
import { ClassForm } from '@/features/classes/components/ClassForm'; // Adjust path
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AuthorizationGuard } from '@/components/auth/AuthenticationGuard';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';

export default function CreateClassPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async (data: any) => { // Use specific type from form schema later
        setIsSubmitting(true);
        try {
            // Format dates if they exist before sending
            const payload = {
                ...data,
                startDate: data.startDate ? data.startDate.toISOString() : undefined,
                endDate: data.endDate ? data.endDate.toISOString() : undefined,
            };
            await dispatch(createClass(payload)).unwrap();
            toast.success(`Class "${data.courseTitle}" created successfully!`);
            dispatch(resetOperationStatus()); // Reset status after success
            router.push('/timetable?tab=all-classes'); // Redirect to class list
        } catch (error: any) {
            toast.error(`Failed to create class: ${error.message || 'Unknown error'}`);
            setIsSubmitting(false);
        }
    };

    return (
        <AuthorizationGuard allowedRoles={['admin']}>
            <div className="mx-auto">
                <DyraneButton variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Classes
                </DyraneButton>
                <ClassForm
                    onSubmit={handleCreate}
                    isSubmitting={isSubmitting}
                    mode="create"
                />
            </div>
        </AuthorizationGuard>
    );
}