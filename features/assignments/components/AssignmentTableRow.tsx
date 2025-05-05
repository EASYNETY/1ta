// features/assignments/components/AssignmentTableRow.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { useAppDispatch } from "@/store/hooks"
import { deleteAssignment } from "../store/assignment-slice"
import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit, MoreHorizontal, Trash, Eye, CheckCircle } from "lucide-react"
import Link from "next/link"
import type { TeacherAssignmentView } from "../types/assignment-types"

interface AssignmentTableRowProps {
    assignment: TeacherAssignmentView
}

export default function AssignmentTableRow({ assignment }: AssignmentTableRowProps) {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Format the due date
    const formattedDueDate = format(parseISO(assignment.dueDate), "MMM d, yyyy 'at' h:mm a")

    // Handle delete confirmation
    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await dispatch(deleteAssignment(assignment.id)).unwrap()
            // Success is handled by the slice
        } catch (error) {
            console.error("Failed to delete assignment:", error)
        } finally {
            setIsDeleting(false)
            setIsDeleteDialogOpen(false)
        }
    }

    // Render status badge with appropriate color
    const renderStatusBadge = () => {
        switch (assignment.status) {
            case "draft":
                return <Badge variant="outline">Draft</Badge>
            case "published":
                return <Badge variant="default">Published</Badge>
            case "archived":
                return <Badge variant="secondary">Archived</Badge>
            default:
                return <Badge variant="outline">{assignment.status}</Badge>
        }
    }

    // Calculate submission percentage
    const submissionPercentage =
        assignment.totalStudentsInClass && assignment.totalStudentsInClass > 0
            ? Math.round((assignment.totalSubmissions / assignment.totalStudentsInClass) * 100)
            : 0

    return (
        <>
            <TableRow>
                <TableCell className="font-medium">{assignment.title}</TableCell>
                <TableCell>{assignment.courseTitle}</TableCell>
                <TableCell>{formattedDueDate}</TableCell>
                <TableCell>{renderStatusBadge()}</TableCell>
                <TableCell>
                    <div className="flex flex-col">
                        <span className="text-sm">
                            {assignment.gradedSubmissions}/{assignment.totalSubmissions} graded
                        </span>
                        {assignment.totalStudentsInClass && (
                            <span className="text-xs text-muted-foreground">
                                {assignment.totalSubmissions}/{assignment.totalStudentsInClass} submitted ({submissionPercentage}%)
                            </span>
                        )}
                    </div>
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={`/assignments/${assignment.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/assignments/${assignment.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            {assignment.totalSubmissions > 0 && (
                                <DropdownMenuItem asChild>
                                    <Link href={`/assignments/${assignment.id}#submissions`}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Grade Submissions
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setIsDeleteDialogOpen(true)}
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the assignment &quot;{assignment.title}&quot; and all associated submissions.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
