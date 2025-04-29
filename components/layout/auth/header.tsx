// components/layout/auth/header.tsx

"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, Bell } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useMobile } from "@/hooks/use-mobile"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/providers/theme-provider"
import { logout } from "@/features/auth/store/auth-slice"
import { useTheme } from "next-themes"
import Image from "next/image"
import { Avatar } from "@radix-ui/react-avatar"
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useScrollDirection } from "@/hooks/use-scroll-direction"
import { adminNavItems, NavItem, primaryNavItems, secondaryNavItems } from "./app-sidebar"
import { mobileNavItems } from "./mobile-nav"
import { CourseMiniCard } from "@/features/cart/components/course-mini-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CartItem } from "@/features/cart/store/cart-slice"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { BarcodeDialog } from "@/components/tools/BarcodeDialog"


// Mock notifications data
export const notifications = [
    { id: 1, title: "New Assignment Posted", message: "Web Dev assignment 3 is available.", time: "1h ago", read: false, href: "/assignments/webdev-3" },
    { id: 2, title: "Grade Update", message: "Your Data Science Midterm grade is up.", time: "4h ago", read: false, href: "/grades" },
    { id: 3, title: "Class Reminder", message: "Cybersecurity lecture starts in 15 mins.", time: "1d ago", read: true, href: "/timetable" },
]

