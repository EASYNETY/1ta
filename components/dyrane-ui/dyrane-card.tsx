// src/components/dyrane-ui/DyraneCard.tsx
'use client';

import * as React from 'react';
import {
    motion,
    MotionProps,
    useReducedMotion,
    TargetAndTransition,
    HTMLMotionProps, // Import HTMLMotionProps for type safety on motion.div
} from 'framer-motion';
import { cn } from '@/lib/utils';
import { MotionTokens } from '@/lib/motion.tokens';

// --- Define your BASE Card components first ---
// (Copied from your provided code)
function BaseCard({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card"
            className={cn(
                "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm", // Keep your specific base styles
                className,
            )}
            {...props}
        />
    );
}

function BaseCardHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-header"
            className={cn(
                "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
                className,
            )}
            {...props}
        />
    );
}

function BaseCardTitle({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-title"
            className={cn("leading-none font-semibold", className)}
            {...props}
        />
    );
}

function BaseCardDescription({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-description"
            className={cn("text-muted-foreground text-sm", className)}
            {...props}
        />
    );
}

function BaseCardAction({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-action"
            className={cn(
                "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
                className,
            )}
            {...props}
        />
    );
}

function BaseCardContent({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-content"
            className={cn("px-6", className)}
            {...props}
        />
    );
}

function BaseCardFooter({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-footer"
            className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
            {...props}
        />
    );
}
// --- End of Base Card components ---


// --- DyraneCard Props ---
// Combine HTML attributes for the WRAPPER div with SPECIFIC motion props
type DyraneCardProps = Omit<HTMLMotionProps<'div'>, 'children'> & // Use HTMLMotionProps for the wrapper, omit children as we handle it
{ // Add our custom props
    overlayClassName?: string;
    overlayHeight?: string;
    children?: React.ReactNode; // Children to be passed INSIDE the BaseCard
    cardClassName?: string; // Allow passing class specifically to the INNER BaseCard
};


// --- DyraneCard Implementation ---
// This component now acts as a motion-enabled WRAPPER around your BaseCard
const DyraneCard = React.forwardRef<HTMLDivElement, DyraneCardProps>(
    (
        {
            // Props for the OUTER motion.div wrapper
            className, // Class for the outer wrapper
            initial,
            animate,
            exit,
            whileHover: whileHoverProp,
            whileTap,
            whileFocus,
            variants: variantsProp,
            transition: transitionProp,
            layout,
            // Custom Props
            overlayClassName = 'bg-primary/10 dark:bg-primary/20 backdrop-blur-sm',
            overlayHeight = '65%',
            // Props specifically for the INNER BaseCard
            cardClassName,
            children, // Content to go inside BaseCard
            // Capture the rest of the props intended for the outer motion.div
            ...wrapperProps
        },
        ref // This ref applies to the OUTER motion.div wrapper
    ) => {
        const shouldReduceMotion = useReducedMotion();

        // --- Define Default DyraneUI Motion ---
        const defaultCardHoverEffect: TargetAndTransition = { scale: 1.02, y: -2 };
        const defaultOverlayTransition = {
            duration: shouldReduceMotion ? 0 : MotionTokens.duration.medium,
            ease: MotionTokens.ease.subtle_easeInOut,
        };
        const defaultCardTransition = {
            type: 'spring',
            stiffness: 300,
            damping: 20,
            ...(shouldReduceMotion && { duration: 0.01 })
        };

        // --- Combine Defaults with Passed Props (Conditional Spread Logic) ---
        const cardHoverEffect = shouldReduceMotion
            ? {}
            : typeof whileHoverProp === 'object' && whileHoverProp !== null
                ? { ...defaultCardHoverEffect, ...whileHoverProp }
                : whileHoverProp ?? defaultCardHoverEffect;

        const overlayTransition = { ...defaultOverlayTransition, ...(typeof transitionProp === 'object' && transitionProp !== null && transitionProp) };
        const cardTransition = { ...defaultCardTransition, ...(typeof transitionProp === 'object' && transitionProp !== null && transitionProp) };

        // Variants for the overlay animation
        const overlayVariants = {
            initial: { scaleY: 0, opacity: 0, transformOrigin: 'bottom' },
            hover: {
                scaleY: 1,
                opacity: shouldReduceMotion ? 0 : 1,
                transformOrigin: 'bottom'
            }
        };

        return (
            // Outer motion.div wrapper - Applies motion and contains overlay
            <motion.div
                // Apply specific motion props to the wrapper
                initial={initial ?? "initial"}
                animate={animate}
                exit={exit}
                whileHover={cardHoverEffect}
                whileTap={whileTap}
                whileFocus={whileFocus}
                variants={variantsProp}
                transition={cardTransition}
                layout={layout}
                // Base styles for the wrapper: relative, overflow needed for overlay
                className={cn(
                    'relative overflow-hidden group rounded-xl', // Match rounding of BaseCard, essential for clipping overlay
                    className // Allow custom classes for the wrapper
                )}
                ref={ref} // Ref applies to this outer wrapper
                {...wrapperProps} // Pass remaining valid motion/HTML attributes to the wrapper
            >
                {/* The Gliding Overlay - Sits inside wrapper, behind BaseCard */}
                <motion.div
                    className={cn(
                        'absolute bottom-0 left-0 w-full -z-10 pointer-events-none', // Use z-index -10 to be behind BaseCard
                        overlayClassName
                    )}
                    style={{ height: overlayHeight }}
                    variants={overlayVariants}
                    transition={overlayTransition}
                // Inherits animation trigger from parent's hover state
                />

                {/* RENDER YOUR BASE CARD HERE */}
                {/* It sits visually on top of the overlay */}
                <BaseCard
                    className={cn(
                        "relative z-0", // Ensure BaseCard is above the overlay's z-index
                        cardClassName // Allow passing specific classes to BaseCard
                    )}
                // Don't pass motion props here, they belong on the wrapper
                >
                    {children} {/* Render the children passed to DyraneCard */}
                </BaseCard>
            </motion.div>
        );
    }
);
DyraneCard.displayName = 'DyraneCard';

// --- Re-export your BASE Card Parts as DyraneCard Parts ---
// This provides the familiar API (DyraneCard.Header, etc.)
const DyraneCardHeader = BaseCardHeader;
const DyraneCardFooter = BaseCardFooter;
const DyraneCardTitle = BaseCardTitle;
const DyraneCardAction = BaseCardAction;
const DyraneCardDescription = BaseCardDescription;
const DyraneCardContent = BaseCardContent;

// Export DyraneCard and its parts
export {
    DyraneCard,
    DyraneCardHeader,
    DyraneCardFooter,
    DyraneCardTitle,
    DyraneCardAction,
    DyraneCardDescription,
    DyraneCardContent,
};