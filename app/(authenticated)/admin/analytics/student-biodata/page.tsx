"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchStudentBiodataStats, selectStudentBiodataStats, selectStudentBiodataStatus } from "@/features/analytics/store/student-biodata-slice";
import { PageHeader } from "@/components/layout/auth/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, LineChart, PieChart, AreaChart, Bar, Line, Pie, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Users, BookOpen, Building, MapPin, TrendingUp, BarChart3 } from "lucide-react";
import Link from "next/link";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentBiodataDashboard() {
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectStudentBiodataStats);
  const status = useAppSelector(selectStudentBiodataStatus);

  useEffect(() => {
    dispatch(fetchStudentBiodataStats());
  }, [dispatch]);

  const isLoading = status === "loading";

  // Transform data for charts
  const genderData = [
    { name: "Male", value: stats.genderDistribution.male },
    { name: "Female", value: stats.genderDistribution.female },
    { name: "Other", value: stats.genderDistribution.other },
    { name: "Not Specified", value: stats.genderDistribution.notSpecified },
  ];

  const ageData = [
    { name: "Under 18", value: stats.ageDistribution.under18 },
    { name: "18-24", value: stats.ageDistribution.age18to24 },
    { name: "25-34", value: stats.ageDistribution.age25to34 },
    { name: "35-44", value: stats.ageDistribution.age35to44 },
    { name: "45+", value: stats.ageDistribution.age45Plus },
  ];

  const accountTypeData = [
    { name: "Corporate", value: stats.corporateVsIndividual.corporate },
    { name: "Individual", value: stats.corporateVsIndividual.individual },
  ];

  // Transform location data
  const locationData = Object.entries(stats.locationDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 locations

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Student Demographics"
        subheading="Analyze student demographics and enrolment patterns"
        actions={
          <div className="flex gap-2">
            <DyraneButton asChild>
              <Link href="/admin/analytics/reports/student-biodata">View Detailed Reports</Link>
            </DyraneButton>
          </div>
        }
      />

      <Tabs defaultValue="overview">
        <ScrollArea className="w-full whitespace-nowrap pb-0">
          <TabsList className="mb-4 overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="enrolment">Enrolment Trends</TabsTrigger>
            <TabsTrigger value="completion">Completion Analysis</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Gender Distribution Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Gender Distribution</CardTitle>
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
                    <div className="text-2xl font-bold">{stats.genderDistribution.male + stats.genderDistribution.female}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((stats.genderDistribution.male / (stats.genderDistribution.male + stats.genderDistribution.female)) * 100)}% Male / {Math.round((stats.genderDistribution.female / (stats.genderDistribution.male + stats.genderDistribution.female)) * 100)}% Female
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Age Distribution Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Age Groups</CardTitle>
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
                    <div className="text-2xl font-bold">5 Groups</div>
                    <div className="text-xs text-muted-foreground">
                      Largest: {ageData.sort((a, b) => b.value - a.value)[0]?.name}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Account Type Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Account Types</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <Skeleton className="h-7 w-24 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.corporateVsIndividual.corporate} Corporate</div>
                    <div className="text-xs text-muted-foreground">
                      {stats.corporateVsIndividual.individual} Individual Students
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Top Location</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <Skeleton className="h-7 w-24 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{locationData[0]?.name || "N/A"}</div>
                    <div className="text-xs text-muted-foreground">
                      {locationData[0]?.value || 0} Students
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gender Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent className="min-h-80 h-auto">
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
                      notSpecified: {
                        label: "Not Specified",
                        theme: {
                          light: "#6B7280",
                          dark: "#6B7280",
                        },
                      },
                    }}
                  >
                    <PieChart>
                      <Pie
                        data={genderData}
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

            {/* Account Type Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Account Type Distribution</CardTitle>
              </CardHeader>
              <CardContent className="min-h-80 h-auto">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <ChartContainer
                    config={{
                      corporate: {
                        label: "Corporate",
                        theme: {
                          light: "#8B5CF6",
                          dark: "#8B5CF6",
                        },
                      },
                      individual: {
                        label: "Individual",
                        theme: {
                          light: "#F59E0B",
                          dark: "#F59E0B",
                        },
                      },
                    }}
                  >
                    <PieChart>
                      <Pie
                        data={accountTypeData}
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
          </div>
        </TabsContent>

        {/* Additional tabs content */}
        <TabsContent value="demographics">
          <div className="space-y-6">
            {/* Age Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Age Distribution</CardTitle>
              </CardHeader>
              <CardContent className="min-h-80 h-auto">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <ChartContainer
                    config={{
                      under18: {
                        label: "Under 18",
                        theme: {
                          light: "#60A5FA",
                          dark: "#60A5FA",
                        },
                      },
                      age18to24: {
                        label: "18-24",
                        theme: {
                          light: "#34D399",
                          dark: "#34D399",
                        },
                      },
                      age25to34: {
                        label: "25-34",
                        theme: {
                          light: "#F59E0B",
                          dark: "#F59E0B",
                        },
                      },
                      age35to44: {
                        label: "35-44",
                        theme: {
                          light: "#EC4899",
                          dark: "#EC4899",
                        },
                      },
                      age45Plus: {
                        label: "45+",
                        theme: {
                          light: "#8B5CF6",
                          dark: "#8B5CF6",
                        },
                      },
                    }}
                  >
                    <PieChart>
                      <Pie
                        data={ageData}
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

            {/* Location Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Location Distribution</CardTitle>
              </CardHeader>
              <CardContent className="min-h-80 h-auto">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <ChartContainer
                    config={{
                      location: {
                        label: "Students",
                        theme: {
                          light: "#28A745",
                          dark: "#28A745",
                        },
                      },
                    }}
                  >
                    <BarChart
                      data={locationData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={60}
                        tick={{ fontSize: 12 }}
                      />
                      <ChartTooltip
                        content={({ active, payload }) => (
                          <ChartTooltipContent
                            active={active}
                            payload={payload}
                          />
                        )}
                      />
                      <Bar
                        dataKey="value"
                        name="Students"
                        fill="var(--color-location)"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="enrolment">
          <div className="space-y-6">
            {/* Enrolment Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Enrolment Trends</CardTitle>
              </CardHeader>
              <CardContent className="min-h-80 h-auto">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <ChartContainer
                    config={{
                      enrollments: {
                        label: "New Enrollments",
                        theme: {
                          light: "#28A745",
                          dark: "#28A745",
                        },
                      },
                    }}
                  >
                    <LineChart
                      data={stats.enrollmentTrends || [
                        { month: "Jan", enrollments: 45 },
                        { month: "Feb", enrollments: 52 },
                        { month: "Mar", enrollments: 48 },
                        { month: "Apr", enrollments: 60 },
                        { month: "May", enrollments: 75 },
                        { month: "Jun", enrollments: 82 }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
                      <Line
                        type="monotone"
                        dataKey="enrollments"
                        stroke="var(--color-enrollments)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Enrolment by Course Category */}
            <Card>
              <CardHeader>
                <CardTitle>Enrolment by Course Category</CardTitle>
              </CardHeader>
              <CardContent className="min-h-80 h-auto">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <ChartContainer
                    config={{
                      programming: {
                        label: "Programming",
                        theme: {
                          light: "#3B82F6",
                          dark: "#3B82F6",
                        },
                      },
                      design: {
                        label: "Design",
                        theme: {
                          light: "#EC4899",
                          dark: "#EC4899",
                        },
                      },
                      business: {
                        label: "Business",
                        theme: {
                          light: "#F59E0B",
                          dark: "#F59E0B",
                        },
                      },
                      dataScience: {
                        label: "Data Science",
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
                    <BarChart
                      data={[
                        { category: "Programming", enrollments: 120 },
                        { category: "Design", enrollments: 80 },
                        { category: "Business", enrollments: 60 },
                        { category: "Data Science", enrollments: 40 },
                        { category: "Other", enrollments: 20 }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
                        name="Enrollments"
                        fill="var(--color-programming)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="completion">
          <div className="space-y-6">
            {/* Course Completion Rates */}
            <Card>
              <CardHeader>
                <CardTitle>Course Completion Rates</CardTitle>
              </CardHeader>
              <CardContent className="min-h-80 h-auto">
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
                      data={stats.completionRates || [
                        { courseId: "course1", courseTitle: "Web Development", completionRate: 78 },
                        { courseId: "course2", courseTitle: "UX Design", completionRate: 82 },
                        { courseId: "course3", courseTitle: "Data Science", completionRate: 65 },
                        { courseId: "course4", courseTitle: "Mobile Development", completionRate: 70 },
                        { courseId: "course5", courseTitle: "DevOps", completionRate: 85 }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="courseTitle"
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

            {/* Completion Rate Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Completion Rate Distribution</CardTitle>
              </CardHeader>
              <CardContent className="min-h-80 h-auto">
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
                        { range: "0-20%", count: 15 },
                        { range: "21-40%", count: 25 },
                        { range: "41-60%", count: 45 },
                        { range: "61-80%", count: 85 },
                        { range: "81-100%", count: 65 }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
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

            {/* Completion Time Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Average Completion Time (Days)</CardTitle>
              </CardHeader>
              <CardContent className="min-h-80 h-auto">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <ChartContainer
                    config={{
                      days: {
                        label: "Days",
                        theme: {
                          light: "#28A745",
                          dark: "#28A745",
                        },
                      },
                    }}
                  >
                    <BarChart
                      data={[
                        { courseTitle: "Web Development", days: 45 },
                        { courseTitle: "UX Design", days: 38 },
                        { courseTitle: "Data Science", days: 60 },
                        { courseTitle: "Mobile Development", days: 42 },
                        { courseTitle: "DevOps", days: 35 }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="courseTitle"
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
                            formatter={(value) => `${value} days`}
                          />
                        )}
                      />
                      <Bar
                        dataKey="days"
                        name="Days"
                        fill="var(--color-days)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
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
