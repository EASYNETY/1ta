// components/attendance/attendance-tab.tsx

"use client"

import { useState, useEffect } from "react"
import { useAppSelector } from "@/store/hooks"
import { StudentAttendanceView } from "./student-attendance-view"
import { TeacherAttendanceView } from "./teacher-attendance-view"
import { DyraneButton } from "../dyrane-ui/dyrane-button"
import Link from "next/link"
import { BarcodeIcon, ScanBarcode } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import Barcode from "react-barcode"
import { BarcodeDialog } from "../tools/BarcodeDialog"
import { isStudent } from "@/types/user.types";
import { PageHeader } from "../layout/auth/page-header"

export function Attendance() {
    const { user } = useAppSelector((state) => state.auth)
    const [isLoading, setIsLoading] = useState(true)
    const [showStudentBarcodeModal, setShowStudentBarcodeModal] = useState(false);


    useEffect(() => {
        // Simulate loading state
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 500)

        return () => clearTimeout(timer)
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <p className="text-muted-foreground">Please log in to view attendance records.</p>
            </div>
        )
    }

    // Render different views based on user role
    return (
        <div className="mx-auto">
            <PageHeader
                heading={'Attendance Records'}
                actions={
                    !isStudent(user) ? (
                        <DyraneButton
                            variant="default"
                            className="hidden sm:flex"
                        >

                            <Link
                                href={`/attendance/scan`}
                                className="flex items-center gap-2"
                            >
                                <ScanBarcode className="h-4 w-4" />
                                Scan Attendance
                            </Link>
                        </DyraneButton>
                    ) : (
                        <div className="hidden sm:block">
                            <BarcodeDialog barcodeId={user.barcodeId} userId={user.id} triggerLabel="Barcode" />
                        </div>
                    )
                }
            />
            {user.role === "student" ? <StudentAttendanceView /> : <TeacherAttendanceView />}
        </div>
    )
}
