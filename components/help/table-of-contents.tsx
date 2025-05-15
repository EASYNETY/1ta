"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { List } from 'lucide-react';

interface TableOfContentsProps {
  className?: string;
}

export function TableOfContents({ className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Find all h2 and h3 elements in the article
    const articleElement = document.querySelector('article');
    if (!articleElement) return;

    const headingElements = articleElement.querySelectorAll('h2, h3');
    
    const headingsData = Array.from(headingElements).map((heading) => {
      // Add IDs to headings if they don't have one
      if (!heading.id) {
        const id = heading.textContent?.toLowerCase().replace(/\s+/g, '-') || '';
        heading.id = id;
      }
      
      return {
        id: heading.id,
        text: heading.textContent || '',
        level: heading.tagName === 'H2' ? 2 : 3,
      };
    });
    
    setHeadings(headingsData);

    // Set up intersection observer to highlight active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    headingElements.forEach((heading) => {
      observer.observe(heading);
    });

    return () => {
      headingElements.forEach((heading) => {
        observer.unobserve(heading);
      });
    };
  }, []);

  if (headings.length === 0) return null;

  return (
    <div className={cn("bg-muted/30 p-4 rounded-lg", className)}>
      <div className="flex items-center gap-2 mb-2">
        <List className="h-4 w-4" />
        <h3 className="font-medium">On this page</h3>
      </div>
      <nav>
        <ul className="space-y-1 text-sm">
          {headings.map((heading) => (
            <li 
              key={heading.id}
              className={cn(
                "transition-colors",
                heading.level === 3 && "ml-4",
                activeId === heading.id ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <a 
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block py-1"
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
