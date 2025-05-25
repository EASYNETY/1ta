'use client'

import React, { useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface CanvasPulsatingBackgroundProps {
  className?: string
  width?: number
  height?: number
  fps?: number // Frames per second
  autoPlay?: boolean
  loop?: boolean
  onFrameChange?: (frame: number) => void
}

export function CanvasPulsatingBackground({
  className,
  width = 800,
  height = 600,
  fps = 10,
  autoPlay = true,
  loop = true,
  onFrameChange
}: CanvasPulsatingBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const imagesRef = useRef<HTMLImageElement[]>([])
  
  const totalFrames = 102
  const frameInterval = 1000 / fps

  // Preload all images
  useEffect(() => {
    const loadImages = async () => {
      const images: HTMLImageElement[] = []
      let loadedCount = 0

      for (let i = 0; i < totalFrames; i++) {
        const img = new Image()
        const paddedNumber = i.toString().padStart(3, '0')
        img.src = `/animations/pulsating-background/pulsating background_${paddedNumber}.svg`
        
        img.onload = () => {
          loadedCount++
          if (loadedCount === totalFrames) {
            setImagesLoaded(true)
          }
        }
        
        images.push(img)
      }
      
      imagesRef.current = images
    }

    loadImages()
  }, [totalFrames])

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !imagesLoaded) return

    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        const nextFrame = prev >= totalFrames - 1 ? (loop ? 0 : totalFrames - 1) : prev + 1
        onFrameChange?.(nextFrame)
        return nextFrame
      })
    }, frameInterval)

    return () => clearInterval(interval)
  }, [isPlaying, imagesLoaded, frameInterval, loop, totalFrames, onFrameChange])

  // Draw current frame
  useEffect(() => {
    if (!imagesLoaded || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imagesRef.current[currentFrame]
    if (img) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
  }, [currentFrame, imagesLoaded])

  const togglePlayPause = () => setIsPlaying(!isPlaying)
  const resetAnimation = () => {
    setCurrentFrame(0)
    setIsPlaying(true)
  }

  return (
    <div className={cn("relative", className)}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full object-cover"
      />
      
      {!imagesLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-sm text-gray-600">Loading animation frames...</div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 left-4 flex gap-2 opacity-20 hover:opacity-100 transition-opacity">
        <button
          onClick={togglePlayPause}
          disabled={!imagesLoaded}
          className="px-2 py-1 bg-black/50 text-white text-xs rounded disabled:opacity-50"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={resetAnimation}
          disabled={!imagesLoaded}
          className="px-2 py-1 bg-black/50 text-white text-xs rounded disabled:opacity-50"
        >
          Reset
        </button>
      </div>

      {/* Frame counter */}
      <div className="absolute top-2 right-2 text-xs text-white/70 bg-black/30 px-2 py-1 rounded">
        Frame: {currentFrame + 1}/{totalFrames}
      </div>
    </div>
  )
}
