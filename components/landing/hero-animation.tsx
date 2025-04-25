"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { MotionTokens } from "@/lib/motion.tokens"
import { cn } from "@/lib/utils"

// --- Image Data for 1Tech Academy Hero ---
// Using direct image URLs
const heroImages = [
  {
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1470&auto=format&fit=crop",
    alt: "Diverse students collaborating on code around a modern workstation",
    caption: "Collaborative Project-Based Learning",
  },
  {
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1470&auto=format&fit=crop",
    alt: "Clean dashboard showing complex data visualizations and analytics",
    caption: "Mastering Data Insights",
  },
  {
    src: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1374&auto=format&fit=crop",
    alt: "Abstract digital representation of a secure network structure",
    caption: "Cutting-Edge Cybersecurity Training",
  },
  {
    src: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=1470&auto=format&fit=crop",
    alt: "Close-up of a student assembling a precision robotics component",
    caption: "Hands-On Skills for Tomorrow",
  },
]

// --- Animation Variants ---
const imageVariants = {
  initial: { opacity: 0, scale: 1.03, transition: { duration: 0 } }, // Start slightly scaled up, instant opacity 0
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: MotionTokens.duration.medium, // Use medium duration for smoother entry
      ease: MotionTokens.ease.subtle_easeInOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98, // Slight scale down on exit
    transition: {
      duration: MotionTokens.duration.fast, // Faster exit
      ease: MotionTokens.ease.easeIn,
    },
  },
}

const captionVariants = {
  initial: { opacity: 0, y: 15 }, // Start slightly lower
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.15, // Slightly delay after image starts animating in
      duration: MotionTokens.duration.medium,
      ease: MotionTokens.ease.easeOut,
    },
  },
  exit: {
    // Define exit for smoother AnimatePresence cross-fade
    opacity: 0,
    y: -10,
    transition: {
      duration: MotionTokens.duration.fast, // Quick exit
      ease: MotionTokens.ease.easeIn,
    },
  },
}

export function HeroAnimation() {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Memoize the next index function
  const cycleImage = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
  }, []) // No dependencies needed if heroImages is static

  // Auto-Cycle Effect
  useEffect(() => {
    const intervalId = setInterval(cycleImage, 5000) // Cycle every 5 seconds
    return () => clearInterval(intervalId) // Cleanup on unmount
  }, [cycleImage]) // Dependency array includes memoized function

  return (
    // Container with aspect ratio, overflow hidden, and base styles
    <div className="relative aspect-[4/3] md:aspect-video h-full w-full overflow-hidden rounded-2xl shadow-lg bg-muted dark:bg-slate-800/50">
      {/* AnimatePresence handles enter/exit animations */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex} // Change key to trigger animation
          variants={imageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0"
        >
          {/* Image Component with optimizations */}
          <Image
            src={heroImages[currentIndex].src || "/placeholder.svg"}
            alt={heroImages[currentIndex].alt}
            fill // Use fill to cover the container
            className="object-cover" // Ensure image covers area
            priority={currentIndex === 0} // Prioritize loading the first image
            quality={85} // Slightly adjusted quality for performance
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw" // Example sizes - ADJUST BASED ON YOUR LAYOUT
          />
          {/* Gradient overlay for text readability */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none"
            aria-hidden="true"
          />
        </motion.div>
      </AnimatePresence>

      {/* Caption Area */}
      <div className="absolute bottom-0 left-0 p-4 md:p-6 z-10 w-full pointer-events-none">
        {/* AnimatePresence for caption text transition */}
        <AnimatePresence initial={false} mode="wait">
          <motion.h3
            key={currentIndex + "-caption"} // Use index in key
            variants={captionVariants}
            initial="initial"
            animate="animate"
            exit="exit" // Apply exit animation
            // Using text-shadow for potentially better performance than drop-shadow
            className="text-lg font-semibold text-white sm:text-xl md:text-2xl [text-shadow:0_1px_3px_rgb(0_0_0_/_0.4)]"
          >
            {heroImages[currentIndex].caption}
          </motion.h3>
        </AnimatePresence>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-5 right-5 z-10 flex space-x-2 md:bottom-6 md:right-6">
        {heroImages.map((_, index) => (
          <button
            key={`dot-${index}`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentIndex} // Indicate current slide
            className={cn(
              "h-2 w-2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.77, 0, 0.175, 1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50", // Base dot + focus styles
              index === currentIndex
                ? "bg-white scale-110" // Active dot style
                : "bg-white/40 hover:bg-white/60 scale-90 hover:scale-100", // Inactive dot style + hover
            )}
            onClick={(e) => {
              e.preventDefault()
              setCurrentIndex(index)
            }}
          />
        ))}
      </div>
    </div>
  )
}
