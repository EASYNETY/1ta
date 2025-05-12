// app/(authenticated)/users/[id]/page.tsx
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthorizationGuard } from "@/components/auth/AuthenticationGuard";
import { DyraneCard, DyraneCardContent, DyraneCardHeader, DyraneCardTitle, DyraneCardDescription, DyraneCardFooter } from '@/components/dyrane-ui/dyrane-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserData } from '@/components/users/UserTableRow'; // Use shared type
import Link from 'next/link';
import { User, Mail, Calendar, CheckCircle, XCircle, Briefcase } from 'lucide-react'; // Icons for details
import { PageHeader } from '@/components/layout/auth/page-header';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAllUsers } from '@/features/auth/store/user-thunks';


// Helper to format date
const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try { return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); }
    catch (e) { return "Invalid Date"; }
};

export default function ViewUserPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const userId = params.id as string; // Get ID from route params

    // --- Select relevant parts directly from the auth slice ---
    const {
        users: allUsers,      // state.auth.users
        usersLoading: isLoadingUsers, // state.auth.usersLoading
        usersError: fetchError // state.auth.usersError
    } = useAppSelector((state) => state.auth);

    const [currentUser, setCurrentUser] = useState<UserData | null | undefined>(undefined);

    // useEffect for fetching users (remains the same)
    useEffect(() => {
        if ((!allUsers || allUsers.length === 0) && !isLoadingUsers && !fetchError) {
            console.log("ViewUserPage: No users in store or not loading/error, fetching all users.");
            dispatch(fetchAllUsers());
        }
    }, [dispatch, allUsers, isLoadingUsers, fetchError]);

    // useEffect for finding the current user (remains the same)
    useEffect(() => {
        if (userId && allUsers && allUsers.length > 0) {
            console.log(`ViewUserPage: Searching for user ID '${userId}' in ${allUsers.length} users.`);
            const foundUser = allUsers.find(u => u.id === userId);
            if (foundUser) {
                console.log("ViewUserPage: User found:", foundUser);
                setCurrentUser(foundUser as any);
            } else {
                console.log("ViewUserPage: User not found in the list.");
                setCurrentUser(null);
            }
        } else if (userId && !isLoadingUsers && allUsers && allUsers.length === 0 && !fetchError) {
            console.log("ViewUserPage: All users fetched, but the list is empty. User not found.");
            setCurrentUser(null);
        }
    }, [userId, allUsers, isLoadingUsers, fetchError]);

    if (isLoadingUsers) {
        return <div className="p-6 text-center">Loading user details...</div>; // Add Skeleton loader later
    }

    if (fetchError) {
        return <div className="p-6 text-center text-red-600">{fetchError}</div>;
    }

    if (!currentUser) {
        // This case might be covered by the error state, but good to have
        return <div className="p-6 text-center">User data could not be loaded.</div>;
    }

    // Badge styling logic (can be extracted)
    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case "admin": return "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-100";
            case "teacher": return "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100";
            case "student": return "bg-green-100 text-green-800 border-green-300 hover:bg-green-100";
            default: return "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-100";
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "active": return "bg-green-100 text-green-800 border-green-300 hover:bg-green-100";
            case "inactive": return "bg-red-100 text-red-800 border-red-300 hover:bg-red-100";
            default: return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100"; // Or handle unknown status
        }
    };


    return (
        <AuthorizationGuard allowedRoles={['admin']}>
            <div className="mx-auto">
                <PageHeader
                    heading={`User Details`}
                    subheading={`Explore the details of the user ${currentUser.name}`}
                />
                <DyraneCard>
                    <DyraneCardHeader>
                        <DyraneCardTitle className="flex items-center gap-3">
                            <User className="h-6 w-6" />
                            {currentUser.name}
                        </DyraneCardTitle>
                        <DyraneCardDescription>
                            Viewing profile details for {currentUser.name}.
                        </DyraneCardDescription>
                    </DyraneCardHeader>
                    <DyraneCardContent className="space-y-4">
                        <div className="flex items-center gap-3 border-b pb-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm">{currentUser.email}</span>
                        </div>
                        <div className="flex items-center gap-3 border-b pb-3">
                            <Briefcase className="h-5 w-5 text-muted-foreground" />
                            <Badge variant="outline" className={`text-sm ${getRoleBadgeClass(currentUser.role)}`}>
                                {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 border-b pb-3">
                            {currentUser.status === 'active' ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                            <Badge variant="outline" className={`text-sm ${getStatusBadgeClass(currentUser.status)}`}>
                                {currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1)}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Joined on {formatDate(currentUser.createdAt)}</span>
                        </div>
                        {/* Add more details fields here */}
                    </DyraneCardContent>
                    <DyraneCardFooter className="flex justify-end">
                        <Button asChild>
                            <Link href={`/users/${userId}/edit`}>Edit User</Link>
                        </Button>
                    </DyraneCardFooter>
                </DyraneCard>
            </div>
        </AuthorizationGuard>
    );
}