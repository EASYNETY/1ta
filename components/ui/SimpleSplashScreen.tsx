'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface SimpleSplashScreenProps {
  onComplete?: () => void
  className?: string
}

export function SimpleSplashScreen({ onComplete, className }: SimpleSplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [videoLoaded, setVideoLoaded] = useState(false)
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
      setIsVisible(false)
      setTimeout(() => onComplete?.(), 500) // Wait for fade out
    }

    const handleError = () => {
      console.warn('Video failed to load, showing fallback')
      // If video fails, show for minimum time then complete
      setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onComplete?.(), 500)
      }, 3000)
    }

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
    }
  }, [onComplete])

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white ${className || ''}`}
    >
      <div className="flex items-center justify-center w-full h-full">
        {/* Video Container */}
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
                  1Tech Academy
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
    </motion.div>
  )
}
