// providers/MouseTrackerProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, useMotionValue, MotionValue } from "framer-motion"; // Import motion hooks

// Interface for the context value - providing MotionValues
interface MousePositionMotionValues {
    x: MotionValue<number>;
    y: MotionValue<number>;
}

// Create MotionValues outside the component to have a stable default reference
const defaultX = new MotionValue(-1);
const defaultY = new MotionValue(-1);

// Create context with the correct type and default MotionValues
const MouseContext = createContext<MousePositionMotionValues>({
    x: defaultX,
    y: defaultY,
});

// Hook to consume the MotionValues
export const useMousePositionValues = () => useContext(MouseContext); // Rename for clarity

export const MouseTrackerProvider = ({ children }: { children: React.ReactNode }) => {
    // Create motion values within the provider instance
    const mouseX = useMotionValue(-1);
    const mouseY = useMotionValue(-1);

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            // Update motion values directly - NO RENDER TRIGGERED HERE
            mouseX.set(event.clientX);
            mouseY.set(event.clientY);
        };

        // Add listener on mount
        window.addEventListener("mousemove", handleMouseMove);

        // Remove listener on unmount
        return () => window.removeEventListener("mousemove", handleMouseMove);

        // Empty dependency array - run only once
    }, []); // Keep empty array!

    // Provide the *motion values* through context
    return (
        <MouseContext.Provider value={{ x: mouseX, y: mouseY }}>
            {children}
        </MouseContext.Provider>
    );
};

// Keep the old hook for compatibility if needed, but prefer the new one
// export const useMousePosition = () => {
//    console.warn("useMousePosition is deprecated for direct state, use useMousePositionValues for MotionValues");
//    // This would require subscribing to the motion values if needed here
//    // For simplicity, encourage using useMousePositionValues directly in components
//    return { x: -1, y: -1 }; // Placeholder, not reactive state
// };
