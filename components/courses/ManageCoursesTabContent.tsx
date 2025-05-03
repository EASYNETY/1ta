// components/courses/ManageCoursesTabContent.tsx
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card";
import { CardContent } from "@/components/ui/card";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Plus, Users } from "lucide-react";
import { FetchStatus } from "@/types"; // Assuming type exists
import { AuthCourse } from "@/features/auth-course/types/auth-course-interface";


interface ManageCoursesTabContentProps {
    status: FetchStatus;
    courses: AuthCourse[]; // Filtered courses
}

export function ManageCoursesTabContent({ status, courses }: ManageCoursesTabContentProps) {
    // Add loading state if necessary, although parent handles main loading
    if (status === "loading") {
        return <div>Loading course management...</div>; // Or a skeleton table
    }

    // Add empty state if needed
    if (courses.length === 0) {
        return (
            <DyraneCard>
                <CardContent className="p-6 text-center text-muted-foreground">
                    No courses match the current filters.
                </CardContent>
            </DyraneCard>
        );
    }

    return (
        <DyraneCard>
            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h2 className="text-xl font-semibold">Course Management</h2>
                    <DyraneButton asChild size="sm" className="hidden sm:flex">
                        <Link href="/courses/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Course
                        </Link>
                    </DyraneButton>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-4">Course</th>
                                <th className="text-left py-3 px-4">Category</th>
                                <th className="text-left py-3 px-4">Instructor</th>
                                <th className="text-left py-3 px-4">Students</th>
                                <th className="text-left py-3 px-4">Status</th>
                                <th className="text-left py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((course) => (
                                <tr key={course.id} className="border-b hover:bg-muted/50">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-muted rounded overflow-hidden">
                                                <img
                                                    src={course.image || "/placeholder.svg?height=40&width=40"}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-medium">{course.title}</div>
                                                <div className="text-xs text-muted-foreground">{course.level}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">{course.category}</td>
                                    <td className="py-3 px-4">{course.instructor.name}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            {/* Replace with actual student count if available */}
                                            <span>{Math.floor(Math.random() * 100) + 10}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        {/* Replace with actual course status */}
                                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                            Active
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-2">
                                            <DyraneButton variant="outline" size="sm" asChild>
                                                <Link href={`/courses/${course.slug}`}>View</Link>
                                            </DyraneButton>
                                            <DyraneButton variant="outline" size="sm" asChild>
                                                <Link href={`/courses/${course.slug}/edit`}>Edit</Link>
                                            </DyraneButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </DyraneCard>
    );
}