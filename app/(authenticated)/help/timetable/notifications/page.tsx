'use client'

import React from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Calendar, 
  Clock, 
  Settings, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  Sliders, 
  BellOff, 
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
    title: 'Viewing Your Schedule', 
    href: '/help/timetable/viewing',
    description: 'Learn how to access and navigate your timetable'
  },
  { 
    title: 'Event Types', 
    href: '/help/timetable/events',
    description: 'Understand different types of events in your schedule'
  },
  { 
    title: 'Notification Preferences', 
    href: '/help/account/notifications',
    description: 'Manage all your notification settings'
  },
];

export default function ScheduleNotificationsHelpPage() {
  return (
    <article className="mx-auto space-y-6">
      <ArticleHeader
        title="Schedule Notifications"
        icon={Bell}
        description="Set up and manage reminders for your classes, assignments, and other scheduled events."
        breadcrumbs={[
          { label: 'Help Center', href: '/help' },
          { label: 'Timetable', href: '/help/timetable' },
          { label: 'Schedule Notifications' },
        ]}
      />

      {/* Table of Contents */}
      <TableOfContents />

      {/* Introduction */}
      <p className="text-lg">
        Schedule notifications help you stay on top of your academic commitments by sending timely
        reminders about upcoming classes, assignment deadlines, and other important events.
        Customizing these notifications ensures you receive the right alerts at the right time.
      </p>

      <HelpCallout type="tip" title="Stay Organized">
        Well-configured schedule notifications can significantly reduce the chances of missing important
        classes or deadlines, helping you manage your academic responsibilities more effectively.
      </HelpCallout>

      {/* Types of Schedule Notifications */}
      <h2 id="notification-types" className="text-2xl font-bold mt-8">Types of Schedule Notifications</h2>
      <Separator className="my-2" />
      <p>
        The platform offers several types of schedule-related notifications to keep you informed.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Class Reminders</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Notifications about upcoming classes, including time, location, and preparation materials.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Deadline Alerts</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Reminders about approaching assignment due dates, project milestones, and exam times.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Schedule Changes</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Alerts about modifications to your schedule, such as class cancellations or room changes.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sliders className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Custom Reminders</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Personalized notifications that you set for specific events or activities.
          </p>
        </div>
      </div>

      {/* Notification Delivery Methods */}
      <h2 id="delivery-methods" className="text-2xl font-bold mt-8">Notification Delivery Methods</h2>
      <Separator className="my-2" />
      <p>
        Schedule notifications can be delivered through various channels based on your preferences.
      </p>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Available Delivery Methods
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <strong>In-App Notifications</strong>
              <p className="text-sm text-muted-foreground">Alerts that appear within the platform when you're logged in.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>Email Notifications</strong>
              <p className="text-sm text-muted-foreground">Messages sent to your registered email address.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>Push Notifications</strong>
              <p className="text-sm text-muted-foreground">Alerts sent to your mobile device if you've installed the app.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>SMS Text Messages</strong>
              <p className="text-sm text-muted-foreground">Text alerts sent to your registered mobile number (if enabled).</p>
            </div>
          </li>
        </ul>
      </div>

      <HelpCallout type="note" title="Delivery Preferences">
        You can choose different delivery methods for different types of notifications. For example,
        you might want class reminders as push notifications but deadline alerts via both push and email.
      </HelpCallout>

      {/* Configuring Notification Settings */}
      <h2 id="configuring-settings" className="text-2xl font-bold mt-8">Configuring Notification Settings</h2>
      <Separator className="my-2" />
      <p>
        You can customize your schedule notification settings to match your preferences.
      </p>

      <StepByStepGuide title="Configuring Schedule Notifications" description="Follow these steps to set up your notification preferences:">
        <Step number={1} title="Access Notification Settings">
          Click on your profile picture in the top-right corner, then select "Settings" from the dropdown menu.
        </Step>
        <Step number={2} title="Navigate to Notifications">
          In the settings menu, select the "Notifications" tab.
        </Step>
        <Step number={3} title="Find Schedule Notifications">
          Scroll to the "Schedule & Timetable" section of the notifications settings.
        </Step>
        <Step number={4} title="Customize Preferences">
          For each notification type, you can:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Toggle the notification on or off</li>
            <li>Select delivery methods (in-app, email, push, SMS)</li>
            <li>Set timing preferences (how far in advance to receive reminders)</li>
          </ul>
        </Step>
        <Step number={5} title="Save Changes">
          Click the "Save Changes" button at the bottom of the page to apply your new notification settings.
        </Step>
      </StepByStepGuide>

      {/* Timing Options */}
      <h2 id="timing-options" className="text-2xl font-bold mt-8">Notification Timing Options</h2>
      <Separator className="my-2" />
      <p>
        You can customize when you receive notifications for different types of events.
      </p>

      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border px-4 py-2 text-left">Event Type</th>
              <th className="border px-4 py-2 text-left">Default Timing</th>
              <th className="border px-4 py-2 text-left">Available Options</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Classes</td>
              <td className="border px-4 py-2">30 minutes before</td>
              <td className="border px-4 py-2">5 min, 15 min, 30 min, 1 hour, 1 day before</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Assignment Deadlines</td>
              <td className="border px-4 py-2">1 day before</td>
              <td className="border px-4 py-2">1 hour, 3 hours, 12 hours, 1 day, 3 days, 1 week before</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Exams</td>
              <td className="border px-4 py-2">1 day before</td>
              <td className="border px-4 py-2">1 hour, 3 hours, 12 hours, 1 day, 3 days, 1 week before</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Meetings</td>
              <td className="border px-4 py-2">15 minutes before</td>
              <td className="border px-4 py-2">5 min, 15 min, 30 min, 1 hour, 1 day before</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile App Notifications */}
      <h2 id="mobile-notifications" className="text-2xl font-bold mt-8">Mobile App Notifications</h2>
      <Separator className="my-2" />
      <p>
        The mobile app provides additional notification features for on-the-go access to your schedule.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Lock Screen Notifications</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Receive alerts even when your device is locked, ensuring you never miss important reminders.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Calendar Integration</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Sync with your device's calendar app to receive native calendar notifications.
          </p>
        </div>
      </div>

      <HelpCallout type="important" title="Device Permissions">
        To receive push notifications on your mobile device, you must grant notification permissions
        to the app when prompted. If you declined initially, you can enable them in your device settings.
      </HelpCallout>

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
              <strong>Prioritize by Event Type</strong>
              <p className="text-sm text-muted-foreground">Enable notifications only for the most important event types, such as exams and assignment deadlines.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>Consolidate Delivery Methods</strong>
              <p className="text-sm text-muted-foreground">Choose one or two primary notification channels rather than enabling all available methods.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>Use Quiet Hours</strong>
              <p className="text-sm text-muted-foreground">Set up quiet hours during which you'll only receive critical notifications.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>Create Custom Notification Schedules</strong>
              <p className="text-sm text-muted-foreground">Configure different notification settings for different days of the week based on your schedule.</p>
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
              As a student, effective notification settings can help you stay on track with your studies:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Set multiple reminders for high-stakes events like exams and major project deadlines</li>
              <li>Configure early notifications for morning classes to ensure you have enough time to prepare</li>
              <li>Use push notifications for immediate awareness and email for a permanent record</li>
              <li>Consider setting up custom reminders for study sessions to maintain a consistent schedule</li>
            </ul>
          </div>
        }
        teacherContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Teachers</h3>
            <p>
              As a teacher, notifications help you manage your teaching responsibilities:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Set up early reminders for classes you teach to allow preparation time</li>
              <li>Configure notifications for student assignment submission deadlines</li>
              <li>Use calendar integration to maintain a comprehensive view of your teaching schedule</li>
              <li>Set up custom notifications for office hours and student meetings</li>
            </ul>
          </div>
        }
        adminContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Administrators</h3>
            <p>
              As an administrator, you can configure institution-wide notification settings:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Set default notification preferences for different user roles</li>
              <li>Configure system-wide alerts for important institutional events</li>
              <li>Monitor notification delivery performance to ensure timely alerts</li>
              <li>Provide guidance to users on optimal notification settings</li>
            </ul>
          </div>
        }
      />

      {/* Related Topics */}
      <RelatedTopics topics={relatedTopics} />

      {/* Article Footer with feedback */}
      <ArticleFooter 
        previousArticle={{
          title: "Event Types",
          href: "/help/timetable/events"
        }}
        nextArticle={{
          title: "Using Chatrooms",
          href: "/help/discussions/chatrooms"
        }}
      />
    </article>
  );
}
