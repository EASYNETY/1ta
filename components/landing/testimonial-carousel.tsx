"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { MotionTokens } from "@/lib/motion.tokens"
import Image from "next/image"

const testimonials = [
  {
    quote:
      "1techacademy has completely transformed how we track attendance and engage with students. The real-time analytics have been invaluable for improving student outcomes.",
    author: "Dr. Sarah Johnson",
    role: "Principal, Westlake High School",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    quote:
      "The biometric attendance system has saved our staff countless hours and improved accuracy. Parents love the instant notifications and transparency.",
    author: "Michael Chen",
    role: "Technology Director, Eastside College",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    quote:
      "As a teacher, the AI-enhanced learning paths have helped me personalize education for each student. I've seen remarkable improvements in engagement and results.",
    author: "Emily Rodriguez",
    role: "Science Teacher, North Academy",
    image: "/placeholder.svg?height=80&width=80",
  },
]

export function TestimonialCarousel() {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [autoplay])

  const next = () => {
    setAutoplay(false)
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }

  const prev = () => {
    setAutoplay(false)
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div className="relative max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{
            duration: MotionTokens.duration.medium,
            ease: MotionTokens.ease.subtle_easeInOut,
          }}
        >
          <DyraneCard className="overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <Quote className="h-12 w-12 text-primary/20 mb-6" />
              <blockquote className="text-xl md:text-2xl mb-6 italic">&quot;{testimonials[current].quote}&quot;</blockquote>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src={testimonials[current].image || "/placeholder.svg"}
                    alt={testimonials[current].author}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold">{testimonials[current].author}</div>
                  <div className="text-muted-foreground text-sm">{testimonials[current].role}</div>
                </div>
              </div>
            </CardContent>
          </DyraneCard>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center mt-6 space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setAutoplay(false)
              setCurrent(index)
            }}
            className={`h-2 w-2 rounded-full ${index === current ? "bg-primary" : "bg-primary/30"}`}
          />
        ))}
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 left-0 -ml-4 hidden md:block">
        <DyraneButton size="icon" variant="ghost" onClick={prev}>
          <ChevronLeft className="h-6 w-6" />
        </DyraneButton>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 right-0 -mr-4 hidden md:block">
        <DyraneButton size="icon" variant="ghost" onClick={next}>
          <ChevronRight className="h-6 w-6" />
        </DyraneButton>
      </div>
    </div>
  )
}
