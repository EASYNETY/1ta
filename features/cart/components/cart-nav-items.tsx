// features/cart/components/cart-nav-items.tsx

"use client"

import { useState, useRef, useEffect } from "react"
import { useAppSelector } from "@/store/hooks"
import { GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"
import { CartDropdown } from "./cart-dropdown"
import { useRouter } from "next/navigation"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"

export function CartNavItem() {
    const cart = useAppSelector((state) => state.cart)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const cartRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const hasItems = cart.items.length > 0

    return (
        <div className="relative" ref={cartRef}>
            <DyraneButton
                variant={"ghost"}
                size="sm"
                className={cn(
                    "flex items-center justify-center h-9 w-9 rounded-md transition-all",
                    "hover:bg-muted/80",
                    hasItems && "ring-2 ring-primary/20 shadow-sm shadow-primary/20",
                    isDropdownOpen && "bg-muted"
                )}
                onMouseEnter={() => setIsDropdownOpen(true)}
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-label={`Selected courses (${cart.items.length})`}
            >
                <GraduationCap className={cn("h-5 w-5", hasItems ? "text-primary" : "text-muted-foreground")} />
            </DyraneButton>
            {/* Badge */}
            {hasItems && (
                <div className="absolute -top-2 -right-2">
                    {/* Ping animation */}
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                    {/* Actual badge */}
                    <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-medium ring-2 ring-primary/30">
                        {cart.items.length}
                    </span>
                </div>
            )}

            {/* Only show dropdown on desktop */}
            <div className="hidden lg:block">
                <CartDropdown isOpen={isDropdownOpen && hasItems} onClose={() => setIsDropdownOpen(false)} setIsDropdownOpen={setIsDropdownOpen} />
            </div>
        </div>
    )
}
