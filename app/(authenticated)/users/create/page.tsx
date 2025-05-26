// app/(authenticated)/users/create/page.tsx
"use client";

import { UserForm } from '@/components/users/UserForm';
import { UserData } from '@/components/users/UserTableRow'; // Use shared type
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthorizationGuard } from '@/components/auth/AuthenticationGuard';
import Link from 'next/link';
import { ArrowLeft } from 'phosphor-react';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { PageHeader } from '@/components/layout/auth/page-header';
import { useAppDispatch } from '@/store/hooks';
import { createUserAdmin } from '@/features/auth/store/user-thunks';
import type { User } from '@/types/user.types';

export default function CreateUserPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const dispatch = useAppDispatch();

    const handleCreateUser = async (data: Partial<User>) => {
        setIsSubmitting(true);
        console.log("Creating user with data:", data);
        try {
            // Use the actual API call via Redux dispatch
            const newUser = await dispatch(createUserAdmin(data)).unwrap();
            toast.success(`User "${newUser.name}" created successfully!`);
            router.push('/users'); // Redirect to users list after creation
        } catch (error: any) {
            console.error("Failed to create user:", error);
            toast.error(`Failed to create user: ${error?.message || 'Unknown error'}`);
            setIsSubmitting(false); // Only set false on error if not redirecting
        }
        // No need to set submitting false if redirecting on success
    };

    return (
        <AuthorizationGuard allowedRoles={['admin']}>
            <div className="mx-auto">
                <PageHeader
                    heading={`Create User`}
                />

                <UserForm
                    onSubmit={handleCreateUser}
                    isSubmitting={isSubmitting}
                    mode="create"
                />
            </div>
        </AuthorizationGuard>
    );
}