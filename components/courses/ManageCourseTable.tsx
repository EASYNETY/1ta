// components/courses/ManageCourseTable.tsx
import { useState } from "react";
import { AuthCourse } from "@/features/auth-course/types/auth-course-interface";
import { ManageCourseTableRow } from "./ManageCourseTableRow";
import { Switch } from "@/components/ui/switch";
import { useAppSelector } from "@/store/hooks";
import { AdminGuard } from "@/components/auth/PermissionGuard";

interface ManageCourseTableProps {
    courses: AuthCourse[];
    onDeleteCourse: (courseId: string, courseTitle: string) => Promise<void> | void;
}

export function ManageCourseTable({ courses, onDeleteCourse }: ManageCourseTableProps) {
    const [showDollarPricing, setShowDollarPricing] = useState(true);
    const user = useAppSelector(state => state.auth.user);

    const handleCurrencyToggle = (checked: boolean) => {
        setShowDollarPricing(!checked);
    };

    return (
        <>
            <div className="space-y-4">
                <AdminGuard>
                    <div className="flex justify-end items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                            {showDollarPricing ? 'USD' : 'NGN'}
                        </span>
                        <Switch
                            checked={!showDollarPricing}
                            onCheckedChange={handleCurrencyToggle}
                            aria-label="Toggle currency"
                        />
                    </div>
                </AdminGuard>

                <div className="overflow-x-auto relative w-full border rounded-md bg-background/5 backdrop-blur-sm">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b text-sm bg-muted">
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Course</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Instructor</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                    Price <AdminGuard>{`(${showDollarPricing ? 'USD' : 'NGN'})`}</AdminGuard>
                                </th>
                                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.length > 0 ? (
                                courses.map((course, index) => (
                                    <ManageCourseTableRow
                                        key={`manage-course-${course.id}-${index}`}
                                        course={course}
                                        onDelete={onDeleteCourse}
                                        showDollarPricing={user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'super_admin' ? showDollarPricing : false}
                                        userRole={user?.role || 'student'}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                        No courses found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
