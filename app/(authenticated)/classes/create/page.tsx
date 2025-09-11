// app/(authenticated)/classes/create/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { resetOperationStatus } from '@/features/classes/store/classes-slice';
import { createClass } from '@/features/classes/store/classes-thunks';
import { ClassForm } from '@/features/classes/components/ClassForm'; // Adjust path
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AuthorizationGuard } from '@/components/auth/AuthenticationGuard';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { PageHeader } from '@/components/layout/auth/page-header';

export default function CreateClassPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async (data: any) => { // Use specific type from form schema later
        setIsSubmitting(true);
        try {
            console.log("Form data before processing:", data);

            // Format dates if they exist before sending
            const payload = {
                ...data,
                startDate: data.startDate ? data.startDate.toISOString() : undefined,
                endDate: data.endDate ? data.endDate.toISOString() : undefined,
            };

            console.log("Payload to be sent:", payload);

            await dispatch(createClass(payload)).unwrap();
            toast.success(`Class "${data.courseTitle}" created successfully!`);
            dispatch(resetOperationStatus()); // Reset status after success
            router.push('/timetable?tab=all-classes'); // Redirect to class list
        } catch (error: any) {
            console.error("Error creating class:", error);
            toast.error(`Failed to create class: ${error.message || 'Unknown error'}`);
            setIsSubmitting(false);
        }
    };

    return (
        <AuthorizationGuard allowedRoles={['admin','super_admin']}>
            <div className="mx-auto">
                <PageHeader
                    heading={`Create Class`}
                />
                <ClassForm
                    onSubmit={handleCreate}
                    isSubmitting={isSubmitting}
                    mode="create"
                />
            </div>
        </AuthorizationGuard>
    );
}
