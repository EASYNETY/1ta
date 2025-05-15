"use client";

import React from 'react';
import Link from 'next/link';
import { CircleHelp, ChevronRight, ArrowLeft, BookOpen } from 'lucide-react';
import { DyraneCard, DyraneCardContent, DyraneCardDescription, DyraneCardHeader, DyraneCardTitle } from '@/components/dyrane-ui/dyrane-card';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

// Define the topics for this category
const topics = [
  { 
    id: 'overview', 
    title: 'Platform Overview', 
    description: 'Learn about the core features and functionality of the platform.',
    href: '/help/getting-started/overview' 
  },
  { 
    id: 'navigation', 
    title: 'Navigating the Interface', 
    description: 'Understand how to navigate through different sections of the platform.',
    href: '/help/getting-started/navigation' 
  },
  { 
    id: 'account-setup', 
    title: 'Setting Up Your Account', 
    description: 'Complete your profile and configure your account settings.',
    href: '/help/getting-started/account-setup' 
  },
];

export default function GettingStartedPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/help">Help Center</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Getting Started</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Category Header */}
      <div className="flex items-center gap-2">
        <BookOpen className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Getting Started</h1>
      </div>

      <p className="text-muted-foreground max-w-3xl">
        Welcome to the Getting Started section! Here you'll find everything you need to begin your journey with our platform.
        Learn about the core features, how to navigate the interface, and how to set up your account for success.
      </p>

      <Separator />

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {topics.map((topic) => (
          <DyraneCard key={topic.id} className="h-full">
            <DyraneCardHeader>
              <DyraneCardTitle>{topic.title}</DyraneCardTitle>
              <DyraneCardDescription>{topic.description}</DyraneCardDescription>
            </DyraneCardHeader>
            <DyraneCardContent className="flex justify-end">
              <DyraneButton asChild>
                <Link href={topic.href}>
                  Read More
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              </DyraneButton>
            </DyraneCardContent>
          </DyraneCard>
        ))}
      </div>

      {/* Recommended Reading */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold">Recommended Reading Order</h2>
        <Separator className="my-2" />
        <p className="text-muted-foreground mb-4">
          For the best learning experience, we recommend following these articles in order:
        </p>
        <ol className="space-y-4">
          {topics.map((topic, index) => (
            <li key={topic.id} className="flex items-start">
              <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center mr-3">
                {index + 1}
              </div>
              <div>
                <Link 
                  href={topic.href}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {topic.title}
                </Link>
                <p className="text-sm text-muted-foreground mt-1">{topic.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Next Steps */}
      <div className="mt-8 bg-muted p-6 rounded-lg">
        <h2 className="text-xl font-bold">After Getting Started</h2>
        <p className="text-muted-foreground mt-2 mb-4">
          Once you've completed the Getting Started section, you might want to explore:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DyraneButton variant="outline" asChild>
            <Link href="/help/courses">
              <ChevronRight className="h-4 w-4 mr-2" />
              Courses
            </Link>
          </DyraneButton>
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
        </div>
      </div>
    </div>
  );
}
