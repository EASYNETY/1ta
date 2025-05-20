// features/corporate/components/CorporateStudentTableRow.tsx
import React from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { MoreHorizontal, User, Eye, Pencil, Trash2, CheckCircle, XCircle, Slash } from 'lucide-react'; // Added Slash for disabled
import type { StudentUser } from '@/types/user.types'; // Use the specific user type
import Link from 'next/link';

interface CorporateStudentTableRowProps {
    student: StudentUser; // Expecting a StudentUser object
    onDelete: (studentId: string, studentName: string) => Promise<void> | void;
    isDeleting: boolean; // To disable actions during delete
    // Add other callbacks if needed (e.g., onAssignToClass)
}

// Helper function to get status badge (modify if needed for student status)
const getStudentStatusBadge = (isActive?: boolean) => {
    return isActive ? (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-100 dark:border-green-700 whitespace-nowrap">
            <CheckCircle className="mr-1 h-3 w-3" /> Active
        </Badge>
    ) : (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-100 dark:border-red-700 whitespace-nowrap">
            <XCircle className="mr-1 h-3 w-3" /> Inactive
        </Badge>
    );
};


export function CorporateStudentTableRow({ student, onDelete, isDeleting }: CorporateStudentTableRowProps) {
    const router = useRouter();

    const deleteDescription = (
        <>This action cannot be undone. This will remove <strong>{student.name || 'this student'}</strong> from your management.</>
    );

    return (
        <TableRow>
            {/* Student Info Cell */}
            <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={student.avatarUrl ?? undefined} alt={student.name} />
                        <AvatarFallback className="text-primary font-medium">{student.name?.charAt(0)?.toUpperCase() || 'S'}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        {/* Link to View Page */}
                        <Link href={`/corporate-management/students/${student.id}`} className="hover:underline font-medium truncate block">
                            {student.name || <span className="text-muted-foreground italic">Setup Pending</span>}
                        </Link>
                        <span className="text-xs text-muted-foreground truncate block">{student.email}</span>
                    </div>
                </div>
            </TableCell>

            {/* Assigned Class/Course Cell */}
            <TableCell className="text-xs text-muted-foreground">
                {student.classId || 'Not Assigned'} {/* TODO: Fetch class name based on ID */}
            </TableCell>

            {/* Status Cell */}
            <TableCell>
                {getStudentStatusBadge(student.isActive)}
            </TableCell>

            {/* Onboarding Status Cell (Optional) */}
            <TableCell>
                <Badge variant={student.onboardingStatus === 'complete' ? 'default' : 'secondary'} className="capitalize text-xs">
                    {student.onboardingStatus}
                </Badge>
            </TableCell>

            {/* Actions Cell */}
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0" disabled={isDeleting}>
                            <span className="sr-only">Actions</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/corporate-management/students/${student.id}`}><Eye className="mr-2 h-4 w-4" /> View Details</Link>
                        </DropdownMenuItem>
                        {/* Allow edit only if onboarding is maybe incomplete, or for specific fields */}
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/corporate-management/students/${student.id}/edit`}><Pencil className="mr-2 h-4 w-4" /> Edit Student</Link>
                        </DropdownMenuItem>
                        {/* TODO: Add "Assign to Class" action */}
                        {/* <DropdownMenuItem className="cursor-pointer" onClick={() => onAssignClass(student.id)}>
                             <BookOpen className="mr-2 h-4 w-4" /> Assign Class
                         </DropdownMenuItem> */}
                        <DropdownMenuSeparator />
                        <ConfirmationDialog
                            title="Remove Student?"
                            description={deleteDescription}
                            confirmText="Remove"
                            variant="destructive"
                            onConfirm={() => onDelete(student.id, student.name || 'Student')}
                            confirmDisabled={isDeleting}
                            trigger={
                                <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="flex items-center text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Remove Student</span>
                                </DropdownMenuItem>
                            }
                        />
                        {/* TODO: Add Deactivate action */}
                        {/* <DropdownMenuItem className="cursor-pointer" onClick={() => onDeactivate(student.id)}>
                             <Slash className="mr-2 h-4 w-4" /> Deactivate
                         </DropdownMenuItem> */}
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}