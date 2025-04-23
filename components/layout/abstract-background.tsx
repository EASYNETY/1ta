// src/components/background/GridBackground.tsx (or AbstractBackground.tsx)
"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import React, { useEffect, useId, useRef, useState, useCallback } from "react";

// --- Component Props ---
interface AbstractBackground {
    className?: string;
    gridSize?: number; // Size of each grid cell
    strokeDasharray?: number | string; // For dashed lines in the pattern
    numSquares?: number; // Number of animating squares
    maxOpacity?: number; // Max opacity for animating squares
    duration?: number; // Duration for square fade animation
    repeatDelay?: number; // Delay before square animation repeats
    lineColor?: string; // CSS color variable or value for grid lines
    squareColor?: string; // CSS color variable or value for animating squares
}

// --- Type for Square State ---
interface Square {
    id: number;
    pos: [number, number]; // Explicitly a tuple of two numbers [x, y]
}

export function AbstractBackground({
    className,
    gridSize = 40, // Default grid size
    strokeDasharray = 0, // Default: solid lines
    numSquares = 30, // Reduced default number for potentially better performance
    maxOpacity = 1,
    duration = 3, // Slightly faster animation
    repeatDelay = 1, // Increased delay between square fades
}: AbstractBackground) {
    const uniqueId = useId(); // Unique ID for SVG defs
    const patternId = `${uniqueId}-pattern`;
    const maskId = `${uniqueId}-mask`;
    const fadeMaskId = `${uniqueId}-fade-mask`;
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const lineColor = isDark ? "#C99700" : "#FFD400";
    const squareColor = isDark ? "#C99700" : "#FFD400";

    const containerRef = useRef<SVGSVGElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    // Explicitly type the state with the Square interface
    const [squares, setSquares] = useState<Square[]>([]);

    // --- Helper Function to get Random Grid Position ---
    // useCallback ensures the function identity is stable unless dependencies change
    const getPos = useCallback((): [number, number] => { // Ensure return type is tuple
        if (!dimensions.width || !dimensions.height) {
            return [0, 0]; // Default position if dimensions aren't set yet
        }
        return [
            Math.floor((Math.random() * dimensions.width) / gridSize), // x coordinate
            Math.floor((Math.random() * dimensions.height) / gridSize), // y coordinate
        ];
    }, [dimensions.width, dimensions.height, gridSize]); // Dependencies

    // --- Helper Function to Generate Squares ---
    // useCallback for stability
    const generateSquares = useCallback((count: number): Square[] => {
        // Ensure return type matches state type
        return Array.from({ length: count }, (_, i): Square => ({
            id: i,
            pos: getPos(),
        }));
    }, [getPos]); // Dependency

    // --- Function to Update a Single Square's Position ---
    // useCallback for stability
    const updateSquarePosition = useCallback((id: number) => {
        setSquares((currentSquares) =>
            currentSquares.map((sq) =>
                sq.id === id
                    ? { ...sq, pos: getPos() } // Get a new valid position
                    : sq
            )
        );
        // Removed console log
    }, [getPos]); // Dependency

    // --- Effect to Initialize and Update Squares Based on Dimensions ---
    useEffect(() => {
        if (dimensions.width && dimensions.height) {
            // Generate initial set of squares when dimensions are first available
            setSquares(generateSquares(numSquares));
        }
        // Intentionally disable exhaustive-deps for generateSquares
        // We only want this to run when dimensions change significantly,
        // not every time getPos changes (which depends on dimensions anyway).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dimensions.width, dimensions.height, numSquares]);

    // --- Effect for Resize Observer ---
    useEffect(() => {
        // Use a ResizeObserver to update dimensions when the container size changes
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                // Use requestAnimationFrame to avoid layout thrashing
                window.requestAnimationFrame(() => {
                    if (entry.contentRect) {
                        setDimensions({
                            width: entry.contentRect.width,
                            height: entry.contentRect.height,
                        });
                    }
                });
            }
        });

        const currentRef = containerRef.current; // Capture ref value
        if (currentRef) {
            resizeObserver.observe(currentRef);
        }

        // Cleanup function to disconnect observer
        return () => {
            if (currentRef) {
                resizeObserver.unobserve(currentRef);
            }
            resizeObserver.disconnect();
        };
    }, []); // Empty dependency array ensures this runs only once on mount/unmount

    // --- Render SVG ---
    return (
        <svg
            ref={containerRef}
            aria-hidden="true"
            className={cn(
                "pointer-events-none absolute inset-0 h-full w-full -z-10", // Position behind, disable interaction
                className
            )}
        >
            <defs>
                <pattern
                    id={patternId}
                    width={gridSize}
                    height={gridSize}
                    patternUnits="userSpaceOnUse"
                >
                    {/* Vertical line */}
                    <path
                        d={`M0 0 V${gridSize - 1}`}
                        fill="none"
                        stroke={lineColor}
                        strokeWidth={1}
                        strokeDasharray={strokeDasharray}
                        strokeLinecap="butt"
                    />
                    {/* Horizontal line */}
                    <path
                        d={`M0 0 H${gridSize - 1}`}
                        fill="none"
                        stroke={lineColor}
                        strokeWidth={1}
                        strokeDasharray={strokeDasharray}
                        strokeLinecap="butt"
                    />
                </pattern>


                {/* Radial Gradient Mask for Fading Edges */}
                <radialGradient id={maskId} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    {/* Gradient starts opaque in center, fades to transparent */}
                    <stop offset="0%" stopColor="white" stopOpacity="1" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>

                {/* Apply the Radial Gradient as a Mask */}
                <mask id={fadeMaskId}>
                    {/* Use the mask gradient to fill the mask area */}
                    <rect width="100%" height="100%" fill={`url(#${maskId})`} />
                </mask>
            </defs>

            {/* Draw the Grid Pattern using the definition */}
            {/* Apply the fade mask to the grid pattern */}
            <rect
                width="100%"
                height="100%"
                fill={`url(#${patternId})`}
                mask={`url(#${fadeMaskId})`} // Apply the fade mask here
            />

            {/* Container for Animating Squares */}
            {/* Apply the same fade mask to the squares so they also fade at edges */}
            <g mask={`url(#${fadeMaskId})`}>
                {squares.map(({ pos: [x, y], id }, index) => (
                    <motion.rect
                        key={`${id}-${x}-${y}`} // Ensure key includes position for re-renders
                        initial={{ opacity: 0 }}
                        animate={{ opacity: maxOpacity * (Math.random() * 0.5 + 0.5) }} // Randomize opacity slightly
                        transition={{
                            duration: duration * (Math.random() * 0.5 + 0.75), // Randomize duration slightly
                            repeat: Infinity,
                            delay: index * (repeatDelay / numSquares) + Math.random() * repeatDelay, // Staggered & randomized delay
                            repeatType: "reverse", // Fade in and out
                            ease: "easeInOut",
                        }}
                        // Call updateSquarePosition when fade-out part of animation completes
                        // This might require adjusting timing or using onUpdate if onAnimationComplete isn't reliable for repeats
                        // For simplicity, let's rely on the continuous animation for now.
                        onAnimationComplete={() => updateSquarePosition(id)} // Re-enable if needed and tested
                        width={gridSize - 1} // Slightly smaller than cell
                        height={gridSize - 1}
                        x={x * gridSize + 0.5} // Offset slightly for stroke width
                        y={y * gridSize + 0.5}
                        fill={squareColor} // Use CSS variable/value
                        fillOpacity={maxOpacity} // Opacity handled by animation
                        strokeWidth={0} // No stroke needed
                    />
                ))}
            </g>
        </svg>
    );
}