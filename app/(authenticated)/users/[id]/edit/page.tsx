// app/(authenticated)/users/[id]/edit/page.tsx
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserForm } from '@/components/users/UserForm'; // Ensure this component is robust
import { toast } from 'sonner';
// import { Button } from '@/components/ui/button'; // Not directly used here, UserForm might use it
// import { ArrowLeft } from 'lucide-react'; // Not directly used here
import { AuthorizationGuard } from '@/components/auth/AuthenticationGuard';
// import { DyraneButton } from '@/components/dyrane-ui/dyrane-button'; // Not directly used here
import { PageHeader } from '@/components/layout/auth/page-header';
import { Loader2 } from 'lucide-react';

// --- Import Redux hooks and actions/selectors ---
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAllUsers, updateUserAdmin } from '@/features/auth/store/user-thunks';
import type { User } from '@/types/user.types'; // Your canonical User type
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
// No need for specific selectors if accessing directly from state.auth for the list

export default function EditUserPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const userId = params.id as string;

    // --- Select relevant parts directly from the auth slice ---
    const {
        users: allUsers,              // state.auth.users
        usersLoading: isLoadingList,  // state.auth.usersLoading (for the list)
        usersError: listFetchError    // state.auth.usersError (for the list)
    } = useAppSelector((state) => state.auth);

    // Local state for this page
    const [initialUserData, setInitialUserData] = useState<User | null | undefined>(undefined); // User from the list
    const [isFetchingInitialData, setIsFetchingInitialData] = useState(true); // Separate loading for initial form data
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pageError, setPageError] = useState<string | null>(null);


    // Effect 1: Ensure the user list is loaded or being loaded
    useEffect(() => {
        if ((!allUsers || allUsers.length === 0) && !isLoadingList && !listFetchError) {
            console.log("EditUserPage: User list not available, dispatching fetchAllUsers.");
            dispatch(fetchAllUsers());
        }
    }, [dispatch, allUsers, isLoadingList, listFetchError]);


    // Effect 2: Find and set the initialUserData for the form once the list is available
    useEffect(() => {
        if (userId && allUsers && allUsers.length > 0) {
            setIsFetchingInitialData(true); // Start "loading" indication for form data
            setPageError(null);
            const foundUser = allUsers.find(u => u.id === userId);
            if (foundUser) {
                console.log("EditUserPage: Found user for editing:", foundUser);
                setInitialUserData(foundUser);
            } else {
                console.error(`EditUserPage: User with ID '${userId}' not found in the loaded list.`);
                setPageError("User not found. They may have been deleted or the ID is incorrect.");
                setInitialUserData(null); // Explicitly null if not found
            }
            setIsFetchingInitialData(false);
        } else if (userId && !isLoadingList && allUsers && allUsers.length === 0 && !listFetchError) {
            // User list fetched, but it's empty
            console.error("EditUserPage: User list is empty after fetch. User not found.");
            setPageError("User not found. The user list is empty.");
            setInitialUserData(null);
            setIsFetchingInitialData(false);
        } else if (userId && isLoadingList) {
            // Still loading the main list, set fetching initial data true
            setIsFetchingInitialData(true);
        }

    }, [userId, allUsers, isLoadingList]); // Rerun when list or ID changes

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
    if (isFetchingInitialData || (isLoadingList && initialUserData === undefined)) {
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
                            <DyraneButton onClick={() => router.back()} className="mt-4">Go Back</DyraneButton>
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
                    <DyraneButton onClick={() => router.back()} className="mt-4">Go Back</DyraneButton>
                </div>
            </div>
        );
    }

    return (
        <AuthorizationGuard allowedRoles={['admin']}>
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