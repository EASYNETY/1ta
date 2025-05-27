// app/(authenticated)/corporate-management/page.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, Users, Building, AlertTriangle } from 'lucide-react';
import { isStudent } from '@/types/user.types';
import { toast } from 'sonner';
import { PaginationControls, PaginationInfo } from '@/components/ui/pagination-controls';
import { PAGINATION_CONFIG, isServerPaginationEnabled } from '@/config/pagination';
import { useEnhancedHybridPagination } from '@/hooks/use-hybrid-pagination';

// Import Corporate specific components and actions
import { CorporateStudentTable } from '@/features/corporate/components/CorporateStudentTable'; // Adjust path
import {
    fetchManagedStudents,
    deleteManagedStudent,
    selectManagedStudents,
    selectCorporateStatus,
    selectCorporateError,
    selectCorporateOperationStatus,
    resetOperationStatus as resetCorpStatus, // Import reset action
    clearCorporateError, // Import clear error action
} from '@/features/corporate/store/corporate-slice'; // Adjust path
import { AuthorizationGuard } from '@/components/auth/AuthenticationGuard';

export default function CorporateManagementDashboardPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user, isInitialized } = useAppSelector((state) => state.auth);

    // Selectors for corporate state
    const managedStudents = useAppSelector(selectManagedStudents);
    const status = useAppSelector(selectCorporateStatus); // Fetch status
    const operationStatus = useAppSelector(selectCorporateOperationStatus); // CUD status
    const error = useAppSelector(selectCorporateError);
    const pagination = useAppSelector((state) => state.corporate.pagination); // Use pagination state

    // Pagination state and configuration
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);
    const serverPaginated = isServerPaginationEnabled('CORPORATE_STUDENTS_SERVER_PAGINATION');

    // Derived manager info
    const corporateManager = useMemo(() => (user && isStudent(user) && user.isCorporateManager ? user : null), [user]);
    const purchasedSlots = corporateManager?.purchasedStudentSlots ?? 0;
    // Use totalStudents from pagination state if available, otherwise use list length
    const usedSlots = pagination?.totalStudents ?? managedStudents.length;
    const canAddMoreStudents = usedSlots < purchasedSlots;

    // Apply hybrid pagination to students
    const paginationResult = useEnhancedHybridPagination({
        data: managedStudents,
        currentPage,
        itemsPerPage,
        serverPaginated,
        serverMetadata: pagination ? {
            totalUsers: pagination.totalStudents,
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
        } : undefined,
    });

    const {
        paginatedData: paginatedStudents,
        totalItems,
        totalPages,
    } = paginationResult;

    // Fetch managed students
    const fetchStudents = useCallback((page = 1) => {
        if (corporateManager?.corporateId) {
            dispatch(fetchManagedStudents({ corporateId: corporateManager.corporateId, page }));
            setCurrentPage(page);
        }
    }, [dispatch, corporateManager?.corporateId]);

    // Handle page change for pagination
    const handlePageChange = (page: number) => {
        if (serverPaginated) {
            // Server-side pagination: fetch new page
            fetchStudents(page);
        } else {
            // Client-side pagination: just update current page
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        if (corporateManager?.corporateId) {
            fetchStudents(1); // Fetch initial page
            dispatch(clearCorporateError()); // Clear error on load
        }
        // Reset CUD status on mount/unmount
        return () => { dispatch(resetCorpStatus()); };
    }, [dispatch, corporateManager?.corporateId, fetchStudents]); // Depend on stable fetchStudents

    // Delete Handler
    const handleDeleteStudent = async (studentId: string, studentName: string) => {
        if (!corporateManager?.corporateId) return;
        try {
            await dispatch(deleteManagedStudent({ corporateId: corporateManager.corporateId, studentId })).unwrap();
            toast.success(`Student "${studentName}" removed successfully.`);

            // Handle pagination after deletion
            if (serverPaginated) {
                // Server-side: refetch current page or go to previous if current becomes empty
                if (managedStudents.length === 1 && currentPage > 1) {
                    fetchStudents(currentPage - 1);
                } else {
                    fetchStudents(currentPage);
                }
            } else {
                // Client-side: reset to page 1 if current page becomes empty after deletion
                const remainingItems = totalItems - 1;
                const maxPage = Math.ceil(remainingItems / itemsPerPage);
                if (currentPage > maxPage && maxPage > 0) {
                    setCurrentPage(maxPage);
                }
            }
            dispatch(resetCorpStatus());
        } catch (err: any) {
            toast.error(`Failed to remove student: ${err.message || 'Unknown error'}`);
            dispatch(resetCorpStatus());
        }
    };

    const isLoading = status === 'loading' && managedStudents.length === 0; // Show skeleton only on initial load
    const isDeleting = operationStatus === 'loading';

    // Render loading state or redirect if user/manager data isn't ready
    if (!isInitialized) {
        return <div className="p-6"><Skeleton className="h-20 w-full" /><Skeleton className="h-64 w-full mt-4" /></div>;
    }
    if (!user) { router.push('/login'); return null; } // Redirect if not logged in
    if (!corporateManager) {
        // If user is loaded but not a manager, show error/redirect
        return <AuthorizationGuard allowedRoles={[]}><p>Access Denied: Not a Corporate Manager.</p></AuthorizationGuard>;
    }


    return (
        <AuthorizationGuard allowedRoles={['student']}>
            {/* We know user is a manager here */}
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Building className="h-7 w-7 text-primary" />
                            {corporateManager.corporateAccountName || `${corporateManager.name}'s Organization`}
                        </h1>
                        <p className="text-muted-foreground">Manage your corporate students and enrolments.</p>
                    </div>
                    <DyraneButton
                        size="sm"
                        asChild
                        disabled={!canAddMoreStudents}
                        title={!canAddMoreStudents ? `All ${purchasedSlots} slots used` : "Add New Student"}
                    >
                        <Link href="/corporate-management/students/create">
                            <Plus className="mr-2 h-4 w-4" /> Add Student
                        </Link>
                    </DyraneButton>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Slots</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{purchasedSlots}</div><p className="text-xs text-muted-foreground">Purchased/Allocated</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Used Slots</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{usedSlots}</div><p className="text-xs text-muted-foreground">Students managed</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Available Slots</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{purchasedSlots - usedSlots}</div><p className="text-xs text-muted-foreground">Ready for new students</p></CardContent>
                    </Card>
                </div>
                {!canAddMoreStudents && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Slot Limit Reached</AlertTitle>
                        <AlertDescription>You have used all {purchasedSlots} purchased student slots. Contact support or purchase more slots to add new students.</AlertDescription>
                    </Alert>
                )}

                {/* Student Management Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Managed Students</CardTitle>
                        <CardDescription>View, edit, or remove students associated with your organization.</CardDescription>
                        {/* TODO: Add Search Input */}
                    </CardHeader>
                    <CardContent>
                        {isLoading && <Skeleton className="h-40 w-full" />}
                        {!isLoading && status === 'failed' && <p className='text-red-600 text-center'>{error || 'Failed to load students.'}</p>}
                        {!isLoading && status === 'succeeded' && (
                            <CorporateStudentTable
                                students={serverPaginated ? managedStudents : paginatedStudents}
                                onDeleteStudent={handleDeleteStudent}
                                // Pass isDeleting status to disable row actions
                                isDeleting={isDeleting} // Pass this if table row needs it
                            />
                        )}
                    </CardContent>

                    {/* Pagination Controls */}
                    {!isLoading && status === 'succeeded' && totalPages > 1 && (
                        <CardFooter>
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                                <PaginationInfo
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={totalItems}
                                    itemsPerPage={itemsPerPage}
                                />
                                <PaginationControls
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    className="w-full flex-1 justify-end"
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        </CardFooter>
                    )}
                </Card>

                {/* TODO: Add Class Enrolment Management Section */}

            </div>

        </AuthorizationGuard>
    );
}