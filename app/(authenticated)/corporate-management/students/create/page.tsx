// app/(authenticated)/corporate-management/students/create/page.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { CorporateStudentForm } from '@/features/corporate/components/forms/CorporateStudentForm'; // Adjust path
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { isStudent } from '@/types/user.types';
import { AuthorizationGuard } from '@/components/auth/AuthenticationGuard';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { PageHeader } from '@/components/layout/auth/page-header';
// TODO: Import createManagedStudentThunk, resetCorpStatus from corporate-slice

export default function CreateCorporateStudentPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user } = useAppSelector(state => state.auth);
    // TODO: const operationStatus = useAppSelector(selectCorpOperationStatus);
    const [isSubmitting, setIsSubmitting] = useState(false); // Use local state or operationStatus

    const corporateManager = React.useMemo(() => (user && isStudent(user) && user.isCorporateManager ? user : null), [user]);

    const handleCreate = async (data: { name: string; email: string }) => {
        if (!corporateManager?.corporateId) {
            toast.error("Corporate manager information not found.");
            return;
        }
        setIsSubmitting(true);
        try {
            // TODO: Dispatch actual create thunk
            console.log("Dispatching createManagedStudent:", { ...data, corporateId: corporateManager.corporateId });
            await new Promise(res => setTimeout(res, 1000)); // Simulate API
            // await dispatch(createManagedStudent({ ...data, corporateId: corporateManager.corporateId })).unwrap();

            toast.success(`Student account for "${data.name}" created successfully!`);
            // TODO: dispatch(resetCorpStatus());
            router.push('/corporate-management'); // Go back to the list
        } catch (error: any) {
            toast.error(`Failed to create student: ${error.message || 'Please check slot availability.'}`);
            setIsSubmitting(false);
            // TODO: dispatch(resetCorpStatus());
        }
    };

    // Ensure only managers access this
    if (!corporateManager) {
        // Redirect or show access denied if somehow accessed directly
        // This check might also happen in the Guard itself
        return <AuthorizationGuard allowedRoles={['student']}><p>Access Denied.</p></AuthorizationGuard>;
    }


    return (
        <AuthorizationGuard allowedRoles={['student']}>
            {/* Additional check for manager flag */}
            {corporateManager && (
                <div className="mx-auto">
                    <PageHeader
                        heading={`Create Student Account`}
                        subheading={`Create a new student account under your management`}
                    />
                    <CorporateStudentForm
                        onSubmit={handleCreate}
                        isSubmitting={isSubmitting} // Pass submitting state
                    // Pass availableClasses if implementing assignment here
                    />
                </div>
            )}
        </AuthorizationGuard>
    );
}