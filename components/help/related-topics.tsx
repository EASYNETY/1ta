"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface RelatedTopic {
  title: string;
  href: string;
  description?: string;
}

interface RelatedTopicsProps {
  topics: RelatedTopic[];
  title?: string;
  className?: string;
}

export function RelatedTopics({
  topics,
  title = "Related Topics",
  className
}: RelatedTopicsProps) {
  if (!topics || topics.length === 0) return null;

  return (
    <div className={cn("mt-8", className)}>
      <h3 className="text-xl font-semibold">{title}</h3>
      <Separator className="my-2" />
      <ul className="space-y-3 mt-3">
        {topics.map((topic, index) => (
          <li key={index} className="group">
            <Link 
              href={topic.href}
              className="flex items-start text-sm hover:text-primary transition-colors"
            >
              <ChevronRight className="h-4 w-4 mr-2 mt-0.5 text-primary group-hover:translate-x-0.5 transition-transform" />
              <div>
                <span className="font-medium">{topic.title}</span>
                {topic.description && (
                  <p className="text-muted-foreground text-xs mt-0.5">{topic.description}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
