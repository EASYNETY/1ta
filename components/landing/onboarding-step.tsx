"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent } from "@/components/ui/card"
import { MotionTokens } from "@/lib/motion.tokens"

interface OnboardingStepProps {
  number: number
  title: string
  description: string
}

export function OnboardingStep({ number, title, description }: OnboardingStepProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: MotionTokens.ease.easeOut,
      },
    }),
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={number - 1}
      variants={variants}
      className="h-full"
    >
      <DyraneCard className="overflow-hidden h-full">
        <CardContent className="p-6 relative h-full">
          <div className="flex flex-col space-y-4 h-full">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
              {number}
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </DyraneCard>
    </motion.div>
  )
}
