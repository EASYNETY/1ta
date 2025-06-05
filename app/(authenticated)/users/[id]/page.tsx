// app/(authenticated)/users/[id]/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthorizationGuard } from "@/components/auth/AuthenticationGuard";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import {
    User as UserIcon, Mail, Clock, GraduationCap,
    BookOpen, ShieldCheck, FileText, Pencil, AlertTriangle
} from 'lucide-react'; // Icons for details
import { PageHeader } from '@/components/layout/auth/page-header';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useSafeArraySelector } from '@/store/safe-hooks';
import { fetchUserById } from '@/features/auth/store/user-thunks';
import { safeString, safeFormatDate, safeBoolean } from '@/lib/utils/safe-data';

// Import the User type from the types directory
import { hasAdminAccess, type User } from '@/types/user.types';
import { AdminGuard } from '@/components/auth/PermissionGuard';


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
    const dispatch = useAppDispatch();
    const userId = params.id as string; // Get ID from route params

    // --- Select relevant parts using safe selectors ---
    const allUsers = useSafeArraySelector((state) => state.auth.users);
    const isLoadingUsers = useAppSelector((state) => state.auth.usersLoading) || false;
    const fetchError = useAppSelector((state) => state.auth.usersError);

    // Use any for now to avoid type issues, we'll handle the proper typing in the component
    const [currentUser, setCurrentUser] = useState<any>(undefined);

    // useEffect for fetching the specific user by ID
    useEffect(() => {
        if (userId) {
            console.log(`ViewUserPage: Fetching user with ID '${userId}'`);
            dispatch(fetchUserById(userId))
                .unwrap()
                .then(user => {
                    console.log("ViewUserPage: Successfully fetched user:", user);
                    // Directly set the user from the API response
                    setCurrentUser(user);
                })
                .catch(error => {
                    console.error("ViewUserPage: Error fetching user:", error);
                });
        }
    }, [dispatch, userId]);

    // useEffect for finding the current user in the store
    useEffect(() => {
        // Skip if we're still loading
        if (isLoadingUsers) return;

        if (userId && allUsers) {
            console.log(`ViewUserPage: Searching for user ID '${userId}' in ${allUsers.length} users.`);
            // add type assertion
            const foundUser = allUsers.find((u: any) => u.id === userId);

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
            case "super_admin": return "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-100";
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
        <AuthorizationGuard allowedRoles={['admin', 'super_admin', 'customer_care']}>
            <div className="mx-auto">
                <PageHeader
                    heading={`User Profile`}
                    subheading={`Viewing details for ${safeString(currentUser.name, 'Unknown User')}`}
                    actions={
                        <AdminGuard>
                            <Button asChild variant="outline" className="gap-2">
                                <Link href={`/users/${userId}/edit`}>
                                    <Pencil className="h-4 w-4" />
                                    Edit Profile
                                </Link>
                            </Button>
                        </AdminGuard>
                    }
                />

                {/* Main content with two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column - User Summary */}
                    <Card className="lg:col-span-1 h-full">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <UserIcon className="h-5 w-5 text-primary" />
                                Profile Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* User Avatar & Name */}
                            <div className="flex flex-col items-center justify-center pb-4 text-center">
                                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-3">
                                    <UserIcon className="h-12 w-12 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold">{safeString(currentUser.name, 'Unknown User')}</h3>
                                <p className="text-sm text-muted-foreground">{safeString(currentUser.email, 'No email provided')}</p>
                            </div>

                            {/* Key Information */}
                            <div className="space-y-3">
                                {/* Role */}
                                <div className="flex justify-between items-center py-2 ">
                                    <span className="text-sm font-medium">Role</span>
                                    <Badge variant="outline" className={`${getRoleBadgeClass(safeString(currentUser.role))}`}>
                                        {safeString(currentUser.role)
                                            ? `${safeString(currentUser.role).charAt(0).toUpperCase()}${safeString(currentUser.role).slice(1)}`
                                            : 'Unknown'}
                                    </Badge>
                                </div>

                                {/* Status */}
                                <div className="flex justify-between items-center py-2 ">
                                    <span className="text-sm font-medium">Status</span>
                                    <Badge variant="outline" className={`${getStatusBadgeClass(currentUser.isActive)}`}>
                                        {(() => {
                                            const status = getStatusString(currentUser.isActive);
                                            return status.charAt(0).toUpperCase() + status.slice(1);
                                        })()}
                                    </Badge>
                                </div>

                                {/* Account Type */}
                                <div className="flex justify-between items-center py-2 ">
                                    <span className="text-sm font-medium">Account Type</span>
                                    <span className="text-sm">
                                        {safeString(currentUser.accountType, 'individual')
                                            .charAt(0).toUpperCase() + safeString(currentUser.accountType, 'individual').slice(1)}
                                    </span>
                                </div>

                                {/* Joined Date */}
                                <div className="flex justify-between items-center py-2 ">
                                    <span className="text-sm font-medium">Joined</span>
                                    <span className="text-sm">{formatDate(currentUser.createdAt)}</span>
                                </div>

                                {/* Onboarding Status */}
                                <div className="flex justify-between items-center py-2 ">
                                    <span className="text-sm font-medium">Onboarding</span>
                                    <Badge variant={safeString(currentUser.onboardingStatus) === 'complete' ? 'outline' : 'secondary'}>
                                        {safeString(currentUser.onboardingStatus, 'incomplete').charAt(0).toUpperCase() +
                                            safeString(currentUser.onboardingStatus, 'incomplete').slice(1)}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Column - Detailed Information */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Contact Information */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-primary" />
                                    Contact Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Email */}
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Email Address</p>
                                        <p className="text-sm text-muted-foreground">{safeString(currentUser.email, 'No email provided')}</p>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Phone Number</p>
                                        <p className="text-sm text-muted-foreground">{safeString(currentUser.phone, 'No phone number provided')}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Role-Specific Information */}
                        {currentUser.role === 'student' && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <GraduationCap className="h-5 w-5 text-primary" />
                                        Student Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Barcode ID */}
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Barcode ID</p>
                                            <p className="text-sm text-muted-foreground">{safeString(currentUser.barcodeId, 'Not assigned')}</p>
                                        </div>

                                        {/* Date of Birth */}
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Date of Birth</p>
                                            <p className="text-sm text-muted-foreground">{formatDate(currentUser.dateOfBirth)}</p>
                                        </div>

                                        {/* Class */}
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Class</p>
                                            <p className="text-sm text-muted-foreground">{safeString(currentUser.classId, 'Not assigned')}</p>
                                        </div>

                                        {/* Corporate Information (if applicable) */}
                                        {safeString(currentUser.corporateId) && (
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">Corporate Account</p>
                                                <p className="text-sm text-muted-foreground">{safeString(currentUser.corporateAccountName, 'Unknown')}</p>
                                                {safeBoolean(currentUser.isCorporateManager) && (
                                                    <Badge variant="outline" className="mt-1 bg-blue-100 text-blue-800 border-blue-300">Corporate Manager</Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {currentUser.role === 'teacher' && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-primary" />
                                        Teacher Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Subjects */}
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Subjects</p>
                                        <div className="flex flex-wrap gap-1">
                                            {currentUser.subjects && Array.isArray(currentUser.subjects) && currentUser.subjects.length > 0 ? (
                                                currentUser.subjects.map((subject: string, index: number) => (
                                                    <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                                                        {subject}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-sm text-muted-foreground">No subjects assigned</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Office Hours */}
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Office Hours</p>
                                        <p className="text-sm text-muted-foreground">{safeString(currentUser.officeHours, 'Not specified')}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {hasAdminAccess(currentUser) && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <ShieldCheck className="h-5 w-5 text-primary" />
                                        Admin Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Permissions */}
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Permissions</p>
                                        <div className="flex flex-wrap gap-1">
                                            {currentUser.permissions && Array.isArray(currentUser.permissions) && currentUser.permissions.length > 0 ? (
                                                currentUser.permissions.map((permission: string, index: number) => (
                                                    <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700">
                                                        {permission}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-sm text-muted-foreground">All permissions (default admin)</span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Access Information */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-primary" />
                                    Access Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Last Login */}
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Last Login</p>
                                        <p className="text-sm text-muted-foreground">{formatDate(currentUser.lastLogin) || 'Never'}</p>
                                    </div>

                                    {/* Last Updated */}
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Last Updated</p>
                                        <p className="text-sm text-muted-foreground">{formatDate(currentUser.updatedAt)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bio Section - Only if bio exists */}
                        {safeString(currentUser.bio) && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-primary" />
                                        Biography
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {safeString(currentUser.bio, 'No bio provided')}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AuthorizationGuard>
    );
}