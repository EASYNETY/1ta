// components/layout/auth/header.tsx

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { useRouter } from "next/navigation"
import { LogOut, User, Bell, Menu } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useMobile } from "@/hooks/use-mobile"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/providers/theme-provider"
import { logout } from "@/features/auth/store/auth-slice"

export function Header() {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth)
    const dispatch = useAppDispatch()
    const router = useRouter()
    const isMobile = useMobile()
    const [isScrolled, setIsScrolled] = useState(false)
    const [notificationCount, setNotificationCount] = useState(3)
    const [notificationsOpen, setNotificationsOpen] = useState(false)

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

    return (
        <header
            className={cn(
                "sticky top-0 z-40 w-full transition-all duration-300",
                isScrolled
                    ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
                    : "bg-transparent",
            )}
        >
            <div className="container flex h-16 items-center justify-between">
                {/* Left section */}
                <div className="flex items-center gap-4">
                    {!isMobile && <SidebarTrigger />}
                    {isMobile ? (
                        <Sheet>
                            <SheetTrigger asChild>
                                <button className="rounded-full p-2 hover:bg-muted">
                                    <Menu className="h-5 w-5" />
                                </button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                                <SheetHeader>
                                    <SheetTitle>
                                        <Link href="/" className="flex items-center space-x-2">
                                            <span className="text-xl font-bold">SmartEdu</span>
                                        </Link>
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="mt-8 flex flex-col space-y-2">
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
                    ) : (
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="text-xl font-bold">SmartEdu</span>
                        </Link>
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
                            <Link href="/" className="flex items-center space-x-2">
                                <span className="text-xl font-bold">SmartEdu</span>
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
                                <button className="relative rounded-full p-2 hover:bg-muted">
                                    <Bell className="h-5 w-5" />
                                    {notificationCount > 0 && (
                                        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                                            {notificationCount}
                                        </span>
                                    )}
                                </button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                <SheetHeader>
                                    <SheetTitle>Notifications</SheetTitle>
                                </SheetHeader>
                                <div className="mt-6 flex flex-col space-y-4">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={cn("rounded-lg border p-3", notification.read ? "bg-background" : "bg-muted/50")}
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

                    {isAuthenticated && user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center space-x-1 rounded-full bg-primary/10 p-2 text-sm font-medium hover:bg-primary/20">
                                    <User className="h-5 w-5" />
                                    {!isMobile && <span>{user.name}</span>}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile">Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings">Settings</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <DyraneButton asChild>
                            <Link href="/login">Login</Link>
                        </DyraneButton>
                    )}
                </div>
            </div>
        </header>
    )
}
