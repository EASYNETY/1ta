"use client";

import React from 'react';
import Link from 'next/link';
import { CircleHelp, ChevronRight, ArrowLeft, BookOpen, GraduationCap, CheckCircle, Calendar, MessageSquare, CreditCard, User } from 'lucide-react';
import { DyraneCard, DyraneCardContent, DyraneCardDescription, DyraneCardHeader, DyraneCardTitle } from '@/components/dyrane-ui/dyrane-card';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Related topics for this help article
const relatedTopics = [
  { title: 'Navigating the Interface', href: '/help/getting-started/navigation' },
  { title: 'Setting Up Your Account', href: '/help/getting-started/account-setup' },
  { title: 'Course Enrollment', href: '/help/courses/enrollment' },
];

export default function PlatformOverviewPage() {
  return (
    <div className="mx-auto py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/help">Help Center</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/help/getting-started">Getting Started</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Platform Overview</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Article Header */}
      <div className="flex items-center gap-2">
        <CircleHelp className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Platform Overview</h1>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">For Students</TabsTrigger>
          <TabsTrigger value="facilitators">For Facilitators</TabsTrigger>
          <TabsTrigger value="admins">For Admins</TabsTrigger>
        </TabsList>

        {/* General Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <p className="text-lg">
            Welcome to the 1Tech Academy platform! This comprehensive learning management system is designed to facilitate education,
            track progress, and connect students with teachers in a seamless digital environment.
          </p>

          <Alert>
            <CircleHelp className="h-4 w-4" />
            <AlertTitle>Quick Tip</AlertTitle>
            <AlertDescription>
              You can access the Help Center anytime by clicking on the Help icon in the Account & Help section of the sidebar.
            </AlertDescription>
          </Alert>

          <h2 className="text-2xl font-bold mt-6">Core Features</h2>
          <Separator className="my-2" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FeatureCard
              icon={GraduationCap}
              title="Courses"
              description="Browse, enrol, and access course materials all in one place."
              href="/help/courses"
            />
            <FeatureCard
              icon={CheckCircle}
              title="Attendance"
              description="Track and manage class attendance with barcode scanning."
              href="/help/attendance"
            />
            <FeatureCard
              icon={Calendar}
              title="Timetable"
              description="View your schedule and upcoming classes."
              href="/help/timetable"
            />
            <FeatureCard
              icon={MessageSquare}
              title="Discussions"
              description="Communicate with peers and instructors through chat."
              href="/help/discussions"
            />
            <FeatureCard
              icon={CreditCard}
              title="Payments"
              description="Manage course payments and view transaction history."
              href="/help/payments"
            />
            <FeatureCard
              icon={User}
              title="Account Management"
              description="Update your profile and manage account settings."
              href="/help/account"
            />
          </div>

          <h2 className="text-2xl font-bold mt-6">Getting Started</h2>
          <Separator className="my-2" />
          <p>
            To get the most out of the platform, we recommend following these steps:
          </p>
          <ol className="list-decimal pl-6 space-y-2 mt-2">
            <li>Complete your profile with accurate information</li>
            <li>Explore available courses and enrol in those that interest you</li>
            <li>Check your timetable to see your scheduled classes</li>
            <li>Join the discussion forums to connect with peers and instructors</li>
            <li>Set up your notification preferences to stay informed</li>
          </ol>
        </TabsContent>

        {/* Student-specific Tab */}
        <TabsContent value="students" className="space-y-6">
          <h2 className="text-2xl font-bold">For Students</h2>
          <p>
            As a student, the platform provides you with all the tools you need to succeed in your educational journey.
          </p>

          <h3 className="text-xl font-semibold mt-4">Key Features for Students</h3>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Browse and enrol in courses</li>
            <li>Access course materials and resources</li>
            <li>Track your attendance and progress</li>
            <li>View your class schedule</li>
            <li>Communicate with instructors and peers</li>
            <li>Manage payments and view receipts</li>
          </ul>

          <Alert className="mt-4">
            <BookOpen className="h-4 w-4" />
            <AlertTitle>Student Tip</AlertTitle>
            <AlertDescription>
              Make sure to regularly check your timetable for any schedule changes and enable notifications to stay updated.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Facilitator-specific Tab */}
        <TabsContent value="facilitators" className="space-y-6">
          <h2 className="text-2xl font-bold">For Facilitators</h2>
          <p>
            As a facilitator, the platform equips you with tools to effectively manage your classes and engage with students.
          </p>

          <h3 className="text-xl font-semibold mt-4">Key Features for Facilitators</h3>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Manage course content and materials</li>
            <li>Track student attendance</li>
            <li>View your facilitation schedule</li>
            <li>Communicate with students through chat</li>
            <li>Monitor student progress</li>
          </ul>

          <Alert className="mt-4">
            <BookOpen className="h-4 w-4" />
            <AlertTitle>Teacher Tip</AlertTitle>
            <AlertDescription>
              Use the attendance scanning feature to quickly mark attendance for your classes.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Admin-specific Tab */}
        <TabsContent value="admins" className="space-y-6">
          <h2 className="text-2xl font-bold">For Administrators</h2>
          <p>
            As an administrator, you have access to powerful tools to manage the entire platform.
          </p>

          <h3 className="text-xl font-semibold mt-4">Key Features for Administrators</h3>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Manage users (students, facilitators)</li>
            <li>Create and manage courses</li>
            <li>Monitor attendance and generate reports</li>
            <li>Handle support tickets</li>
            <li>Process payments and refunds</li>
            <li>Access system-wide analytics</li>
          </ul>

          <Alert className="mt-4">
            <BookOpen className="h-4 w-4" />
            <AlertTitle>Admin Tip</AlertTitle>
            <AlertDescription>
              Regularly check the support tickets to address user issues promptly.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      {/* Related Topics */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold">Related Topics</h3>
        <Separator className="my-2" />
        <ul className="space-y-2 mt-2">
          {relatedTopics.map((topic, index) => (
            <li key={index}>
              <Link
                href={topic.href}
                className="flex items-center text-sm hover:text-primary transition-colors"
              >
                <ChevronRight className="h-4 w-4 mr-1 text-primary" />
                {topic.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <DyraneButton variant="outline" asChild>
          <Link href="/help/getting-started">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Getting Started
          </Link>
        </DyraneButton>
        <DyraneButton asChild>
          <Link href="/help/getting-started/navigation">
            Next: Navigating the Interface
            <ChevronRight className="h-4 w-4 ml-2" />
          </Link>
        </DyraneButton>
      </div>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon: Icon, title, description, href }: {
  icon: React.ElementType,
  title: string,
  description: string,
  href: string
}) {
  return (
    <DyraneCard className="h-full">
      <DyraneCardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <DyraneCardTitle>{title}</DyraneCardTitle>
        </div>
      </DyraneCardHeader>
      <DyraneCardContent>
        <DyraneCardDescription>{description}</DyraneCardDescription>
        <Link
          href={href}
          className="text-sm text-primary hover:underline mt-2 inline-block"
        >
          Learn more
        </Link>
      </DyraneCardContent>
    </DyraneCard>
  );
}
