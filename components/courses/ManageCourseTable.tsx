// components/courses/ManageCourseTable.tsx
import { useState } from "react";
import { AuthCourse } from "@/features/auth-course/types/auth-course-interface";
import { ManageCourseTableRow } from "./ManageCourseTableRow"; // Import the row component
import { Switch } from "@/components/ui/switch";
import { useAppSelector } from "@/store/hooks";

interface ManageCourseTableProps {
    courses: AuthCourse[];
    onDeleteCourse: (courseId: string, courseTitle: string) => Promise<void> | void; // Callback for deletion
}

export function ManageCourseTable({ courses, onDeleteCourse }: ManageCourseTableProps) {
    const [showDollarPricing, setShowDollarPricing] = useState(true); // Default to USD for admin/teacher
    const user = useAppSelector(state => state.auth.user);
    const isAdmin = user?.role === 'admin';
    const isTeacher = user?.role === 'teacher';
    const isAdminOrTeacher = isAdmin || isTeacher;

    return (
        <div className="space-y-4">
            {/* Currency Toggle for Admin/Teacher */}
            {isAdminOrTeacher && (
                <div className="flex justify-end items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                        {showDollarPricing ? 'USD' : 'NGN'}
                    </span>
                    <Switch
                        checked={!showDollarPricing}
                        onCheckedChange={(checked) => setShowDollarPricing(!checked)}
                        aria-label="Toggle currency"
                    />
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto relative w-full border rounded-md bg-background/5 backdrop-blur-sm">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b text-sm bg-muted">
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Course</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Instructor</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                Price {isAdminOrTeacher && `(${showDollarPricing ? 'USD' : 'NGN'})`}
                            </th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                <tbody>
                    {courses.length > 0 ? (
                        courses.map((course) => (
                            <ManageCourseTableRow
                                key={course.id}
                                course={course}
                                onDelete={onDeleteCourse} // Pass the delete handler down
                                showDollarPricing={isAdminOrTeacher ? showDollarPricing : false} // Students always see Naira
                                userRole={user?.role || 'student'} // Default to student if role is undefined
                            />
                        ))
                    ) : (
                        <tr>
                            {/* Adjust colspan to match the number of columns (6) */}
                            <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                No courses found matching your criteria.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}