// src/components/layout/SectionDivider.tsx (example path)
"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { MotionTokens } from "@/lib/motion.tokens"; // Import your tokens

interface SectionDividerProps {
    className?: string;
}

export function SectionDivider({ className = "" }: SectionDividerProps) {
    const ref = useRef(null);
    // Trigger animation slightly earlier
    const isInView = useInView(ref, { once: true, margin: "-50px 0px -50px 0px" });

    // Use motion tokens for consistency
    const lineTransition = {
        duration: MotionTokens.duration.slow, // Use defined duration
        ease: MotionTokens.ease.easeOut, // Use defined easing
    };
    const dotTransition = {
        duration: MotionTokens.duration.medium,
        delay: 0.2, // Slightly less delay
        ease: MotionTokens.ease.easeOut,
    };

    return (
        <div ref={ref} className={cn("relative h-8 my-2 sm:my-3 md:my-4", className)} aria-hidden="true"> {/* Further reduced height and margins */}
            {/* Vertical Line */}
            <motion.div
                className="absolute left-1/2 top-0 h-full w-px origin-top bg-gradient-to-b from-transparent via-primary/30 to-transparent" // Use a gradient for fade effect
                initial={{ scaleY: 0 }}
                animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
                transition={lineTransition}
            />
            {/* Center Dot */}
            <motion.div
                className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/50 bg-background ring-4 ring-background" // Added ring to "cut out" bg
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={dotTransition}
            />
        </div>
    );
}
