'use client'

import React from 'react';
import Link from 'next/link';
import { ScanBarcode, User, CreditCard, BookOpen, CheckCircle, XCircle, AlertCircle, Clock, Camera, Smartphone, Monitor } from 'lucide-react';
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

// Define related topics
const relatedTopics = [
  {
    title: 'Using the Barcode Scanner',
    href: '/help/attendance/scanning',
    description: 'Learn about general barcode scanning for attendance'
  },
  {
    title: 'Payment Methods',
    href: '/help/payments/methods',
    description: 'Understanding payment options and status'
  },
  {
    title: 'Course Enrolment',
    href: '/help/courses/enrolment',
    description: 'How students enrol in courses'
  },
];

// Table of contents
const tableOfContents = [
  { id: 'overview', title: 'Overview' },
  { id: 'getting-started', title: 'Getting Started' },
  { id: 'scanning-process', title: 'Scanning Process' },
  { id: 'student-information', title: 'Student Information Display' },
  { id: 'payment-status', title: 'Payment Status Indicators' },
  { id: 'troubleshooting', title: 'Troubleshooting' },
  { id: 'best-practices', title: 'Best Practices' },
];

export default function CustomerCareScanningPage() {
  return (
    <article className="prose prose-slate dark:prose-invert mx-auto">
      <ArticleHeader
        title="Customer Care Scanning"
        description="Learn how to use the barcode scanning system to instantly access student information, payment status, and course details."
        lastUpdated="January 25, 2025"
        readTime="5 min read"
        category="Attendance"
      />

      <TableOfContents items={tableOfContents} />

      <section id="overview">
        <h2>Overview</h2>
        <p>
          The Customer Care Barcode Scanning System provides instant access to comprehensive student information 
          through barcode scanning. When you scan a student's barcode, the system immediately displays their 
          details, payment status, course information, and contact details.
        </p>

        <HelpCallout type="important">
          This feature is currently available to admin and teacher roles. It will be restricted to customer care 
          staff when the new role system is implemented.
        </HelpCallout>
      </section>

      <Separator className="my-8" />

      <section id="getting-started">
        <h2>Getting Started</h2>
        <p>
          To access the customer care scanning system, navigate to the dedicated scanning page and activate 
          the barcode scanner.
        </p>

        <StepByStepGuide title="Accessing the Scanner" description="Follow these steps to start scanning student barcodes">
          <Step number={1} title="Navigate to Scanner">
            Go to <code>/customer-care/scan</code> or use the navigation menu to access the Customer Care Scanner.
          </Step>
          <Step number={2} title="Start Scanner">
            Click the "Start Scanner" button to activate the camera and barcode detection.
          </Step>
          <Step number={3} title="Position Camera">
            Point your device's camera at the student's barcode. Ensure good lighting and steady positioning.
          </Step>
        </StepByStepGuide>
      </section>

      <Separator className="my-8" />

      <section id="scanning-process">
        <h2>Scanning Process</h2>
        <p>
          The scanning process is designed to be quick and efficient, providing instant results as soon as 
          a barcode is detected.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className="p-4 border rounded-lg">
            <Camera className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-semibold">1. Scan</h3>
            <p className="text-sm text-muted-foreground">Point camera at student barcode</p>
          </div>
          <div className="p-4 border rounded-lg">
            <User className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-semibold">2. Lookup</h3>
            <p className="text-sm text-muted-foreground">System finds student information</p>
          </div>
          <div className="p-4 border rounded-lg">
            <Monitor className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-semibold">3. Display</h3>
            <p className="text-sm text-muted-foreground">Information appears instantly</p>
          </div>
        </div>

        <HelpCallout type="tip">
          The scanner automatically stops after a successful scan. You can start it again to scan another student.
        </HelpCallout>
      </section>

      <Separator className="my-8" />

      <section id="student-information">
        <h2>Student Information Display</h2>
        <p>
          After scanning, the system displays comprehensive student information organized into clear sections:
        </p>

        <div className="space-y-4 my-6">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Basic Information</h3>
            </div>
            <ul className="text-sm space-y-1">
              <li>• Student name and email</li>
              <li>• Student ID and barcode ID</li>
              <li>• Account status (Active/Inactive)</li>
              <li>• Scan timestamp</li>
            </ul>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Payment Information</h3>
            </div>
            <ul className="text-sm space-y-1">
              <li>• Current payment status</li>
              <li>• Amount due (if applicable)</li>
              <li>• Last payment date</li>
              <li>• Next due date</li>
            </ul>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Course Details</h3>
            </div>
            <ul className="text-sm space-y-1">
              <li>• Current course title</li>
              <li>• Instructor name</li>
              <li>• Class schedule</li>
              <li>• Enrolment status</li>
            </ul>
          </div>
        </div>
      </section>

      <Separator className="my-8" />

      <section id="payment-status">
        <h2>Payment Status Indicators</h2>
        <p>
          The system uses color-coded badges to quickly communicate payment status:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-800">Paid</h4>
              <p className="text-sm text-muted-foreground">All payments up to date</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <h4 className="font-semibold text-yellow-800">Pending</h4>
              <p className="text-sm text-muted-foreground">Payment due but not overdue</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <XCircle className="h-5 w-5 text-red-600" />
            <div>
              <h4 className="font-semibold text-red-800">Overdue</h4>
              <p className="text-sm text-muted-foreground">Payment past due date</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div>
              <h4 className="font-semibold text-orange-800">Partial</h4>
              <p className="text-sm text-muted-foreground">Partial payment received</p>
            </div>
          </div>
        </div>
      </section>

      <Separator className="my-8" />

      <section id="troubleshooting">
        <h2>Troubleshooting</h2>
        <p>
          Common issues and their solutions:
        </p>

        <div className="space-y-4 my-6">
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Scanner Not Working</h4>
            <ul className="text-sm space-y-1">
              <li>• Check camera permissions in your browser</li>
              <li>• Ensure adequate lighting</li>
              <li>• Try refreshing the page</li>
              <li>• Use manual barcode entry as fallback</li>
            </ul>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Student Not Found</h4>
            <ul className="text-sm space-y-1">
              <li>• Verify the barcode is clear and readable</li>
              <li>• Check if student exists in the system</li>
              <li>• Try scanning again with better positioning</li>
              <li>• Contact technical support if issue persists</li>
            </ul>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Information Not Loading</h4>
            <ul className="text-sm space-y-1">
              <li>• Check your internet connection</li>
              <li>• Wait a moment for data to load</li>
              <li>• Refresh the page and try again</li>
              <li>• Contact IT support if problem continues</li>
            </ul>
          </div>
        </div>

        <HelpCallout type="note">
          For technical support, contact the IT department or email tech-support@1techacademy.com
        </HelpCallout>
      </section>

      <Separator className="my-8" />

      <section id="best-practices">
        <h2>Best Practices</h2>
        <p>
          Follow these guidelines for efficient and effective use of the scanning system:
        </p>

        <div className="space-y-4 my-6">
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">🎯 Scanning Tips</h4>
            <ul className="text-sm space-y-1">
              <li>• Hold the device steady when scanning</li>
              <li>• Ensure good lighting conditions</li>
              <li>• Position barcode within the camera frame</li>
              <li>• Wait for automatic detection rather than rushing</li>
            </ul>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">📱 Device Recommendations</h4>
            <ul className="text-sm space-y-1">
              <li>• Use tablets or smartphones with good cameras</li>
              <li>• Ensure devices are charged and ready</li>
              <li>• Keep backup devices available during busy periods</li>
              <li>• Use landscape orientation for better scanning</li>
            </ul>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">🔒 Privacy & Security</h4>
            <ul className="text-sm space-y-1">
              <li>• Only access student information when necessary</li>
              <li>• Do not share student details with unauthorized persons</li>
              <li>• Log out when finished using the system</li>
              <li>• Report any suspicious activity immediately</li>
            </ul>
          </div>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Related Topics */}
      <RelatedTopics topics={relatedTopics} />

      {/* Article Footer with feedback */}
      <ArticleFooter />
    </article>
  );
}
