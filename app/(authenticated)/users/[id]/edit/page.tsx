// app/(authenticated)/users/[id]/edit/page.tsx
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserForm } from '@/components/users/UserForm';
import { toast } from 'sonner';
import { AuthorizationGuard } from '@/components/auth/AuthenticationGuard';
import { PageHeader } from '@/components/layout/auth/page-header';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Redux imports
import { useAppDispatch } from '@/store/hooks';
import { fetchUserById, updateUserAdmin } from '@/features/auth/store/user-thunks';
import type { User } from '@/types/user.types';
// No need for specific selectors if accessing directly from state.auth for the list

export default function EditUserPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const userId = params.id as string;

    // Local state for this page
    const [initialUserData, setInitialUserData] = useState<User | null | undefined>(undefined);
    const [isFetchingInitialData, setIsFetchingInitialData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pageError, setPageError] = useState<string | null>(null);


    // Single effect to fetch and set user data
    useEffect(() => {
        if (!userId) return;

        // Set loading state
        setIsFetchingInitialData(true);
        setPageError(null);

        // Directly fetch the specific user by ID
        console.log(`EditUserPage: Fetching user with ID '${userId}'`);
        dispatch(fetchUserById(userId))
            .unwrap()
            .then(userData => {
                console.log("EditUserPage: Successfully fetched user:", userData);
                setInitialUserData(userData);
                setIsFetchingInitialData(false);
            })
            .catch(error => {
                console.error("EditUserPage: Error fetching user:", error);
                setPageError("Failed to load user data. Please try again.");
                setInitialUserData(null);
                setIsFetchingInitialData(false);
            });
    }, [dispatch, userId]);

    const handleUpdateUser = async (formData: Partial<User>) => { // Assuming UserForm provides Partial<User>
        if (!userId) {
            toast.error("User ID is missing. Cannot update.");
            return;
        }
        setIsSubmitting(true);
        setPageError(null); // Clear previous errors
        console.log(`EditUserPage: Attempting to update user ${userId} with data:`, formData);

        try {
            // The payload for updateUserAdmin is { userId: string, userData: Partial<User> }
            const resultAction = await dispatch(updateUserAdmin({ userId, userData: formData })).unwrap();
            // unwrap() will throw an error if the thunk is rejected

            toast.success(`User "${resultAction.name}" updated successfully!`); // resultAction is the updated User
            router.push(`/users/${userId}`); // Redirect to view page
            // or router.push('/users'); // Redirect to users list
        } catch (error: any) {
            console.error("EditUserPage: Failed to update user:", error);
            const errorMessage = typeof error === 'string' ? error : error?.message || 'An unknown error occurred during update.';
            setPageError(errorMessage); // Display error on the page
            toast.error(`Failed to update user: ${errorMessage}`);
            setIsSubmitting(false); // Allow user to try again
        }
        // No setIsSubmitting(false) here if successful and redirecting
    };

    // --- Loading and Error States for the Page ---
    if (isFetchingInitialData) {
        return (
            <div className="p-6 text-center flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                Loading user data for editing...
            </div>
        );
    }

    if (pageError && !initialUserData) { // If there's an error AND we couldn't set initialUserData
        return (
            <div className="mx-auto p-6">
                <PageHeader
                    heading={`Edit User`}
                    subheading={`Error loading user data`}
                    actions={
                        <div className="p-6 text-center text-red-500 bg-red-50 border border-red-200 rounded-md">
                            <p className="font-semibold">Could not load user data:</p>
                            <p>{pageError}</p>
                            <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
                        </div>
                    }
                />
            </div>
        );
    }

    if (!initialUserData) {
        // This covers the case where user is not found after list is loaded, or ID is invalid
        return (
            <div className="mx-auto p-6">
                <PageHeader
                    heading={`Edit User`}
                    subheading={`User not found`}
                />
                <div className="p-6 text-center text-muted-foreground">
                    User data could not be loaded or the user does not exist.
                    <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <AuthorizationGuard allowedRoles={['admin', 'super_admin']}>
            <div className="mx-auto">
                <PageHeader
                    heading={`Edit User: ${initialUserData.name}`}
                    subheading={`Modify the details for user ID: ${initialUserData.id}`}
                />
                {/* UserForm handles its own Card and structure */}
                <UserForm
                    initialData={initialUserData as any} // Pass the fetched User object
                    onSubmit={handleUpdateUser as any}
                    isSubmitting={isSubmitting}
                    mode="edit" // Inform the form it's in edit mode
                />
            </div>
        </AuthorizationGuard>
    );
}
