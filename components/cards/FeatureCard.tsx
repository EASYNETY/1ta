"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { EyeClosed, Plus } from "lucide-react"; // Example Icon
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
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const shouldReduceMotion = useReducedMotion();
    const [isIconHovered, setIsIconHovered] = React.useState(false);

    // Animation Variants
    const overlayVariants = {
        hidden: { scaleY: 0, opacity: 0 },
        visible: { scaleY: 1, opacity: 1, transition: { duration: shouldReduceMotion ? 0 : 0.5 } },
    };

    const imageVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.05, transition: { duration: 0.6 } },
    };

    const plusIconVariants = {
        initial: { scale: 1, rotate: 0 },
        hover: { scale: 1.05, rotate: 45, transition: { duration: 0.3 } },
    };

    const modalVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
    };

    // Handlers
    const handleOpenModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsModalOpen(true);
        setIsHovered(false); // Ensure hover state is off when modal opens
    };

    React.useEffect(() => {
        if (isModalOpen) {
            setIsHovered(false);
        }
    }, [isModalOpen]);

    return (
        <motion.div
            className={cn(
                "relative inline-block align-top rounded-[22px] isolate transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] hover:-translate-y-1.5 hover:shadow-xl",
                className
            )}
            onMouseEnter={() => !isModalOpen && setIsHovered(true)}
            onMouseLeave={() => !isModalOpen && setIsHovered(false)}
            onTouchStart={() => !isModalOpen && setIsHovered(true)}
        >
            {/* Card Container */}
            <div className="relative w-full min-h-[480px] rounded-[22px] group">
                {/* Background and Overlay */}
                <div className="absolute inset-0 h-[80%] rounded-[22px] bg-muted/10 backdrop-blur-xs shadow-md z-10"></div>
                <motion.div
                    className="absolute top-0 left-0 h-[80%] w-full origin-top rounded-[22px] bg-black/80 z-20 pointer-events-none"
                    variants={overlayVariants}
                    initial="hidden"
                    animate={isHovered || isModalOpen ? "visible" : "hidden"}
                />

                {/* Title and Subtitle */}
                <motion.div
                    className="absolute top-6 left-6 right-6 z-40 text-muted-foreground group-hover:text-white"
                    animate={isHovered && !isModalOpen ? "hover" : "initial"}
                >
                    <h2 className="text-2xl font-semibold mb-0.5">{title}</h2>
                    <p className="text-md text-foreground/50">{subtitle}</p>
                </motion.div>

                {/* Image */}
                <div className="absolute top-[100px] left-6 right-6 bottom-6 rounded-[18px] overflow-hidden shadow-md z-30">
                    <motion.div
                        className="w-full h-full"
                        variants={imageVariants}
                        initial="initial"
                        animate={isHovered && !isModalOpen ? "hover" : "initial"}
                    >
                        <Image
                            src={imageSrc || "/placeholder.svg"}
                            alt={imageAlt || title}
                            fill
                            sizes="(max-width: 768px) 90vw, 33vw"
                            className="object-cover object-center"
                        />
                    </motion.div>
                </div>

                {/* Plus Icon Button */}
                <AnimatePresence>
                    <motion.button
                        key="plus-button"
                        className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 z-40 flex items-center justify-center rounded-full bg-background text-white size-16"
                        aria-label="Toggle details"
                        onClick={() => {
                            setIsModalOpen(true);
                        }}
                        onMouseEnter={() => setIsIconHovered(true)}
                        onMouseLeave={() => setIsIconHovered(false)}
                    >
                        <motion.div variants={plusIconVariants} initial="initial" animate={isIconHovered ? "hover" : "initial"}>
                            <Plus size={32} strokeWidth={2} />
                        </motion.div>
                    </motion.button>
                </AnimatePresence>

                {/* Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <motion.div
                            key="modal-content"
                            className="absolute inset-0 z-50 flex items-center justify-center gap-4 px-6 py-4 max-w-none rounded-[18px] bg-background/80 backdrop-blur-lg"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onMouseLeave={() => setIsModalOpen(false)}
                        >
                            <div className="absolute top-4 right-6 cursor-pointer" onClick={() => setIsModalOpen(false)}>
                                <EyeClosed size={24} strokeWidth={2} />
                            </div>
                            {icon && <div className="p-3 w-fit rounded-lg bg-primary/10 text-primary">{icon}</div>}
                            <div className="text-foreground  text-center font-thin italic leading-relaxed tracking-wide text-base max-w-[42rem] px-4 sm:px-8">
                                {modalContent.bio}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
