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
import AdminDailyRevenueTrends from "@/features/payment/components/AdminDailyRevenueTrends";
import RevenueByCourseDistribution from "@/features/payment/components/RevenueByCourseDistribution";


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


            <div className="grid gap-6 lg:grid-cols-2">
                <AdminDailyRevenueTrends />
                <RevenueByCourseDistribution />
            </div>
        </TabsContent>
    )
}
