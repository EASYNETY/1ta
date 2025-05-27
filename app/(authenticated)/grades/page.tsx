// app/(authenticated)/grades/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { fetchGradeItems } from "@/features/grades/store/grade-slice"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Plus } from "lucide-react"
import Link from "next/link"
import GradeTable from "@/features/grades/components/GradeTable"
import StudentGradeList from "@/features/grades/components/StudentGradeList"

export default function GradesPage() {
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)
    const [isLoading, setIsLoading] = useState(true)
    const status = useAppSelector((state) => state.grades.status)
    const error = useAppSelector((state) => state.grades.error)

    // Fetch grades on component mount
    useEffect(() => {
        if (user?.id && user.role) {
            dispatch(
                fetchGradeItems({
                    role: user.role,
                    userId: user.id,
                }),
            ).finally(() => setIsLoading(false))
        }
    }, [dispatch, user?.id, user?.role])

    // Redirect to login if not authenticated
    if (!user) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Authentication Required</h2>
                    <p className="text-muted-foreground mt-2">Please log in to access grades.</p>
                    <Button asChild className="mt-4">
                        <Link href="/login">Log In</Link>
                    </Button>
                </div>
            </div>
        )
    }

    // Render loading state
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-12 w-full" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-[300px] rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    // Render error state
    if (status === "failed") {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error || "Failed to load grades"}</AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-3xl font-bold">Grades</h1>
                {/* {(user.role === "teacher" || user.role === "admin" || user.role === "super_admin") && (
                    <Button asChild>
                        <Link href="/grades/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Grade Item
                        </Link>
                    </Button>
                )} */}
            </div>

            {user.role === "student" ? <StudentGradeList /> : <GradeTable />}
        </div>
    )
}
