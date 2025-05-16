'use client'

import React from 'react';
import Link from 'next/link';
import { 
  CheckCircle, 
  Calendar, 
  Users, 
  ClipboardCheck, 
  Clock, 
  BarChart, 
  AlertTriangle, 
  Edit, 
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
    title: 'Using the Barcode Scanner', 
    href: '/help/attendance/scanning',
    description: 'Learn how to use the barcode scanner for quick attendance tracking'
  },
  { 
    title: 'Attendance Reports', 
    href: '/help/attendance/reports',
    description: 'Generate and analyze attendance data'
  },
  { 
    title: 'External Barcode Scanner Integration', 
    href: '/help/attendance/external-scanner',
    description: 'Connect and use external barcode scanners'
  },
];

export default function MarkingAttendanceHelpPage() {
  return (
    <article className="mx-auto space-y-6">
      <ArticleHeader
        title="Marking Attendance"
        icon={CheckCircle}
        description="Learn about different methods for tracking and recording student attendance."
        breadcrumbs={[
          { label: 'Help Center', href: '/help' },
          { label: 'Attendance', href: '/help/attendance' },
          { label: 'Marking Attendance' },
        ]}
      />

      {/* Table of Contents */}
      <TableOfContents />

      {/* Introduction */}
      <p className="text-lg">
        Accurate attendance tracking is essential for monitoring student engagement and participation.
        The platform offers multiple methods for marking attendance to accommodate different teaching
        environments and preferences.
      </p>

      <HelpCallout type="important" title="Attendance Policy">
        Always follow your institution's attendance policy when marking and managing attendance records.
        These records may be used for academic and administrative purposes.
      </HelpCallout>

      {/* Attendance Methods */}
      <h2 id="attendance-methods" className="text-2xl font-bold mt-8">Attendance Methods</h2>
      <Separator className="my-2" />
      <p>
        The platform provides several methods for marking attendance, each suited to different scenarios.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Manual Roll Call</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Manually mark students as present, absent, or late using the attendance roster.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Barcode Scanning</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Quickly scan student ID cards or mobile barcodes to mark attendance.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Student Self-Check-in</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Allow students to mark their own attendance using a check-in code.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Edit className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Bulk Editing</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Edit attendance records for multiple students or multiple dates at once.
          </p>
        </div>
      </div>

      {/* Manual Attendance Marking */}
      <h2 id="manual-attendance" className="text-2xl font-bold mt-8">Manual Attendance Marking</h2>
      <Separator className="my-2" />
      <p>
        Manual attendance marking is the traditional method where you mark each student's status individually.
      </p>

      <StepByStepGuide title="Marking Attendance Manually" description="Follow these steps to mark attendance manually:">
        <Step number={1} title="Navigate to Attendance">
          From the main sidebar, click on "Attendance" to access the attendance management section.
        </Step>
        <Step number={2} title="Select a Class">
          Choose the class for which you want to mark attendance from the dropdown menu.
        </Step>
        <Step number={3} title="Select a Date">
          By default, the current date is selected. You can change the date using the calendar picker.
        </Step>
        <Step number={4} title="Mark Attendance">
          For each student in the roster, select their attendance status:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Present:</strong> Student attended the class</li>
            <li><strong>Absent:</strong> Student did not attend the class</li>
            <li><strong>Late:</strong> Student arrived after the designated start time</li>
            <li><strong>Excused:</strong> Student was absent with a valid excuse</li>
          </ul>
        </Step>
        <Step number={5} title="Save the Records">
          Click the "Save" button to record the attendance. A confirmation message will appear when the records are saved successfully.
        </Step>
      </StepByStepGuide>

      <HelpCallout type="tip" title="Keyboard Shortcuts">
        Use keyboard shortcuts to speed up manual attendance marking:
        <ul className="list-disc pl-6 mt-2">
          <li><kbd>P</kbd> - Mark as Present</li>
          <li><kbd>A</kbd> - Mark as Absent</li>
          <li><kbd>L</kbd> - Mark as Late</li>
          <li><kbd>E</kbd> - Mark as Excused</li>
          <li><kbd>Tab</kbd> - Move to the next student</li>
        </ul>
      </HelpCallout>

      {/* Barcode Scanning */}
      <h2 id="barcode-scanning" className="text-2xl font-bold mt-8">Barcode Scanning</h2>
      <Separator className="my-2" />
      <p>
        Barcode scanning offers a quick and efficient way to mark attendance, especially for large classes.
      </p>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Barcode Scanning Process
        </h3>
        <p className="mb-4">
          For detailed instructions on using the barcode scanner, please refer to the 
          <Link href="/help/attendance/scanning" className="text-primary hover:underline mx-1">
            Using the Barcode Scanner
          </Link>
          help article.
        </p>
        <p>
          Key benefits of barcode scanning include:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-2">
          <li>Faster attendance marking for large classes</li>
          <li>Reduced manual entry errors</li>
          <li>Automatic timestamp recording</li>
          <li>Support for both built-in camera and external scanners</li>
        </ul>
      </div>

      {/* Student Self-Check-in */}
      <h2 id="self-checkin" className="text-2xl font-bold mt-8">Student Self-Check-in</h2>
      <Separator className="my-2" />
      <p>
        Student self-check-in allows students to mark their own attendance using a unique code provided by the instructor.
      </p>

      <StepByStepGuide title="Setting Up Student Self-Check-in" description="Follow these steps to enable student self-check-in:">
        <Step number={1} title="Navigate to Attendance">
          From the main sidebar, click on "Attendance" to access the attendance management section.
        </Step>
        <Step number={2} title="Select a Class">
          Choose the class for which you want to enable self-check-in.
        </Step>
        <Step number={3} title="Generate Check-in Code">
          Click on "Generate Check-in Code" to create a unique code for the session.
        </Step>
        <Step number={4} title="Share the Code">
          Share the generated code with your students through the platform or display it in the classroom.
        </Step>
        <Step number={5} title="Monitor Check-ins">
          Watch the real-time check-in status as students mark their attendance.
        </Step>
      </StepByStepGuide>

      <HelpCallout type="warning" title="Preventing Misuse">
        To prevent attendance fraud, consider these precautions:
        <ul className="list-disc pl-6 mt-2">
          <li>Set a short expiration time for check-in codes</li>
          <li>Only share the code when all students are physically present</li>
          <li>Use geolocation restrictions if available</li>
          <li>Randomly verify attendance through other means</li>
        </ul>
      </HelpCallout>

      {/* Attendance Statuses */}
      <h2 id="attendance-statuses" className="text-2xl font-bold mt-8">Attendance Statuses</h2>
      <Separator className="my-2" />
      <p>
        The platform supports multiple attendance statuses to accurately reflect student participation.
      </p>

      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border px-4 py-2 text-left">Status</th>
              <th className="border px-4 py-2 text-left">Description</th>
              <th className="border px-4 py-2 text-left">Impact on Records</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Present</td>
              <td className="border px-4 py-2">Student attended the class</td>
              <td className="border px-4 py-2">Counted as full attendance</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Absent</td>
              <td className="border px-4 py-2">Student did not attend the class</td>
              <td className="border px-4 py-2">Counted as absence</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Late</td>
              <td className="border px-4 py-2">Student arrived after the designated start time</td>
              <td className="border px-4 py-2">Counted as partial attendance</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Excused</td>
              <td className="border px-4 py-2">Student was absent with a valid excuse</td>
              <td className="border px-4 py-2">Not counted against attendance percentage</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Role-specific content */}
      <RoleContent
        studentContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Students</h3>
            <p>
              As a student, it's important to understand how attendance is tracked in your courses:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Always bring your student ID card or have your mobile barcode ready for scanning</li>
              <li>If self-check-in is enabled, make sure to enter the code promptly when provided</li>
              <li>Check your attendance records regularly to ensure accuracy</li>
              <li>If you believe there's an error in your attendance record, contact your instructor promptly</li>
            </ul>
          </div>
        }
        teacherContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Teachers</h3>
            <p>
              As a teacher, efficient attendance tracking is essential for classroom management:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Choose the attendance method that works best for your class size and teaching style</li>
              <li>Consider taking attendance at the beginning of class to minimize disruption</li>
              <li>Regularly review attendance reports to identify patterns and potential issues</li>
              <li>Communicate your attendance policy clearly to students at the beginning of the course</li>
            </ul>
          </div>
        }
        adminContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Administrators</h3>
            <p>
              As an administrator, you can configure attendance settings and monitor institution-wide attendance:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Configure default attendance statuses and their impact on records</li>
              <li>Set up attendance thresholds and automatic notifications for at-risk students</li>
              <li>Generate institution-wide attendance reports for compliance and analysis</li>
              <li>Provide training to faculty on effective attendance tracking methods</li>
            </ul>
          </div>
        }
      />

      {/* Related Topics */}
      <RelatedTopics topics={relatedTopics} />

      {/* Article Footer with feedback */}
      <ArticleFooter 
        previousArticle={{
          title: "Setting Up Your Account",
          href: "/help/getting-started/account-setup"
        }}
        nextArticle={{
          title: "Using the Barcode Scanner",
          href: "/help/attendance/scanning"
        }}
      />
    </article>
  );
}
