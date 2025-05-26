"use client";

import React from 'react';
import { GraduationCap, ShoppingCart, CreditCard, CheckCircle } from 'lucide-react';
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

// Define related topics
const relatedTopics = [
  {
    title: 'Accessing Course Materials',
    href: '/help/courses/materials',
    description: 'Learn how to access course content after enrolment'
  },
  {
    title: 'Tracking Your Progress',
    href: '/help/courses/progress',
    description: 'Monitor your learning journey and achievements'
  },
  {
    title: 'Payment Methods',
    href: '/help/payments/methods',
    description: 'Available payment options for course enrolment'
  },
];

export default function CourseEnrollmentPage() {
  return (
    <div className="mx-auto py-6 space-y-6">
      <ArticleHeader
        title="Course Enrolment"
        icon={GraduationCap}
        description="Learn how to browse, select, and enrol in courses on the platform."
        breadcrumbs={[
          { label: 'Help Center', href: '/help' },
          { label: 'Courses', href: '/help/courses' },
          { label: 'Course Enrolment' },
        ]}
      />

      <div className="flex flex-col md:flex-row gap-6">
        <article className="flex-1 space-y-6">
          <p>
            Enrolling in courses is a straightforward process that allows you to gain access to educational content,
            participate in classes, and track your progress. This guide will walk you through the steps to find courses
            and enrol in specific class sessions that match your interests, goals, and schedule.
          </p>

          <HelpCallout type="important" title="Course vs. Class Enrolment">
            Our platform uses a class-based enrolment system. This means you don't just enrol in a course;
            you enrol in a specific class session of that course. Each class has its own schedule, instructor,
            and limited number of available slots.
          </HelpCallout>

          <HelpImage
            src="/images/help/course-enrolment.jpg"
            alt="Course enrolment page showing available courses"
            caption="The course catalog page displaying available courses for enrolment"
          />

          <h2 id="finding-courses" className="text-2xl font-bold mt-8">Finding Courses</h2>
          <Separator className="my-2" />
          <p>
            Before enrolling, you'll need to browse and find courses that interest you. The platform offers
            multiple ways to discover courses:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>
              <strong>Course Catalog:</strong> Navigate to the Courses section from the main sidebar to view all available courses.
            </li>
            <li>
              <strong>Search:</strong> Use the search function to find specific courses by title, subject, or instructor.
            </li>
            <li>
              <strong>Filters:</strong> Apply filters to narrow down courses by category, difficulty level, or duration.
            </li>
            <li>
              <strong>Featured Courses:</strong> Check the Dashboard for featured or recommended courses.
            </li>
          </ul>

          <HelpCallout type="tip" title="Quick Tip">
            You can save courses to your wishlist by clicking the bookmark icon on a course card. This allows you to
            revisit them later when you're ready to enrol.
          </HelpCallout>

          <h2 id="enrolment-process" className="text-2xl font-bold mt-8">Enrolment Process</h2>
          <Separator className="my-2" />

          <StepByStepGuide title="How to Enrol in a Course" description="Follow these steps to successfully enrol in a course:">
            <Step number={1} title="Select a Course">
              Browse the course catalog and click on a course card to view its details. Review the course description,
              curriculum, instructor information, and student reviews to ensure it meets your needs.

              <HelpImage
                src="/images/help/course-details.jpg"
                alt="Course details page"
                caption="Course details page showing curriculum, instructor, and enrolment options"
                className="mt-4"
              />
            </Step>

            <Step number={2} title="View Available Classes">
              On the course details page, you'll see a list of available class sessions for this course.
              Each class will display:
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Schedule (days and times)</li>
                <li>Start and end dates</li>
                <li>Instructor name</li>
                <li>Location (physical or virtual)</li>
                <li>Available slots</li>
                <li>Enrolment status (open or closed)</li>
              </ul>
            </Step>

            <Step number={3} title="Select a Class">
              Review the available classes and select one that fits your schedule. Note that:
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Classes have limited slots that fill on a first-come, first-served basis</li>
                <li>Some classes may be full (no available slots)</li>
                <li>Some classes may not be open for enrolment yet</li>
                <li>Different classes may have different instructors or schedules</li>
              </ul>

              <HelpCallout type="tip" title="Tip" className="mt-4">
                If a class is full, check back regularly as slots may open up if other students unenroll.
              </HelpCallout>
            </Step>

            <Step number={4} title="Add to Cart">
              Click the "Add to Cart" button to add the selected class to your shopping cart. You can continue
              browsing and add more classes if desired.

              <HelpCallout type="note" title="Note" className="mt-4">
                Some classes may have an "Enrol Now" button that bypasses the cart and takes you directly to checkout.
              </HelpCallout>
            </Step>

            <Step number={5} title="Proceed to Checkout">
              Click on the cart icon in the navigation bar and review your selected classes. When ready,
              click "Proceed to Checkout" to continue.
            </Step>

            <Step number={6} title="Complete Payment">
              Enter your payment details and complete the transaction. The platform supports various payment
              methods including credit/debit cards and online payment services.
            </Step>

            <Step number={7} title="Access Your Class">
              After successful payment, you'll receive a confirmation and the class will be added to your
              enrolled classes. You can access it immediately from your Dashboard, Courses section, or Timetable.
            </Step>
          </StepByStepGuide>

          <h2 id="role-specific-information" className="text-2xl font-bold mt-8">Role-Specific Information</h2>
          <Separator className="my-2" />

          <RoleContent
            defaultTab="student"
            studentContent={
              <div className="space-y-4">
                <h3 className="text-lg font-medium">For Students</h3>
                <p>
                  As a student, you can enrol in any available class that matches your interests and schedule. Keep these points in mind:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Check course prerequisites to ensure you meet the requirements</li>
                  <li>Review the class schedule to confirm you can attend all sessions</li>
                  <li>Check that the class has available slots before attempting to enrol</li>
                  <li>Verify that enrolment is open for the class (some classes have specific enrolment start dates)</li>
                  <li>Consider your workload before enrolling in multiple classes simultaneously</li>
                  <li>Some courses offer a preview or free introduction to help you decide</li>
                </ul>
                <HelpCallout type="tip">
                  If you're unsure about a course or class, check the reviews from other students or reach out to the instructor
                  with specific questions before enrolling.
                </HelpCallout>
              </div>
            }
            teacherContent={
              <div className="space-y-4">
                <h3 className="text-lg font-medium">For Teachers</h3>
                <p>
                  As a teacher, you can view enrolment statistics for your classes and manage student access:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Monitor available slots and enrolment numbers from your Teacher Dashboard</li>
                  <li>Review student profiles as they enrol in your classes</li>
                  <li>Set maximum slots for your classes to control enrolment capacity</li>
                  <li>Set enrolment start dates to control when students can begin enrolling</li>
                  <li>Configure class visibility (public, private, etc.) to control who can see and enrol in your classes</li>
                  <li>Manually approve enrolments if you've enabled this option</li>
                </ul>
                <HelpCallout type="important">
                  If you need to make changes to your class after students have enrolled, be sure to notify them
                  through the platform's messaging system, especially if the schedule or location changes.
                </HelpCallout>
              </div>
            }
            adminContent={
              <div className="space-y-4">
                <h3 className="text-lg font-medium">For Administrators</h3>
                <p>
                  As an administrator, you have full control over class enrolments:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Manage enrolment settings for all classes (slots, visibility, start dates)</li>
                  <li>Override slot limitations when necessary</li>
                  <li>Process refunds or transfers between classes</li>
                  <li>Generate enrolment reports and analytics</li>
                  <li>Manually enrol or remove students from classes</li>
                  <li>Adjust maximum slots for classes based on demand</li>
                </ul>
                <HelpCallout type="warning">
                  When manually enrolling students, ensure that:
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>The class has available slots or you override the slot limitation</li>
                    <li>Payment records are properly updated to maintain accurate financial reporting</li>
                    <li>The student is notified about their enrolment</li>
                  </ul>
                </HelpCallout>
              </div>
            }
          />

          <h2 id="troubleshooting" className="text-2xl font-bold mt-8">Troubleshooting Enrolment Issues</h2>
          <Separator className="my-2" />

          <p>
            If you encounter any issues during the enrolment process, try these solutions:
          </p>

          <div className="space-y-4 mt-4">
            <div>
              <h3 className="font-medium">Payment Declined</h3>
              <p className="text-muted-foreground">
                If your payment is declined, verify your payment details and ensure you have sufficient funds.
                If the issue persists, try a different payment method or contact your bank.
              </p>
            </div>

            <div>
              <h3 className="font-medium">Class Has No Available Slots</h3>
              <p className="text-muted-foreground">
                Classes have a limited number of slots. If a class is full (0 available slots), you can:
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Check other class sessions for the same course</li>
                  <li>Join the waitlist if available</li>
                  <li>Check back regularly as slots may open if other students unenroll</li>
                  <li>Contact the administrator to request an exception</li>
                </ul>
              </p>
            </div>

            <div>
              <h3 className="font-medium">Enrolment Not Yet Open</h3>
              <p className="text-muted-foreground">
                Some classes have specific enrolment start dates. If enrolment is not yet open, you'll see this
                indicated on the class details. Make a note of the enrolment start date and return when enrolment opens.
              </p>
            </div>

            <div>
              <h3 className="font-medium">Technical Errors</h3>
              <p className="text-muted-foreground">
                If you encounter technical errors, try refreshing the page, clearing your browser cache, or using
                a different browser. If problems persist, contact support.
              </p>
            </div>
          </div>

          <HelpCallout type="important" title="Need Assistance?">
            If you continue to experience issues with course enrolment, please contact our support team through
            the Support section in your account or by clicking <a href="/support/create" className="text-primary hover:underline">here</a>.
          </HelpCallout>
        </article>

        <aside className="w-full md:w-64 space-y-6">
          <TableOfContents />

          <RelatedTopics topics={relatedTopics} />
        </aside>
      </div>

      <ArticleFooter
        previousArticle={{
          title: "Platform Overview",
          href: "/help/getting-started/overview"
        }}
        nextArticle={{
          title: "Accessing Course Materials",
          href: "/help/courses/materials"
        }}
        categoryLink={{
          title: "Courses",
          href: "/help/courses"
        }}
      />
    </div>
  );
}
