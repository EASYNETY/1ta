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

interface AvatarWithVerificationProps {
  user?: User | null;
  showVerification?: boolean;
  verificationSize?: "xs" | "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode;
}

/**
 * Avatar component with verification badge for active users
 */
function AvatarWithVerification({
  user,
  showVerification = true,
  verificationSize = "sm",
  className,
  children,
}: AvatarWithVerificationProps) {
  const isActive = user?.isActive === true;

  // Position the badge relative to the avatar border
  const getBadgePosition = () => {
    return "absolute top-[10%] right-[10%] transform translate-x-1/4 translate-y-1/4";
  };

  return (
    <div className="relative inline-block">
      <Avatar className={className}>
        {children}
      </Avatar>

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