export function Header() {
    // --- Hooks ---
    const { isAuthenticated, user } = useAppSelector((state) => state.auth)
    const cart = useAppSelector((state) => state.cart)
    const dispatch = useAppDispatch()
    const router = useRouter()
    const isMobile = useMobile()
    const { theme, setTheme, systemTheme } = useTheme();
    const scrollDirection = useScrollDirection();

    // --- State ---
    const [isScrolled, setIsScrolled] = useState(false)
    const [notificationCount, setNotificationCount] = useState(3)
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const [mounted, setMounted] = useState(false);
    const [mobileUserSheetOpen, setMobileUserSheetOpen] = useState(false);


    // --- Effects ---
    // Get cart items from Redux store
    useEffect(() => setMounted(true), []);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // -- Handlers --

    const handleLogout = () => {
        dispatch(logout());
        router.push("/login"); // Navigate after logout dispatch
    };
    const closeMobileSheet = () => setMobileUserSheetOpen(false);

    const handlecartClick = () => {
        setMobileUserSheetOpen(false);
        router.push("/cart");
    }

    // --- Derived State ---

    const hasItems = cart.items.length > 0;
    // Determine the current theme, defaulting to light if not mounted or system theme is unclear
    const currentTheme = mounted ? (theme === "system" ? systemTheme : theme) : undefined
    const isVisible = scrollDirection === "down" || scrollDirection === "none";

    // --- Mobile Navigation Items ---

    // --- Filtered Nav Items for Mobile Sheet ---
    // Exclude items present in the bottom mobile bar
    const excludeHrefs = new Set(mobileNavItems.map(item => item.href));
    const userRole = user?.role as ("admin" | "teacher" | "student") | undefined; // Get user role safely

    const sheetNavItems = userRole ? primaryNavItems.filter(item =>
        !excludeHrefs.has(item.href) && item.roles.includes(userRole)
    ) : [];

    const sheetAdminItems = userRole === 'admin' ? adminNavItems.filter(item =>
        !excludeHrefs.has(item.href) // No need to check role again
    ) : [];

    const sheetSecondaryItems = userRole ? secondaryNavItems.filter(item =>
        !excludeHrefs.has(item.href) && item.roles.includes(userRole)
    ) : [];


    // --- Styles ---
    // DyraneUI Style Variables (Adjust these to match your tokens/theme)
    const scrolledHeaderBg = "bg-background/65"; // Example: Less opaque background
    const scrolledHeaderBlur = "backdrop-blur-md"; // Standard blur
    const scrolledHeaderBorder = "border-b border-border/30"; // Subtle border
    const linkHoverColor = "hover:text-primary"; // Primary hover color
    const mutedTextColor = "text-muted-foreground"; // Muted text color

    // --- Render ---
    // Return null or a skeleton if critical data like user isn't ready yet, AFTER hooks
    if (!mounted || !user) {
        return <div className="sticky top-0 z-40 h-16 w-full border-b border-transparent bg-transparent"></div>; // Placeholder
    }

    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full transition-all duration-300 ease-[cubic-bezier(0.77, 0, 0.175, 1)]", // Use transition-colors, adjusted z-index
                isScrolled && isVisible // Only apply styles when scrolled and visible
                    ? cn("shadow-sm", scrolledHeaderBorder, scrolledHeaderBg, scrolledHeaderBlur, 'opacity-0') // Combined scrolled styles
                    : "border-b border-transparent opacity-100" // Transparent border when at top
            )}
        >
            <div className="flex h-16 items-center justify-between gap-x-4 px-4 sm:px-6 lg:px-8 w-full"> {/* Added gap, adjusted padding */}
                {/* Left section */}
                <div className="flex items-center gap-4">
                    {!isMobile && <SidebarTrigger />}
                    {isMobile ? (
                        <Sheet
                            open={mobileUserSheetOpen} onOpenChange={setMobileUserSheetOpen}
                        >
                            <div className="relative">
                                <SheetTrigger asChild>
                                    <Avatar>
                                        <AvatarImage
                                            src={user?.name?.charAt(0) || "U"}
                                            alt="User Avatar"
                                            className="h-7 w-7 rounded-full"
                                        />
                                        <AvatarFallback className="relative h-7 w-7 rounded-full bg-muted text-primary hover:bg-primary/20 cursor-pointer hover:border hover:border-primary">
                                            {user?.name?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                </SheetTrigger>
                                {/* Badge */}
                                {hasItems && (
                                    <div className="absolute -top-[1px] -right-[1px]">
                                        {/* Ping animation */}
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                                        {/* Actual badge */}
                                        <span className="relative flex h-2 w-2 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium ring-2 ring-primary/30">
                                        </span>
                                    </div>
                                )}
                            </div>

                            <SheetContent side="left" className="w-[320px] sm:w-[400px] flex flex-col gap-0 rounded-r-3xl border-0 bg-background/65 backdrop-blur-md h-full border-none">
                                <SheetHeader className="mb-0 px-2">
                                    <SheetTitle>
                                        {/* Logo */}
                                        <Link href="/dashboard" className="flex items-center space-x-2 flex-shrink-0">
                                            {mounted && currentTheme && (
                                                <Image
                                                    src={currentTheme === "dark" ? "/logo_dark.png" : "/logo.png"}
                                                    alt="1techacademy Logo"
                                                    className="h-6 w-auto"
                                                    priority
                                                    width={80}
                                                    height={14}
                                                />
                                            )}
                                            {(!mounted || !currentTheme) && <div className="h-6 w-[80px] bg-muted rounded animate-pulse"></div>}
                                        </Link>
                                    </SheetTitle>
                                </SheetHeader>


                                {/* Scrollable Navigation Area */}
                                <div className="flex h-full flex-col gap-6 px-2 justify-between overflow-y-scroll">
                                    {/* Main Navigation Section */}
                                    {sheetNavItems.length > 0 && (
                                        <nav className="space-y-1 py-2 px-0">
                                            <p className=" text-xs capitalized text-muted-foreground tracking-wider mb-2">Navigation</p>
                                            <MobileNavItemsList items={sheetNavItems} closeSheet={closeMobileSheet} />
                                        </nav>
                                    )}

                                    {/* Admin Tools Section */}
                                    {sheetAdminItems.length > 0 && (
                                        <nav className="space-y-1 py-2 border-border/20 px-0">
                                            <p className=" text-xs capitalized text-muted-foreground tracking-wider mb-2">Admin Tools</p>
                                            <MobileNavItemsList items={sheetAdminItems} closeSheet={closeMobileSheet} />
                                        </nav>
                                    )}

                                    {/* Footer Actions Section */}
                                    <div className="mt-auto py-2 border-border/30 space-y-1 px-0">
                                        <p className="px-0 text-xs capitalized text-muted-foreground tracking-wider mb-2">Account & Help</p>
                                        <MobileNavItemsList items={sheetSecondaryItems} closeSheet={closeMobileSheet} />
                                    </div>


                                    {/* Cart Mini Card */}
                                    {cart.items.length > 0 && (
                                        <div className="py-2 border-border/30">
                                            <h3 className="text-xs text-muted-foreground tracking-wider mb-2">Selected Courses</h3>
                                            <div className="flex flex-col space-y-2 px-2 ">
                                                {cart.items.map((item: CartItem) => (
                                                    <CourseMiniCard key={item.courseId} item={item} className="hover:bg-muted rounded-md" onClick={handlecartClick} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <SheetFooter className="mt-0 py-0">
                                    {/* Separator and Auth actions at the bottom */}
                                    <div className="mt-auto py-2"> {/* Bottom padding and border */}
                                        {isAuthenticated && user && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <SheetClose asChild >
                                                        <Link href="/profile" className="mb-2 flex items-center space-x-4 rounded-xl p-2 bg-accent/50 hover:bg-accent transition-colors ease-[cubic-bezier(0.77, 0, 0.175, 1)] duration-300">
                                                            <Avatar className="size-10">
                                                                <AvatarImage src={user.name || undefined} alt={user.name} />
                                                                <AvatarFallback className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">{user.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="overflow-hidden">
                                                                <p className="font-semibold text-sm truncate text-foreground">{user.name}</p>
                                                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                            </div>
                                                        </Link>
                                                    </SheetClose>
                                                </TooltipTrigger>
                                                <TooltipContent side="right">{user.name}<br />
                                                    <span className="text-xs text-muted">{user.role}</span>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                        <div className="flex flex-row space-x-4 w-full items-center justify-between">
                                            {/* Theme Toggle */}
                                            {/* {mounted && (
                                                <ThemeToggle />
                                            )} */}
                                            <div className="flex flex-row space-x-4 w-full items-center justify-between">
                                                {/* Barcode Section */}
                                                {isAuthenticated && user?.id && (
                                                    <BarcodeDialog userId={user.id} lineColor="#C99700" />
                                                )}
                                                {/* Logout Button */}
                                                <DyraneButton
                                                    onClick={handleLogout}
                                                    variant={'destructive'}
                                                    size="sm"
                                                    className="bg-destructive/5 hover:bg-destructive/80 text-destructive rounded-md px-4 py-2 transition-colors ease-[cubic-bezier(0.77, 0, 0.175, 1)] duration-300"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    <span>Logout</span>
                                                </DyraneButton>
                                            </div>
                                        </div>
                                    </div>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>
                    ) : (null)}
                </div>

                {/* Center section - only on mobile when not scrolled */}
                {isMobile && !isScrolled && (
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                        >
                            {/* Logo */}
                            <Link href="/dashboard" className="flex items-center space-x-2 flex-shrink-0 mr-4 lg:mr-0"> {/* flex-shrink-0 prevents shrinking */}
                                {mounted && currentTheme && (
                                    <Image
                                        src={currentTheme === "dark" ? "/logo_dark.png" : "/logo.png"}
                                        alt="1techacademy Logo"
                                        className="h-6 w-auto"
                                        priority
                                        width={80}
                                        height={14}
                                    />
                                )}
                                {(!mounted || !currentTheme) && <div className="h-6 w-[80px] bg-muted rounded animate-pulse"></div>}
                            </Link>
                        </motion.div>
                    </AnimatePresence>
                )}

                {/* Right section */}
                <div className="flex items-center space-x-4">
                    {/* <ThemeToggle /> */}

                    {isAuthenticated && (
                        <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                            <SheetTrigger asChild>
                                <button className="relative rounded-full p-2 hover:bg-muted cursor-pointer">
                                    <Bell className="h-5 w-5" />
                                    {notificationCount > 0 && (
                                        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                                            {notificationCount}
                                        </span>
                                    )}
                                </button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[320px] sm:w-[400px] rounded-l-3xl border-0 bg-background/65 backdrop-blur-md pb-4">
                                <SheetHeader className="px-4">
                                    <SheetTitle>Notifications</SheetTitle>
                                </SheetHeader>
                                <ScrollArea className="flex-1 overflow-y-scroll">
                                    <div className="p-4 space-y-3">
                                        {notifications.map((notification) => (
                                            <Link href={notification.href || '#'} key={notification.id} className="block" onClick={() => setNotificationsOpen(false)}>
                                                <div className={cn("rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50 cursor-pointer", !notification.read ? "border-primary/20 bg-primary/5 dark:bg-primary/10" : "border-border/30")}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <h4 className="font-medium text-foreground">{notification.title}</h4>
                                                        {!notification.read && <div aria-label="Unread" className="h-2 w-2 rounded-full bg-primary flex-shrink-0 ml-2" />}
                                                    </div>
                                                    <p className="text-muted-foreground text-xs leading-snug line-clamp-2">{notification.message}</p>
                                                    <p className="mt-2 text-[10px] text-muted-foreground/80">{notification.time}</p>
                                                </div>
                                            </Link>
                                        ))}
                                        {notifications.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <Bell className="mb-2 size-10 text-muted-foreground/50" />
                                                <p className="text-sm text-muted-foreground">You're all caught up!</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </SheetContent>
                        </Sheet>
                    )}
                </div>
            </div>
        </header>
    )
}


// --- Helper Component for Mobile Nav Item List (Revised) ---
interface MobileNavItemsListProps {
    items: NavItem[]; // Use the shared NavItem type
    // userRole: string; // No longer needed, filtering done above
    // exclude: MobileNavItem[]; // No longer needed
    closeSheet: () => void; // Function to close the sheet
}

// This helper now just renders a list of pre-filtered items
function MobileNavItemsList({ items, closeSheet }: MobileNavItemsListProps) {
    const pathname = usePathname();

    if (!items || items.length === 0) return null;

    return (
        <>
            {items.map((item) => {
                const isActive = item.href === '/dashboard'
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                const Icon = item.icon; // Get icon component type

                return (
                    // Use SheetClose to automatically close on navigation
                    <SheetClose asChild key={item.href}>
                        <Link
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary",
                                isActive ? "text-primary bg-primary/10 font-medium" : "text-foreground/80",
                            )}
                            onClick={closeSheet} // Ensure sheet closes even if link is current page
                        >
                            <Icon className="size-5 shrink-0" weight={isActive ? "fill" : "regular"} />
                            {item.title}
                            {/* Badge logic can be added here if needed for specific items */}
                            {item.badgeCount && item.badgeCount > 0 && (
                                <Badge variant="default" className="ml-auto h-5 px-1.5 text-xs">
                                    {item.badgeCount > 9 ? "9+" : item.badgeCount}
                                </Badge>
                            )}
                        </Link>
                    </SheetClose>
                );
            })}
        </>
    );
}