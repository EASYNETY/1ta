'use client'

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  BarChart, 
  CheckCircle, 
  Award, 
  Clock, 
  Calendar, 
  LineChart, 
  Target, 
  List, 
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
    title: 'Course Enrollment', 
    href: '/help/courses/enrollment',
    description: 'Learn how to browse and enroll in courses'
  },
  { 
    title: 'Accessing Course Materials', 
    href: '/help/courses/materials',
    description: 'Find out how to access and navigate through course content'
  },
  { 
    title: 'Attendance Reports', 
    href: '/help/attendance/reports',
    description: 'View and understand your attendance records'
  },
];

export default function CourseProgressHelpPage() {
  return (
    <article className="mx-auto space-y-6">
      <ArticleHeader
        title="Tracking Your Progress"
        icon={BarChart}
        description="Learn how to monitor your learning journey and track your achievements across courses."
        breadcrumbs={[
          { label: 'Help Center', href: '/help' },
          { label: 'Courses', href: '/help/courses' },
          { label: 'Tracking Your Progress' },
        ]}
      />

      {/* Table of Contents */}
      <TableOfContents />

      {/* Introduction */}
      <p className="text-lg">
        Tracking your progress is essential for staying motivated and ensuring you're meeting your educational goals.
        The 1Tech Academy platform provides several tools to help you monitor your learning journey and identify areas
        that may need additional attention.
      </p>

      <HelpCallout type="tip" title="Regular Check-ins">
        We recommend checking your progress at least once a week to stay on track with your learning goals.
      </HelpCallout>

      {/* Progress Dashboard */}
      <h2 id="progress-dashboard" className="text-2xl font-bold mt-8">Progress Dashboard</h2>
      <Separator className="my-2" />
      <p>
        The Progress Dashboard provides a comprehensive overview of your learning journey across all your courses.
      </p>

      <StepByStepGuide title="Accessing Your Progress Dashboard" description="Follow these steps to view your progress:">
        <Step number={1} title="Navigate to Dashboard">
          From the main sidebar, click on "Dashboard" to access your personal dashboard.
        </Step>
        <Step number={2} title="Find the Progress Section">
          Scroll down to the "My Progress" section, which displays summary statistics for all your courses.
        </Step>
        <Step number={3} title="View Detailed Progress">
          Click on "View Detailed Progress" to see a comprehensive breakdown of your learning activities.
        </Step>
      </StepByStepGuide>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Completion Rates</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            See the percentage of course materials you've completed for each enrolled course.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Achievements</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            View badges and certificates earned through course completion and special accomplishments.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Time Spent</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Track how much time you've spent on different courses and learning activities.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Activity Calendar</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Visualize your learning patterns over time with a calendar view of your activities.
          </p>
        </div>
      </div>

      {/* Course-Specific Progress */}
      <h2 id="course-progress" className="text-2xl font-bold mt-8">Course-Specific Progress</h2>
      <Separator className="my-2" />
      <p>
        Each course has its own progress tracking features to help you monitor your advancement through the material.
      </p>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <LineChart className="h-5 w-5 text-primary" />
          Course Progress Indicators
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <strong>Module Completion</strong>
              <p className="text-sm text-muted-foreground">Visual indicators show which modules you've completed, started, or not yet begun.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>Assessment Scores</strong>
              <p className="text-sm text-muted-foreground">View your scores on quizzes, assignments, and exams within each course.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>Progress Bar</strong>
              <p className="text-sm text-muted-foreground">A progress bar at the top of each course shows your overall completion percentage.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>Next Steps</strong>
              <p className="text-sm text-muted-foreground">Recommendations for what to focus on next based on your current progress.</p>
            </div>
          </li>
        </ul>
      </div>

      <HelpCallout type="note" title="Progress Synchronization">
        Your progress is automatically synchronized across devices. If you complete a module on your phone,
        it will show as completed when you log in on your computer.
      </HelpCallout>

      {/* Setting and Tracking Goals */}
      <h2 id="setting-goals" className="text-2xl font-bold mt-8">Setting and Tracking Goals</h2>
      <Separator className="my-2" />
      <p>
        Setting learning goals can help you stay motivated and focused on your educational journey.
      </p>

      <StepByStepGuide title="Setting Learning Goals" description="Follow these steps to set and track your goals:">
        <Step number={1} title="Access Goal Setting">
          From your Dashboard, click on the "Learning Goals" section.
        </Step>
        <Step number={2} title="Create a New Goal">
          Click "Add New Goal" and select the type of goal you want to set (course completion, time commitment, etc.).
        </Step>
        <Step number={3} title="Define Parameters">
          Specify the details of your goal, including target dates and milestones.
        </Step>
        <Step number={4} title="Monitor Progress">
          Return to the Learning Goals section regularly to check your progress and adjust as needed.
        </Step>
      </StepByStepGuide>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-primary" />
            <h4 className="font-medium">SMART Goals</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Set Specific, Measurable, Achievable, Relevant, and Time-bound goals for better results.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <List className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Milestone Tracking</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Break larger goals into smaller milestones to track incremental progress.
          </p>
        </div>
      </div>

      {/* Exporting and Sharing Progress */}
      <h2 id="exporting-progress" className="text-2xl font-bold mt-8">Exporting and Sharing Progress</h2>
      <Separator className="my-2" />
      <p>
        You can export your progress reports or share your achievements with others.
      </p>

      <StepByStepGuide title="Exporting Progress Reports" description="Follow these steps to export your progress data:">
        <Step number={1} title="Navigate to Progress Reports">
          From your Dashboard, click on "Progress Reports" in the sidebar.
        </Step>
        <Step number={2} title="Select Report Type">
          Choose the type of report you want to generate (course completion, assessment scores, etc.).
        </Step>
        <Step number={3} title="Set Parameters">
          Select the date range and courses to include in the report.
        </Step>
        <Step number={4} title="Export">
          Click "Export" and choose your preferred format (PDF, CSV, etc.).
        </Step>
      </StepByStepGuide>

      <HelpCallout type="tip" title="Sharing Achievements">
        You can share your certificates and badges on social media directly from the Achievements section
        by clicking the "Share" button next to any achievement.
      </HelpCallout>

      {/* Role-specific content */}
      <RoleContent
        studentContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Students</h3>
            <p>
              As a student, tracking your progress helps you stay accountable and identify areas for improvement:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Set aside time each week to review your progress across all courses</li>
              <li>Use the progress data to adjust your study habits and focus on challenging areas</li>
              <li>Celebrate milestones and achievements to maintain motivation</li>
              <li>Share your progress with study partners or mentors for additional accountability</li>
            </ul>
          </div>
        }
        teacherContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Teachers</h3>
            <p>
              As a teacher, you can help students track their progress effectively:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Design your course with clear progress indicators for each module</li>
              <li>Provide regular feedback on student progress through assessments and comments</li>
              <li>Use the class progress overview to identify students who may need additional support</li>
              <li>Encourage students to set and share their learning goals</li>
            </ul>
          </div>
        }
        adminContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Administrators</h3>
            <p>
              As an administrator, you can leverage progress tracking for institutional insights:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Monitor overall progress metrics across courses and departments</li>
              <li>Identify trends in student engagement and completion rates</li>
              <li>Use progress data to inform curriculum development and resource allocation</li>
              <li>Ensure that progress tracking features are properly configured for all courses</li>
            </ul>
          </div>
        }
      />

      {/* Related Topics */}
      <RelatedTopics topics={relatedTopics} />

      {/* Article Footer with feedback */}
      <ArticleFooter />
    </article>
  );
}
