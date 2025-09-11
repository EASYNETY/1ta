// features/corporate/components/CorporateStudentTable.tsx
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { StudentUser } from '@/types/user.types';
import { CorporateStudentTableRow } from './CorporateStudentTableRow'; // Import row component

interface CorporateStudentTableProps {
    students: StudentUser[]; // Expecting array of StudentUser
    onDeleteStudent: (studentId: string, studentName: string) => Promise<void> | void;
    isDeleting?: boolean; // Optional prop to indicate if any delete operation is in progress    
}

export function CorporateStudentTable({ students, onDeleteStudent, isDeleting }: CorporateStudentTableProps) {


    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40%]">Student</TableHead>
                        <TableHead>Assigned Class</TableHead>
                        <TableHead>Account Status</TableHead>
                        <TableHead>Onboarding</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                No students added yet. Use the 'Add Student' button to create accounts.
                            </TableCell>
                        </TableRow>
                    )}
                    {students.map((student) => (
                        <CorporateStudentTableRow
                            key={student.id}
                            student={student}
                            onDelete={onDeleteStudent}
                            isDeleting={isDeleting as boolean} // Pass global delete status if needed
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
