// components/courses/ManageCoursesTabContent.tsx
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card";
import { CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Plus, Users, Eye, Pencil, Trash } from "lucide-react"; // Using lucide-react
import { FetchStatus } from "@/types";
import { AuthCourse } from "@/features/auth-course/types/auth-course-interface";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store/hooks";
import { deleteAuthCourse } from "@/features/auth-course/store/auth-course-slice";
import { toast } from "sonner";

interface ManageCoursesTabContentProps {
    status: FetchStatus;
    courses: AuthCourse[]; // Filtered courses
}

export function ManageCoursesTabContent({ status, courses }: ManageCoursesTabContentProps) {
    const dispatch = useAppDispatch();

    if (status === "loading") {
        return <div>Loading course management...</div>;
    }

    if (courses.length === 0) {
        return (
            <DyraneCard>
                <CardContent className="p-6 text-center text-muted-foreground">
                    No courses match the current filters.
                </CardContent>
            </DyraneCard>
        );
    }

    const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
        if (window.confirm(`Are you sure you want to delete the course "${courseTitle}"? This action cannot be undone.`)) {
            try {
                await dispatch(deleteAuthCourse(courseId)).unwrap();
                toast.success(`Course "${courseTitle}" deleted successfully.`);
            } catch (error: any) {
                console.error("Failed to delete course:", error);
                toast.error(`Failed to delete course: ${error?.message || 'Unknown error'}`);
            }
        }
    };

    return (
        <DyraneCard>
            <CardContent>
                <div className="overflow-x-auto relative w-full border rounded-md"> {/* Added border/rounded */}
                    {/* Use table-fixed for predictable column widths */}
                    <table className="w-full border-collapse table-fixed">
                        {/* Define column widths */}
                        <colgroup>
                            <col className="w-2/5 md:w-1/3 lg:w-2/5" />
                            <col className="w-[150px]" />
                            <col className="w-[150px]" />
                            <col className="w-[100px]" />
                            <col className="w-[100px]" />
                            <col className="w-[100px]" />
                            <col className="w-[60px]" />
                        </colgroup>

                        <thead>
                            <tr className="border-b text-sm">
                                {/* Consistent padding and alignment */}
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Course</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Instructor</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Students</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Price</th>
                                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {courses.map((course) => (
                                <tr key={course.id} className="border-b hover:bg-muted/50">
                                    {/* Course Cell: Added overflow-hidden */}
                                    <td className="py-3 px-4 align-top overflow-hidden">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                                                <img
                                                    src={course.image || "/placeholder.svg"}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0"> {/* Helps truncation in flex */}
                                                <div className="font-medium truncate">{course.title}</div>
                                                <div className="text-xs text-muted-foreground">{course.level}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Category Cell: Added overflow-hidden, removed whitespace-nowrap */}
                                    <td className="py-3 px-4 align-top text-sm text-muted-foreground truncate overflow-hidden">
                                        {course.category || "Uncategorized"}
                                    </td>

                                    {/* Instructor Cell: Added overflow-hidden */}
                                    <td className="py-3 px-4 align-top truncate overflow-hidden">
                                        {course.instructor.name}
                                    </td>

                                    {/* Students Cell */}
                                    <td className="py-3 px-4 align-top">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span>{Math.floor(Math.random() * 100) + 10}</span>
                                        </div>
                                    </td>

                                    {/* Status Cell */}
                                    <td className="py-3 px-4 align-top">
                                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 whitespace-nowrap">
                                            Active
                                        </Badge>
                                    </td>

                                    {/* Price Cell */}
                                    <td className="py-3 px-4 align-top truncate">
                                        ₦ {course.priceUSD?.toFixed(2) ?? 'N/A'}
                                    </td>

                                    {/* Actions Cell */}
                                    <td className="py-3 px-4 align-top text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/courses/${course.slug}`} className="flex items-center cursor-pointer">
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        <span>View</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/courses/${course.slug}/edit`} className="flex items-center cursor-pointer">
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        <span>Edit</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="flex items-center text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                                    onClick={() => handleDeleteCourse(course.id, course.title)}
                                                >
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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