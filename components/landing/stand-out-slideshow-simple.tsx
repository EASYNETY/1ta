// src/components/landing/stand-out-slideshow-simple.tsx
"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MotionTokens } from "@/lib/motion.tokens"
import { cn } from "@/lib/utils"
// **** Import data from the dedicated file ****
import { standOutPointsData } from '@/data/landing-data'; // Adjust path if needed

// --- Simple Animation Variants for Text/Icon Content ---
const contentVariants = { /* ... (keep variants as before) ... */ };

export function StandOutSlideshowSimple() {
    const [currentIndex, setCurrentIndex] = useState(0)

    const cycleItem = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % standOutPointsData.length)
    }, [])

    useEffect(() => {
        const intervalId = setInterval(cycleItem, 5000)
        return () => clearInterval(intervalId)
    }, [cycleItem])

    // **** No changes needed below this line if using the imported data directly ****
    const currentItem = standOutPointsData[currentIndex];

    return (
        <div className="relative w-full max-w-2xl mx-auto mt-12 md:mt-16 min-h-[280px] flex items-center justify-center text-center px-4">
            <AnimatePresence initial={false} mode="wait">
                <motion.div
                    key={currentIndex}
                    variants={contentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="w-full flex flex-col items-center space-y-4"
                >
                    {/* Display Icon */}
                    {currentItem.icon && (
                        <div className="p-4 w-fit rounded-full bg-primary/10 text-primary mb-4">
                            {currentItem.icon}
                        </div>
                    )}
                    {/* Display Title */}
                    <h3 className="text-2xl md:text-3xl font-semibold text-foreground">
                        {currentItem.title}
                    </h3>
                    {/* Display Description */}
                    <p className="text-lg text-muted-foreground max-w-xl">
                        {currentItem.description}
                    </p>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Dots */}
            <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 z-10 flex space-x-2">
                {/* ... (dots logic remains the same) ... */}
                {standOutPointsData.map((_, index) => (
                    <button
                        key={`dot-${index}`}
                        aria-label={`Go to item ${index + 1}`}
                        aria-current={index === currentIndex}
                        className={cn(
                            "h-2.5 w-2.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.77, 0, 0.175, 1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            index === currentIndex
                                ? "bg-primary scale-110"
                                : "bg-muted-foreground/40 hover:bg-muted-foreground/60 scale-90 hover:scale-100",
                        )}
                        onClick={(e) => {
                            e.preventDefault()
                            setCurrentIndex(index)
                        }}
                    />
                ))}
            </div>
        </div>
    )
}