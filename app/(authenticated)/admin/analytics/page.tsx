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
          <div className="space-y-6">
            {/* Student Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Student Growth</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <ChartContainer
                    config={{
                      students: {
                        label: "Students",
                        theme: {
                          light: "#28A745",
                          dark: "#28A745",
                        },
                      },
                    }}
                  >
                    <AreaChart
                      data={[
                        { month: "Jan", students: 150 },
                        { month: "Feb", students: 170 },
                        { month: "Mar", students: 180 },
                        { month: "Apr", students: 190 },
                        { month: "May", students: 210 },
                        { month: "Jun", students: 230 },
                        { month: "Jul", students: 250 },
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
                          />
                        )}
                      />
                      <Area
                        type="monotone"
                        dataKey="students"
                        stroke="var(--color-students)"
                        fill="var(--color-students)"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Student Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gender Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Gender Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoading ? (
                    <div className="h-full w-full flex items-center justify-center">
                      <Skeleton className="h-64 w-full" />
                    </div>
                  ) : (
                    <ChartContainer
                      config={{
                        male: {
                          label: "Male",
                          theme: {
                            light: "#3B82F6",
                            dark: "#3B82F6",
                          },
                        },
                        female: {
                          label: "Female",
                          theme: {
                            light: "#EC4899",
                            dark: "#EC4899",
                          },
                        },
                        other: {
                          label: "Other",
                          theme: {
                            light: "#10B981",
                            dark: "#10B981",
                          },
                        },
                      }}
                    >
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Male", value: 140 },
                            { name: "Female", value: 105 },
                            { name: "Other", value: 5 },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                        />
                        <ChartTooltip
                          content={({ active, payload }) => (
                            <ChartTooltipContent
                              active={active}
                              payload={payload}
                            />
                          )}
                        />
                        <ChartLegend
                          content={({ payload }) => (
                            <ChartLegendContent payload={payload} />
                          )}
                        />
                      </PieChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              {/* Age Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Age Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoading ? (
                    <div className="h-full w-full flex items-center justify-center">
                      <Skeleton className="h-64 w-full" />
                    </div>
                  ) : (
                    <ChartContainer
                      config={{
                        count: {
                          label: "Students",
                          theme: {
                            light: "#28A745",
                            dark: "#28A745",
                          },
                        },
                      }}
                    >
                      <BarChart
                        data={[
                          { age: "Under 18", count: 15 },
                          { age: "18-24", count: 95 },
                          { age: "25-34", count: 85 },
                          { age: "35-44", count: 45 },
                          { age: "45+", count: 10 },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="age" />
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
                          dataKey="count"
                          name="Students"
                          fill="var(--color-count)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="courses">
          <div className="space-y-6">
            {/* Course Popularity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Course Popularity</CardTitle>
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
                      data={[
                        { course: "Web Development", enrollments: 85 },
                        { course: "Data Science", enrollments: 65 },
                        { course: "UX Design", enrollments: 55 },
                        { course: "Mobile Development", enrollments: 45 },
                        { course: "DevOps", enrollments: 35 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="course"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 12 }}
                      />
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
                        name="Enrollments"
                        fill="var(--color-enrollments)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Course Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Completion Rates */}
              <Card>
                <CardHeader>
                  <CardTitle>Completion Rates</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoading ? (
                    <div className="h-full w-full flex items-center justify-center">
                      <Skeleton className="h-64 w-full" />
                    </div>
                  ) : (
                    <ChartContainer
                      config={{
                        completionRate: {
                          label: "Completion Rate",
                          theme: {
                            light: "#28A745",
                            dark: "#28A745",
                          },
                        },
                      }}
                    >
                      <BarChart
                        data={[
                          { course: "Web Development", completionRate: 78 },
                          { course: "Data Science", completionRate: 65 },
                          { course: "UX Design", completionRate: 82 },
                          { course: "Mobile Development", completionRate: 70 },
                          { course: "DevOps", completionRate: 85 },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="course"
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <ChartTooltip
                          content={({ active, payload }) => (
                            <ChartTooltipContent
                              active={active}
                              payload={payload}
                              formatter={(value) => `${value}%`}
                            />
                          )}
                        />
                        <Bar
                          dataKey="completionRate"
                          name="Completion Rate"
                          fill="var(--color-completionRate)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              {/* Average Grades */}
              <Card>
                <CardHeader>
                  <CardTitle>Average Grades</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoading ? (
                    <div className="h-full w-full flex items-center justify-center">
                      <Skeleton className="h-64 w-full" />
                    </div>
                  ) : (
                    <ChartContainer
                      config={{
                        grade: {
                          label: "Average Grade",
                          theme: {
                            light: "#28A745",
                            dark: "#28A745",
                          },
                        },
                      }}
                    >
                      <BarChart
                        data={[
                          { course: "Web Development", grade: 82 },
                          { course: "Data Science", grade: 78 },
                          { course: "UX Design", grade: 85 },
                          { course: "Mobile Development", grade: 80 },
                          { course: "DevOps", grade: 88 },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="course"
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis domain={[0, 100]} />
                        <ChartTooltip
                          content={({ active, payload }) => (
                            <ChartTooltipContent
                              active={active}
                              payload={payload}
                              formatter={(value) => `${value}%`}
                            />
                          )}
                        />
                        <Bar
                          dataKey="grade"
                          name="Average Grade"
                          fill="var(--color-grade)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="space-y-6">
            {/* Revenue Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
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
                        { month: "Jan", revenue: 12000000 },
                        { month: "Feb", revenue: 15000000 },
                        { month: "Mar", revenue: 18000000 },
                        { month: "Apr", revenue: 17000000 },
                        { month: "May", revenue: 20000000 },
                        { month: "Jun", revenue: 25000000 },
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

            {/* Payment Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoading ? (
                    <div className="h-full w-full flex items-center justify-center">
                      <Skeleton className="h-64 w-full" />
                    </div>
                  ) : (
                    <ChartContainer
                      config={{
                        card: {
                          label: "Card",
                          theme: {
                            light: "#3B82F6",
                            dark: "#3B82F6",
                          },
                        },
                        bankTransfer: {
                          label: "Bank Transfer",
                          theme: {
                            light: "#F59E0B",
                            dark: "#F59E0B",
                          },
                        },
                        ussd: {
                          label: "USSD",
                          theme: {
                            light: "#10B981",
                            dark: "#10B981",
                          },
                        },
                        other: {
                          label: "Other",
                          theme: {
                            light: "#6B7280",
                            dark: "#6B7280",
                          },
                        },
                      }}
                    >
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Card", value: 65 },
                            { name: "Bank Transfer", value: 20 },
                            { name: "USSD", value: 10 },
                            { name: "Other", value: 5 },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                        />
                        <ChartTooltip
                          content={({ active, payload }) => (
                            <ChartTooltipContent
                              active={active}
                              payload={payload}
                              formatter={(value) => `${value}%`}
                            />
                          )}
                        />
                        <ChartLegend
                          content={({ payload }) => (
                            <ChartLegendContent payload={payload} />
                          )}
                        />
                      </PieChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              {/* Payment Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Status</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoading ? (
                    <div className="h-full w-full flex items-center justify-center">
                      <Skeleton className="h-64 w-full" />
                    </div>
                  ) : (
                    <ChartContainer
                      config={{
                        successful: {
                          label: "Successful",
                          theme: {
                            light: "#10B981",
                            dark: "#10B981",
                          },
                        },
                        pending: {
                          label: "Pending",
                          theme: {
                            light: "#F59E0B",
                            dark: "#F59E0B",
                          },
                        },
                        failed: {
                          label: "Failed",
                          theme: {
                            light: "#EF4444",
                            dark: "#EF4444",
                          },
                        },
                      }}
                    >
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Successful", value: 85 },
                            { name: "Pending", value: 10 },
                            { name: "Failed", value: 5 },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                        />
                        <ChartTooltip
                          content={({ active, payload }) => (
                            <ChartTooltipContent
                              active={active}
                              payload={payload}
                              formatter={(value) => `${value}%`}
                            />
                          )}
                        />
                        <ChartLegend
                          content={({ payload }) => (
                            <ChartLegendContent payload={payload} />
                          )}
                        />
                      </PieChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Revenue by Course */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Course</CardTitle>
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
                    <BarChart
                      data={[
                        { course: "Web Development", revenue: 1200000000 },
                        { course: "Data Science", revenue: 950000000 },
                        { course: "UX Design", revenue: 850000000 },
                        { course: "Mobile Development", revenue: 750000000 },
                        { course: "DevOps", revenue: 550000000 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="course"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 12 }}
                      />
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
                      <Bar
                        dataKey="revenue"
                        name="Revenue"
                        fill="var(--color-revenue)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
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
