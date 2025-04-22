"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { MotionTokens } from "@/lib/motion.tokens"

const images = [
  {
    src: "/placeholder.svg?height=500&width=600",
    alt: "Classroom with students",
    caption: "Modern Learning Environment",
  },
  {
    src: "/placeholder.svg?height=500&width=600",
    alt: "Analytics dashboard",
    caption: "Real-time Analytics",
  },
  {
    src: "/placeholder.svg?height=500&width=600",
    alt: "Chat interface",
    caption: "Seamless Communication",
  },
  {
    src: "/placeholder.svg?height=500&width=600",
    alt: "Fingerprint scanner",
    caption: "Biometric Attendance",
  },
]

export function HeroAnimation() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{
            duration: MotionTokens.duration.slow,
            ease: MotionTokens.ease.subtle_easeInOut,
          }}
          className="absolute inset-0"
        >
          <div className="relative h-full w-full">
            <Image
              src={images[currentIndex].src || "/placeholder.svg"}
              alt={images[currentIndex].alt}
              fill
              className="object-cover"
              priority={currentIndex === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: MotionTokens.duration.medium }}
                className="text-2xl font-bold text-white"
              >
                {images[currentIndex].caption}
              </motion.h3>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full ${index === currentIndex ? "bg-primary" : "bg-primary/30"}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}
