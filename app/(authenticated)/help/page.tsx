"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CircleHelp, ChevronRight, BookOpen, GraduationCap, Users, Calendar, CheckCircle, MessageSquare, CreditCard, Settings, User, Bell } from 'lucide-react';
import { DyraneCard, DyraneCardContent, DyraneCardDescription, DyraneCardFooter, DyraneCardHeader, DyraneCardTitle } from '@/components/dyrane-ui/dyrane-card';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { HelpSearch } from '@/components/help';
// This import ensures the help content is properly indexed for search

// Define the help categories and topics
const helpCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    description: 'Learn the basics of using the platform',
    topics: [
      { id: 'overview', title: 'Platform Overview', href: '/help/getting-started/overview' },
      { id: 'navigation', title: 'Navigating the Interface', href: '/help/getting-started/navigation' },
      { id: 'account-setup', title: 'Setting Up Your Account', href: '/help/getting-started/account-setup' },
    ]
  },
  {
    id: 'courses',
    title: 'Courses',
    icon: GraduationCap,
    description: 'Everything about courses and learning',
    topics: [
      { id: 'enrolment', title: 'Course Enrolment', href: '/help/courses/enrolment' },
      { id: 'materials', title: 'Accessing Course Materials', href: '/help/courses/materials' },
      { id: 'progress', title: 'Tracking Your Progress', href: '/help/courses/progress' },
    ]
  },
  {
    id: 'attendance',
    title: 'Attendance',
    icon: CheckCircle,
    description: 'Managing and tracking attendance',
    topics: [
      { id: 'marking', title: 'Marking Attendance', href: '/help/attendance/marking' },
      { id: 'scanning', title: 'Using the Barcode Scanner', href: '/help/attendance/scanning' },
      { id: 'customer-care-scanning', title: 'Customer Care Scanning', href: '/help/attendance/customer-care-scanning' },
      { id: 'reports', title: 'Attendance Reports', href: '/help/attendance/reports' },
    ]
  },
  {
    id: 'timetable',
    title: 'Timetable',
    icon: Calendar,
    description: 'Understanding your schedule',
    topics: [
      { id: 'viewing', title: 'Viewing Your Schedule', href: '/help/timetable/viewing' },
      { id: 'events', title: 'Event Types', href: '/help/timetable/events' },
      { id: 'notifications', title: 'Schedule Notifications', href: '/help/timetable/notifications' },
    ]
  },
  {
    id: 'discussions',
    title: 'Discussions',
    icon: MessageSquare,
    description: 'Communicating with peers and instructors',
    topics: [
      { id: 'chatrooms', title: 'Using Chatrooms', href: '/help/discussions/chatrooms' },
      { id: 'messaging', title: 'Direct Messaging', href: '/help/discussions/messaging' },
      { id: 'etiquette', title: 'Communication Guidelines', href: '/help/discussions/etiquette' },
    ]
  },
  {
    id: 'payments',
    title: 'Payments',
    icon: CreditCard,
    description: 'Managing payments and billing',
    topics: [
      { id: 'methods', title: 'Payment Methods', href: '/help/payments/methods' },
      { id: 'history', title: 'Payment History', href: '/help/payments/history' },
      { id: 'receipts', title: 'Receipts and Invoices', href: '/help/payments/receipts' },
    ]
  },
  {
    id: 'account',
    title: 'Account Management',
    icon: User,
    description: 'Managing your profile and settings',
    topics: [
      { id: 'profile', title: 'Updating Your Profile', href: '/help/account/profile' },
      { id: 'settings', title: 'Account Settings', href: '/help/account/settings' },
      { id: 'notifications', title: 'Notification Preferences', href: '/help/account/notifications' },
    ]
  },
];

