"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { Download, Filter, Search } from "lucide-react";
import { 
  fetchStudentReports, 
  fetchCourseReports, 
  fetchPaymentReports, 
  fetchAttendanceReports 
} from "@/features/analytics/store/report-thunks";
import { 
  selectStudentReports, 
  selectCourseReports, 
  selectPaymentReports, 
  selectAttendanceReports 
} from "@/features/analytics/store/reports-slice";
import { 
  exportStudentReports, 
  exportCourseReports, 
  exportPaymentReports, 
  exportAttendanceReports 
} from "@/features/analytics/utils/export-utils";
import type { ReportFilter } from "@/features/analytics/types/analytics-types";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsPage() {
  const dispatch = useAppDispatch();
  const studentReports = useAppSelector(selectStudentReports);
  const courseReports = useAppSelector(selectCourseReports);
  const paymentReports = useAppSelector(selectPaymentReports);
  const attendanceReports = useAppSelector(selectAttendanceReports);

  const [activeTab, setActiveTab] = useState("students");
  const [filter, setFilter] = useState<ReportFilter>({
    startDate: undefined,
    endDate: undefined,
    courseId: undefined,
    status: undefined,
    searchTerm: undefined,
    page: 1,
    limit: 10,
  });

  const handleFilterChange = (key: keyof ReportFilter, value: string | undefined) => {
    setFilter({ ...filter, [key]: value });
  };

  const applyFilter = () => {
    switch (activeTab) {
      case "students":
        dispatch(fetchStudentReports(filter));
        break;
      case "courses":
        dispatch(fetchCourseReports(filter));
        break;
      case "payments":
        dispatch(fetchPaymentReports(filter));
        break;
      case "attendance":
        dispatch(fetchAttendanceReports(filter));
        break;
    }
  };

  const exportReport = () => {
    switch (activeTab) {
      case "students":
        exportStudentReports(studentReports.data);
        break;
      case "courses":
        exportCourseReports(courseReports.data);
        break;
      case "payments":
        exportPaymentReports(paymentReports.data);
        break;
      case "attendance":
        exportAttendanceReports(attendanceReports.data);
        break;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and export detailed reports"
        actions={
          <Button onClick={exportReport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ScrollArea className="w-full whitespace-nowrap pb-0">
          <TabsList className="mb-4 overflow-x-auto">
            <TabsTrigger value="students">Student Reports</TabsTrigger>
            <TabsTrigger value="courses">Course Reports</TabsTrigger>
            <TabsTrigger value="payments">Payment Reports</TabsTrigger>
            <TabsTrigger value="attendance">Attendance Reports</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Filter Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <DatePicker
                  id="startDate"
                  value={filter.startDate ? new Date(filter.startDate) : undefined}
                  onChange={(date) => handleFilterChange("startDate", date?.toISOString() || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <DatePicker
                  id="endDate"
                  value={filter.endDate ? new Date(filter.endDate) : undefined}
                  onChange={(date) => handleFilterChange("endDate", date?.toISOString() || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="courseId">Course</Label>
                <Select
                  value={filter.courseId}
                  onValueChange={(value) => handleFilterChange("courseId", value)}
                >
                  <SelectTrigger id="courseId">
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Courses</SelectItem>
                    <SelectItem value="course1">Web Development</SelectItem>
                    <SelectItem value="course2">Data Science</SelectItem>
                    <SelectItem value="course3">UX Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filter.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={applyFilter}>Apply Filters</Button>
            </div>
          </CardContent>
        </Card>

        {/* Student Reports Tab */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Student Performance Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {studentReports.status === "loading" ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : studentReports.data.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No student reports found. Try adjusting your filters.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Enrollment Date</TableHead>
                      <TableHead>Courses Enrolled</TableHead>
                      <TableHead>Courses Completed</TableHead>
                      <TableHead>Average Grade</TableHead>
                      <TableHead>Attendance Rate</TableHead>
                      <TableHead>Total Payments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentReports.data.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{new Date(student.enrollmentDate).toLocaleDateString()}</TableCell>
                        <TableCell>{student.coursesEnrolled}</TableCell>
                        <TableCell>{student.coursesCompleted}</TableCell>
                        <TableCell>{student.averageGrade}%</TableCell>
                        <TableCell>{student.attendanceRate}%</TableCell>
                        <TableCell>₦{student.totalPayments.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Course Reports Tab */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Course Performance Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {courseReports.status === "loading" ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : courseReports.data.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No course reports found. Try adjusting your filters.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Enrollments</TableHead>
                      <TableHead>Completion Rate</TableHead>
                      <TableHead>Average Grade</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseReports.data.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>{course.title}</TableCell>
                        <TableCell>{course.category}</TableCell>
                        <TableCell>{course.enrollmentCount}</TableCell>
                        <TableCell>{course.completionRate}%</TableCell>
                        <TableCell>{course.averageGrade}%</TableCell>
                        <TableCell>₦{(course.revenue / 100).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Reports Tab */}
        <TabsContent value="payments">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Payment Reports Coming Soon</h3>
            <p className="text-muted-foreground">Detailed payment reports will be available in the next update.</p>
          </div>
        </TabsContent>

        {/* Attendance Reports Tab */}
        <TabsContent value="attendance">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Attendance Reports Coming Soon</h3>
            <p className="text-muted-foreground">Detailed attendance reports will be available in the next update.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
