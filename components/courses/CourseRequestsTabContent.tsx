// components/courses/CourseRequestsTabContent.tsx
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card";
import { CardContent } from "@/components/ui/card";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { FetchStatus } from "@/types"; // Assuming type exists

interface CourseRequestsTabContentProps {
    status: FetchStatus; // For potential future loading/empty states
    // Add props for actual course request data when available
}

export function CourseRequestsTabContent({ status }: CourseRequestsTabContentProps) {
    // Add loading/empty states based on status and real data later
    if (status === "loading") {
        return <div>Loading course requests...</div>;
    }

    // Placeholder static content
    return (
        <DyraneCard>
            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h2 className="text-xl font-semibold">Course Requests</h2>
                    <DyraneButton asChild>
                        <Link href="/courses/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Request New Course
                        </Link>
                    </DyraneButton>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-4">Course Title</th>
                                <th className="text-left py-3 px-4">Category</th>
                                <th className="text-left py-3 px-4">Submitted</th>
                                <th className="text-left py-3 px-4">Status</th>
                                <th className="text-left py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Replace with dynamic data */}
                            <tr className="border-b hover:bg-muted/50">
                                <td className="py-3 px-4">
                                    <div className="font-medium">Advanced React Patterns</div>
                                </td>
                                <td className="py-3 px-4">Web Development</td>
                                <td className="py-3 px-4">Dec 10, 2023</td>
                                <td className="py-3 px-4">
                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                        Pending Review
                                    </Badge>
                                </td>
                                <td className="py-3 px-4">
                                    <DyraneButton variant="outline" size="sm">
                                        View Details
                                    </DyraneButton>
                                </td>
                            </tr>
                            <tr className="border-b hover:bg-muted/50">
                                <td className="py-3 px-4">
                                    <div className="font-medium">Node.js Microservices</div>
                                </td>
                                <td className="py-3 px-4">Backend Development</td>
                                <td className="py-3 px-4">Nov 28, 2023</td>
                                <td className="py-3 px-4">
                                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                        Approved
                                    </Badge>
                                </td>
                                <td className="py-3 px-4">
                                    <DyraneButton variant="outline" size="sm">
                                        Start Creating
                                    </DyraneButton>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </DyraneCard>
    );
}