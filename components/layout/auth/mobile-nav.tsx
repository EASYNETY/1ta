// src/components/layout/auth/mobile-nav.tsx
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { useMobile } from "@/hooks/use-mobile";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    HouseSimple,
    Chat,
    Plus,
    GraduationCap,
    Calendar,
} from "phosphor-react";

export interface MobileNavItem {
    title: string;
    href: string;
    icon: React.ElementType;
    roles: Array<"admin" | "teacher" | "student">;
    badgeKey?: keyof MobileNavBadges;
}

export interface MobileNavBadges {
    messages?: number;
    cart?: number;
    notifications?: number;
}

// --- Final Mobile Navigation Items Definition (Option A - Revised) ---
export const mobileNavItems: MobileNavItem[] = [
    {
        title: "Home",
        href: "/dashboard",
        icon: HouseSimple,
        roles: ["admin", "teacher", "student"]
    },
    {
        title: "Courses",
        href: "/courses",
        icon: GraduationCap,
        roles: ["admin", "teacher", "student"]
    },
    {
        title: "Timetable",
        href: "/timetable",
        icon: Calendar,
        roles: ["teacher", "student", "admin"]
    },
    {
        title: "Chat",
        href: "/chat",
        icon: Chat,
        roles: ["teacher", "student", "admin"],
        badgeKey: "messages"
    },
];

export function MobileNav() {
    const pathname = usePathname();
    const { user } = useAppSelector((state) => state.auth);
    const cart = useAppSelector((state) => state.cart);
    const isMobile = useMobile();
    const scrollDirection = useScrollDirection();

    const isVisible = scrollDirection === "up" || scrollDirection === "none";

    const badgeCounts: MobileNavBadges = {
        cart: cart.items?.length || 0,
    };

    const filteredNavItems = mobileNavItems.filter(
        (item) => user && item.roles.includes(user.role)
    );

    if (!isMobile || !user) return null;

    return (
        <>
            {/* Floating Action Button */}
            {isVisible && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="fixed bottom-24 right-4 z-50"
                >
                    <Button
                        size="icon"
                        className="rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
                        asChild
                    >
                        {/* Dynamic based on role */}
                        <Link href={getFabLink(user.role)}>
                            <Plus size={24} weight="bold" />
                        </Link>
                    </Button>
                </motion.div>
            )}

            {/* Bottom Navigation Bar */}
            <motion.div
                className={cn(
                    "fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-border/30",
                    "bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60"
                )}
                animate={{ y: isVisible ? 0 : 100 }}
                initial={{ y: 0 }}
                transition={{ type: "tween", duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
                <nav className="flex h-full items-center justify-around px-2">
                    {filteredNavItems.map((item) => {
                        const isActive =
                            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        const Icon = item.icon;
                        const badgeValue = item.badgeKey ? badgeCounts[item.badgeKey] || 0 : 0;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative flex flex-1 flex-col items-center justify-center pt-1 pb-1 h-full",
                                    "transition-colors duration-200",
                                    isActive ? "text-primary" : ""
                                )}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <div className="relative mb-0.5">
                                    <Icon className="size-5" weight={
                                        isActive ? "fill" : "bold"
                                    } />
                                    {badgeValue > 0 && (
                                        <Badge
                                            variant="destructive"
                                            className="absolute -top-1 -right-2 h-4 min-w-[1rem] p-0.5 text-[10px] leading-none flex items-center justify-center"
                                        >
                                            {badgeValue > 9 ? "9+" : badgeValue}
                                        </Badge>
                                    )}
                                </div>
                                <span className="sr-only">{item.title}</span>

                                {isActive && (
                                    <motion.div
                                        layoutId="mobileActiveIndicator"
                                        className="absolute bottom-1 h-[3px] w-4 rounded-full bg-primary"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </motion.div>
        </>
    );
}

// Get FAB link/action based on user role
function getFabLink(role: "admin" | "teacher" | "student") {
    switch (role) {
        case "admin":
            return "/students/new"; // Admin adds a new student
        case "teacher":
            return "/chat/new"; // Teacher starts a new chat
        case "student":
            return "/support/new"; // Student opens new support ticket
        default:
            return "/";
    }
}
