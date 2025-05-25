'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface SimpleSplashScreenProps {
  onComplete?: () => void
  className?: string
}

export function SimpleSplashScreen({ onComplete, className }: SimpleSplashScreenProps) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const totalFrames = 102
  const frameDelay = 80 // 80ms per frame = ~12.5 FPS for smooth animation

  // Format frame number with leading zeros
  const getFramePath = (frameNumber: number) => {
    const paddedNumber = frameNumber.toString().padStart(3, '0')
    return `/animations/pulsating-background/pulsating background_${paddedNumber}.svg`
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        if (prev >= totalFrames - 1) {
          // Animation complete, hide splash after a brief pause
          setTimeout(() => {
            setIsVisible(false)
            onComplete?.()
          }, 500)
          return totalFrames - 1
        }
        return prev + 1
      })
    }, frameDelay)

    return () => clearInterval(interval)
  }, [frameDelay, totalFrames, onComplete])

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-primary ${className || ''}`}
    >
      <div className="flex items-center justify-center w-full h-full p-4">
        {/* Pure Logo Animation - Clean and Simple */}
        <div className="relative w-full max-w-5xl">
          {/* Maintain 16:9 aspect ratio (2560x1440) */}
          <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
            <Image
              src={getFramePath(currentFrame)}
              alt="Logo Animation"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1280px"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Usage Example:
/*
'use client'

import { useState } from 'react'
import { SimpleSplashScreen } from '@/components/ui/SimpleSplashScreen'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <>
      {showSplash && (
        <SimpleSplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {!showSplash && (
        <main>
          Your app content here
        </main>
      )}
    </>
  )
}
*/
