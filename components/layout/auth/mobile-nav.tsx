// src/components/layout/auth/mobile-nav.tsx
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { useMobile } from "@/hooks/use-mobile";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import {
    CalendarBlank,
    GraduationCap,
    CheckCircle,
    UsersThree,
    Money,
    QrCode,
    // FAB Icons are now sourced from fab-config.ts via the hook
} from "phosphor-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Barcode from "react-barcode";

// --- Import Redux Selectors ---
import { selectChatUnreadCount } from "@/features/chat/store/chatSlice"; // Example path

// --- Import FAB Hook & Config ---
import { useFabAction } from "@/hooks/useFabAction"; // Adjusted path
import { isStudent, User } from "@/types/user.types";
import { BarChart3, Building, LayoutDashboard } from "lucide-react";

// Interface definitions (MobileNavItems) - Keep as is
export interface MobileNavItem {
    title: string;
    href: string;
    icon: React.ElementType;
    roles: Array<"super_admin" | "admin" | "accounting" | "customer_care" | "teacher" | "student">;
    badgeKey?: keyof MobileNavBadges;
    hidden?: boolean;
    requiredFlags?: Array<"isCorporateManager">;
}
export interface MobileNavBadges {
    messages?: number;
    // cart?: number; // Keep if needed
    notifications?: number;
}

export const getMobileNavItems = (user: User | null): MobileNavItem[] => {
    const isCorpManager = user && isStudent(user) && user.isCorporateManager;

    const items: MobileNavItem[] = [
        {
            title: "Dashboard",
            href: isCorpManager ? "/corporate-management" : "/dashboard",
            icon: LayoutDashboard,
            roles: ["super_admin", "admin", "teacher", "student"],
        },
        { title: "Dashboard", href: "/accounting/dashboard", icon: LayoutDashboard, roles: ['accounting'] },
        { title: "Dashboard", href: "/customer-care/dashboard", icon: LayoutDashboard, roles: ['customer_care'] },
        {
            title: "Courses",
            href: "/courses",
            icon: GraduationCap,
            roles: ["super_admin", "admin", "teacher", "student"],
        },
        {
            title: "Attendance",
            href: "/attendance",
            icon: CheckCircle,
            roles: ["super_admin", "admin", "teacher", "student", 'customer_care'],
            hidden: isCorpManager as boolean,
        },
        {
            title: "Scan Student",
            href: "/attendance/scan",
            icon: QrCode,
            roles: ["customer_care"],
        },
        {
            title: "Timetable",
            href: "/timetable",
            icon: CalendarBlank,
            roles: ["super_admin", "admin", "customer_care", "teacher", "student"],
            hidden: isCorpManager as boolean,
        },
        {
            title: "Discussions",
            href: "/chat",
            icon: UsersThree,
            roles: ["super_admin", "admin", "customer_care", "teacher", "student"],
            hidden: isCorpManager as boolean,
        },
        { title: "Payment History", href: "/payments", icon: Money, roles: ["accounting"] },
        { title: "Analytics", href: "/admin/analytics", icon: BarChart3, roles: ["accounting"] },
    ];

    // Filter items
    return items.filter(item => {
        if (!user || !item.roles.includes(user.role as any)) return false;
        if (item.hidden) return false;
        if (item.requiredFlags?.includes("isCorporateManager") && !isCorpManager) return false;
        return true;
    });
};

