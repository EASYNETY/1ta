"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, Info, Lightbulb, AlertTriangle } from 'lucide-react';

type CalloutType = 'tip' | 'note' | 'warning' | 'important';

interface HelpCalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function HelpCallout({ 
  type = 'note', 
  title, 
  children, 
  className 
}: HelpCalloutProps) {
  const icons = {
    tip: Lightbulb,
    note: Info,
    warning: AlertTriangle,
    important: AlertCircle
  };

  const styles = {
    tip: "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-900 dark:text-green-400",
    note: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-400",
    warning: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-400",
    important: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400"
  };

  const iconColors = {
    tip: "text-green-500 dark:text-green-400",
    note: "text-blue-500 dark:text-blue-400",
    warning: "text-amber-500 dark:text-amber-400",
    important: "text-red-500 dark:text-red-400"
  };

  const Icon = icons[type];

  return (
    <div className={cn(
      "p-4 rounded-lg border my-4",
      styles[type],
      className
    )}>
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 mt-0.5", iconColors[type])} />
        <div>
          {title && <h4 className="font-medium mb-1">{title}</h4>}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
