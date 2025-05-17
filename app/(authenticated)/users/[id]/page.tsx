// app/(authenticated)/users/[id]/page.tsx
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthorizationGuard } from "@/components/auth/AuthenticationGuard";
import { DyraneCard, DyraneCardContent, DyraneCardHeader, DyraneCardTitle, DyraneCardDescription, DyraneCardFooter } from '@/components/dyrane-ui/dyrane-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { UserData } from '@/components/users/UserTableRow'; // Use shared type
import Link from 'next/link';
import { User, Mail, Calendar, CheckCircle, XCircle, Briefcase, AlertTriangle } from 'lucide-react'; // Icons for details
import { PageHeader } from '@/components/layout/auth/page-header';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useSafeArraySelector } from '@/store/safe-hooks';
import { fetchUserById } from '@/features/auth/store/user-thunks';
import { safeString, safeFormatDate } from '@/lib/utils/safe-data';


// Helper to format date using safe utilities
const formatDate = (dateString?: string) => {
    return safeFormatDate(
        dateString,
        (date) => date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        'N/A'
    );
};

export default function ViewUserPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const userId = params.id as string; // Get ID from route params

    // --- Select relevant parts using safe selectors ---
    const allUsers = useSafeArraySelector((state) => state.auth.users);
    const isLoadingUsers = useAppSelector((state) => state.auth.usersLoading) || false;
    const fetchError = useAppSelector((state) => state.auth.usersError);

    const [currentUser, setCurrentUser] = useState<UserData | null | undefined>(undefined);

    // useEffect for fetching the specific user by ID
    useEffect(() => {
        if (userId && !isLoadingUsers) {
            console.log(`ViewUserPage: Fetching user with ID '${userId}'`);
            dispatch(fetchUserById(userId));
        }
    }, [dispatch, userId, isLoadingUsers]);

    // useEffect for finding the current user in the store
    useEffect(() => {
        // Skip if we're still loading
        if (isLoadingUsers) return;

        if (userId && allUsers) {
            console.log(`ViewUserPage: Searching for user ID '${userId}' in ${allUsers.length} users.`);
            const foundUser = allUsers.find(u => u.id === userId);

            if (foundUser) {
                console.log("ViewUserPage: User found:", foundUser);
                setCurrentUser(foundUser);
            } else if (!isLoadingUsers) {
                // Only set to null if we're not loading and the user wasn't found
                console.log("ViewUserPage: User not found in the list.");
                setCurrentUser(null);
            }
        }
    }, [userId, allUsers, isLoadingUsers]);

    if (isLoadingUsers) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
                <Skeleton className="h-[300px] w-full rounded-lg" />
            </div>
        );
    }

    if (fetchError) {
        return (
            <Alert variant="destructive" className="m-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Loading User</AlertTitle>
                <AlertDescription>{fetchError}</AlertDescription>
            </Alert>
        );
    }

    if (!currentUser) {
        // This case might be covered by the error state, but good to have
        return (
            <Alert variant="default" className="m-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>User Not Found</AlertTitle>
                <AlertDescription>
                    The requested user could not be found. Please check the user ID and try again.
                </AlertDescription>
            </Alert>
        );
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

    // Convert boolean isActive to a status string for display
    const getStatusString = (isActive: boolean | string | null | undefined): string => {
        if (typeof isActive === 'boolean') {
            return isActive ? 'active' : 'inactive';
        } else if (typeof isActive === 'string') {
            return isActive === 'true' ? 'active' : 'inactive';
        }
        return 'unknown';
    };

    const getStatusBadgeClass = (isActive: boolean | string | null | undefined) => {
        const status = getStatusString(isActive);
        switch (status) {
            case "active": return "bg-green-100 text-green-800 border-green-300 hover:bg-green-100";
            case "inactive": return "bg-red-100 text-red-800 border-red-300 hover:bg-red-100";
            default: return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100";
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
                            <Badge variant="outline" className={`text-sm ${getRoleBadgeClass(safeString(currentUser.role))}`}>
                                {safeString(currentUser.role)
                                    ? `${safeString(currentUser.role).charAt(0).toUpperCase()}${safeString(currentUser.role).slice(1)}`
                                    : 'Unknown'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 border-b pb-3">
                            {currentUser.isActive
                                ? <CheckCircle className="h-5 w-5 text-green-600" />
                                : <XCircle className="h-5 w-5 text-red-600" />}
                            <Badge variant="outline" className={`text-sm ${getStatusBadgeClass(currentUser.isActive)}`}>
                                {getStatusString(currentUser.isActive).charAt(0).toUpperCase() + getStatusString(currentUser.isActive).slice(1)}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 border-b pb-3">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Joined on {formatDate(currentUser.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-3 border-b pb-3">
                            {safeString(currentUser.onboardingStatus) === 'complete'
                                ? <CheckCircle className="h-5 w-5 text-green-600" />
                                : <AlertTriangle className="h-5 w-5 text-amber-500" />}
                            <Badge variant={safeString(currentUser.onboardingStatus) === 'complete' ? 'outline' : 'secondary'} className="text-sm">
                                Onboarding: {safeString(currentUser.onboardingStatus).charAt(0).toUpperCase() + safeString(currentUser.onboardingStatus).slice(1)}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">Barcode ID</span>
                                <span className="text-sm text-muted-foreground">{safeString(currentUser.barcodeId, 'Not assigned')}</span>
                            </div>
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