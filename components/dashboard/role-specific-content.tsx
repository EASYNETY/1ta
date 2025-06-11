"use client"

import type React from "react"
import { useAppSelector } from "@/store/hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Users,
    BookOpen,
    BarChart3,
    Settings,
    Plus,
    FileText,
    Calendar,
    CreditCard,
    MessageSquare,
    CheckCircle,
} from "lucide-react"
import Link from "next/link"
import type { UserRole } from "@/types/user.types"

interface QuickActionProps {
    title: string
    description: string
    icon: React.ReactNode
    href: string
    disabled?: boolean
}

const QuickAction = ({ title, description, icon, href, disabled = false }: QuickActionProps) => (
    <Button
        asChild={!disabled}
        variant="outline"
        disabled={disabled}
        className="
      h-auto min-h-[100px] p-4
      flex flex-col items-center justify-center space-y-2
      hover:bg-accent/50 transition-colors
      w-full sm:w-auto sm:flex-grow sm:basis-[calc(50%-0.5rem)] md:basis-[calc(33.33%-0.66rem)] lg:basis-[calc(25%-0.75rem)]
      min-w-[160px] max-w-full sm:max-w-xs
      border-primary/20 hover:border-primary/40
    "
    >
        {disabled ? (
            <div className="flex h-full w-full flex-col items-center justify-center space-y-2 p-4">
                <div className="text-primary/50">{icon}</div>
                {/* Add w-full to the text container */}
                <div className="w-full text-center space-y-0.5">
                    <p className="truncate font-semibold text-sm sm:text-base leading-tight text-muted-foreground">
                        {title}
                    </p>
                    {/* Add truncate and remove flex flex-wrap */}
                    <p className="truncate text-xs sm:text-sm text-muted-foreground leading-tight">
                        {description}
                    </p>
                </div>
                <span className="mt-1 text-xs text-destructive/70">(Coming Soon)</span>
            </div>
        ) : (
            <Link href={href} className="flex flex-col items-center justify-center space-y-2 w-full h-full p-4">
                <div className="text-primary">{icon}</div>
                {/* Add w-full to the text container */}
                <div className="w-full text-center space-y-0.5">
                    <p className="truncate font-semibold text-sm sm:text-base leading-tight">
                        {title}
                    </p>
                    <p className="truncate text-xs sm:text-sm text-muted-foreground leading-tight">
                        {description}
                    </p>
                </div>
            </Link>
        )}
    </Button>
)

export function RoleSpecificContent() {
    const { user } = useAppSelector((state) => state.auth)
    const userRole = user?.role as UserRole

    if (!user) return null

    const renderRoleContent = () => {
        switch (userRole) {
            case "super_admin":
                return (
                    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                        <CardHeader>
                            <CardTitle>System Administration</CardTitle>
                            <CardDescription>Manage platform operations and settings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                <QuickAction
                                    title="User Management"
                                    description="Manage all platform users"
                                    icon={<Users className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/users"
                                />
                                <QuickAction
                                    title="System Analytics"
                                    description="View comprehensive analytics"
                                    icon={<BarChart3 className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/admin/analytics"
                                />
                                <QuickAction
                                    title="Platform Settings"
                                    description="Configure system settings"
                                    icon={<Settings className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/settings"
                                />
                                <QuickAction
                                    title="Course Management"
                                    description="Oversee all courses"
                                    icon={<BookOpen className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/courses"
                                />
                                <QuickAction
                                    title="Financial Reports"
                                    description="View revenue and payments"
                                    icon={<CreditCard className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/payments"
                                />
                                <QuickAction
                                    title="Support Center"
                                    description="Manage support tickets"
                                    icon={<MessageSquare className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/support/tickets"
                                />
                            </div>
                        </CardContent>
                    </Card>
                )

            case "admin":
                return (
                    <Card className="bg-gradient-to-br from-blue/5 to-blue/10 border-blue/20">
                        <CardHeader>
                            <CardTitle>Administration</CardTitle>
                            <CardDescription>Manage students, teachers, and platform operations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                <QuickAction
                                    title="Student Management"
                                    description="Manage student accounts"
                                    icon={<Users className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/users"
                                />
                                <QuickAction
                                    title="Course Oversight"
                                    description="Monitor course progress"
                                    icon={<BookOpen className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/courses"
                                />
                                <QuickAction
                                    title="Payment History"
                                    description="View payment records"
                                    icon={<CreditCard className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/payments"
                                />
                                <QuickAction
                                    title="Support Tickets"
                                    description="Handle support requests"
                                    icon={<MessageSquare className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/support/tickets"
                                />
                                <QuickAction
                                    title="Feedback"
                                    description="Review user feedback"
                                    icon={<FileText className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/support/feedback"
                                />
                                <QuickAction
                                    title="Settings"
                                    description="Platform configuration"
                                    icon={<Settings className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/settings"
                                />
                            </div>
                        </CardContent>
                    </Card>
                )

            case "teacher":
                return (
                    <Card className="bg-gradient-to-br from-green/5 to-green/10 border-green/20">
                        <CardHeader>
                            <CardTitle>Teaching Tools</CardTitle>
                            <CardDescription>Manage classes, assignments, and student progress</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                <QuickAction
                                    title="My Courses"
                                    description="Manage course content"
                                    icon={<BookOpen className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/courses"
                                />
                                <QuickAction
                                    title="Attendance"
                                    description="Track student attendance"
                                    icon={<CheckCircle className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/attendance"
                                />
                                <QuickAction
                                    title="Timetable"
                                    description="View teaching schedule"
                                    icon={<Calendar className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/timetable"
                                />
                                <QuickAction
                                    title="Analytics"
                                    description="View student progress"
                                    icon={<BarChart3 className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/analytics"
                                />
                                <QuickAction
                                    title="Discussions"
                                    description="Class discussions"
                                    icon={<MessageSquare className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/chat"
                                />
                                <QuickAction
                                    title="Create Assignment"
                                    description="Create new assignments"
                                    icon={<Plus className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/assignments/create"
                                    disabled={true}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )

            case "student":
            default:
                return (
                    <Card className="bg-gradient-to-br from-amber/5 to-amber/10 border-amber/20">
                        <CardHeader>
                            <CardTitle>Learning Hub</CardTitle>
                            <CardDescription>Access your courses, assignments, and academic progress</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                <QuickAction
                                    title="Browse Courses"
                                    description="Explore available courses"
                                    icon={<BookOpen className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/courses"
                                />
                                <QuickAction
                                    title="Attendance"
                                    description="View your attendance"
                                    icon={<CheckCircle className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/attendance"
                                />
                                <QuickAction
                                    title="Timetable"
                                    description="View your schedule"
                                    icon={<Calendar className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/timetable"
                                />
                                <QuickAction
                                    title="Analytics"
                                    description="Track your progress"
                                    icon={<BarChart3 className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/analytics"
                                />
                                <QuickAction
                                    title="Payment History"
                                    description="View payment records"
                                    icon={<CreditCard className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/payments"
                                />
                                <QuickAction
                                    title="Discussions"
                                    description="Join class discussions"
                                    icon={<MessageSquare className="h-6 w-6 sm:h-7 sm:w-7" />}
                                    href="/chat"
                                />
                            </div>
                        </CardContent>
                    </Card>
                )
        }
    }

    return renderRoleContent()
}
