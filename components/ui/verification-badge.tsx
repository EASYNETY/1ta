"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SealCheck } from "phosphor-react";
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
        "flex items-center justify-center",
        className
      )}
      {...props}
    >
      <SealCheck
        size={size === "xs" ? 14 : size === "sm" ? 16 : size === "md" ? 20 : 24}
        weight="fill"
        className={cn(
          "drop-shadow-md",
          color === "gold" ? "text-amber-500" :
          color === "blue" ? "text-blue-500" :
          "text-primary"
        )}
      />
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
