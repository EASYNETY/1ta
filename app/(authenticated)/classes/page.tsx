// app/(authenticated)/attendance/page.tsx
'use client';

import { PageHeader } from "@/components/layout/auth/page-header";
import AdminClassesTab from "@/features/classes/components/AdminClassesTab";
import StudentClassesTab from "@/features/classes/components/StudentClassesTab";
import TeacherClassesTab from "@/features/classes/components/TeacherClassesTab";
import { useAppSelector } from "@/store/hooks";


export default function AttendancePage() {
    const { user } = useAppSelector((state) => state.auth);
    const isAdmin = user?.role === "admin" || user?.role === "super_admin"
    const isTeacher = user?.role === "teacher"
    const isStudent = user?.role === "student"

    if (!user) return null; // Handle loading state or redirect to login
    const renderTab = () => {
        if (isAdmin) return <AdminClassesTab /> // Admins and Super Admins see all attendance
        if (isTeacher) return <TeacherClassesTab /> // Teachers see their classes
        if (isStudent) return <StudentClassesTab /> // Students see their classes
    }

    const renderHeader = () => {
        if (isAdmin) return "All Classes"
        if (isTeacher) return "My Classes"
        if (isStudent) return "My Classes"
    }

    const renderDescription = () => {
        if (isAdmin) return "Manage all classes"
        if (isTeacher) return "Manage my classes"
        if (isStudent) return "View your classes"
    }

    return (
        <div className="mx-auto">
            <PageHeader
                heading={renderHeader()}
                subheading={renderDescription()}
            />
            {/* Render the appropriate tab based on user role */}
            {renderTab()}
        </div>
    )
}
