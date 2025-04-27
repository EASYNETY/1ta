// src/components/landing/navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { DyraneButton } from "../dyrane-ui/dyrane-button"; // Assuming DyraneButton is set up
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
} from "@/components/ui/navigation-menu"; // Assuming Shadcn component
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose,
    SheetHeader, // Import SheetHeader
    SheetTitle,  // Import SheetTitle
} from "@/components/ui/sheet"; // Import Sheet components
import { AlignRight, Menu } from "lucide-react"; // Import Menu icon
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils"; // Import cn utility
import { useScrollPosition } from "@/hooks/use-scroll-position"; // Import the custom hook
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ThemeToggle } from "../../providers/theme-provider";
import { CartNavItem } from "@/features/cart/components/cart-nav-items"
import { CourseMiniCard } from "@/features/cart/components/course-mini-card"
import { useAppSelector } from "@/store/hooks"
import { useRouter } from "next/navigation"

// --- Constants for Navigation Links ---
const navLinks = [
    { href: "#philosophy", label: "Mission" },
    // { href: "#features", label: "Features" },
    { href: "#why-us", label: "Why Us" },
    { href: "#courses", label: "Courses" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#contact-us", label: "Contact Us" },
];

// --- Main NavBar Component ---
export default function NavBar() {
    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const isScrolled = useScrollPosition(10);

    // Get cart items from Redux store
    const cart = useAppSelector((state) => state.cart)
    const hasItems = cart.items.length > 0

    useEffect(() => setMounted(true), []);

    // Determine the current theme, defaulting to light if not mounted or system theme is unclear
    const currentTheme = mounted ? (theme === "system" ? systemTheme : theme) : undefined

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

                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2 flex-shrink-0 mr-4 lg:mr-0"> {/* flex-shrink-0 prevents shrinking */}
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

                {/* Desktop Navigation Menu - Centered */}
                <div className="hidden lg:flex flex-1 items-center justify-center"> {/* Centering container */}
                    <NavigationMenu>
                        <NavigationMenuList className="space-x-6">
                            {navLinks.map((link) => (
                                <NavigationMenuItem key={link.href}>
                                    {/* Using Next Link directly within NavigationMenuLink requires care */}
                                    {/* Often simpler to style the Link directly if NavigationMenuLink styling conflicts */}
                                    <Link
                                        href={link.href}
                                        className={cn(
                                            "text-sm font-medium transition-colors",
                                            mutedTextColor,
                                            linkHoverColor
                                        )}
                                        passHref // Important if wrapping Next Link
                                    >
                                        {link.label}
                                    </Link>
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>

                        {/* Cart Nav Item */}
                        {cart.items.length > 0 && (
                            <NavigationMenuItem className="ml-4 h-full flex items-center justify-center"> {/* Added margin for spacing */}
                                <CartNavItem />
                            </NavigationMenuItem>)}
                    </NavigationMenu>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center space-x-2 sm:space-x-3"> {/* Reduced spacing slightly */}
                    {/* Theme Toggle */}
                    {mounted && (
                        <ThemeToggle />
                    )}

                    {/* Desktop Auth links */}
                    <div className="hidden lg:flex items-center space-x-3"> {/* Reduced spacing */}
                        <Link
                            href="/login"
                            className={cn(
                                "text-sm font-medium transition-colors",
                                mutedTextColor,
                                linkHoverColor
                            )}
                        >
                            Log in
                        </Link>
                        <DyraneButton asChild size="sm">
                            <Link href="/signup">Enroll Now</Link>
                        </DyraneButton>
                    </div>

                    {/* Mobile Menu Trigger */}
                    <Sheet>
                        <div className="relative lg:hidden"> {/* Only show on mobile */}
                            <SheetTrigger asChild>
                                <DyraneButton variant="ghost" size="icon" className="lg:hidden group" aria-label="Open navigation menu">
                                    <AlignRight className="h-5 w-5 flex group-hover:hidden" />
                                    <Menu className="h-5 w-5 hidden group-hover:flex" />
                                </DyraneButton>

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

                        <SheetContent
                            side="left"
                            className="w-[320px] sm:w-[350px] px-0 flex flex-col rounded-r-3xl border-0 bg-background/65 backdrop-blur-md" // Remove default padding, add top padding, make flex col
                            aria-describedby={undefined} // Remove default description link if no SheetDescription used
                        >
                            {/* Accessible Title (Visually Hidden) */}
                            <SheetHeader className="px-4"> {/* Add padding to header */}
                                <SheetTitle>
                                    {/* Wrap title in VisuallyHidden for screen readers only */}
                                    <VisuallyHidden>Navigation Menu</VisuallyHidden>
                                    {/* Logo */}
                                    <Link href="/" className=""> {/* flex-shrink-0 prevents shrinking */}
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
                                        {(!mounted || !currentTheme) && <div className="h-6 w-[80px] bg-muted rounded animate-pulse"></div>} {/* Adjusted skeleton */}
                                    </Link>
                                </SheetTitle>
                                {/* Optionally add SheetDescription here if needed */}

                            </SheetHeader>

                            {/* Mobile Navigation */}
                            <nav className="flex-1 flex flex-col space-y-4 p-4 overflow-y-auto"> {/* Use flex-1 to fill space, add padding */}
                                {navLinks.map((link) => (
                                    <SheetClose asChild key={link.href}>
                                        <Link
                                            href={link.href}
                                            className={cn(
                                                "text-sm transition-colors text-foreground", // Use standard text color
                                                linkHoverColor
                                            )}
                                        >
                                            {link.label}
                                        </Link>
                                    </SheetClose>
                                ))}
                            </nav>

                            {/* Mobile Cart Courses */}
                            {cart.items.length > 0 && (
                                <div className="px-6 py-4 border-t border-border/30">
                                    <h3 className="text-sm font-medium mb-3">Selected Courses</h3>
                                    <div className="flex flex-col space-y-2">
                                        {cart.items.map((item) => (
                                            <CourseMiniCard
                                                key={item.courseId}
                                                item={item}
                                                className="hover:bg-muted rounded-md"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Separator and Auth actions at the bottom */}
                            <div className="mt-auto px-6 py-4 border-t border-border/30"> {/* Bottom padding and border */}
                                <div className="flex flex-row space-x-4 w-full items-center justify-between">
                                    {/* Theme Toggle */}
                                    {mounted && (
                                        <ThemeToggle />
                                    )}
                                    <div className="flex flex-row space-x-4 w-full items-center justify-end">

                                        <SheetClose asChild>
                                            <DyraneButton variant='ghost' asChild size="sm" className="w-full">
                                                <Link
                                                    href="/login"
                                                    className={cn(
                                                        "text-base font-medium transition-colors text-foreground",
                                                        linkHoverColor
                                                    )}
                                                >
                                                    Log in
                                                </Link>
                                            </DyraneButton>

                                        </SheetClose>
                                        <SheetClose asChild>
                                            <DyraneButton asChild size="sm" className="w-full">
                                                <Link href="/signup">Enroll Now</Link>
                                            </DyraneButton>
                                        </SheetClose>
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}