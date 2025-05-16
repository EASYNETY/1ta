'use client'

import React from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  List, 
  Grid, 
  Filter, 
  Search, 
  Share2, 
  Download, 
  Smartphone, 
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
    title: 'Event Types', 
    href: '/help/timetable/events',
    description: 'Learn about different types of events in your schedule'
  },
  { 
    title: 'Schedule Notifications', 
    href: '/help/timetable/notifications',
    description: 'Set up reminders and notifications for your schedule'
  },
  { 
    title: 'Marking Attendance', 
    href: '/help/attendance/marking',
    description: 'Learn how to mark and track attendance'
  },
];

export default function ViewingScheduleHelpPage() {
  return (
    <article className="mx-auto space-y-6">
      <ArticleHeader
        title="Viewing Your Schedule"
        icon={Calendar}
        description="Learn how to access, navigate, and customize your timetable to stay organized."
        breadcrumbs={[
          { label: 'Help Center', href: '/help' },
          { label: 'Timetable', href: '/help/timetable' },
          { label: 'Viewing Your Schedule' },
        ]}
      />

      {/* Table of Contents */}
      <TableOfContents />

      {/* Introduction */}
      <p className="text-lg">
        The timetable feature helps you keep track of your classes, assignments, and other academic activities.
        With multiple view options and filtering capabilities, you can customize how you see your schedule
        to best fit your needs.
      </p>

      <HelpCallout type="tip" title="Quick Access">
        Pin the timetable to your favorites or add it to your dashboard widgets for faster access
        to your schedule throughout the day.
      </HelpCallout>

      {/* Accessing Your Schedule */}
      <h2 id="accessing-schedule" className="text-2xl font-bold mt-8">Accessing Your Schedule</h2>
      <Separator className="my-2" />
      <p>
        There are several ways to access your schedule within the platform.
      </p>

      <StepByStepGuide title="Accessing Your Schedule" description="Choose one of these methods to view your timetable:">
        <Step number={1} title="Main Navigation">
          From the main sidebar, click on "Timetable" to access your full schedule.
        </Step>
        <Step number={2} title="Dashboard Widget">
          If enabled, you can view a summary of your schedule on your dashboard through the Timetable widget.
        </Step>
        <Step number={3} title="Quick Access Menu">
          Click on the calendar icon in the header for a quick view of today's schedule.
        </Step>
        <Step number={4} title="Mobile App">
          Access your schedule through the mobile app for on-the-go viewing.
        </Step>
      </StepByStepGuide>

      {/* Schedule View Options */}
      <h2 id="view-options" className="text-2xl font-bold mt-8">Schedule View Options</h2>
      <Separator className="my-2" />
      <p>
        The platform offers multiple ways to view your schedule to suit different needs and preferences.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Grid className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Month View</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            See your entire month at a glance with color-coded events and activities.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Week View</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            View your schedule for the entire week with detailed time slots and event information.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Day View</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Focus on a single day with a detailed hour-by-hour breakdown of your schedule.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <List className="h-5 w-5 text-primary" />
            <h4 className="font-medium">List View</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            See your upcoming events in a chronological list format for easy scanning.
          </p>
        </div>
      </div>

      <StepByStepGuide title="Switching Between Views" description="Follow these steps to change your schedule view:">
        <Step number={1} title="Open the Timetable">
          Navigate to the Timetable section from the main sidebar.
        </Step>
        <Step number={2} title="Locate View Options">
          Find the view selector in the top-right corner of the timetable.
        </Step>
        <Step number={3} title="Select Desired View">
          Click on the icon or label for the view you want to use (Month, Week, Day, or List).
        </Step>
        <Step number={4} title="Adjust Date Range">
          Use the navigation arrows or date picker to move to different time periods within your selected view.
        </Step>
      </StepByStepGuide>

      {/* Filtering and Customizing */}
      <h2 id="filtering-customizing" className="text-2xl font-bold mt-8">Filtering and Customizing</h2>
      <Separator className="my-2" />
      <p>
        Customize your schedule view to focus on specific types of events or time periods.
      </p>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          Filter Options
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <strong>Event Type</strong>
              <p className="text-sm text-muted-foreground">Filter by classes, assignments, exams, or other event types.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>Course</strong>
              <p className="text-sm text-muted-foreground">Show events for specific courses only.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>Location</strong>
              <p className="text-sm text-muted-foreground">Filter events by physical or virtual location.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>Priority</strong>
              <p className="text-sm text-muted-foreground">Focus on high-priority events or deadlines.</p>
            </div>
          </li>
        </ul>
      </div>

      <HelpCallout type="note" title="Saved Filters">
        You can save your frequently used filter combinations for quick access. Click the "Save Filter"
        button after setting up your preferred filters, then give it a name for future reference.
      </HelpCallout>

      {/* Event Details */}
      <h2 id="event-details" className="text-2xl font-bold mt-8">Viewing Event Details</h2>
      <Separator className="my-2" />
      <p>
        Each event in your schedule contains detailed information to help you prepare and stay organized.
      </p>

      <StepByStepGuide title="Accessing Event Details" description="Follow these steps to view detailed information about an event:">
        <Step number={1} title="Locate the Event">
          Find the event in your schedule using any of the available views.
        </Step>
        <Step number={2} title="Click on the Event">
          Click on the event block or list item to open the event details panel.
        </Step>
        <Step number={3} title="Review Details">
          The details panel shows comprehensive information about the event, including:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Title and description</li>
            <li>Date and time</li>
            <li>Location (physical or virtual)</li>
            <li>Associated course or category</li>
            <li>Instructor or organizer</li>
            <li>Attachments or resources</li>
            <li>Related assignments or assessments</li>
          </ul>
        </Step>
      </StepByStepGuide>

      {/* Mobile Access */}
      <h2 id="mobile-access" className="text-2xl font-bold mt-8">Mobile Access</h2>
      <Separator className="my-2" />
      <p>
        Access your schedule on the go using the mobile app or mobile web version.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Mobile App Features</h4>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>Offline access to your schedule</li>
            <li>Push notifications for upcoming events</li>
            <li>Widget for your device home screen</li>
            <li>Integration with device calendar</li>
          </ul>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Download className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Calendar Integration</h4>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>Export to Google Calendar</li>
            <li>Export to Apple Calendar</li>
            <li>Export to Microsoft Outlook</li>
            <li>Subscribe to calendar feed (iCal)</li>
          </ul>
        </div>
      </div>

      <HelpCallout type="tip" title="Calendar Sync">
        To keep your device calendar in sync with your academic schedule, use the calendar
        subscription feature rather than one-time exports. This ensures any changes to your
        academic schedule are automatically reflected in your personal calendar.
      </HelpCallout>

      {/* Role-specific content */}
      <RoleContent
        studentContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Students</h3>
            <p>
              As a student, your schedule helps you stay on track with classes and assignments:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Check your schedule at the beginning of each week to plan your study time</li>
              <li>Use the list view to quickly see upcoming deadlines and exams</li>
              <li>Set up notifications for class reminders and assignment due dates</li>
              <li>Sync your academic schedule with your personal calendar for comprehensive time management</li>
            </ul>
          </div>
        }
        teacherContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Teachers</h3>
            <p>
              As a teacher, your schedule helps you manage your teaching responsibilities:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>View your teaching schedule alongside office hours and meetings</li>
              <li>Use the day view for detailed planning of each teaching day</li>
              <li>Check room assignments and prepare accordingly</li>
              <li>Set up notifications for class start times to ensure punctuality</li>
            </ul>
          </div>
        }
        adminContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Administrators</h3>
            <p>
              As an administrator, you can view and manage schedules across the institution:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access master schedules for all courses and instructors</li>
              <li>View room utilization and identify scheduling conflicts</li>
              <li>Monitor schedule changes and adjustments</li>
              <li>Generate reports on scheduling efficiency and resource allocation</li>
            </ul>
          </div>
        }
      />

      {/* Related Topics */}
      <RelatedTopics topics={relatedTopics} />

      {/* Article Footer with feedback */}
      <ArticleFooter 
        previousArticle={{
          title: "Attendance Reports",
          href: "/help/attendance/reports"
        }}
        nextArticle={{
          title: "Event Types",
          href: "/help/timetable/events"
        }}
      />
    </article>
  );
}
