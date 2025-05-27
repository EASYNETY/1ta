"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "framer-motion"; // Respect reduced motion
import { cn } from "@/lib/utils"; // Utility for conditional class names

// --- Component Props Interface ---
interface FeatureCardProps {
    title: string;
    subtitle: string;
    imageSrc: string;
    imageAlt: string;
    modalContent: { bio: React.ReactNode | string };
    className?: string;
    icon?: React.ReactNode;
}

export function Card({
    title,
    subtitle,
    imageSrc,
    imageAlt,
    modalContent,
    className,
    icon,
}: FeatureCardProps) {
    const [isHovered, setIsHovered] = React.useState(false);
    const shouldReduceMotion = useReducedMotion();

    // Animation Variants
    const overlayVariants = {
        hidden: { scaleY: 0, opacity: 0 },
        visible: { scaleY: 1, opacity: 1, transition: { duration: shouldReduceMotion ? 0 : 0.5 } },
    };

    const imageVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.05, transition: { duration: 0.6 } },
    };

    const modalContentVariants = {
        hidden: { opacity: 0, height: 0, y: -10 },
        visible: { opacity: 1, height: "auto", y: 0, transition: { duration: 0.4 } },
    };

    return (
        <motion.div
            className={cn(
                "relative inline-block align-top rounded-[22px] isolate transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] hover:-translate-y-1.5 hover:shadow-xl",
                'flex items-center justify-center',
                className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
        >
            {/* Card Container */}
            <div className="relative w-full min-h-[580px] max-w-[600px] rounded-[22px] group">
                {/* Background and Overlay */}
                <div className="absolute inset-0 h-[75%] rounded-[22px] bg-muted/10 backdrop-blur-xs shadow-md z-10"></div>
                <motion.div
                    className="absolute top-0 left-0 h-[75%] w-full origin-top rounded-[22px] bg-black/80 z-20 pointer-events-none"
                    variants={overlayVariants}
                    initial="hidden"
                    animate={isHovered ? "visible" : "hidden"}
                />

                {/* Title and Subtitle */}
                <motion.div
                    className="absolute top-6 left-6 right-6 z-40 text-muted-foreground group-hover:text-white"
                    animate={isHovered ? "hover" : "initial"}
                >
                    <h2 className="text-2xl font-semibold mb-0.5">{title}</h2>
                    <p className="text-md text-foreground/50">{subtitle}</p>
                </motion.div>

                {/* Modal Content - Shows naturally below subtitle */}
                <motion.div
                    className="absolute top-[100px] left-6 right-6 z-40 overflow-hidden"
                    variants={modalContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                >
                    <div className="flex items-start gap-4 p-4 rounded-lg backdrop-blur-sm">
                        <div className="text-foreground text-md font-thin italic leading-relaxed tracking-wide">
                            {modalContent.bio}
                        </div>
                    </div>
                </motion.div>

                {/* Image */}
                <div className="absolute top-[250px] left-6 right-6 bottom-6 rounded-[18px] overflow-hidden shadow-md z-30">
                    <motion.div
                        className="w-full h-full"
                        variants={imageVariants}
                        initial="initial"
                        animate={isHovered ? "hover" : "initial"}
                    >
                        <Image
                            src={imageSrc || "/placeholder.svg"}
                            alt={imageAlt || title}
                            fill
                            sizes="(max-width: 768px) 90vw, 33vw"
                            className="object-cover object-center"
                            style={{ objectFit: 'cover' }}
                        />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}