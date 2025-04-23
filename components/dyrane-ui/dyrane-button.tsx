// src/components/dyrane-ui/DyraneButton.tsx
'use client'; // Motion components require client-side rendering

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, MotionProps } from 'framer-motion'; // Keep MotionProps import

import { cn } from '@/lib/utils';
// Assuming motion tokens are defined here
import { MotionTokens } from '@/lib/motion.tokens';

// Reusing Shadcn's buttonVariants logic for styling
const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground hover:bg-primary/90',
                destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-9 rounded-md px-3',
                lg: 'h-11 rounded-md px-8',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

// --- DyraneButton Props (using type intersection) ---
export type DyraneButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants> &
    MotionProps & { // Allow passing Framer Motion props if needed externally
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
            // Destructure specific motion props if you want to merge/override them
            whileHover: whileHoverProp,
            whileTap: whileTapProp,
            transition: transitionProp,
            ...props // Remaining props (HTML attrs, other motion props)
        },
        ref
    ) => {
        const Comp = asChild ? Slot : 'button';

        // --- Define Default DyraneUI Motion ---
        const defaulthovereffect = { scale: 1.03 };
        const defaultTapEffect = { scale: 0.97 };
        const defaultTransitionConfig = MotionTokens.spring.default; // Use a spring

        // --- Combine Defaults with Passed Props ---
        // This allows users to override the motion if they pass corresponding props
        const hovereffect = typeof whileHoverProp === 'object' && whileHoverProp !== null
            ? { ...defaulthovereffect, ...whileHoverProp }
            : whileHoverProp ?? defaulthovereffect;
        const tapEffect = typeof whileTapProp === 'object' && whileTapProp !== null
            ? { ...defaultTapEffect, ...whileTapProp }
            : whileTapProp ?? defaultTapEffect;
        const transitionConfig = { ...defaultTransitionConfig, ...transitionProp };

        return (
            // Wrap in motion.div for scale/tap effects
            <motion.div
                className="inline-block" // Or 'block' if needed
                whileHover={hovereffect}
                whileTap={tapEffect}
                transition={transitionConfig}
                // Pass down other motion props if needed (e.g., initial, animate)
                {...props as MotionProps} // Cast necessary if props contains conflicting types (less likely here)
            >
                <Comp
                    className={cn(
                        'transition-shadow duration-200 ease-out hover:shadow-md', // Subtle shadow enhancement
                        buttonVariants({ variant, size, className })
                    )}
                    ref={ref}
                    {...props as React.ButtonHTMLAttributes<HTMLButtonElement>} // Cast to Button attributes
                />
            </motion.div>
        );
    }
);
DyraneButton.displayName = 'DyraneButton';

export { DyraneButton, buttonVariants };