// Popular topics for quick access
const popularTopics = [
  { title: 'How to enrol in a course', href: '/help/courses/enrolment' },
  { title: 'Marking attendance', href: '/help/attendance/marking' },
  { title: 'Viewing your schedule', href: '/help/timetable/viewing' },
  { title: 'Payment methods', href: '/help/payments/methods' },
  { title: 'Updating your profile', href: '/help/account/profile' },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  // Filter categories based on search query
  const filteredCategories = searchQuery
    ? helpCategories.filter(category =>
        category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.topics.some(topic =>
          topic.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : helpCategories;

  return (
    <div className="mx-auto space-y-8 py-4 sm:py-0 sm:px-4">
      <div className="flex items-center gap-2 mb-4">
        <CircleHelp className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Help Center</h1>
      </div>

      <p className="text-muted-foreground max-w-3xl">
        Welcome to the Help Center! Here you'll find everything you need to understand and navigate the platform with ease.
        From getting started guides to in-depth feature explanations, this space is designed to support all users—whether you're a student, teacher, admin, or team member.
      </p>

      {/* Search Bar */}
      <div className="max-w-xl">
        <HelpSearch
          variant="dialog"
          placeholder="Search for help topics..."
          onSearch={(query) => setSearchQuery(query)}
        />
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="popular">Popular Topics</TabsTrigger>
        </TabsList>

        {/* Categories View */}
        <TabsContent value="categories" className="space-y-6">
          {filteredCategories.length === 0 ? (
            <p className="text-muted-foreground">No help topics found for "{searchQuery}"</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <DyraneCard key={category.id} className="h-full">
                  <DyraneCardHeader>
                    <div className="flex items-center gap-2">
                      <category.icon className="h-5 w-5 text-primary" />
                      <DyraneCardTitle>{category.title}</DyraneCardTitle>
                    </div>
                    <DyraneCardDescription>{category.description}</DyraneCardDescription>
                  </DyraneCardHeader>
                  <DyraneCardContent>
                    <ul className="space-y-2">
                      {category.topics.map((topic) => (
                        <li key={topic.id}>
                          <Link
                            href={topic.href}
                            className="flex items-center text-sm hover:text-primary transition-colors"
                          >
                            <ChevronRight className="h-4 w-4 mr-1" />
                            {topic.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </DyraneCardContent>
                  <DyraneCardFooter>
                    <DyraneButton
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <Link href={`/help/${category.id}`}>
                        View All {category.title} Topics
                      </Link>
                    </DyraneButton>
                  </DyraneCardFooter>
                </DyraneCard>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Popular Topics View */}
        <TabsContent value="popular">
          <DyraneCard>
            <DyraneCardHeader>
              <DyraneCardTitle>Popular Help Topics</DyraneCardTitle>
              <DyraneCardDescription>
                Frequently accessed help articles and guides
              </DyraneCardDescription>
            </DyraneCardHeader>
            <DyraneCardContent>
              <ul className="space-y-4">
                {popularTopics.map((topic, index) => (
                  <li key={index}>
                    <Link
                      href={topic.href}
                      className="flex items-center hover:text-primary transition-colors"
                    >
                      <ChevronRight className="h-5 w-5 mr-2 text-primary" />
                      <span>{topic.title}</span>
                    </Link>
                    <Separator className="mt-2" />
                  </li>
                ))}
              </ul>
            </DyraneCardContent>
          </DyraneCard>
        </TabsContent>
      </Tabs>

      {/* Contact Support Section */}
      <div className="mt-8">
        <DyraneCard>
          <DyraneCardHeader>
            <DyraneCardTitle>Need More Help?</DyraneCardTitle>
            <DyraneCardDescription>
              Can't find what you're looking for? Our support team is just a click away.
            </DyraneCardDescription>
          </DyraneCardHeader>
          <DyraneCardContent className="flex flex-col sm:flex-row gap-4">
            <DyraneButton asChild>
              <Link href="/support/create">Contact Support</Link>
            </DyraneButton>
            <DyraneButton variant="outline" asChild>
              <Link href="/support/feedback/create">Submit Feedback</Link>
            </DyraneButton>
          </DyraneCardContent>
        </DyraneCard>
      </div>
    </div>
  );
}
