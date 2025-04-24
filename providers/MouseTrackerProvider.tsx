"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface MousePosition {
  x: number;
  y: number;
}

const MouseContext = createContext<MousePosition>({ x: -1, y: -1 });

export const useMousePosition = () => useContext(MouseContext);

export const MouseTrackerProvider = ({ children }: { children: React.ReactNode }) => {
  const [mousePos, setMousePos] = useState<MousePosition>({ x: -1, y: -1 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <MouseContext.Provider value={mousePos}>
      {children}
    </MouseContext.Provider>
  );
};
