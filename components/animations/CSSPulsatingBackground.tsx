'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface CSSPulsatingBackgroundProps {
  className?: string
  duration?: string // CSS duration (e.g., "10s", "5s")
  animationTimingFunction?: string
  iterationCount?: string | number
}

export function CSSPulsatingBackground({ 
  className,
  duration = "10s",
  animationTimingFunction = "linear",
  iterationCount = "infinite"
}: CSSPulsatingBackgroundProps) {
  
  // Generate CSS keyframes for all 102 frames
  const generateKeyframes = () => {
    const framePercentage = 100 / 102 // Each frame represents ~0.98% of the animation
    let keyframes = ''
    
    for (let i = 0; i < 102; i++) {
      const percentage = (i * framePercentage).toFixed(2)
      const paddedNumber = i.toString().padStart(3, '0')
      keyframes += `
        ${percentage}% {
          background-image: url('/animations/pulsating-background/pulsating background_${paddedNumber}.svg');
        }
      `
    }
    
    return keyframes
  }

  return (
    <>
      {/* Inject CSS keyframes */}
      <style jsx>{`
        @keyframes pulsatingBackground {
          ${generateKeyframes()}
        }
        
        .pulsating-bg {
          animation: pulsatingBackground ${duration} ${animationTimingFunction} ${iterationCount};
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-image: url('/animations/pulsating-background/pulsating background_000.svg');
        }
      `}</style>
      
      <div 
        className={cn(
          "pulsating-bg w-full h-full",
          className
        )}
      />
    </>
  )
}

// Preset variations
export function CSSPulsatingBackgroundSlow(props: Omit<CSSPulsatingBackgroundProps, 'duration'>) {
  return <CSSPulsatingBackground {...props} duration="20s" />
}

export function CSSPulsatingBackgroundFast(props: Omit<CSSPulsatingBackgroundProps, 'duration'>) {
  return <CSSPulsatingBackground {...props} duration="5s" />
}

export function CSSPulsatingBackgroundOnce(props: Omit<CSSPulsatingBackgroundProps, 'iterationCount'>) {
  return <CSSPulsatingBackground {...props} iterationCount={1} />
}
