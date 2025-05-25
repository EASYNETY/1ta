'use client'

import React, { ReactNode, useState, useEffect, createContext, useContext } from 'react'
import { SimpleSplashScreen } from '@/components/ui/SimpleSplashScreen'

interface AppWithSplashProps {
  children: ReactNode
  enableSplash?: boolean
}

interface SplashContextType {
  isSplashVisible: boolean
  isSplashEnabled: boolean
}

const SplashContext = createContext<SplashContextType>({
  isSplashVisible: false,
  isSplashEnabled: false
})

export const useSplashContext = () => useContext(SplashContext)

export function AppWithSplash({ children, enableSplash = true }: AppWithSplashProps) {
  const [showSplash, setShowSplash] = useState(enableSplash)
  const [isAppReady, setIsAppReady] = useState(false)

  useEffect(() => {
    if (!enableSplash) {
      setShowSplash(false)
      setIsAppReady(true)
      return
    }

    // App readiness checker
    const checkAppReady = async () => {
      try {
        // Wait for fonts to load
        await document.fonts.ready

        // Check if critical resources are available
        const criticalChecks = [
          // Check if logo files exist
          fetch('/logo.png', { method: 'HEAD' }).catch(() => null),
          fetch('/logo_dark.png', { method: 'HEAD' }).catch(() => null),
        ]

        await Promise.allSettled(criticalChecks)

        // Small delay to ensure smooth transition
        await new Promise(resolve => setTimeout(resolve, 300))

        setIsAppReady(true)
      } catch (error) {
        console.error('App readiness check failed:', error)
        setIsAppReady(true) // Continue anyway
      }
    }

    checkAppReady()
  }, [enableSplash])

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  const contextValue: SplashContextType = {
    isSplashVisible: showSplash,
    isSplashEnabled: enableSplash
  }

  return (
    <SplashContext.Provider value={contextValue}>
      {showSplash && (
        <SimpleSplashScreen onComplete={handleSplashComplete} />
      )}
      {(!showSplash || !enableSplash) && children}
    </SplashContext.Provider>
  )
}


