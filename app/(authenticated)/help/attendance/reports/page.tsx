'use client'

import React from 'react';
import Link from 'next/link';
import { 
  BarChart, 
  FileText, 
  Download, 
  Filter, 
  Calendar, 
  Users, 
  PieChart, 
  Share2, 
  Printer, 
  ChevronRight 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { 
  ArticleHeader, 
  ArticleFooter, 
  HelpCallout, 
  RelatedTopics, 
  RoleContent,
  StepByStepGuide,
  Step,
  HelpImage,
  TableOfContents
} from '@/components/help';

// Define related topics for this help article
const relatedTopics = [
  { 
    title: 'Marking Attendance', 
    href: '/help/attendance/marking',
    description: 'Learn about different methods for marking attendance'
  },
  { 
    title: 'Using the Barcode Scanner', 
    href: '/help/attendance/scanning',
    description: 'Learn how to use the barcode scanner for quick attendance tracking'
  },
  { 
    title: 'Tracking Your Progress', 
    href: '/help/courses/progress',
    description: 'Understand how to monitor your learning journey'
  },
];

export default function AttendanceReportsHelpPage() {
  return (
    <article className="mx-auto space-y-6">
      <ArticleHeader
        title="Attendance Reports"
        icon={BarChart}
        description="Generate, analyze, and share attendance data to monitor student participation and engagement."
        breadcrumbs={[
          { label: 'Help Center', href: '/help' },
          { label: 'Attendance', href: '/help/attendance' },
          { label: 'Attendance Reports' },
        ]}
      />

      {/* Table of Contents */}
      <TableOfContents />

      {/* Introduction */}
      <p className="text-lg">
        Attendance reports provide valuable insights into student participation patterns and help identify
        potential issues early. The platform offers comprehensive reporting tools to analyze attendance
        data from various perspectives.
      </p>

      <HelpCallout type="note" title="Data Privacy">
        Attendance reports contain sensitive student information. Always follow your institution's
        data privacy policies when generating, sharing, or storing these reports.
      </HelpCallout>

      {/* Accessing Attendance Reports */}
      <h2 id="accessing-reports" className="text-2xl font-bold mt-8">Accessing Attendance Reports</h2>
      <Separator className="my-2" />
      <p>
        Attendance reports can be accessed through the Attendance section of the platform.
      </p>

      <StepByStepGuide title="Accessing Attendance Reports" description="Follow these steps to access attendance reports:">
        <Step number={1} title="Navigate to Attendance">
          From the main sidebar, click on "Attendance" to access the attendance management section.
        </Step>
        <Step number={2} title="Select Reports">
          Click on the "Reports" tab in the attendance section.
        </Step>
        <Step number={3} title="Choose Report Type">
          Select the type of report you want to generate from the available options.
        </Step>
      </StepByStepGuide>

      {/* Types of Reports */}
      <h2 id="report-types" className="text-2xl font-bold mt-8">Types of Reports</h2>
      <Separator className="my-2" />
      <p>
        The platform offers several types of attendance reports to meet different needs.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Student Reports</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Individual student attendance records across all courses or for a specific course.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Class Reports</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Attendance records for all students in a specific class or course.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Summary Reports</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Statistical summaries of attendance patterns across courses, departments, or the institution.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Trend Analysis</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Visual representations of attendance trends over time to identify patterns.
          </p>
        </div>
      </div>

      {/* Generating Reports */}
      <h2 id="generating-reports" className="text-2xl font-bold mt-8">Generating Reports</h2>
      <Separator className="my-2" />
      <p>
        You can customize reports to focus on specific data points and time periods.
      </p>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          Report Filters
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <strong>Date Range</strong>
              <p className="text-sm text-muted-foreground">Select a specific time period for the report (e.g., week, month, semester).</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>Course/Class Selection</strong>
              <p className="text-sm text-muted-foreground">Filter by specific courses, classes, or departments.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>Attendance Status</strong>
              <p className="text-sm text-muted-foreground">Focus on specific attendance statuses (e.g., absences, late arrivals).</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>Student Groups</strong>
              <p className="text-sm text-muted-foreground">Filter by student cohorts, groups, or individual students.</p>
            </div>
          </li>
        </ul>
      </div>

      <StepByStepGuide title="Generating a Custom Report" description="Follow these steps to create a customized attendance report:">
        <Step number={1} title="Select Report Type">
          Choose the type of report you want to generate (student, class, summary, etc.).
        </Step>
        <Step number={2} title="Set Filters">
          Use the filter options to narrow down the data according to your needs.
        </Step>
        <Step number={3} title="Choose Display Options">
          Select how you want the data to be displayed (table, chart, or both).
        </Step>
        <Step number={4} title="Generate Report">
          Click the "Generate Report" button to create the report based on your specifications.
        </Step>
      </StepByStepGuide>

      {/* Exporting and Sharing Reports */}
      <h2 id="exporting-reports" className="text-2xl font-bold mt-8">Exporting and Sharing Reports</h2>
      <Separator className="my-2" />
      <p>
        Once generated, reports can be exported in various formats or shared with others.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Download className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Export Formats</h4>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>PDF - For formal documentation</li>
            <li>Excel/CSV - For further data analysis</li>
            <li>HTML - For web viewing</li>
            <li>JSON - For system integration</li>
          </ul>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Sharing Options</h4>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>Email - Send reports directly</li>
            <li>Link Sharing - Generate shareable links</li>
            <li>Print - Physical copies</li>
            <li>Schedule - Automated report delivery</li>
          </ul>
        </div>
      </div>

      <HelpCallout type="tip" title="Report Scheduling">
        For recurring reports, use the scheduling feature to automatically generate and send reports
        at regular intervals (weekly, monthly, etc.) to designated recipients.
      </HelpCallout>

      {/* Analyzing Report Data */}
      <h2 id="analyzing-data" className="text-2xl font-bold mt-8">Analyzing Report Data</h2>
      <Separator className="my-2" />
      <p>
        Effective analysis of attendance data can provide valuable insights for improving student engagement.
      </p>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4">Key Metrics to Monitor</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <strong>Overall Attendance Rate</strong>
              <p className="text-sm text-muted-foreground">The percentage of classes attended by students.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>Absence Patterns</strong>
              <p className="text-sm text-muted-foreground">Recurring patterns in absences (e.g., specific days or times).</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>At-Risk Students</strong>
              <p className="text-sm text-muted-foreground">Students with attendance rates below a certain threshold.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>Correlation with Performance</strong>
              <p className="text-sm text-muted-foreground">Relationship between attendance and academic performance.</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Role-specific content */}
      <RoleContent
        studentContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Students</h3>
            <p>
              As a student, attendance reports can help you monitor your participation:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Regularly check your personal attendance report to track your participation</li>
              <li>Identify patterns in your absences that might affect your learning</li>
              <li>Use attendance data to set personal improvement goals</li>
              <li>Contact your instructor if you notice discrepancies in your attendance record</li>
            </ul>
          </div>
        }
        teacherContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Teachers</h3>
            <p>
              As a teacher, attendance reports provide valuable insights for classroom management:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Generate weekly class reports to monitor overall attendance trends</li>
              <li>Identify students with concerning attendance patterns for early intervention</li>
              <li>Use attendance data to evaluate the effectiveness of teaching methods or class timing</li>
              <li>Include attendance summaries in course evaluations and department reports</li>
            </ul>
          </div>
        }
        adminContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Administrators</h3>
            <p>
              As an administrator, institution-wide attendance data supports strategic decision-making:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Monitor attendance across departments to identify institutional trends</li>
              <li>Set up automated alerts for courses with below-average attendance rates</li>
              <li>Use attendance data to inform resource allocation and scheduling decisions</li>
              <li>Generate compliance reports for accreditation and regulatory requirements</li>
            </ul>
          </div>
        }
      />

      {/* Related Topics */}
      <RelatedTopics topics={relatedTopics} />

      {/* Article Footer with feedback */}
      <ArticleFooter 
        previousArticle={{
          title: "Using the Barcode Scanner",
          href: "/help/attendance/scanning"
        }}
        nextArticle={{
          title: "Viewing Your Schedule",
          href: "/help/timetable/viewing"
        }}
      />
    </article>
  );
}
