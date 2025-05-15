"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface ArticleFooterProps {
  previousArticle?: {
    title: string;
    href: string;
  };
  nextArticle?: {
    title: string;
    href: string;
  };
  categoryLink?: {
    title: string;
    href: string;
  };
  className?: string;
}

export function ArticleFooter({
  previousArticle,
  nextArticle,
  categoryLink,
  className
}: ArticleFooterProps) {
  const handleFeedback = (isHelpful: boolean) => {
    toast.success(
      isHelpful 
        ? "Thank you for your feedback! We're glad this was helpful." 
        : "Thank you for your feedback. We'll work to improve this article."
    );
  };

  return (
    <div className={cn("mt-12 space-y-8", className)}>
      {/* Feedback Section */}
      <div className="bg-muted/30 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Was this article helpful?</h3>
        <div className="flex gap-2">
          <DyraneButton 
            variant="outline" 
            size="sm" 
            onClick={() => handleFeedback(true)}
            className="flex items-center gap-2"
          >
            <ThumbsUp className="h-4 w-4" />
            Yes, it helped
          </DyraneButton>
          <DyraneButton 
            variant="outline" 
            size="sm" 
            onClick={() => handleFeedback(false)}
            className="flex items-center gap-2"
          >
            <ThumbsDown className="h-4 w-4" />
            No, I need more help
          </DyraneButton>
        </div>
      </div>

      <Separator />

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {previousArticle ? (
          <DyraneButton variant="outline" asChild className="flex-1 justify-start">
            <Link href={previousArticle.href}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="truncate">{previousArticle.title}</span>
            </Link>
          </DyraneButton>
        ) : (
          <div className="flex-1" />
        )}

        {categoryLink && (
          <DyraneButton variant="secondary" asChild className="hidden sm:flex">
            <Link href={categoryLink.href}>
              Back to {categoryLink.title}
            </Link>
          </DyraneButton>
        )}

        {nextArticle ? (
          <DyraneButton variant="outline" asChild className="flex-1 justify-end">
            <Link href={nextArticle.href}>
              <span className="truncate">{nextArticle.title}</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </DyraneButton>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {/* Mobile Category Link */}
      {categoryLink && (
        <div className="sm:hidden">
          <DyraneButton variant="secondary" asChild className="w-full">
            <Link href={categoryLink.href}>
              Back to {categoryLink.title}
            </Link>
          </DyraneButton>
        </div>
      )}
    </div>
  );
}
