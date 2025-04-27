// src/components/layout/auth/app-sidebar.tsx
"use client";

import * as React from "react"; // Import React
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
import { Calendar, CheckCircle, User } from "phosphor-react";

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
    { title: "Courses", href: "/courses", icon: BookOpen, roles: ["student", "teacher", 'admin'] }, // Student/Teacher view
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
    const { user } = useAppSelector((state) => state.auth);
    const cart = useAppSelector((state) => state.cart);
    const dispatch = useAppDispatch();
    const { state: sidebarState } = useSidebar(); // Get collapsed/expanded state from context
    const isSidebarOpen = sidebarState === 'expanded';
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    const currentTheme = mounted ? theme : 'light';

    // Filter nav items
    const filterItems = (items: NavItem[]) => items.filter(item => user && item.roles.includes(user.role as any)); // Cast role if needed

    const handleLogout = () => dispatch(logout());

    const visiblePrimaryItems = filterItems(primaryNavItems);
    const visibleAdminItems = filterItems(adminNavItems);
    const visibleSecondaryItems = filterItems(secondaryNavItems);

    // Cart item (conditionally added)
    const cartItem: NavItem | null = cart.items.length > 0 ? {
        title: "Cart",
        href: "/cart", // Assuming a cart page exists
        icon: ShoppingCart,
        roles: ["student"], // Assuming cart is for students
        badgeCount: cart.items.length
    } : null;
    if (cartItem && user?.role === 'student') {
        visiblePrimaryItems.push(cartItem); // Add cart to primary nav for students
    }


    return (
        // Use the Sidebar component provided by your library
        <Sidebar
            // Pass necessary props based on your Sidebar component's API
            // e.g., collapsible="icon" or similar might be needed if not default
            className={cn(
                "border-r border-border/30 bg-background/80 dark:bg-background/80 backdrop-blur-xl shadow-md" // Apply Dyrane styles
            )}
        >
            {/* Header */}
            <SidebarHeader className="p-4 border-b border-border/30 h-16 flex items-center">
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
                    <>
                        <SidebarSeparator />
                        <SidebarGroup>
                            {isSidebarOpen && <SidebarGroupLabel>Admin Tools</SidebarGroupLabel>}
                            <SidebarGroupContent>
                                <NavMenuList items={visibleAdminItems} isSidebarOpen={isSidebarOpen} pathname={pathname} />
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </>
                )}
            </SidebarContent>

            {/* Footer Area */}
            <SidebarFooter>
                {/* Secondary Navigation */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <NavMenuList items={visibleSecondaryItems} isSidebarOpen={isSidebarOpen} pathname={pathname} />
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                {/* User Profile Area */}
                {user && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href="/profile"
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground",
                                    !isSidebarOpen && "w-10 h-10 justify-center p-0" // Icon only style
                                )}
                            >
                                <Avatar className={cn("size-7", !isSidebarOpen && "size-6")}>
                                    <AvatarImage src={user.name || undefined} alt={user.name} />
                                    <AvatarFallback>{user.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className={cn("flex flex-col overflow-hidden", !isSidebarOpen && "hidden")}>
                                    <span className="text-sm font-medium text-foreground truncate">{user.name}</span>
                                    <span className="text-xs text-muted-foreground truncate">{user.role}</span>
                                </div>
                            </Link>
                        </TooltipTrigger>
                        {!isSidebarOpen && <TooltipContent side="right">{user.name}<br /><span className="text-xs text-muted-foreground">{user.role}</span></TooltipContent>}
                    </Tooltip>
                )}

                {/* Logout Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            className="mt-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label="Logout"
                        >
                            <LogOut className="size-5 shrink-0" />
                            <span className={cn("truncate", !isSidebarOpen && "sr-only")}>Logout</span>
                        </SidebarMenuButton>
                    </TooltipTrigger>
                    {!isSidebarOpen && <TooltipContent side="right">Logout</TooltipContent>}
                </Tooltip>
            </SidebarFooter>
            {/* Optional: Add SidebarRail here if your library uses it for the hover area */}
            {/* <SidebarRail /> */}
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
                            <Link href={item.href}>
                                <Icon className="size-5 shrink-0" />
                                <span className={cn("truncate", !isSidebarOpen && "sr-only")}>{item.title}</span>
                                {/* Badge Count */}
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