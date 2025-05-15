"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ArticleHeaderProps {
  title: string;
  icon?: React.ElementType;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  backLink?: {
    href: string;
    label: string;
  };
  className?: string;
}

export function ArticleHeader({
  title,
  icon: Icon,
  description,
  breadcrumbs,
  backLink = { href: '/help', label: 'Back to Help Center' },
  className
}: ArticleHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Breadcrumb Navigation */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbLink>{item.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Back Button */}
      {backLink && (
        <div>
          <DyraneButton variant="outline" size="sm" asChild>
            <Link href={backLink.href}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {backLink.label}
            </Link>
          </DyraneButton>
        </div>
      )}

      {/* Article Header */}
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-8 w-8 text-primary" />}
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>

      {/* Description */}
      {description && (
        <p className="text-muted-foreground max-w-3xl">
          {description}
        </p>
      )}
    </div>
  );
}
