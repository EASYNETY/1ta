'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FramerPulsatingBackgroundProps {
  className?: string
  duration?: number // Total animation duration in seconds
  autoPlay?: boolean
  loop?: boolean
  onAnimationComplete?: () => void
}

export function FramerPulsatingBackground({ 
  className, 
  duration = 10, 
  autoPlay = true, 
  loop = true,
  onAnimationComplete
}: FramerPulsatingBackgroundProps) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  
  const totalFrames = 102
  const frameDelay = duration / totalFrames

  // Generate all frame paths
  const framePaths = Array.from({ length: totalFrames }, (_, i) => {
    const paddedNumber = i.toString().padStart(3, '0')
    return `/animations/pulsating-background/pulsating background_${paddedNumber}.svg`
  })

  const animationVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  }

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: frameDelay,
        repeat: loop ? Infinity : 0,
        repeatType: "loop" as const
      }
    }
  }

  return (
    <motion.div 
      className={cn("relative overflow-hidden", className)}
      variants={containerVariants}
      animate={isPlaying ? "animate" : "initial"}
    >
      <AnimatePresence mode="wait">
        {framePaths.map((path, index) => (
          <motion.div
            key={`frame-${index}`}
            className="absolute inset-0"
            variants={animationVariants}
            initial="initial"
            animate={currentFrame === index ? "animate" : "initial"}
            exit="exit"
            transition={{ duration: frameDelay }}
            onAnimationComplete={() => {
              if (index === totalFrames - 1) {
                onAnimationComplete?.()
                if (!loop) setIsPlaying(false)
              }
              setCurrentFrame((prev) => (prev + 1) % totalFrames)
            }}
          >
            <Image
              src={path}
              alt={`Pulsating background frame ${index}`}
              fill
              className="object-cover"
              priority={index < 5}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 flex gap-2 opacity-20 hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-2 py-1 bg-black/50 text-white text-xs rounded"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    </motion.div>
  )
}
