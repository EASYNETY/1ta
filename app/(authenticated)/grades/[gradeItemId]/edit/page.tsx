// app/(authenticated)/grades/[gradeItemId]/edit/page.tsx

"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
    fetchGradeItemById,
    selectCurrentGradeItem,
    selectGradeStatus,
    selectGradeError,
} from "@/features/grades/store/grade-slice"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Home } from "lucide-react"
import Link from "next/link"
import GradeForm from "@/features/grades/components/GradeForm"

export default function EditGradePage() {
    const params = useParams()
    const router = useRouter()
    const dispatch = useAppDispatch()
    const gradeItemId = params.gradeItemId as string
    const { user } = useAppSelector((state) => state.auth)
    const currentGradeItem = useAppSelector(selectCurrentGradeItem)
    const status = useAppSelector(selectGradeStatus)
    const error = useAppSelector(selectGradeError)

    // Fetch grade item details on component mount
    useEffect(() => {
        if (gradeItemId && user?.id && user?.role) {
            dispatch(
                fetchGradeItemById({
                    gradeItemId,
                    role: user.role,
                    userId: user.id,
                }),
            )
        }
    }, [dispatch, gradeItemId, user?.id, user?.role])

    // Redirect to login if not authenticated
    if (!user) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Authentication Required</h2>
                    <p className="text-muted-foreground mt-2">Please log in to edit this grade item.</p>
                    <Button asChild className="mt-4">
                        <Link href="/login">Log In</Link>
                    </Button>
                </div>
            </div>
        )
    }

    // Check if user has permission to edit
    if (user.role !== "teacher" && user.role !== "admin" && user.role !== 'super_admin') {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>You do not have permission to edit grade items.</AlertDescription>
            </Alert>
        )
    }

    // Render loading state
    if (status === "loading" || !currentGradeItem) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-full max-w-md" />
                <Skeleton className="h-8 w-full max-w-sm" />
                <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
        )
    }

    // Render error state
    if (status === "failed") {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error || "Failed to load grade item details"}</AlertDescription>
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
                        <BreadcrumbLink asChild>
                            <Link href={`/grades/${gradeItemId}`}>{currentGradeItem.title}</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink>Edit</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Edit Grade Item</h1>
            </div>

            <GradeForm isEditing={true} gradeItemId={gradeItemId} />
        </div>
    )
}
