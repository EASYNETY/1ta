"use client";

import React from 'react';
import Link from 'next/link';
import { GraduationCap, ChevronRight, ArrowLeft, BookOpen } from 'lucide-react';
import { DyraneCard, DyraneCardContent, DyraneCardDescription, DyraneCardHeader, DyraneCardTitle } from '@/components/dyrane-ui/dyrane-card';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { Separator } from '@/components/ui/separator';
import { ArticleHeader } from '@/components/help';
import { HelpCallout } from '@/components/help';

// Define the topics for this category
const topics = [
  { 
    id: 'enrollment', 
    title: 'Course Enrollment', 
    description: 'Learn how to browse, select, and enroll in courses on the platform.',
    href: '/help/courses/enrollment',
    icon: '/images/help/enrollment-icon.jpg'
  },
  { 
    id: 'materials', 
    title: 'Accessing Course Materials', 
    description: 'Find out how to access and navigate through course content and resources.',
    href: '/help/courses/materials',
    icon: '/images/help/materials-icon.jpg'
  },
  { 
    id: 'progress', 
    title: 'Tracking Your Progress', 
    description: 'Understand how to monitor your learning journey and achievements.',
    href: '/help/courses/progress',
    icon: '/images/help/progress-icon.jpg'
  },
];

// Define recommended learning paths
const learningPaths = [
  {
    title: 'New Student Path',
    description: 'If you\'re new to the platform, follow this sequence:',
    steps: [
      { title: 'Course Enrollment', href: '/help/courses/enrollment' },
      { title: 'Accessing Course Materials', href: '/help/courses/materials' },
      { title: 'Tracking Your Progress', href: '/help/courses/progress' },
    ]
  },
  {
    title: 'Returning Student Path',
    description: 'If you\'re already familiar with the platform:',
    steps: [
      { title: 'Tracking Your Progress', href: '/help/courses/progress' },
      { title: 'Course Enrollment', href: '/help/courses/enrollment' },
    ]
  }
];

export default function CoursesHelpPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <ArticleHeader
        title="Courses"
        icon={GraduationCap}
        description="Everything you need to know about finding, enrolling in, and completing courses on our platform."
        breadcrumbs={[
          { label: 'Help Center', href: '/help' },
          { label: 'Courses' },
        ]}
      />

      <HelpCallout type="tip" title="Quick Tip">
        You can access your enrolled courses at any time by clicking on the "Courses" icon in the main navigation sidebar.
      </HelpCallout>

      <Separator />

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {topics.map((topic) => (
          <DyraneCard key={topic.id} className="h-full overflow-hidden group">
            <DyraneCardHeader className="pb-0">
              <DyraneCardTitle>{topic.title}</DyraneCardTitle>
              <DyraneCardDescription>{topic.description}</DyraneCardDescription>
            </DyraneCardHeader>
            <DyraneCardContent className="pt-4">
              <div className="flex justify-end mt-4">
                <DyraneButton asChild>
                  <Link href={topic.href}>
                    Read More
                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </DyraneButton>
              </div>
            </DyraneCardContent>
          </DyraneCard>
        ))}
      </div>

      {/* Learning Paths */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold">Recommended Learning Paths</h2>
        <Separator className="my-2" />
        <p className="text-muted-foreground mb-6">
          Follow these suggested paths to get the most out of the courses section:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningPaths.map((path, index) => (
            <div key={index} className="bg-muted/30 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">{path.title}</h3>
              <p className="text-muted-foreground mb-4">{path.description}</p>
              <ol className="space-y-4">
                {path.steps.map((step, stepIndex) => (
                  <li key={stepIndex} className="flex items-start">
                    <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center mr-3">
                      {stepIndex + 1}
                    </div>
                    <div>
                      <Link 
                        href={step.href}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {step.title}
                      </Link>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        <Separator className="my-2" />
        
        <div className="space-y-4 mt-6">
          <div>
            <h3 className="text-lg font-medium">Can I enroll in multiple courses at once?</h3>
            <p className="text-muted-foreground mt-1">
              Yes, you can enroll in multiple courses simultaneously. However, we recommend considering your available 
              time and commitments before enrolling in too many courses at once.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Are there prerequisites for courses?</h3>
            <p className="text-muted-foreground mt-1">
              Some courses may have prerequisites, which will be clearly listed on the course details page. 
              Make sure to check these requirements before enrolling.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Can I get a refund if I change my mind about a course?</h3>
            <p className="text-muted-foreground mt-1">
              Refund policies vary by course. Generally, refunds are available within 7 days of enrollment if you 
              haven't accessed more than 25% of the course content. Check the specific refund policy on the course 
              details page.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">How long do I have access to course materials?</h3>
            <p className="text-muted-foreground mt-1">
              Access duration varies by course. Most courses provide access for at least 6 months after enrollment, 
              while some offer lifetime access. The access period is specified on the course details page.
            </p>
          </div>
        </div>
      </div>

      {/* Related Categories */}
      <div className="mt-12 bg-muted p-6 rounded-lg">
        <h2 className="text-xl font-bold">Related Categories</h2>
        <p className="text-muted-foreground mt-2 mb-4">
          Explore these related help categories to enhance your learning experience:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DyraneButton variant="outline" asChild>
            <Link href="/help/attendance">
              <ChevronRight className="h-4 w-4 mr-2" />
              Attendance
            </Link>
          </DyraneButton>
          <DyraneButton variant="outline" asChild>
            <Link href="/help/timetable">
              <ChevronRight className="h-4 w-4 mr-2" />
              Timetable
            </Link>
          </DyraneButton>
          <DyraneButton variant="outline" asChild>
            <Link href="/help/discussions">
              <ChevronRight className="h-4 w-4 mr-2" />
              Discussions
            </Link>
          </DyraneButton>
          <DyraneButton variant="outline" asChild>
            <Link href="/help/payments">
              <ChevronRight className="h-4 w-4 mr-2" />
              Payments
            </Link>
          </DyraneButton>
        </div>
      </div>
    </div>
  );
}
