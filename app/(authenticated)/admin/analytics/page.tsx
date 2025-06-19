// app(authenticated)/admin/analytics/page.tsx

"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAnalyticsDashboard, selectAnalyticsDashboardStats, selectAnalyticsStatus, selectDerivedCourseRevenue, selectDerivedAttendanceReports } from "@/features/analytics/store/analytics-slice";
import { PageHeader } from "@/components/layout/auth/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { BarChart, LineChart, PieChart, AreaChart, Bar, Line, Pie, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { Users, BookOpen, CreditCard, Calendar } from "lucide-react";
import Link from "next/link";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { Skeleton } from "@/components/ui/skeleton";

const PIE_CHART_COLORS = ["#3B82F6", "#EC4899", "#10B981", "#F59E0B", "#6B7280", "#EF4444"];

// Helper to ensure data is always an array for charts
const ensureArray = (data: any) => (Array.isArray(data) ? data : []);

export default function AnalyticsDashboard() {
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectAnalyticsDashboardStats);
  const status = useAppSelector(selectAnalyticsStatus);

  useEffect(() => {
    if (status === "idle" || status === "failed") {
      dispatch(fetchAnalyticsDashboard());
    }
  }, [dispatch, status]);

  const isLoading = status === "loading" || status === "idle";

  // --- Define Chart Configs ---
  // This is required by <ChartContainer> to render tooltips and legends correctly.
  const revenueTrendConfig: ChartConfig = {
    value: { label: "Revenue", color: "#28A745" },
  };
  const popularCoursesConfig: ChartConfig = {
    value: { label: "Enrolments", color: "#28A745" },
  };
  const studentGrowthConfig: ChartConfig = {
    value: { label: "New Students", color: "#28A745" },
  };
  const completionRateConfig: ChartConfig = {
    value: { label: "Completion %", color: "#28A745" },
  };
  const avgGradeConfig: ChartConfig = {
    value: { label: "Avg. Grade", color: "#3B82F6" },
  };
  const revenueByCourseConfig: ChartConfig = {
    value: { label: "Revenue", color: "#28A745" },
  };
  const attendanceTrendConfig: ChartConfig = {
    value: { label: "Attendance Rate", color: "#28A745" },
  };
  const attendanceDayConfig: ChartConfig = {
    value: { label: "Attendance Rate", color: "#28A745" },
  };


  // Safely get chart data and create dynamic configs for Pie Charts
  const genderData = ensureArray(stats?.studentStats?.genderDistribution);
  const genderConfig = Object.fromEntries(
    genderData.map((entry, index) => [
      entry.name,
      { label: entry.name, color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length] },
    ])
  ) as ChartConfig;

  const ageData = ensureArray(stats?.studentStats?.ageDistribution);
  const ageConfig: ChartConfig = {
    value: { label: "Students", color: "#28A745" },
  }

  const paymentMethodData = ensureArray(stats?.paymentStats?.paymentMethodDistribution);
  const paymentMethodConfig = Object.fromEntries(
    paymentMethodData.map((entry, index) => [
      entry.name,
      { label: entry.name, color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length] },
    ])
  ) as ChartConfig;

  const paymentStatusData = ensureArray(stats?.paymentStats?.paymentStatusDistribution);
  const paymentStatusConfig = Object.fromEntries(
    paymentStatusData.map((entry, index) => [
      entry.name,
      { label: entry.name, color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length] },
    ])
  ) as ChartConfig;

  const attendanceStatusData = ensureArray(stats?.attendanceStats?.statusDistribution);
  const attendanceStatusConfig = Object.fromEntries(
    attendanceStatusData.map((entry, index) => [
      entry.name,
      { label: entry.name, color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length] },
    ])
  ) as ChartConfig;


  return (
    <div className="space-y-6">
      <PageHeader
        heading="Analytics Dashboard"
        subheading="View key metrics and performance indicators for your academy"
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

        {/* --- OVERVIEW TAB --- */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat Cards are fine, no charts here */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-12 w-32" /> : (
                  <>
                    <div className="text-2xl font-bold">{stats.studentStats.total}</div>
                    <p className="text-xs text-muted-foreground">+{stats.studentStats.newThisMonth} new this month</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-12 w-32" /> : (
                  <>
                    <div className="text-2xl font-bold">{stats.courseStats.total}</div>
                    <p className="text-xs text-muted-foreground">{stats.courseStats.averageCompletion}% avg. completion</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-12 w-32" /> : (
                  <>
                    <div className="text-2xl font-bold">₦{(stats.paymentStats.totalRevenue / 100).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">+₦{(stats.paymentStats.revenueThisMonth / 100).toLocaleString()} this month</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-12 w-32" /> : (
                  <>
                    <div className="text-2xl font-bold">{stats.attendanceStats.averageRate}%</div>
                    <p className="text-xs text-muted-foreground">Overall attendance rate</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Revenue Trend (Last 6 Months)</CardTitle></CardHeader>
              <CardContent className="h-80">
                {isLoading ? <Skeleton className="h-full w-full" /> : (
                  <ChartContainer config={revenueTrendConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={ensureArray(stats.paymentStats.revenueTrends)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(value) => `₦${(value / 100 / 1000)}k`} />
                        <ChartTooltip content={<ChartTooltipContent formatter={(value) => `₦${(value as number / 100).toLocaleString()}`} />} />
                        <Area type="monotone" dataKey="value" stroke={revenueTrendConfig.value.color} fill={revenueTrendConfig.value.color} fillOpacity={0.2} name="Revenue" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Top 5 Most Popular Courses</CardTitle></CardHeader>
              <CardContent className="h-80">
                {isLoading ? <Skeleton className="h-full w-full" /> : (
                  <ChartContainer config={popularCoursesConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ensureArray(stats.courseStats.enrolmentsByCourse)} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill={popularCoursesConfig.value.color} radius={[0, 4, 4, 0]} name="Enrolments" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- STUDENTS TAB --- */}
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Student Growth (Last 6 Months)</CardTitle></CardHeader>
            <CardContent className="h-80">
              {isLoading ? <Skeleton className="h-full w-full" /> : (
                <ChartContainer config={studentGrowthConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ensureArray(stats.studentStats.growth)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="value" stroke={studentGrowthConfig.value.color} fill={studentGrowthConfig.value.color} fillOpacity={0.2} name="New Students" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Gender Distribution</CardTitle></CardHeader>
              <CardContent className="h-80">
                {isLoading ? <Skeleton className="h-full w-full" /> : (
                  <ChartContainer config={genderConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {genderData.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={genderConfig[entry.name]?.color} />
                          ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Age Distribution</CardTitle></CardHeader>
              <CardContent className="h-80">
                {isLoading ? <Skeleton className="h-full w-full" /> : (
                  <ChartContainer config={ageConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill={ageConfig.value.color} radius={[4, 4, 0, 0]} name="Students" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* All other tabs follow the same pattern... */}
        {/* --- COURSES TAB --- */}
        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Completion Rates by Course (Top 5)</CardTitle></CardHeader>
              <CardContent className="h-96">
                {isLoading ? <Skeleton className="h-full w-full" /> : (
                  <ChartContainer config={completionRateConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ensureArray(stats.courseStats.completionRateByCourse)} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value}%`} />} />
                        <Bar dataKey="value" fill={completionRateConfig.value.color} name="Completion %" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Average Grades by Course (Top 5)</CardTitle></CardHeader>
              <CardContent className="h-96">
                {isLoading ? <Skeleton className="h-full w-full" /> : (
                  <ChartContainer config={avgGradeConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ensureArray(stats.courseStats.averageGradeByCourse)} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value}%`} />} />
                        <Bar dataKey="value" fill={avgGradeConfig.value.color} name="Avg. Grade" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- PAYMENTS TAB --- */}
          <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Revenue by Course (Top 5)</CardTitle></CardHeader>
            <CardContent className="h-96">
              {isLoading ? <Skeleton className="h-full w-full" /> : (
                <ChartContainer config={revenueByCourseConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ensureArray(selectDerivedCourseRevenue)} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(value) => `₦${(value / 100 / 1000)}k`} />
                      <YAxis dataKey="courseName" type="category" width={150} tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent formatter={(value) => `₦${(value as number / 100).toLocaleString()}`} />} />
                      <Bar dataKey="totalRevenue" fill={revenueByCourseConfig.value.color} name="Revenue" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Payment Methods</CardTitle></CardHeader>
              <CardContent className="h-80">
                {isLoading ? <Skeleton className="h-full w-full" /> : (
                  <ChartContainer config={paymentMethodConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Pie data={paymentMethodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {paymentMethodData.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={paymentMethodConfig[entry.name]?.color} />
                          ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Payment Status</CardTitle></CardHeader>
              <CardContent className="h-80">
                {isLoading ? <Skeleton className="h-full w-full" /> : (
                  <ChartContainer config={paymentStatusConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Pie data={paymentStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {paymentStatusData.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={paymentStatusConfig[entry.name]?.color} />
                          ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- ATTENDANCE TAB --- */}
        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Attendance Rate Trend (Last 6 Months)</CardTitle></CardHeader>
            <CardContent className="h-80">
              {isLoading ? <Skeleton className="h-full w-full" /> : (
                <ChartContainer config={attendanceTrendConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ensureArray(stats.attendanceStats.rateTrends)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                      <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value}%`} />} />
                      <Line type="monotone" dataKey="value" stroke={attendanceTrendConfig.value.color} strokeWidth={2} name="Attendance Rate" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Attendance by Day of Week</CardTitle></CardHeader>
              <CardContent className="h-80">
                {isLoading ? <Skeleton className="h-full w-full" /> : (
                  <ChartContainer config={attendanceDayConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ensureArray(stats.attendanceStats.byDayOfWeek)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                        <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value}%`} />} />
                        <Bar dataKey="value" fill={attendanceDayConfig.value.color} radius={[4, 4, 0, 0]} name="Attendance Rate" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Attendance Status Distribution</CardTitle></CardHeader>
              <CardContent className="h-80">
                {isLoading ? <Skeleton className="h-full w-full" /> : (
                  <ChartContainer config={attendanceStatusConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Pie data={attendanceStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {attendanceStatusData.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={attendanceStatusConfig[entry.name]?.color} />
                          ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}