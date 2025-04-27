// src/components/layout/auth/mobile-nav.tsx
"use client";

import * as React from "react"; // Import React
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { useMobile } from "@/hooks/use-mobile";
import { useScrollDirection } from "@/hooks/use-scroll-direction"; // Import scroll direction hook (Step 7)
import {
    HouseSimple,
    BookOpen,
    ChartBar,
    Chat,
} from "phosphor-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge"; // For notification/cart badges


// --- Define Mobile Nav Items ---
interface MobileNavItem {
    title: string;
    href: string;
    icon: React.ElementType;
    roles: Array<"admin" | "teacher" | "student">;
    badgeKey?: keyof MobileNavBadges; // Optional key to look up badge count
}

// Define which badges might appear
interface MobileNavBadges {
    messages?: number;
    cart?: number;
    notifications?: number; // Example
}

// Adjust icons and routes based on primary mobile actions
const mobileNavItems: MobileNavItem[] = [
    { title: "Home", href: "/dashboard", icon: HouseSimple, roles: ["admin", "teacher", "student"] },
    { title: "Courses", href: "/courses", icon: BookOpen, roles: ["admin", "teacher", "student"] },
    // Example: Add Chat or primary action based on role/MVP
    { title: "Chat", href: "/chat", icon: Chat, roles: ["teacher", "student", 'admin'], badgeKey: "messages" },
    // Example: Add Analytics or primary action based on role/MVP
    { title: "Analytics", href: "/analytics", icon: ChartBar, roles: ["admin", "teacher"] }, // Example
    // Profile/Settings likely accessed via Header Avatar sheet, keep bottom bar focused
    // { title: "Profile", href: "/profile", icon: User, roles: ["admin", "teacher", "student"] },
];


// --- MobileNav Component ---
export function MobileNav() {
    const pathname = usePathname();
    const { user } = useAppSelector((state) => state.auth);
    const cart = useAppSelector((state) => state.cart); // Get cart state
    // Get notification count if managed globally, otherwise use local/fetched state
    // const notificationCount = useAppSelector(selectUnreadNotificationCount);
    const isMobile = useMobile();
    const scrollDirection = useScrollDirection(); // Use scroll direction hook

    // Filter items based on user role
    const filteredNavItems = mobileNavItems.filter(item => user && item.roles.includes(user.role));

    // --- Badge Counts (Example) ---
    // Replace with actual data sources / selectors
    const badgeCounts: MobileNavBadges = {
        cart: cart.items.length,
        // messages: 5, // Example unread message count
        // notifications: 3, // Example unread notification count
    };

    // Determine visibility based on scroll direction
    const isVisible = scrollDirection === 'up' || scrollDirection === 'none'; // Show when scrolling up or not scrolling

    // Only render on mobile and if user is logged in
    if (!isMobile || !user) {
        return null;
    }

    return (
        <motion.div
            className={cn(
                "fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-border/30",
                "bg-background/80 backdrop-blur-lg", // Dyrane style: blurred background
                "supports-[backdrop-filter]:bg-background/60" // Fallback if blur not supported
            )}
            // Animate y position based on visibility
            animate={{ y: isVisible ? 0 : 100 }} // Slide down when hidden
            initial={{ y: 0 }} // Start visible
            transition={{ type: "tween", duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
            <nav className="flex h-full items-center justify-around px-2">
                {filteredNavItems.slice(0, 5).map((item) => { // Limit to max 5 items typically
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    const badgeValue = item.badgeKey ? badgeCounts[item.badgeKey] : 0;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex flex-1 flex-col items-center justify-center pt-1 pb-1 h-full", // Adjust padding
                                "transition-colors duration-200 ease-in-out",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground" // Active/inactive colors
                            )}
                            aria-current={isActive ? "page" : undefined}
                        >
                            {/* Icon and Badge */}
                            <div className="relative mb-0.5">
                                <Icon className="size-5" strokeWidth={isActive ? 2 : 1.75} />
                                {badgeValue && badgeValue > 0 ? (
                                    <Badge
                                        variant="destructive" // Use destructive for attention or default
                                        className="absolute -top-1 -right-2 h-4 min-w-[1rem] p-0.5 text-[10px] leading-none flex items-center justify-center"
                                    >
                                        {badgeValue > 9 ? "9+" : badgeValue}
                                    </Badge>
                                ) : null}
                            </div>
                            {/* Optional: Show labels on mobile if desired, often icons only */}
                            <span className={cn(
                                "text-[10px] transition-opacity duration-200",
                                // isActive ? "opacity-100 font-medium" : "opacity-80"
                                "sr-only" // Hide labels by default for icon-only bar
                            )}>
                                {item.title}
                            </span>

                            {/* Active Indicator (Optional subtle dot/line) */}
                            {isActive && (
                                <motion.div
                                    layoutId="mobileActiveIndicator" // Shared layout ID
                                    className="absolute bottom-1 h-[3px] w-4 rounded-full bg-primary"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}
                {/* Optional Floating Action Button Placeholder */}
                {/* Position relative to the nav container */}
                {/* <DyraneButton size="icon" className="absolute right-4 bottom-20 rounded-full shadow-lg z-50"> <PlusCircle size={20}/> </DyraneButton> */}
            </nav>
        </motion.div>
    );
}