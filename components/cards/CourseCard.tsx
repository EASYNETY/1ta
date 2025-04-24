// src/components/cards/CourseCard.tsx
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
// Removed motion import if variants are passed from parent
import { Clock, Users, DollarSign, Star, UsersRound } from 'lucide-react'; // Added Star, UsersRound
import {
    DyraneCard,
    DyraneCardHeader,
    DyraneCardTitle,
    DyraneCardDescription,
    DyraneCardContent,
    DyraneCardFooter
} from '@/components/dyrane-ui/dyrane-card';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { useCurrencyConversion } from '@/hooks/use-currency-conversion';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';
import type { Course } from '@/data/mock-course-data'; // Import the detailed Course type

interface CourseCardProps {
    course: Course;
    // Allow className pass-through for grid/list item styling
    className?: string;
    // Add other props if needed, e.g., onClick for modal trigger
    onClick?: () => void;
}

export function CourseCard({ course, className, onClick }: CourseCardProps) {
    const { isLoading: isRateLoading, convert, formatTargetCurrency, formatBaseCurrency } = useCurrencyConversion('USD', 'NGN');
    const nairaAmount = convert(course.priceUSD);
    const discountedNairaAmount = course.discountPriceUSD ? convert(course.discountPriceUSD) : null;

    const renderNairaPrice = (amount: number | null) => {
        if (isRateLoading) return <Skeleton className="h-4 w-16 inline-block" />;
        if (amount === null) return <span className="text-muted-foreground/80"></span>; // Show nothing if no rate/discount
        return formatTargetCurrency(amount);
    };

    const levelBadgeColor = (level?: string) => { /* ... same as before ... */
        switch (level) {
            case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300/50 dark:border-green-700/50';
            case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-300/50 dark:border-yellow-700/50';
            case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300/50 dark:border-red-700/50';
            default: return 'bg-muted text-muted-foreground border-border';
        }
    };

    // Determine price to display (discount or regular)
    const displayPriceUSD = course.discountPriceUSD ?? course.priceUSD;
    const displayNairaAmount = discountedNairaAmount ?? nairaAmount;

    return (
        <DyraneCard
            className={cn("flex flex-col h-full group", className)} // Ensure full height
            cardClassName="flex flex-col h-full" // Make inner card flex and full height
            layout // Enable layout animation if size changes
            onClick={onClick} // Add onClick handler if provided
            style={{ cursor: onClick ? 'pointer' : 'default' }} // Change cursor if clickable
        >
            <div className="aspect-[16/9] relative overflow-hidden">
                <Image
                    src={course.image || '/placeholder-image.svg'}
                    alt={course.title}
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw" // Adjusted sizes
                    className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
                {course.level && (
                    <Badge variant="outline" className={cn("absolute top-2 right-2 backdrop-blur-sm bg-background/70", levelBadgeColor(course.level))}>
                        {course.level}
                    </Badge>
                )}
                {/* Discount Badge */}
                {course.discountPriceUSD && (
                    <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
                        -{Math.round(((course.priceUSD - course.discountPriceUSD) / course.priceUSD) * 100)}%
                    </Badge>
                )}
            </div>

            <DyraneCardHeader className="pb-3 pt-4"> {/* Adjust padding */}
                <DyraneCardTitle className="text-base font-semibold leading-tight line-clamp-2"> {/* Base size,semibold */}
                    <Link href={`/courses/${course.slug}`} onClick={(e) => e.stopPropagation()} className="hover:text-primary transition-colors ">
                        {course.title}
                    </Link>
                </DyraneCardTitle>
                {course.subtitle && (
                    <DyraneCardDescription className="text-xs pt-1 line-clamp-1">
                        {course.subtitle}
                    </DyraneCardDescription>
                )}
            </DyraneCardHeader>

            <DyraneCardContent className="flex-1 py-2 px-6 text-xs text-muted-foreground space-y-2"> {/* Adjust padding, smaller text */}
                <span className="inline-flex items-center mr-3">
                    <Clock className="size-3.5 mr-1.5" />
                    {course.duration}
                </span>
                <span className="inline-flex items-center">
                    <UsersRound className="size-3.5 mr-1.5" /> {/* Different icon */}
                    {course.studentsEnrolled.toLocaleString()} enrolled
                </span>
                {course.rating && (
                    <span className="inline-flex items-center ml-3 text-amber-500">
                        <Star className="size-3.5 mr-1 fill-current" />
                        {course.rating.toFixed(1)}
                        {course.reviewsCount && <span className="ml-1 text-muted-foreground">({course.reviewsCount})</span>}
                    </span>
                )}
            </DyraneCardContent>

            <DyraneCardFooter className="px-6 pb-4 pt-3 mt-auto border-t border-border/30">
                <div className="flex justify-between items-end w-full gap-2"> {/* Align items end */}
                    {/* Price */}
                    <div className="flex flex-col text-left">
                        {/* Show original price struck through if discount exists */}
                        {course.discountPriceUSD && (
                            <span className="text-xs text-muted-foreground line-through h-4">
                                {formatBaseCurrency(course.priceUSD)}
                            </span>
                        )}
                        <span className="text-base font-bold text-primary">
                            {formatBaseCurrency(displayPriceUSD)}
                        </span>
                        <span className="text-xs text-muted-foreground h-4">
                            {renderNairaPrice(displayNairaAmount)}
                        </span>
                    </div>
                    {/* Enroll Button */}
                    <DyraneButton asChild size="sm" onClick={(e) => e.stopPropagation()}>
                        <Link href={`/courses/${course.slug}/enroll`}>Details</Link>
                    </DyraneButton>
                </div>
            </DyraneCardFooter>
        </DyraneCard>
    );
}