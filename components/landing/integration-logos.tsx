"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"
import { MotionTokens } from "@/lib/motion.tokens"
import Image from "next/image"

const logos = [
  { name: "Google Classroom", logo: "/placeholder.svg?height=60&width=120" },
  { name: "Microsoft Teams", logo: "/placeholder.svg?height=60&width=120" },
  { name: "Canvas", logo: "/placeholder.svg?height=60&width=120" },
  { name: "Zoom", logo: "/placeholder.svg?height=60&width=120" },
  { name: "Slack", logo: "/placeholder.svg?height=60&width=120" },
  { name: "Moodle", logo: "/placeholder.svg?height=60&width=120" },
  { name: "Blackboard", logo: "/placeholder.svg?height=60&width=120" },
  { name: "Notion", logo: "/placeholder.svg?height=60&width=120" },
]

export function IntegrationLogos() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: false, amount: 0.2 })
  const isMobile = useMobile()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: MotionTokens.duration.medium,
        ease: MotionTokens.ease.easeOut,
      },
    },
  }

  if (isMobile) {
    return (
      <div className="overflow-hidden">
        <motion.div
          animate={{ x: [0, -1920, 0] }}
          transition={{
            duration: 30,
            ease: "linear",
            repeat: Number.POSITIVE_INFINITY,
          }}
          className="flex space-x-8 py-4"
        >
          {[...logos, ...logos].map((logo, index) => (
            <div
              key={index}
              className="flex-shrink-0 h-16 w-32 bg-background rounded-lg flex items-center justify-center p-4"
            >
              <Image src={logo.logo || "/placeholder.svg"} alt={logo.name} className="max-h-full max-w-full" />
            </div>
          ))}
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      ref={containerRef}
      variants={container}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      className="grid grid-cols-2 md:grid-cols-4 gap-6"
    >
      {logos.map((logo, index) => (
        <motion.div
          key={index}
          variants={item}
          className="h-24 bg-background rounded-lg flex items-center justify-center p-6 hover:shadow-md transition-shadow"
          whileHover={{
            scale: 1.05,
            transition: { duration: MotionTokens.duration.fast },
          }}
        >
          <Image src={logo.logo || "/placeholder.svg"} alt={logo.name} className="max-h-full max-w-full" />
        </motion.div>
      ))}
    </motion.div>
  )
}
