"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VerificationBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The size of the badge
   * @default "sm"
   */
  size?: "xs" | "sm" | "md" | "lg";
  
  /**
   * The color of the badge
   * @default "gold"
   */
  color?: "gold" | "blue" | "primary";
  
  /**
   * Whether to show the tooltip
   * @default true
   */
  showTooltip?: boolean;
  
  /**
   * The tooltip text
   * @default "Verified Active User"
   */
  tooltipText?: string;
}

/**
 * A verification badge component that shows a checkmark in a circle
 * Used to indicate verified or active users
 */
export function VerificationBadge({
  size = "sm",
  color = "gold",
  showTooltip = true,
  tooltipText = "Verified Active User",
  className,
  ...props
}: VerificationBadgeProps) {
  // Size classes
  const sizeClasses = {
    xs: "h-3 w-3 text-[0.5rem]",
    sm: "h-4 w-4 text-[0.6rem]",
    md: "h-5 w-5 text-[0.7rem]",
    lg: "h-6 w-6 text-[0.8rem]",
  };
  
  // Color classes
  const colorClasses = {
    gold: "bg-amber-500 text-white border-amber-600",
    blue: "bg-blue-500 text-white border-blue-600",
    primary: "bg-primary text-primary-foreground border-primary-600",
  };
  
  const badge = (
    <div
      className={cn(
        "rounded-full flex items-center justify-center border",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      {...props}
    >
      <CheckIcon className="h-[70%] w-[70%] stroke-[3]" />
    </div>
  );
  
  if (!showTooltip) {
    return badge;
  }
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
