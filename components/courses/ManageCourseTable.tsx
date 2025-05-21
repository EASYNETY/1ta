// components/courses/ManageCourseTable.tsx
import { AuthCourse } from "@/features/auth-course/types/auth-course-interface";
import { ManageCourseTableRow } from "./ManageCourseTableRow"; // Import the row component

interface ManageCourseTableProps {
    courses: AuthCourse[];
    onDeleteCourse: (courseId: string, courseTitle: string) => Promise<void> | void; // Callback for deletion
}

export function ManageCourseTable({ courses, onDeleteCourse }: ManageCourseTableProps) {
    return (
        // Add styling similar to UserTable if desired (bg, backdrop-blur)
        <div className="overflow-x-auto relative w-full border rounded-md bg-background/5 backdrop-blur-sm">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b text-sm bg-muted">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Course</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Instructor</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Price</th>
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