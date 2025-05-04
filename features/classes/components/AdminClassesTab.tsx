// features/classes/componentsClassesTab.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { DyraneCard } from '@/components/dyrane-ui/dyrane-card';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, Search, AlertTriangle, Users, Eye, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchAllClassesAdmin, selectAllAdminClasses, selectAdminPagination, selectClassesStatus, selectClassesError, deleteClass, resetOperationStatus } from '../store/classes-slice'; // Adjust path
import type { AdminClassView } from '../types/classes-types';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';


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
        switch (status) {
            case 'active': return 'default'; // Greenish
            case 'upcoming': return 'secondary'; // Bluish/Grayish
            case 'inactive': case 'archived': return 'outline'; // Gray
            default: return 'outline';
        }
    };


    return (
        <DyraneCard>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <CardTitle>All Classes</CardTitle>
                    <DyraneButton size="sm" asChild>
                        {/* TODO: Link to admin class creation page */}
                        <Link href="/classes/create"><Plus className="mr-2 h-4 w-4" /> Create Class</Link>
                    </DyraneButton>
                </div>
                <div className="flex items-center gap-2 pt-4">
                    <Input
                        placeholder="Search by title or teacher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <DyraneButton onClick={handleSearch} size="sm" variant="outline" disabled={status === 'loading'}>
                        <Search className="mr-2 h-4 w-4" /> Search
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
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Class Title</TableHead>
                                    <TableHead>Teacher</TableHead>
                                    <TableHead className="text-center">Students</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allClasses.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No classes found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {allClasses.map((cls) => (
                                    <TableRow key={cls.id}>
                                        <TableCell className="font-medium">{cls.courseTitle}</TableCell>
                                        <TableCell>{cls.teacherName || 'N/A'}</TableCell>
                                        <TableCell className="text-center">{cls.studentCount}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(cls.status)} className="capitalize">
                                                {cls.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {/* TODO: Add real links */}
                                                <DyraneButton variant="ghost" size="icon" className="h-7 w-7" asChild>
                                                    <Link href={`/classes/${cls.id}`} title="View"><Eye className="h-4 w-4" /></Link>
                                                </DyraneButton>
                                                <DyraneButton variant="ghost" size="icon" className="h-7 w-7" asChild>
                                                    <Link href={`/classes/${cls.id}/edit`} title="Edit"><Edit className="h-4 w-4" /></Link>
                                                </DyraneButton>
                                                {/* Delete Button with Confirmation */}
                                                <ConfirmationDialog
                                                    title="Delete Class?"
                                                    description={<>This action cannot be undone. This will permanently delete the class <strong>{cls.courseTitle}</strong>.</>}
                                                    confirmText="Delete"
                                                    variant="destructive"
                                                    onConfirm={() => handleDeleteClass(cls.id, cls.courseTitle)}
                                                    trigger={
                                                        <DyraneButton variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" title="Delete">
                                                            <Trash2 className="h-4 w-4" />
                                                        </DyraneButton>
                                                    }
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
                {/* TODO: Add Pagination Controls based on pagination state */}
            </CardContent>
        </DyraneCard>
    );
};

export default AdminClassesTab;