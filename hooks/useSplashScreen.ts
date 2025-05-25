'use client'

import { useState, useEffect } from 'react'

interface UseSplashScreenOptions {
  minDisplayTime?: number // Minimum time to show splash (in ms)
  checkAppReady?: () => boolean | Promise<boolean> // Function to check if app is ready
  autoHide?: boolean // Whether to auto-hide after animation completes
}

export function useSplashScreen({
  minDisplayTime = 3000,
  checkAppReady,
  autoHide = true
}: UseSplashScreenOptions = {}) {
  const [isVisible, setIsVisible] = useState(true)
  const [isAppReady, setIsAppReady] = useState(false)
  const [startTime] = useState(Date.now())

  // Check if app is ready
  useEffect(() => {
    const checkReady = async () => {
      if (checkAppReady) {
        try {
          const ready = await checkAppReady()
          setIsAppReady(ready)
        } catch (error) {
          console.error('Error checking app readiness:', error)
          setIsAppReady(true) // Assume ready on error
        }
      } else {
        setIsAppReady(true)
      }
    }

    checkReady()
  }, [checkAppReady])

  const hideSplash = () => {
    const elapsedTime = Date.now() - startTime
    const remainingTime = Math.max(0, minDisplayTime - elapsedTime)
    
    setTimeout(() => {
      setIsVisible(false)
    }, remainingTime)
  }

  const handleSplashComplete = () => {
    if (autoHide && isAppReady) {
      hideSplash()
    }
  }

  return {
    isVisible,
    isAppReady,
    hideSplash,
    handleSplashComplete,
    showSplash: () => setIsVisible(true)
  }
}

// Example app readiness checker
export const createAppReadinessChecker = () => {
  return async (): Promise<boolean> => {
    // Check if critical resources are loaded
    const checks = [
      // Check if fonts are loaded
      document.fonts?.ready || Promise.resolve(),
      
      // Check if critical images are loaded (optional)
      new Promise<void>((resolve) => {
        const criticalImages = ['/logo.png', '/logo_dark.png']
        let loadedCount = 0
        
        if (criticalImages.length === 0) {
          resolve()
          return
        }
        
        criticalImages.forEach(src => {
          const img = new Image()
          img.onload = img.onerror = () => {
            loadedCount++
            if (loadedCount === criticalImages.length) {
              resolve()
            }
          }
          img.src = src
        })
      }),
      
      // Add any other async initialization here
      // e.g., API calls, authentication checks, etc.
    ]

    try {
      await Promise.all(checks)
      return true
    } catch (error) {
      console.error('App readiness check failed:', error)
      return true // Continue anyway
    }
  }
}
