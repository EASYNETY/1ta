"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
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

    // Animation Variants
    const imageVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.05, transition: { duration: 0.6 } },
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
            <div className="relative w-full min-h-[480px] max-w-[600px] rounded-[22px] group bg-card border shadow-lg">
                {/* Header Section with Title, Subtitle and Icon */}
                <div className="absolute top-6 left-6 right-6 z-40 flex items-start gap-4">
                    {icon && (
                        <div className="p-3 w-fit rounded-lg bg-primary/10 text-primary flex-shrink-0">
                            {icon}
                        </div>
                    )}
                    <div className="flex-1">
                        <h2 className="text-2xl font-semibold mb-1 text-foreground">{title}</h2>
                        <p className="text-md text-muted-foreground">{subtitle}</p>
                    </div>
                </div>

                {/* Content Section - Mission/Vision Text */}
                <div className="absolute top-[120px] left-6 right-6 z-40">
                    <div className="text-foreground leading-relaxed tracking-wide text-base px-2">
                        {modalContent.bio}
                    </div>
                </div>

                {/* Image */}
                <div className="absolute bottom-6 left-6 right-6 h-[200px] rounded-[18px] overflow-hidden shadow-md z-30">
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
