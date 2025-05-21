// components/courses/ManageCourseTableRow.tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"; // Use the reusable dialog
import { MoreVertical, Eye, Pencil, Trash, MoreHorizontal } from "lucide-react";
import { AuthCourse } from "@/features/auth-course/types/auth-course-interface";

interface ManageCourseTableRowProps {
    course: AuthCourse;
    onDelete: (courseId: string, courseTitle: string) => Promise<void> | void; // Expects the delete callback
}

export function ManageCourseTableRow({ course, onDelete }: ManageCourseTableRowProps) {

    const deleteDescription = (
        <>
            This action cannot be undone. This will permanently delete the course{' '}
            <strong>{course.title}</strong> and all associated data.
        </>
    );

    return (
        <tr className="border-b hover:bg-muted/50">
            {/* Course Cell */}
            <td className="py-3 px-4 align-top ">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded  flex-shrink-0">
                        <img
                            src={course.image || "/placeholder.svg"}
                            alt={course.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="min-w-0">
                        <div className="font-medium truncate">{course.title}</div>
                        <div className="text-xs text-muted-foreground">{course.level}</div>
                    </div>
                </div>
            </td>

            {/* Category Cell */}
            <td className="py-3 px-4 align-top text-sm text-muted-foreground truncate ">
                {course.category || "Uncategorized"}
            </td>

            {/* Instructor Cell */}
            <td className="py-3 px-4 align-top truncate ">
                {course.instructor.name}
            </td>

            {/* Status Cell */}
            <td className="py-3 px-4 align-top">
                {/* TODO: Replace with actual status */}
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 whitespace-nowrap">
                    Active
                </Badge>
            </td>

            {/* Price Cell */}
            <td className="py-3 px-4 align-top truncate">
                {/* Add currency formatting later if needed */}
                ₦ {course.priceUSD?.toFixed(2) ?? 'N/A'}
            </td>

            {/* Actions Cell */}
            <td className="py-3 px-4 align-top text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {/* View Action */}
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/courses/${course.slug}`} className="flex items-center">
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View</span>
                            </Link>
                        </DropdownMenuItem>
                        {/* Edit Action */}
                        <DropdownMenuItem asChild className="cursor-pointer">
                            {/* Make sure edit link is correct */}
                            <Link href={`/courses/${course.slug}/edit`} className="flex items-center">
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {/* Delete Action using ConfirmationDialog */}
                        <ConfirmationDialog
                            title="Delete Course?"
                            description={deleteDescription}
                            confirmText="Delete"
                            variant="destructive"
                            onConfirm={() => onDelete(course.id, course.title)} // Call the passed onDelete prop
                            trigger={
                                <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()} // Prevent menu close on trigger click
                                    className="flex items-center text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                >
                                    <Trash className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            }
                        />
                    </DropdownMenuContent>
                </DropdownMenu>
            </td>
        </tr>
    );
}