// src/components/landing/stand-out-slideshow-simple.tsx
"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
// Assuming MotionTokens might define standard durations/easings, but we'll define simple ones here if not used.
// import { MotionTokens } from "@/lib/motion.tokens";
import { cn } from "@/lib/utils"
// **** Import data from the dedicated file ****
import { standOutPointsData } from '@/data/landing-data'; // Adjust path if needed

// --- Simple Animation Variants for Text/Icon Content ---
const contentVariants = {
    // Initial state (before entering)
    initial: {
        opacity: 0,
        y: 20, // Start slightly below center
    },
    // Animate state (when visible)
    animate: {
        opacity: 1,
        y: 0, // Animate to center
        transition: {
            duration: 0.5, // Adjust duration as needed
            ease: "easeInOut", // Smooth easing
        },
    },
    // Exit state (when leaving)
    exit: {
        opacity: 0,
        y: -20, // Exit slightly above center
        transition: {
            duration: 0.3, // Exit can be slightly faster
            ease: "easeInOut",
        },
    },
};

export function StandOutSlideshowSimple() {
    const [currentIndex, setCurrentIndex] = useState(0)

    // Memoize cycleItem to prevent unnecessary interval resets
    const cycleItem = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % standOutPointsData.length)
    }, []) // Dependency array is empty as standOutPointsData.length is unlikely to change dynamically

    // Set up the interval timer
    useEffect(() => {
        const intervalId = setInterval(cycleItem, 5000) // Change item every 5 seconds
        // Clear the interval when the component unmounts or cycleItem changes
        return () => clearInterval(intervalId)
    }, [cycleItem])

    // Get the current item data based on the index
    const currentItem = standOutPointsData[currentIndex];

    // Handle case where data might be empty
    if (!standOutPointsData || standOutPointsData.length === 0) {
        return <div className="text-center text-muted-foreground">No items to display.</div>; // Or some placeholder
    }

    return (
        <div className="relative w-full max-w-2xl mx-auto mt-8 md:mt-10 min-h-[220px] flex items-center justify-center text-center px-4">
            <AnimatePresence initial={false} mode="wait">
                <motion.div
                    // Key prop is crucial for AnimatePresence to detect changes
                    key={currentIndex}
                    variants={contentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="w-full flex flex-col items-center space-y-4"
                >
                    {/* Display Icon if available */}
                    {currentItem.icon && (
                        <div className="p-4 w-fit rounded-full bg-primary/10 text-primary mb-4">
                            {/* Ensure the icon is a valid ReactNode */}
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
            <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 z-10 flex space-x-2">
                {/* ... (dots logic remains the same) ... */}
                {standOutPointsData.map((_, index) => (
                    <button
                        key={`dot-${index}`}
                        aria-label={`Go to item ${index + 1}`}
                        aria-current={index === currentIndex ? 'true' : 'false'} // Use 'true'/'false' for aria-current
                        className={cn(
                            "h-2.5 w-2.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.77, 0, 0.175, 1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            index === currentIndex
                                ? "bg-primary scale-110" // Active dot style
                                : "bg-muted-foreground/40 hover:bg-muted-foreground/60 scale-90 hover:scale-100", // Inactive dot style
                        )}
                        onClick={(e) => {
                            e.preventDefault() // Prevent any default button behavior
                            setCurrentIndex(index) // Set the index to the clicked dot's index
                        }}
                    />
                ))}
            </div>
        </div>
    )
}
