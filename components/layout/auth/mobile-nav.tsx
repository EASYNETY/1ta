// components/layout/auth/mobile-nav.tsx

"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useAppSelector } from "@/store/hooks"
import { Home, BookOpen, User, Settings, BarChart } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

interface NavItem {
    title: string
    href: string
    icon: React.ReactNode
    roles: Array<"admin" | "teacher" | "student">
}

const navItems: NavItem[] = [
    {
        title: "Home",
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
        title: "Analytics",
        href: "/analytics",
        icon: <BarChart className="h-5 w-5" />,
        roles: ["admin", "teacher"],
    },
    {
        title: "Profile",
        href: "/profile",
        icon: <User className="h-5 w-5" />,
        roles: ["admin", "teacher", "student"],
    },
    {
        title: "Settings",
        href: "/settings",
        icon: <Settings className="h-5 w-5" />,
        roles: ["admin", "teacher", "student"],
    },
]

export function MobileNav() {
    const pathname = usePathname()
    const { user } = useAppSelector((state) => state.auth)
    const isMobile = useMobile()

    if (!isMobile || !user) return null

    // Filter nav items based on user role
    const filteredNavItems = navItems.filter((item) => item.roles.includes(user.role))

    return (
        <div className="fixed bottom-0 left-0 z-40 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-around">
                {filteredNavItems.slice(0, 5).map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-1 flex-col items-center justify-center py-2",
                                isActive ? "text-primary" : "text-muted-foreground",
                                'hover:text-primary transition-colors duration-200 ease-in-out'
                            )}
                        >
                            <div className="relative">
                                {item.icon}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute -bottom-2 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-primary"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </div>
                            {/* <span className="mt-1 text-[10px]">{item.title}</span> */}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
