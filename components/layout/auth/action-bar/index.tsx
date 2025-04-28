"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Actions } from "./actions";
import { Content } from "./content";

export function ActionBar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Auto collapse on smaller screens
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 1280); // collapse below xl
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // initial check

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 280 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "hidden md:flex flex-col border-l bg-background/60 backdrop-blur-md",
          "transition-all overflow-hidden"
        )}
      >
        <div className="flex flex-col flex-1">
          {/* Actions (Top Buttons) */}
          <div className="p-2">
            <Actions isCollapsed={isCollapsed} />
          </div>

          {/* Divider */}
          <div className="border-t my-2" />

          {/* Contextual Page Content */}
          <div className="flex-1 overflow-y-auto p-2">
            <Content isCollapsed={isCollapsed} />
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
