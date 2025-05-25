"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, BookOpen, GraduationCap, CheckCircle, Calendar, MessageSquare, CreditCard, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Define the help content structure for search
interface HelpArticle {
  title: string;
  description: string;
  href: string;
  category: string;
  categoryIcon: React.ElementType;
  keywords: string[];
}

// Complete help content database for search indexing
export const helpArticles: HelpArticle[] = [
  // Getting Started
  {
    title: 'Platform Overview',
    description: 'Learn about the core features and functionality of the platform.',
    href: '/help/getting-started/overview',
    category: 'Getting Started',
    categoryIcon: BookOpen,
    keywords: ['overview', 'introduction', 'features', 'platform', 'getting started']
  },
  {
    title: 'Navigating the Interface',
    description: 'Understand how to navigate through different sections of the platform.',
    href: '/help/getting-started/navigation',
    category: 'Getting Started',
    categoryIcon: BookOpen,
    keywords: ['navigation', 'interface', 'menu', 'sidebar', 'layout']
  },
  {
    title: 'Setting Up Your Account',
    description: 'Configure your account settings and profile information',
    href: '/help/getting-started/account-setup',
    category: 'Getting Started',
    categoryIcon: BookOpen,
    keywords: ['account', 'setup', 'profile', 'settings', 'configuration']
  },

  // Courses
  {
    title: 'Course Enrollment',
    description: 'Learn how to browse, select, and enroll in courses on the platform.',
    href: '/help/courses/enrollment',
    category: 'Courses',
    categoryIcon: GraduationCap,
    keywords: ['courses', 'enrollment', 'register', 'sign up', 'join', 'class']
  },
  {
    title: 'Accessing Course Materials',
    description: 'Find and use course content, resources, and materials',
    href: '/help/courses/materials',
    category: 'Courses',
    categoryIcon: GraduationCap,
    keywords: ['materials', 'content', 'resources', 'lectures', 'readings']
  },
  {
    title: 'Tracking Your Progress',
    description: 'Monitor your course progress and achievements',
    href: '/help/courses/progress',
    category: 'Courses',
    categoryIcon: GraduationCap,
    keywords: ['progress', 'tracking', 'completion', 'achievements', 'grades']
  },

  // Attendance
  {
    title: 'Marking Attendance',
    description: 'Learn different methods for marking attendance',
    href: '/help/attendance/marking',
    category: 'Attendance',
    categoryIcon: CheckCircle,
    keywords: ['attendance', 'marking', 'present', 'absent', 'record']
  },
  {
    title: 'Using the Barcode Scanner',
    description: 'Learn how to use the built-in barcode scanner for attendance tracking.',
    href: '/help/attendance/scanning',
    category: 'Attendance',
    categoryIcon: CheckCircle,
    keywords: ['barcode', 'scanner', 'scan', 'attendance', 'qr code', 'tracking']
  },
  {
    title: 'Customer Care Scanning',
    description: 'Guide for customer care staff to scan student barcodes and view instant information.',
    href: '/help/attendance/customer-care-scanning',
    category: 'Attendance',
    categoryIcon: CheckCircle,
    keywords: ['customer care', 'barcode', 'scanner', 'student information', 'payment status', 'instant display', 'staff']
  },
  {
    title: 'Attendance Reports',
    description: 'Generate and analyze attendance data',
    href: '/help/attendance/reports',
    category: 'Attendance',
    categoryIcon: CheckCircle,
    keywords: ['reports', 'analytics', 'statistics', 'attendance', 'data']
  },

  // Timetable
  {
    title: 'Viewing Your Schedule',
    description: 'Find out how to view and manage your class schedule.',
    href: '/help/timetable/viewing',
    category: 'Timetable',
    categoryIcon: Calendar,
    keywords: ['schedule', 'timetable', 'calendar', 'classes', 'events']
  },
  {
    title: 'Event Types',
    description: 'Understand the different types of events in your schedule',
    href: '/help/timetable/events',
    category: 'Timetable',
    categoryIcon: Calendar,
    keywords: ['events', 'types', 'classes', 'meetings', 'exams', 'categories']
  },
  {
    title: 'Schedule Notifications',
    description: 'Set up reminders for your scheduled events',
    href: '/help/timetable/notifications',
    category: 'Timetable',
    categoryIcon: Calendar,
    keywords: ['notifications', 'reminders', 'alerts', 'schedule', 'timetable']
  },

  // Discussions
  {
    title: 'Using Chatrooms',
    description: 'Learn how to communicate with peers and instructors through chatrooms.',
    href: '/help/discussions/chatrooms',
    category: 'Discussions',
    categoryIcon: MessageSquare,
    keywords: ['chat', 'message', 'discussion', 'communication', 'forum']
  },
  {
    title: 'Direct Messaging',
    description: 'Send private messages to individuals',
    href: '/help/discussions/messaging',
    category: 'Discussions',
    categoryIcon: MessageSquare,
    keywords: ['direct', 'message', 'private', 'DM', 'chat', 'communication']
  },
  {
    title: 'Communication Guidelines',
    description: 'Best practices for respectful and effective communication',
    href: '/help/discussions/etiquette',
    category: 'Discussions',
    categoryIcon: MessageSquare,
    keywords: ['etiquette', 'guidelines', 'rules', 'communication', 'behavior']
  },

  // Payments
  {
    title: 'Payment Methods',
    description: 'Understand the available payment options for course enrollment.',
    href: '/help/payments/methods',
    category: 'Payments',
    categoryIcon: CreditCard,
    keywords: ['payment', 'billing', 'credit card', 'transaction', 'checkout', 'paystack']
  },
  {
    title: 'Payment History',
    description: 'View and manage your payment records',
    href: '/help/payments/history',
    category: 'Payments',
    categoryIcon: CreditCard,
    keywords: ['history', 'records', 'transactions', 'payments', 'billing']
  },
  {
    title: 'Receipts and Invoices',
    description: 'Access and download payment documentation',
    href: '/help/payments/receipts',
    category: 'Payments',
    categoryIcon: CreditCard,
    keywords: ['receipts', 'invoices', 'documentation', 'proof', 'payment']
  },

  // Account Management
  {
    title: 'Updating Your Profile',
    description: 'Learn how to update your personal information and profile settings.',
    href: '/help/account/profile',
    category: 'Account Management',
    categoryIcon: User,
    keywords: ['profile', 'account', 'settings', 'personal', 'information']
  },
  {
    title: 'Account Settings',
    description: 'Manage your account preferences and security options',
    href: '/help/account/settings',
    category: 'Account Management',
    categoryIcon: User,
    keywords: ['settings', 'preferences', 'security', 'account', 'options']
  },
  {
    title: 'Notification Preferences',
    description: 'Customize how you receive alerts and notifications',
    href: '/help/account/notifications',
    category: 'Account Management',
    categoryIcon: User,
    keywords: ['notifications', 'alerts', 'preferences', 'settings', 'communication']
  }
];

