'use client'

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  FileText,
  Video,
  Download,
  Link as LinkIcon,
  ExternalLink,
  Play,
  File,
  Bookmark,
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
    description: 'Learn how to browse and enrol in courses'
  },
  {
    title: 'Tracking Your Progress',
    href: '/help/courses/progress',
    description: 'Understand how to monitor your learning journey'
  },
  {
    title: 'Navigating the Interface',
    href: '/help/getting-started/navigation',
    description: 'Learn how to navigate through different sections of the platform'
  },
];

export default function CourseMaterialsHelpPage() {
  return (
    <article className="mx-auto space-y-6">
      <ArticleHeader
        title="Accessing Course Materials"
        icon={BookOpen}
        description="Learn how to find and use the learning materials for your enrolled courses."
        breadcrumbs={[
          { label: 'Help Center', href: '/help' },
          { label: 'Courses', href: '/help/courses' },
          { label: 'Accessing Course Materials' },
        ]}
      />

      {/* Table of Contents */}
      <TableOfContents />

      {/* Introduction */}
      <p className="text-lg">
        Once you've enrolled in a class, you'll have access to a variety of learning materials including
        lectures, readings, videos, and assignments. This guide will help you understand how to find and
        use these materials effectively.
      </p>

      <HelpCallout type="note" title="Material Availability">
        Course materials become available based on the class schedule. Some instructors release all materials
        at once, while others release them progressively as the class advances. Materials are typically
        associated with specific classes, so students in different class sessions of the same course
        may receive materials at different times.
      </HelpCallout>

      {/* Finding Your Course Materials */}
      <h2 id="finding-materials" className="text-2xl font-bold mt-8">Finding Your Course Materials</h2>
      <Separator className="my-2" />
      <p>
        There are several ways to access your course materials, depending on what you're looking for.
      </p>

      <StepByStepGuide title="Accessing Course Materials" description="Follow these steps to access your course materials:">
        <Step number={1} title="Navigate to My Classes">
          From the main sidebar, click on "My Classes" or "Timetable" to see a list of all your enrolled classes.
        </Step>
        <Step number={2} title="Select a Class">
          Click on the class title to open the class dashboard. You can also access your classes through the course page by selecting the specific class session you're enrolled in.
        </Step>
        <Step number={3} title="Browse Class Content">
          Use the class navigation menu to browse different sections of the class, such as Modules, Assignments, or Resources. Materials are organized by the instructor for your specific class session.
        </Step>
        <Step number={4} title="Access Course-Wide Materials">
          Some materials may be available to all class sessions of a course. These can typically be found in the "Course Resources" section, accessible from either the class dashboard or the main course page.
        </Step>
      </StepByStepGuide>

      {/* Types of Course Materials */}
      <h2 id="material-types" className="text-2xl font-bold mt-8">Types of Course Materials</h2>
      <Separator className="my-2" />
      <p>
        Courses typically include various types of learning materials to support different learning styles.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Video className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Video Lectures</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Recorded presentations by instructors covering key concepts and demonstrations.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Reading Materials</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Text-based content including articles, book excerpts, and lecture notes.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <File className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Downloadable Resources</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Files you can download such as PDFs, code samples, or templates.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            <h4 className="font-medium">External Resources</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Links to external websites, tools, or additional learning resources.
          </p>
        </div>
      </div>

      {/* Working with Video Content */}
      <h2 id="video-content" className="text-2xl font-bold mt-8">Working with Video Content</h2>
      <Separator className="my-2" />
      <p>
        Video lectures are a core component of many courses. Here's how to get the most out of them:
      </p>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Play className="h-5 w-5 text-primary" />
          Video Player Features
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <strong>Playback Speed</strong>
              <p className="text-sm text-muted-foreground">Adjust the playback speed (0.5x to 2x) to match your learning pace.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>Captions</strong>
              <p className="text-sm text-muted-foreground">Enable captions for better comprehension or in noisy environments.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>Bookmarks</strong>
              <p className="text-sm text-muted-foreground">Add bookmarks at important points to easily revisit key concepts.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>Quality Settings</strong>
              <p className="text-sm text-muted-foreground">Adjust video quality based on your internet connection.</p>
            </div>
          </li>
        </ul>
      </div>

      <HelpCallout type="tip" title="Offline Viewing">
        Some courses allow you to download videos for offline viewing. Look for the download icon next to eligible videos.
      </HelpCallout>

      {/* Downloading and Saving Materials */}
      <h2 id="downloading-materials" className="text-2xl font-bold mt-8">Downloading and Saving Materials</h2>
      <Separator className="my-2" />
      <p>
        Many course materials can be downloaded for offline use or future reference.
      </p>

      <StepByStepGuide title="Downloading Course Materials" description="Follow these steps to download materials:">
        <Step number={1} title="Locate the Resource">
          Navigate to the specific module or resource section where the material is located.
        </Step>
        <Step number={2} title="Look for Download Options">
          Downloadable resources will have a download icon (<Download className="inline h-4 w-4" />) next to them.
        </Step>
        <Step number={3} title="Save the File">
          Click the download icon and choose where to save the file on your device.
        </Step>
        <Step number={4} title="Access Offline">
          Once downloaded, you can access the file even without an internet connection.
        </Step>
      </StepByStepGuide>

      <HelpCallout type="warning" title="Copyright Notice">
        Course materials are typically protected by copyright. They are provided for your personal educational use only
        and should not be shared or distributed without permission.
      </HelpCallout>

      {/* Bookmarking and Organizing */}
      <h2 id="organizing-materials" className="text-2xl font-bold mt-8">Bookmarking and Organizing Materials</h2>
      <Separator className="my-2" />
      <p>
        Keeping track of important materials can help you study more efficiently.
      </p>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-primary" />
          Organization Tips
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <strong>Use the bookmark feature</strong>
              <p className="text-sm text-muted-foreground">Click the bookmark icon on important materials to save them for quick access.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>Create a consistent file structure</strong>
              <p className="text-sm text-muted-foreground">Organize downloaded files in folders by course and module on your device.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>Take notes with references</strong>
              <p className="text-sm text-muted-foreground">Include references to specific materials in your notes for easy lookup later.</p>
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
              As a student, effective use of course materials is key to your success:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Review the course syllabus to understand which materials are required versus supplementary</li>
              <li>Develop a regular schedule for engaging with course materials</li>
              <li>Take notes while watching videos or reading materials to reinforce learning</li>
              <li>Use the discussion forums to ask questions about specific materials</li>
            </ul>
          </div>
        }
        teacherContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Teachers</h3>
            <p>
              As a teacher, you can help students make the most of course materials:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Clearly label required versus optional materials</li>
              <li>Provide context for each resource explaining its importance</li>
              <li>Consider offering materials in multiple formats to accommodate different learning styles</li>
              <li>Monitor which materials students are engaging with most through the analytics dashboard</li>
            </ul>
          </div>
        }
        adminContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Administrators</h3>
            <p>
              As an administrator, you can support effective use of course materials:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ensure the platform has sufficient storage for all course materials</li>
              <li>Monitor system performance, especially during peak usage times</li>
              <li>Provide training for faculty on best practices for organizing course materials</li>
              <li>Establish clear guidelines for copyright compliance and material sharing</li>
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
