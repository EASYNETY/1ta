'use client'

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Layout, 
  Sidebar, 
  Menu, 
  Search, 
  Bell, 
  User, 
  Settings, 
  Home, 
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
    title: 'Platform Overview', 
    href: '/help/getting-started/overview',
    description: 'Learn about the core features and functionality of the platform'
  },
  { 
    title: 'Setting Up Your Account', 
    href: '/help/getting-started/account-setup',
    description: 'Complete your profile and configure your account settings'
  },
  { 
    title: 'Course Enrolment', 
    href: '/help/courses/enrolment',
    description: 'Learn how to browse and enrol in courses'
  },
];

export default function NavigationHelpPage() {
  return (
    <article className="mx-auto space-y-6">
      <ArticleHeader
        title="Navigating the Interface"
        icon={Layout}
        description="Learn how to navigate through different sections of the platform and find what you need."
        breadcrumbs={[
          { label: 'Help Center', href: '/help' },
          { label: 'Getting Started', href: '/help/getting-started' },
          { label: 'Navigating the Interface' },
        ]}
      />

      {/* Table of Contents */}
      <TableOfContents />

      {/* Introduction */}
      <p className="text-lg">
        The 1Tech Academy platform features an intuitive interface designed to help you quickly access all features and information.
        This guide will help you understand the main navigation elements and how to efficiently move around the platform.
      </p>

      <HelpCallout type="tip" title="Quick Tip">
        You can use keyboard shortcuts to navigate faster. Press <kbd>?</kbd> anywhere in the application to see available shortcuts.
      </HelpCallout>

      {/* Main Navigation */}
      <h2 id="main-navigation" className="text-2xl font-bold mt-8">Main Navigation</h2>
      <Separator className="my-2" />
      <p>
        The main navigation is located on the left side of the screen and provides access to all major sections of the platform.
        It's always accessible, allowing you to quickly switch between different areas.
      </p>

      <div className="my-6">
        <HelpImage 
          src="/images/help/main-navigation.jpg" 
          alt="Main Navigation Sidebar"
          caption="The main navigation sidebar with labeled sections"
        />
      </div>

      <h3 className="text-xl font-semibold mt-6">Sidebar Sections</h3>
      <p className="mt-2">The sidebar is organized into logical groups:</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Home className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Dashboard</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Your starting point with an overview of your courses, upcoming events, and recent activities.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Learning</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Access your courses, assignments, grades, and learning resources.
          </p>
        </div>

        {/* Add more sections as needed */}
      </div>

      <HelpCallout type="note" title="Mobile Navigation">
        On mobile devices, the sidebar collapses into a menu that can be accessed by tapping the menu icon in the top-left corner.
      </HelpCallout>

      {/* Header Navigation */}
      <h2 id="header-navigation" className="text-2xl font-bold mt-8">Header Navigation</h2>
      <Separator className="my-2" />
      <p>
        The header bar at the top of the screen contains quick access tools and user-specific functions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Search</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Quickly find courses, users, or content across the platform.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Notifications</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Stay updated with course announcements, assignment deadlines, and system messages.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-5 w-5 text-primary" />
            <h4 className="font-medium">User Menu</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Access your profile, account settings, and logout option.
          </p>
        </div>
      </div>

      {/* Role-specific content */}
      <RoleContent
        studentContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Students</h3>
            <p>
              As a student, you'll primarily use the Learning section to access your courses and assignments.
              The Dashboard provides a quick overview of your upcoming deadlines and recent activities.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Check the <strong>My Courses</strong> section regularly to access your enroled courses</li>
              <li>Use the <strong>Calendar</strong> view to see all your scheduled classes and assignment deadlines</li>
              <li>The <strong>Notifications</strong> bell will alert you to important announcements and updates</li>
            </ul>
          </div>
        }
        teacherContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Teachers</h3>
            <p>
              Teachers have access to additional sections for managing courses, tracking student progress, and handling administrative tasks.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The <strong>Course Management</strong> section allows you to create and edit course content</li>
              <li>Use the <strong>Attendance</strong> tools to track student participation</li>
              <li>The <strong>Gradebook</strong> provides tools for assessing student work and providing feedback</li>
            </ul>
          </div>
        }
        adminContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Administrators</h3>
            <p>
              Administrators have full access to all platform features, including user management and system settings.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The <strong>Admin Dashboard</strong> provides system-wide statistics and alerts</li>
              <li>Use the <strong>User Management</strong> section to manage accounts and permissions</li>
              <li>Access <strong>System Settings</strong> to configure platform behavior and appearance</li>
            </ul>
          </div>
        }
      />

      {/* Page Navigation */}
      <h2 id="page-navigation" className="text-2xl font-bold mt-8">Page Navigation</h2>
      <Separator className="my-2" />
      <p>
        Within each section, you'll find consistent navigation patterns to help you move between related pages and content.
      </p>

      <StepByStepGuide title="Finding Your Way Around" description="Common navigation patterns you'll encounter:">
        <Step number={1} title="Breadcrumbs">
          Breadcrumb trails at the top of pages show your current location and allow you to navigate back to parent pages.
        </Step>
        <Step number={2} title="Tabs">
          Many pages use tabs to organize related content into easily accessible sections.
        </Step>
        <Step number={3} title="Action Buttons">
          Look for primary action buttons (usually in green) that indicate the main actions available on each page.
        </Step>
        <Step number={4} title="Back Links">
          Most detail pages include a back button to return to the previous view.
        </Step>
      </StepByStepGuide>

      {/* Related Topics */}
      <RelatedTopics topics={relatedTopics} />

      {/* Article Footer with feedback */}
      <ArticleFooter />
    </article>
  );
}
