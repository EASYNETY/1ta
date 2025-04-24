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
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBRoE5DcalLnKRtZfuKddbpQxE2rGNLe6jXw&s",
  },
  {
    name: "Zoom",
    logo: "https://static.vecteezy.com/system/resources/previews/012/871/376/non_2x/zoom-logo-in-blue-colors-meetings-app-logotype-illustration-free-png.png",
  },
  {
    name: "Slack",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/2048px-Slack_icon_2019.svg.png",
  },
  {
    name: "Moodle",
    logo: "data:image/jpeg;base64,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",
  },
  {
    name: "Blackboard",
    logo: "https://logos-world.net/wp-content/uploads/2021/08/Blackboard-Logo.png",
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
