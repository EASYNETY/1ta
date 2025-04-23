"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

interface SectionDividerProps {
  className?: string
}

export function SectionDivider({ className = "" }: SectionDividerProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <div ref={ref} className={`relative py-16 ${className}`}>
      <motion.div
        className="absolute left-1/2 h-16 w-px bg-primary/20"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={isInView ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full border border-primary/50 bg-background"
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: [0.33, 1, 0.68, 1] }}
      />
    </div>
  )
}
