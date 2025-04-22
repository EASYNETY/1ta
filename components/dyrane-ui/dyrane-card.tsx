// src/components/dyrane-ui/DyraneCard.tsx
'use client';

import * as React from 'react';
import {
    motion,
    MotionProps,
    useReducedMotion,
    TargetAndTransition,
    // It's often better to be explicit than rely solely on MotionProps intersection
    // when separating props for spreading. Let's import common motion props types.
    HTMLMotionProps,
} from 'framer-motion';
import { cn } from '@/lib/utils';
import { MotionTokens } from '@/lib/motion.tokens';

// Re-exporting parts of Shadcn Card
import {
    CardHeader as ShadcnCardHeader,
    CardFooter as ShadcnCardFooter,
    CardTitle as ShadcnCardTitle,
    CardDescription as ShadcnCardDescription,
    CardContent as ShadcnCardContent,
} from '@/components/ui/card';

// --- DyraneCard Props ---
// Combine HTML div attributes with SPECIFIC motion props we want to expose/handle
// Avoid spreading the entire MotionProps directly if it causes issues.
type DyraneCardProps = Omit<React.HTMLAttributes<HTMLDivElement>, keyof MotionProps> & // Start with HTML Atts, remove potential overlaps
    // Explicitly add motion props we might want to allow overriding or use internally
    Pick<MotionProps,
        | 'initial'
        | 'animate'
        | 'exit'
        | 'whileHover'
        | 'whileTap'
        | 'whileFocus'
        | 'variants'
        | 'transition'
        | 'layout'
    // Add any other specific motion props you anticipate needing
    > &
{ // Add our custom props
    overlayClassName?: string;
    overlayHeight?: string;
    children?: React.ReactNode;
};


// --- DyraneCard Implementation ---
const DyraneCard = React.forwardRef<HTMLDivElement, DyraneCardProps>(
    (
        {
            // HTML Attributes (will be in `htmlProps` via rest)
            className,
            children,
            // Custom Props
            overlayClassName = 'bg-primary/10 dark:bg-primary/20 backdrop-blur-sm',
            overlayHeight = '65%',
            // Explicitly Destructure Known Motion Props
            initial,
            animate,
            exit,
            whileHover: whileHoverProp,
            whileTap,
            whileFocus,
            variants: variantsProp,
            transition: transitionProp,
            layout,
            // Capture the *rest* of the props, which should now primarily be valid HTML attributes
            ...htmlProps
        },
        ref
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
            // Outer motion.div
            <motion.div
                className={cn(
                    'relative rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden group',
                    className
                )}
                ref={ref}
                // Pass specific motion props explicitly
                initial={initial ?? "initial"} // Default to "initial" variant state
                animate={animate}
                exit={exit}
                whileHover={cardHoverEffect}
                whileTap={whileTap}
                whileFocus={whileFocus}
                variants={variantsProp} // Pass variants if provided
                transition={cardTransition} // Use combined card transition
                layout={layout}
                // Spread ONLY the remaining props, assumed to be valid HTML attributes
                {...htmlProps}
            >
                {/* The Gliding Overlay */}
                <motion.div
                    className={cn(
                        'absolute bottom-0 left-0 w-full -z-0 pointer-events-none',
                        overlayClassName
                    )}
                    style={{ height: overlayHeight }}
                    variants={overlayVariants} // Animate based on parent state via variants
                    transition={overlayTransition}
                // Inherit initial/animate state from parent via variants "initial"
                // No need for separate whileHover here; it reacts to parent
                />

                {/* Card content */}
                <div className="relative z-10">
                    {children}
                </div>
            </motion.div>
        );
    }
);
DyraneCard.displayName = 'DyraneCard';

// --- Re-exporting Shadcn Card Parts ---
const DyraneCardHeader = ShadcnCardHeader;
const DyraneCardFooter = ShadcnCardFooter;
const DyraneCardTitle = ShadcnCardTitle;
const DyraneCardDescription = ShadcnCardDescription;
const DyraneCardContent = ShadcnCardContent;

export {
    DyraneCard,
    DyraneCardHeader,
    DyraneCardFooter,
    DyraneCardTitle,
    DyraneCardDescription,
    DyraneCardContent,
};