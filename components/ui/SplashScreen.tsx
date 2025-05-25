'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SplashScreenProps {
  onComplete?: () => void
  minDisplayTime?: number // Minimum time to show splash (in milliseconds)
  className?: string
  companyName?: string
}

export function SplashScreen({
  onComplete,
  minDisplayTime = 3000,
  className,
  companyName = "1Tech Academy"
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [startTime] = useState(Date.now())
  const videoRef = useRef<HTMLVideoElement>(null)

  // Handle video events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedData = () => {
      setVideoLoaded(true)
      video.play().catch(console.error)
    }

    const handleEnded = () => {
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime)

      // Ensure minimum display time is met
      setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onComplete?.(), 500) // Wait for fade out
      }, remainingTime)
    }

    const handleError = () => {
      console.warn('Video failed to load, showing fallback')
      // If video fails, show for minimum time then complete
      setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onComplete?.(), 500)
      }, minDisplayTime)
    }

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
    }
  }, [onComplete, minDisplayTime, startTime])

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
        {/* Video Container */}
        <div className="relative w-full h-full flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            muted
            playsInline
            preload="auto"
          >
            {/* Add video source when video file is available */}
            <source src="/animations/splash-video.mp4" type="video/mp4" />
            <source src="/animations/splash-video.webm" type="video/webm" />

            {/* Fallback content if video doesn't load */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="mb-6"
                >
                  <h1 className="text-4xl md:text-6xl font-bold text-gray-800 tracking-wide">
                    {companyName}
                  </h1>
                  <p className="text-lg md:text-xl text-gray-600 mt-4 font-light">
                    Empowering Africa's Tech Leaders
                  </p>
                </motion.div>

                {/* Loading animation */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="flex justify-center space-x-2"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 bg-blue-600 rounded-full"
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
              </div>
            </div>
          </video>
        </div>

        {/* Skip Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onComplete?.(), 300)
          }}
          className="absolute top-8 right-8 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 bg-white/80 px-3 py-1 rounded-full"
        >
          Skip
        </motion.button>
      </motion.div>
    </AnimatePresence>
  )
}

// Preset variations
export function QuickSplashScreen(props: Omit<SplashScreenProps, 'minDisplayTime'>) {
  return <SplashScreen {...props} minDisplayTime={2000} />
}

export function DetailedSplashScreen(props: Omit<SplashScreenProps, 'minDisplayTime'>) {
  return <SplashScreen {...props} minDisplayTime={5000} />
}
