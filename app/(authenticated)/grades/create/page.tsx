// app/(authenticated)/grades/create/page.tsx

"use client"

import { useAppSelector } from "@/store/hooks"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Home } from "lucide-react"
import Link from "next/link"
import GradeForm from "@/features/grades/components/GradeForm"

export default function CreateGradePage() {
    const { user } = useAppSelector((state) => state.auth)

    // Redirect to login if not authenticated
    if (!user) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Authentication Required</h2>
                    <p className="text-muted-foreground mt-2">Please log in to create grade items.</p>
                    <Button asChild className="mt-4">
                        <Link href="/login">Log In</Link>
                    </Button>
                </div>
            </div>
        )
    }

    // Check if user has permission to create grades
    if (user.role !== "teacher" && user.role !== "admin") {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>You do not have permission to create grade items.</AlertDescription>
            </Alert>
        )
    }

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
                            <Link href="/grades">Grades</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink>Create</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Create Grade Item</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Create New Grade Item</CardTitle>
                    <CardDescription>Fill in the details to create a new grade item for your course.</CardDescription>
                </CardHeader>
                <CardContent>
                    <GradeForm />
                </CardContent>
            </Card>
        </div>
    )
}
