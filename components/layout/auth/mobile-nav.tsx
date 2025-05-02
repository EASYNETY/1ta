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
    HouseSimple,
    CalendarBlank,
    ChatCircleDots,
    Plus,
    GraduationCap,
    EnvelopeSimple,
    CheckCircle,
    Barcode as BarcodeIcon,
    QrCode,
} from "phosphor-react";
import { is } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Barcode from "react-barcode";

// --- Import Redux Selectors ---
import { selectChatUnreadCount } from "@/features/chat/store/chatSlice"; // Example path

// Interface definitions
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

// Final Mobile Navigation Items Definition (Using Phosphor for example)
export const mobileNavItems: MobileNavItem[] = [
    { title: "Home", href: "/dashboard", icon: HouseSimple, roles: ["admin", "teacher", "student"] },
    { title: "Courses", href: "/courses", icon: GraduationCap, roles: ["admin", "teacher", "student"] }, // Using GraduationCap
    { title: "Timetable", href: "/timetable", icon: CalendarBlank, roles: ["teacher", "student", "admin"] },
    { title: "Attendance", href: "/attendance", icon: CheckCircle, roles: ["student", 'teacher', 'admin'] },
    { title: "Chat", href: "/chat", icon: EnvelopeSimple, roles: ["teacher", "student", "admin"], badgeKey: "messages" },
];

// --- Contextual FAB Action Logic ---
interface FabAction {
    href: string;
    ariaLabel: string;
    show: boolean; // Should the FAB be shown on this page/role?
    actionType?: 'navigate' | 'showStudentBarcode' | 'scanBarcode' | 'createChat' | 'createTicket' | 'createClass' | 'createStudent' | 'createCourse' | 'createEvent';
}

function getFabAction(role: "admin" | "teacher" | "student", pathname: string): FabAction {
    let action: FabAction = { href: "/", ariaLabel: "Action", show: false, actionType: 'navigate' }; // Default hidden

    // --- Specific Page Logic ---

    // **Hide on Scan Page**
    if (pathname === "/attendance/scan") {
        action = { ...action, show: false };
    }
    // **Attendance List Page**
    else if (pathname === "/attendance") { // Use === for exact match
        switch (role) {
            case "admin": case "teacher":
                action = { href: "/attendance/scan", ariaLabel: "Scan Attendance", show: true, actionType: 'navigate' }; break; // Navigate to scan page
            case "student":
                action = { href: "#", ariaLabel: "Show My Barcode", show: true, actionType: 'showStudentBarcode' }; break;
        }
    }
    // **Chat Page** (Root chat or specific room)
    else if (pathname.startsWith("/chat")) {
        action = { href: "/chat/create", ariaLabel: "Start New Chat", show: true, actionType: 'createChat' }; // Assumes /chat/create exists or triggers modal
    }
    // **Courses Page**
    else if (pathname.startsWith("/courses")) {
        switch (role) {
            case "admin":
                action = { href: "/courses/create", ariaLabel: "Create Course Template", show: true, actionType: 'createCourse' }; break; // Needs implementation
            case "teacher":
                action = { href: "/classes/create", ariaLabel: "Create New Class", show: true, actionType: 'createClass' }; break; // Needs implementation
            // No FAB for student on general courses page
            case "student": action = { ...action, show: false }; break;
        }
    }
    // **Timetable Page**
    else if (pathname.startsWith("/timetable")) {
        switch (role) {
            case "admin": case "teacher":
                action = { href: "/classes/create", ariaLabel: "Add Class", show: true, actionType: 'createEvent' }; break; // Needs implementation
            case "student": action = { ...action, show: false }; break;
        }
    }
    // **Support Page** (List or Create)
    else if (pathname.startsWith("/support")) {
        if (role === 'student' && pathname !== '/support/create') { // Show only if not already on create page
            action = { href: "/support/create", ariaLabel: "Create Support Ticket", show: true, actionType: 'navigate' };
        } else {
            action = { ...action, show: false }; // Hide on create page or for other roles
        }
    }
    // **Admin - Students List Page**
    else if (pathname === "/admin/students" || pathname.startsWith("/users?tab=students")) { // Check both possible paths
        if (role === 'admin') {
            action = { href: "/users/create", ariaLabel: "Add New User", show: true, actionType: 'createStudent' }; // Needs implementation
        } else {
            action = { ...action, show: false };
        }
    }
    // **Settings / Profile / Subscription**
    else if (pathname.startsWith("/settings") || pathname.startsWith("/profile") || pathname.startsWith("/subscription")) {
        action = { ...action, show: false };
    }
    // **Dashboard (Default Fallback)**
    else if (pathname.startsWith("/dashboard") || pathname === "/") {
        switch (role) {
            case "admin": action = { href: "/admin/students/create", ariaLabel: "Add Student", show: true, actionType: 'createStudent' }; break;
            case "teacher": action = { href: "/teacher/classes/create", ariaLabel: "Create Class", show: true, actionType: 'createClass' }; break;
            case "student": action = { href: "/support/create", ariaLabel: "New Support Ticket", show: true, actionType: 'navigate' }; break; // Navigate for student default
        }
    }
    // Add more specific page rules if needed (e.g., /payments, /admin/pricing)

    return action;
}


