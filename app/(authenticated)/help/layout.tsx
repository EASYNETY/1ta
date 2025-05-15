"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CircleHelp, ChevronRight, BookOpen, GraduationCap, Users, Calendar, CheckCircle, MessageSquare, CreditCard, Settings, User, Bell, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { HelpSearch } from '@/components/help';

// Define the help navigation structure
const helpNavigation = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    items: [
      { title: 'Platform Overview', href: '/help/getting-started/overview' },
      { title: 'Navigating the Interface', href: '/help/getting-started/navigation' },
      { title: 'Setting Up Your Account', href: '/help/getting-started/account-setup' },
    ]
  },
  {
    id: 'courses',
    title: 'Courses',
    icon: GraduationCap,
    items: [
      { title: 'Course Enrollment', href: '/help/courses/enrollment' },
      { title: 'Accessing Course Materials', href: '/help/courses/materials' },
      { title: 'Tracking Your Progress', href: '/help/courses/progress' },
    ]
  },
  {
    id: 'attendance',
    title: 'Attendance',
    icon: CheckCircle,
    items: [
      { title: 'Marking Attendance', href: '/help/attendance/marking' },
      { title: 'Using the Barcode Scanner', href: '/help/attendance/scanning' },
      { title: 'Attendance Reports', href: '/help/attendance/reports' },
    ]
  },
  {
    id: 'timetable',
    title: 'Timetable',
    icon: Calendar,
    items: [
      { title: 'Viewing Your Schedule', href: '/help/timetable/viewing' },
      { title: 'Event Types', href: '/help/timetable/events' },
      { title: 'Schedule Notifications', href: '/help/timetable/notifications' },
    ]
  },
  {
    id: 'discussions',
    title: 'Discussions',
    icon: MessageSquare,
    items: [
      { title: 'Using Chatrooms', href: '/help/discussions/chatrooms' },
      { title: 'Direct Messaging', href: '/help/discussions/messaging' },
      { title: 'Communication Guidelines', href: '/help/discussions/etiquette' },
    ]
  },
  {
    id: 'payments',
    title: 'Payments',
    icon: CreditCard,
    items: [
      { title: 'Payment Methods', href: '/help/payments/methods' },
      { title: 'Payment History', href: '/help/payments/history' },
      { title: 'Receipts and Invoices', href: '/help/payments/receipts' },
    ]
  },
  {
    id: 'account',
    title: 'Account Management',
    icon: User,
    items: [
      { title: 'Updating Your Profile', href: '/help/account/profile' },
      { title: 'Account Settings', href: '/help/account/settings' },
      { title: 'Notification Preferences', href: '/help/account/notifications' },
    ]
  },
];

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Toggle section open/closed state
  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Check if a section should be open based on current path
  const isSectionActive = (sectionId: string) => {
    return pathname.includes(`/help/${sectionId}`);
  };

  // Check if a section is open
  const isSectionOpen = (sectionId: string) => {
    return openSections[sectionId] || isSectionActive(sectionId);
  };

  // Filter navigation items based on search
  const filteredNavigation = searchQuery
    ? helpNavigation.map(section => ({
      ...section,
      items: section.items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(section => section.items.length > 0)
    : helpNavigation;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Mobile Navigation Trigger */}
      <div className="lg:hidden p-4 border-b">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full cursor-pointer flex items-center justify-between">
              <div className="flex items-center">
                <CircleHelp className="h-5 w-5 mr-2" />
                <span>Help Navigation</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[350px] rounded-r-3xl bg-background/65 backdrop-blur-md border-0 px-4 gap-6">
            {/* Hidden Header */}
            <SheetHeader >
              <SheetTitle>
                <div className="py-4">
                  <div className="flex items-center gap-2 mb-4">
                    <CircleHelp className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-bold">Help Topics</h2>
                  </div>
                  <div className="mb-4">
                    <HelpSearch
                      variant="default"
                      placeholder="Search help topics..."
                      onSearch={(query) => setSearchQuery(query)}
                    />
                  </div>
                </div>
              </SheetTitle>
            </SheetHeader>

            <ScrollArea className="h-[calc(100vh-150px)]">
              <div className="space-y-6">
                {filteredNavigation.map((section) => (
                  <div key={section.id} className="space-y-2">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className={cn(
                        "flex items-center justify-between w-full text-sm font-medium cursor-pointer",
                        isSectionActive(section.id) ? "text-primary" : "text-foreground"
                      )}
                    >
                      <div className="flex items-center">
                        <section.icon className="h-4 w-4 mr-2" />
                        {section.title}
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform cursor-pointer",
                          isSectionOpen(section.id) && "transform rotate-180"
                        )}
                      />
                    </button>
                    {isSectionOpen(section.id) && (
                      <div className="pl-6 space-y-1">
                        {section.items.map((item, index) => (
                          <Link
                            key={index}
                            href={item.href}
                            className={cn(
                              "block text-sm py-1 px-2 rounded-md",
                              pathname === item.href
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    )}
                    <Separator className="my-4" />
                  </div>
                ))}
              </div>
            </ScrollArea>

            <SheetFooter>
              <div className="mt-auto">
                <Button asChild variant="outline" className="w-full cursor-pointer">
                  <Link href="/help">
                    Back to Help Center
                  </Link>
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col justify-between w-64 rounded-xl p-4 bg-card/5 backdrop-blur-sm shadow-sm border border-primary/10 gap-6">
        <div className="flex items-center gap-2 mb-4">
          <CircleHelp className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Help Topics</h2>
        </div>
        <div className="mb-4">
          <HelpSearch
            variant="default"
            placeholder="Search help topics..."
            onSearch={(query) => setSearchQuery(query)}
          />
        </div>
        <ScrollArea className="h-[calc(100vh-200px)] mt-8">
          <div className="space-y-4">
            {filteredNavigation.map((section) => (
              <div key={section.id} className="space-y-2">
                <button
                  onClick={() => toggleSection(section.id)}
                  className={cn(
                    "flex items-center justify-between cursor-pointer w-full text-sm font-medium",
                    isSectionActive(section.id) ? "text-primary" : "text-foreground"
                  )}
                >
                  <div className="flex items-center">
                    <section.icon className="h-4 w-4 mr-2" />
                    {section.title}
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform cursor-pointer",
                      isSectionOpen(section.id) && "transform rotate-180"
                    )}
                  />
                </button>
                {isSectionOpen(section.id) && (
                  <div className="pl-6 space-y-1">
                    {section.items.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        className={cn(
                          "block text-sm py-1 px-2 rounded-md",
                          pathname === item.href
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                )}
                <Separator className="my-4" />
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-auto">
          <DyraneButton asChild variant="outline" className="w-full">
            <Link href="/help">
              Back to Help Center
            </Link>
          </DyraneButton>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto lg:px-4">
        {children}
      </div>
    </div >
  );
}
