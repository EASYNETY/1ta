// src/components/dyrane-ui/DyraneButton.tsx
'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, MotionProps } from 'framer-motion';

import { cn } from '@/lib/utils';
import { MotionTokens } from '@/lib/motion.tokens';
import { TargetAndTransition } from 'framer-motion';

// --- Use the EXACT SAME buttonVariants from your base Button ---

// --- Button Variants with Integrated CSS Hover Overlay ---
const buttonVariants = cva(
    // Base styles: Relative for positioning, overflow-hidden for clipping, isolate for stacking context, transition for text color
    "relative overflow-hidden isolate inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-150 ease-[cubic-bezier(0.77, 0, 0.175, 1)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer " +
    // Before pseudo-element setup: Absolute positioning, starts hidden (w-0), transitions width, sits behind content (-z-10)
    // Added: before:content-[''], before:absolute, before:inset-0, before:w-0, before:origin-left, before:transition-all, before:duration-300, before:ease-[cubic-bezier(0.77,0,0.175,1)], before:-z-10, hover:before:w-full
    "before:content-[''] before:absolute before:inset-0 before:w-1 before:opacity-10 before:origin-left before:transition-all before:duration-500 before:ease-[cubic-bezier(0.77,0,0.175,1)] before:-z-10 hover:before:w-full hover:before:opacity-100 before:rounded-lg",
    {
        variants: {
            variant: {
                // Define BASE colors AND the HOVER colors (for ::before background and hover:text-*)
                default:
                    "bg-primary text-primary-foreground shadow-xs " + // Base state
                    "before:bg-primary-foreground hover:text-primary", // Hover state: overlay bg + text color // CHANGED
                destructive:
                    "bg-destructive text-white shadow-xs " +
                    "before:bg-white hover:text-destructive", // CHANGED
                outline:
                    "border bg-background text-foreground shadow-xs dark:bg-input/30 dark:border-input " +
                    "before:bg-primary hover:text-primary-foreground", // Outline gets primary bg/text on hover // CHANGED
                secondary:
                    "bg-secondary text-secondary-foreground shadow-xs " +
                    "before:bg-secondary-foreground hover:text-secondary", // CHANGED
                ghost:
                    "text-foreground " + // Ghost base text color
                    "before:bg-accent hover:text-accent-foreground", // Ghost gets accent bg/text on hover // CHANGED
                link: "text-primary underline-offset-4 hover:underline p-0 h-auto before:hidden", // Link variant disables the ::before overlay // CHANGED
            },
            size: { /* ... size variants remain the same ... */
                default: "h-9 px-4 py-2 has-[>svg]:px-3",
                sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
                lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
                icon: "size-9",
            },
        },
        defaultVariants: { /* ... defaults remain the same ... */
            variant: "default",
            size: "default",
        },
    }
);

// --- DyraneButton Props ---
// Extend the base button props and allow motion props
export type DyraneButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants> &
    MotionProps & {
        asChild?: boolean;
    };

// --- DyraneButton Implementation ---
const DyraneButton = React.forwardRef<HTMLButtonElement, DyraneButtonProps>(
    (
        {
            className,
            variant,
            size,
            asChild = false,
            // Destructure motion props we handle internally
            whileHover: whileHoverProp,
            whileTap: whileTapProp,
            transition: transitionProp,
            // Capture rest (HTML attributes and potentially *other* unhandled motion props)
            ...props
        },
        ref // IMPORTANT: Receive the ref
    ) => {
        // Determine the component to render: Slot if asChild, otherwise 'button'
        // We apply motion to a wrapper, and Slot/button goes inside
        const CompInternal = asChild ? Slot : 'button';

        // --- Define Default DyraneUI Motion ---
        const defaultHoverEffect: TargetAndTransition = { scale: 1.03 };
        const defaultTapEffect: TargetAndTransition = { scale: 0.97 };
        const defaultTransitionConfig = MotionTokens.spring.default;

        const hoverEffect =
            typeof whileHoverProp === 'object' && whileHoverProp !== null
                ? { ...defaultHoverEffect, ...whileHoverProp }
                : whileHoverProp ?? defaultHoverEffect;

        const tapEffect =
            typeof whileTapProp === 'object' && whileTapProp !== null
                ? { ...defaultTapEffect, ...whileTapProp }
                : whileTapProp ?? defaultTapEffect;

        const transitionConfig =
            typeof transitionProp === 'object' && transitionProp !== null
                ? { ...defaultTransitionConfig, ...transitionProp }
                : transitionProp ?? defaultTransitionConfig;

        // --- asChild render ---
        if (asChild) {
            return (
                <motion.div
                    className="inline-block"
                    whileHover={hoverEffect}
                    whileTap={tapEffect}
                    transition={transitionConfig}
                >
                    <Slot
                        className={cn(buttonVariants({ variant, size, className }))}
                        ref={ref}
                        {...props}
                    />
                </motion.div>
            );
        }

        // --- default render ---
        return (
            <motion.div
                className="inline-block"
                whileHover={hoverEffect}
                whileTap={tapEffect}
                transition={transitionConfig}
            >
                <button
                    className={cn(
                        'transition-shadow duration-200 ease-out hover:shadow-md',
                        buttonVariants({ variant, size, className })
                    )}
                    ref={ref}
                    {...props}
                />
            </motion.div>
        );
    }
);
DyraneButton.displayName = 'DyraneButton';

export { DyraneButton, buttonVariants };
