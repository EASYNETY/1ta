"use client"
import { motion } from "framer-motion"

interface AbstractBackgroundProps {
    className?: string
}

export function AbstractBackground({ className = "" }: AbstractBackgroundProps) {
    return (
        <div className={`absolute inset-0 overflow-hidden -z-10 ${className}`}>
            {/* Gradient background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>

            {/* Animated blobs */}
            <motion.div
                className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[100px]"
                animate={{
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
            />

            <motion.div
                className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[80px]"
                animate={{
                    x: [0, -30, 0],
                    y: [0, 40, 0],
                }}
                transition={{
                    duration: 15,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 2,
                }}
            />

            <motion.div
                className="absolute top-1/2 left-1/3 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[70px]"
                animate={{
                    x: [0, 40, 0],
                    y: [0, -30, 0],
                }}
                transition={{
                    duration: 18,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 1,
                }}
            />
        </div>
    )
}
