"use client"

import { useState } from "react"
import { useAppSelector } from "@/store/hooks"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, Clock, Calendar, BarChart } from "lucide-react"
import Link from "next/link"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { motion } from "framer-motion"
import  LoadingState  from "./loading"

export default function DashboardPage() {
    const { user } = useAppSelector((state) => state.auth)
    const [activeTab, setActiveTab] = useState("overview")

    if (!user) {
        return <LoadingState />
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    }

    return (
        <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
                <DyraneButton asChild>
                    <Link href="/courses">Browse Courses</Link>
                </DyraneButton>
            </div>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="courses">Courses</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    {user.role !== "student" && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
                </TabsList>

                <TabsContent value="overview">
                    <motion.div
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        <motion.div variants={item}>
                            <DyraneCard>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{user.role === "student" ? "5 Enrolled" : "12 Created"}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {user.role === "student" ? "+2 courses this month" : "+3 courses this month"}
                                    </p>
                                </CardContent>
                            </DyraneCard>
                        </motion.div>

                        <motion.div variants={item}>
                            <DyraneCard>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {user.role === "student" ? "Learning Hours" : "Active Students"}
                                    </CardTitle>
                                    {user.role === "student" ? (
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{user.role === "student" ? "24 Hours" : "128 Students"}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {user.role === "student" ? "+5 hours this week" : "+12 students this month"}
                                    </p>
                                </CardContent>
                            </DyraneCard>
                        </motion.div>

                        <motion.div variants={item}>
                            <DyraneCard>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                                    <div className="h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                        %
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">78%</div>
                                    <div className="mt-2 h-2 w-full rounded-full bg-primary/20">
                                        <div className="h-full w-[78%] rounded-full bg-primary" />
                                    </div>
                                </CardContent>
                            </DyraneCard>
                        </motion.div>
                    </motion.div>

                    <h2 className="text-2xl font-bold mt-8">{user.role === "student" ? "My Courses" : "Recent Activity"}</h2>

                    <motion.div
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        {[1, 2, 3].map((i) => (
                            <motion.div key={i} variants={item}>
                                <DyraneCard className="overflow-hidden">
                                    <div className="aspect-video bg-muted" />
                                    <CardHeader>
                                        <CardTitle>
                                            {user.role === "student"
                                                ? `Introduction to ${i === 1 ? "Mathematics" : i === 2 ? "Science" : "History"}`
                                                : `${i === 1 ? "New enrollment" : i === 2 ? "Course updated" : "Assignment submitted"}`}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            {user.role === "student" ? `Progress: ${i * 20}%` : `${i * 10} minutes ago`}
                                        </p>
                                    </CardContent>
                                    <CardFooter>
                                        <DyraneButton variant="outline" size="sm" className="w-full">
                                            {user.role === "student" ? "Continue Learning" : "View Details"}
                                        </DyraneButton>
                                    </CardFooter>
                                </DyraneCard>
                            </motion.div>
                        ))}
                    </motion.div>
                </TabsContent>

                <TabsContent value="courses">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <DyraneCard key={i} className="overflow-hidden">
                                <div className="aspect-video bg-muted" />
                                <CardHeader>
                                    <CardTitle>
                                        {i === 1
                                            ? "Introduction to Mathematics"
                                            : i === 2
                                                ? "Advanced Physics"
                                                : i === 3
                                                    ? "World History"
                                                    : i === 4
                                                        ? "Computer Science Basics"
                                                        : "English Literature"}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Clock className="mr-1 h-4 w-4" />
                                        <span>{`${i * 5 + 10} hours`}</span>
                                        <span className="mx-2">•</span>
                                        <span>{i % 2 === 0 ? "Intermediate" : "Beginner"}</span>
                                    </div>
                                    <div className="mt-2 h-2 w-full rounded-full bg-primary/20">
                                        <div className={`h-full w-[${i * 15}%] rounded-full bg-primary`} style={{ width: `${i * 15}%` }} />
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">{`${i * 15}% complete`}</p>
                                </CardContent>
                                <CardFooter>
                                    <DyraneButton variant="outline" size="sm" className="w-full">
                                        Continue Learning
                                    </DyraneButton>
                                </CardFooter>
                            </DyraneCard>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="schedule">
                    <DyraneCard>
                        <CardHeader>
                            <CardTitle>Upcoming Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-start space-x-4 rounded-lg border p-4">
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Calendar className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium">
                                                {i === 1
                                                    ? "Mathematics Quiz"
                                                    : i === 2
                                                        ? "Physics Lab Session"
                                                        : i === 3
                                                            ? "History Assignment Due"
                                                            : "Group Project Meeting"}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {i === 1
                                                    ? "Today, 2:00 PM - 3:00 PM"
                                                    : i === 2
                                                        ? "Tomorrow, 10:00 AM - 12:00 PM"
                                                        : i === 3
                                                            ? "Friday, 11:59 PM"
                                                            : "Saturday, 3:00 PM - 5:00 PM"}
                                            </p>
                                        </div>
                                        <div className="ml-auto">
                                            <DyraneButton variant="outline" size="sm">
                                                {i === 3 ? "Submit" : "Join"}
                                            </DyraneButton>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </DyraneCard>
                </TabsContent>

                {user.role !== "student" && (
                    <TabsContent value="analytics">
                        <div className="grid gap-6 md:grid-cols-2">
                            <DyraneCard>
                                <CardHeader>
                                    <CardTitle>Student Engagement</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[300px] flex items-center justify-center">
                                    <div className="text-center text-muted-foreground">
                                        <BarChart className="mx-auto h-16 w-16 opacity-50" />
                                        <p className="mt-2">Analytics visualization would appear here</p>
                                    </div>
                                </CardContent>
                            </DyraneCard>

                            <DyraneCard>
                                <CardHeader>
                                    <CardTitle>Course Completion</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {["Mathematics", "Physics", "History", "Computer Science"].map((course, i) => (
                                            <div key={course} className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">{course}</span>
                                                    <span className="text-sm text-muted-foreground">{`${65 + i * 5}%`}</span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-primary/20">
                                                    <div className="h-full rounded-full bg-primary" style={{ width: `${65 + i * 5}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </DyraneCard>
                        </div>
                    </TabsContent>
                )}
            </Tabs>
        </motion.div>
    )
}
