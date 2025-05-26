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
      "1TechAcademy has completely transformed how we track attendance and engage with students. The real-time analytics have been invaluable for improving student outcomes.",
    author: "Dr. Amara Okafor",
    role: "Principal, Lagos Tech Institute",
    image: "https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
  },
  {
    quote:
      "The comprehensive tech training programs have equipped our students with industry-relevant skills. The hands-on approach and expert facilitators make all the difference.",
    author: "Kwame Asante",
    role: "Technology Director, Accra Digital Hub",
    image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
  },
  {
    quote:
      "As a facilitator, the learning management system has helped me deliver personalized education for each student. I've seen remarkable improvements in engagement and results.",
    author: "Fatima Adebayo",
    role: "Senior Facilitator, 1Tech Academy",
    image: "https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
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
    <div className="relative max-w-4xl mx-auto px-8 md:px-12">
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
              <blockquote className="text-xl md:text-2xl mb-6 italic leading-relaxed">
                &quot;{testimonials[current].quote}&quot;
              </blockquote>
              <div className="flex items-center flex-wrap">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-4 flex-shrink-0">
                  <Image
                    src={testimonials[current].image || "/placeholder.svg"}
                    alt={testimonials[current].author}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-foreground break-words">{testimonials[current].author}</div>
                  <div className="text-muted-foreground text-sm break-words">{testimonials[current].role}</div>
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

      <div className="absolute top-1/2 -translate-y-1/2 left-2 hidden lg:block">
        <DyraneButton size="icon" variant="ghost" onClick={prev}>
          <ChevronLeft className="h-6 w-6" />
        </DyraneButton>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 right-2 hidden lg:block">
        <DyraneButton size="icon" variant="ghost" onClick={next}>
          <ChevronRight className="h-6 w-6" />
        </DyraneButton>
      </div>
    </div>
  )
}
