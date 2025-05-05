// app/(authenticated)/assignments/create/page.tsx

"use client"

import { useEffect } from "react"
import { useAppDispatch } from "@/store/hooks"
import { clearCurrentAssignment } from "@/features/assignments/store/assignment-slice"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home } from "lucide-react"
import Link from "next/link"
import AssignmentForm from "@/features/assignments/components/AssignmentForm"

export default function CreateAssignmentPage() {
    const dispatch = useAppDispatch()

    // Clear current assignment when component mounts
    useEffect(() => {
        dispatch(clearCurrentAssignment())
    }, [dispatch])

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard">
                                <Home className="h-4 w-4" />
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/assignments">Assignments</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink>Create</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Create Assignment</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Assignment Details</CardTitle>
                    <CardDescription>Create a new assignment for your students. Fill in all required fields.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AssignmentForm />
                </CardContent>
            </Card>
        </div>
    )
}
