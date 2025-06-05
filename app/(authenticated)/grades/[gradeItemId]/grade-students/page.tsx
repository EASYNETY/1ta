// app/(authenticated)/grades/[gradeItemId]/grade-students/page.tsx

"use client"
import { useEffect } from "react"
import { useParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
    fetchGradeItemById,
    selectCurrentGradeItem,
    selectGradeStatus,
    selectGradeError,
    clearCurrentGradeItem,
} from "@/features/grades/store/grade-slice"
import GradeStudentsForm from "@/features/grades/components/GradeStudentsForm"
import { PageHeader } from "@/components/layout/auth/page-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

export default function GradeStudentsPage() {
    const params = useParams()
    const dispatch = useAppDispatch()
    const gradeItemId = params.gradeItemId as string
    const gradeItem = useAppSelector(selectCurrentGradeItem)
    const status = useAppSelector(selectGradeStatus)
    const error = useAppSelector(selectGradeError)
    const { user } = useAppSelector((state) => state.auth)

    useEffect(() => {
        if (gradeItemId && user?.role) {
            dispatch(
                fetchGradeItemById({
                    gradeItemId,
                    role: user.role,
                    userId: user.id,
                }),
            )
        }

        return () => {
            dispatch(clearCurrentGradeItem())
        }
    }, [dispatch, gradeItemId, user?.id, user?.role])

    // Check if user has permission to grade
    if (user?.role !== "teacher" && user?.role !== "admin" && user?.role !== 'super_admin') {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>You do not have permission to grade students.</AlertDescription>
            </Alert>
        )
    }

    // Loading state
    // if (status === "loading") {
    //     return (
    //         <div className="space-y-6">
    //             <PageHeader heading={<Skeleton className="h-8 w-64" />} subheading={<Skeleton className="h-5 w-48" />} />
    //             <Skeleton className="h-[600px] w-full rounded-lg" />
    //         </div>
    //     )
    // }

    // Error state
    if (status === "failed") {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error || "Failed to load grade item. Please try again."}</AlertDescription>
            </Alert>
        )
    }

    // No grade item found
    if (!gradeItem) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Not Found</AlertTitle>
                <AlertDescription>The requested grade item could not be found.</AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader heading="Grade Students" subheading={`Assign grades for ${gradeItem.title}`} />
            <GradeStudentsForm gradeItem={gradeItem} />
        </div>
    )
}
