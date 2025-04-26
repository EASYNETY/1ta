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
                "transition-all duration-300",
                isHovering && !isMobile ? "opacity-100" : "md:opacity-90 hover:opacity-100",
            )}
        >
            <SidebarHeader>
                <form className="px-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <SidebarInput type="search" placeholder="Search..." className="pl-8" />
                    </div>
                </form>
            </SidebarHeader>
            <SidebarContent>
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
