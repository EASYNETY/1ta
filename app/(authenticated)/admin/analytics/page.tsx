// app(authenticated)/admin/analytics/page.tsx
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
import { Users, BookOpen, CreditCard, Calendar, Download } from "lucide-react";
import Link from "next/link";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import html2canvas from "html2canvas";

const PIE_CHART_COLORS = ["#3B82F6", "#EC4899", "#10B981", "#F59E0B", "#6B7280", "#EF4444"];

// helper
const ensureArray = (data: any) => (Array.isArray(data) ? data : []);
const formatCurrency = (v?: number) => (v == null ? "₦0" : `₦${v.toLocaleString()}`);


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

  useEffect(() => {
    if (status === "idle" || status === "failed") {
      dispatch(fetchAnalyticsDashboard());
    }
  }, [dispatch, status]);

  // Auto refresh every 60s when enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => dispatch(fetchAnalyticsDashboard()), 60_000);
    return () => clearInterval(id);
  }, [autoRefresh, dispatch]);

  const isLoading = status === "loading" || status === "idle";

  // -----------------
  // Memoized datasets
  // -----------------
  const revenueTrends = useMemo(() => ensureArray(stats?.paymentStats?.revenueTrends), [stats]);
  const topCourses = useMemo(() => ensureArray(stats?.courseStats?.enrolmentsByCourse).slice(0, 5), [stats]);
  const studentGrowth = useMemo(() => ensureArray(stats?.studentStats?.growth), [stats]);
  const genderData = useMemo(() => ensureArray(stats?.studentStats?.genderDistribution), [stats]);
  const ageData = useMemo(() => ensureArray(stats?.studentStats?.ageDistribution), [stats]);
  const completionByCourse = useMemo(() => ensureArray(stats?.courseStats?.completionRateByCourse).slice(0, 5), [stats]);
  const avgGradeByCourse = useMemo(() => ensureArray(stats?.courseStats?.averageGradeByCourse).slice(0, 5), [stats]);
  const paymentMethods = useMemo(() => ensureArray(stats?.paymentStats?.paymentMethodDistribution), [stats]);
  const paymentStatus = useMemo(() => ensureArray(stats?.paymentStats?.paymentStatusDistribution), [stats]);
  const attendanceTrends = useMemo(() => ensureArray(stats?.attendanceStats?.rateTrends), [stats]);
  const attendanceByDay = useMemo(() => ensureArray(stats?.attendanceStats?.byDayOfWeek), [stats]);
  const attendanceStatus = useMemo(() => ensureArray(stats?.attendanceStats?.statusDistribution), [stats]);

  // Derive quick insights (very simple comparisons — replace with server precomputed if available)
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

  // --- Chart configs (kept simple for ChartContainer) ---
  const revenueTrendConfig: ChartConfig = { value: { label: "Revenue", color: "#3B82F6" } };
  const popularCoursesConfig: ChartConfig = { value: { label: "Enrolments", color: "#10B981" } };
  const studentGrowthConfig: ChartConfig = { value: { label: "New Students", color: "#8B5CF6" } };

  // Drill-down handler — updates local state filter and could be used to call the API for filtered data
  const handleDrillDown = (payload: { type: string; key?: string }) => {
    setFilter((prev) => (prev?.type === payload.type && prev?.key === payload.key ? null : payload));
    // Optionally: dispatch fetchAnalyticsDashboard({ filter: payload }) to get server-side filtered data
  };

  // Chart export helpers (scoped per chart area)
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
            <DyraneButton onClick={() => dispatch(fetchAnalyticsDashboard())} size="sm">
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
                          <CountUp end={stats?.studentStats?.total ?? 0} duration={1.2} separator="," />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          <span className={studentInsight?.trend === "up" ? "text-green-500" : "text-destructive"}>
                            {studentInsight ? `${studentInsight.pct}%` : "—"}
                          </span>{" "}
                          from previous period • {stats?.studentStats?.newThisMonth ?? 0} new this month
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
                        <div className="text-2xl font-bold">{stats?.courseStats?.total ?? 0}</div>
                        <p className="text-xs text-muted-foreground">{stats?.courseStats?.averageCompletion ?? 0}% avg. completion</p>
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
                        <div className="text-2xl font-bold">{formatCurrency(stats?.paymentStats?.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">
                          {stats?.paymentStats?.revenueThisMonth ? (
                            <>
                              +{formatCurrency(stats.paymentStats.revenueThisMonth)} this month •{" "}
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

              {/* Avg Attendance */}
              <motion.div variants={containerVariant}>
                <Card>
                  <CardHeader className="flex items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-12 w-32" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{stats?.attendanceStats?.averageRate ?? 0}%</div>
                        <p className="text-xs text-muted-foreground">Overall attendance rate</p>
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
                    {/* <div className="flex gap-2 items-center">
                      <DyraneButton size="sm" onClick={() => exportChartCSV(revenueTrends, "revenue-trends.csv")}>
                        <Download className="h-4 w-4 mr-1" /> CSV
                      </DyraneButton>
                      <DyraneButton size="sm" onClick={() => exportChartPNG("revenue-trend-card", "revenue-trend.png")}>
                        <Download className="h-4 w-4 mr-1" /> PNG
                      </DyraneButton>
                    </div> */}
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
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            onClick={(e) => {
                              if (e && (e as any).activeLabel) handleDrillDown({ type: "revenueDate", key: (e as any).activeLabel });
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis tickFormatter={(value) => `₦${value.toLocaleString()}`} />
                            <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatCurrency(v as number)} />} />
                            <Area type="monotone" dataKey="value" stroke={revenueTrendConfig.value.color} fill={revenueTrendConfig.value.color} fillOpacity={0.12} name="Revenue" />
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
                    {/* <div className="flex gap-2 items-center">
                      <DyraneButton size="sm" onClick={() => exportChartCSV(topCourses, "top-courses.csv")}>
                        <Download className="h-4 w-4 mr-1" /> CSV
                      </DyraneButton>
                      <DyraneButton size="sm" onClick={() => exportChartPNG("top-courses-card", "top-courses.png")}>
                        <Download className="h-4 w-4 mr-1" /> PNG
                      </DyraneButton>
                    </div> */}
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
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="value" fill={popularCoursesConfig.value.color} radius={[0, 4, 4, 0]} name="Enrolments" />
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
              {/* <div className="flex gap-2">
                <DyraneButton size="sm" onClick={() => exportChartCSV(studentGrowth, "student-growth.csv")}>
                  <Download className="h-4 w-4 mr-1" /> CSV
                </DyraneButton>
                <DyraneButton size="sm" onClick={() => exportChartPNG("student-growth-card", "student-growth.png")}>
                  <Download className="h-4 w-4 mr-1" /> PNG
                </DyraneButton>
              </div> */}
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
                      <XAxis dataKey="date" />
                      <YAxis />
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
                        <XAxis dataKey="name" />
                        <YAxis />
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
                  <ChartContainer config={{ value: { label: "Completion %", color: "#10B981" } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={completionByCourse} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent formatter={(v) => `${v}%`} />} />
                        <Bar dataKey="value" fill="#10B981" name="Completion %" radius={[0, 4, 4, 0]} />
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
                  <ChartContainer config={{ value: { label: "Avg. Grade", color: "#3B82F6" } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={avgGradeByCourse} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent formatter={(v) => `${v}%`} />} />
                        <Bar dataKey="value" fill="#3B82F6" name="Avg. Grade" radius={[0, 4, 4, 0]} />
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

        {/* ATTENDANCE */}
        <TabsContent value="attendance" className="space-y-6">
          <Card id="attendance-trend-card">
            <CardHeader>
              <CardTitle>Attendance Rate Trend (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : attendanceTrends.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No attendance trends</div>
              ) : (
                <ChartContainer config={{ value: { label: "Attendance Rate", color: "#F59E0B" } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <ChartTooltip content={<ChartTooltipContent formatter={(v) => `${v}%`} />} />
                      <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} name="Attendance Rate" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card id="attendance-by-day-card">
              <CardHeader>
                <CardTitle>Attendance by Day of Week</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : attendanceByDay.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No attendance by day</div>
                ) : (
                  <ChartContainer config={{ value: { label: "Attendance Rate", color: "#3B82F6" } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      {/* <BarChart data={attendanceByDay} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="courseName" width={150} />
                        <Bar dataKey="totalRevenue" radius={[0, 4, 4, 0]} />
                      </BarChart> */}
                      <BarChart
                        data={attendanceByDay}
                        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                        barCategoryGap="20%"
                        barSize={20}
                        width={700} // increase width or set via container
                        height={300} // increase height to avoid squishing
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          interval={0}            // Show all labels but
                          angle={-45}             // Rotate labels for space
                          textAnchor="end"        // Align rotated text properly
                          height={60}             // Extra height for rotated labels
                        />
                        <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                        <ChartTooltip content={<ChartTooltipContent formatter={(v) => `${v}%`} />} />
                        <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card id="attendance-status-card">
              <CardHeader>
                <CardTitle>Attendance Status Distribution</CardTitle>
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
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Pie data={attendanceStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {attendanceStatus.map((entry, i) => <Cell key={`cell-${entry.name}`} fill={PIE_CHART_COLORS[i % PIE_CHART_COLORS.length]} />)}
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

// small inline icon shim for refresh (so you don't need to import extra libs)
function RefreshIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-4.6-7.6" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 3v6h-6" />
    </svg>
  );
}
