// components/courses/ManageCoursesTabContent.tsx
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card";
import { CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Plus, Users } from "lucide-react";
import { FetchStatus } from "@/types";
import { AuthCourse } from "@/features/auth-course/types/auth-course-interface";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Eye, Pencil, Trash } from "phosphor-react";


interface ManageCoursesTabContentProps {
    status: FetchStatus;
    courses: AuthCourse[]; // Filtered courses
}

export function ManageCoursesTabContent({ status, courses }: ManageCoursesTabContentProps) {
    if (status === "loading") {
        return <div>Loading course management...</div>; // Or a skeleton table
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


    // Placeholder handler for delete action
    const handleDeleteCourse = (courseId: string, courseTitle: string) => {
        // TODO: Implement actual delete logic:
        // 1. Show a confirmation modal (highly recommended)
        // 2. If confirmed, dispatch a delete action to Redux/API
        console.warn(`TODO: Implement deletion for course: ${courseTitle} (ID: ${courseId})`);
        alert(`(Placeholder) Delete action triggered for: ${courseTitle}`);
    };

    return (
        <DyraneCard>
            {/* CardContent already provides padding */}
            <CardContent className="">
                {/* This div will handle the horizontal scrolling */}
                <div className="overflow-x-auto relative w-full">
                    {/* Apply table-fixed and w-full */}
                    <table className="w-full border-collapse table-fixed">
                        <colgroup>
                            <col className="w-2/5 md:w-1/3 lg:w-2/5" />
                            <col className="w-[120px] md:w-1/6" />
                            <col className="w-[150px] md:w-1/6" />
                            <col className="w-[100px]" />
                            <col className="w-[100px]" />
                            <col className="w-[100px]" />
                            <col className="min-w-[160px]" />
                        </colgroup>
                        <thead>
                            <tr className="border-b">
                                {/* Header cells - don't need width again if using colgroup */}
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Course</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Instructor</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Students</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Price</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((course) => (
                                <tr key={course.id} className="border-b hover:bg-muted/50">
                                    {/* Use align-top if content heights might differ */}
                                    <td className="py-3 px-4 align-top">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0"> {/* Added flex-shrink-0 */}
                                                <img
                                                    src={course.image || "/placeholder.svg?height=40&width=40"}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            {/* Allow text content to truncate */}
                                            <div className="min-w-0"> {/* Added min-w-0 for flex child truncation */}
                                                <div className="font-medium truncate">{course.title}</div>
                                                <div className="text-xs text-muted-foreground">{course.level}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 align-top">{course.category}</td>
                                    <td className="py-3 px-4 align-top truncate">{course.instructor.name}</td>
                                    <td className="py-3 px-4 align-top">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            {/* Replace with actual student count if available */}
                                            <span>{Math.floor(Math.random() * 100) + 10}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 align-top">
                                        {/* Ensure badge text doesn't wrap */}
                                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 whitespace-nowrap">
                                            Active
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-4 align-top truncate">₦ {course.priceUSD}</td>
                                    {/* --- Actions Cell with Dropdown --- */}
                                    <td className="py-3 px-4 align-top text-right"> {/* Align content right */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                {/* Using Shadcn Button for trigger consistency */}
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end"> {/* Align dropdown to the right */}
                                                {/* Optional Label */}
                                                {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
                                                {/* View Action */}
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/courses/${course.slug}`} className="flex items-center cursor-pointer">
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        <span>View</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                                {/* Edit Action */}
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/courses/${course.slug}/edit`} className="flex items-center cursor-pointer">
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        <span>Edit</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {/* Delete Action */}
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
                                    {/* --- End Actions Cell --- */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </DyraneCard>
    );
}