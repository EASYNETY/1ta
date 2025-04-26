"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"
import { MotionTokens } from "@/lib/motion.tokens"
import Image from "next/image"

// Importing the integration logos data
import { integrationLogos } from '@/data/integration-logos'

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
          {[...integrationLogos, ...integrationLogos].map((logo, index) => (
            <div
              key={index}
              className="flex-shrink-0 h-16 w-32 bg-background rounded-lg flex items-center justify-center p-4 relative group"
            >
              <Image
                src={logo.logoUrl || "/placeholder.svg"}
                alt={logo.name}
                width={isMobile ? 120 : 240}
                height={isMobile ? 60 : 120}
                priority={index < 4}
                sizes="(max-width: 768px) 120px, 240px"
                loading={index < 4 ? "eager" : "lazy"}
                className="max-h-full max-w-full object-contain"
              />
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black text-white text-sm rounded py-1 px-2 transition-opacity">
                {logo.name}
              </div>
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
      className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-6"
    >
      {integrationLogos.map((logo, index) => (
        <motion.div
          key={index}
          variants={item}
          className="h-24 bg-background rounded-lg flex items-center justify-center p-6 hover:shadow-md transition-shadow relative group"
        >
          <Image
            src={logo.logoUrl || "/placeholder.svg"}
            alt={logo.name}
            width={120}
            height={60}
            className="max-h-full max-w-full object-contain"
          />
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black text-white text-sm rounded py-1 px-2 transition-opacity">
            {logo.name}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
