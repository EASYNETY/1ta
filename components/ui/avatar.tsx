"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";
import { VerificationBadge } from "./verification-badge";
import { User } from "@/types/user.types";

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted/25 backdrop-blur-sm border border-primary/50 flex size-full items-center justify-center rounded-full text-primary font-medium",
        className,
      )}
      {...props}
    />
  );
}

interface AvatarWithVerificationProps extends React.ComponentProps<typeof AvatarPrimitive.Root> {
  user?: User | null;
  showVerification?: boolean;
  verificationSize?: "xs" | "sm" | "md" | "lg";
}

/**
 * Avatar component with verification badge for active users
 */
function AvatarWithVerification({
  user,
  showVerification = true,
  verificationSize = "sm",
  className,
  ...props
}: AvatarWithVerificationProps) {
  const isActive = user?.isActive === true;

  // Calculate badge position and size based on avatar size
  const getBadgePosition = () => {
    // Extract size information from className
    const sizeMatch = className?.match(/(w-\d+|h-\d+|size-\d+)/);
    const isLarge = className?.includes('h-10') || className?.includes('w-10') ||
                   className?.includes('h-12') || className?.includes('w-12') ||
                   className?.includes('h-16') || className?.includes('w-16') ||
                   className?.includes('h-24') || className?.includes('w-24') ||
                   className?.includes('h-32') || className?.includes('w-32') ||
                   className?.includes('size-10') || className?.includes('size-12') ||
                   className?.includes('size-16') || className?.includes('size-24') ||
                   className?.includes('size-32');

    // For larger avatars, position the badge more precisely
    if (isLarge) {
      return "absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4";
    }

    // For smaller avatars, use a simpler position
    return "absolute -top-1 -right-1";
  };

  return (
    <div className="relative inline-block">
      <Avatar className={className} {...props} />

      {showVerification && isActive && (
        <div className={getBadgePosition()}>
          <VerificationBadge
            size={verificationSize}
            color="gold"
            tooltipText={`${user.name} is a verified active user`}
          />
        </div>
      )}
    </div>
  );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarWithVerification };
