// app/(authenticated)/corporate-management/students/[studentId]/edit/page.tsx// app/(authenticated)/corporate-management/students/[studentId]/edit/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { AuthorizationGuard } from '@/components/auth/AuthenticationGuard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { isStudent } from '@/types/user.types';
import type { StudentUser } from '@/types/user.types';

// Import form and slice actions/selectors
import { EditCorporateStudentForm } from '@/features/corporate/components/forms/EditCorporateStudentForm'; // NEW Form Component
import {
    // fetchManagedStudentById, // Thunk to fetch specific student
    selectCurrentManagedStudent,
    selectCorporateOperationStatus,
    selectCorporateStatus,
    resetOperationStatus,
    clearCurrentManagedStudent,
    updateManagedStudent // Thunk to update
} from '@/features/corporate/store/corporate-slice'; // Adjust path
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';

// Define shape for editable fields by manager
type EditStudentFormValues = {
    name: string;
    isActive: boolean;
    // Add other fields manager can edit (e.g., maybe trigger password reset?)
};

export default function EditManagedStudentPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const studentId = params.studentId as string;
    const { user } = useAppSelector(state => state.auth); // The logged-in manager

    const currentStudent = useAppSelector(selectCurrentManagedStudent);
    const fetchStatus = useAppSelector(selectCorporateStatus);
    const operationStatus = useAppSelector(selectCorporateOperationStatus);

    const isSubmitting = operationStatus === 'loading';
    const isLoading = fetchStatus === 'loading';

    // Fetch student data on mount
    useEffect(() => {
        if (studentId) {
            // TODO: Dispatch fetchManagedStudentById(studentId);
            console.warn("TODO: Dispatch fetchManagedStudentById(" + studentId + ")");
            // Mock fetch for now
            const mockStudent = user && isStudent(user) && user.isCorporateManager
                ? { ...user, id: studentId, name: "Mock Managed Student", isCorporateManager: false, email: `${studentId}@example.com` } as StudentUser
                : null;
            // dispatch({ type: 'corporate/setCurrentManagedStudent', payload: mockStudent });
        }
        return () => {
            dispatch(clearCurrentManagedStudent());
            dispatch(resetOperationStatus());
        }
    }, [dispatch, studentId]);

    const handleUpdate = async (data: EditStudentFormValues) => {
        try {
            const payload: { id: string; name?: string; isActive?: boolean } = { id: studentId, ...data };
            await dispatch(updateManagedStudent(payload)).unwrap();
            toast.success(`Student "${data.name}" updated successfully!`);
            dispatch(resetOperationStatus());
            router.push(`/corporate-management/students/${studentId}`); // Go back to view page
        } catch (error: any) {
            toast.error(`Failed to update student: ${error.message || 'Unknown error'}`);
            // isSubmitting handled by operationStatus
        }
    };

    const corporateManager = React.useMemo(() => (user && isStudent(user) && user.isCorporateManager ? user : null), [user]);

    // Authorization checks
    if (!corporateManager) {
        return <AuthorizationGuard allowedRoles={[]}><p>Access Denied.</p></AuthorizationGuard>;
    }
    // TODO: Add check: if (!isLoading && currentStudent && currentStudent.corporateId !== corporateManager.corporateId) { ... access denied ... }

    return (
        <AuthorizationGuard allowedRoles={['student']}>
            {corporateManager && (
                <div className="mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <DyraneButton variant="outline" size="icon" onClick={() => router.back()} aria-label="Go back">
                            <ArrowLeft className="h-4 w-4" />
                        </DyraneButton>
                        <h1 className="text-2xl font-bold">Edit Student</h1>
                    </div>

                    {isLoading && !currentStudent && (
                        <div className="space-y-4 p-4 border rounded-md">
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    )}
                    {!isLoading && !currentStudent && fetchStatus === 'succeeded' && (
                        <p className='text-center text-muted-foreground'>Student not found or access denied.</p>
                    )}
                    {currentStudent && (
                        <EditCorporateStudentForm
                            initialData={currentStudent} // Pass fetched student data
                            onSubmit={handleUpdate}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </div>
            )}
        </AuthorizationGuard>
    );
}