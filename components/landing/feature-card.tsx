"use client"

import type React from "react"
import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent } from "@/components/ui/card"
import { MotionTokens } from "@/lib/motion.tokens"
import Image from "next/image"

interface FeatureCardProps {
  icon: React.ReactNode | string
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: MotionTokens.ease.easeOut,
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className="h-full"
    >
      <DyraneCard className="overflow-hidden h-full">
        <CardContent className="p-6 relative h-full">
          <div className="flex flex-col space-y-4 h-full">
            <div className="p-3 w-fit rounded-lg bg-primary/10 text-primary">
              {typeof icon === 'string' ? (
                <div className="w-8 h-8 relative">
                  <Image
                    src={icon}
                    alt={`${title} icon`}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                icon
              )}
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </DyraneCard>
    </motion.div>
  )
}
