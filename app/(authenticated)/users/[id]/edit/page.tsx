// app/(authenticated)/users/[id]/edit/page.tsx
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserForm } from '@/components/users/UserForm';
import { UserData } from '@/components/users/UserTableRow'; // Use shared type
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AuthorizationGuard } from '@/components/auth/AuthenticationGuard';


// --- Mock Data Fetching (Replace with API/Store) ---
const mockUsers: UserData[] = [
    { id: "user-1", name: "John Smith", email: "john.smith@example.com", role: "student", status: "active", joinDate: "2023-10-15" },
    { id: "user-2", name: "Sarah Johnson", email: "sarah.johnson@example.com", role: "teacher", status: "active", joinDate: "2023-09-05" },
    // ... add other mock users if needed
];

const fetchMockUserById = async (id: string): Promise<UserData | null> => {
    console.log(`Fetching mock user ${id} for edit`);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    const user = mockUsers.find(u => u.id === id);
    return user || null;
};
// --- End Mock Data Fetching ---


export default function EditUserPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string; // Get ID from route params

    const [initialUserData, setInitialUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (userId) {
            setIsLoading(true);
            setError(null);
            fetchMockUserById(userId) // Replace with actual fetch thunk later
                .then(data => {
                    if (data) {
                        setInitialUserData(data);
                    } else {
                        setError("User not found.");
                    }
                })
                .catch(err => {
                    console.error("Error fetching user for edit:", err);
                    setError("Failed to load user data.");
                })
                .finally(() => setIsLoading(false));
        } else {
            setError("User ID is missing.");
            setIsLoading(false);
        }
    }, [userId]);

    const handleUpdateUser = async (data: Omit<UserData, 'id' | 'joinDate'>) => {
        setIsSubmitting(true);
        console.log(`Updating user ${userId} with data:`, data);
        try {
            // TODO: Replace with actual API call / Redux dispatch for updating user
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            // const updatedUser = await dispatch(updateUser({ id: userId, ...data })).unwrap(); // Example Redux
            toast.success(`User "${data.name}" updated successfully!`);
            router.push(`/users/${userId}`); // Redirect to view page after update
            // Or router.push('/users');
        } catch (error: any) {
            console.error("Failed to update user:", error);
            toast.error(`Failed to update user: ${error?.message || 'Unknown error'}`);
            setIsSubmitting(false); // Keep form enabled on error
        }
        // No need to set submitting false if redirecting on success
    };


    if (isLoading) {
        return <div className="p-6 text-center">Loading user data for editing...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-600">{error}</div>;
    }

    if (!initialUserData) {
        // Could be combined with error state
        return <div className="p-6 text-center">Could not load user data for editing.</div>;
    }


    return (
        <AuthorizationGuard allowedRoles={['admin']}>
            <div className="mx-auto">
                <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                {/* UserForm handles its own Card and structure */}
                <UserForm
                    initialData={initialUserData}
                    onSubmit={handleUpdateUser}
                    isSubmitting={isSubmitting}
                    mode="edit"
                />
            </div>
        </AuthorizationGuard>
    );
}