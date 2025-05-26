// features/classes/components/AdminClassesTab.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, Search, AlertTriangle, Users, Eye, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminClassView } from '../types/classes-types';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { resetOperationStatus, selectAdminPagination, selectAllAdminClasses, selectClassesError, selectClassesStatus } from '../store/classes-slice';
import { deleteClass, fetchAllClassesAdmin } from '../store/classes-thunks';


const AdminClassesTab: React.FC = () => {
    const dispatch = useAppDispatch();
    const allClasses = useAppSelector(selectAllAdminClasses);
    const pagination = useAppSelector(selectAdminPagination);
    const status = useAppSelector(selectClassesStatus);
    const error = useAppSelector(selectClassesError);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    // TODO: Add state for page and limit if implementing pagination controls

    useEffect(() => {
        // Fetch initial data
        dispatch(fetchAllClassesAdmin({ search: searchTerm })); // Add pagination params later
    }, [dispatch]); // Fetch once initially

    // Log classes when they change
    useEffect(() => {
        console.log('Classes loaded:', allClasses.length);
        if (error) {
            console.error('Classes error:', error);
        }
    }, [allClasses, error]);

    // Optional: Debounce search or fetch on button click
    const handleSearch = () => {
        dispatch(fetchAllClassesAdmin({ search: searchTerm, page: 1 })); // Reset to page 1 on search
    };

    // --- Delete Handler ---
    const handleDeleteClass = async (classId: string, classTitle: string) => {
        try {
            await dispatch(deleteClass(classId)).unwrap();
            toast({
                title: "Class Deleted",
                description: `Class "${classTitle}" has been deleted.`,
                variant: "destructive",
            });
            // Optionally refetch classes if not using RTK Query
            // dispatch(fetchAllClassesAdmin({ search: searchTerm }));
            // Or just rely on the slice to handle it
            // dispatch(fetchAllClassesAdmin({ page: pagination.currentPage, limit: pagination.pageSize }));
            // No need to refetch manually if slice removes it
            dispatch(resetOperationStatus()); // Reset status
        } catch (error: any) {
            toast({
                title: "Error Deleting Class",
                description: error.message || 'Failed to delete class.',
                variant: "destructive",
            });
            dispatch(resetOperationStatus());
        }
    };

    const getStatusBadgeVariant = (status: AdminClassView['status']): "default" | "secondary" | "outline" | "destructive" => {
        switch (status?.toLowerCase()) {
            case 'active': return 'default'; // Green
            case 'upcoming': return 'secondary'; // Blue
            case 'full': return 'secondary'; // Blue
            case 'inactive': return 'outline'; // Gray
            case 'archived': return 'outline'; // Gray
            case 'cancelled': return 'destructive'; // Red
            default: return 'outline';
        }
    };


    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-50">All Classes</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your class sessions and enrollments</p>
                    </div>
                    <Link href="/classes/create">
                        <DyraneButton size="sm">
                            <Plus className="mr-2 h-4 w-4" /> Create Class
                        </DyraneButton>
                    </Link>
                </div>
                <div className="flex items-center gap-2 pt-6 mt-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by title or facilitator..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus-visible:ring-blue-500"
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <DyraneButton
                        onClick={handleSearch}
                        size="sm"
                        variant="outline"
                        disabled={status === 'loading'}
                        className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        {status === 'loading' ? (
                            <>
                                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                                Searching...
                            </>
                        ) : (
                            <>Search</>
                        )}
                    </DyraneButton>
                </div>
            </CardHeader>
            <CardContent>
                {status === 'loading' && (
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                )}
                {status === 'failed' && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error Loading Classes</AlertTitle>
                        <AlertDescription>{error || 'Could not load classes.'}</AlertDescription>
                    </Alert>
                )}
                {status === 'succeeded' && (
                    <div className="border rounded-lg overflow-hidden shadow-sm">
                        <Table className="border-collapse">
                            <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                                <TableRow>
                                    <TableHead className="font-medium text-gray-600 dark:text-gray-300">Class Name</TableHead>
                                    <TableHead className="font-medium text-gray-600 dark:text-gray-300">Course</TableHead>
                                    <TableHead className="font-medium text-gray-600 dark:text-gray-300">Instructor</TableHead>
                                    <TableHead className="font-medium text-gray-600 dark:text-gray-300 text-center">Enrolment</TableHead>
                                    <TableHead className="font-medium text-gray-600 dark:text-gray-300">Schedule</TableHead>
                                    <TableHead className="font-medium text-gray-600 dark:text-gray-300">Status</TableHead>
                                    <TableHead className="font-medium text-gray-600 dark:text-gray-300 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allClasses.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-2 text-gray-500 dark:text-gray-400">
                                                <Users className="h-8 w-8 opacity-40" />
                                                <p>No classes found</p>
                                                <p className="text-sm">Create a new class to get started</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {allClasses.map((cls) => (
                                    <TableRow key={cls.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">{cls.courseTitle}</TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">
                                            {cls.course ? cls.course.name : cls.courseId}
                                        </TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">{cls.teacherName || 'N/A'}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex flex-col">
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                    {cls.enrolledStudentsCount || cls.studentCount || 0} / {cls.maxStudents || cls.max_students || 30}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {cls.availableSlots || cls.available_slots || (cls.maxStudents && cls.studentCount ? (cls.maxStudents - cls.studentCount) : 0) + (cls.maxSlots || cls.max_slots || 0) - (cls.enrolledStudentsCount || cls.studentCount || 0)} slots available
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {cls.schedule ? (
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        {cls.schedule.days?.join(', ')}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {cls.schedule.time} ({cls.schedule.duration})
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-500 dark:text-gray-400">No schedule</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={getStatusBadgeVariant(cls.status)}
                                                className="capitalize font-medium px-2.5 py-0.5 text-xs rounded-full"
                                            >
                                                {cls.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end space-x-2">
                                                <div className="rounded-full p-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                    <Link href={`/classes/${cls.id}`} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none" title="View details">
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </div>

                                                <div className="rounded-full p-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                    <Link href={`/classes/${cls.id}/edit`} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none" title="Edit class">
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </div>

                                                {/* Delete Button with Confirmation */}
                                                <ConfirmationDialog
                                                    title="Delete Class?"
                                                    description={
                                                        <div className="space-y-2">
                                                            <p>This action cannot be undone.</p>
                                                            <p>This will permanently delete the class <strong>{cls.courseTitle}</strong>.</p>
                                                        </div>
                                                    }
                                                    confirmText="Delete"
                                                    variant="destructive"
                                                    onConfirm={() => handleDeleteClass(cls.id, cls.courseTitle!)}
                                                    trigger={
                                                        <div className="rounded-full p-1.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer">
                                                            <span className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 focus:outline-none" title="Delete class">
                                                                <Trash2 className="h-4 w-4" />
                                                            </span>
                                                        </div>
                                                    }
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                                }
                            </TableBody>
                        </Table>
                    </div>
                )}
                {/* TODO: Add Pagination Controls based on pagination state */}
            </CardContent>
        </Card>
    );
}

export default AdminClassesTab;