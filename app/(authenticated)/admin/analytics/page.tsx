"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAnalyticsDashboard, selectAnalyticsDashboardStats, selectAnalyticsStatus } from "@/features/analytics/store/analytics-slice";
import { PageHeader } from "@/components/layout/auth/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, LineChart, PieChart, AreaChart, Bar, Line, Pie, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Users, BookOpen, CreditCard, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import Link from "next/link";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsDashboard() {
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectAnalyticsDashboardStats);
  const status = useAppSelector(selectAnalyticsStatus);

  useEffect(() => {
    dispatch(fetchAnalyticsDashboard());
  }, [dispatch]);

  const isLoading = status === "loading";

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Analytics Dashboard"
        subheading="View key metrics and performance indicators"
        actions={
          <div className="flex gap-2">
            <DyraneButton asChild>
              <Link href="/admin/analytics/reports">View Reports</Link>
            </DyraneButton>
          </div>
        }
      />

      <Tabs defaultValue="overview">
        <ScrollArea className="w-full whitespace-nowrap pb-0">
          <TabsList className="mb-4 overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <TabsContent value="overview" className="space-y-6">
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
                    <div className="text-2xl font-bold">₦{(stats.paymentStats.totalRevenue / 100).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      +₦{(stats.paymentStats.revenueThisMonth / 100).toLocaleString()} this month
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
              <CardContent className="h-80">
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
                            formatter={(value) => `₦${(value as number / 100).toLocaleString()}`}
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

            {/* Enrollment Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Course Enrollments</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <ChartContainer
                    config={{
                      enrollments: {
                        label: "Enrollments",
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
                          enrollments: count
                        })) :
                        [
                          { category: "Web Dev", enrollments: 45 },
                          { category: "Data Science", enrollments: 30 },
                          { category: "UX Design", enrollments: 25 },
                          { category: "Mobile Dev", enrollments: 20 },
                          { category: "DevOps", enrollments: 15 },
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
                        dataKey="enrollments"
                        fill="var(--color-enrollments)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Additional tabs content */}
        <TabsContent value="students">
          {/* Student-specific analytics */}
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Student Analytics Coming Soon</h3>
            <p className="text-muted-foreground">Detailed student analytics will be available in the next update.</p>
          </div>
        </TabsContent>

        <TabsContent value="courses">
          {/* Course-specific analytics */}
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Course Analytics Coming Soon</h3>
            <p className="text-muted-foreground">Detailed course analytics will be available in the next update.</p>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          {/* Payment-specific analytics */}
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Payment Analytics Coming Soon</h3>
            <p className="text-muted-foreground">Detailed payment analytics will be available in the next update.</p>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          {/* Attendance-specific analytics */}
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Attendance Analytics Coming Soon</h3>
            <p className="text-muted-foreground">Detailed attendance analytics will be available in the next update.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