interface HelpSearchProps {
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'dialog';
  onSearch?: (query: string) => void;
}

export function HelpSearch({
  placeholder = "Search help topics...",
  className,
  variant = 'default',
  onSearch
}: HelpSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<HelpArticle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  // Perform search when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Simulate search delay
    const timer = setTimeout(() => {
      const query = searchQuery.toLowerCase();

      // Search through help articles
      const results = helpArticles.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.description.toLowerCase().includes(query) ||
        article.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );

      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle search submission
  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  // Handle article selection
  const handleSelectArticle = (article: HelpArticle) => {
    router.push(article.href);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Render dialog search variant
  if (variant === 'dialog') {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-muted-foreground", className)}
            onClick={() => setIsOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            {placeholder}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Search Help Center</DialogTitle>
          </DialogHeader>
          <Command className="rounded-lg border shadow-md">
            <CommandInput
              placeholder="Type to search..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                {isSearching ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Searching...
                  </div>
                ) : (
                  <p className="p-4 text-center text-sm">No results found.</p>
                )}
              </CommandEmpty>
              {searchResults.length > 0 && (
                <CommandGroup heading="Help Articles">
                  <ScrollArea className="h-[300px]">
                    {searchResults.map((article, index) => {
                      const Icon = article.categoryIcon;
                      return (
                        <CommandItem
                          key={`${article.id}-${index}`}
                          onSelect={() => handleSelectArticle(article)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-start gap-2">
                            <Icon className="h-4 w-4 mt-0.5 text-primary" />
                            <div>
                              <p>{article.title}</p>
                              <p className="text-sm text-muted-foreground">{article.category}</p>
                            </div>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </ScrollArea>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    );
  }

  // Render default search variant
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="pl-10 pr-10"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch();
          }
        }}
      />
      {isSearching && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}

      {searchResults.length > 0 && searchQuery.trim() !== '' && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
          <ScrollArea className="h-[300px]">
            <div className="p-2">
              {searchResults.map((article, index) => {
                const Icon = article.categoryIcon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                    onClick={() => handleSelectArticle(article)}
                  >
                    <Icon className="h-4 w-4 mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium">{article.title}</p>
                      <p className="text-xs text-muted-foreground">{article.category}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
