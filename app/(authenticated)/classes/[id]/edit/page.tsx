// app/(authenticated)/classes/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchClassById, updateClass, selectCurrentClass, selectOperationStatus, resetOperationStatus, clearCurrentClass } from '@/features/classes/store/classes-slice';
import { ClassForm } from '@/features/classes/components/ClassForm'; // Adjust path
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthorizationGuard } from '@/components/auth/AuthenticationGuard';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { PageHeader } from '@/components/layout/auth/page-header';

export default function EditClassPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const classId = params.id as string;

    const currentClass = useAppSelector(selectCurrentClass);
    const fetchStatus = useAppSelector((state) => state.classes.status); // Status for fetching
    const operationStatus = useAppSelector(selectOperationStatus); // Status for updating

    useEffect(() => {
        if (classId) {
            dispatch(fetchClassById(classId));
        }
        // Clear current class on component unmount
        return () => {
            dispatch(clearCurrentClass());
            dispatch(resetOperationStatus());
        }
    }, [dispatch, classId]);

    const handleUpdate = async (data: any) => { // Use specific type from form schema later
        try {
            // Format dates if they exist before sending
            const payload = {
                ...data,
                startDate: data.startDate ? data.startDate.toISOString() : undefined,
                endDate: data.endDate ? data.endDate.toISOString() : undefined,
            };
            await dispatch(updateClass({ id: classId, ...payload })).unwrap();
            toast.success(`Class "${data.courseTitle}" updated successfully!`);
            dispatch(resetOperationStatus());
            router.push('/timetable?tab=all-classes'); // Redirect to class list
        } catch (error: any) {
            toast.error(`Failed to update class: ${error.message || 'Unknown error'}`);
            // isSubmitting is handled by operationStatus
        }
    };

    const isLoading = fetchStatus === 'loading';
    const isSubmitting = operationStatus === 'loading';


    return (
        <AuthorizationGuard allowedRoles={['admin']}>
            <div className="mx-auto">
                <PageHeader
                    heading={`Edit ${currentClass?.courseTitle}`}
                    subheading={`Edit the details of ${currentClass?.id}`}
                />
                <DyraneButton variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Classes
                </DyraneButton>
                {isLoading && !currentClass && (
                    <div className="space-y-4 p-4 border rounded-md">
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                )}
                {!isLoading && !currentClass && fetchStatus === 'succeeded' && (
                    <p className='text-center text-muted-foreground'>Class not found.</p>
                )}
                {currentClass && (
                    <ClassForm
                        initialData={currentClass}
                        onSubmit={handleUpdate}
                        isSubmitting={isSubmitting}
                        mode="edit"
                    />
                )}
            </div>
        </AuthorizationGuard>
    );
}