'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface PulsatingBackgroundProps {
  className?: string
  speed?: number // Animation speed in milliseconds per frame
  autoPlay?: boolean
  loop?: boolean
}

export function PulsatingBackground({
  className,
  speed = 100,
  autoPlay = true,
  loop = true
}: PulsatingBackgroundProps) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)

  // Total number of frames (000 to 101 = 102 frames)
  const totalFrames = 102

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        if (prev >= totalFrames - 1) {
          return loop ? 0 : totalFrames - 1
        }
        return prev + 1
      })
    }, speed)

    return () => clearInterval(interval)
  }, [isPlaying, speed, loop, totalFrames])

  // Format frame number with leading zeros (000, 001, 002, etc.)
  const getFramePath = (frameNumber: number) => {
    const paddedNumber = frameNumber.toString().padStart(3, '0')
    return `/animations/pulsating-background/pulsating background_${paddedNumber}.svg`
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const resetAnimation = () => {
    setCurrentFrame(0)
    setIsPlaying(true)
  }

  return (
    <div className={cn("relative", className)}>
      {/* Animation Container */}
      <div className="relative w-full h-full">
        <Image
          src={getFramePath(currentFrame)}
          alt={`Pulsating background frame ${currentFrame}`}
          fill
          className="object-cover"
          priority={currentFrame < 5} // Preload first few frames
        />
      </div>

      {/* Optional Controls (remove if not needed) */}
      <div className="absolute bottom-4 left-4 flex gap-2 opacity-20 hover:opacity-100 transition-opacity">
        <button
          onClick={togglePlayPause}
          className="px-2 py-1 bg-black/50 text-white text-xs rounded"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={resetAnimation}
          className="px-2 py-1 bg-black/50 text-white text-xs rounded"
        >
          Reset
        </button>
      </div>

      {/* Frame indicator */}
      <div className="absolute top-2 right-2 text-xs text-white/50">
        {currentFrame + 1}/{totalFrames}
      </div>
    </div>
  )
}

// Preset variations for different use cases
export function PulsatingBackgroundSlow(props: Omit<PulsatingBackgroundProps, 'speed'>) {
  return <PulsatingBackground {...props} speed={200} />
}

export function PulsatingBackgroundFast(props: Omit<PulsatingBackgroundProps, 'speed'>) {
  return <PulsatingBackground {...props} speed={50} />
}

export function PulsatingBackgroundOnce(props: Omit<PulsatingBackgroundProps, 'loop'>) {
  return <PulsatingBackground {...props} loop={false} />
}

// Usage Examples:
/*
// Basic usage
<PulsatingBackground className="w-full h-64" />

// Custom speed
<PulsatingBackground className="w-full h-64" speed={150} />

// Play once only
<PulsatingBackgroundOnce className="w-full h-64" />

// As a full-screen background
<PulsatingBackground className="fixed inset-0 -z-10" />

// With custom controls
<PulsatingBackground
  className="w-full h-64"
  autoPlay={false}
  speed={80}
/>
*/
