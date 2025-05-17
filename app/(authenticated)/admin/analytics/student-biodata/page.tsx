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
        subheading="Analyze student demographics and enrollment patterns"
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
            <TabsTrigger value="enrollment">Enrollment Trends</TabsTrigger>
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
              <CardContent className="h-80">
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
          {/* Demographics-specific analytics */}
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Detailed Demographics Coming Soon</h3>
            <p className="text-muted-foreground">Detailed demographic analytics will be available in the next update.</p>
          </div>
        </TabsContent>

        <TabsContent value="enrollment">
          {/* Enrollment-specific analytics */}
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Enrollment Trends Coming Soon</h3>
            <p className="text-muted-foreground">Detailed enrollment trend analytics will be available in the next update.</p>
          </div>
        </TabsContent>

        <TabsContent value="completion">
          {/* Completion-specific analytics */}
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Completion Analysis Coming Soon</h3>
            <p className="text-muted-foreground">Detailed completion analysis will be available in the next update.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
