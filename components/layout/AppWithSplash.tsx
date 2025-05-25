'use client'

import React, { ReactNode } from 'react'
import { SplashProvider } from '@/providers/SplashProvider'
import { createAppReadinessChecker } from '@/hooks/useSplashScreen'

interface AppWithSplashProps {
  children: ReactNode
  enableSplash?: boolean
}

export function AppWithSplash({ children, enableSplash = true }: AppWithSplashProps) {
  // Custom app readiness checker
  const checkAppReady = async (): Promise<boolean> => {
    try {
      // Wait for fonts to load
      await document.fonts.ready
      
      // Check if critical resources are available
      const criticalChecks = [
        // Check if logo files exist
        fetch('/logo.png', { method: 'HEAD' }).catch(() => null),
        fetch('/logo_dark.png', { method: 'HEAD' }).catch(() => null),
        
        // Add any API health checks here
        // fetch('/api/health').catch(() => null),
        
        // Add authentication checks if needed
        // checkAuthStatus().catch(() => null),
      ]
      
      await Promise.allSettled(criticalChecks)
      
      // Add a small delay to ensure smooth transition
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return true
    } catch (error) {
      console.error('App readiness check failed:', error)
      return true // Continue anyway to prevent infinite loading
    }
  }

  return (
    <SplashProvider
      enableSplash={enableSplash}
      minDisplayTime={3000}
      checkAppReady={checkAppReady}
    >
      {children}
    </SplashProvider>
  )
}

// Usage examples:

/*
// In your main layout file (layout.tsx):
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppWithSplash>
          <ThemeProvider>
            <Navbar />
            {children}
            <Footer />
          </ThemeProvider>
        </AppWithSplash>
      </body>
    </html>
  )
}

// Or wrap specific pages:
export default function HomePage() {
  return (
    <AppWithSplash>
      <main>
        <HeroSection />
        <FeaturesSection />
      </main>
    </AppWithSplash>
  )
}

// Disable splash for certain pages:
export default function LoginPage() {
  return (
    <AppWithSplash enableSplash={false}>
      <LoginForm />
    </AppWithSplash>
  )
}
*/
