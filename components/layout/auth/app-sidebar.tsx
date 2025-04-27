// components/layout/auth/app-sidebar.tsx

"use client"

import type * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { Home, BookOpen, Users, Settings, BarChart, Search, LogOut } from "lucide-react"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useRouter } from "next/navigation"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { logout } from "@/features/auth/store/auth-slice"
import { useTheme } from "next-themes"
import Image from "next/image"

interface NavItem {
    title: string
    href: string
    icon: React.ReactNode
    roles: Array<"admin" | "teacher" | "student">
}

const navItems: NavItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: <Home className="h-5 w-5" />,
        roles: ["admin", "teacher", "student"],
    },
    {
        title: "Courses",
        href: "/courses",
        icon: <BookOpen className="h-5 w-5" />,
        roles: ["admin", "teacher", "student"],
    },
    {
        title: "Users",
        href: "/users",
        icon: <Users className="h-5 w-5" />,
        roles: ["admin"],
    },
    {
        title: "Analytics",
        href: "/analytics",
        icon: <BarChart className="h-5 w-5" />,
        roles: ["admin", "teacher"],
    },
    {
        title: "Settings",
        href: "/settings",
        icon: <Settings className="h-5 w-5" />,
        roles: ["admin", "teacher", "student"],
    },
]

export function AppSidebar() {
    const pathname = usePathname()
    const { user } = useAppSelector((state) => state.auth)
    const dispatch = useAppDispatch()
    const isMobile = useMobile()
    const [isHovering, setIsHovering] = useState(false)

    // Filter nav items based on user role
    const filteredNavItems = navItems.filter((item) => user && item.roles.includes(user.role))

    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Get cart items from Redux store
    const cart = useAppSelector((state) => state.cart)
    useEffect(() => setMounted(true), []);

    // Determine the current theme, defaulting to light if not mounted or system theme is unclear
    const currentTheme = mounted ? (theme === "system" ? systemTheme : theme) : undefined

    const handleLogout = async () => {
        dispatch(logout())
    }

    // Edge hover detection
    useEffect(() => {
        if (isMobile) return

        const handleMouseMove = (e: MouseEvent) => {
            if (e.clientX < 10) {
                setIsHovering(true)
            } else if (e.clientX > 280) {
                setIsHovering(false)
            }
        }

        document.addEventListener("mousemove", handleMouseMove)
        return () => {
            document.removeEventListener("mousemove", handleMouseMove)
        }
    }, [isMobile])

    return (
        <Sidebar
            className={cn(
                "transition-all duration-300 h-screen bg-transparent backdrop-blur-sm border-r border-border shadow-lg",
                isHovering && !isMobile ? "opacity-100" : "md:opacity-90 hover:opacity-100",
            )}
        >
            <SidebarHeader className="p-4">
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
            </SidebarHeader>
            <SidebarContent className="bg-background/15 backdrop-blur-sm border-b border-border">
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {filteredNavItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                                        <Link href={item.href}>
                                            {item.icon}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
