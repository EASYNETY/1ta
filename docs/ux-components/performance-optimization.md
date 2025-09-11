# Performance Optimization

## Overview

Performance optimization is crucial for providing a smooth user experience. This document outlines strategies to improve key performance metrics:

- **Largest Contentful Paint (LCP)**: Current 7.9s → Target <2.5s
- **Total Blocking Time (TBT)**: Current 420ms → Target <200ms
- **Speed Index**: Current 2.5s → Target <2.0s

## Image Optimization

The OptimizedImage component enhances image loading performance by:
- Implementing proper loading strategies (eager for LCP, lazy for below-fold)
- Showing loading skeletons
- Handling errors gracefully
- Setting appropriate image sizes

\`\`\`jsx
// components/optimized-image/OptimizedImage.tsx
import { useState } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  onLoad?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  fill = false,
  sizes = '100vw',
  quality = 80,
  onLoad,
  ...props
}: OptimizedImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Default placeholder for broken images
  const placeholderSrc = '/placeholder.svg';
  
  // Handle image load
  const handleLoad = () => {
    setLoading(false);
    if (onLoad) onLoad();
  };
  
  // Handle image error
  const handleError = () => {
    setLoading(false);
    setError(true);
  };
  
  // Determine if this is likely a large image that should be prioritized
  // This helps with LCP optimization
  const isPotentialLCP = priority || (
    // Images in the hero section or above the fold are likely LCP candidates
    className?.includes('hero') || 
    className?.includes('banner') || 
    className?.includes('logo')
  );
  
  return (
    <div className={cn("relative", className)}>
      {loading && (
        <Skeleton 
          className={cn(
            "absolute inset-0 z-10",
            className
          )} 
        />
      )}
      
      <Image
        src={error ? placeholderSrc : src}
        alt={alt}
        width={fill ? undefined : (width || 100)}
        height={fill ? undefined : (height || 100)}
        fill={fill}
        sizes={sizes}
        quality={quality}
        priority={isPotentialLCP}
        loading={isPotentialLCP ? 'eager' : 'lazy'}
        className={cn(
          "transition-opacity duration-300",
          loading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
}
\`\`\`

## Code Splitting and Lazy Loading

Implement code splitting and lazy loading to reduce initial bundle size:

\`\`\`jsx
// app/(authenticated)/layout.tsx
import { Suspense, lazy } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/auth/app-sidebar';
import { Header } from '@/components/layout/auth/header';
import { MobileNav } from '@/components/layout/auth/mobile-nav';
import { AbstractBackground } from '@/components/layout/abstract-background';

// Lazy load non-critical components
const OnboardingTour = lazy(() => import('@/components/onboarding/OnboardingTour').then(mod => ({ default: mod.OnboardingTour })));
const ContextualHelpPanel = lazy(() => import('@/components/help/ContextualHelpPanel').then(mod => ({ default: mod.ContextualHelpPanel })));
const NotificationsPanel = lazy(() => import('@/components/notifications/NotificationsPanel').then(mod => ({ default: mod.NotificationsPanel })));

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar collapsible="icon" />
      <SidebarInset>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 relative min-h-screen w-full">
            <AbstractBackground className="opacity-90 dark:opacity-80" />
            {children}
            
            {/* Lazy loaded components */}
            <Suspense fallback={null}>
              <OnboardingTour />
            </Suspense>
            
            <Suspense fallback={null}>
              <ContextualHelpPanel />
            </Suspense>
            
            <Suspense fallback={null}>
              <NotificationsPanel />
            </Suspense>
          </main>
          <MobileNav />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
\`\`\`

## Component Optimization

Optimize React components to reduce re-renders:

\`\`\`jsx
// components/optimized-list/OptimizedList.tsx
import { memo, useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';

interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemKey: (item: T, index: number) => string | number;
  className?: string;
  itemHeight?: number;
}

function OptimizedListInner<T>({
  items,
  renderItem,
  getItemKey,
  className,
  itemHeight = 50,
}: OptimizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
  });
  
  const memoizedRenderItem = useCallback(renderItem, [renderItem]);
  
  return (
    <div 
      ref={parentRef} 
      className={cn("overflow-auto", className)}
      style={{ height: '100%', width: '100%' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index];
          return (
            <div
              key={getItemKey(item, virtualItem.index)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {memoizedRenderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const OptimizedList = memo(OptimizedListInner) as typeof OptimizedListInner;
\`\`\`

## Critical CSS Inlining

Inline critical CSS to improve First Contentful Paint:

\`\`\`jsx
// app/layout.tsx
import { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import '../styles/animations.css';
import { Providers } from '@/store/providers';
import { AuthProvider } from '@/features/auth/components/auth-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { MouseTrackerProvider } from '@/providers/MouseTrackerProvider';
import { ErrorBoundary } from '@/providers/error-boundary';
import { Toaster } from 'sonner';

// Import critical CSS
import criticalCSS from '@/styles/critical.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap', // Use 'swap' to prevent FOIT
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        {/* Inline critical CSS */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        
        {/* Preload key assets */}
        <link rel="preload" href="/logo.png" as="image" />
        <link rel="preload" href="/logo_md.jpg" as="image" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <ErrorBoundary>
              <AuthProvider>
                <MouseTrackerProvider>
                  {children}
                  <Toaster />
                </MouseTrackerProvider>
              </AuthProvider>
            </ErrorBoundary>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
\`\`\`

## Critical CSS File

Create a critical CSS file with essential styles:

\`\`\`css
/* styles/critical.css */
:root {
  --font-geist-sans: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-geist-mono: 'Geist Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  
  /* Primary colors */
  --color-primary: hsl(221.2 83.2% 53.3%);
  --color-primary-foreground: hsl(210 40% 98%);
  
  /* Background colors */
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(222.2 47.4% 11.2%);
}

.dark {
  --color-primary: hsl(217.2 91.2% 59.8%);
  --color-primary-foreground: hsl(210 40% 98%);
  
  --color-background: hsl(222.2 84% 4.9%);
  --color-foreground: hsl(210 40% 98%);
}

body {
  font-family: var(--font-geist-sans);
  background-color: var(--color-background);
  color: var(--color-foreground);
  margin: 0;
  padding: 0;
}

/* Basic layout */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.min-h-screen { min-height: 100vh; }
.relative { position: relative; }
.z-10 { z-index: 10; }
\`\`\`

## Dependencies

- @tanstack/react-virtual: `^3.0.0`
- next: `^14.0.0`
