"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { PageHeader } from "@/components/layout/auth/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { Download, Filter, Search } from "lucide-react";
import { fetchStudentBiodataReports } from "@/features/analytics/store/report-thunks";
import { selectStudentBiodataReports } from "@/features/analytics/store/reports-slice";
import { exportStudentBiodataReports } from "@/features/analytics/utils/export-utils";
import type { StudentBiodataFilter } from "@/features/analytics/types/analytics-types";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentBiodataReportsPage() {
  const dispatch = useAppDispatch();
  const studentBiodataReports = useAppSelector(selectStudentBiodataReports);

  const [filter, setFilter] = useState<StudentBiodataFilter>({
    startDate: undefined,
    endDate: undefined,
    gender: undefined,
    ageRange: undefined,
    accountType: undefined,
    corporateId: undefined,
    location: undefined,
    completionRateMin: undefined,
    completionRateMax: undefined,
  });

  useEffect(() => {
    // Load initial data
    dispatch(fetchStudentBiodataReports(filter));
  }, [dispatch]);

  const handleFilterChange = (key: keyof StudentBiodataFilter, value: any) => {
    // Convert "all" value to undefined for filter
    const filterValue = value === "all" ? undefined : value;
    setFilter({ ...filter, [key]: filterValue });
  };

  const applyFilter = () => {
    dispatch(fetchStudentBiodataReports(filter));
  };

  const exportReport = () => {
    exportStudentBiodataReports(studentBiodataReports.data);
  };

  const isLoading = studentBiodataReports.status === "loading";

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Student Biodata Reports"
        subheading="Analyze student demographics and enrolment patterns"
        actions={
          <Button onClick={exportReport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      {/* Filter Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={filter.gender}
                onValueChange={(value) => handleFilterChange("gender", value)}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="All Genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ageRange">Age Range</Label>
              <Select
                value={filter.ageRange}
                onValueChange={(value) => handleFilterChange("ageRange", value)}
              >
                <SelectTrigger id="ageRange">
                  <SelectValue placeholder="All Ages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="under18">Under 18</SelectItem>
                  <SelectItem value="18-24">18-24</SelectItem>
                  <SelectItem value="25-34">25-34</SelectItem>
                  <SelectItem value="35-44">35-44</SelectItem>
                  <SelectItem value="45plus">45+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type</Label>
              <Select
                value={filter.accountType}
                onValueChange={(value) => handleFilterChange("accountType", value)}
              >
                <SelectTrigger id="accountType">
                  <SelectValue placeholder="All Account Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Account Types</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={filter.location}
                onValueChange={(value) => handleFilterChange("location", value)}
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Lagos">Lagos</SelectItem>
                  <SelectItem value="Abuja">Abuja</SelectItem>
                  <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
                  <SelectItem value="Ibadan">Ibadan</SelectItem>
                  <SelectItem value="Kano">Kano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Enrolment Start Date</Label>
              <DatePicker
                id="startDate"
                value={filter.startDate ? new Date(filter.startDate) : undefined}
                onChange={(date) => handleFilterChange("startDate", date?.toISOString())}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Enrolment End Date</Label>
              <DatePicker
                id="endDate"
                value={filter.endDate ? new Date(filter.endDate) : undefined}
                onChange={(date) => handleFilterChange("endDate", date?.toISOString())}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={applyFilter}>Apply Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Biodata Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : studentBiodataReports.data.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No student biodata reports found. Try adjusting your filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Account Type</TableHead>
                  <TableHead>Enrolment Date</TableHead>
                  <TableHead>Completion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentBiodataReports.data.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.gender || "Not Specified"}</TableCell>
                    <TableCell>{student.age || "N/A"}</TableCell>
                    <TableCell>{student.location || "N/A"}</TableCell>
                    <TableCell>
                      {student.accountType === "corporate" ? (
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {student.corporateName || "Corporate"}
                        </span>
                      ) : (
                        "Individual"
                      )}
                    </TableCell>
                    <TableCell>{new Date(student.enrolmentDate).toLocaleDateString()}</TableCell>
                    <TableCell>{student.completionRate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