// --- MobileNav Component ---
export function MobileNav() {
    const pathname = usePathname();
    const { user } = useAppSelector((state) => state.auth);
    const cart = useAppSelector((state) => state.cart); // Keep cart if badge is needed
    const isMobile = useMobile();
    const scrollDirection = useScrollDirection();
    const chatUnreadCount = useAppSelector(selectChatUnreadCount);
    const isVisible = scrollDirection === "up" || scrollDirection === "none";
    // --- State for Student Barcode Modal ---
    const [showStudentBarcodeModal, setShowStudentBarcodeModal] = React.useState(false);

    // --- Badge Counts (Example) ---
    const badgeCounts: MobileNavBadges = {
        // cart: cart.items?.length || 0, // Example if cart badge needed
        messages: chatUnreadCount
        ,
    };

    // Filter nav items
    const filteredNavItems = mobileNavItems.filter(
        (item) => user && item.roles.includes(user.role)
    ).slice(0, 5); // Ensure max 5 items

    // --- Determine FAB action & Icon ---
    const fabAction = user ? getFabAction(user.role, pathname) : { href: "/", ariaLabel: "", show: false, actionType: 'navigate' };
    const isAttendancePage = pathname.startsWith("/attendance");

    let FabIcon = Plus; // Default icon
    if (isAttendancePage) {
        if (user?.role === 'student') {
            FabIcon = BarcodeIcon; // Icon for showing barcode
        } else if (user?.role === 'admin' || user?.role === 'teacher') {
            FabIcon = QrCode; // Icon for scanning
        }
    }

    if (!isMobile || !user) return null; // Don't render if not mobile or no user

    // --- FAB Click Handler ---
    const handleFabClick = (e: React.MouseEvent) => {
        // Prevent navigation if actionType is not 'navigate'
        if (fabAction.actionType === 'showStudentBarcode') {
            e.preventDefault(); // Prevent default link behavior for '#' href
            setShowStudentBarcodeModal(true);
        }
        // Add future logic for other actionTypes like 'scanBarcode' if triggering a modal directly
        // else if (fabAction.actionType === 'scanBarcode') {
        //   e.preventDefault();
        //   // openScanModal();
        // }
        // Otherwise, allow default navigation via Link component
    };

    return (
        <>
            {/* Floating Action Button */}
            {/* Show FAB only if visible and action specifies show=true */}
            <AnimatePresence>
                {isVisible && fabAction.show && (
                    <motion.div
                        key="fab"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25, delay: 0.1 }}
                        className="fixed bottom-20 right-8 z-50" // Position above bottom bar
                    >
                        {fabAction.actionType === 'navigate' || fabAction.actionType === 'scanBarcode' ? (
                            <DyraneButton
                                size="icon"
                                className="rounded-full shadow-lg h-12 w-12"
                                asChild // Use asChild for Link wrapper
                                aria-label={fabAction.ariaLabel}
                            >
                                <Link href={fabAction.href} onClick={handleFabClick}>
                                    <FabIcon size={24} weight="bold" />
                                </Link>
                            </DyraneButton>
                        ) : (
                            <DyraneButton
                                size="icon"
                                className="rounded-full shadow-lg h-12 w-12"
                                aria-label={fabAction.ariaLabel}
                                onClick={handleFabClick} // Use direct onClick for student barcode
                            >
                                <FabIcon size={24} weight="bold" />
                            </DyraneButton>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <Dialog open={showStudentBarcodeModal} onOpenChange={setShowStudentBarcodeModal}>
                <DialogContent className="sm:max-w-[300px] flex flex-col items-center">
                    <DialogHeader>
                        <DialogTitle>Your Attendance Barcode</DialogTitle>
                    </DialogHeader>
                    {/* Render the barcode directly if user exists */}
                    {user && (
                        <div className="p-4 bg-white rounded-md border shadow-inner mt-4">
                            <Barcode
                                value={user.id} // The value to encode
                                height={80}     // Height of the barcode
                                width={2}       // Width of the narrowest bar
                                displayValue={false} // Set true to show text below
                                background="#ffffff" // Background color
                                lineColor="#000000" // Bar color
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Bottom Navigation Bar */}
            <motion.div
                className={cn(
                    "fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-border/30",
                    "bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 rounded-t-2xl"
                )}
                animate={{ y: isVisible ? 0 : 80 }}
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
                                    "relative flex flex-1 flex-col items-center justify-center pt-2 pb-1", // Adjusted padding
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
                                )
                                }>
                                    {/* Use weight prop for Phosphor icons */}
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