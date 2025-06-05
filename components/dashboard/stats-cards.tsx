"use client"

import type React from "react"

import { useAppSelector } from "@/store/hooks"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BookOpen, Clock, Users, GraduationCap, School, FileText } from "lucide-react"
import { motion } from "framer-motion"

interface StatsCardProps {
    title: string
    value: string
    subtitle: React.ReactNode
    icon: React.ReactNode
}

const StatsCard = ({ title, value, subtitle, icon }: StatsCardProps) => (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
        <DyraneCard>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="text-muted-foreground">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{subtitle}</div>
            </CardContent>
        </DyraneCard>
    </motion.div>
)

export function StatsCards() {
    const { user } = useAppSelector((state) => state.auth)
    const courses = useAppSelector((state) => state.auth_courses.courses)

    // Role-specific stats
    if (!user) return null

    switch (user.role) {
        case "admin":
            return (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <StatsCard
                        title="Total Students"
                        value="256"
                        subtitle="+24 this month"
                        icon={<Users className="h-4 w-4" />}
                    />
                    <StatsCard
                        title="Total Facilitators"
                        value="18"
                        subtitle="+3 this month"
                        icon={<GraduationCap className="h-4 w-4" />}
                    />
                    <StatsCard title="Total Courses" value="32" subtitle="+5 this month" icon={<School className="h-4 w-4" />} />
                    <StatsCard
                        title="Revenue"
                        value="₦1.2M"
                        subtitle="+₦250K this month"
                        icon={
                            <div className="h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                ₦
                            </div>
                        }
                    />
                </div>
            )
        case "super_admin":
            return (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <StatsCard
                        title="Total Students"
                        value="256"
                        subtitle="+24 this month"
                        icon={<Users className="h-4 w-4" />}
                    />
                    <StatsCard
                        title="Total Facilitators"
                        value="18"
                        subtitle="+3 this month"
                        icon={<GraduationCap className="h-4 w-4" />}
                    />
                    <StatsCard title="Total Courses" value="32" subtitle="+5 this month" icon={<School className="h-4 w-4" />} />
                    <StatsCard
                        title="Revenue"
                        value="₦1.2M"
                        subtitle="+₦250K this month"
                        icon={
                            <div className="h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                ₦
                            </div>
                        }
                    />
                </div>
            )
        case "teacher":
            return (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <StatsCard title="My Courses" value="5" subtitle="+1 this month" icon={<School className="h-4 w-4" />} />
                    <StatsCard title="My Students" value="128" subtitle="+12 this month" icon={<Users className="h-4 w-4" />} />
                    <StatsCard
                        title="Assignments"
                        value="24"
                        subtitle="8 pending review"
                        icon={<FileText className="h-4 w-4" />}
                    />
                    <StatsCard
                        title="Completion Rate"
                        value="78%"
                        subtitle={
                            <div className="mt-2 h-2 w-full rounded-full bg-primary/20">
                                <div className="h-full w-[78%] rounded-full bg-primary" />
                            </div>
                        }
                        icon={
                            <div className="h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                %
                            </div>
                        }
                    />
                </div>
            )
        case "student":
        default:
            return (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <StatsCard
                        title="Total Courses"
                        value={`${courses.length} Enroled`}
                        subtitle={`+${Math.min(2, courses.length)} courses this month`}
                        icon={<BookOpen className="h-4 w-4" />}
                    />
                    <StatsCard
                        title="Learning Hours"
                        value="24 Hours"
                        subtitle="+5 hours this week"
                        icon={<Clock className="h-4 w-4" />}
                    />
                    <StatsCard
                        title="Completion Rate"
                        value="78%"
                        subtitle={
                            <div className="mt-2 h-2 w-full rounded-full bg-primary/20">
                                <div className="h-full w-[78%] rounded-full bg-primary" />
                            </div>
                        }
                        icon={
                            <div className="h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                %
                            </div>
                        }
                    />
                    <StatsCard
                        title="Upcoming"
                        value="3 Events"
                        subtitle="Next: Quiz (Tomorrow)"
                        icon={<Clock className="h-4 w-4" />}
                    />
                </div>
            )
    }
}
