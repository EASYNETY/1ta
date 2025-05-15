"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface HelpImageProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function HelpImage({ 
  src, 
  alt, 
  caption, 
  width = 800, 
  height = 450, 
  className 
}: HelpImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("relative group rounded-lg overflow-hidden border border-border/50 my-4", className)}>
      <div className="relative">
        <Image 
          src={src} 
          alt={alt} 
          width={width} 
          height={height} 
          className="w-full h-auto object-cover rounded-t-lg"
        />
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
          onClick={() => setIsOpen(true)}
        >
          <Maximize2 className="h-4 w-4" />
          <span className="sr-only">Enlarge image</span>
        </Button>
      </div>
      {caption && (
        <div className="p-2 text-sm text-muted-foreground bg-muted/50 rounded-b-lg">
          {caption}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="relative">
            <Image 
              src={src} 
              alt={alt} 
              width={1200} 
              height={675} 
              className="w-full h-auto"
            />
            <DialogClose className="absolute top-2 right-2 rounded-full bg-background/80 backdrop-blur-sm p-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
          {caption && (
            <div className="p-4 text-sm">
              {caption}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
