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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white ${className || ''}`}
    >
      <div className="flex flex-col items-center">
        {/* Logo Animation - Sized appropriately for 2560x1440 source */}
        <div className="relative w-80 h-48 md:w-96 md:h-56 lg:w-[32rem] lg:h-72">
          <Image
            src={getFramePath(currentFrame)}
            alt="1Tech Academy Logo Animation"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 320px, (max-width: 1024px) 384px, 512px"
          />
        </div>
        
        {/* Company Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-8 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 text-center"
        >
          1Tech Academy
        </motion.h1>
        
        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="mt-4 text-lg md:text-xl text-gray-600 text-center"
        >
          Empowering Africa's Tech Leaders
        </motion.p>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="mt-8 flex space-x-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-blue-600 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
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
