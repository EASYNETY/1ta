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
import { AdminGuard, DeleteGuard } from "@/components/auth/PermissionGuard";
import { AuthCourse } from "@/features/auth-course/types/auth-course-interface";
import { UserRole } from "@/types/user.types";

interface ManageCourseTableRowProps {
    course: AuthCourse;
    onDelete: (courseId: string, courseTitle: string) => Promise<void> | void; // Expects the delete callback
    showDollarPricing: boolean; // Whether to show prices in USD or Naira
    userRole: UserRole; // User role (admin, teacher, student)
}

// Helper function to determine course status and styling
type CourseStatusType = {
    label: string;
    className: string;
};

const getCourseStatus = (course: AuthCourse): CourseStatusType => {
    // Check if the course is available for enrolment
    const isAvailable = course.available_for_enrolment !== undefined
        ? course.available_for_enrolment
        : course.isAvailableForEnrolment !== undefined
            ? course.isAvailableForEnrolment
            : true; // Default to true if both fields are undefined

    // If the course has an enrolment status, use that for more detailed status
    if (course.enrolmentStatus) {
        switch (course.enrolmentStatus) {
            case "pending":
                return {
                    label: "Pending",
                    className: "bg-blue-100 text-blue-800 border-blue-300"
                };
            case "not_enrolled":
                // For not_enrolled courses, check if they're available
                if (!isAvailable) {
                    return {
                        label: "Inactive",
                        className: "bg-amber-100 text-amber-800 border-amber-300"
                    };
                }
                return {
                    label: "Active",
                    className: "bg-green-100 text-green-800 border-green-300"
                };
            case "enrolled":
                // Enrolled is an active state
                return {
                    label: "Active",
                    className: "bg-green-100 text-green-800 border-green-300"
                };
            default:
                // For any other enrolment status
                return {
                    label: "Active",
                    className: "bg-green-100 text-green-800 border-green-300"
                };
        }
    }

    // Fallback to simple available/not available status
    if (isAvailable) {
        return {
            label: "Active",
            className: "bg-green-100 text-green-800 border-green-300"
        };
    } else {
        return {
            label: "Inactive",
            className: "bg-amber-100 text-amber-800 border-amber-300"
        };
    }
};

export function ManageCourseTableRow({ course, onDelete, showDollarPricing, userRole }: ManageCourseTableRowProps) {

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
                {(() => {
                    const status = getCourseStatus(course);
                    return (
                        <Badge variant="outline" className={`${status.className} whitespace-nowrap`}>
                            {status.label}
                        </Badge>
                    );
                })()}
            </td>

            {/* Price Cell */}
            <td className="py-3 px-4 align-top truncate">
                {showDollarPricing ? (
                    // Show USD price for admin/teacher when toggle is set to USD
                    <span>$ {course.priceUSD?.toFixed(2) ?? 'N/A'}</span>
                ) : (
                    // Show Naira price for students or when toggle is set to Naira
                    <span>₦ {course.priceNaira?.toFixed(2) ?? course.priceUSD ? (course.priceUSD * 1500).toFixed(2) : 'N/A'}</span>
                )}
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
                        <AdminGuard>
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href={`/courses/${course.slug}/edit`} className="flex items-center">
                                    <Pencil className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                </Link>
                            </DropdownMenuItem>
                        </AdminGuard>
                        <DropdownMenuSeparator />
                        {/* Delete Action using ConfirmationDialog */}
                        <DeleteGuard>
                            <ConfirmationDialog
                                title="Delete Course?"
                                description={deleteDescription}
                                confirmText="Delete"
                                variant="destructive"
                                onConfirm={() => onDelete(course.id, course.title)}
                                trigger={
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="flex items-center text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                    >
                                        <Trash className="mr-2 h-4 w-4" />
                                        <span>Delete</span>
                                    </DropdownMenuItem>
                                }
                            />
                        </DeleteGuard>
                    </DropdownMenuContent>
                </DropdownMenu>
            </td>
        </tr>
    );
}