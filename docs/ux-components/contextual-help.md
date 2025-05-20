# Contextual Help System

## Overview

The Contextual Help System provides users with context-aware assistance throughout the platform. It consists of three main components:

1. **Smart Tooltips**: Context-aware tooltips that provide different information based on user experience level
2. **Contextual Help Panel**: A collapsible panel that displays guidance based on the current page
3. **Interactive FAQs**: A searchable FAQ system that provides answers to common questions

## Smart Tooltips

Smart tooltips provide different levels of help based on the user's experience with the platform.

```jsx
// components/help/SmartTooltip.tsx
import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartTooltipProps {
  featureId: string;
  children?: React.ReactNode;
  icon?: boolean;
  className?: string;
}

export function SmartTooltip({ featureId, children, icon = false, className }: SmartTooltipProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { lastLogin, createdAt } = user || {};
  
  // Determine user experience level
  const isNewUser = createdAt && (Date.now() - new Date(createdAt).getTime() < 30 * 24 * 60 * 60 * 1000);
  const isReturningUser = lastLogin && !isNewUser;
  
  // Get appropriate tooltip content based on user experience
  const getTooltipContent = () => {
    const tooltipContent = {
      'course-enrollment': {
        new: 'Click here to enroll in this course. You'll be guided through the enrollment process step by step.',
        returning: 'Enroll in this course to access all learning materials and assignments.',
        expert: 'Enroll in course'
      },
      'assignment-submission': {
        new: 'Submit your completed assignment here. Make sure to review all requirements before submitting.',
        returning: 'Upload your assignment files here. You can edit your submission until the deadline.',
        expert: 'Submit assignment'
      }
      // Add more features as needed
    };
    
    const feature = tooltipContent[featureId as keyof typeof tooltipContent];
    if (!feature) return 'No help available';
    
    if (isNewUser) return feature.new;
    if (isReturningUser) return feature.returning;
    return feature.expert;
  };
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          {icon ? (
            <button 
              className={cn("inline-flex items-center justify-center rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground", className)}
              type="button"
              aria-label="Help"
            >
              <Info className="h-4 w-4" />
            </button>
          ) : (
            <span className={className}>{children}</span>
          )}
        </TooltipTrigger>
        <TooltipContent side="top" align="center" className="max-w-xs">
          <p className="text-sm">{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

## Contextual Help Panel

The Contextual Help Panel provides context-sensitive guidance based on the current page.

```jsx
// components/help/ContextualHelpPanel.tsx
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { HelpCircle, ChevronRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Help content mapped to routes
const helpContentMap = {
  '/dashboard': {
    title: 'Dashboard Help',
    description: 'Your dashboard shows an overview of your courses, assignments, and upcoming events.',
    tips: [
      'Check your progress in the stats cards at the top',
      'Click on a course card to go directly to that course',
      'Use the tabs to switch between different views'
    ],
    links: [
      { title: 'Getting Started Guide', href: '/help/getting-started/overview' },
      { title: 'Understanding Your Dashboard', href: '/help/dashboard' }
    ]
  },
  // Add more routes as needed
};

export function ContextualHelpPanel() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [helpContent, setHelpContent] = useState(null);
  
  useEffect(() => {
    // Find the most specific matching route
    const matchingRoute = Object.keys(helpContentMap)
      .filter(route => pathname?.startsWith(route))
      .sort((a, b) => b.length - a.length)[0];
    
    if (matchingRoute) {
      setHelpContent(helpContentMap[matchingRoute]);
    } else {
      setHelpContent(null);
    }
  }, [pathname]);
  
  if (!helpContent) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <DyraneButton size="icon" className="rounded-full shadow-lg">
            <HelpCircle className="h-5 w-5" />
          </DyraneButton>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader className="pb-4">
            <SheetTitle>{helpContent.title}</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6">
            <p className="text-muted-foreground">{helpContent.description}</p>
            
            {helpContent.tips.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Quick Tips</h3>
                <ul className="space-y-2">
                  {helpContent.tips.map((tip, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2"
                    >
                      <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Related help articles */}
            {helpContent.links.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Related Help Articles</h3>
                <ul className="space-y-2">
                  {helpContent.links.map((link, index) => (
                    <li key={index}>
                      <Link 
                        href={link.href}
                        className="text-sm text-primary flex items-center gap-1 hover:underline"
                        onClick={() => setIsOpen(false)}
                      >
                        <ExternalLink className="h-3 w-3" />
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
```

## Integration

1. Add the ContextualHelpPanel to the authenticated layout:

```jsx
// app/(authenticated)/layout.tsx
import { ContextualHelpPanel } from '@/components/help/ContextualHelpPanel';

export default function AuthenticatedLayout({ children }) {
  return (
    <>
      {children}
      <ContextualHelpPanel />
    </>
  );
}
```

2. Use SmartTooltips for key interactive elements:

```jsx
// components/courses/EnrollButton.tsx
import { SmartTooltip } from '@/components/help/SmartTooltip';

export function EnrollButton({ courseId }) {
  return (
    <SmartTooltip featureId="course-enrollment">
      <DyraneButton>Enroll Now</DyraneButton>
    </SmartTooltip>
  );
}
```

## Dependencies

- framer-motion: `^10.0.0`
- lucide-react: `^0.284.0`
