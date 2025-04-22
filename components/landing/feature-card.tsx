"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent } from "@/components/ui/card"
import { MotionTokens } from "@/lib/motion.tokens"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <DyraneCard
      className="overflow-hidden h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      
    >
      <CardContent className="p-6 relative">
        <div className="flex flex-col space-y-4">
          <div className="p-2 w-fit rounded-lg bg-primary/10 text-primary">{icon}</div>
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <motion.div
          className="absolute inset-0 bg-primary/5 pointer-events-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 20,
          }}
          transition={{
            duration: MotionTokens.duration.medium,
            ease: MotionTokens.ease.subtle_easeInOut,
          }}
        />
      </CardContent>
    </DyraneCard>
  )
}
