// components/theme-provider.tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { Moon, SunDim } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Import AnimatePresence
import { cn } from "@/lib/utils";

// --- ThemeProvider Component (remains the same) ---
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}


// --- Refined Animated Switch ThemeToggle ---
export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    const isDark = resolvedTheme === 'dark';

    const toggleTheme = () => {
        setTheme(isDark ? 'light' : 'dark');
    };

    // --- Styling Configuration (Adjust to DyraneUI Tokens) ---
    const switchWidth = "w-12";      // Slightly smaller width (48px)
    const switchHeight = "h-6";      // (24px)
    const thumbSize = "size-5";      // (20px) - Leaves 2px padding on top/bottom
    const trackPadding = "p-.5";    // (2px) - Padding inside the track
    const thumbOffset = "0px";     // Fine-tune thumb start/end position (slightly more than padding)

    // Track background colors
    const lightTrackBg = "bg-muted";
    const darkTrackBg = "bg-muted"; // Example dark mode active color

    // Thumb background color
    const thumbBg = "bg-white dark:bg-slate-950";

    // Icon colors
    const sunColor = "text-primary";
    const moonColor = "text-primary";

    // Spring animation for the thumb
    const spring = {
        type: "spring",
        stiffness: 500, // Slightly less stiff for smoother feel
        damping: 30,    // Standard damping
    };

    // Variants for icon animation (cross-fade)
    const iconVariants = {
        initial: { opacity: 0, scale: 0.6, rotate: -90 },
        animate: { opacity: 1, scale: 1, rotate: 0 },
        exit: { opacity: 0, scale: 0.6, rotate: 90 },
    };
    const iconTransition = { duration: 0.2, ease: "easeIn" };


    if (!mounted) {
        // Placeholder to prevent layout shift
        return <div className={cn("rounded-full", switchWidth, switchHeight)} />;
    }

    return (
        <button // Use a button for better semantics and focus handling
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            role="switch"
            aria-checked={isDark}
            className={cn(
                "relative flex cursor-pointer items-center rounded-full border border-transparent transition-all duration-300 ease-[cubic-bezier(0.77, 0, 0.175, 1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                switchWidth,
                switchHeight,
                trackPadding,
                isDark ? darkTrackBg : lightTrackBg,

                // ✨ Add glowing ring on hover
                isDark
                    ? "hover:ring-1 hover:ring-[#FFD400] hover:ring-offset-1"
                    : "hover:ring-2 hover:ring-[#C99700] hover:ring-offset-1"
            )}

        >
            <span className="sr-only">
                {`Current theme: ${resolvedTheme}`}
            </span>

            {/* Motion Thumb - contains icons */}
            <motion.span // Use span for the thumb container
                layout // Enable smooth layout animation
                transition={spring} // Apply spring transition
                // Position thumb using translateX for smoother animation with layout
                className={cn(
                    "absolute flex items-center justify-center rounded-full shadow-sm",
                    thumbBg,
                    thumbSize
                    // Apply transform based on theme state
                    // isDark ? 'translate-x-[calc(100%-4px)]' : 'translate-x-[4px]' // Translate doesn't work well with layout prop here
                )}
                // Let layout handle positioning based on justify content of parent in next step (or use style)
                style={{
                    // Position based on theme using left/right
                    left: isDark ? 'auto' : thumbOffset,
                    right: isDark ? thumbOffset : 'auto'
                }}
            >
                {/* AnimatePresence for icon cross-fade */}
                <AnimatePresence initial={false} mode="wait">
                    {isDark ? (
                        <motion.div
                            key="moon" // Unique key for AnimatePresence
                            variants={iconVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={iconTransition}
                        >
                            <Moon className={cn("size-3.5", moonColor)} /> {/* Smaller icon */}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sun" // Unique key for AnimatePresence
                            variants={iconVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={iconTransition}
                        >
                            <SunDim className={cn("size-3.5", sunColor)} /> {/* Smaller icon */}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.span>
        </button>
    );
}