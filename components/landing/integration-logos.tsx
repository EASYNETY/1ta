"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"
import { MotionTokens } from "@/lib/motion.tokens"
import Image from "next/image"

const logos = [
  { name: "Google Classroom", logo: "https://upload.wikimedia.org/wikipedia/commons/5/59/Google_Classroom_Logo.png" },
  {
    name: "Microsoft Teams",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg",
  },
  {
    name: "Canvas",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Canvas_LMS_logo.svg/1200px-Canvas_LMS_logo.svg.png",
  },
  {
    name: "Zoom",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Zoom_logo.svg/2880px-Zoom_logo.svg.png",
  },
  {
    name: "Slack",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/2048px-Slack_icon_2019.svg.png",
  },
  {
    name: "Moodle",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Moodle_logo.svg/1200px-Moodle_logo.svg.png",
  },
  {
    name: "Blackboard",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Blackboard_Learn_Logo.svg/1200px-Blackboard_Learn_Logo.svg.png",
  },
  { name: "Notion", logo: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" },
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
              <Image
                src={logo.logo || "/placeholder.svg"}
                alt={logo.name}
                width={isMobile ? 120 : 240}
                height={isMobile ? 60 : 120}
                priority={index < 4}
                sizes="(max-width: 768px) 120px, 240px"
                loading={index < 4 ? "eager" : "lazy"}
                className="max-h-full max-w-full object-contain"
              />
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
          <Image
            src={logo.logo || "/placeholder.svg"}
            alt={logo.name}
            width={120}
            height={60}
            className="max-h-full max-w-full object-contain"
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
