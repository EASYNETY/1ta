// src/components/dyrane-ui/DyraneCard.tsx
'use client';

import * as React from 'react';
import {
    motion,
    MotionProps, // Keep MotionProps for the wrapper
    useReducedMotion,
    TargetAndTransition,
    HTMLMotionProps,
} from 'framer-motion';
import { cva } from "class-variance-authority"; // Import CVA
import { cn } from '@/lib/utils';
import { MotionTokens } from '@/lib/motion.tokens';

// --- Base Card components (Keep these exactly as you provided) ---
function BaseCard({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card"
            className={cn(
                "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm", // BaseCard styles
                className
            )}
            {...props}
        />
    );
}
const BaseCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-slot="card-header"
        className={cn("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", className)}
        {...props}
    />
));
BaseCardHeader.displayName = "BaseCardHeader";
// ... Define BaseCardTitle, BaseCardDescription, BaseCardAction, BaseCardContent, BaseCardFooter similarly...
// (Using React.forwardRef for consistency if needed, though often not necessary for simple divs)

const BaseCardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
    <h3
        ref={ref as any} // Adjust ref type if needed, h3 might be more semantic
        data-slot="card-title"
        className={cn("leading-none font-semibold", className)}
        {...props}
    />
));
BaseCardTitle.displayName = "BaseCardTitle";

const BaseCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        data-slot="card-description"
        className={cn("text-muted-foreground text-sm", className)}
        {...props}
    />
));
BaseCardDescription.displayName = "BaseCardDescription";

const BaseCardAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-slot="card-action"
        className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
        {...props}
    />
));
BaseCardAction.displayName = "BaseCardAction";

const BaseCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-slot="card-content"
        className={cn("px-6", className)}
        {...props}
    />
));
BaseCardContent.displayName = "BaseCardContent";

const BaseCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-slot="card-footer"
        className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
        {...props}
    />
));
BaseCardFooter.displayName = "BaseCardFooter";

// --- CVA for Card Structure and Pseudo-Element ---
// Defines the base styles needed on the card element itself for the overlay effect
const cardCVA = cva(
    // Base styles: Relative positioning, overflow clipping, stacking context, group for hover trigger
    "relative overflow-hidden isolate group transition-shadow duration-200 ease-out hover:shadow-lg " + // Added hover shadow lift
    // Before pseudo-element setup: Covers area, starts hidden, transitions width, sits behind content
    "before:content-[''] before:absolute before:inset-0 before:w-1 before:origin-left before:transition-all before:duration-500 before:ease-[cubic-bezier(0.77,0,0.175,1)] before:-z-10 hover:before:w-full before:pointer-events-none before:rounded-2xl" // Match BaseCard rounding
);

// --- DyraneCard Props ---
// Combine MotionProps (for the wrapper) with custom props
type DyraneCardProps = MotionProps & // Allow all motion props for the wrapper
    React.HTMLAttributes<HTMLDivElement> & // Allow standard div attributes for the wrapper
{
    overlayClassName?: string; // Class defining the ::before background color (e.g., "before:bg-primary/10")
    cardClassName?: string; // Optional class for the inner BaseCard element
    children?: React.ReactNode;
};

// --- DyraneCard Implementation ---
const DyraneCard = React.forwardRef<HTMLDivElement, DyraneCardProps>(
    (
        {
            // Custom Props
            overlayClassName = 'before:bg-primary/10 before:backdrop-blur-sm', // Default overlay style (applied via ::before)
            cardClassName,
            children,
            // Motion Props (for the outer wrapper)
            whileHover: whileHoverProp,
            whileTap: whileTapProp,
            transition: transitionProp,
            initial,
            animate,
            exit,
            variants,
            layout,
            // Standard div attributes for the outer wrapper (e.g., className)
            className, // Capture className for the wrapper
            ...wrapperProps // Rest of the props for the motion.div wrapper
        },
        ref // Ref applies to the OUTER motion.div wrapper
    ) => {
        const shouldReduceMotion = useReducedMotion();

        // --- Define Default Motion for WRAPPER (Subtle Lift/Scale) ---
        const defaultWrapperHoverEffect: TargetAndTransition | string | undefined = shouldReduceMotion ? undefined : { scale: 1.02, y: -3 }; // Subtle lift
        const defaultWrapperTapEffect: TargetAndTransition | string | undefined = shouldReduceMotion ? undefined : { scale: 0.99 }; // Subtle press
        const defaultWrapperTransitionConfig = MotionTokens.spring.gentle; // Gentle spring

        // --- Combine Motion Props for WRAPPER ---
        const wrapperHoverEffect = typeof whileHoverProp === 'object' && whileHoverProp !== null
            ? { ...defaultWrapperHoverEffect, ...whileHoverProp }
            : whileHoverProp ?? defaultWrapperHoverEffect;
        const wrapperTapEffect = typeof whileTapProp === 'object' && whileTapProp !== null
            ? { ...defaultWrapperTapEffect, ...whileTapProp }
            : whileTapProp ?? defaultWrapperTapEffect;
        const wrapperTransitionConfig = typeof transitionProp === 'object' && transitionProp !== null
            ? { ...defaultWrapperTransitionConfig, ...transitionProp }
            : transitionProp ?? defaultWrapperTransitionConfig;

        // Apply reduced motion class for the CSS ::before transition
        const reducedMotionClass = shouldReduceMotion ? 'before:!duration-0' : '';

        return (
            // Outer motion.div wrapper: Handles scale/lift animation and provides 'group'
            <motion.div
                className={cn("block", className)} // Use block, pass wrapper className
                ref={ref}
                // Apply wrapper motion props
                initial={initial}
                animate={animate}
                exit={exit}
                whileHover={wrapperHoverEffect}
                whileTap={wrapperTapEffect}
                transition={wrapperTransitionConfig}
                variants={variants}
                layout={layout}
                {...wrapperProps} // Pass remaining wrapper attributes
            >
                {/* Inner BaseCard: Gets the CVA styles (including ::before) and overlay color class */}
                <BaseCard
                    className={cn(
                        cardCVA(), // Apply base CVA styles (relative, overflow, isolate, group, ::before setup)
                        overlayClassName, // Apply the overlay background class (e.g., "before:bg-primary/10")
                        reducedMotionClass, // Apply reduced motion override if needed
                        cardClassName // Apply any specific classes passed for the card itself
                    )}
                // BaseCard receives standard div props if needed, but usually just children/className
                >
                    {/* Children are rendered inside BaseCard, naturally above the ::before overlay */}
                    {children}
                </BaseCard>
            </motion.div>
        );
    }
);
DyraneCard.displayName = 'DyraneCard';

// --- Re-export Base Card Parts as DyraneCard Parts ---
const DyraneCardHeader = BaseCardHeader;
const DyraneCardFooter = BaseCardFooter;
const DyraneCardTitle = BaseCardTitle;
const DyraneCardAction = BaseCardAction;
const DyraneCardDescription = BaseCardDescription;
const DyraneCardContent = BaseCardContent;

export {
    DyraneCard,
    DyraneCardHeader,
    DyraneCardFooter,
    DyraneCardTitle,
    DyraneCardAction,
    DyraneCardDescription,
    DyraneCardContent,
    cardCVA as cardVariants, // Optionally export CVA function
};