'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SplashScreenProps {
  onComplete?: () => void
  duration?: number // Total animation duration in seconds
  minDisplayTime?: number // Minimum time to show splash (in ms)
  className?: string
  showProgress?: boolean
  companyName?: string
}

export function SplashScreen({
  onComplete,
  duration = 8,
  minDisplayTime = 3000,
  className,
  showProgress = true,
  companyName = "1Tech Academy"
}: SplashScreenProps) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const [startTime] = useState(Date.now())
  
  const totalFrames = 102
  const frameDelay = (duration * 1000) / totalFrames // Convert to milliseconds

  // Format frame number with leading zeros
  const getFramePath = (frameNumber: number) => {
    const paddedNumber = frameNumber.toString().padStart(3, '0')
    return `/animations/pulsating-background/pulsating background_${paddedNumber}.svg`
  }

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        const nextFrame = prev + 1
        const newProgress = (nextFrame / totalFrames) * 100
        setProgress(newProgress)

        // Check if animation is complete
        if (nextFrame >= totalFrames) {
          const elapsedTime = Date.now() - startTime
          const remainingTime = Math.max(0, minDisplayTime - elapsedTime)
          
          // Ensure minimum display time is met
          setTimeout(() => {
            setIsVisible(false)
            setTimeout(() => onComplete?.(), 500) // Wait for fade out
          }, remainingTime)
          
          return totalFrames - 1 // Stay on last frame
        }
        
        return nextFrame
      })
    }, frameDelay)

    return () => clearInterval(interval)
  }, [frameDelay, totalFrames, onComplete, minDisplayTime, startTime])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white",
          className
        )}
      >
        {/* Logo Animation Container */}
        <div className="relative flex flex-col items-center">
          {/* Main Logo Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-64 h-36 md:w-80 md:h-44 lg:w-96 lg:h-52"
          >
            <Image
              src={getFramePath(currentFrame)}
              alt={`${companyName} Logo Animation`}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 256px, (max-width: 1024px) 320px, 384px"
            />
          </motion.div>

          {/* Company Name */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 text-center"
          >
            {companyName}
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-2 text-sm md:text-base text-gray-600 text-center"
          >
            Empowering Africa's Tech Leaders
          </motion.p>
        </div>

        {/* Progress Indicator */}
        {showProgress && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-64 md:w-80"
          >
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-1 mb-2">
              <motion.div
                className="bg-blue-600 h-1 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            {/* Loading Text */}
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Loading...</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </motion.div>
        )}

        {/* Loading Dots Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-1"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-blue-600 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
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

        {/* Skip Button (Optional) */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 2 }}
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onComplete?.(), 300)
          }}
          className="absolute top-8 right-8 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          Skip
        </motion.button>
      </motion.div>
    </AnimatePresence>
  )
}

// Preset variations
export function QuickSplashScreen(props: Omit<SplashScreenProps, 'duration' | 'minDisplayTime'>) {
  return <SplashScreen {...props} duration={4} minDisplayTime={2000} />
}

export function DetailedSplashScreen(props: Omit<SplashScreenProps, 'duration' | 'minDisplayTime'>) {
  return <SplashScreen {...props} duration={12} minDisplayTime={5000} />
}
