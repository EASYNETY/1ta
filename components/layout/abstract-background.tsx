// components/layout/abstract-background.tsx

"use client";

import { cn } from "@/lib/utils";
import { useMousePositionValues } from "@/providers/MouseTrackerProvider";
import { useDebouncedEffect } from "@/hooks/useDebouncedEffect";
import { motion, useSpring, useTransform } from "framer-motion";
import { useTheme } from "next-themes";
import React, { useEffect, useId, useRef, useState, useCallback, useMemo } from "react";

// --- Interfaces ---
interface AbstractBackground {
    className?: string;
    gridSize?: number;
    strokeDasharray?: number | string;
    numSquares?: number;
    maxOpacity?: number;
    duration?: number;
    repeatDelay?: number;
    debounceDelay?: number;
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
    maxOpacity = 0.8,
    duration = 3,
    repeatDelay = 1,
    debounceDelay = 300,
}: AbstractBackground) {
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
                if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    setContainerOffset({ left: rect.left, top: rect.top });
                }
            });
        };

        updateLayout();

        const resizeObserver = new ResizeObserver(requestUpdateLayout);
        resizeObserver.observe(currentRef);
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (currentRef) resizeObserver.unobserve(currentRef);
            resizeObserver.disconnect();
            if (layoutRafId) cancelAnimationFrame(layoutRafId);
            if (scrollRafId) cancelAnimationFrame(scrollRafId);
        };
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
    );
    const opacitySpringConfig = { stiffness: 100, damping: 50 };
    const springOpacity = useSpring(isInside, opacitySpringConfig);

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
    }, [getPos, dimensions.width, dimensions.height]);

    // --- *** DEBOUNCED Effect for Generating Squares *** ---
    useDebouncedEffect(() => {
        // Check dimensions again inside the debounced effect
        if (dimensions.width && dimensions.height) {
            setSquares(generateSquares(numSquares));
        }
    },
        [dimensions.width, dimensions.height, numSquares, generateSquares],
        debounceDelay
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
                <radialGradient id={maskId} cx="50%" cy="50%" r="45%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="white" stopOpacity="1" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>

                {/* Mask Definition */}
                <mask id={fadeMaskId}>
                    <rect width="100%" height="100%" fill={`url(#${maskId})`} />
                    <motion.rect
                        style={{
                            x: springX,
                            y: springY,
                        }}
                        animate={{
                            scale: [2.2, 2.4, 2.2],
                            transition: {
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            },
                        }}
                        width={gridSize * 2.5}
                        height={gridSize * 2.5}
                        fill="white"
                        opacity={1}
                        filter="blur(24px)"  // Updated for softer edges
                    />
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
                        key={`${id}-${x}-${y}`}
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
                <radialGradient id="squareGlowGradient" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor={isDark ? "#C99700" : "#000000"} stopOpacity={isDark ? "0.15" : "0.05"} />
                    <stop offset="100%" stopColor={isDark ? "#C99700" : "#000000"} stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Mouse Follower */}
            <motion.rect
                key="mouseFollower"
                style={{
                    x: springX,
                    y: springY,
                }}
                animate={{
                    scale: [1, 1.05, 1],
                    transition: {
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                    },
                }}
                width={gridSize * 2.5}
                height={gridSize * 2.5}
                fill={`url(#squareGlowGradient)`}
                opacity={0.8}
                rx={gridSize * 0.2}
                ry={gridSize * 0.2}
                filter="blur(16px)"
            />

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