// --- MobileNav Component ---
export function MobileNav() {
    const pathname = usePathname();
    const { user } = useAppSelector((state) => state.auth);
    const mobileNavItems = getMobileNavItems(user);

    // const cart = useAppSelector((state) => state.cart); // Keep if cart badge is needed
    const isMobile = useMobile();
    const scrollDirection = useScrollDirection();
    const chatUnreadCount = useAppSelector(selectChatUnreadCount);
    const isNavVisible = scrollDirection === "up" || scrollDirection === "none"; // Renamed for clarity

    // --- State for Modals ---
    const [showStudentBarcodeModal, setShowStudentBarcodeModal] = React.useState(false);
    // Add state for other modals if needed (e.g., scan modal, create chat modal)
    // const [showScanModal, setShowScanModal] = React.useState(false);
    // const [showCreateChatModal, setShowCreateChatModal] = React.useState(false);

    // --- Use the FAB Action Hook ---
    const fabProps = useFabAction({
        // Pass down the state setters (or functions that call them)
        onShowStudentBarcode: () => setShowStudentBarcodeModal(true),
        // onOpenScanModal: () => setShowScanModal(true),
        // onOpenCreateChatModal: () => setShowCreateChatModal(true), // Example
        // Add other necessary handlers here
    });

    // --- Badge Counts (Example) ---
    const badgeCounts: MobileNavBadges = {
        messages: chatUnreadCount,
    };

    // Filter nav items
    const filteredNavItems = mobileNavItems.filter(
        (item) => user && item.roles.includes(user.role)
    ).slice(0, 5);

    if (!isMobile || !user) return null; // Don't render if not mobile or no user

    // --- Destructure FAB props ---
    const { isVisible: isFabVisible, icon: FabIcon, ariaLabel, onClick: handleFabClick } = fabProps;

    return (
        <>
            {/* Floating Action Button */}
            <AnimatePresence>
                {isNavVisible && isFabVisible && ( // Show FAB only if nav is visible AND fab action exists
                    <motion.div
                        key="fab"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25, delay: 0.1 }}
                        className="fixed bottom-20 right-8 z-50" // Position above bottom bar
                    >
                        {/* Render a single button, the onClick handles the action */}
                        <DyraneButton
                            size="icon"
                            className="rounded-full shadow-lg h-12 w-12"
                            aria-label={ariaLabel}
                            onClick={handleFabClick} // Use the onClick from the hook
                        >
                            {/* Render the icon provided by the hook */}
                            <FabIcon size={24} weight="bold" />
                        </DyraneButton>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Student Barcode Modal */}
            <Dialog open={showStudentBarcodeModal} onOpenChange={setShowStudentBarcodeModal}>
                <DialogContent className="bg-background/50 backdrop-blur-sm rounded-2xl shadow-xl px-6 py-4 w-auto flex flex-col items-center justify-center gap-4 transition-all duration-300">
                    <DialogHeader>
                        <DialogTitle>Your Attendance Barcode</DialogTitle>
                    </DialogHeader>
                    {isStudent(user) && (
                        <div className="p-4 bg-white rounded-md border shadow-inner mt-4">
                            <Barcode
                                value={user.barcodeId as string}
                                height={80}
                                width={2}
                                displayValue={false}
                                background="#ffffff"
                                lineColor="#000000"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Add other modals here if needed */}
            {/* Example:
            <Dialog open={showCreateChatModal} onOpenChange={setShowCreateChatModal}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Start New Chat</DialogTitle></DialogHeader>
                    {/* Chat creation form/component * /}
                </DialogContent>
            </Dialog>
            */}


            {/* Bottom Navigation Bar */}
            <motion.div
                className={cn(
                    "fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-border/30",
                    "bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 rounded-t-2xl"
                )}
                animate={{ y: isNavVisible ? 0 : 80 }} // Use isNavVisible
                initial={{ y: 0 }}
                transition={{ type: "tween", duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
                <nav className="flex h-full items-stretch justify-around px-1">
                    {filteredNavItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        const Icon = item.icon;
                        const badgeValue = item.badgeKey ? badgeCounts[item.badgeKey] || 0 : 0;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative flex flex-1 flex-col items-center justify-center pt-2 pb-1",
                                    "transition-colors duration-200 ease-[cubic-bezier(0.77, 0, 0.175, 1)] outline-none",
                                    "focus-visible:bg-primary/10 rounded-md",
                                    'hover:text-primary',
                                    isActive ? "text-primary" : ""
                                )}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <div className={cn(
                                    "relative mb-1 py-0.5",
                                    isActive && "bg-primary/10 rounded-full px-4 transition-colors duration-200 ease-in-out",
                                )}>
                                    <Icon size={22} weight={isActive ? "fill" : "regular"} />
                                    {badgeValue > 0 && (
                                        <Badge
                                            variant="destructive"
                                            className="absolute -top-1.5 -right-2 h-4 min-w-[1rem] p-0.5 text-[9px] leading-none flex items-center justify-center shadow-md"
                                        >
                                            {badgeValue > 9 ? "9+" : badgeValue}
                                        </Badge>
                                    )}
                                </div>
                                <span className={cn(
                                    "text-[10px] leading-none transition-opacity duration-200",
                                    isActive ? "opacity-100 font-medium" : "opacity-90"
                                )}>
                                    {item.title}
                                </span>

                                {isActive && (
                                    <motion.div
                                        layoutId="mobileActiveIndicator"
                                        className="absolute bottom-0 h-[3px] w-6 rounded-full bg-primary"
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