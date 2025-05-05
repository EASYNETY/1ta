// app/(authenticated)/classes/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchClassById, selectCurrentClass, selectClassesStatus, clearCurrentClass } from '@/features/classes/store/classes-slice';
import { DyraneCard, DyraneCardContent, DyraneCardHeader, DyraneCardTitle, DyraneCardDescription, DyraneCardFooter } from '@/components/dyrane-ui/dyrane-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, User, Info, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import type { AdminClassView } from '@/features/classes/types/classes-types';
import { AuthorizationGuard } from '@/components/auth/AuthenticationGuard';
import { Users } from 'phosphor-react';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { PageHeader } from '@/components/layout/auth/page-header';

// Helper to format date range or single date
const formatDateDisplay = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        return isValid(date) ? format(date, "PPP") : 'Invalid Date';
    } catch { return 'Invalid Date'; }
};

// Helper for Status Badge
const getStatusBadge = (status: AdminClassView['status']) => {
    switch (status) {
        case 'active': return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="mr-1 h-3 w-3" />Active</Badge>;
        case 'upcoming': return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Upcoming</Badge>;
        case 'inactive': return <Badge variant="outline"><XCircle className="mr-1 h-3 w-3" />Inactive</Badge>;
        case 'archived': return <Badge variant="outline">Archived</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
};

export default function ViewClassPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const classId = params.id as string;

    const currentClass = useAppSelector(selectCurrentClass);
    const status = useAppSelector(selectClassesStatus);

    useEffect(() => {
        if (classId) {
            dispatch(fetchClassById(classId));
        }
        return () => { dispatch(clearCurrentClass()); } // Clear on unmount
    }, [dispatch, classId]);

    const isLoading = status === 'loading';

    return (
        <AuthorizationGuard allowedRoles={['admin']}> {/* Adjust roles if needed */}
            <div className="mx-auto">
                <PageHeader
                    heading={`Class Details`}
                    subheading={`Explore the details of ${currentClass?.courseTitle}`}
                />

                {isLoading && (
                    <DyraneCard>
                        <DyraneCardHeader>
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-2" />
                        </DyraneCardHeader>
                        <DyraneCardContent className="space-y-4">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-6 w-1/3" />
                        </DyraneCardContent>
                    </DyraneCard>
                )}

                {!isLoading && !currentClass && status === 'succeeded' && (
                    <p className='text-center text-muted-foreground mt-10'>Class not found.</p>
                )}

                {currentClass && !isLoading && (
                    <DyraneCard>
                        <DyraneCardHeader>
                            <DyraneCardTitle>{currentClass.courseTitle}</DyraneCardTitle>
                            <DyraneCardDescription>Details for this class session.</DyraneCardDescription>
                        </DyraneCardHeader>
                        <DyraneCardContent className="space-y-4">
                            <div className="flex items-center gap-3 border-b pb-3">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Instructor</p>
                                    <p className="text-sm text-muted-foreground">{currentClass.teacherName || 'Not Assigned'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 border-b pb-3">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Enrolled Students</p>
                                    <p className="text-sm text-muted-foreground">{currentClass.studentCount}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 border-b pb-3">
                                <Info className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Status</p>
                                    {getStatusBadge(currentClass.status)}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 border-b pb-3">
                                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Dates</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDateDisplay(currentClass.startDate)} - {formatDateDisplay(currentClass.endDate)}
                                    </p>
                                </div>
                            </div>
                            {currentClass.description && (
                                <div>
                                    <p className="text-sm font-medium mb-1">Description</p>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{currentClass.description}</p>
                                </div>
                            )}
                            {/* TODO: Add link/section to view Schedule Events for this class */}

                        </DyraneCardContent>
                        <DyraneCardFooter className="flex justify-end">
                            <Button asChild>
                                <Link href={`/classes/${classId}/edit`}>Edit Class</Link>
                            </Button>
                        </DyraneCardFooter>
                    </DyraneCard>
                )}
            </div>
        </AuthorizationGuard>
    );
}