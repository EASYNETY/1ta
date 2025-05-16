'use client'

import React from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Clock, 
  Calendar, 
  MessageSquare, 
  FileText, 
  BellOff, 
  Settings, 
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
    title: 'Account Settings', 
    href: '/help/account/settings',
    description: 'Manage your account preferences and security options'
  },
  { 
    title: 'Updating Your Profile', 
    href: '/help/account/profile',
    description: 'Edit your personal information and profile picture'
  },
  { 
    title: 'Schedule Notifications', 
    href: '/help/timetable/notifications',
    description: 'Learn about timetable-specific notification options'
  },
];

export default function NotificationPreferencesHelpPage() {
  return (
    <article className="mx-auto space-y-6">
      <ArticleHeader
        title="Notification Preferences"
        icon={Bell}
        description="Learn how to customize which notifications you receive and how they're delivered to you."
        breadcrumbs={[
          { label: 'Help Center', href: '/help' },
          { label: 'Account Management', href: '/help/account' },
          { label: 'Notification Preferences' },
        ]}
      />

      {/* Table of Contents */}
      <TableOfContents />

      {/* Introduction */}
      <p className="text-lg">
        Notifications keep you informed about important events, updates, and activities on the platform.
        Customizing your notification preferences ensures you receive the information that matters most
        to you in the way you prefer.
      </p>

      <HelpCallout type="tip" title="Stay Informed">
        While it may be tempting to turn off notifications, keeping certain critical notifications
        enabled helps you stay on top of important deadlines, announcements, and communications.
      </HelpCallout>

      {/* Accessing Notification Settings */}
      <h2 id="accessing-settings" className="text-2xl font-bold mt-8">Accessing Notification Settings</h2>
      <Separator className="my-2" />
      <p>
        You can access your notification preferences through several paths within the platform.
      </p>

      <StepByStepGuide title="Accessing Notification Settings" description="Follow these steps to view and edit your notification preferences:">
        <Step number={1} title="From Account Settings">
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Click on your profile picture in the top-right corner</li>
            <li>Select "Settings" or "Account Settings"</li>
            <li>Navigate to the "Notifications" tab or section</li>
          </ul>
        </Step>
        <Step number={2} title="From Notifications Panel">
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Click the bell icon in the top navigation bar</li>
            <li>Select "Notification Settings" at the bottom of the panel</li>
          </ul>
        </Step>
        <Step number={3} title="From Individual Notifications">
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Click the three dots (⋮) on any notification</li>
            <li>Select "Notification Settings" or "Manage Notifications"</li>
          </ul>
        </Step>
      </StepByStepGuide>

      {/* Notification Types */}
      <h2 id="notification-types" className="text-2xl font-bold mt-8">Notification Types</h2>
      <Separator className="my-2" />
      <p>
        The platform offers various categories of notifications that you can customize.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Course Notifications</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Announcements, new content, assignment reminders, and grade updates.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Discussion Notifications</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Replies to your posts, mentions, direct messages, and chatroom activity.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Schedule Notifications</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Class reminders, schedule changes, and upcoming events.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Administrative Notifications</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Account updates, payment confirmations, and system announcements.
          </p>
        </div>
      </div>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Common Course Notifications
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <strong>Assignment Notifications</strong>
              <p className="text-sm text-muted-foreground">New assignments, due date reminders, and grade postings.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>Announcement Notifications</strong>
              <p className="text-sm text-muted-foreground">Course announcements and important updates from instructors.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>Content Notifications</strong>
              <p className="text-sm text-muted-foreground">New course materials, resources, and content updates.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>Feedback Notifications</strong>
              <p className="text-sm text-muted-foreground">Comments and feedback on your submissions.</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Delivery Methods */}
      <h2 id="delivery-methods" className="text-2xl font-bold mt-8">Notification Delivery Methods</h2>
      <Separator className="my-2" />
      <p>
        You can choose how you receive different types of notifications.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-5 w-5 text-primary" />
            <h4 className="font-medium">In-App Notifications</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Notifications that appear in the platform's notification center when you're logged in.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Email Notifications</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Notifications sent to your registered email address.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Push Notifications</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Alerts sent to your mobile device if you've installed the app.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <h4 className="font-medium">SMS Notifications</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Text messages sent to your registered mobile number for critical alerts.
          </p>
        </div>
      </div>

      <HelpCallout type="note" title="Device Permissions">
        To receive push notifications on your mobile device, you must grant notification
        permissions to the app when prompted. If you declined initially, you can enable
        them in your device settings.
      </HelpCallout>

      {/* Customizing Notifications */}
      <h2 id="customizing-notifications" className="text-2xl font-bold mt-8">Customizing Notifications</h2>
      <Separator className="my-2" />
      <p>
        You can customize which notifications you receive and how they're delivered.
      </p>

      <StepByStepGuide title="Customizing Notification Settings" description="Follow these steps to personalize your notifications:">
        <Step number={1} title="Access Notification Settings">
          Navigate to your notification settings as described earlier.
        </Step>
        <Step number={2} title="Browse Categories">
          Browse through the different notification categories (Courses, Discussions, etc.).
        </Step>
        <Step number={3} title="Configure Each Type">
          For each notification type, you can:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Toggle the notification on or off</li>
            <li>Select delivery methods (in-app, email, push, SMS)</li>
            <li>Set frequency (immediate, daily digest, weekly summary)</li>
          </ul>
        </Step>
        <Step number={4} title="Set Priority Levels">
          Some platforms allow you to set priority levels for different notifications.
        </Step>
        <Step number={5} title="Save Changes">
          Click "Save" or "Apply" to update your notification preferences.
        </Step>
      </StepByStepGuide>

      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border px-4 py-2 text-left">Notification Type</th>
              <th className="border px-4 py-2 text-left">Recommended Delivery Methods</th>
              <th className="border px-4 py-2 text-left">Suggested Frequency</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Assignment Due Dates</td>
              <td className="border px-4 py-2">In-app, Email, Push</td>
              <td className="border px-4 py-2">24 hours before, 1 hour before</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Course Announcements</td>
              <td className="border px-4 py-2">In-app, Email</td>
              <td className="border px-4 py-2">Immediate</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Discussion Replies</td>
              <td className="border px-4 py-2">In-app, Push</td>
              <td className="border px-4 py-2">Immediate or Daily Digest</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Grade Updates</td>
              <td className="border px-4 py-2">In-app, Email</td>
              <td className="border px-4 py-2">Immediate</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Managing Notification Overload */}
      <h2 id="managing-overload" className="text-2xl font-bold mt-8">Managing Notification Overload</h2>
      <Separator className="my-2" />
      <p>
        Too many notifications can become overwhelming. Here are strategies to manage notification volume
        while still staying informed about important events.
      </p>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <BellOff className="h-5 w-5 text-primary" />
          Notification Management Strategies
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <strong>Prioritize by Importance</strong>
              <p className="text-sm text-muted-foreground">Enable immediate notifications only for the most critical items, such as assignment deadlines and important announcements.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>Use Digests</strong>
              <p className="text-sm text-muted-foreground">Set less urgent notifications to arrive as daily or weekly digests rather than immediate alerts.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>Differentiate Delivery Methods</strong>
              <p className="text-sm text-muted-foreground">Use different delivery methods for different priorities (e.g., push notifications for urgent items, email for summaries).</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>Set Quiet Hours</strong>
              <p className="text-sm text-muted-foreground">Configure quiet hours during which you'll only receive critical notifications.</p>
            </div>
          </li>
        </ul>
      </div>

      <StepByStepGuide title="Setting Up Notification Digests" description="Follow these steps to consolidate notifications:">
        <Step number={1} title="Access Notification Settings">
          Navigate to your notification settings.
        </Step>
        <Step number={2} title="Find Digest Options">
          Look for "Notification Frequency" or "Delivery Schedule" options.
        </Step>
        <Step number={3} title="Select Digest Frequency">
          Choose your preferred digest frequency:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Daily digest (receive one summary each day)</li>
            <li>Weekly digest (receive one summary each week)</li>
          </ul>
        </Step>
        <Step number={4} title="Choose Digest Time">
          Select the time of day you'd like to receive your digest.
        </Step>
        <Step number={5} title="Select Notification Types">
          Choose which types of notifications should be included in digests.
        </Step>
        <Step number={6} title="Save Changes">
          Click "Save" or "Apply" to update your digest settings.
        </Step>
      </StepByStepGuide>

      <HelpCallout type="tip" title="Regular Review">
        Periodically review your notification settings, especially at the beginning of new
        terms or when joining new courses, to ensure you're receiving the right balance of
        information.
      </HelpCallout>

      {/* Course-Specific Notifications */}
      <h2 id="course-specific" className="text-2xl font-bold mt-8">Course-Specific Notifications</h2>
      <Separator className="my-2" />
      <p>
        You can customize notification settings for individual courses.
      </p>

      <StepByStepGuide title="Setting Course-Specific Notifications" description="Follow these steps to customize notifications for a particular course:">
        <Step number={1} title="Navigate to Course">
          Go to the course page for which you want to customize notifications.
        </Step>
        <Step number={2} title="Access Course Settings">
          Click on the settings icon or "Course Settings" option.
        </Step>
        <Step number={3} title="Find Notification Options">
          Look for "Notification Preferences" or similar option.
        </Step>
        <Step number={4} title="Customize Settings">
          Adjust notification settings specifically for this course:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Assignment notifications</li>
            <li>Announcement notifications</li>
            <li>Discussion notifications</li>
            <li>Grade notifications</li>
          </ul>
        </Step>
        <Step number={5} title="Save Changes">
          Click "Save" or "Apply" to update your course-specific notification settings.
        </Step>
      </StepByStepGuide>

      <HelpCallout type="note" title="Priority Courses">
        Consider setting more comprehensive notifications for high-priority courses or
        those with frequent deadlines and updates.
      </HelpCallout>

      {/* Troubleshooting */}
      <h2 id="troubleshooting" className="text-2xl font-bold mt-8">Troubleshooting</h2>
      <Separator className="my-2" />
      <p>
        If you're experiencing issues with notifications, here are some common problems and solutions.
      </p>

      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border px-4 py-2 text-left">Issue</th>
              <th className="border px-4 py-2 text-left">Possible Solution</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Not Receiving Email Notifications</td>
              <td className="border px-4 py-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Check your spam or junk folder</li>
                  <li>Verify your email address is correct in your profile</li>
                  <li>Add the platform's email domain to your safe senders list</li>
                  <li>Ensure notifications are enabled in your settings</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Push Notifications Not Working</td>
              <td className="border px-4 py-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Check that notifications are enabled in your device settings</li>
                  <li>Ensure the app is up to date</li>
                  <li>Try logging out and back into the app</li>
                  <li>Verify push notifications are enabled in your account settings</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Too Many Notifications</td>
              <td className="border px-4 py-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Review and adjust your notification settings</li>
                  <li>Consider using digest options instead of immediate notifications</li>
                  <li>Disable notifications for less important activities</li>
                  <li>Set up quiet hours during times you don't want to be disturbed</li>
                </ul>
              </td>
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
              As a student, effective notification settings help you stay on track:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Keep assignment deadline notifications enabled to avoid missing due dates</li>
              <li>Set up notifications for grade postings to stay informed about your progress</li>
              <li>Consider enabling push notifications for time-sensitive announcements</li>
              <li>Use email digests for discussion activities to reduce notification frequency</li>
            </ul>
          </div>
        }
        teacherContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Teachers</h3>
            <p>
              As a teacher, notifications help you manage student interactions:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Enable notifications for student questions to provide timely assistance</li>
              <li>Set up alerts for assignment submissions to track student progress</li>
              <li>Consider using digests for discussion activities in large courses</li>
              <li>Keep administrative notifications enabled to stay informed about platform updates</li>
            </ul>
          </div>
        }
        adminContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Administrators</h3>
            <p>
              As an administrator, you can configure notification systems:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Set default notification preferences for different user roles</li>
              <li>Configure which notifications can be customized by users</li>
              <li>Define critical notifications that cannot be disabled</li>
              <li>Monitor notification delivery performance and user engagement</li>
            </ul>
          </div>
        }
      />

      {/* Related Topics */}
      <RelatedTopics topics={relatedTopics} />

      {/* Article Footer with feedback */}
      <ArticleFooter 
        previousArticle={{
          title: "Account Settings",
          href: "/help/account/settings"
        }}
        nextArticle={{
          title: "Platform Overview",
          href: "/help/getting-started/overview"
        }}
      />
    </article>
  );
}
