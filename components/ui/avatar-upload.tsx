"use client";

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Pencil, X } from 'lucide-react';
import { useMediaUpload, UseMediaUploadOptions } from '@/hooks/use-media-upload';
import { MediaType } from '@/lib/services/media-upload-service';

export interface AvatarUploadProps {
  /**
   * The initial URL of the avatar
   */
  initialUrl?: string | null;

  /**
   * The name to use for the fallback avatar
   */
  name?: string;

  /**
   * The size of the avatar
   * @default "lg"
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Whether the avatar is disabled
   */
  disabled?: boolean;

  /**
   * Callback when the avatar URL changes
   */
  onUrlChange?: (url: string | null) => void;

  /**
   * Additional options for the upload hook
   */
  uploadOptions?: Partial<UseMediaUploadOptions>;

  /**
   * Additional class name
   */
  className?: string;
}

/**
 * A component for uploading and displaying an avatar
 */
export function AvatarUpload({
  initialUrl,
  name = 'User',
  size = 'lg',
  disabled = false,
  onUrlChange,
  uploadOptions,
  className,
}: AvatarUploadProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Initialize the upload hook
  const {
    previewUrl,
    remoteUrl,
    isUploading,
    error,
    selectFile,
    reset,
  } = useMediaUpload({
    mediaType: MediaType.IMAGE,
    initialUrl,
    autoUpload: true,
    onUploadSuccess: (response) => {
      console.log('Avatar uploaded successfully:', response);
      onUrlChange?.(response.data.url);
    },
    ...uploadOptions,
  });

  // Handle touch events for mobile
  const handleTouchStart = () => {
    if (!disabled && !isUploading) {
      setIsTouched(true);
    }
  };

  const handleTouchEnd = () => {
    // We'll keep the touch state active for a short period to allow the user to tap
    // This creates a better mobile experience
    setTimeout(() => {
      setIsTouched(false);
    }, 1000);
  };

  // Determine avatar size
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32',
  };

  // Determine button size
  const buttonSize = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
  };

  // Handle file selection
  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        selectFile(file);
      }
    };
    input.click();
  };

  // Handle remove
  const handleRemove = () => {
    reset();
    onUrlChange?.(null);
  };

  return (
    <div className="relative inline-block">
      <div
        className="relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={!isUploading && !disabled ? handleFileSelect : undefined}
      >
        <Avatar className={`${sizeClasses[size]} ${className}`}>
          <AvatarImage src={previewUrl || initialUrl || undefined} />
          <AvatarFallback className="bg-muted/25 backdrop-blur-sm border border-primary/50 text-primary font-medium">{getInitials(name)}</AvatarFallback>
        </Avatar>

        {/* Edit overlay - show on hover or touch */}
        {(isHovering || isTouched) && !isUploading && !disabled && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer transition-opacity duration-200"
            aria-hidden="true"
          >
            <Pencil className="h-1/3 w-1/3 text-white" />
          </div>
        )}

        {/* Mobile edit hint - small indicator to show it's editable */}
        {!isHovering && !isTouched && !isUploading && !disabled && (
          <div
            className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 shadow-sm border border-background hidden md:hidden sm:block"
            aria-hidden="true"
          >
            <Pencil className="h-3 w-3" />
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
          <Loader2 className="h-1/3 w-1/3 text-white animate-spin" />
        </div>
      )}

      {/* Remove button - only show if there's an image */}
      {(previewUrl || initialUrl) && !disabled && !isUploading && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className={`absolute -top-2 -right-2 rounded-full ${buttonSize[size === 'sm' ? 'sm' : 'md']}`}
          onClick={handleRemove}
        >
          <X className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
          <span className="sr-only">Remove avatar</span>
        </Button>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}
