// app/(authenticated)/admin/analytics/page.tsx
"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAnalyticsDashboard,
  selectAnalyticsDashboardStats,
  selectAnalyticsStatus,
  selectDerivedCourseRevenue,
  selectDerivedAttendanceReports,
} from "@/features/analytics/store/analytics-slice";
import { PageHeader } from "@/components/layout/auth/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  LineChart,
  PieChart,
  AreaChart,
  Bar,
  Line,
  Pie,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Users, BookOpen, CreditCard, Calendar, Download, Clock, UserCheck } from "lucide-react";
import Link from "next/link";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import html2canvas from "html2canvas";
// Import the attendance analytics utilities
import { useAttendanceAnalytics, integrateAttendanceIntoAnalytics } from "@/utils/attendance-analytics";

const PIE_CHART_COLORS = ["#3B82F6", "#EC4899", "#10B981", "#F59E0B", "#6B7280", "#EF4444"];

// helper
const ensureArray = (data: any) => (Array.isArray(data) ? data : []);
const formatCurrency = (v?: number) => (v == null ? "₦0" : `₦${v.toLocaleString()}`);

// CSV export helper
function exportToCSV(filename: string, rows: any[]) {
  if (!rows || rows.length === 0) {
    const blob = new Blob([""], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    return;
  }
  const keys = Array.from(
    rows.reduce((acc, r) => {
      Object.keys(r || {}).forEach((k) => acc.add(k));
      return acc;
    }, new Set<string>())
  );

  const csv = [
    keys.join(","),
    ...rows.map((r) => keys.map((k) => JSON.stringify(r[k] ?? "")).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// PNG export helper
async function exportDomToPng(element: HTMLElement, filename = "chart.png") {
  if (!element) return;
  const canvas = await html2canvas(element, { scale: 2 });
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export default function AnalyticsDashboard() {
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectAnalyticsDashboardStats);
  const status = useAppSelector(selectAnalyticsStatus);
  const derivedCourseRevenue = useAppSelector(selectDerivedCourseRevenue);
  const derivedAttendance = useAppSelector(selectDerivedAttendanceReports);

  const [filter, setFilter] = useState<{ type?: string; key?: string } | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Fetch attendance analytics - you'll need to get these from your auth state or context
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const authToken = ''; // Get this from your auth state/context
  
  const { 
    data: attendanceAnalytics, 
    loading: attendanceLoading, 
    error: attendanceError,
    refetch: refetchAttendance 
  } = useAttendanceAnalytics(baseUrl, authToken);

  // Integrate attendance data with existing stats
  const enhancedStats = useMemo(() => {
    if (!attendanceAnalytics) return stats;
    return integrateAttendanceIntoAnalytics(stats, attendanceAnalytics);
  }, [stats, attendanceAnalytics]);

  useEffect(() => {
    if (status === "idle" || status === "failed") {
      dispatch(fetchAnalyticsDashboard());
    }
  }, [dispatch, status]);

  // Auto refresh every 60s when enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      dispatch(fetchAnalyticsDashboard());
      refetchAttendance();
    }, 60_000);
    return () => clearInterval(id);
  }, [autoRefresh, dispatch, refetchAttendance]);

  const isLoading = status === "loading" || status === "idle" || attendanceLoading;

  // -----------------
  // Memoized datasets with proper data handling (existing code)
  // -----------------
  const revenueTrends = useMemo(() => ensureArray(enhancedStats?.paymentStats?.revenueTrends), [enhancedStats]);
  const topCourses = useMemo(() => {
    const courses = ensureArray(enhancedStats?.courseStats?.enrolmentsByCourse);
    return courses
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .slice(0, 5)
      .map(course => ({
        ...course,
        name: course.name || course.courseName || 'Unknown Course',
        value: course.value || course.enrolments || 0
      }));
  }, [enhancedStats]);
  
  const studentGrowth = useMemo(() => ensureArray(enhancedStats?.studentStats?.growth), [enhancedStats]);
  const genderData = useMemo(() => ensureArray(enhancedStats?.studentStats?.genderDistribution), [enhancedStats]);
  const ageData = useMemo(() => ensureArray(enhancedStats?.studentStats?.ageDistribution), [enhancedStats]);
  const completionByCourse = useMemo(() => {
    const completion = ensureArray(enhancedStats?.courseStats?.completionRateByCourse);
    return completion
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .slice(0, 5)
      .map(course => ({
        ...course,
        name: course.name || course.courseName || 'Unknown Course',
        value: Math.round(course.value || course.completionRate || 0)
      }));
  }, [enhancedStats]);
  
  const avgGradeByCourse = useMemo(() => {
    const grades = ensureArray(enhancedStats?.courseStats?.averageGradeByCourse);
    return grades
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .slice(0, 5)
      .map(course => ({
        ...course,
        name: course.name || course.courseName || 'Unknown Course',
        value: Math.round(course.value || course.averageGrade || 0)
      }));
  }, [enhancedStats]);
  
  const paymentMethods = useMemo(() => ensureArray(enhancedStats?.paymentStats?.paymentMethodDistribution), [enhancedStats]);
  const paymentStatus = useMemo(() => ensureArray(enhancedStats?.paymentStats?.paymentStatusDistribution), [enhancedStats]);
  
  // Updated attendance data from new API
  const attendanceTrends = useMemo(() => {
    return ensureArray(enhancedStats?.attendanceStats?.rateTrends);
  }, [enhancedStats]);
  
  const attendanceByDay = useMemo(() => {
    return ensureArray(enhancedStats?.attendanceStats?.byDayOfWeek);
  }, [enhancedStats]);
  
  const attendanceStatus = useMemo(() => {
    return ensureArray(enhancedStats?.attendanceStats?.statusDistribution);
  }, [enhancedStats]);

  const attendanceByClass = useMemo(() => {
    const byClass = ensureArray(enhancedStats?.attendanceStats?.byClass);
    return byClass.slice(0, 5); // Top 5 classes
  }, [enhancedStats]);

  // Fixed Revenue by Course data (existing code)
  const revenueByCourseData = useMemo(() => {
    const revenueData = ensureArray(derivedCourseRevenue) || ensureArray(enhancedStats?.paymentStats?.revenueByCourse);
    return revenueData
      .sort((a, b) => (b.totalRevenue || b.value || 0) - (a.totalRevenue || a.value || 0))
      .slice(0, 5)
      .map(course => ({
        courseName: course.courseName || course.name || 'Unknown Course',
        totalRevenue: course.totalRevenue || course.value || 0,
        displayRevenue: (course.totalRevenue || course.value || 0) / 100
      }));
  }, [derivedCourseRevenue, enhancedStats]);

  // Derive quick insights (existing code)
  const revenueInsight = useMemo(() => {
    const last = revenueTrends[revenueTrends.length - 1]?.value ?? 0;
    const prev = revenueTrends[revenueTrends.length - 2]?.value ?? 0;
    if (last === 0 && prev === 0) return null;
    const pct = prev === 0 ? 100 : Math.round(((last - prev) / Math.abs(prev)) * 100);
    return { pct, last, trend: pct >= 0 ? "up" : "down" };
  }, [revenueTrends]);

  const studentInsight = useMemo(() => {
    const last = studentGrowth[studentGrowth.length - 1]?.value ?? 0;
    const prev = studentGrowth[studentGrowth.length - 2]?.value ?? 0;
    if (last === 0 && prev === 0) return null;
    const pct = prev === 0 ? 100 : Math.round(((last - prev) / Math.abs(prev)) * 100);
    return { pct, last, trend: pct >= 0 ? "up" : "down" };
  }, [studentGrowth]);

  // New attendance insight
  const attendanceInsight = useMemo(() => {
    if (!attendanceTrends.length) return null;
    const last = attendanceTrends[attendanceTrends.length - 1]?.value ?? 0;
    const prev = attendanceTrends[attendanceTrends.length - 2]?.value ?? 0;
    if (last === 0 && prev === 0) return null;
    const diff = last - prev;
    return { diff, last, trend: diff >= 0 ? "up" : "down" };
  }, [attendanceTrends]);

  // --- Chart configs ---
  const revenueTrendConfig: ChartConfig = { value: { label: "Revenue", color: "#3B82F6" } };
  const popularCoursesConfig: ChartConfig = { value: { label: "Enrolments", color: "#10B981" } };
  const studentGrowthConfig: ChartConfig = { value: { label: "New Students", color: "#8B5CF6" } };
  const completionRateConfig: ChartConfig = { value: { label: "Completion %", color: "#28A745" } };
  const avgGradeConfig: ChartConfig = { value: { label: "Avg. Grade", color: "#3B82F6" } };
  const revenueByCourseConfig: ChartConfig = { value: { label: "Revenue", color: "#28A745" } };
  const attendanceTrendConfig: ChartConfig = { value: { label: "Attendance Rate", color: "#F59E0B" } };
  const attendanceDayConfig: ChartConfig = { value: { label: "Attendance Rate", color: "#3B82F6" } };
  const attendanceClassConfig: ChartConfig = { attendanceRate: { label: "Attendance Rate", color: "#10B981" } };

  // Drill-down handler
  const handleDrillDown = (payload: { type: string; key?: string }) => {
    setFilter((prev) => (prev?.type === payload.type && prev?.key === payload.key ? null : payload));
  };

  // Chart export helpers
  const exportChartCSV = (rows: any[], filename = "chart.csv") => exportToCSV(filename, rows);
  const exportChartPNG = (domId: string, filename = "chart.png") => {
    const el = document.getElementById(domId);
    if (el) exportDomToPng(el, filename);
  };

  // Variants for framer-motion
  const containerVariant = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-6" ref={rootRef}>
      <PageHeader
        heading="Analytics Dashboard"
        subheading="View key metrics and performance indicators for your academy"
        actions={
          <div className="flex gap-2 items-center">
            <DyraneButton 
              onClick={() => {
                dispatch(fetchAnalyticsDashboard());
                refetchAttendance();
              }} 
              size="sm"
            >
              <RefreshIcon />
              Refresh
            </DyraneButton>
            <DyraneButton variant={autoRefresh ? "default" : "ghost"} size="sm" onClick={() => setAutoRefresh((s) => !s)}>
              {autoRefresh ? "Auto-refresh: ON" : "Auto-refresh: OFF"}
            </DyraneButton>
            <DyraneButton asChild size="sm">
              <Link href="/admin/analytics/reports">View Reports</Link>
            </DyraneButton>
          </div>
        }
      />

      {attendanceError && (
        <Card className="border-destructive">
          <CardContent className="pt-4">
            <div className="text-sm text-destructive">
              <strong>Attendance Data Error:</strong> {attendanceError}
            </div>
          </CardContent>
        </Card>
      )}

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

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.04 } } }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Students */}
              <motion.div variants={containerVariant}>
                <Card>
                  <CardHeader className="flex items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-12 w-32" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          <CountUp end={enhancedStats?.studentStats?.total ?? 0} duration={1.2} separator="," />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          <span className={studentInsight?.trend === "up" ? "text-green-500" : "text-destructive"}>
                            {studentInsight ? `${studentInsight.pct}%` : "—"}
                          </span>{" "}
                          from previous period • {enhancedStats?.studentStats?.newThisMonth ?? 0} new this month
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Total Courses */}
              <motion.div variants={containerVariant}>
                <Card>
                  <CardHeader className="flex items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-12 w-32" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{enhancedStats?.courseStats?.total ?? 0}</div>
                        <p className="text-xs text-muted-foreground">{enhancedStats?.courseStats?.averageCompletion ?? 0}% avg. completion</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Total Revenue */}
              <motion.div variants={containerVariant}>
                <Card>
                  <CardHeader className="flex items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-12 w-32" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{formatCurrency(enhancedStats?.paymentStats?.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">
                          {enhancedStats?.paymentStats?.revenueThisMonth ? (
                            <>
                              +{formatCurrency(enhancedStats.paymentStats.revenueThisMonth)} this month •{" "}
                              <span className={revenueInsight?.trend === "up" ? "text-green-500" : "text-destructive"}>
                                {revenueInsight ? `${revenueInsight.pct}%` : "—"}
                              </span>
                            </>
                          ) : (
                            "—"
                          )}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Avg Attendance - Updated with real data */}
              <motion.div variants={containerVariant}>
                <Card>
                  <CardHeader className="flex items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-12 w-32" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          <CountUp 
                            end={enhancedStats?.attendanceStats?.averageRate ?? 0} 
                            duration={1.2} 
                            suffix="%" 
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {attendanceInsight ? (
                            <>
                              <span className={attendanceInsight.trend === "up" ? "text-green-500" : "text-destructive"}>
                                {attendanceInsight.diff > 0 ? '+' : ''}{attendanceInsight.diff}%
                              </span>{" "}
                              from last month
                            </>
                          ) : (
                            "Overall attendance rate"
                          )}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Revenue Trend + Top Courses Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div variants={containerVariant}>
                <Card id="revenue-trend-card">
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    {isLoading ? (
                      <Skeleton className="h-full w-full" />
                    ) : revenueTrends.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No revenue data yet</div>
                    ) : (
                      <ChartContainer config={revenueTrendConfig}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={revenueTrends}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            onClick={(e) => {
                              if (e && (e as any).activeLabel) handleDrillDown({ type: "revenueDate", key: (e as any).activeLabel });
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 11 }}
                              interval="preserveStartEnd"
                            />
                            <YAxis 
                              tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                              tick={{ fontSize: 11 }}
                            />
                            <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatCurrency(v as number)} />} />
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stroke={revenueTrendConfig.value.color} 
                              fill={revenueTrendConfig.value.color} 
                              fillOpacity={0.12} 
                              name="Revenue" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {revenueInsight ? (
                            <>
                              {revenueInsight.trend === "up" ? "📈" : "📉"} Revenue changed by{" "}
                              <strong className={revenueInsight.trend === "up" ? "text-green-500" : "text-destructive"}>
                                {revenueInsight.pct}%
                              </strong>{" "}
                              compared to previous period.
                            </>
                          ) : (
                            "Revenue stable."
                          )}
                        </p>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={containerVariant}>
                <Card id="top-courses-card">
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle>Top 5 Most Popular Courses</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    {isLoading ? (
                      <Skeleton className="h-full w-full" />
                    ) : topCourses.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No enrolment data</div>
                    ) : (
                      <ChartContainer config={popularCoursesConfig}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={topCourses}
                            layout="vertical"
                            margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                            onClick={(e) => {
                              if (e && (e as any).activePayload && (e as any).activePayload[0]) {
                                const payload = (e as any).activePayload[0].payload;
                                handleDrillDown({ type: "course", key: payload.name });
                              }
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" tick={{ fontSize: 11 }} />
                            <YAxis 
                              dataKey="name" 
                              type="category" 
                              width={120} 
                              tick={{ fontSize: 10 }}
                              tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                            />
                            <ChartTooltip 
                              content={<ChartTooltipContent 
                                labelFormatter={(label) => `Course: ${label}`}
                                formatter={(value, name) => [`${value} enrolments`, name]}
                              />} 
                            />
                            <Bar 
                              dataKey="value" 
                              fill={popularCoursesConfig.value.color} 
                              radius={[0, 4, 4, 0]} 
                              name="Enrolments" 
                            />
                          </BarChart>
                        </ResponsiveContainer>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Click a course bar to filter other charts by that course.
                        </p>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </TabsContent>

        {/* STUDENTS */}
        <TabsContent value="students" className="space-y-6">
          <Card id="student-growth-card">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Student Growth (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : studentGrowth.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No student growth data</div>
              ) : (
                <ChartContainer config={studentGrowthConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={studentGrowth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="value" stroke={studentGrowthConfig.value.color} fill={studentGrowthConfig.value.color} fillOpacity={0.12} name="New Students" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card id="gender-card">
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : genderData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No gender data</div>
                ) : (
                  <ChartContainer config={Object.fromEntries(genderData.map((e, i) => [e.name, { label: e.name, color: PIE_CHART_COLORS[i % PIE_CHART_COLORS.length] }]))}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label onClick={(d) => handleDrillDown({ type: "gender", key: d?.name })}>
                          {genderData.map((entry, i) => (
                            <Cell key={`cell-${entry.name}`} fill={PIE_CHART_COLORS[i % PIE_CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card id="age-card">
              <CardHeader>
                <CardTitle>Age Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : ageData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No age data</div>
                ) : (
                  <ChartContainer config={{ value: { label: "Students", color: "#3B82F6" } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Students" onClick={(d) => handleDrillDown({ type: "ageGroup", key: d?.name })} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* COURSES */}
        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card id="completion-card">
              <CardHeader>
                <CardTitle>Completion Rates by Course (Top 5)</CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : completionByCourse.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No completion data</div>
                ) : (
                  <ChartContainer config={completionRateConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={completionByCourse} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={150} 
                          tick={{ fontSize: 10 }}
                          tickFormatter={(value) => value.length > 18 ? value.substring(0, 18) + '...' : value}
                        />
                        <ChartTooltip content={<ChartTooltipContent formatter={(v) => `${v}%`} />} />
                        <Bar dataKey="value" fill={completionRateConfig.value.color} name="Completion %" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card id="avg-grade-card">
              <CardHeader>
                <CardTitle>Average Grades by Course (Top 5)</CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : avgGradeByCourse.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No grades data</div>
                ) : (
                  <ChartContainer config={avgGradeConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={avgGradeByCourse} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={150} 
                          tick={{ fontSize: 10 }}
                          tickFormatter={(value) => value.length > 18 ? value.substring(0, 18) + '...' : value}
                        />
                        <ChartTooltip content={<ChartTooltipContent formatter={(v) => `${v}%`} />} />
                        <Bar dataKey="value" fill={avgGradeConfig.value.color} name="Avg. Grade" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PAYMENTS */}
        <TabsContent value="payments" className="space-y-6">
          <Card id="revenue-by-course-card">
            <CardHeader>
              <CardTitle>Revenue by Course (Top 5)</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : revenueByCourseData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No revenue by course data</div>
              ) : (
                <ChartContainer config={revenueByCourseConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={revenueByCourseData} 
                      layout="vertical" 
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis 
                        dataKey="courseName" 
                        type="category" 
                        width={150} 
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => value.length > 18 ? value.substring(0, 18) + '...' : value}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent 
                          formatter={(value) => [`₦${(value as number).toLocaleString()}`, "Revenue"]}
                          labelFormatter={(label) => `Course: ${label}`}
                        />} 
                      />
                      <Bar 
                        dataKey="totalRevenue" 
                        fill={revenueByCourseConfig.value.color} 
                        name="Revenue" 
                        radius={[0, 4, 4, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card id="payment-method-card">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : paymentMethods.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No payment method data</div>
                ) : (
                  <ChartContainer config={Object.fromEntries(paymentMethods.map((e, i) => [e.name, { label: e.name, color: PIE_CHART_COLORS[i % PIE_CHART_COLORS.length] }]))}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Pie data={paymentMethods} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {paymentMethods.map((entry, i) => <Cell key={`cell-${entry.name}`} fill={PIE_CHART_COLORS[i % PIE_CHART_COLORS.length]} />)}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card id="payment-status-card">
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : paymentStatus.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No payment status data</div>
                ) : (
                  <ChartContainer config={Object.fromEntries(paymentStatus.map((e, i) => [e.name, { label: e.name, color: PIE_CHART_COLORS[i % PIE_CHART_COLORS.length] }]))}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Pie data={paymentStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {paymentStatus.map((entry, i) => <Cell key={`cell-${entry.name}`} fill={PIE_CHART_COLORS[i % PIE_CHART_COLORS.length]} />)}
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

        {/* ATTENDANCE - Enhanced with real data */}
        <TabsContent value="attendance" className="space-y-6">
          {/* Summary Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                  Present
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {enhancedStats?.attendanceStats?.recentSummary?.present ?? 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                  Late
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {enhancedStats?.attendanceStats?.recentSummary?.late ?? 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Users className="h-4 w-4 mr-2 text-red-500" />
                  Absent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {enhancedStats?.attendanceStats?.recentSummary?.absent ?? 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  Total Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {enhancedStats?.attendanceStats?.totalRecords ?? 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card id="attendance-trend-card">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Attendance Rate Trend (Last 6 Months)</CardTitle>
              <div className="flex gap-2">
                <DyraneButton 
                  size="sm" 
                  variant="outline"
                  onClick={() => exportChartCSV(attendanceTrends, "attendance-trends.csv")}
                >
                  <Download className="h-4 w-4 mr-1" />
                  CSV
                </DyraneButton>
                <DyraneButton 
                  size="sm" 
                  variant="outline"
                  onClick={() => exportChartPNG("attendance-trend-card", "attendance-trends.png")}
                >
                  <Download className="h-4 w-4 mr-1" />
                  PNG
                </DyraneButton>
              </div>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : attendanceTrends.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No attendance trends</div>
              ) : (
                <ChartContainer config={attendanceTrendConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={attendanceTrends} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        tickFormatter={(v) => `${v}%`}
                        tick={{ fontSize: 11 }}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent 
                          formatter={(v) => [`${v}%`, "Attendance Rate"]}
                          labelFormatter={(label) => `Date: ${label}`}
                        />} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={attendanceTrendConfig.value.color} 
                        strokeWidth={3} 
                        name="Attendance Rate"
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {attendanceInsight ? (
                      <>
                        {attendanceInsight.trend === "up" ? "📈" : "📉"} Attendance{" "}
                        <strong className={attendanceInsight.trend === "up" ? "text-green-500" : "text-destructive"}>
                          {attendanceInsight.diff > 0 ? '+' : ''}{attendanceInsight.diff}%
                        </strong>{" "}
                        compared to previous period.
                      </>
                    ) : (
                      "Click on data points to view detailed information."
                    )}
                  </p>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card id="attendance-by-day-card">
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Attendance by Day of Week</CardTitle>
                <DyraneButton 
                  size="sm" 
                  variant="outline"
                  onClick={() => exportChartCSV(attendanceByDay, "attendance-by-day.csv")}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </DyraneButton>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : attendanceByDay.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No attendance by day</div>
                ) : (
                  <ChartContainer config={attendanceDayConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={attendanceByDay}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          tickFormatter={(v) => `${v}%`}
                          tick={{ fontSize: 11 }}
                        />
                        <ChartTooltip 
                          content={<ChartTooltipContent 
                            formatter={(v) => [`${v}%`, "Attendance Rate"]}
                            labelFormatter={(label) => `Day: ${label}`}
                          />} 
                        />
                        <Bar 
                          dataKey="value" 
                          fill={attendanceDayConfig.value.color} 
                          radius={[4, 4, 0, 0]}
                          name="Attendance Rate"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card id="attendance-status-card">
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Attendance Status Distribution</CardTitle>
                <DyraneButton 
                  size="sm" 
                  variant="outline"
                  onClick={() => exportChartCSV(attendanceStatus, "attendance-status.csv")}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </DyraneButton>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : attendanceStatus.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No status data</div>
                ) : (
                  <ChartContainer config={Object.fromEntries(attendanceStatus.map((e, i) => [e.name, { label: e.name, color: PIE_CHART_COLORS[i % PIE_CHART_COLORS.length] }]))}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <ChartTooltip 
                          content={<ChartTooltipContent 
                            formatter={(value, name) => [`${value}`, name]}
                          />} 
                        />
                        <Pie 
                          data={attendanceStatus} 
                          dataKey="value" 
                          nameKey="name" 
                          cx="50%" 
                          cy="50%" 
                          outerRadius={80} 
                          label={({value, percent}) => `${(percent * 100).toFixed(1)}%`}
                        >
                          {attendanceStatus.map((entry, i) => (
                            <Cell 
                              key={`cell-${entry.name}`} 
                              fill={PIE_CHART_COLORS[i % PIE_CHART_COLORS.length]} 
                            />
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

          {/* Attendance by Class */}
          <Card id="attendance-by-class-card">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Attendance Rate by Class (Top 10)</CardTitle>
              <DyraneButton 
                size="sm" 
                variant="outline"
                onClick={() => exportChartCSV(attendanceByClass, "attendance-by-class.csv")}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </DyraneButton>
            </CardHeader>
            <CardContent className="h-96">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : attendanceByClass.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No class attendance data</div>
              ) : (
                <ChartContainer config={attendanceClassConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={attendanceByClass} 
                      layout="vertical" 
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        domain={[0, 100]} 
                        tickFormatter={(v) => `${v}%`}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis 
                        dataKey="className" 
                        type="category" 
                        width={150} 
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => value.length > 18 ? value.substring(0, 18) + '...' : value}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent 
                          formatter={(value) => [`${value}%`, "Attendance Rate"]}
                          labelFormatter={(label) => `Class: ${label}`}
                        />} 
                      />
                      <Bar 
                        dataKey="attendanceRate" 
                        fill={attendanceClassConfig.attendanceRate.color} 
                        name="Attendance Rate" 
                        radius={[0, 4, 4, 0]}
                        onClick={(data) => handleDrillDown({ type: "class", key: data?.classId })}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Click on a class bar to filter other analytics by that class.
                  </p>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Student Attendance Patterns */}
          {attendanceAnalytics?.studentPatterns && (
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Students by Attendance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attendanceAnalytics.studentPatterns.slice(0, 10).map((student, index) => (
                    <div key={student.studentId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{student.studentName}</p>
                          <p className="text-sm text-muted-foreground">{student.studentEmail}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{student.attendanceRate}%</p>
                        <p className="text-xs text-muted-foreground">
                          {student.presentSessions}/{student.totalSessions} sessions
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Small inline icon shim for refresh
function RefreshIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-4.6-7.6" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 3v6h-6" />
    </svg>
  );
}