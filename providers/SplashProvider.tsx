'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { SplashScreen } from '@/components/ui/SplashScreen'
import { useSplashScreen, createAppReadinessChecker } from '@/hooks/useSplashScreen'

interface SplashContextType {
  isVisible: boolean
  isAppReady: boolean
  hideSplash: () => void
  showSplash: () => void
}

const SplashContext = createContext<SplashContextType | undefined>(undefined)

interface SplashProviderProps {
  children: ReactNode
  minDisplayTime?: number
  enableSplash?: boolean
  checkAppReady?: () => boolean | Promise<boolean>
}

export function SplashProvider({
  children,
  minDisplayTime = 3000,
  enableSplash = true,
  checkAppReady = createAppReadinessChecker()
}: SplashProviderProps) {
  const {
    isVisible,
    isAppReady,
    hideSplash,
    handleSplashComplete,
    showSplash
  } = useSplashScreen({
    minDisplayTime,
    checkAppReady,
    autoHide: true
  })

  const contextValue: SplashContextType = {
    isVisible,
    isAppReady,
    hideSplash,
    showSplash
  }

  return (
    <SplashContext.Provider value={contextValue}>
      {enableSplash && isVisible && (
        <SplashScreen
          onComplete={handleSplashComplete}
          minDisplayTime={minDisplayTime}
          companyName="1Tech Academy"
        />
      )}
      {children}
    </SplashContext.Provider>
  )
}

export function useSplashContext() {
  const context = useContext(SplashContext)
  if (context === undefined) {
    throw new Error('useSplashContext must be used within a SplashProvider')
  }
  return context
}

// Higher-order component for pages that need splash screen
export function withSplashScreen<P extends object>(
  Component: React.ComponentType<P>,
  splashOptions?: Partial<SplashProviderProps>
) {
  return function WrappedComponent(props: P) {
    return (
      <SplashProvider {...splashOptions}>
        <Component {...props} />
      </SplashProvider>
    )
  }
}
