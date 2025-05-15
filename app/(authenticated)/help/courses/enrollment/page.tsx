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
    description: 'Learn how to access course content after enrollment'
  },
  { 
    title: 'Tracking Your Progress', 
    href: '/help/courses/progress',
    description: 'Monitor your learning journey and achievements'
  },
  { 
    title: 'Payment Methods', 
    href: '/help/payments/methods',
    description: 'Available payment options for course enrollment'
  },
];

export default function CourseEnrollmentPage() {
  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <ArticleHeader
        title="Course Enrollment"
        icon={GraduationCap}
        description="Learn how to browse, select, and enroll in courses on the platform."
        breadcrumbs={[
          { label: 'Help Center', href: '/help' },
          { label: 'Courses', href: '/help/courses' },
          { label: 'Course Enrollment' },
        ]}
      />

      <div className="flex flex-col md:flex-row gap-6">
        <article className="flex-1 space-y-6">
          <p>
            Enrolling in courses is a straightforward process that allows you to gain access to educational content, 
            participate in classes, and track your progress. This guide will walk you through the steps to find and 
            enroll in courses that match your interests and goals.
          </p>

          <HelpImage 
            src="/images/help/course-enrollment.jpg" 
            alt="Course enrollment page showing available courses"
            caption="The course catalog page displaying available courses for enrollment"
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
            revisit them later when you're ready to enroll.
          </HelpCallout>

          <h2 id="enrollment-process" className="text-2xl font-bold mt-8">Enrollment Process</h2>
          <Separator className="my-2" />

          <StepByStepGuide title="How to Enroll in a Course" description="Follow these steps to successfully enroll in a course:">
            <Step number={1} title="Select a Course">
              Browse the course catalog and click on a course card to view its details. Review the course description, 
              curriculum, instructor information, and student reviews to ensure it meets your needs.
              
              <HelpImage 
                src="/images/help/course-details.jpg" 
                alt="Course details page"
                caption="Course details page showing curriculum, instructor, and enrollment options"
                className="mt-4"
              />
            </Step>
            
            <Step number={2} title="Choose an Enrollment Option">
              On the course details page, you'll see enrollment options such as different sessions, 
              schedules, or pricing plans. Select the option that best fits your schedule and budget.
            </Step>
            
            <Step number={3} title="Add to Cart">
              Click the "Add to Cart" button to add the course to your shopping cart. You can continue 
              browsing and add more courses if desired.
              
              <HelpCallout type="note" title="Note" className="mt-4">
                Some courses may have a "Enroll Now" button that bypasses the cart and takes you directly to checkout.
              </HelpCallout>
            </Step>
            
            <Step number={4} title="Proceed to Checkout">
              Click on the cart icon in the navigation bar and review your selected courses. When ready, 
              click "Proceed to Checkout" to continue.
            </Step>
            
            <Step number={5} title="Complete Payment">
              Enter your payment details and complete the transaction. The platform supports various payment 
              methods including credit/debit cards and online payment services.
            </Step>
            
            <Step number={6} title="Access Your Course">
              After successful payment, you'll receive a confirmation and the course will be added to your 
              enrolled courses. You can access it immediately from your Dashboard or Courses section.
            </Step>
          </StepByStepGuide>

          <h2 id="role-specific-information" className="text-2xl font-bold mt-8">Role-Specific Information</h2>
          <Separator className="my-2" />

          <RoleContent
            studentContent={
              <div className="space-y-4">
                <h3 className="text-lg font-medium">For Students</h3>
                <p>
                  As a student, you can enroll in any available course that matches your interests. Keep these points in mind:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Check course prerequisites to ensure you meet the requirements</li>
                  <li>Review the schedule to confirm you can attend the sessions</li>
                  <li>Consider your workload before enrolling in multiple courses simultaneously</li>
                  <li>Some courses offer a preview or free introduction to help you decide</li>
                </ul>
                <HelpCallout type="tip">
                  If you're unsure about a course, check the reviews from other students or reach out to the instructor 
                  with specific questions before enrolling.
                </HelpCallout>
              </div>
            }
            teacherContent={
              <div className="space-y-4">
                <h3 className="text-lg font-medium">For Teachers</h3>
                <p>
                  As a teacher, you can view enrollment statistics for your courses and manage student access:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Monitor enrollment numbers from your Teacher Dashboard</li>
                  <li>Review student profiles as they enroll in your courses</li>
                  <li>Set enrollment caps or prerequisites for your courses</li>
                  <li>Manually approve enrollments if you've enabled this option</li>
                </ul>
                <HelpCallout type="important">
                  If you need to make changes to your course after students have enrolled, be sure to notify them 
                  through the platform's messaging system.
                </HelpCallout>
              </div>
            }
            adminContent={
              <div className="space-y-4">
                <h3 className="text-lg font-medium">For Administrators</h3>
                <p>
                  As an administrator, you have full control over course enrollments:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Manage enrollment periods and availability for all courses</li>
                  <li>Override enrollment restrictions when necessary</li>
                  <li>Process refunds or transfers between courses</li>
                  <li>Generate enrollment reports and analytics</li>
                  <li>Manually enroll or remove students from courses</li>
                </ul>
                <HelpCallout type="warning">
                  When manually enrolling students, ensure that payment records are properly updated to maintain 
                  accurate financial reporting.
                </HelpCallout>
              </div>
            }
          />

          <h2 id="troubleshooting" className="text-2xl font-bold mt-8">Troubleshooting Enrollment Issues</h2>
          <Separator className="my-2" />
          
          <p>
            If you encounter any issues during the enrollment process, try these solutions:
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
              <h3 className="font-medium">Course Full</h3>
              <p className="text-muted-foreground">
                Some courses have limited seats. If a course is full, you can join the waitlist to be notified 
                when a spot becomes available.
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
            If you continue to experience issues with course enrollment, please contact our support team through 
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
