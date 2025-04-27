// components/layout/auth/header.tsx

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { useRouter } from "next/navigation"
import { LogOut, User, Bell, Menu } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
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

export function Header() {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth)
    const dispatch = useAppDispatch()
    const router = useRouter()
    const isMobile = useMobile()
    const [isScrolled, setIsScrolled] = useState(false)
    const [notificationCount, setNotificationCount] = useState(3)
    const [notificationsOpen, setNotificationsOpen] = useState(false)

    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Get cart items from Redux store
    const cart = useAppSelector((state) => state.cart)
    useEffect(() => setMounted(true), []);

    // Determine the current theme, defaulting to light if not mounted or system theme is unclear
    const currentTheme = mounted ? (theme === "system" ? systemTheme : theme) : undefined

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleLogout = async () => {
        dispatch(logout())
        router.push("/login")
    }

    // Mock notifications data
    const notifications = [
        {
            id: 1,
            title: "New course available",
            message: "Introduction to Machine Learning is now available",
            time: "5 minutes ago",
            read: false,
        },
        {
            id: 2,
            title: "Assignment reminder",
            message: "Your Python assignment is due tomorrow",
            time: "2 hours ago",
            read: false,
        },
        {
            id: 3,
            title: "Grade updated",
            message: "Your Web Development quiz has been graded",
            time: "1 day ago",
            read: false,
        },
    ]

    // DyraneUI Style Variables (Adjust these to match your tokens/theme)
    const scrolledHeaderBg = "bg-background/65"; // Example: Less opaque background
    const scrolledHeaderBlur = "backdrop-blur-md"; // Standard blur
    const scrolledHeaderBorder = "border-b border-border/30"; // Subtle border
    const linkHoverColor = "hover:text-primary"; // Primary hover color
    const mutedTextColor = "text-muted-foreground"; // Muted text color
    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full transition-colors duration-300 ease-[cubic-bezier(0.77, 0, 0.175, 1)]", // Use transition-colors, adjusted z-index
                isScrolled
                    ? cn("shadow-sm", scrolledHeaderBorder, scrolledHeaderBg, scrolledHeaderBlur) // Combined scrolled styles
                    : "border-b border-transparent" // Transparent border when at top
            )}
        >
            <div className="flex h-16 items-center justify-between gap-x-4 px-4 sm:px-6 lg:px-8 w-full"> {/* Added gap, adjusted padding */}
                {/* Left section */}
                <div className="flex items-center gap-4">
                    {!isMobile && <SidebarTrigger />}
                    {isMobile ? (
                        <Sheet>
                            <SheetTrigger asChild>
                                <Avatar>
                                    <AvatarImage
                                        src={user?.name?.charAt(0) || "U"}
                                        alt="User Avatar"
                                        className="h-7 w-7 rounded-full"
                                    />
                                    <AvatarFallback className="h-7 w-7 rounded-full bg-muted text-primary hover:bg-primary/20 cursor-pointer hover:border hover:border-primary" >
                                        {user?.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[320px] sm:w-[400px] rounded-r-3xl border-0 bg-background/65 backdrop-blur-md">
                                <SheetHeader className="">
                                    <SheetTitle>
                                        {/* Logo */}
                                        <Link href="/dashboard" className="flex items-center space-x-2 flex-shrink-0"> {/* flex-shrink-0 prevents shrinking */}
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
                                <div className="mt-8 flex flex-col space-y-2 px-2">
                                    {isAuthenticated && user && (
                                        <div className="mb-6 flex items-center space-x-4 rounded-lg bg-muted p-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    )}
                                    <Link href="/dashboard" className="flex items-center space-x-2 rounded-lg px-3 py-2 hover:bg-muted">
                                        <span>Dashboard</span>
                                    </Link>
                                    <Link href="/courses" className="flex items-center space-x-2 rounded-lg px-3 py-2 hover:bg-muted">
                                        <span>Courses</span>
                                    </Link>
                                    {user?.role === "admin" && (
                                        <Link href="/users" className="flex items-center space-x-2 rounded-lg px-3 py-2 hover:bg-muted">
                                            <span>Users</span>
                                        </Link>
                                    )}
                                    <Link href="/profile" className="flex items-center space-x-2 rounded-lg px-3 py-2 hover:bg-muted">
                                        <span>Profile</span>
                                    </Link>
                                    <Link href="/settings" className="flex items-center space-x-2 rounded-lg px-3 py-2 hover:bg-muted">
                                        <span>Settings</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 rounded-lg px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    ) : (null
                    )}
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
                    <ThemeToggle />

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
                            <SheetContent side="right" className="w-[320px] sm:w-[400px] rounded-l-3xl border-0 bg-background/65 backdrop-blur-md">
                                <SheetHeader className="px-4">
                                    <SheetTitle>Notifications</SheetTitle>
                                </SheetHeader>
                                <div className="mt-6 flex flex-col space-y-4 px-4">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={cn("rounded-lg border p-3", notification.read ? "bg-background/50" : "bg-muted/50")}
                                        >
                                            <div className="flex justify-between">
                                                <h4 className="font-medium">{notification.title}</h4>
                                                {!notification.read && <Badge variant="default" className="h-1.5 w-1.5 rounded-full p-0" />}
                                            </div>
                                            <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                                            <p className="mt-2 text-xs text-muted-foreground">{notification.time}</p>
                                        </div>
                                    ))}
                                    {notifications.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <Bell className="mb-2 h-10 w-10 text-muted-foreground/50" />
                                            <p className="text-muted-foreground">No notifications yet</p>
                                        </div>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    )}
                </div>
            </div>
        </header>
    )
}
