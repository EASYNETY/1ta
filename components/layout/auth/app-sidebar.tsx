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
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"; // Adjust path
import {
    LayoutDashboard, Users as AdminUsersIcon, LifeBuoy, LogOut,
    BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import TooltipProvider if not implicitly wrapping elsewhere
import { Avatar, AvatarFallback, AvatarImage, AvatarWithVerification } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Chat, CheckCircle, EnvelopeSimple, GraduationCap, Money, User, UsersThree, FileText, QrCode } from "phosphor-react";
import { MessageSquare as LucideMessageSquare } from "lucide-react";
import { CartItem } from "@/features/cart/store/cart-slice";
import { CourseMiniCard } from "@/features/cart/components/course-mini-card";
import { CartNavItem } from "@/features/cart/components/cart-nav-items"; // Uncomment if needed
import { selectChatUnreadCount } from "@/features/chat/store/chatSlice";
// import { ThemeToggle } from "@/providers/theme-provider";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { RootState } from "@/store";
import { BarcodeDialog } from "@/components/tools/BarcodeDialog";
import { useFilteredSecondaryNavItems } from "@/hooks/useFilteredSecondaryNavItems";
import { useFilteredPrimaryNavItems } from "@/hooks/useFilteredPrimaryNavItems";
import { useEnrolledCourses } from "@/hooks/use-enrolled-courses";
import { isStudent } from "@/types/user.types";
import { getProxiedImageUrl } from "@/utils/imageProxy";

// --- Define Nav Item Type ---
export interface NavItem {
    title: string;
    href: string;
    icon: React.ElementType;
    roles: Array<"super_admin" | "admin" | "accounting" | "customer_care" | "teacher" | "student">;
    badgeCount?: number;
}

// --- Define Navigation Items based on 1Tech Academy Docs ---
// Primary Student/Teacher Items
export const primaryNavItems: NavItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["super_admin", "admin", "teacher", "student",] },
    { title: "Dashboard", href: "/accounting/dashboard", icon: LayoutDashboard, roles: ['accounting'] },
    { title: "Dashboard", href: "/customer-care/dashboard", icon: LayoutDashboard, roles: ['customer_care'] },
    { title: "Courses", href: "/courses", icon: GraduationCap, roles: ["student", "teacher", "super_admin", "admin"] },
    { title: "Attendance", href: "/attendance", icon: CheckCircle, roles: ["student", "teacher", "super_admin", "admin", "customer_care"] },
    {
        title: "Scan Student",
        href: "/attendance/scan",
        icon: QrCode,
        roles: ["customer_care"],
    },
    { title: "Timetable", href: "/timetable", icon: Calendar, roles: ["student", "teacher", "super_admin", "admin", "customer_care"] },
    { title: "Analytics", href: "/analytics", icon: BarChart3, roles: ["student", "teacher"] }, // Removed admin per CEO requirements
    { title: "Discussions", href: "/chat", icon: UsersThree, roles: ["student", "teacher", "super_admin", "admin", "customer_care"] }, // Dynamic badge count will be added later
];

// Admin Specific Items
export const adminNavItems: NavItem[] = [
    { title: "Students", href: "/users", icon: AdminUsersIcon, roles: ["super_admin", "admin"] },
    { title: "Payments", href: "/payments", icon: Money, roles: ["super_admin", "admin",] },
    { title: "Analytics", href: "/admin/analytics", icon: BarChart3, roles: ["super_admin"] }, // Only super admin
    { title: "Tickets", href: "/support/tickets", icon: LifeBuoy, roles: ["super_admin", "admin"] },
    {
        title: "Feedbacks",
        href: "/support/feedback",
        icon: Chat,
        roles: ["super_admin", "admin"],
    }
];

// Accounting Specific Items
export const accountingNavItems: NavItem[] = [
    { title: "Payment History", href: "/payments", icon: Money, roles: ["accounting"] },
    { title: "Analytics", href: "/accounting/analytics", icon: BarChart3, roles: ["accounting"] }, // Only super admin
    // { title: "Reconciliation", href: "/accounting/reconciliation", icon: CheckCircle, roles: ["accounting"] },
];

