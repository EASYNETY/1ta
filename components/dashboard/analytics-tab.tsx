// components/dashboard/analytics-tab.tsx

"use client"

import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { isSuperAdmin } from "@/types/user.types";
import { useEffect } from "react"
import { BookOpen } from "phosphor-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, AreaChart, Bar, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { fetchAnalyticsDashboard, selectAnalyticsDashboardStats, selectAnalyticsStatus } from "@/features/analytics/store/analytics-slice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, Calendar } from "lucide-react"
import { Skeleton } from "../ui/skeleton";
import { TabsContent } from "../ui/tabs";


export function AnalyticsTab() {
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)
    const stats = useAppSelector(selectAnalyticsDashboardStats);
    const analyticStatus = useAppSelector(selectAnalyticsStatus);

    useEffect(() => {
        if (isSuperAdmin(user)) dispatch(fetchAnalyticsDashboard());
    }, [dispatch]);

    const isLoading = analyticStatus === "loading";


    return (
        <TabsContent value="analytics" className="space-y-6">
            {/* Overview Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Student Stats Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <>
                                <Skeleton className="h-7 w-24 mb-1" />
                                <Skeleton className="h-4 w-32" />
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats.studentStats.total}</div>
                                <div className="text-xs text-muted-foreground">
                                    +{stats.studentStats.newThisMonth} this month
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Course Stats Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <>
                                <Skeleton className="h-7 w-24 mb-1" />
                                <Skeleton className="h-4 w-32" />
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats.courseStats.total}</div>
                                <div className="text-xs text-muted-foreground">
                                    {stats.courseStats.averageCompletion}% avg. completion
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Revenue Stats Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <>
                                <Skeleton className="h-7 w-24 mb-1" />
                                <Skeleton className="h-4 w-32" />
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">₦{(stats.paymentStats.totalRevenue).toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">
                                    +₦{(stats.paymentStats.revenueThisMonth).toLocaleString()} this month
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Attendance Stats Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <>
                                <Skeleton className="h-7 w-24 mb-1" />
                                <Skeleton className="h-4 w-32" />
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats.attendanceStats.averageRate}%</div>
                                <div className="text-xs text-muted-foreground">
                                    Average attendance rate
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="min-h-80 h-auto">
                        {isLoading ? (
                            <div className="h-full w-full flex items-center justify-center">
                                <Skeleton className="h-64 w-full" />
                            </div>
                        ) : (
                            <ChartContainer
                                config={{
                                    revenue: {
                                        label: "Revenue",
                                        theme: {
                                            light: "#28A745",
                                            dark: "#28A745",
                                        },
                                    },
                                }}
                            >
                                <AreaChart
                                    data={stats.paymentStats.revenueTrends || [
                                        { month: "Jan", revenue: 120000 },
                                        { month: "Feb", revenue: 150000 },
                                        { month: "Mar", revenue: 180000 },
                                        { month: "Apr", revenue: 170000 },
                                        { month: "May", revenue: 200000 },
                                        { month: "Jun", revenue: 250000 },
                                    ]}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <ChartTooltip
                                        content={({ active, payload }) => (
                                            <ChartTooltipContent
                                                active={active}
                                                payload={payload}
                                                formatter={(value) => `₦${(value as number).toLocaleString()}`}
                                            />
                                        )}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="var(--color-revenue)"
                                        fill="var(--color-revenue)"
                                        fillOpacity={0.2}
                                    />
                                </AreaChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Enrolment Distribution Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Course Enrolments</CardTitle>
                    </CardHeader>
                    <CardContent className="min-h-80 h-auto">
                        {isLoading ? (
                            <div className="h-full w-full flex items-center justify-center">
                                <Skeleton className="h-64 w-full" />
                            </div>
                        ) : (
                            <ChartContainer
                                config={{
                                    enrolments: {
                                        label: "Enrolments",
                                        theme: {
                                            light: "#28A745",
                                            dark: "#28A745",
                                        },
                                    },
                                }}
                            >
                                <BarChart
                                    data={stats.courseStats.categoryDistribution ?
                                        Object.entries(stats.courseStats.categoryDistribution).map(([category, count]) => ({
                                            category,
                                            enrolments: count
                                        })) :
                                        [
                                            { category: "Web Dev", enrolments: 45 },
                                            { category: "Data Science", enrolments: 30 },
                                            { category: "UX Design", enrolments: 25 },
                                            { category: "Mobile Dev", enrolments: 20 },
                                            { category: "DevOps", enrolments: 15 },
                                        ]
                                    }
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="category" />
                                    <YAxis />
                                    <ChartTooltip
                                        content={({ active, payload }) => (
                                            <ChartTooltipContent
                                                active={active}
                                                payload={payload}
                                            />
                                        )}
                                    />
                                    <Bar
                                        dataKey="enrolments"
                                        fill="var(--color-enrolments)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
    )
}
