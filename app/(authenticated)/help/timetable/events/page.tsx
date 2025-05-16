'use client'

import React from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  BookOpen, 
  FileText, 
  Award, 
  Users, 
  Video, 
  Clock, 
  Tag, 
  AlertCircle, 
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
    title: 'Schedule Notifications', 
    href: '/help/timetable/notifications',
    description: 'Set up reminders for your scheduled events'
  },
  { 
    title: 'Course Enrollment', 
    href: '/help/courses/enrollment',
    description: 'Learn how to enroll in courses that will appear in your schedule'
  },
];

export default function EventTypesHelpPage() {
  return (
    <article className="mx-auto space-y-6">
      <ArticleHeader
        title="Event Types"
        icon={Tag}
        description="Understand the different types of events that appear in your schedule and how they're organized."
        breadcrumbs={[
          { label: 'Help Center', href: '/help' },
          { label: 'Timetable', href: '/help/timetable' },
          { label: 'Event Types' },
        ]}
      />

      {/* Table of Contents */}
      <TableOfContents />

      {/* Introduction */}
      <p className="text-lg">
        Your schedule contains various types of events, each with its own purpose and characteristics.
        Understanding these different event types helps you better organize your academic activities
        and prioritize your time effectively.
      </p>

      <HelpCallout type="tip" title="Color Coding">
        Events in your schedule are color-coded by type for easy identification. You can customize these colors
        in your timetable settings to match your personal preferences.
      </HelpCallout>

      {/* Primary Event Types */}
      <h2 id="primary-types" className="text-2xl font-bold mt-8">Primary Event Types</h2>
      <Separator className="my-2" />
      <p>
        The platform categorizes events into several primary types that represent different academic activities.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Classes</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Regular scheduled course sessions, including lectures, seminars, and labs.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Assignments</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Due dates for homework, projects, and other coursework submissions.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Exams</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Scheduled tests, quizzes, and final examinations.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Meetings</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            One-on-one or group meetings with instructors, advisors, or study groups.
          </p>
        </div>
      </div>

      {/* Class Event Subtypes */}
      <h2 id="class-subtypes" className="text-2xl font-bold mt-8">Class Event Subtypes</h2>
      <Separator className="my-2" />
      <p>
        Class events are further categorized into subtypes based on the teaching format and purpose.
      </p>

      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border px-4 py-2 text-left">Subtype</th>
              <th className="border px-4 py-2 text-left">Description</th>
              <th className="border px-4 py-2 text-left">Typical Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Lecture</td>
              <td className="border px-4 py-2">Instructor-led presentation of course material</td>
              <td className="border px-4 py-2">1-3 hours</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Seminar</td>
              <td className="border px-4 py-2">Discussion-based session with active student participation</td>
              <td className="border px-4 py-2">1-2 hours</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Laboratory</td>
              <td className="border px-4 py-2">Hands-on practical session for experiments or exercises</td>
              <td className="border px-4 py-2">2-4 hours</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Tutorial</td>
              <td className="border px-4 py-2">Small group session focused on problem-solving or clarification</td>
              <td className="border px-4 py-2">1 hour</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Workshop</td>
              <td className="border px-4 py-2">Interactive session for skill development or project work</td>
              <td className="border px-4 py-2">2-4 hours</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Event Properties */}
      <h2 id="event-properties" className="text-2xl font-bold mt-8">Event Properties</h2>
      <Separator className="my-2" />
      <p>
        Each event in your schedule has specific properties that provide important information.
      </p>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Common Event Properties
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <strong>Title</strong>
              <p className="text-sm text-muted-foreground">The name of the event, often including the course code for class events.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>Date and Time</strong>
              <p className="text-sm text-muted-foreground">When the event occurs, including start and end times for scheduled sessions.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>Location</strong>
              <p className="text-sm text-muted-foreground">Physical room or virtual meeting link where the event takes place.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>Description</strong>
              <p className="text-sm text-muted-foreground">Additional details about the event, such as topics to be covered or preparation required.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">5</div>
            <div>
              <strong>Instructor/Organizer</strong>
              <p className="text-sm text-muted-foreground">The person responsible for leading or organizing the event.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">6</div>
            <div>
              <strong>Recurrence</strong>
              <p className="text-sm text-muted-foreground">Whether the event repeats on a regular schedule (e.g., weekly classes).</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Event Status Indicators */}
      <h2 id="status-indicators" className="text-2xl font-bold mt-8">Event Status Indicators</h2>
      <Separator className="my-2" />
      <p>
        Events may have status indicators that provide additional context about their current state.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <h4 className="font-medium">Upcoming</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Events scheduled to occur in the near future, often highlighted for attention.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <h4 className="font-medium">Urgent</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            High-priority events or deadlines requiring immediate attention.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Video className="h-5 w-5 text-blue-500" />
            <h4 className="font-medium">Online</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Virtual events that take place online rather than in a physical location.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <h4 className="font-medium">Cancelled</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Events that have been cancelled but remain visible in the schedule for reference.
          </p>
        </div>
      </div>

      {/* Creating Custom Event Types */}
      <h2 id="custom-types" className="text-2xl font-bold mt-8">Creating Custom Event Types</h2>
      <Separator className="my-2" />
      <p>
        You can create custom event types to better organize your personal schedule.
      </p>

      <StepByStepGuide title="Creating a Custom Event Type" description="Follow these steps to create a custom event type:">
        <Step number={1} title="Access Timetable Settings">
          From the Timetable page, click on the settings icon in the top-right corner.
        </Step>
        <Step number={2} title="Navigate to Event Types">
          Select the "Event Types" tab in the settings panel.
        </Step>
        <Step number={3} title="Create New Type">
          Click the "Add Custom Type" button to open the creation form.
        </Step>
        <Step number={4} title="Define Properties">
          Enter a name for your custom event type, select a color, and choose an icon.
        </Step>
        <Step number={5} title="Save Changes">
          Click "Save" to add the new event type to your options when creating events.
        </Step>
      </StepByStepGuide>

      <HelpCallout type="note" title="Custom Type Visibility">
        Custom event types are visible only to you and won't affect how events appear to other users.
        They're useful for personal organization but not for official academic categorization.
      </HelpCallout>

      {/* Role-specific content */}
      <RoleContent
        studentContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Students</h3>
            <p>
              As a student, understanding event types helps you prioritize your academic activities:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pay special attention to exam events, which typically require more preparation time</li>
              <li>Use assignment events to plan your study schedule and avoid last-minute rushes</li>
              <li>Create custom event types for personal study sessions or extracurricular activities</li>
              <li>Filter your schedule by event type during busy periods to focus on high-priority items</li>
            </ul>
          </div>
        }
        teacherContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Teachers</h3>
            <p>
              As a teacher, you can use event types to structure your course schedule effectively:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Clearly label different class formats (lectures, labs, discussions) for student clarity</li>
              <li>Schedule office hours as meeting events to make them visible to students</li>
              <li>Use exam events to highlight assessment periods in the course schedule</li>
              <li>Create custom event types for special course activities or departmental functions</li>
            </ul>
          </div>
        }
        adminContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Administrators</h3>
            <p>
              As an administrator, you can configure institution-wide event types:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Define standard event types that align with your institution's academic structure</li>
              <li>Create special event types for institutional events like orientation or graduation</li>
              <li>Configure color schemes that make different event types easily distinguishable</li>
              <li>Set up event type permissions to control which users can create certain types of events</li>
            </ul>
          </div>
        }
      />

      {/* Related Topics */}
      <RelatedTopics topics={relatedTopics} />

      {/* Article Footer with feedback */}
      <ArticleFooter 
        previousArticle={{
          title: "Viewing Your Schedule",
          href: "/help/timetable/viewing"
        }}
        nextArticle={{
          title: "Schedule Notifications",
          href: "/help/timetable/notifications"
        }}
      />
    </article>
  );
}
