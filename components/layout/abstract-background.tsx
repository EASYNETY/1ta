// components/layout/AbstractBackground.tsx
"use client";

import { cn } from "@/lib/utils";
import { useMousePositionValues } from "@/providers/MouseTrackerProvider";
// Import the custom hook
import { useDebouncedEffect } from "@/hooks/useDebouncedEffect"; // Adjust path as needed
import { motion, useSpring, useTransform } from "framer-motion";
import { useTheme } from "next-themes";
import React, { useEffect, useId, useRef, useState, useCallback, useMemo } from "react"; // Added useMemo for IDs

// --- Interfaces ---
interface AbstractBackground {
    className?: string;
    gridSize?: number;
    strokeDasharray?: number | string;
    numSquares?: number;
    maxOpacity?: number;
    duration?: number;
    repeatDelay?: number;
    debounceDelay?: number; // Add prop for debounce delay
}
interface Square {
    id: number;
    pos: [number, number];
}

export function AbstractBackground({
    className,
    gridSize = 40,
    strokeDasharray = 0,
    numSquares = 30,
    maxOpacity = 1,
    duration = 3,
    repeatDelay = 1,
    debounceDelay = 300, // Default debounce delay for square generation
}: AbstractBackground) {
    // Memoize IDs derived from useId - ensures stability if component structure changes
    // Although useId itself is stable per instance, explicit memoization is clearest practice.
    const uniqueId = useId();
    const patternId = useMemo(() => `${uniqueId}-pattern`, [uniqueId]);
    const maskId = useMemo(() => `${uniqueId}-mask`, [uniqueId]);
    const fadeMaskId = useMemo(() => `${uniqueId}-fade-mask`, [uniqueId]);

    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const containerRef = useRef<SVGSVGElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [squares, setSquares] = useState<Square[]>([]);
    const { x: mouseClientX, y: mouseClientY } = useMousePositionValues();
    const [containerOffset, setContainerOffset] = useState({ left: 0, top: 0 });

    // Colors derived from theme
    const lineColor = isDark ? "#C99700" : "#FFD400"; // Using original colors
    const squareColor = isDark ? "#C99700" : "#FFD400";

    // --- Layout Update Logic (Optimized) ---
    useEffect(() => {
        const currentRef = containerRef.current;
        if (!currentRef) return;

        let layoutRafId: number | null = null;
        let scrollRafId: number | null = null;

        const updateLayout = () => {
            const rect = currentRef.getBoundingClientRect();
            // Update both dimensions and offset together on resize
            setDimensions({ width: rect.width, height: rect.height });
            setContainerOffset({ left: rect.left, top: rect.top });
        };

        const requestUpdateLayout = () => {
            if (layoutRafId) cancelAnimationFrame(layoutRafId);
            layoutRafId = requestAnimationFrame(updateLayout);
        };

        const handleScroll = () => {
            if (scrollRafId) cancelAnimationFrame(scrollRafId);
            scrollRafId = requestAnimationFrame(() => {
                if (containerRef.current) { // Check ref existence inside rAF
                    const rect = containerRef.current.getBoundingClientRect();
                    setContainerOffset({ left: rect.left, top: rect.top });
                }
            });
        };

        // Initial layout calculation
        updateLayout();

        const resizeObserver = new ResizeObserver(requestUpdateLayout);
        resizeObserver.observe(currentRef);
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Cleanup
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (currentRef) { // Check ref before unobserving
                resizeObserver.unobserve(currentRef);
            }
            resizeObserver.disconnect();
            if (layoutRafId) cancelAnimationFrame(layoutRafId);
            if (scrollRafId) cancelAnimationFrame(scrollRafId);
        };
        // This effect runs once on mount
    }, []);


    // --- Mouse Coordinate Transforms and Springs ---
    const mouseSvgX = useTransform(mouseClientX, latestClientX => {
        const relativeX = latestClientX - containerOffset.left;
        const gridX = Math.floor(relativeX / gridSize);
        return gridX * gridSize + 0.5;
    });
    const mouseSvgY = useTransform(mouseClientY, latestClientY => {
        const relativeY = latestClientY - containerOffset.top;
        const gridY = Math.floor(relativeY / gridSize);
        return gridY * gridSize + 0.5;
    });
    const positionSpringConfig = { stiffness: 350, damping: 30, mass: 0.8 };
    const springX = useSpring(mouseSvgX, positionSpringConfig);
    const springY = useSpring(mouseSvgY, positionSpringConfig);

    // --- isInside Transform and Opacity Spring ---
    const isInside = useTransform<number, number>(
        [mouseClientX, mouseClientY],
        ([latestX, latestY]) => {
            const relativeX = latestX - containerOffset.left;
            const relativeY = latestY - containerOffset.top;
            // Use current dimensions from state
            return relativeX >= 0 &&
                relativeX <= dimensions.width &&
                relativeY >= 0 &&
                relativeY <= dimensions.height
                ? 1 : 0;
        }
        // This transform implicitly depends on state (dimensions, containerOffset)
        // Updates correctly because state changes trigger re-renders where the
        // transform function gets the latest state values via closure.
    );
    const opacitySpringConfig = { stiffness: 400, damping: 40 };
    // Initialize the spring with the *current* isInside value, will animate if needed
    const springOpacity = useSpring(isInside, opacitySpringConfig);


    // --- Random Squares Logic ---
    const getPos = useCallback((): [number, number] => {
        if (!dimensions.width || !dimensions.height) return [0, 0];
        return [
            Math.floor((Math.random() * dimensions.width) / gridSize),
            Math.floor((Math.random() * dimensions.height) / gridSize),
        ];
    }, [dimensions.width, dimensions.height, gridSize]);

    const generateSquares = useCallback((count: number): Square[] => {
        // Ensure dimensions are valid before generating positions
        if (!dimensions.width || !dimensions.height) return [];
        return Array.from({ length: count }, (_, i): Square => ({
            id: i,
            pos: getPos(),
        }));
    }, [getPos, dimensions.width, dimensions.height]); // Add dimension deps here for safety

    // --- *** DEBOUNCED Effect for Generating Squares *** ---
    useDebouncedEffect(() => {
        // Check dimensions again inside the debounced effect
        if (dimensions.width && dimensions.height) {
            console.log("Debounced: Regenerating squares"); // For debugging
            setSquares(generateSquares(numSquares));
        }
    },
        [dimensions.width, dimensions.height, numSquares, generateSquares], // Dependencies
        debounceDelay // Use the prop for delay duration
    );

    // --- Render SVG ---
    return (
        <svg
            ref={containerRef}
            aria-hidden="true"
            className={cn(
                "pointer-events-none absolute inset-0 h-full w-full -z-10 isolate",
                className
            )}
        >
            {/* Defs */}
            <defs>
                {/* Pattern Definition */}
                <pattern id={patternId} width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                    <path d={`M0 0 V${gridSize - 1}`} fill="none" stroke={lineColor} strokeWidth={1} strokeDasharray={strokeDasharray} strokeLinecap="butt" />
                    <path d={`M0 0 H${gridSize - 1}`} fill="none" stroke={lineColor} strokeWidth={1} strokeDasharray={strokeDasharray} strokeLinecap="butt" />
                </pattern>

                {/* Mask Gradient Definition */}
                <radialGradient id={maskId} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="white" stopOpacity="1" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>

                {/* Mask Definition */}
                <mask id={fadeMaskId}>
                    <rect width="100%" height="100%" fill={`url(#${maskId})`} />
                </mask>

            </defs>

            {/* Grid Pattern */}
            <rect
                width="100%"
                height="100%"
                fill={`url(#${patternId})`}
                mask={`url(#${fadeMaskId})`}
            />

            {/* Random Squares */}
            <g mask={`url(#${fadeMaskId})`}>
                {squares.map(({ pos: [x, y], id }, index) => (
                    <motion.rect
                        key={`${id}-${x}-${y}`} // Stable key needed
                        initial={{ opacity: 0 }}
                        animate={{ opacity: maxOpacity * (Math.random() * 0.5 + 0.5) }}
                        transition={{
                            duration: duration * (Math.random() * 0.5 + 0.75),
                            repeat: Infinity,
                            delay: index * (repeatDelay / numSquares) + Math.random() * repeatDelay,
                            repeatType: "reverse",
                            ease: "easeInOut",
                        }}
                        width={gridSize - 1}
                        height={gridSize - 1}
                        x={x * gridSize + 0.5}
                        y={y * gridSize + 0.5}
                        fill={squareColor}
                        strokeWidth={0}
                    />
                ))}
            </g>

            {/* Beacon Gradient Definition */}
            <defs>
                <radialGradient id="beaconGradient" r="80%" cx="50%" cy="50%">
                    <stop offset="0%" stopColor={squareColor} stopOpacity="0.6" />
                    <stop offset="100%" stopColor={squareColor} stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Mouse Follower Beacon */}
            {dimensions.width > 0 && dimensions.height > 0 && (
                <motion.rect
                    key="mouse-square"
                    initial={{ opacity: 0, scale: 1, rotate: 0 }}
                    animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 1.5, -1.5, 0],
                        transition: {
                            scale: {
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            },
                            rotate: {
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }
                        }
                    }}
                    style={{
                        x: springX,
                        y: springY,
                        opacity: springOpacity,
                        filter: isDark
                            ? "drop-shadow(0 0 6px rgba(201, 151, 0, 0.3)) drop-shadow(0 0 10px rgba(201, 151, 0, 0.5))"
                            : "drop-shadow(0 0 5px rgba(255, 212, 0, 0.15)) drop-shadow(0 0 7px rgba(255, 212, 0, 0.25))",
                        mixBlendMode: isDark ? "screen" : "multiply",
                        transformOrigin: "center",
                    }}
                    width={gridSize - 1}
                    height={gridSize - 1}
                    fill="url(#beaconGradient)"
                    strokeWidth={0}
                />
            )}

        </svg>
    );
}