"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

interface SectionHeaderProps {
    title: string
    description: string
    className?: string
}

export function SectionHeader({ title, description, className = "" }: SectionHeaderProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    const variants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: [0.33, 1, 0.68, 1],
            },
        }),
    }

    return (
        <div ref={ref} className={`text-center mb-12 ${className}`}>
            <motion.h2
                className="text-3xl md:text-4xl font-bold mb-4"
                custom={0}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={variants}
            >
                {title}
            </motion.h2>
            <motion.p
                className="text-xl text-muted-foreground max-w-2xl mx-auto"
                custom={1}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={variants}
            >
                {description}
            </motion.p>
        </div>
    )
}
