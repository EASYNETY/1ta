"use client";

import React from 'react';
import { CheckCircle, Scan, QrCode, Smartphone, Wifi, AlertTriangle } from 'lucide-react';
import {
  ArticleHeader,
  ArticleFooter,
  HelpImage,
  StepByStepGuide,
  Step,
  HelpCallout,
  RoleContent,
  RelatedTopics,
  TableOfContents
} from '@/components/help';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define related topics
const relatedTopics = [
  {
    title: 'Marking Attendance',
    href: '/help/attendance/marking',
    description: 'Learn about different methods for marking attendance'
  },
  {
    title: 'Attendance Reports',
    href: '/help/attendance/reports',
    description: 'Generate and analyze attendance reports'
  },
  {
    title: 'External Barcode Scanner Integration',
    href: '/help/attendance/external-scanner',
    description: 'Connect and use external barcode scanners'
  },
];

export default function BarcodeScanningScanningPage() {
  return (
    <div className="mx-auto py-6 space-y-6">
      <ArticleHeader
        title="Using the Barcode Scanner"
        icon={Scan}
        description="Learn how to use the built-in barcode scanner for quick and efficient attendance tracking."
        breadcrumbs={[
          { label: 'Help Center', href: '/help' },
          { label: 'Attendance', href: '/help/attendance' },
          { label: 'Using the Barcode Scanner' },
        ]}
      />

      <div className="flex flex-col md:flex-row gap-6">
        <article className="flex-1 space-y-6">
          <p>
            The barcode scanner feature allows for quick and efficient attendance tracking by scanning student ID cards or
            mobile barcodes. This guide will walk you through the process of using the scanner for attendance management.
          </p>

          <HelpImage
            src="/images/help/barcode-scanner.jpg"
            alt="Barcode scanner interface"
            caption="The barcode scanner interface showing camera view and scan history"
          />

          <h2 id="scanner-overview" className="text-2xl font-bold mt-8">Scanner Overview</h2>
          <Separator className="my-2" />
          <p>
            The platform offers two main scanning methods:
          </p>

          <Tabs defaultValue="built-in" className="mt-4">
            <TabsList>
              <TabsTrigger value="built-in" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Built-in Camera
              </TabsTrigger>
              <TabsTrigger value="external" className="flex items-center gap-2">
                <Scan className="h-4 w-4" />
                External Scanner
              </TabsTrigger>
            </TabsList>
            <TabsContent value="built-in" className="p-4 border rounded-md mt-4">
              <p>
                The built-in scanner uses your device's camera to scan barcodes and QR codes. This method is convenient
                as it requires no additional hardware, but may be slower for large groups.
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Works on most modern smartphones, tablets, and laptops with cameras</li>
                <li>Supports both 1D barcodes and 2D QR codes</li>
                <li>Requires good lighting conditions for optimal performance</li>
                <li>Camera permissions must be granted to the application</li>
              </ul>
            </TabsContent>
            <TabsContent value="external" className="p-4 border rounded-md mt-4">
              <p>
                External barcode scanners connect to your device via USB, Bluetooth, or WiFi and offer faster, more
                reliable scanning for large groups.
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Supports most commercial barcode scanners</li>
                <li>Faster scanning speed compared to built-in cameras</li>
                <li>Works in various lighting conditions</li>
                <li>Requires initial setup and pairing with your device</li>
              </ul>
              <HelpCallout type="note" title="Note" className="mt-4">
                For detailed instructions on setting up external scanners, please refer to the
                <a href="/help/attendance/external-scanner" className="text-primary hover:underline ml-1">External Barcode Scanner Integration</a> guide.
              </HelpCallout>
            </TabsContent>
          </Tabs>

          <h2 id="accessing-scanner" className="text-2xl font-bold mt-8">Accessing the Scanner</h2>
          <Separator className="my-2" />
          <p>
            You can access the barcode scanner through multiple paths in the application:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>
              <strong>Main Navigation:</strong> Click on "Attendance" in the sidebar, then select "Scan" from the submenu.
            </li>
            <li>
              <strong>Quick Action:</strong> Use the floating action button (FAB) at the bottom right of the screen and select the scan icon.
            </li>
            <li>
              <strong>PWA Shortcut:</strong> If you've installed the Progressive Web App, use the "Scan Attendance" shortcut from your device's home screen.
            </li>
          </ul>

          <HelpCallout type="tip" title="Quick Tip">
            Pin the scanner page to your favorites for even faster access during regular attendance sessions.
          </HelpCallout>

          <h2 id="scanning-process" className="text-2xl font-bold mt-8">Scanning Process</h2>
          <Separator className="my-2" />

          <StepByStepGuide title="How to Scan Attendance" description="Follow these steps to scan student barcodes for attendance:">
            <Step number={1} title="Select a Class (Optional)">
              Before scanning, you can select a specific class from the dropdown menu. This will filter the scan results
              to show only students enrolled in that class. If you don't select a class, the system will identify the student
              but may not automatically mark attendance.

              <HelpImage
                src="/images/help/class-selection.jpg"
                alt="Class selection dropdown"
                caption="Class selection dropdown on the scanner page"
                className="mt-4"
              />
            </Step>

            <Step number={2} title="Prepare the Scanner">
              Ensure your camera is clean and has a clear view. For external scanners, make sure they are properly connected
              and powered on. The scanner interface will show a camera viewfinder or indicate that an external scanner is active.
            </Step>

            <Step number={3} title="Scan the Barcode">
              Position the barcode or QR code within the scanning area. Hold the device steady until the code is recognized.
              A successful scan is typically indicated by a beep sound and visual confirmation.

              <HelpCallout type="note" title="Note" className="mt-4">
                For best results, ensure adequate lighting and hold the barcode at a distance of 4-8 inches (10-20 cm) from the camera.
              </HelpCallout>
            </Step>

            <Step number={4} title="Verify the Scan">
              After a successful scan, the student's information will appear on screen. Verify that the correct student has been
              identified before proceeding.

              <HelpImage
                src="/images/help/scan-verification.jpg"
                alt="Student information after scanning"
                caption="Student information displayed after a successful scan"
                className="mt-4"
              />
            </Step>

            <Step number={5} title="Mark Attendance (If Required)">
              If you selected a class beforehand, attendance may be marked automatically. Otherwise, you may need to
              manually confirm attendance by clicking the "Mark Present" button.
            </Step>

            <Step number={6} title="Continue Scanning">
              Continue scanning for other students. The system keeps a log of all scans in the current session, which you
              can review at any time.
            </Step>
          </StepByStepGuide>

          <h2 id="troubleshooting" className="text-2xl font-bold mt-8">Troubleshooting Scanner Issues</h2>
          <Separator className="my-2" />

          <p>
            If you encounter issues with the barcode scanner, try these solutions:
          </p>

          <div className="space-y-4 mt-4">
            <div>
              <h3 className="font-medium">Camera Not Working</h3>
              <p className="text-muted-foreground">
                Ensure you've granted camera permissions to the application. On most browsers, you can check this by
                clicking the lock icon in the address bar and reviewing the site permissions.
              </p>
            </div>

            <div>
              <h3 className="font-medium">Barcode Not Scanning</h3>
              <p className="text-muted-foreground">
                Make sure there's adequate lighting and the barcode is not damaged or obscured. Try adjusting the distance
                between the camera and barcode, typically 4-8 inches (10-20 cm) works best.
              </p>
            </div>

            <div>
              <h3 className="font-medium">External Scanner Not Connecting</h3>
              <p className="text-muted-foreground">
                Check that your scanner is properly powered and paired with your device. For USB scanners, try a different
                port. For Bluetooth scanners, ensure Bluetooth is enabled on your device.
              </p>
            </div>

            <div>
              <h3 className="font-medium">Student Not Found</h3>
              <p className="text-muted-foreground">
                If a valid barcode is scanned but the student is not found in the system, verify that the student is
                properly registered and has a valid ID in the system.
              </p>
            </div>
          </div>

          <HelpCallout type="warning" title="Important">
            If you're using an external scanner in a public or shared environment, ensure it's securely stored when not in use
            to prevent unauthorized access to attendance records.
          </HelpCallout>

          <h2 id="best-practices" className="text-2xl font-bold mt-8">Best Practices</h2>
          <Separator className="my-2" />

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>
              <strong>Pre-select the class</strong> before scanning to streamline the attendance marking process.
            </li>
            <li>
              <strong>Position yourself near the entrance</strong> of the classroom to scan students as they arrive.
            </li>
            <li>
              <strong>Use an external scanner</strong> for large classes to speed up the process.
            </li>
            <li>
              <strong>Have a backup method</strong> (like manual attendance) ready in case of technical issues.
            </li>
            <li>
              <strong>Regularly check the scan history</strong> during the session to ensure all students have been recorded.
            </li>
          </ul>

          <RoleContent
            defaultTab="teacher"
            teacherContent={
              <div className="space-y-4">
                <h3 className="text-lg font-medium">For Teachers</h3>
                <p>
                  As a teacher, efficient attendance tracking is crucial for classroom management:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Consider designating a student assistant to help with scanning for large classes</li>
                  <li>Set up the scanner before class begins to avoid taking time away from instruction</li>
                  <li>Use the attendance reports to identify patterns of absence or tardiness</li>
                  <li>For recurring classes, save your scanner settings for quick access in future sessions</li>
                </ul>
                <HelpCallout type="tip">
                  You can export attendance data after each session for your personal records or to share with
                  department administrators.
                </HelpCallout>
              </div>
            }
            adminContent={
              <div className="space-y-4">
                <h3 className="text-lg font-medium">For Administrators</h3>
                <p>
                  As an administrator, you can optimize the scanning system for your institution:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Configure default scanner settings for all teachers</li>
                  <li>Set up dedicated scanning stations at key entry points for high-traffic periods</li>
                  <li>Implement attendance policies that leverage the scanning system's capabilities</li>
                  <li>Monitor system usage and provide additional training where needed</li>
                  <li>Integrate external scanners for more efficient processing</li>
                </ul>
                <HelpCallout type="important">
                  Regularly audit the attendance data to ensure the scanning system is being used effectively
                  and accurately across all departments.
                </HelpCallout>
              </div>
            }
          />
        </article>

        <aside className="w-full md:w-64 space-y-6">
          <TableOfContents />

          <RelatedTopics topics={relatedTopics} />
        </aside>
      </div>

      <ArticleFooter
        previousArticle={{
          title: "Marking Attendance",
          href: "/help/attendance/marking"
        }}
        nextArticle={{
          title: "Attendance Reports",
          href: "/help/attendance/reports"
        }}
        categoryLink={{
          title: "Attendance",
          href: "/help/attendance"
        }}
      />
    </div>
  );
}
