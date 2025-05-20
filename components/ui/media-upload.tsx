"use client";

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import {
  Upload,
  X,
  FileUp,
  ImageIcon,
  VideoIcon,
  FileIcon,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useMediaUpload, UseMediaUploadOptions } from '@/hooks/use-media-upload';
import { MediaType } from '@/lib/services/media-upload-service';

export interface MediaUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The type of media to upload
   * @default MediaType.IMAGE
   */
  mediaType?: MediaType;

  /**
   * The label for the upload button
   */
  label?: string;

  /**
   * The description text
   */
  description?: string;

  /**
   * Whether the upload is disabled
   */
  disabled?: boolean;

  /**
   * The initial URL (for editing existing media)
   */
  initialUrl?: string | null;

  /**
   * Callback when a file is selected
   */
  onFileSelect?: (file: File | null) => void;

  /**
   * Callback when upload is successful
   */
  onUploadSuccess?: UseMediaUploadOptions['onUploadSuccess'];

  /**
   * Callback when upload fails
   */
  onUploadError?: UseMediaUploadOptions['onUploadError'];

  /**
   * Callback when the URL changes (either preview or remote)
   */
  onUrlChange?: (url: string | null) => void;

  /**
   * Whether to show the preview
   * @default true
   */
  showPreview?: boolean;

  /**
   * Whether to show the file name
   * @default true
   */
  showFileName?: boolean;

  /**
   * Whether to show the remove button
   * @default true
   */
  showRemoveButton?: boolean;

  /**
   * Whether to automatically upload the file when selected
   * @default true
   */
  autoUpload?: boolean;

  /**
   * Additional options for the upload hook
   */
  uploadOptions?: Partial<UseMediaUploadOptions>;
}

/**
 * A reusable media upload component
 */
export function MediaUpload({
  mediaType = MediaType.IMAGE,
  label,
  description,
  disabled = false,
  initialUrl = null,
  onFileSelect,
  onUploadSuccess,
  onUploadError,
  onUrlChange,
  showPreview = true,
  showFileName = true,
  showRemoveButton = true,
  autoUpload = true,
  uploadOptions = {},
  className,
  ...props
}: MediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default labels based on media type
  const defaultLabel = mediaType === MediaType.IMAGE
    ? 'Upload Image'
    : mediaType === MediaType.VIDEO
      ? 'Upload Video'
      : 'Upload File';

  const defaultDescription = mediaType === MediaType.IMAGE
    ? 'PNG, JPG or GIF up to 10MB'
    : mediaType === MediaType.VIDEO
      ? 'MP4, WebM or OGG up to 100MB'
      : 'PDF, Word, Excel up to 20MB';

  // Use the provided labels or defaults
  const uploadLabel = label || defaultLabel;
  const uploadDescription = description || defaultDescription;

  // Initialize the upload hook
  const {
    file,
    previewUrl,
    remoteUrl,
    progress,
    isUploading,
    isUploaded,
    error,
    selectFile,
    upload,
    reset,
  } = useMediaUpload({
    mediaType,
    initialUrl,
    autoUpload,
    onUploadSuccess,
    onUploadError,
    ...uploadOptions,
  });

  // Call onUrlChange when the URL changes
  React.useEffect(() => {
    const url = remoteUrl || previewUrl;
    onUrlChange?.(url);
  }, [remoteUrl, previewUrl, onUrlChange]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    selectFile(selectedFile);
    onFileSelect?.(selectedFile);
  };

  // Handle remove button click
  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    reset();
    onFileSelect?.(null);
    onUrlChange?.(null);
  };

  // Handle upload button click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle manual upload button click
  const handleManualUpload = () => {
    if (file) {
      upload(file);
    }
  };

  // Determine the icon to show based on media type
  const getMediaIcon = () => {
    if (isUploading) {
      return <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />;
    }

    switch (mediaType) {
      case MediaType.IMAGE:
        return <ImageIcon className="h-10 w-10 text-muted-foreground" />;
      case MediaType.VIDEO:
        return <VideoIcon className="h-10 w-10 text-muted-foreground" />;
      default:
        return <FileIcon className="h-10 w-10 text-muted-foreground" />;
    }
  };

  // Render the preview based on media type
  const renderPreview = () => {
    if (!previewUrl) return null;

    if (mediaType === MediaType.IMAGE) {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-md border">
          <Image
            src={previewUrl}
            alt="Preview"
            fill
            className="object-cover"
          />
          {showRemoveButton && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-6 w-6 rounded-full"
              onClick={handleRemove}
              disabled={disabled || isUploading}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove</span>
            </Button>
          )}
        </div>
      );
    }

    if (mediaType === MediaType.VIDEO) {
      return (
        <div className="relative w-full overflow-hidden rounded-md border">
          <video
            src={previewUrl}
            controls
            className="aspect-video w-full"
          />
          {showRemoveButton && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-6 w-6 rounded-full"
              onClick={handleRemove}
              disabled={disabled || isUploading}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove</span>
            </Button>
          )}
        </div>
      );
    }

    // For other file types, show a file icon
    return (
      <div className="flex items-center justify-between rounded-md border bg-muted/50 p-2">
        <div className="flex items-center">
          <FileUp className="mr-2 h-4 w-4 text-primary" />
          {showFileName && file && (
            <span className="truncate max-w-[200px]">{file.name}</span>
          )}
        </div>
        {showRemoveButton && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={handleRemove}
            disabled={disabled || isUploading}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove</span>
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept={
          mediaType === MediaType.IMAGE
            ? "image/*"
            : mediaType === MediaType.VIDEO
              ? "video/*"
              : mediaType === MediaType.AUDIO
                ? "audio/*"
                : undefined
        }
        disabled={disabled || isUploading}
      />

      {/* Show preview if available */}
      {showPreview && previewUrl && renderPreview()}

      {/* Upload area */}
      {(!previewUrl || !showPreview) && (
        <div
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-6",
            disabled ? "border-muted-foreground/20 bg-muted/50" : "border-primary/20 hover:bg-primary/5 active:bg-primary/10"
          )}
          onClick={disabled ? undefined : handleUploadClick}
          role="button"
          tabIndex={disabled ? undefined : 0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault();
              handleUploadClick();
            }
          }}
        >
          <div className="flex flex-col items-center gap-1 text-center">
            {getMediaIcon()}
            <p className="text-sm font-medium">{uploadLabel}</p>
            <p className="text-xs text-muted-foreground">{uploadDescription}</p>
            <p className="text-xs text-primary mt-2 sm:hidden">Tap to select a file</p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {isUploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2 w-full" />
          <p className="text-xs text-muted-foreground">
            Uploading... {progress.toFixed(0)}%
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Upload button (only show if not auto-uploading and file is selected) */}
      {!autoUpload && file && !isUploaded && !isUploading && (
        <Button
          type="button"
          onClick={handleManualUpload}
          disabled={disabled || isUploading}
          className="w-full"
        >
          Upload
        </Button>
      )}
    </div>
  );
}
