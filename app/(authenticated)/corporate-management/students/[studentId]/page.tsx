// app/(authenticated)/corporate-management/students/[studentId]/page.tsx
"use client";

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { AuthorizationGuard } from '@/components/auth/AuthenticationGuard';
import { DyraneCard, DyraneCardContent, DyraneCardHeader, DyraneCardTitle, DyraneCardDescription, DyraneCardFooter } from '@/components/dyrane-ui/dyrane-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, User, Mail, CalendarDays, CheckCircle, XCircle, Info, BookOpen } from 'lucide-react'; // Use CalendarDays
import { format, isValid, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import type { StudentUser } from '@/types/user.types';
import { isStudent } from '@/types/user.types';
// TODO: Import fetchManagedStudentById, selectCurrentManagedStudent, selectCorporateStatus, clearCurrentManagedStudent
import {
    // fetchManagedStudentById, // Need this thunk
    selectCurrentManagedStudent,
    selectCorporateStatus,
    clearCurrentManagedStudent
} from '@/features/corporate/store/corporate-slice'; // Adjust path
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';

// Helper to format date
const formatDateDisplay = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try { const date = parseISO(dateString); return isValid(date) ? format(date, "PPP") : 'Invalid Date'; }
    catch { return 'Invalid Date'; }
};

// Helper for Status Badge
const getStudentStatusBadge = (isActive?: boolean) => {
    return isActive === true ? ( // Check explicitly for true
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-100 dark:border-green-700">
            <CheckCircle className="mr-1 h-3 w-3" />Active
        </Badge>
    ) : (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-100 dark:border-red-700">
            <XCircle className="mr-1 h-3 w-3" />Inactive
        </Badge>
    );
};

// Helper for Onboarding Status
const getOnboardingBadge = (status?: StudentUser['onboardingStatus']) => {
    switch (status) {
        case 'complete': return <Badge variant="default">Complete</Badge>;
        case 'pending_verification': return <Badge variant="secondary">Pending</Badge>;
        case 'incomplete':
        default: return <Badge variant="outline">Incomplete</Badge>;
    }
};


export default function ViewManagedStudentPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const studentId = params.studentId as string;
    const { user } = useAppSelector(state => state.auth); // The logged-in manager

    // TODO: Select the *specific* student being viewed
    const currentStudent = useAppSelector(selectCurrentManagedStudent); // Use the selector for the single student
    const status = useAppSelector(selectCorporateStatus); // Use status from corporate slice

    useEffect(() => {
        if (studentId) {
            // TODO: Dispatch action to fetch the specific student's details
            // This might reuse a general fetchUserById if backend permissions allow,
            // or require a specific endpoint like GET /corporate/students/:studentId
            // dispatch(fetchManagedStudentById(studentId));
            console.warn("TODO: Dispatch fetchManagedStudentById(" + studentId + ")");
            // Mock fetch for now:
            const mockStudent = user && isStudent(user) && user.isCorporateManager
                ? user // Just show the manager for now as placeholder
                : null; // Or fetch from a mock list
            // Simulate setting the student after fetch:
            // dispatch({ type: 'corporate/setCurrentManagedStudent', payload: mockStudent });
        }
        // Clear on unmount
        return () => { dispatch(clearCurrentManagedStudent()); }
    }, [dispatch, studentId]);

    const isLoading = status === 'loading';
    const corporateManager = React.useMemo(() => (user && isStudent(user) && user.isCorporateManager ? user : null), [user]);


    // Authorization Check
    if (!corporateManager) {
        return <AuthorizationGuard allowedRoles={[]}><p>Access Denied.</p></AuthorizationGuard>;
    }
    // Check if the viewed student belongs to this manager (important!)
    // This check should ideally happen in the selector or after fetching
    // const isAuthorizedToView = currentStudent?.corporateId === corporateManager.corporateId;
    // if (!isLoading && currentStudent && !isAuthorizedToView) {
    //     return <AuthorizationGuard allowedRoles={[]}><p>You do not manage this student.</p></AuthorizationGuard>;
    // }


    return (
        <AuthorizationGuard allowedRoles={['student']}>
            {corporateManager && (
                <div className="mx-auto">
                    <DyraneButton variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Student List
                    </DyraneButton>

                    {isLoading && (
                        <DyraneCard>
                            <DyraneCardHeader><Skeleton className="h-8 w-3/4" /></DyraneCardHeader>
                            <DyraneCardContent className="space-y-4"><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /><Skeleton className="h-16 w-full" /></DyraneCardContent>
                        </DyraneCard>
                    )}

                    {!isLoading && !currentStudent && status === 'succeeded' && (
                        <p className='text-center text-muted-foreground mt-10'>Student not found or access denied.</p>
                    )}

                    {currentStudent && !isLoading && (
                        <DyraneCard>
                            <DyraneCardHeader>
                                <DyraneCardTitle>{currentStudent.name || <span className='italic text-muted-foreground'>Name Not Set</span>}</DyraneCardTitle>
                                <DyraneCardDescription>Details for managed student.</DyraneCardDescription>
                            </DyraneCardHeader>
                            <DyraneCardContent className="space-y-4">
                                <div className="flex items-center gap-3 border-b pb-3">
                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                    <div><p className="text-sm font-medium">Email</p><p className="text-sm text-muted-foreground">{currentStudent.email}</p></div>
                                </div>
                                <div className="flex items-center gap-3 border-b pb-3">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                    <div><p className="text-sm font-medium">Account Status</p>{getStudentStatusBadge(currentStudent.isActive)}</div>
                                </div>
                                <div className="flex items-center gap-3 border-b pb-3">
                                    <Info className="h-5 w-5 text-muted-foreground" />
                                    <div><p className="text-sm font-medium">Onboarding Status</p>{getOnboardingBadge(currentStudent.onboardingStatus)}</div>
                                </div>
                                <div className="flex items-center gap-3 border-b pb-3">
                                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Assigned Class/Course</p>
                                        <p className="text-sm text-muted-foreground">{currentStudent.classId || 'None'}</p>
                                        {/* TODO: Fetch and display class name */}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                                    <div><p className="text-sm font-medium">Date of Birth</p><p className="text-sm text-muted-foreground">{formatDateDisplay(currentStudent.dateOfBirth)}</p></div>
                                </div>
                                {/* TODO: Add Attendance Summary / Progress Section */}

                            </DyraneCardContent>
                            <DyraneCardFooter className="flex justify-end">
                                <Button asChild>
                                    <Link href={`/corporate-management/students/${studentId}/edit`}>Edit Student</Link>
                                </Button>
                            </DyraneCardFooter>
                        </DyraneCard>
                    )}
                </div>
            )}
        </AuthorizationGuard>
    );
}