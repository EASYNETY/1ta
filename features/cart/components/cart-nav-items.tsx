// features/cart/components/cart-nav-items.tsx

"use client"

import { useState, useRef, useEffect } from "react"
import { useAppSelector } from "@/store/hooks"
import { GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"
import { CartDropdown } from "./cart-dropdown"
import { useRouter } from "next/navigation"

export function CartNavItem() {
    const router = useRouter()
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
            <button
                className={cn(
                    "flex items-center justify-center h-9 w-9 rounded-md transition-all",
                    "hover:bg-muted/80",
                    hasItems && "ring-2 ring-primary/20 shadow-sm shadow-primary/20",
                    isDropdownOpen && "bg-muted"
                )}
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
                onClick={() => router.push("/cart")}
                aria-label={`Selected courses (${cart.items.length})`}
            >
                <GraduationCap className={cn("h-5 w-5", hasItems ? "text-primary" : "text-muted-foreground")} />

                {/* Badge */}
                {hasItems && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 text-[10px] font-medium bg-primary text-primary-foreground rounded-full">
                        {cart.items.length}
                    </span>
                )}
            </button>

            {/* Only show dropdown on desktop */}
            <div className="hidden lg:block">
                <CartDropdown isOpen={isDropdownOpen && hasItems} onClose={() => setIsDropdownOpen(false)} />
            </div>
        </div>
    )
}
