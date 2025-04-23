"use client"

import { cn } from "@/lib/utils";

interface AbstractBackgroundProps {
    className?: string;
    lightSvgUrl?: string; // Path relative to /public
    darkSvgUrl?: string;  // Path relative to /public
    opacity?: string;     // e.g., 'opacity-10', 'opacity-20'
}

/**
 * AbstractBackground component renders a responsive SVG background
 * that adapts to light and dark themes.
 *
 * @param {string} className - Additional classes for customization.
 * @param {string} lightSvgUrl - URL for the light mode SVG.
 * @param {string} darkSvgUrl - URL for the dark mode SVG.
 * @param {string} opacity - Opacity classes for the SVG background.
 */
export function AbstractBackground({ className = "",
    lightSvgUrl = "/grid-pattern-light.svg", // Default light SVG path
    darkSvgUrl = "/grid-pattern-dark.svg",   // Default dark SVG path
    opacity = "opacity-15 dark:opacity-10", // Default opacity
}: AbstractBackgroundProps) {
    // Note: Background images need to be handled carefully for theme switching.
    // The easiest way is often two separate elements conditionally rendered or
    // using CSS variables set by the theme. Let's use two divs.

    return (
        <div
            className={cn(
                "absolute inset-0 overflow-hidden -z-10 pointer-events-none", // Prevent interaction
                className
            )}
            aria-hidden="true"
        >
            {/* Light Mode SVG Background */}
            <div
                className={cn(
                    "absolute inset-0 bg-repeat dark:hidden", // Show only in light mode
                    opacity
                )}
                style={{ backgroundImage: `url(${lightSvgUrl})` }}
            />
            {/* Dark Mode SVG Background */}
            <div
                className={cn(
                    "absolute inset-0 bg-repeat hidden dark:block", // Show only in dark mode
                    opacity
                )}
                style={{ backgroundImage: `url(${darkSvgUrl})` }}
            />

            {/* Optional: Add subtle animated gradient overlay or shapes on top of grid */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background/0 via-background/50 to-background opacity-90"></div>
        </div>
    );
}