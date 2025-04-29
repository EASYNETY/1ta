// components/cards/FeatureCard.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Linkedin, Twitter, Globe, LayoutGrid } from "lucide-react"; // Example Icons
import { cn } from "@/lib/utils";
import { MotionTokens } from "@/lib/motion.tokens"; // Assuming path
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"; // For potential actions inside modal
import { useReducedMotion } from "framer-motion"; // Respect reduced motion
import { ScrollArea } from "../ui/scroll-area";
import { FeatureCard } from "../landing/feature-card";

// --- Component Props Interface ---
interface FeatureCardProps {
    title: string;
    subtitle: string; // e.g., Job Title, Feature Category
    imageSrc: string;
    imageAlt: string;
    modalContent: { // Content for the pop-up modal
        title?: string; // Optional: Defaults to main title
        subtitle?: string; // Optional: Defaults to main subtitle
        bio: React.ReactNode | string; // Main description/bio in modal
    };
    // Optional Social/Link items - keep structure flexible
    links?: { href: string; icon: React.ElementType; label: string }[];
    className?: string; // Allow passing external classes
    icon?: React.ReactNode
}

export function Card({
    title,
    subtitle,
    imageSrc,
    imageAlt,
    modalContent,
    links = [], // Default to empty array
    className,
    icon,
}: FeatureCardProps) {
    const [isHovered, setIsHovered] = React.useState(false);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const shouldReduceMotion = useReducedMotion();
    const [isIconHovered, setIsIconHovered] = React.useState(false);


    // --- Animation Variants ---
    const overlayVariants = {
        hidden: { scaleY: 0, opacity: 0 },
        visible: {
            scaleY: 1,
            opacity: 1,
            transition: { duration: shouldReduceMotion ? 0 : 0.5, ease: [0.65, 0, 0.35, 1] } // Use smooth ease
        },
    };

    const textVariants = {
        initial: { color: "var(--muted-foreground-rgb)" }, // Use CSS vars if possible
        hover: { color: "var(--card-foreground-rgb)", transition: { duration: 0.3, delay: 0.1 } } // Match your theme
    };

    const imageVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.05, transition: { duration: 0.6, ease: [0.65, 0, 0.35, 1] } }
    };

    const plusIconVariants = {
        initial: { scale: 1, rotate: 0 },
        hover: {
            scale: 1.05,
            rotate: 45,
            transition: { duration: 0.3, ease: [0.65, 0, 0.35, 1] }
        }
    };

    const modalVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.4, ease: [0.65, 0, 0.35, 1] }
        },
        exit: {
            opacity: 0,
            y: 10,
            scale: 0.95,
            transition: { duration: 0.3, ease: [0.65, 0, 0.35, 1] }
        }
    };


    // --- Handlers ---
    const handleOpenModal = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card hover state change if clicking button
        setIsModalOpen(true);
        setIsHovered(false); // Ensure hover state is off when modal opens
    };

    const toggleModal = () => setIsModalOpen(prev => !prev);


    // Define colors using CSS variables for theme friendliness
    // Make sure these variables (--muted-foreground-rgb, --card-foreground-rgb etc.) are defined in your global CSS or theme setup
    // Or replace with Tailwind text classes e.g., text-muted-foreground group-hover:text-card-foreground
    const initialTextColor = "text-muted-foreground"; // Example fallback Tailwind class
    const hoverTextColor = "text-card-foreground";   // Example fallback Tailwind class


    return (
        <motion.div
            className={cn(
                "relative inline-block align-top", // Max width similar to example
                "rounded-[22px] isolate", // Use isolate for stacking, match rounding
                "transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]", // Added transition for lift
                "hover:-translate-y-1.5 hover:shadow-xl", // Subtle lift and shadow on hover
                className
            )}
            onHoverStart={() => !isModalOpen && setIsHovered(true)} // Only trigger hover if modal isn't open
            onHoverEnd={() => setIsHovered(false)}
            // Use animate prop to potentially control text color based on hover state if not using group-hover
            animate={isHovered ? "hover" : "initial"}
            initial="initial"
        // variants allow control if needed, but group-hover is simpler for text
        >
            {/* Added group class for simpler text color hover */}
            <div className="relative w-full min-h-[480px] rounded-[22px] group">

                {/* 1. Muted Background Layer (Consider if needed, or let card bg handle it) */}
                <div className="absolute inset-0 h-[80%] rounded-[22px] bg-muted/10 backdrop-blur-xs shadow-md z-10"></div>
                {/* Usually the BaseCard or DyraneCard component itself provides the main background */}

                {/* 2. Dark Hover Overlay */}
                <motion.div
                    className="absolute top-0 left-0 h-[80%] w-full origin-top rounded-[22px] bg-black/80 dark:bg-primary/70 z-20 pointer-events-none"
                    variants={overlayVariants}
                    initial="hidden"
                    animate={isHovered ? "visible" : "hidden"} // Animate based on hover state (only if modal closed)
                />

                {/* 3. Text Area */}
                <motion.div
                    className={cn(
                        "absolute top-6 left-6 right-6 z-40 transition-colors duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]", // Use transition for color
                        isHovered && !isModalOpen ? "text-white" : "text-muted-foreground", // Example direct color change
                        "text-muted-foreground group-hover:text-white"
                    )}
                    // Use animate prop if textVariants are preferred over group-hover
                    animate={isHovered && !isModalOpen ? "hover" : "initial"}
                    variants={textVariants}
                >
                    <h2 className={cn(
                        "text-2xl font-semibold mb-0.5 leading-tight",
                        isHovered && !isModalOpen ? "text-white" : "text-foreground", // Ensure title stands out slightly more
                        "text-foreground group-hover:text-white"
                    )}>
                        {title}
                    </h2>
                    <p className={cn(
                        "text-md text-foreground/50",
                        isHovered && 'text-white italic', // Italicize on hover
                    )}> {/* Subtitle uses the parent's animated color */}
                        {subtitle}
                    </p>
                </motion.div>

                {/* 4. Image Wrapper */}
                <div className="absolute top-[100px] left-6 right-6 bottom-6 rounded-[18px] overflow-hidden shadow-md z-30">
                    <motion.div
                        className="w-full h-full"
                        variants={imageVariants}
                        initial="initial"
                        animate={isHovered && !isModalOpen ? "hover" : "initial"} // Trigger image scale on hover
                    >
                        <Image
                            src={imageSrc || "/placeholder.svg"} // Use passed src
                            alt={imageAlt || title}
                            fill
                            sizes="(max-width: 768px) 90vw, 33vw" // Example sizes
                            className="object-cover object-center" // Center object position
                        />
                    </motion.div>
                </div>

                {/* 5. Plus Icon Button */}
                {/* Hide plus button when modal is open using AnimatePresence */}
                <AnimatePresence>

                    <motion.button
                        key="plus-button"
                        className={cn(
                            "absolute bottom-[-6px] left-1/2 -translate-x-1/2 z-40",
                            "flex items-center justify-center size-16 rounded-full shadow-lg cursor-pointer",
                            "bg-background text-white",
                            "hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        )}
                        aria-label="Toggle details"
                        onClick={toggleModal}
                        onMouseEnter={() => {
                            setIsIconHovered(true);
                            setIsModalOpen(true); // open modal on hover in
                        }}
                        onMouseLeave={() => {
                            setIsIconHovered(false);
                            setIsModalOpen(false); // close modal on hover out
                        }}

                    >
                        <motion.div
                            variants={plusIconVariants}
                            initial="initial"
                            animate={isIconHovered ? "hover" : "initial"}
                        >
                            <Plus size={32} strokeWidth={2} />
                        </motion.div>
                    </motion.button>

                </AnimatePresence>

                {/* Modal - Renders conditionally outside the main flow, positioned absolutely */}
                <AnimatePresence>
                    {isModalOpen && (
                        <motion.div
                            key="modal-content"
                            className={cn(
                                "absolute inset-0 bottom-0 top-[80px] z-50",
                                "h-[calc(100%-96px-64px)]", // top+bottom padding removed
                                "w-auto max-w-none",         // grow horizontally without constraint
                                "flex flex-col items-center justify-center gap-4 px-6 py-4", // vertical stacking
                                "rounded-[18px] shadow-xl bg-background/80 backdrop-blur-lg border border-border/50"
                            )}
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onMouseLeave={() => setIsModalOpen(false)}
                        >
                            {/* Icon centered */}
                            {icon && (
                                <div className="p-3 w-fit rounded-lg bg-primary/10 text-primary">{icon}</div>
                            )}

                            {/* Bio Content */}
                            <div className="text-foreground text-center font-thin italic leading-relaxed tracking-wide text-base sm:text-lg md:text-xl max-w-[42rem] px-4 sm:px-8">
                                {modalContent.bio}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </motion.div>
    );
}