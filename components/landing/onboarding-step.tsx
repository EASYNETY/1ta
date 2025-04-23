"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent } from "@/components/ui/card"
import { MotionTokens } from "@/lib/motion.tokens"

interface OnboardingStepProps {
  number: number
  title: string
  description: string
}

export function OnboardingStep({ number, title, description }: OnboardingStepProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <DyraneCard
      className="overflow-hidden h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      
    >
      <CardContent className="p-6 relative">
        <div className="flex flex-col space-y-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
            {number}
          </div>
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            height: isHovered ? "100%" : 0,
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
