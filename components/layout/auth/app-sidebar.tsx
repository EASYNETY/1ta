// src/components/layout/auth/app-sidebar.tsx
"use client";

import * as React from "react"; // Import React
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/features/auth/store/auth-slice";
import { useTheme } from "next-themes";
import {
    // Import YOUR Sidebar components
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    // SidebarInput, // Not used in this example
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator, // Import Separator
    // SidebarRail, // Removed as collapse logic is internal
    // SidebarTrigger, // Trigger is usually in the Header
    useSidebar, // Use the context hook from your file
} from "@/components/ui/sidebar"; // Adjust path
import {
    LayoutDashboard, BookOpen, Users as AdminUsersIcon, BarChart3 as AdminAnalyticsIcon, LifeBuoy,
    Settings, LogOut, ShoppingCart, // Added required icons
    BarChart3,
    Users,
    MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge"; // Import Badge
import { Calendar, CheckCircle, GraduationCap, User } from "phosphor-react";
import { CartItem } from "@/features/cart/store/cart-slice";
import { CourseMiniCard } from "@/features/cart/components/course-mini-card";
import { CartNavItem } from "@/features/cart/components/cart-nav-items";
import { ThemeToggle } from "@/providers/theme-provider";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";

// --- Define Nav Item Type ---
export interface NavItem {
    title: string;
    href: string;
    icon: React.ElementType;
    roles: Array<"admin" | "teacher" | "student">; // Use your actual User roles
    badgeCount?: number;
}

// --- Define Navigation Items based on 1Tech Academy Docs ---
// Primary Student/Teacher Items
export const primaryNavItems: NavItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "teacher", "student"] },
    { title: "Courses", href: "/courses", icon: GraduationCap, roles: ["student", "teacher", 'admin'] }, // Student/Teacher view
    { title: "Attendance", href: "/attendance", icon: CheckCircle, roles: ["student", 'teacher', 'admin'] }, // Example
    { title: "Timetable", href: "/timetable", icon: Calendar, roles: ["student", "teacher", 'admin'] }, // Example
    { title: "Chat", href: "/chat", icon: MessageSquare, roles: ["student", "teacher", 'admin'] }, // Example
];

// Admin Specific Items
export const adminNavItems: NavItem[] = [
    { title: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ["admin"] }, // Admin specific dashboard
    { title: "Students", href: "/students", icon: AdminUsersIcon, roles: ["admin"] },
    { title: "Classes", href: "/classes", icon: BookOpen, roles: ["admin"] },
    { title: "Payments", href: "/payments", icon: BarChart3, roles: ["admin"] }, // Use correct icon
    { title: "Tickets", href: "/support-tickets", icon: LifeBuoy, roles: ["admin"] },
    { title: "Feedback", href: "/feedback", icon: Users, roles: ["admin"] }, // Use correct icon
];

// Secondary/Bottom Items
export const secondaryNavItems: NavItem[] = [
    { title: "Profile", href: "/profile", icon: User, roles: ["admin", "teacher", "student"] },
    { title: "Settings", href: "/settings", icon: Settings, roles: ["admin", "teacher", "student"] },
    { title: "Support", href: "/support", icon: LifeBuoy, roles: ["admin", "teacher", "student"] },
];

