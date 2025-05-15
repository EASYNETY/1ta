"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface StepProps {
  number: number;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Step({ number, title, children, className }: StepProps) {
  return (
    <div className={cn("flex items-start gap-4 mb-6", className)}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <div className="text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

interface StepByStepGuideProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function StepByStepGuide({ title, description, children, className }: StepByStepGuideProps) {
  return (
    <div className={cn("bg-card/50 backdrop-blur-sm rounded-lg p-6 my-6 border border-border/50", className)}>
      {title && <h2 className="text-xl font-bold mb-2">{title}</h2>}
      {description && <p className="text-muted-foreground mb-6">{description}</p>}
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}
