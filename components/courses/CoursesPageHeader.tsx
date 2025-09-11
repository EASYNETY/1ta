// components/courses/CoursesPageHeader.tsx
import { ReactNode } from "react";
import Link from "next/link";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { Plus } from "lucide-react";
import { User } from "@/types/user.types";

interface CoursesPageHeaderProps {
    user: User | null; // Pass the user object
}

export function CoursesPageHeader({ user }: CoursesPageHeaderProps) {

    const getRoleActions = () => {
        if (!user) return null;

        switch (user.role) {
            case "admin":
                return (
                    <DyraneButton asChild>
                        <Link href="/courses/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Course
                        </Link>
                    </DyraneButton>
                );
            case "super_admin":
                return (
                    <DyraneButton asChild>
                        <Link href="/courses/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Course
                        </Link>
                    </DyraneButton>
                );
            case "teacher":
                return (
                    <DyraneButton asChild>
                        <Link href="/courses/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Request New Course
                        </Link>
                    </DyraneButton>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold">Courses</h1>
            {getRoleActions()}
        </div>
    );
}