// Customer Care Specific Items
export const customerCareNavItems: NavItem[] = [
    { title: "Student Info", href: "/customer-care/students", icon: AdminUsersIcon, roles: ["customer_care"] },
    { title: "Tickets", href: "/support/tickets", icon: LifeBuoy, roles: ["customer_care"] },
    { title: "Feedback", href: "/support/feedback", icon: LucideMessageSquare, roles: ["customer_care"] },
];


// --- AppSidebar Component ---
// Add collapsible prop type if needed, based on your Sidebar component's definition
export function AppSidebar({ collapsible }: { collapsible?: "icon" | "offcanvas" | "none" }) {
    const pathname = usePathname();
    const router = useRouter()
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const cart = useAppSelector((state) => state.cart);
    const unreadChatCount = useAppSelector(selectChatUnreadCount);
    const hasItems = cart.items.length > 0;
    const dispatch = useAppDispatch();
    const { enrolledCourses, hasEnrolledCourses } = useEnrolledCourses();

    const { state: sidebarState } = useSidebar();
    const isSidebarOpen = sidebarState === 'expanded'; // Derived state, true if expanded

    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    // Ensure theme defaults correctly before mount or if system theme is used
    const currentTheme = mounted ? (theme === 'system' ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' : theme) : 'light';

    const filterItems = (items: NavItem[]) => items.filter(item => user && item.roles.includes(user.role as any));

    const handleLogout = () => dispatch(logout());

    function removeDuplicateNavItems(primary: NavItem[], secondary: NavItem[]) {
        const primaryHrefs = new Set(primary.map(item => item.href));
        return secondary.filter(item => !primaryHrefs.has(item.href));
    }

    // Get primary navigation items and add dynamic badge counts
    const basePrimaryItems = useFilteredPrimaryNavItems();
    const visiblePrimaryItems = basePrimaryItems.map(item => {
        // Add unread chat count to Discussions tab
        if (item.href === "/chat") {
            return {
                ...item,
                badgeCount: unreadChatCount > 0 ? unreadChatCount : undefined
            };
        }
        return item;
    });

    // Filter admin items and remove duplicates
    const visibleAdminItems = removeDuplicateNavItems(
        visiblePrimaryItems.filter(item => item.roles.includes('admin') || item.roles.includes('super_admin')), // Filter primary for admin/super_admin first
        filterItems(adminNavItems)
    );

    // Filter accounting items
    const visibleAccountingItems = filterItems(accountingNavItems);

    // Filter customer care items
    const visibleCustomerCareItems = filterItems(customerCareNavItems);

    const secondaryNavItems = useFilteredSecondaryNavItems(user);
    const visibleSecondaryItems = filterItems(secondaryNavItems);


    const handlecartClick = () => {
        router.push("/cart");
    }


    return (
        // Pass the collapsible prop down to the actual Sidebar component
        <Sidebar
            collapsible={collapsible} // Pass prop here
            className={cn(
                "border-r border-border/30 bg-background/80 dark:bg-background/80 backdrop-blur-xl shadow-md",
                'transition-all duration-500 ease-[cubic-bezier(0.25, 1, 0.5, 1)] h-full',
            )}
        >
            {/* Header */}
            <SidebarHeader className="mb-0 px-2 py-4 flex justify-center h-16"> {/* Center content */}
                {/* Expanded Logo */}
                <Link href="/dashboard" className={cn(
                    "flex items-center justify-start gap-2 font-semibold",
                    !isSidebarOpen && "hidden" // Hide when collapsed
                )}>
                    <span suppressHydrationWarning className="h-6 w-auto">
                        {mounted ? (
                            <Image src={currentTheme === "dark" ? "/logo_md.jpg" : "/logo.png"} alt="1Tech Logo" width={150} height={50} className="h-6 w-auto" />
                        ) : (
                            <div className="h-6 w-[80px] bg-muted rounded animate-pulse"></div>
                        )}
                    </span>
                </Link>

                {/* Collapsed Logo (Icon) */}
                <Link href="/dashboard" className={cn(
                    "flex items-center justify-center", // Center the icon
                    isSidebarOpen && "hidden" // Hide when expanded
                )}>
                    <span suppressHydrationWarning className="h-6 w-6"> {/* Use icon size */}
                        {/* Always use icon.png when collapsed, regardless of theme */}
                        <Image src="/icon.png" alt="1Tech Icon" width={24} height={24} className="h-6 w-6" />
                        {/* Optional: Add pulse if icon loading is slow, though usually not needed */}
                        {!mounted && <div className="h-6 w-6 bg-muted rounded animate-pulse"></div>}
                    </span>
                </Link>
            </SidebarHeader>

            {/* Main Content Area */}
            <SidebarContent className="flex justify-between flex-col h-full">
                {/* Wrap content in TooltipProvider if tooltips are used */}
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

                {/* Accounting Navigation */}
                {visibleAccountingItems.length > 0 && (
                    <SidebarGroup>
                        {isSidebarOpen && <SidebarGroupLabel>Accounting</SidebarGroupLabel>}
                        <SidebarGroupContent>
                            <NavMenuList items={visibleAccountingItems} isSidebarOpen={isSidebarOpen} pathname={pathname} />
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {/* Customer Care Navigation */}
                {visibleCustomerCareItems.length > 0 && (
                    <SidebarGroup>
                        {isSidebarOpen && <SidebarGroupLabel>Customer Care</SidebarGroupLabel>}
                        <SidebarGroupContent>
                            <NavMenuList items={visibleCustomerCareItems} isSidebarOpen={isSidebarOpen} pathname={pathname} />
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

                {!isSidebarOpen && hasItems && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {/* Render CartNavItem directly, likely needs some layout adjustment */}
                            {/* Wrap in a div to control centering/padding if needed */}
                            <div className="flex items-center justify-center h-10 w-10 rounded-lg pl-1">
                                <CartNavItem icon={true} />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">Cart ({cart.items.length})</TooltipContent>
                    </Tooltip>
                )}

                {/* Cart Mini Card - Only show if expanded? Or adjust styling for collapsed? */}
                {cart.items.length > 0 && (
                    <SidebarGroup className={cn(!isSidebarOpen && "hidden")}> {/* Hide cart section when collapsed */}
                        {isSidebarOpen && <SidebarGroupLabel>Selected Courses</SidebarGroupLabel>}
                        <SidebarGroupContent className="flex flex-col gap-2">
                            {cart.items.map((item: CartItem) => (
                                <CourseMiniCard key={item.courseId} item={item} className="hover:bg-muted rounded-md" onClick={handlecartClick} />
                            ))}
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            {/* Footer Area */}
            <SidebarFooter className={cn(
                "mt-auto p-2 border-t border-border/30", // Add top border
                !isSidebarOpen && "items-center justify-center" // Center footer items when collapsed
            )}>
                {/* User Profile Link/Avatar */}
                {user && (
                    // Only show Tooltip when collapsed
                    <TooltipProvider delayDuration={0}>
                        <NavMenuUserItem user={user} isSidebarOpen={isSidebarOpen} />
                    </TooltipProvider>
                )}

                {/* Theme Toggle and Logout */}
                <div className={cn(
                    "flex mt-2 gap-2 w-full",
                    isSidebarOpen ? "flex-row items-center justify-between" : "flex-col items-center" // Adjust layout based on state
                )}>
                    {/* {mounted && isSidebarOpen && <ThemeToggle />} */}
                    {/* Barcode Section */}
                    {isAuthenticated && isStudent(user) && (
                        <BarcodeDialog barcodeId={user.barcodeId} userId={user.id} lineColor="#C99700" />
                    )}

                    <DyraneButton
                        onClick={handleLogout}
                        variant={'destructive'}
                        size={isSidebarOpen ? "sm" : "icon"} // Icon button when collapsed
                        className={cn(
                            "text-destructive bg-destructive/5 hover:bg-destructive/10 hover:text-destructive",
                            isSidebarOpen ? "w-full justify-start gap-2 px-2" : "h-8 w-8" // Adjust padding/size
                        )}
                        aria-label="Logout"
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        {isSidebarOpen && <span>Logout</span>}
                    </DyraneButton>
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
                const isActive = item.href === '/dashboard'
                    ? pathname === item.href
                    : pathname.startsWith(item.href) && item.href !== '/dashboard';

                const Icon = item.icon;

                return (
                    <SidebarMenuItem key={item.href} className="relative">
                        <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={item.title}
                            aria-label={item.title}
                        >
                            <Link
                                href={item.href}
                                className="flex items-center gap-2"
                            >
                                <div className="relative">
                                    <Icon className="size-4 shrink-0" weight={isActive ? "fill" : "regular"} />
                                    
                                    {/* Show small badge on icon when collapsed */}
                                    {!isSidebarOpen && item.badgeCount && item.badgeCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-medium rounded-full h-4 w-4 flex items-center justify-center leading-none">
                                            {item.badgeCount > 9 ? "9+" : item.badgeCount}
                                        </span>
                                    )}
                                </div>

                                <span>{item.title}</span>

                                {/* Show badge on the right side when expanded */}
                                {isSidebarOpen && item.badgeCount && item.badgeCount > 0 && (
                                    <Badge 
                                        variant={item.title === "Courses" ? "success" : "default"} 
                                        className="ml-auto h-5 px-1.5 text-[10px] leading-none"
                                    >
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

// export function NavMenuList({ items, isSidebarOpen, pathname }: NavMenuListProps) {
//     return (
//         <SidebarMenu>
//             {items.map((item) => {
//                 const isActive = item.href === '/dashboard'
//                     ? pathname === item.href
//                     : pathname.startsWith(item.href) && item.href !== '/dashboard'; // More specific active check

//                 const Icon = item.icon;
//                 return (
//                     <SidebarMenuItem key={item.href}>
//                         <SidebarMenuButton
//                             asChild
//                             isActive={isActive}
//                             // Tooltip only needed when collapsed, handled by SidebarMenuButton internally
//                             tooltip={item.title}
//                             aria-label={item.title}
//                         >
//                             <Link
//                                 href={item.href}
//                                 className="flex items-center gap-2" // Removed overflow-hidden, let button handle it
//                             >
//                                 <Icon className="size-4 shrink-0" weight={isActive ? "fill" : "regular"} /> {/* Standardized icon size */}
//                                 {/* Text is hidden via CSS in SidebarMenuButton when collapsed */}
//                                 <span>
//                                     {item.title}
//                                 </span>
//                                 {/* Badge Logic - Conditionally render based on isSidebarOpen */}
//                                 {item.badgeCount && item.badgeCount > 0 && isSidebarOpen && (
//                                     <Badge 
//                                         variant={item.title === "Courses" ? "success" : "default"} 
//                                         className="ml-auto h-5 px-1.5 text-[10px] leading-none"
//                                     >
//                                         {item.badgeCount > 9 ? "9+" : item.badgeCount}
//                                     </Badge>
//                                 )}
//                             </Link>
//                         </SidebarMenuButton>
//                     </SidebarMenuItem>
//                 );
//             })}
//         </SidebarMenu>
//     );
// }

// --- Reusable User Item for Footer --- (Optional but good practice)
interface NavMenuUserItemProps {
    user: NonNullable<RootState['auth']['user']>;
    isSidebarOpen: boolean;
}

function NavMenuUserItem({ user, isSidebarOpen }: NavMenuUserItemProps) {
    const triggerContent = (
        <Link href="/profile" className={cn(
            "flex items-center gap-3 rounded-md p-2 bg-accent/50 hover:bg-accent transition-colors ease-[cubic-bezier(0.77, 0, 0.175, 1)] duration-300 w-full overflow-hidden",
            !isSidebarOpen && "justify-center w-auto px-1 py-1 h-8" // Adjust for collapsed state
        )}>
            <AvatarWithVerification
                user={user}
                className={cn("size-9", !isSidebarOpen && "size-6")}
                verificationSize={isSidebarOpen ? "xs" : "xs"}
            >
                <AvatarImage src={getProxiedImageUrl(user.avatarUrl as string) || undefined} alt={user.name} />
                <AvatarFallback className="text-xs text-primary font-medium">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
            </AvatarWithVerification>
            {isSidebarOpen && (
                <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate text-foreground">{user.name}</p>
                    <p className="text-[14px] text-muted-foreground truncate">{user.email}</p>
                </div>
            )}
        </Link>
    );

    if (isSidebarOpen) {
        return triggerContent; // No tooltip needed when expanded
    }

    // Tooltip only when collapsed
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                {triggerContent}
            </TooltipTrigger>
            <TooltipContent side="right" align="center" className="text-xs">
                {user.name} ({user.role})
            </TooltipContent>
        </Tooltip>
    );
}