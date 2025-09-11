// src/components/layout/SectionHeader.tsx (example path)
"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { MotionTokens } from "@/lib/motion.tokens"; // Import tokens

interface SectionHeaderProps {
    title: string;
    description: string;
    className?: string;
    titleClassName?: string;
    descriptionClassName?: string;
}

export function SectionHeader({
    title,
    description,
    className = "",
    titleClassName = "",
    descriptionClassName = ""
}: SectionHeaderProps) {
    const ref = useRef(null);
    // Trigger slightly sooner
    const isInView = useInView(ref, { once: true, margin: "-50px 0px -50px 0px" });

    // Animation variants using tokens
    const variants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.15, // Slightly faster stagger
                duration: MotionTokens.duration.medium, // Use token
                ease: MotionTokens.ease.easeOut, // Use token
            },
        }),
    };

    return (
        <div ref={ref} className={cn("text-center mb-16 md:mb-20", className)}> {/* Increased margin */}
            <motion.h2
                className={cn(
                    "text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl mb-4", // Refined typography
                    titleClassName
                )}
                custom={0}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={variants}
            >
                {title}
            </motion.h2>
            <motion.p
                className={cn(
                    "text-lg text-muted-foreground max-w-2xl mx-auto sm:text-xl", // Refined typography
                    descriptionClassName
                )}
                custom={1}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={variants}
            >
                {description}
            </motion.p>
        </div>
    );
}
