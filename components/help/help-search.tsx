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

// Sample help content database
const helpArticles: HelpArticle[] = [
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
    title: 'Course Enrollment',
    description: 'Learn how to browse, select, and enroll in courses on the platform.',
    href: '/help/courses/enrollment',
    category: 'Courses',
    categoryIcon: GraduationCap,
    keywords: ['courses', 'enrollment', 'register', 'sign up', 'join', 'class']
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
    title: 'Viewing Your Schedule',
    description: 'Find out how to view and manage your class schedule.',
    href: '/help/timetable/viewing',
    category: 'Timetable',
    categoryIcon: Calendar,
    keywords: ['schedule', 'timetable', 'calendar', 'classes', 'events']
  },
  {
    title: 'Using Chatrooms',
    description: 'Learn how to communicate with peers and instructors through chatrooms.',
    href: '/help/discussions/chatrooms',
    category: 'Discussions',
    categoryIcon: MessageSquare,
    keywords: ['chat', 'message', 'discussion', 'communication', 'forum']
  },
  {
    title: 'Payment Methods',
    description: 'Understand the available payment options for course enrollment.',
    href: '/help/payments/methods',
    category: 'Payments',
    categoryIcon: CreditCard,
    keywords: ['payment', 'billing', 'credit card', 'transaction', 'checkout']
  },
  {
    title: 'Updating Your Profile',
    description: 'Learn how to update your personal information and profile settings.',
    href: '/help/account/profile',
    category: 'Account Management',
    categoryIcon: User,
    keywords: ['profile', 'account', 'settings', 'personal', 'information']
  },
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
                          key={index}
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
