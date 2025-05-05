// features/grades/components/GradeTable.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { deleteGradeItem, selectAllGradeItems } from "../store/grade-slice"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { Edit, MoreHorizontal, Trash, Eye, CheckCircle, Search } from "lucide-react"
import Link from "next/link"
import type { TeacherGradeItemView } from "../types/grade-types"

export default function GradeTable() {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const gradeItems = useAppSelector(selectAllGradeItems)
    const [searchQuery, setSearchQuery] = useState("")
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [gradeItemToDelete, setGradeItemToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Filter grade items based on search query
    const filteredGradeItems = gradeItems.filter(
        (item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    // Handle delete confirmation
    const handleDelete = async () => {
        if (!gradeItemToDelete) return

        setIsDeleting(true)
        try {
            await dispatch(deleteGradeItem(gradeItemToDelete)).unwrap()
            // Success is handled by the slice
        } catch (error) {
            console.error("Failed to delete grade item:", error)
        } finally {
            setIsDeleting(false)
            setIsDeleteDialogOpen(false)
            setGradeItemToDelete(null)
        }
    }

    // Render status badge with appropriate color
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case "draft":
                return <Badge variant="outline">Draft</Badge>
            case "published":
                return <Badge variant="default">Published</Badge>
            case "archived":
                return <Badge variant="secondary">Archived</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    // Render type badge with appropriate color
    const renderTypeBadge = (type: string) => {
        switch (type) {
            case "assignment":
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        Assignment
                    </Badge>
                )
            case "quiz":
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Quiz
                    </Badge>
                )
            case "exam":
                return (
                    <Badge variant="outline" className="bg-purple-50 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        Exam
                    </Badge>
                )
            case "project":
                return (
                    <Badge variant="outline" className="bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        Project
                    </Badge>
                )
            case "participation":
                return (
                    <Badge variant="outline" className="bg-pink-50 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300">
                        Participation
                    </Badge>
                )
            default:
                return <Badge variant="outline">Other</Badge>
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search grade items..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button asChild>
                    <Link href="/grades/create">Create Grade Item</Link>
                </Button>
            </div>

            <div className="rounded-md border bg-Card/5 shadow-sm backdrop-blur-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead>Weight</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Graded</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredGradeItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    No grade items found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredGradeItems.map((item) => {
                                const teacherView = item as TeacherGradeItemView
                                const totalStudentsInClass = teacherView.totalStudentsInClass || 0
                                const totalGraded = teacherView.totalGraded || 0
                                const gradePercentage =
                                    totalGraded && totalStudentsInClass
                                        ? Math.round((totalGraded / totalStudentsInClass) * 100)
                                        : 0

                                return (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.title}</TableCell>
                                        <TableCell>{item.courseTitle}</TableCell>
                                        <TableCell>{renderTypeBadge(item.type)}</TableCell>
                                        <TableCell>{item.pointsPossible}</TableCell>
                                        <TableCell>{(item.weight * 100).toFixed(0)}%</TableCell>
                                        <TableCell>{renderStatusBadge(item.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm">
                                                    {totalGraded || 0}/{totalStudentsInClass || 0} graded
                                                </span>
                                                {totalStudentsInClass > 0 && (
                                                    <span className="text-xs text-muted-foreground">{gradePercentage}% complete</span>
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
                                                        <Link href={`/grades/${item.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/grades/${item.id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/grades/${item.id}/grade-students`}>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Grade Students
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => {
                                                            setGradeItemToDelete(item.id)
                                                            setIsDeleteDialogOpen(true)
                                                        }}
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this grade item and all associated student grades. This action cannot be
                            undone.
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
        </div>
    )
}