// --- AppSidebar Component ---
export function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter()
    const { user } = useAppSelector((state) => state.auth);
    const cart = useAppSelector((state) => state.cart);
    const hasItems = cart.items.length > 0;
    const dispatch = useAppDispatch();

    // --- Use state and toggle from YOUR Sidebar Context ---
    const { state: sidebarState } = useSidebar(); // Get collapsed/expanded state from context
    const isSidebarOpen = sidebarState === 'expanded';
    // --- End Context Usage ---
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    const currentTheme = mounted ? theme : 'light';

    // Filter nav items based on user role
    const filterItems = (items: NavItem[]) => items.filter(item => user && item.roles.includes(user.role as any)); // Cast role if needed

    const handleLogout = () => dispatch(logout());

    function removeDuplicateNavItems(primary: NavItem[], secondary: NavItem[]) {
        const primaryHrefs = new Set(primary.map(item => item.href));
        return secondary.filter(item => !primaryHrefs.has(item.href));
    }
    const visiblePrimaryItems = filterItems(primaryNavItems);
    const visibleAdminItems = removeDuplicateNavItems(
        visiblePrimaryItems,
        filterItems(adminNavItems)
    );
    const visibleSecondaryItems = filterItems(secondaryNavItems);


    const handlecartClick = () => {
        router.push("/cart");
    }


    return (
        // Use the Sidebar component provided by your library
        <Sidebar
            // Pass necessary props based on your Sidebar component's API
            // e.g., collapsible="icon" or similar might be needed if not default
            className={cn(
                "border-r border-border/30 bg-background/80 dark:bg-background/80 backdrop-blur-xl shadow-md"
            )}
        >
            {/* Header */}
            <SidebarHeader className="mb-0 px-2 py-4">
                {/* Logo visible only when expanded */}
                <Link href="/dashboard" className={cn("flex items-center justify-start gap-2 font-semibold", !isSidebarOpen && "hidden")}>
                    <span suppressHydrationWarning className="h-6 w-auto">
                        {mounted ? (
                            <Image src={currentTheme === "dark" ? "/logo_dark.png" : "/logo.png"} alt="1Tech Logo" width={80} height={14} className="h-6 w-auto" />
                        )
                            : (
                                <div className="h-6 w-[80px] bg-muted rounded animate-pulse"></div>)}
                    </span>
                </Link>
                {/* Placeholder/Icon when collapsed - depends on your library */}
                {!isSidebarOpen && <div className="h-6 w-6 bg-primary rounded-md mx-auto"></div> /* Example */}
            </SidebarHeader>

            {/* Main Content Area */}
            <SidebarContent>
                {/* Primary Navigation */}
                <SidebarGroup>
                    {isSidebarOpen && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
                    <SidebarGroupContent>
                        <NavMenuList items={visiblePrimaryItems} isSidebarOpen={isSidebarOpen} pathname={pathname} />
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Admin Navigation */}
                {visibleAdminItems.length > 0 && (
                    <SidebarGroup>
                        {isSidebarOpen && <SidebarGroupLabel>Admin Tools</SidebarGroupLabel>}
                        <SidebarGroupContent>
                            <NavMenuList items={visibleAdminItems} isSidebarOpen={isSidebarOpen} pathname={pathname} />
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {/* Cart Mini Card */}
                {cart.items.length > 0 && (
                    <SidebarGroup>
                        {isSidebarOpen &&
                            <SidebarGroupLabel>Selected Courses</SidebarGroupLabel>}
                        <SidebarGroupContent>
                            {cart.items.map((item: CartItem) => (
                                <CourseMiniCard key={item.courseId} item={item} className="hover:bg-muted rounded-md" onClick={handlecartClick} />
                            ))}
                            {/* Cart Nav Item */}
                            {/* {cart.items.length > 0 && (
                                <CartNavItem />)} */}
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {/* Secondary Navigation */}
                <SidebarGroup>
                    {isSidebarOpen && <SidebarGroupLabel>Account & Help</SidebarGroupLabel>}
                    <SidebarGroupContent>
                        <NavMenuList items={visibleSecondaryItems} isSidebarOpen={isSidebarOpen} pathname={pathname} />
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer Area */}
            <SidebarFooter className="mt-0 py-0">
                {/* Separator and Auth actions at the bottom */}
                <div className="mt-auto py-2"> {/* Bottom padding and border */}
                    {user && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href="/profile" className="mb-2 flex items-center space-x-4 rounded-xl p-2 bg-accent/50 hover:bg-accent/80 transition-colors ease-[cubic-bezier(0.77, 0, 0.175, 1)] duration-300">
                                    <Avatar className="size-10">
                                        <AvatarImage src={user.name || undefined} alt={user.name} />
                                        <AvatarFallback className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">{user.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div className="overflow-hidden">
                                        <p className="font-semibold text-sm truncate text-foreground">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">{user.name}<br />
                                <span className="text-xs text-muted">{user.role}</span>
                            </TooltipContent>
                        </Tooltip>
                    )}
                    <div className="flex flex-row space-x-4 w-full items-center justify-between">
                        {/* Theme Toggle */}
                        {mounted && (
                            <ThemeToggle />
                        )}
                        <div className="flex flex-row space-x-4 w-full items-center justify-end">

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
            </SidebarFooter>

        </Sidebar>
    );
}


// --- Reusable Helper for Rendering Nav List ---
interface NavMenuListProps {
    items: NavItem[];
    isSidebarOpen: boolean;
    pathname: string;
}

export function NavMenuList({ items, isSidebarOpen, pathname }: NavMenuListProps) {
    return (
        <SidebarMenu>
            {items.map((item) => {
                // More robust active check for nested routes
                const isActive = item.href === '/dashboard'
                    ? pathname === item.href // Exact match for dashboard
                    : pathname.startsWith(item.href); // Starts with for others

                const Icon = item.icon;
                return (
                    <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={item.title}
                            aria-label={item.title} // Add aria-label
                        >
                            <Link
                                href={item.href}
                                className="flex items-center gap-2 overflow-hidden min-w-0" // <-- ADD THIS
                            >
                                <Icon className="size-5 shrink-0" />
                                <span className={cn("truncate", !isSidebarOpen && "sr-only")}>
                                    {item.title}
                                </span>
                                {item.badgeCount && item.badgeCount > 0 && isSidebarOpen && (
                                    <Badge variant="default" className="ml-auto h-5 px-1.5 text-xs">
                                        {item.badgeCount > 9 ? "9+" : item.badgeCount}
                                    </Badge>
                                )}
                            </Link>


                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            })}
        </SidebarMenu>
    );
}